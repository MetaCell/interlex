import React, { useState, useEffect, useMemo, useContext, useCallback } from "react";
import { Box, Typography, Grid } from "@mui/material";
import CustomButton from "../common/CustomButton";
import BasicTabs from "../common/CustomTabs";
import CurieEditorDialog from "./CurieEditorDialog";
import CuriesTabPanel from "./CuriesTabPanel";
import { EditNoteIcon } from "../../Icons";
import { vars } from "../../theme/variables";
import { getOrganizationsCuries } from "../../api/endpoints/apiService";
import { GlobalDataContext } from "../../contexts/DataContext";
import debounce from 'lodash/debounce';

const { gray600, gray700 } = vars;

// Helper function to transform curies response similar to SingleOrganization
const transformCuriesResponse = (response) => {
    let curiesObject;
    if (Array.isArray(response) && response.length > 0) {
        // If response is an array, take the first item
        curiesObject = response[0];
    } else if (response && typeof response === 'object') {
        // If response is a direct object, use it directly
        curiesObject = response;
    }

    if (curiesObject && Object.keys(curiesObject).length > 0) {
        // Convert object to array of {prefix, namespace} objects
        return Object.entries(curiesObject).map(([prefix, namespace]) => ({
            prefix,
            namespace
        }));
    }
    return [];
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
    const [openCurieEditor, setOpenCurieEditor] = React.useState(false);
    
    const { user } = useContext(GlobalDataContext);

    const fetchCuries = useCallback(async (type) => {
        try {
            let data = [];
            
            if (type === 'base') {
                // "My curies" tab - get curies from user's groupname
                if (user?.groupname) {
                    const response = await getOrganizationsCuries(user.groupname).catch(error => {
                        if (error?.response?.status === 501) {
                            console.warn(`Curies endpoint not implemented yet (501) for ${user.groupname}, using empty array`);
                            return [{}]; // Return array with empty object to match expected structure
                        }
                        throw error;
                    });
                    data = transformCuriesResponse(response);
                }
            } else if (type === 'curated') {
                // "Curated" tab - get curies from "base" groupname
                const response = await getOrganizationsCuries('base').catch(error => {
                    if (error?.response?.status === 501) {
                        console.warn('Curies endpoint not implemented yet (501) for base, using empty array');
                        return [{}]; // Return array with empty object to match expected structure
                    }
                    throw error;
                });
                data = transformCuriesResponse(response);
            } else if (type === 'latest') {
                // "Latest" tab - get curies from "base" groupname (same as curated)
                const response = await getOrganizationsCuries('base').catch(error => {
                    if (error?.response?.status === 501) {
                        console.warn('Curies endpoint not implemented yet (501) for base, using empty array');
                        return [{}]; // Return array with empty object to match expected structure
                    }
                    throw error;
                });
                data = transformCuriesResponse(response);
            }
            
            setCuries(prev => ({ ...prev, [type]: data }));
        } catch (error) {
            console.error(`Error fetching curies for ${type}:`, error);
            setError(error);
            // Set empty array on error to prevent UI issues
            setCuries(prev => ({ ...prev, [type]: [] }));
        } finally {
            setLoading(false);
        }
    }, [user]);

    const handleAddNewCurieRow = (curieValue) => {
        setCuries(prev => ({ ...prev, [curieValue]: [newRowObj, ...prev[curieValue]] }));
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
    }, [fetchCuries]);

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
                                    error={error}
                                    loading={loading}
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
                                    error={error}
                                    loading={loading}
                                    editMode={tab === 'base'} // Only allow editing for 'base' (My curies) tab
                                    rows={curies[tab]}
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
