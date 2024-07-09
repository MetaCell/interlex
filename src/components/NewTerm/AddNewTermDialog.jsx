import * as React from "react";
import { Box, Divider, MobileStepper, Stack, Grid, Typography, Button } from "@mui/material";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AddIcon from '@mui/icons-material/Add';
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { vars } from "../../theme/variables";
import CustomizedDialog from "../common/CustomizedDialog";
import BasicTabs from "../common/CustomTabs";
import CustomButton from "../common/CustomButton";
import ManualImportTab from "./ManualImportTab";
import ImportFileTab from "./ImportFileTab";
import NewTermSidebar from "./NewTermSidebar";
import CustomizedInput from "../common/CustomizedInput";
import PredicateGroupInput from "../SingleTermView/OverView/PredicateGroupInput";
import * as mockApi from "../../api/endpoints/swaggerMockMissingEndpoints";
import { termParser } from "../../../src/parsers/termParser";
import { BackgroundPattern } from "../../Icons";
const useMockApi = () => mockApi;

const { gray100, gray200, gray400, gray600, gray800, gray900, brand700 } = vars;

const HeaderRightSideContent = ({ activeStep, onContinueClick, onClose, isContinueButtonDisabled }) => (
    <Box display='flex' alignItems='center'>
        {activeStep !== 2 ? (
            <>
                <MobileStepper
                    variant="dots"
                    steps={3}
                    position="static"
                    activeStep={activeStep}
                    sx={{
                        maxWidth: 64,
                        flexGrow: 1,
                        '& .MuiMobileStepper-dots': { gap: '0.75rem' },
                        '& .MuiMobileStepper-dot': { margin: 0, backgroundColor: gray200 },
                        '& .MuiMobileStepper-dotActive': { backgroundColor: brand700 }
                    }}
                />
                <Divider orientation="vertical" flexItem sx={{ m: '0 1rem' }} />
                <Stack direction="row" spacing={1.5}>
                    <CustomButton onClick={onClose}>Cancel</CustomButton>
                    <Button
                        onClick={onContinueClick}
                        disabled={isContinueButtonDisabled}
                        variant="contained"
                        endIcon={<ArrowForwardIcon />}
                        sx={{
                            padding: '0.625rem 0.875rem',
                            '&.Mui-disabled': { border: `1px solid ${gray200}`, color: gray400, backgroundColor: gray100 }
                        }}
                    >
                        Continue
                    </Button>
                </Stack>
            </>
        ) : (
            <Button variant="contained" onClick={onClose}>Finish</Button>
        )}
    </Box>
);

const AddNewTermDialog = ({ open, handleClose }) => {
    const { getMatchTerms } = useMockApi();
    const [termResults, setTermResults] = React.useState([]);
    const [activeStep, setActiveStep] = React.useState(0);
    const [tabValue, setTabValue] = React.useState(0);
    const [openSidebar, setOpenSidebar] = React.useState(false);
    const [areMatchesChecked, setAreMatchesChecked] = React.useState(false);
    const [predicates, setPredicates] = React.useState([{ subject: '', object: '' }]);
    const [termValue, setTermValue] = React.useState("");

    const handleChangeTabs = (_, newValue) => setTabValue(newValue);
    const handleAddPredicate = () => setPredicates([...predicates, { subject: '', object: '' }]);
    const handleContinueClick = () => setActiveStep(activeStep + 1);
    const handleSidebarToggle = () => setOpenSidebar(!openSidebar);
    const handleMatchesChange = (e) => setAreMatchesChecked(e.target.checked);
    const handleCloseAndActiveStep = () => { handleClose(); setActiveStep(0); };
    const handleDeletePredicate = (index) => setPredicates(predicates.filter((_, i) => i !== index));

    React.useEffect(() => {
        // Call endpoint to retrieve terms that match search word
        getMatchTerms("base", "i", { filter: "", value: "" }).then(data => {
            const parsedData = termParser(data, termValue)
            console.log("Parsed retrieved data: ", parsedData)
            setTermResults(parsedData.results)
        });
    }, [termValue]);

    const isResultsEmpty = termResults.length === 0;

    return (
        <CustomizedDialog
            title='Add a new term'
            open={open}
            handleClose={handleClose}
            HeaderRightSideContent={<HeaderRightSideContent activeStep={activeStep} onContinueClick={handleContinueClick} onClose={handleCloseAndActiveStep} isContinueButtonDisabled={!areMatchesChecked} />}
            sx={{ '& .MuiDialogContent-root': { padding: 0, overflowY: "hidden" } }}
        >
            {activeStep === 0 && (
                <Box display="flex" height={1}>
                    <Box sx={{ px: '3.25rem', pt: '1.75rem', pb: '2.5rem', flex: 1, overflowY: 'auto' }}>
                        <BasicTabs tabValue={tabValue} handleChange={handleChangeTabs} tabs={["Manually", "Import"]} />
                        {tabValue === 0 && <ManualImportTab handleSidebarOpen={() => setOpenSidebar(true)} matchesChecked={areMatchesChecked} handleMatchesChange={handleMatchesChange} isResultsEmpty={isResultsEmpty} setTermValue={setTermValue} />}
                        {tabValue === 1 && <ImportFileTab />}
                    </Box>
                    {tabValue === 0 && <NewTermSidebar open={openSidebar} onToggle={handleSidebarToggle} results={termResults} />}
                </Box>
            )}
            {activeStep === 1 && (
                <Box height={1} width={1} sx={{ padding: '2.25rem 3.25rem' }}>
                    <Typography color={gray800} fontSize='1.125rem' fontWeight={600} mb='2.75rem'>
                        Add Predicates to Central Nervous System
                    </Typography>
                    {predicates.map((predicate, index) => (
                        <Grid container key={index} spacing='2.75rem' mb='2rem' alignItems='end'>
                            <Grid item xs={12} lg={predicates.length > 1 ? 5 : 6}>
                                <PredicateGroupInput />
                            </Grid>
                            <Grid item xs={12} lg={3}>
                                <CustomizedInput value={predicate.subject} label='Subject' placeholder='Subject term' />
                            </Grid>
                            <Grid item xs={12} lg={3}>
                                <CustomizedInput value={predicate.object} label='Object' placeholder='Object term' />
                            </Grid>
                            {predicates.length > 1 && (
                                <Grid item lg={1}>
                                    <Button sx={{ padding: '.625rem', minWidth: 'auto' }} variant='outlined' onClick={() => handleDeletePredicate(index)}>
                                        <DeleteOutlineIcon />
                                    </Button>
                                </Grid>
                            )}
                        </Grid>
                    ))}
                    <Button variant="outlined" onClick={handleAddPredicate} startIcon={<AddIcon />}>Add a new relationship</Button>
                </Box>
            )}
            {activeStep === 2 && (
                <Box display='flex' flexDirection='column' justifyContent='center' alignItems='center' height='100%' position='relative'>
                    <Box sx={{
                        width: '30rem', height: '30rem', objectFit: 'cover',
                        position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -60%)', zIndex: 1
                    }}>
                        <BackgroundPattern />
                    </Box>
                    <Box display='flex' flexDirection='column' justifyContent='center' alignItems='center' zIndex={2} padding='2rem' sx={{
                        position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -10%)',
                    }}>
                        <Typography mt='1.25rem' mb='.75rem' color={gray900} fontSize='1.25rem' fontWeight={600}>
                            Term successfully created
                        </Typography>
                        <Typography mb='2rem' color={gray600} fontSize='1rem'>
                            Your term “Central nervous system” has been added. Click finish to go see the result, or add a new term.
                        </Typography>
                        <Box display='flex' gap='1rem'>
                            <Button type='text'>Undo</Button>
                            <Button startIcon={<AddOutlinedIcon />} variant='outlined' onClick={handleCloseAndActiveStep}>
                                Add a new term
                            </Button>
                        </Box>
                    </Box>
                </Box>
            )}
        </CustomizedDialog>
    );
};

export default AddNewTermDialog;
