import * as React from "react";
import { Box, Button } from "@mui/material";
import CustomizedDialog from "../common/CustomizedDialog";
import { EditNoteIcon } from "../../Icons";
import BasicTabs from "../common/CustomTabs";
import MyCuriesTabPanel from "./MyCuriesTabPanel";
import CuratedCuriesTabPanel from "./CuratedCuriesTabPanel";
import LatestCuriesTabPanel from "./LatestCuriesTabPanel";
import * as mockApi from './../../api/endpoints/swaggerMockMissingEndpoints';

const useMockApi = () => mockApi;

const headCells = [
    { id: 'prefix', label: 'Prefix' },
    { id: 'namespace', label: 'Namespace' },
    { id: 'delete-button', label: '' }
];

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
    const { getCuries } = useMockApi();
    const [tabValue, setTabValue] = React.useState(0);
    const [rows, setRows] = React.useState([]);

    const handleChangeTabs = (event, newValue) => {
        setTabValue(newValue);
    };

    // React.useEffect( () => {
    //     getCuries("base").then(data => { 
    //         const parsedData = curieParser(data)
    //         console.log("Parsed retrieved curies : ", parsedData)
    //     });
    // }, [])

    return (
        <CustomizedDialog title='Curie editor' open={open} handleClose={handleClose} HeaderRightSideContent={HeaderRightSideContent}>
            <Box sx={{ padding: '12px 20px' }}>
                <BasicTabs tabValue={tabValue} handleChange={handleChangeTabs} tabs={["My curies", "Curated", "Latest"]} />
                <Box flexGrow={1} overflow="auto" p="2.5rem 0.5rem">
                    {
                        tabValue === 0 && <MyCuriesTabPanel editMode headCells={headCells} />
                    }
                    {
                        tabValue === 1 && <CuratedCuriesTabPanel editMode headCells={headCells} />
                    }
                    {
                        tabValue === 2 && <LatestCuriesTabPanel editMode headCells={headCells} />
                    }
                </Box>
            </Box>
        </CustomizedDialog>
    )
}

export default CurieEditorDialog;