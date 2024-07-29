import React, { useState, useEffect, useMemo } from "react";
import { Box, Typography, Divider, Grid, Stack } from "@mui/material";
import CustomButton from "../common/CustomButton";
import BasicTabs from "../common/CustomTabs";
import CurieEditorDialog from "./CurieEditorDialog";
import CuriesTabPanel from "./CuriesTabPanel";
import { EditNoteIcon } from "../../Icons";
import { vars } from "../../theme/variables";
import CustomSingleSelect from "../common/CustomSingleSelect";
import { getCuries } from '../../api/endpoints';
import debounce from 'lodash/debounce';

const { gray200, gray600, gray700 } = vars;

const generatePageOptions = (curieAmount) => {
    if (curieAmount <= 5) return [curieAmount];
    const step = [5, 3, 2].find(step => curieAmount % step === 0) || curieAmount;
    return Array.from({ length: Math.floor(curieAmount / step) }, (_, i) => (i + 1) * step);
};

const newRowObj = { prefix: '', namespace: '' };

const curiesTabs = ["My curies", "Curated", "Latest"];
const curieValues = ["base", "curated", "latest"]

const CurieEditor = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [curies, setCuries] = useState({ base: [], curated: [], latest: [] });
    const [tabValue, setTabValue] = useState(0);
    const [curieAmount, setCurieAmount] = useState(0);
    const [numberOfVisibleCuries, setNumberOfVisibleCuries] = useState(0);
    const [openCurieEditor, setOpenCurieEditor] = useState(false);
    const [pageOptions, setPageOptions] = useState([]);

    const fetchCuries = async (type) => {
        try {
            const data = await getCuries(type);
            setCuries(prev => ({ ...prev, [type]: data }));
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddNewCurieRow = (curieValue) => {
        setCuries(prev => ({ ...prev, [curieValue]: [...prev[curieValue], newRowObj] }));
    };

    const handleDeleteCurieRow = (curieValue, rowPrefix, rowNamespace) => {
        console.log("DELETE: connect to delete method")
        setCuries(prev => ({
            ...prev,
            [curieValue]: prev[curieValue].filter(row => row.prefix !== rowPrefix && row.namespace !== rowNamespace)
        }));
    };

    const debouncedUpdateRows = useMemo(
        () => debounce((curieValue, updatedRows) => {
            setCuries(prev => ({ ...prev, [curieValue]: updatedRows }));
        }, 2000),
        []
    );

    const handleInputChangeCurieRow = (e, rowIndex, columnName, curieValue) => {
        console.log("UPDATE: here connect to update method")
        const updatedRows = curies[curieValue].map((row, index) => index === rowIndex ? { ...row, [columnName]: e.target.value } : row);
        debouncedUpdateRows(curieValue, updatedRows);
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
        fetchCuries('base');
        fetchCuries('curated');
        fetchCuries('latest');
    }, []);

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
                        {curieValues.map((tab, index) => (
                            tabValue === index && (
                                <CuriesTabPanel
                                    key={tab}
                                    error={error}
                                    loading={loading}
                                    rows={curies[tab]}
                                    numberOfVisibleCuries={numberOfVisibleCuries}
                                    onCurieAmountChange={handleCurieAmountChange}
                                />
                            )
                        ))}
                    </Box>
                </Grid>
            </Box>
            <CurieEditorDialog open={openCurieEditor} handleClose={handleCloseCurieEditor} onSubmit={handleSubmit}>
                <Box sx={{ padding: '0.75rem 1.25rem' }}>
                    <BasicTabs tabValue={tabValue} handleChange={handleChangeTabs} tabs={curiesTabs} />
                    <Box flexGrow={1} overflow="auto" p="2.5rem 0.5rem" width={1}>
                        {curieValues.map((tab, index) => (
                            tabValue === index && (
                                <CuriesTabPanel
                                    key={tab}
                                    curieValue={tab}
                                    error={error}
                                    loading={loading}
                                    editMode
                                    rows={curies[tab]}
                                    numberOfVisibleCuries={numberOfVisibleCuries}
                                    onCurieAmountChange={handleCurieAmountChange}
                                    onAddRow={handleAddNewCurieRow}
                                    onDeleteRow={handleDeleteCurieRow}
                                    onChangeRow={handleInputChangeCurieRow}
                                />
                            )
                        ))}
                    </Box>
                </Box>
            </CurieEditorDialog>
        </>
    );
}

export default CurieEditor;
