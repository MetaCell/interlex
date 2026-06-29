import * as React from "react";
import { useState } from "react";
import PropTypes from "prop-types";
import CustomButton from "../common/CustomButton";
import TermDialogContent from "./TermDialogContent";
import CustomizedDialog from "../common/CustomizedDialog";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AddNewTermDialogContent from "./AddNewTermDialogContent";
import { Box, Divider, MobileStepper, Stack, Button } from "@mui/material";

import { vars } from "../../theme/variables";
const { gray100, gray200, gray400 } = vars;

const HeaderRightSideContent = ({ activeStep, onContinue, onClose, isContinueButtonDisabled }) => (
    <Box display='flex' alignItems='center'>
        {activeStep !== 2 ? (
            <>
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
                            '&.Mui-disabled': { border: `1px solid ${gray200}`, color: gray400, backgroundColor: gray100 }
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

const TermDialog = ({ open, handleClose, searchTerm, group, forwardPredicateStep }) => {
    const [activeStep, setActiveStep] = useState(0);
    const [areMatchesChecked, setAreMatchesChecked] = useState(false);


    const handleContinueClick = () => { setActiveStep(activeStep + 1) }
    const handleMatchesChange = (e) => setAreMatchesChecked(e.target.checked);
    const handleCancelBtnClick = () => { handleClose(); setActiveStep(0); setAreMatchesChecked(false) };
    const handleReset = () => { setAreMatchesChecked(false); setActiveStep(0) }
    const isSearchTermAvailable = searchTerm ? true : false;
    const isContinueButtonDisabled = !isSearchTermAvailable && !areMatchesChecked;

    React.useEffect(() => {
        if(forwardPredicateStep) {
            setActiveStep(1)
        }
    }, [forwardPredicateStep])

    return (
        <CustomizedDialog
            title={searchTerm ? `Suggest changes to “${searchTerm}”` : 'Add a new term'}
            open={open}
            handleClose={handleClose}
            HeaderRightSideContent={
                <HeaderRightSideContent
                    activeStep={activeStep}
                    onContinue={handleContinueClick}
                    onClose={handleCancelBtnClick}
                    isContinueButtonDisabled={isContinueButtonDisabled}
                />
            }
            sx={{ '& .MuiDialogContent-root': { padding: 0, overflowY: "hidden" } }}
        >
            {searchTerm ? (
                <TermDialogContent
                    activeStep={activeStep}
                    searchTerm={searchTerm}
                    group={group}
                    onReset={handleReset}
                />
            ) : (
                <AddNewTermDialogContent
                    activeStep={activeStep}
                    areMatchesChecked={areMatchesChecked}
                    onMatchesChange={handleMatchesChange}
                    onReset={handleReset}
                    onClose={handleCancelBtnClick}
                />
            )}
        </CustomizedDialog>
    );
};

HeaderRightSideContent.propTypes = {
    activeStep: PropTypes.number.isRequired,
    onContinue: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    isContinueButtonDisabled: PropTypes.bool.isRequired
};

TermDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    searchTerm: PropTypes.string,
    group: PropTypes.string,
    forwardPredicateStep: PropTypes.bool
};

export default TermDialog;
