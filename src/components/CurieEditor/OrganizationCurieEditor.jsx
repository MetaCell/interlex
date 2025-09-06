import {
    useState,
    useEffect,
    useMemo,
    useCallback
} from "react";
import debounce from 'lodash/debounce';
import { EditNoteIcon } from "../../Icons";
import BasicTabs from "../common/CustomTabs";
import CuriesTabPanel from "./CuriesTabPanel";
import CustomButton from "../common/CustomButton";
import OntologyTabPanel from "./OntologyTabPanel";
import CurieEditorDialog from "./CurieEditorDialog";
// TODO: This API endpoint may return 501 (Not Implemented) errors
// Updated to use real API service instead of mock data with proper error handling
import { getOrganizationsCuries } from "../../api/endpoints/apiService";
import CustomSingleSelect from "../common/CustomSingleSelect";
import { Box, Typography, Divider, Grid, Stack } from "@mui/material";

import { vars } from "../../theme/variables";
const { gray200, gray600, gray700 } = vars;

const generatePageOptions = (curieAmount) => {
    if (curieAmount <= 5) return [curieAmount];
    const step = [5, 3, 2].find(step => curieAmount % step === 0) || curieAmount;
    return Array.from({ length: Math.floor(curieAmount / step) }, (_, i) => (i + 1) * step);
};

const newRowObj = { prefix: '', namespace: '' };
const curiesTabs = ["Curies", "Ontologies"];

const OrganizationsCurieEditor = () => {
    const [loading, setLoading] = useState(true);
    // eslint-disable-next-line no-unused-vars
    const [error, setError] = useState(null);
    const [curies, setCuries] = useState([]);
    const [tabValue, setTabValue] = useState(0);
    const [curieAmount, setCurieAmount] = useState(0);
    const [numberOfVisibleCuries, setNumberOfVisibleCuries] = useState(0);
    const [openCurieEditor, setOpenCurieEditor] = useState(false);
    const [pageOptions, setPageOptions] = useState([]);

    const getOrganizationRequest = useCallback(async (id) => {
        try {
            const response = await getOrganizationsCuries(id);
            console.log("Get Organization curies response ", response);
            setCuries(response);
            setCurieAmount(response.length);
            setLoading(false);
        } catch (error) {
            // TODO: Handle when backend curies endpoint is fully implemented
            if (error?.response?.status === 501) {
                console.warn("Organization curies endpoint not implemented yet (501), using empty array");
                setCuries([]);
                setCurieAmount(0);
                setLoading(false);
            } else {
                console.log("Error ", error);
                setLoading(false);
            }
        }
    }, [setCuries, setCurieAmount, setLoading]);

    // eslint-disable-next-line no-unused-vars
    const handleAddNewCurieRow = (curieValue) => {
        setCuries(prev => [
            ...prev, newRowObj
        ]);
    };

    const handleDeleteCurieRow = (curieValue, rowPrefix, rowNamespace) => {
        console.log("DELETE: connect to delete method")
        setCuries(prev => prev.filter(row => row.prefix !== rowPrefix || row.namespace !== rowNamespace));
    };

    const debouncedUpdateRows = useMemo(
        () => debounce((updatedRows) => {
            setCuries(updatedRows);
        }, 2000),
        []
    );

    // eslint-disable-next-line no-unused-vars
    const handleInputChangeCurieRow = (e, rowIndex, columnName, curieValue) => {
        console.log("UPDATE: here connect to update method")
        const updatedRows = curies.map((row, index) => index === rowIndex ? { ...row, [columnName]: e.target.value } : row);
        debouncedUpdateRows(updatedRows);
    };

    const handleCurieAmountChange = (value) => setCurieAmount(value);
    const handleNumberOfVisibleCuriesChange = (value) => setNumberOfVisibleCuries(value);
    const handleClickCurieEditor = () => setOpenCurieEditor(true);
    const handleCloseCurieEditor = () => setOpenCurieEditor(false);
    const handleChangeTabs = (event, newValue) => setTabValue(newValue);

    const handleSubmit = () => {
        console.log("POST: here connect to post method")
    }

    useEffect(() => {
        getOrganizationRequest("1");
    }, [getOrganizationRequest]);

    useEffect(() => {
        const options = generatePageOptions(curieAmount);
        setPageOptions(options);
        setNumberOfVisibleCuries(options[0]);
    }, [curieAmount]);

    return (
        <>
            <Box p="1.5rem 2.5rem" flexGrow={1} overflow="auto">
                <Grid container>
                    <Grid item xs={12} lg={4}>
                        <Typography fontSize="1.5rem" color={gray600} fontWeight={600}>
                            {curieAmount} curies
                        </Typography>
                    </Grid>
                    <Grid item xs={12} lg={8} display="flex" justifyContent="end">
                        <Stack direction="row" alignItems="center" gap={1}>
                            <Typography variant="caption" sx={{ fontSize: '0.875rem', color: gray600 }}>Show on page:</Typography>
                            <CustomSingleSelect value={numberOfVisibleCuries} onChange={handleNumberOfVisibleCuriesChange} options={pageOptions} />
                        </Stack>
                        <Divider sx={{ border: `1px solid ${gray200}`, mx: '1rem' }} />
                        <CustomButton onClick={handleClickCurieEditor}>
                            <EditNoteIcon sx={{ fill: gray700 }} />
                            Edit curies
                        </CustomButton>
                    </Grid>
                </Grid>
                <Grid container mt={3}>
                    <BasicTabs tabValue={tabValue} handleChange={handleChangeTabs} tabs={curiesTabs} />
                    <Box flexGrow={1} overflow="auto" p="2.5rem 0.5rem" width={1}>
                        {tabValue === 0 && (
                            <CuriesTabPanel
                                error={error}
                                loading={loading}
                                rows={curies}
                                numberOfVisibleCuries={numberOfVisibleCuries}
                                onCurieAmountChange={handleCurieAmountChange}
                            />
                        )}
                        {tabValue === 1 && (
                            <OntologyTabPanel />
                        )}
                    </Box>
                </Grid>
            </Box>
            <CurieEditorDialog open={openCurieEditor} handleClose={handleCloseCurieEditor} onSubmit={handleSubmit} isFromOrganization={true}>
                <Box sx={{ padding: '0.75rem 1.25rem' }}>
                    <BasicTabs tabValue={tabValue} handleChange={handleChangeTabs} tabs={curiesTabs} />
                    <Box flexGrow={1} overflow="auto" p="2.5rem 0.5rem" width={1}>
                        {tabValue === 0 && (
                            <CuriesTabPanel
                                error={error}
                                loading={loading}
                                editMode
                                rows={curies}
                                numberOfVisibleCuries={numberOfVisibleCuries}
                                onCurieAmountChange={handleCurieAmountChange}
                                onAddRow={handleAddNewCurieRow}
                                onDeleteRow={handleDeleteCurieRow}
                                onChangeRow={handleInputChangeCurieRow}
                            />
                        )}
                    </Box>
                </Box>
            </CurieEditorDialog>
        </>
    );
}

export default OrganizationsCurieEditor;
