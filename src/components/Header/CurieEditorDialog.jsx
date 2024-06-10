import * as React from "react";
import { Box, Divider, FormControl, MenuItem, Select, Button, Typography } from "@mui/material";
import CustomizedDialog from "../common/CustomizedDialog";
import { EditNoteIcon } from "../../Icons";
import { vars } from "../../theme/variables";

const HeaderRightSideContent = () => {

    return (
        <Box display='flex' alignItems='center' gap={1.5}>
            <Button sx={{ p: '0.625rem 0.875rem', minWidth: '0.0625rem' }} variant="outlined">Cancel</Button>
            <Button sx={{ p: '0.625rem 0.875rem', minWidth: '0.0625rem' }} variant='contained'>
                <EditNoteIcon />
                Save curies
            </Button>
        </Box>
    )
}
const CurieEditorDialog = ({ open, handleClose }) => {
    return (
        <CustomizedDialog title='Curie editor' open={open} handleClose={handleClose} HeaderRightSideContent={HeaderRightSideContent}>
            Content
        </CustomizedDialog>
    )
}

export default CurieEditorDialog;