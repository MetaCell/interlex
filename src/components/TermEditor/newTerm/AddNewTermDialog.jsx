import { useState } from "react";
import PropTypes from "prop-types";
import {
    Box,
    Divider,
    MobileStepper,
    Stack,
    Button,
    FormControlLabel,
    Checkbox
} from "@mui/material";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CustomButton from '../../common/CustomButton';
import CustomizedDialog from "../../common/CustomizedDialog";
import OntologySearch from '../../SingleTermView/OntologySearch';
import FirstStepContent from "./FirstStepContent";
import SecondStepContent from "./SecondStepContent";
import StatusStep from "../../common/StatusStep";
import { getAddTermStatusProps } from '../termStatusProps';
import { CheckedIcon, UncheckedIcon } from '../../../Icons';
import { vars } from "../../../theme/variables";

const { gray100, gray200, gray400 } = vars;

const HeaderRightSideContent = ({
    activeStep,
    onContinue,
    onClose,
    isContinueButtonDisabled
}) => (
    <Box display='flex' alignItems='center'>
        {activeStep !== 2 ? (
            <>
                <FormControlLabel
                    control={
                        <Checkbox
                            size="small"
                            icon={<UncheckedIcon />}
                            checkedIcon={<CheckedIcon />}
                        />
                    }
                    sx={{ color: "#515252" }}
                    label="Add to ontology"
                />
                <OntologySearch />
                <Divider orientation="vertical" flexItem sx={{ m: '0 1rem' }} />
                <MobileStepper
                    variant="dots"
                    steps={3}
                    position="static"
                    activeStep={activeStep}
                    sx={{ maxWidth: 64, flexGrow: 1 }}
                />
                <Divider orientation="vertical" flexItem sx={{ m: '0 1rem' }} />
                <Stack direction="row" spacing={1.5}>
                    <CustomButton onClick={onClose}>Cancel</CustomButton>
                    <Button
                        onClick={onContinue}
                        disabled={isContinueButtonDisabled}
                        variant="contained"
                        endIcon={<ArrowForwardIcon />}
                        sx={{
                            padding: '0.625rem 0.875rem',
                            '&.Mui-disabled': {
                                border: `1px solid ${gray200}`,
                                color: gray400,
                                backgroundColor: gray100
                            }
                        }}
                    >
                        Continue
                    </Button>
                </Stack>
            </>
        ) : (
            <Button variant="contained" onClick={onClose}>Finish</Button>
        )}
    </Box>
);

HeaderRightSideContent.propTypes = {
    activeStep: PropTypes.number.isRequired,
    onContinue: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    isContinueButtonDisabled: PropTypes.bool.isRequired
};

const AddNewTermDialog = ({
    open,
    handleClose,
    searchTerm
}) => {
    const [activeStep, setActiveStep] = useState(0);
    const [addTermResponse, setAddTermResponse] = useState(null);
    const [termValue, setTermValue] = useState('');

    const isSearchTermAvailable = Boolean(searchTerm);
    const isContinueButtonDisabled = !isSearchTermAvailable;
    const statusProps = getAddTermStatusProps(addTermResponse, termValue);

    const handleContinueClick = () => setActiveStep(activeStep + 1);

    const handleCancelBtnClick = () => {
        handleClose();
        setActiveStep(0);
    };

    return (
        <CustomizedDialog
            title="Add new term"
            open={open}
            handleClose={handleClose}
            HeaderRightSideContent={
                <HeaderRightSideContent
                    activeStep={activeStep}
                    onContinue={handleContinueClick}
                    onClose={handleCancelBtnClick}
                    isContinueButtonDisabled={false}
                />
            }
            sx={{ '& .MuiDialogContent-root': { padding: 0, overflowY: "hidden" } }}
        >
            {activeStep === 0 && <FirstStepContent />}
            {activeStep === 1 && <SecondStepContent />}
            {activeStep === 2 && addTermResponse != null && (
                <StatusStep statusProps={statusProps} />
            )}
        </CustomizedDialog>
    );
};

AddNewTermDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    searchTerm: PropTypes.string,
    forwardPredicateStep: PropTypes.bool
};

export default AddNewTermDialog;
