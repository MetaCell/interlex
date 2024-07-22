import * as React from "react";
import { Box, Button } from "@mui/material";
import CustomizedDialog from "../common/CustomizedDialog";
import { EditNoteIcon } from "../../Icons";
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

const CurieEditorDialog = ({ open, handleClose, onSubmit, children }) => {
    const [openStatusDialog, setOpenStatusDialog] = React.useState(false);

    const handleSaveCuries = () => {
        onSubmit();
        setOpenStatusDialog(true);
    }

    const handleCloseStatusDialog = () => {
        setOpenStatusDialog(false)
    }

    const handleFinishButtonClick = () => {
        handleClose();
        setOpenStatusDialog(false);
    }

    return (
        <>
            <CustomizedDialog title='Curie editor' open={open} handleClose={handleClose}
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
                title={"Curie editor"}
                message={"Curies edits successfully submitted"}
                subMessage={"Your changes has been applied. Click finish to exit the flow, or resume editing."}
                addButtonTitle={"Edit curies"}
                open={openStatusDialog}
                handleClose={handleCloseStatusDialog}
                handleCloseandAdd={handleFinishButtonClick}
            />
        </>
    )
}

export default CurieEditorDialog;