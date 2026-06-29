import React, { useState, useContext } from "react";
import { Box, Typography, Grid } from "@mui/material";
import CustomButton from "../common/CustomButton";
import BasicTabs from "../common/CustomTabs";
import CurieEditorDialog from "./CurieEditorDialog";
import CuriesTabPanel from "./CuriesTabPanel";
import { EditNoteIcon } from "../../Icons";
import { vars } from "../../theme/variables";
import { addOrganizationCuries } from "../../api/endpoints/apiService";
import { GlobalDataContext } from "../../contexts/DataContext";

const { gray600, gray700 } = vars;

let newRowCounter = 0;

const curiesTabs = ["My curies", "Curated", "Latest"];
const curieValues = ["base", "curated", "latest"];

const CurieEditor = () => {
    const { user, curies, curiesLoading, setCuriesData } = useContext(GlobalDataContext);

    const [localCuries, setLocalCuries] = useState({ base: [], curated: [], latest: [] });
    const [tabValue, setTabValue] = useState(0);
    const [curieAmount, setCurieAmount] = useState(0);
    const [openCurieEditor, setOpenCurieEditor] = useState(false);

    const handleClickCurieEditor = () => {
        // Snapshot context curies into local state when opening dialog
        setLocalCuries(curies);
        setOpenCurieEditor(true);
    };

    const handleCloseCurieEditor = () => setOpenCurieEditor(false);
    const handleChangeTabs = (event, newValue) => setTabValue(newValue);
    const handleCurieAmountChange = (value) => setCurieAmount(value);

    const handleAddNewCurieRow = (curieValue) => {
        newRowCounter += 1;
        setLocalCuries(prev => ({
            ...prev,
            [curieValue]: [{ prefix: '', namespace: '', _id: `new_${newRowCounter}` }, ...prev[curieValue]]
        }));
    };

    const handleDeleteCurieRow = (curieValue, rowId) => {
        setLocalCuries(prev => ({
            ...prev,
            [curieValue]: prev[curieValue].filter(row => row._id !== rowId)
        }));
    };

    const handleInputChangeCurieRow = (e, rowId, columnName, curieValue) => {
        const value = e.target.value;
        setLocalCuries(prev => ({
            ...prev,
            [curieValue]: prev[curieValue].map(row => row._id === rowId ? { ...row, [columnName]: value } : row)
        }));
    };

    const handleSubmit = async () => {
        if (!user?.groupname) return;
        const newRows = localCuries.base.filter(row => row._id?.startsWith('new_'));
        if (newRows.length === 0) return;
        const payload = newRows.reduce((acc, { prefix, namespace }) => {
            if (prefix && namespace) acc[prefix] = namespace;
            return acc;
        }, {});
        if (Object.keys(payload).length === 0) return;

        await addOrganizationCuries(user.groupname, payload);

        // Re-stamp saved rows as existing, then sync to context
        const updatedBase = localCuries.base.map(row =>
            row._id?.startsWith('new_') && payload[row.prefix]
                ? { ...row, _id: `existing_${row.prefix}_${row.namespace}` }
                : row
        );
        const updatedCuries = { ...localCuries, base: updatedBase };
        setLocalCuries(updatedCuries);
        setCuriesData(updatedCuries);
    };

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
                                    error={null}
                                    loading={curiesLoading}
                                    rows={curies[tab]}
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
                                    error={null}
                                    loading={curiesLoading}
                                    editMode={tab === 'base'}
                                    rows={localCuries[tab]}
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
};

export default CurieEditor;
