import { useState } from "react";
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

const initialSearchConditions = { attribute: '', value: '', condition: 'where', relation: SearchTermsData.objectOptions[0].value }

const HeaderRightSideContent = ({ handleClose, activeStep, handleNext, handleBack, setActiveStep, isAllFieldsFilled }) => {
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
          <Button endIcon={<ArrowForwardIcon />} variant='contained' color='primary' onClick={handleNext} disabled={activeStep === 0 && !isAllFieldsFilled}>
            Continue
          </Button>
        </>
      }
    </Box>
  );
};

const EditBulkTermsDialog = ({ open, handleClose, activeStep, setActiveStep }) => {
  const [searchConditions, setSearchConditions] = useState([initialSearchConditions]);
  const handleNext = () => {
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
  const statusProps = getStatusProps({ success: true });

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
          activeStep === 0 && <SearchTerms searchConditions={searchConditions} setSearchConditions={setSearchConditions} initialSearchConditions={initialSearchConditions} />
        }
        {
          activeStep === 1 && <EditTerms searchConditions={searchConditions} />
        }
        {
          activeStep === 2 && <StatusStep statusProps={statusProps} onAction={() => setActiveStep(0)} actionButtonStartIcon={<EditOutlinedIcon />} />
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
  isAllFieldsFilled: PropTypes.func.isRequired,
};

EditBulkTermsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  activeStep: PropTypes.number.isRequired,
  setActiveStep: PropTypes.func.isRequired,
};

export default EditBulkTermsDialog;
