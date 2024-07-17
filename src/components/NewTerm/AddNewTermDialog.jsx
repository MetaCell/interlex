import * as React from "react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Box, Divider, MobileStepper, Stack, Button } from "@mui/material";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { vars } from "../../theme/variables";
import CustomizedDialog from "../common/CustomizedDialog";
import BasicTabs from "../common/CustomTabs";
import CustomButton from "../common/CustomButton";
import ManualImportTab from "./ManualImportTab";
import ImportFileTab from "./ImportFileTab";
import NewTermSidebar from "./NewTermSidebar";
import AddPredicatesStep from "./AddPredicatesStep";
import TermStatusStep from "./TermStatusStep";
import * as mockApi from "../../api/endpoints/swaggerMockMissingEndpoints";
import * as mockApiInterlex from "../../api/endpoints/interLexURIStructureAPI";
import { termParser } from "../../../src/parsers/termParser";
import { debounce } from 'lodash';
const useMockApi = () => mockApi;
const useMockApiInterlex = () => mockApiInterlex;

const { gray100, gray200, gray400, brand700 } = vars;

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
    const { getEndpointsIlx } = useMockApiInterlex();
    const [loading, setLoading] = useState(true);
    const [termResults, setTermResults] = useState([]);
    const [activeStep, setActiveStep] = useState(0);
    const [tabValue, setTabValue] = useState(0);
    const [openSidebar, setOpenSidebar] = useState(true);
    const [areMatchesChecked, setAreMatchesChecked] = useState(false);
    const [data, setData] = useState(null);
    const [termValue, setTermValue] = useState('');
    const searchTerm = "brain"


    const memoData = useMemo(() => data, [data]);

    const fetchTerms = useCallback(
        debounce((searchTerm) => {
            if (searchTerm) {
                getEndpointsIlx("base", searchTerm).then(dat => {
                    const parsedData = termParser(dat);
                    setData(parsedData?.results[0]);
                    setLoading(false);
                });
            }
        }, 300),
        []
    );

    const handleChangeTabs = (_, newValue) => setTabValue(newValue);
    const handleContinueClick = () => setActiveStep(activeStep + 1);
    const handleSidebarToggle = () => setOpenSidebar(!openSidebar);
    const handleMatchesChange = (e) => setAreMatchesChecked(e.target.checked);
    const handleCloseAndActiveStep = () => { handleClose(); setActiveStep(0); };
    const [predicates, setPredicates] = React.useState([{ subject: '', predicate: '', object: { type: 'Object', value: '', isLink: false } }]);


    useEffect(() => {
        // Call endpoint to retrieve terms that match search word
        getMatchTerms("base", "i", { filter: "", value: "" }).then(data => {
            const parsedData = termParser(data, termValue)
            console.log("Parsed retrieved data: ", parsedData)
            setTermResults(parsedData.results)
        });
    }, [termValue]);

    useEffect(() => {
        setLoading(true);
        fetchTerms(searchTerm);
        return () => {
            fetchTerms.cancel();
        };
    }, [searchTerm, fetchTerms]);

    useEffect(() => {
        memoData?.predicates && setPredicates(memoData?.predicates)
    }, [memoData]);

    const predicatesOptions = predicates.map(row => ({
        label: row.title,
        value: row.title
    }))

    const isResultsEmpty = termResults.length === 0;
    console.log("memoData: ", memoData)

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
                    {tabValue === 0 && <NewTermSidebar open={openSidebar} onToggle={handleSidebarToggle} results={termResults} isResultsEmpty={isResultsEmpty} />}
                </Box>
            )}
            {activeStep === 1 && loading ? <>Loading...</> : <AddPredicatesStep predicatesOptions={predicatesOptions} />}
            {activeStep === 2 && <TermStatusStep handleCloseAndActiveStep={handleCloseAndActiveStep} />}
        </CustomizedDialog>
    );
};

export default AddNewTermDialog;
