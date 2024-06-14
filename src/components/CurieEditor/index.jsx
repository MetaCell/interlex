import React, { useState } from "react";
import { Box, Typography, Divider, Grid, Stack, FormControl, Select, MenuItem } from "@mui/material";
import CustomButton from "../common/CustomButton";
import BasicTabs from "../common/CustomTabs";
import CurieEditorDialog from "./CurieEditorDialog";
import CuriesTabPanel from "./CuriesTabPanel";
import { EditNoteIcon } from "../../Icons";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { vars } from "../../theme/variables";

const { gray200, gray300, gray600, gray700 } = vars;

const headCells = [
    { id: 'prefix', label: 'Prefix' },
    { id: 'namespace', label: 'Namespace' }
];

const CurieEditor = () => {
    const [curieAmount, setCurieAmount] = useState(0);
    const [numberOfVisiblePages, setNumberOfVisiblePages] = React.useState(5);
    const [openCurieEditor, setOpenCurieEditor] = React.useState(false);
    const [pageOptions, setPageOptions] = useState([5, 10, 15]);
    const [tabValue, setTabValue] = React.useState(0);

    const handleCurieAmountChange = (value) => {
        setCurieAmount(value)
    }

    const handleClickCurieEditor = () => {
        setOpenCurieEditor(true);
    };

    const handleCloseCurieEditor = () => {
        setOpenCurieEditor(false);
    };

    const handleChangeTabs = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleNumberOfPagesChange = (event) => {
        setNumberOfVisiblePages(event.target.value);
    };

    return (
        <Box p='1.5rem 2.5rem' flexGrow={1} overflow='auto'>
            <Grid container>
                <Grid item xs={12} lg={4}>
                    <Typography fontSize='1.5rem' color={gray600} fontWeight={600}>
                        {curieAmount} curies
                    </Typography>
                </Grid>
                <Grid item display="flex" justifyContent='end' xs={12} lg={8}>
                    <Stack direction="row" alignItems="center" gap={1}>
                        <Typography variant="caption" sx={{ fontSize: '0.875rem', color: gray600 }}>Show on page:</Typography>
                        <FormControl sx={{ minWidth: 75 }}>
                            <Select
                                value={numberOfVisiblePages}
                                onChange={handleNumberOfPagesChange}
                                displayEmpty
                                IconComponent={KeyboardArrowDownIcon}
                                sx={{
                                    color: gray700,
                                    borderRadius: '0.5rem !important',
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    '& .MuiOutlinedInput-input': {
                                        padding: '0.625rem 0.875rem'
                                    },
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: gray300
                                    },
                                    '& .MuiSvgIcon-root': {
                                        color: gray700,
                                        fontSize: '1.25rem',
                                        right: '0.875rem !important'
                                    }
                                }}
                            >
                                {pageOptions.map(option => (
                                    <MenuItem key={option} value={option}>{option}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Stack>
                    <Divider sx={{ border: `1px solid ${gray200}`, mx: '1rem' }} />
                    <CustomButton onClick={handleClickCurieEditor}>
                        <EditNoteIcon sx={{ fill: gray700 }} />
                        Edit curies
                    </CustomButton>
                    <CurieEditorDialog open={openCurieEditor} handleClose={handleCloseCurieEditor} />
                </Grid>
            </Grid>
            <Grid container mt={3}>
                <BasicTabs tabValue={tabValue} handleChange={handleChangeTabs} tabs={["My curies", "Curated", "Latest"]} />
                <Box flexGrow={1} overflow="auto" p="2.5rem 0.5rem" width={1}>
                    {
                        tabValue === 0 && <CuriesTabPanel curieValue={"base"} headCells={headCells} onCurieAmountChange={handleCurieAmountChange} />
                    }
                    {
                        tabValue === 1 && <CuriesTabPanel curieValue={"curated"} headCells={headCells} onCurieAmountChange={handleCurieAmountChange} />
                    }
                    {
                        tabValue === 2 && <CuriesTabPanel curieValue={"latest"} headCells={headCells} onCurieAmountChange={handleCurieAmountChange} />
                    }
                </Box>
            </Grid>
        </Box>
    );
}

export default CurieEditor;
