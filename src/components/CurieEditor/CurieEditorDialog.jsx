import * as React from "react";
import PropTypes from 'prop-types';
import { EditNoteIcon } from "../../Icons";
import { Box, Button, Snackbar, Alert } from "@mui/material";
import StatusDialog from "../common/StatusDialog";
import CustomizedDialog from "../common/CustomizedDialog";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const HeaderRightSideContent = ({ handleClose, onSaveCuries }) => {
    return (
        <Box display='flex' alignItems='center' gap={1.5}>
            <Button sx={{ p: '0.625rem 0.875rem', minWidth: '0.0625rem' }} variant="outlined" onClick={handleClose}>Cancel</Button>
            <Button sx={{ p: '0.625rem 0.875rem', minWidth: '0.0625rem' }} variant='contained' onClick={onSaveCuries}>
                <EditNoteIcon />
                Save curies
            </Button>
        </Box>
    )
}


const CurieEditorDialog = ({ open, handleClose, onSubmit, children, isFromOrganization }) => {
    const [openStatusDialog, setOpenStatusDialog] = React.useState(false);
    const [saveError, setSaveError] = React.useState(null);

    const handleSaveCuries = async () => {
        setSaveError(null);
        try {
            await onSubmit();
            setOpenStatusDialog(true);
        } catch (err) {
            setSaveError(err?.body || err?.message || 'Failed to save curies. Please try again.');
        }
    }

    const handleCloseStatusDialog = () => {
        setOpenStatusDialog(false)
    }

    const handleStatusDialogActionButtonClick = () => {
        setOpenStatusDialog(false);
    }

    return (
        <>
            <CustomizedDialog title={isFromOrganization ? "Curie editor - organization" : "Curie editor"} open={open} handleClose={handleClose}
                HeaderRightSideContent={
                    <HeaderRightSideContent
                        handleClose={handleClose}
                        onSaveCuries={handleSaveCuries}
                    />
                }
            >
                {children}
            </CustomizedDialog>
            <StatusDialog
                open={openStatusDialog}
                handleClose={handleCloseStatusDialog}
                title={isFromOrganization ? "Curie editor - organization" : "Curie editor"}
                message={"Curies edits successfully submitted"}
                subMessage={"Your changes has been applied. Go to curie or keep editing."}
                finishButtonTitle={"Go to curie"}
                actionButtonTitle={"Edit curies"}
                handleActionButtonClick={handleStatusDialogActionButtonClick}
                finishButtonEndIcon={<ArrowForwardIcon />}
                actionButtonStartIcon={<EditNoteIcon />}
            />
            <Snackbar
                open={!!saveError}
                autoHideDuration={6000}
                onClose={() => setSaveError(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity="error" onClose={() => setSaveError(null)} sx={{ width: '100%' }}>
                    {saveError}
                </Alert>
            </Snackbar>
        </>
    )
}

HeaderRightSideContent.propTypes = {
    handleClose: PropTypes.func.isRequired,
    onSaveCuries: PropTypes.func.isRequired,
};

CurieEditorDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
    isFromOrganization: PropTypes.bool,
};

export default CurieEditorDialog;
