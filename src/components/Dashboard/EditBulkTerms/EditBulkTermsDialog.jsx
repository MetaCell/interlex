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
import { patchEndpointsIlx } from "../../../api/endpoints/interLexURIStructureAPI";
import { expandIri } from "../../../parsers/predicateMutations";
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
  const { activeOntology, user } = useContext(GlobalDataContext);
  const [searchConditions, setSearchConditions] = useState([initialSearchConditions]);
  const [ontologyTerms, setOntologyTerms] = useState([]);
  const [ontologyAttributes, setOntologyAttributes] = useState([]);
  const [selectedOntology, setSelectedOntology] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [originalTerms, setOriginalTerms] = useState([]);
  const [jsonLdContext, setJsonLdContext] = useState({});
  const [batchUpdateResults, setBatchUpdateResults] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Prefill selectedOntology with activeOntology when dialog opens
  useEffect(() => {
    if (open && activeOntology && !selectedOntology) {
      setSelectedOntology(activeOntology);
    }
  }, [open, activeOntology, selectedOntology]);

  const rawNodeItemToRdfObject = (item, context) => {
    if (item == null) return null;
    if (typeof item === 'string') return { type: 'literal', value: item };
    if (typeof item === 'object') {
      if (item['@id']) return { type: 'uri', value: expandIri(item['@id'], context) };
      if (item['@value'] != null) {
        const obj = { type: 'literal', value: String(item['@value']) };
        if (item['@language']) obj.lang = item['@language'];
        if (item['@type']) obj.datatype = item['@type'];
        return obj;
      }
      return { type: 'literal', value: JSON.stringify(item) };
    }
    return { type: 'literal', value: String(item) };
  };

  const parseValueToRdfObjects = (value, context) => {
    if (value == null || value === '') return [];
    try {
      const arr = JSON.parse('[' + value + ']');
      if (Array.isArray(arr)) {
        return arr.map(item => rawNodeItemToRdfObject(item, context)).filter(Boolean);
      }
    } catch {}
    return [{ type: 'literal', value: String(value) }];
  };

  const performBatchUpdate = async (termsToUpdate = null) => {
    setIsUpdating(true);

    const terms = termsToUpdate || ontologyTerms;
    const results = { successful: [], failed: [], total: terms.length };

    const originalByIri = {};
    originalTerms.forEach(t => { originalByIri[t['@id']] = t; });

    try {
      for (const term of terms) {
        const termIri = term['@id'];
        let termId = termIri;
        if (termId && termId.includes('/')) termId = termId.split('/').pop();
        const group = user?.groupname || 'base';

        try {
          const originalTerm = originalByIri[termIri];
          if (!originalTerm) {
            results.failed.push({ termId, error: 'Original term not found', term });
            continue;
          }

          const add = [];
          const del = [];
          const allKeys = new Set([
            ...Object.keys(term),
            ...Object.keys(originalTerm),
          ].filter(k => k !== '@id' && k !== '_rawNode'));

          for (const predicate of allKeys) {
            const oldValue = originalTerm[predicate];
            const newValue = term[predicate];
            if (oldValue === newValue) continue;
            if (!oldValue && !newValue) continue;

            const expandedPredicate = expandIri(predicate, jsonLdContext);
            const rawNode = originalTerm['_rawNode'];

            if (oldValue != null) {
              const rawVal = rawNode ? rawNode[predicate] : null;
              if (rawVal != null) {
                const rawArr = Array.isArray(rawVal) ? rawVal : [rawVal];
                rawArr.forEach(item => {
                  const rdfObj = rawNodeItemToRdfObject(item, jsonLdContext);
                  if (rdfObj) del.push([termIri, expandedPredicate, rdfObj]);
                });
              } else {
                del.push([termIri, expandedPredicate, { type: 'literal', value: String(oldValue) }]);
              }
            }

            if (newValue != null && newValue !== '') {
              parseValueToRdfObjects(newValue, jsonLdContext).forEach(rdfObj => {
                add.push([termIri, expandedPredicate, rdfObj]);
              });
            }
          }

          if (add.length === 0 && del.length === 0) {
            results.successful.push({ termId, status: 'unchanged' });
            continue;
          }

          await patchEndpointsIlx(group, termId, { data: { add, del } });
          results.successful.push({ termId, status: 200 });
        } catch (error) {
          console.error(`Failed to update term ${termId}:`, error);
          results.failed.push({ termId, error: error.message || 'Unknown error', term });
        }
      }

      if (termsToUpdate && batchUpdateResults) {
        setBatchUpdateResults({
          successful: [...batchUpdateResults.successful, ...results.successful],
          failed: results.failed,
          total: batchUpdateResults.total
        });
      } else {
        setBatchUpdateResults(results);
      }
    } catch (error) {
      console.error('Batch update failed:', error);
      setBatchUpdateResults({
        successful: termsToUpdate && batchUpdateResults ? batchUpdateResults.successful : [],
        failed: terms.map(t => ({ termId: t['@id'], error: error.message || 'Batch operation failed', term: t })),
        total: termsToUpdate && batchUpdateResults ? batchUpdateResults.total : terms.length
      });
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
            setJsonLdContext={setJsonLdContext}
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
