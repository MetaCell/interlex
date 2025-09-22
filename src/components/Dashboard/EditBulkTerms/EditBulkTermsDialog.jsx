import { useState, useContext, useEffect } from "react";
import PropTypes from "prop-types";
import EditTerms from "./EditTerms";
import SearchTerms from "./SearchTerms";
import { ArrowBack } from "@mui/icons-material";
import StatusStep from "../../common/StatusStep";
import { Box, Button, Divider } from "@mui/material";
import MobileStepper from '@mui/material/MobileStepper';
import { getStatusProps } from "./editBulkTermStatusProps";
import CustomizedDialog from "../../common/CustomizedDialog";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SearchTermsData from "../../../static/SearchTermsData.json";
import { patchTerm } from "../../../api/endpoints";
import { GlobalDataContext } from "../../../contexts/DataContext";

const initialSearchConditions = { attribute: '', value: '', condition: 'where', relation: SearchTermsData.objectOptions[0].value }

const HeaderRightSideContent = ({ handleClose, activeStep, handleNext, handleBack, setActiveStep, isAllFieldsFilled, selectedOntology, isUpdating, ontologyTerms }) => {
  return (
    <Box display='flex' alignItems='center' gap='.75rem'>
      <MobileStepper
        variant="dots"
        steps={3}
        position="static"
        activeStep={activeStep}
        sx={{ maxWidth: 400, flexGrow: 1 }}
        backButton={false}
        nextButton={false}
      />
      <Divider orientation="vertical" flexItem />
      {
        activeStep === 2 ? <Button variant='contained' color='primary' onClick={() => {
          handleClose();
          setActiveStep(0);
        }}>
          Finish
        </Button> : <>
          {
            activeStep === 0 ? <Button variant='outlined' onClick={handleClose}>
              Cancel
            </Button> : <Button startIcon={<ArrowBack />} variant='outlined' onClick={handleBack}>
              Previous
            </Button>
          }
          <Button 
            endIcon={!isUpdating && <ArrowForwardIcon />} 
            variant='contained' 
            color='primary' 
            onClick={handleNext} 
            disabled={(activeStep === 0 && (!isAllFieldsFilled && !selectedOntology)) || (activeStep === 0 && selectedOntology && (!ontologyTerms || ontologyTerms.length === 0)) || isUpdating}
          >
            {isUpdating ? 'Saving Changes...' : 'Continue'}
          </Button>
        </>
      }
    </Box>
  );
};

HeaderRightSideContent.propTypes = {
  handleClose: PropTypes.func.isRequired,
  activeStep: PropTypes.number.isRequired,
  handleNext: PropTypes.func.isRequired,
  handleBack: PropTypes.func.isRequired,
  setActiveStep: PropTypes.func.isRequired,
  isAllFieldsFilled: PropTypes.bool.isRequired,
  selectedOntology: PropTypes.object,
  isUpdating: PropTypes.bool.isRequired,
  ontologyTerms: PropTypes.array,
};

const EditBulkTermsDialog = ({ open, handleClose, activeStep, setActiveStep }) => {
  const { activeOntology } = useContext(GlobalDataContext);
  const [searchConditions, setSearchConditions] = useState([initialSearchConditions]);
  const [ontologyTerms, setOntologyTerms] = useState([]);
  const [ontologyAttributes, setOntologyAttributes] = useState([]);
  const [selectedOntology, setSelectedOntology] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [originalTerms, setOriginalTerms] = useState([]);
  const [batchUpdateResults, setBatchUpdateResults] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Prefill selectedOntology with activeOntology when dialog opens
  useEffect(() => {
    if (open && activeOntology && !selectedOntology) {
      setSelectedOntology(activeOntology);
    }
  }, [open, activeOntology, selectedOntology]);

  const performBatchUpdate = async (termsToUpdate = null) => {
    setIsUpdating(true);
    
    // Use provided terms or all ontology terms
    const terms = termsToUpdate || ontologyTerms;
    
    const results = {
      successful: [],
      failed: [],
      total: terms.length
    };

    try {
      // Store original terms before starting updates (only if not retrying)
      if (!termsToUpdate) {
        setOriginalTerms([...ontologyTerms]);
      }

      // Process each term
      for (const term of terms) {
        try {
          // Extract the group and term ID from the term
          let termId = term.id || term['@id'];
          
          // If termId is in full URI format, extract just the ID part
          if (termId && termId.includes('/')) {
            termId = termId.split('/').pop();
          }
          
          const group = 'base'; // Default group, can be made configurable
          
          // Create the JSON-LD payload with the current term data
          const jsonLdPayload = {
            "@context": term["@context"] || {
              "@vocab": "http://uri.interlex.org/base/",
              "owl": "http://www.w3.org/2002/07/owl#",
              "rdfs": "http://www.w3.org/2000/01/rdf-schema#"
            },
            "@id": term['@id'] || termId,
            ...term
          };

          // Send PATCH request
          const response = await patchTerm(group, termId, jsonLdPayload);
          
          if (response.status === 200 || response.status === 201) {
            results.successful.push({
              termId,
              term: response.term,
              status: response.status
            });
          } else {
            results.failed.push({
              termId,
              error: `HTTP ${response.status}`,
              term
            });
          }
        } catch (error) {
          console.error(`Failed to update term ${term.id}:`, error);
          results.failed.push({
            termId: term.id,
            error: error.message || 'Unknown error',
            term
          });
        }
      }

      // If retrying, merge with existing results
      if (termsToUpdate && batchUpdateResults) {
        setBatchUpdateResults({
          successful: [...batchUpdateResults.successful, ...results.successful],
          failed: results.failed, // Replace failed list with new attempt results
          total: batchUpdateResults.total
        });
      } else {
        setBatchUpdateResults(results);
      }
    } catch (error) {
      console.error('Batch update failed:', error);
      const failureResults = {
        successful: termsToUpdate && batchUpdateResults ? batchUpdateResults.successful : [],
        failed: terms.map(term => ({
          termId: term.id,
          error: error.message || 'Batch operation failed',
          term
        })),
        total: termsToUpdate && batchUpdateResults ? batchUpdateResults.total : terms.length
      };
      setBatchUpdateResults(failureResults);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTryAgain = async () => {
    if (batchUpdateResults && batchUpdateResults.failed.length > 0) {
      // Extract failed terms for retry
      const failedTerms = batchUpdateResults.failed.map(failedItem => failedItem.term);
      await performBatchUpdate(failedTerms);
    }
  };

  const handleNext = async () => {
    // If we're moving from step 1 (EditTerms) to step 2 (Status), perform batch update
    if (activeStep === 1) {
      await performBatchUpdate();
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const isAllFieldsFilled = (data) => {
    for (const item of data) {
      if (!item.attribute || !item.value || !item.condition || !item.relation) {
        return false;
      }
    }
    return true;
  };

  // put success by default, should be changed later


  return (
    <CustomizedDialog
      title='Edit bulk terms - Conditional search for term selection'
      open={open}
      handleClose={handleClose}
      HeaderRightSideContent={
        <HeaderRightSideContent
          handleClose={handleClose}
          activeStep={activeStep}
          handleNext={handleNext}
          handleBack={handleBack}
          setActiveStep={setActiveStep}
          isAllFieldsFilled={isAllFieldsFilled(searchConditions)}
          selectedOntology={selectedOntology}
          isUpdating={isUpdating}
          ontologyTerms={ontologyTerms}
        />
      }
      sx={{
        '& .MuiDialogContent-root': {
          padding: 0
        }
      }}
    >
      <>
        {
          activeStep === 0 && <SearchTerms 
            searchConditions={searchConditions} 
            setSearchConditions={setSearchConditions} 
            initialSearchConditions={initialSearchConditions}
            ontologyTerms={ontologyTerms}
            setOntologyTerms={setOntologyTerms}
            ontologyAttributes={ontologyAttributes}
            setOntologyAttributes={setOntologyAttributes}
            selectedOntology={selectedOntology}
            setSelectedOntology={setSelectedOntology}
            setOriginalTerms={setOriginalTerms}
          />
        }
        {
          activeStep === 1 && <EditTerms 
            searchConditions={searchConditions}
            ontologyTerms={ontologyTerms}
            ontologyAttributes={ontologyAttributes}
            onTermsUpdate={setOntologyTerms}
          />
        }
        {
          activeStep === 2 && <StatusStep 
            statusProps={getStatusProps(batchUpdateResults, isUpdating)} 
            onAction={() => setActiveStep(0)} 
            actionButtonStartIcon={<EditOutlinedIcon />}
            onTryAgain={handleTryAgain}
          />
        }
      </>
    </CustomizedDialog>
  );
};

HeaderRightSideContent.propTypes = {
  handleClose: PropTypes.func.isRequired,
  activeStep: PropTypes.number.isRequired,
  handleNext: PropTypes.func.isRequired,
  handleBack: PropTypes.func.isRequired,
  setActiveStep: PropTypes.func.isRequired,
  isAllFieldsFilled: PropTypes.bool.isRequired,
  selectedOntology: PropTypes.object,
  isUpdating: PropTypes.bool.isRequired,
};

EditBulkTermsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  activeStep: PropTypes.number.isRequired,
  setActiveStep: PropTypes.func.isRequired,
};

export default EditBulkTermsDialog;
