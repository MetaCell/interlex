import { Box, Button, Divider } from "@mui/material";
import CustomizedDialog from "../common/CustomizedDialog";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MobileStepper from '@mui/material/MobileStepper';
import SearchTerms from "./SearchTerms";
import EditTerms from "./EditTerms";
import {ArrowBack} from "@mui/icons-material";
import StatusDialog from "./StatusDialog";
import PropTypes from "prop-types";
const HeaderRightSideContent = ({ handleClose, activeStep, handleNext, handleBack, setActiveStep }) => {
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
          handleClose()
          setActiveStep(0)
        }}>
          Finish
        </Button> : <>
          {
            activeStep === 0 ?  <Button variant='outlined' onClick={handleClose}>
              Cancel
            </Button> :  <Button startIcon={<ArrowBack />} variant='outlined' onClick={handleBack}>
              Previous
            </Button>
          }
          <Button endIcon={<ArrowForwardIcon />} variant='contained' color='primary' onClick={handleNext}>
            Continue
          </Button>
        </>
      }
    </Box>
  );
};

const EditBulkTermsDialog = ({ open, handleClose, activeStep, setActiveStep }) => {
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
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
        />
      }
    >
      <>
        {
          activeStep === 0 && <SearchTerms />
        }
        {
          activeStep === 1 && <EditTerms />
        }
        {
          activeStep === 2 && <StatusDialog setActiveStep={setActiveStep} />
        }
      </>
    </CustomizedDialog>
  );
}

EditBulkTermsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  activeStep: PropTypes.number.isRequired,
  setActiveStep: PropTypes.func.isRequired,
};

export default EditBulkTermsDialog;