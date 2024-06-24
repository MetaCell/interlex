import React, { useState, useEffect } from "react";
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

const generatePageOptions = (curieAmount) => {
    if (curieAmount <= 5) {
        return [curieAmount];
    }
    const options = [];
    if (curieAmount % 5 === 0) {
        for (let i = 5; i <= curieAmount; i += 5) {
            options.push(i);
        }
    } else if (curieAmount % 3 === 0) {
        for (let i = 3; i <= curieAmount; i += 3) {
            options.push(i);
        }
    } else if (curieAmount % 2 === 0) {
        for (let i = 2; i <= curieAmount; i += 2) {
            options.push(i);
        }
    } else {
        options.push(curieAmount);
    }
    return options;
}

const CurieEditor = () => {
    const [curieAmount, setCurieAmount] = useState(0);
    const [numberOfVisibleCuries, setNumberOfVisibleCuries] = React.useState(0);
    const [openCurieEditor, setOpenCurieEditor] = React.useState(false);
    const [pageOptions, setPageOptions] = useState([]);
    const [tabValue, setTabValue] = React.useState(0);
    const [myCuries, setMyCuries] = React.useState([]);
    const [curatedCuries, setCuratedCuries] = React.useState([]);
    const [latestCuries, setLatestCuries] = React.useState([]);
    const imgStyle = { width: '100%' };
    const imgPath = '/success.png'; 

    useEffect(() => {
        const options = generatePageOptions(curieAmount);
        setPageOptions(options);
        setNumberOfVisibleCuries(options[0]);
    }, [curieAmount]);

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

    const handleNumberOfVisibleCuriesChange = (event) => {
        setNumberOfVisibleCuries(event.target.value);
    };

    const image = new Image();
    image.onload = () => <img style={imgStyle} src={imgPath} alt="preview" />
    image.src = imgPath;

    return (
        <>
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
                                    value={numberOfVisibleCuries}
                                    onChange={handleNumberOfVisibleCuriesChange}
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
                    </Grid>
                </Grid>
                <Grid container mt={3}>
                    <BasicTabs tabValue={tabValue} handleChange={handleChangeTabs} tabs={["My curies", "Curated", "Latest"]} />
                    <Box flexGrow={1} overflow="auto" p="2.5rem 0.5rem" width={1}>
                        {
                            tabValue === 0 && <CuriesTabPanel rows={myCuries} setRows={setMyCuries} curieValue={"base"} headCells={headCells} numberOfVisibleCuries={numberOfVisibleCuries} onCurieAmountChange={handleCurieAmountChange} />
                        }
                        {
                            tabValue === 1 && <CuriesTabPanel rows={curatedCuries} setRows={setCuratedCuries} curieValue={"curated"} headCells={headCells} numberOfVisibleCuries={numberOfVisibleCuries} onCurieAmountChange={handleCurieAmountChange} />
                        }
                        {
                            tabValue === 2 && <CuriesTabPanel rows={latestCuries} setRows={setLatestCuries} curieValue={"latest"} headCells={headCells} numberOfVisibleCuries={numberOfVisibleCuries} onCurieAmountChange={handleCurieAmountChange} />
                        }
                    </Box>
                </Grid>
            </Box>
            <CurieEditorDialog open={openCurieEditor} handleClose={handleCloseCurieEditor} image={image} />
        </>
    );
}

export default CurieEditor;
