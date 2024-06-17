import * as React from "react";
import { Box, Button } from "@mui/material";
import CustomizedDialog from "../common/CustomizedDialog";
import { EditNoteIcon } from "../../Icons";
import BasicTabs from "../common/CustomTabs";
import CuriesTabPanel from "./CuriesTabPanel";
import StatusDialog from "../common/StatusDialog";


const headCells = [
    { id: 'prefix', label: 'Prefix' },
    { id: 'namespace', label: 'Namespace' },
    { id: 'delete-button', label: '' }
];

const HeaderRightSideContent = ({ handleClose, openStatusDialog, handleCloseStatusDialog, handleOpenStatusDialog, handleFinishButtonClick, image }) => {
    return (
        <Box display='flex' alignItems='center' gap={1.5}>
            <Button sx={{ p: '0.625rem 0.875rem', minWidth: '0.0625rem' }} variant="outlined" onClick={handleClose}>Cancel</Button>
            <Button sx={{ p: '0.625rem 0.875rem', minWidth: '0.0625rem' }} variant='contained' onClick={handleOpenStatusDialog}>
                <EditNoteIcon />
                Save curies
            </Button>
            <StatusDialog
                title={"Curie editor"}
                message={"Curies edits successfully submitted"}
                subMessage={"Your changes has been applied. Click finish to exit the flow, or resume editing."}
                addButtonTitle={"Edit curies"}
                open={openStatusDialog}
                handleClose={handleCloseStatusDialog}
                handleCloseandAdd={handleFinishButtonClick}
                image={image}
            />
        </Box>
    )
}

const CurieEditorDialog = ({ open, handleClose }) => {
    const [tabValue, setTabValue] = React.useState(0);
    const [openStatusDialog, setOpenStatusDialog] = React.useState(false);
    const imgStyle = { width: '100%' }; // Customize your image style
    const imgPath = '/success.png'; // Set your image path

    const handleChangeTabs = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleOpenStatusDialog = () => {
        setOpenStatusDialog(true)
    }

    const handleCloseStatusDialog = () => {
        setOpenStatusDialog(false)
    }

    const handleFinishButtonClick = () => {
        handleClose();
        setOpenStatusDialog(false);
    }

    const image = new Image();
    image.onload = () => <img style={imgStyle} src={imgPath} alt="preview" />
    image.src = imgPath;

    return (
        <CustomizedDialog title='Curie editor' open={open} handleClose={handleClose}
            HeaderRightSideContent={
                <HeaderRightSideContent
                    handleClose={handleClose}
                    openStatusDialog={openStatusDialog}
                    handleCloseStatusDialog={handleCloseStatusDialog}
                    handleOpenStatusDialog={handleOpenStatusDialog}
                    handleFinishButtonClick={handleFinishButtonClick}
                    image={image}
                />
            }
        >
            <Box sx={{ padding: '0.75rem 1.25rem' }}>
                <BasicTabs tabValue={tabValue} handleChange={handleChangeTabs} tabs={["My curies", "Curated", "Latest"]} />
                <Box flexGrow={1} overflow="auto" p="2.5rem 0.5rem" width={1}>
                    {
                        tabValue === 0 && <CuriesTabPanel curieValue={"base"} editMode headCells={headCells} />
                    }
                    {
                        tabValue === 1 && <CuriesTabPanel curieValue={"curated"} editMode headCells={headCells} />
                    }
                    {
                        tabValue === 2 && <CuriesTabPanel curieValue={"latest"} editMode headCells={headCells} />
                    }
                </Box>
            </Box>
        </CustomizedDialog>
    )
}

export default CurieEditorDialog;