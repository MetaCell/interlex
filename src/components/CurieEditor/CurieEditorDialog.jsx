import * as React from "react";
import { Box, Button } from "@mui/material";
import CustomizedDialog from "../common/CustomizedDialog";
import { EditNoteIcon } from "../../Icons";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StatusDialog from "../common/StatusDialog";


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

    const handleSaveCuries = () => {
        onSubmit();
        setOpenStatusDialog(true);
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
        </>
    )
}

export default CurieEditorDialog;