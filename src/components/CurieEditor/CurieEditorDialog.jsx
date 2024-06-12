import * as React from "react";
import { Box, Button } from "@mui/material";
import CustomizedDialog from "../common/CustomizedDialog";
import { EditNoteIcon } from "../../Icons";
import BasicTabs from "../common/CustomTabs";
import MyCuriesTabPanel from "./MyCuriesTabPanel";
import CuratedCuriesTabPanel from "./CuratedCuriesTabPanel";
import LatestCuriesTabPanel from "./LatestCuriesTabPanel";


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
    const [tabValue, setTabValue] = React.useState(0);

    const handleChangeTabs = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        <CustomizedDialog title='Curie editor' open={open} handleClose={handleClose} HeaderRightSideContent={HeaderRightSideContent}>
            <Box sx={{ padding: '12px 20px' }}>
                <BasicTabs tabValue={tabValue} handleChange={handleChangeTabs} tabs={["My curies", "Curated", "Latest"]} />
                <Box flexGrow={1} overflow="auto" p="2.5rem 0.5rem">
                    {
                        tabValue === 0 && <MyCuriesTabPanel />
                    }
                    {
                        tabValue === 1 && <CuratedCuriesTabPanel />
                    }
                    {
                        tabValue === 2 && <LatestCuriesTabPanel />
                    }
                </Box>
            </Box>
        </CustomizedDialog>
    )
}

export default CurieEditorDialog;