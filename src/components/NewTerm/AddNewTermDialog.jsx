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
import { getExistingIDs } from "../../api/endpoints";
import { debounce } from 'lodash';

const useMockApi = () => mockApi;
const useMockApiInterlex = () => mockApiInterlex;

const { gray100, gray200, gray400, brand700 } = vars;

const HeaderRightSideContent = ({ activeStep, onContinue, onClose, isContinueButtonDisabled }) => (
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
                        onClick={onContinue}
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
    const [responseStatus, setResponseStatus] = useState('success')
    const [termValue, setTermValue] = useState('');
    const [ids, setIds] = useState([]);
    const [predicates, setPredicates] = useState([{ subject: '', predicate: '', object: { type: 'Object', value: '', isLink: false } }]);
    const [files, setFiles] = useState([]);
    const [url, setUrl] = useState('');
    const [formState, setFormState] = useState({
        label: '',
        ilx: "ILX:0101901",
        age: '',
        synonyms: '',
        superclass: '',
        existingId: null,
        urls: '',
        description: '',
        comment: ''
    });

    const memoData = useMemo(() => data, [data]);

    const fetchTerms = useCallback(
        debounce((termValue) => {
            setLoading(true);
            if (termValue) {
                getEndpointsIlx("base", termValue).then(data => {
                    const parsedData = termParser(data);
                    setData(parsedData?.results[0]);
                    setLoading(false);
                });
            } else {
                getMatchTerms("base", "i", { filter: "", value: "" }).then(data => {
                    const parsedData = termParser(data, "");
                    setTermResults(parsedData.results);
                    setLoading(false);
                });
            }
        }, 300),
        [getEndpointsIlx, getMatchTerms]
    );

    const handleChangeTabs = (_, newValue) => setTabValue(newValue);
    const handleContinueClick = () => {
        setActiveStep(activeStep + 1);
        if (activeStep === 2) {
            console.log("POST: here connect to post request")
            //here we change status as well according to api response
        }
    }
    const handleSidebarToggle = () => setOpenSidebar(!openSidebar);
    const handleMatchesChange = (e) => setAreMatchesChecked(e.target.checked);
    const handleCancelBtnClick = () => { handleClose(); setActiveStep(0); setAreMatchesChecked(false); };
    const handleAddNewTerm = () => { setActiveStep(0); setAreMatchesChecked(false); };
    const handleFormInputChange = (e) => {
        const { name, value } = e.target;
        console.log("main value: ", value)
        if (name === "label") {
            setTermValue(e.target.value);
        }
        setFormState((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleAutocompleteChange = (event, value) => {
        setFormState((prevState) => ({
            ...prevState,
            existingId: value
        }));
    };

    const handleChangeUrl = (event) => {
        setUrl(event.target.value);
    }

    const handleFilesSelected = (newFiles) => {
        const updatedFiles = newFiles.map(file => ({
            name: file.name,
            size: (file.size / 1024).toFixed(2), // convert bytes to KB
            progress: 100 // assuming the file upload is completed for now
        }));
        setFiles(updatedFiles);
    }

    useEffect(() => {
        getMatchTerms("base", "i", { filter: "", value: "" }).then(data => {
            const parsedData = termParser(data, termValue);
            setTermResults(parsedData.results);
        });
    }, [termValue, getMatchTerms]);

    useEffect(() => {
        fetchTerms(termValue);
        return () => {
            fetchTerms.cancel();
        };
    }, [termValue, fetchTerms]);

    useEffect(() => {
        if (memoData?.predicates) {
            setPredicates(memoData.predicates);
        }
    }, [memoData]);

    const fetchIds = async () => {
        const ids = await getExistingIDs();
        setIds(ids);
        console.log("getExistingIDs ", ids)
    }

    useEffect(() => {
        if (ids.length > 0) return;
        fetchIds()
    }, [fetchIds])

    const predicatesOptions = predicates.map(row => ({
        label: row.title,
        value: row.title
    }));

    const isResultsEmpty = termResults.length === 0;

    return (
        <CustomizedDialog
            title='Add a new term'
            open={open}
            handleClose={handleClose}
            HeaderRightSideContent={
                <HeaderRightSideContent
                    activeStep={activeStep}
                    onContinue={handleContinueClick}
                    onClose={handleCancelBtnClick}
                    isContinueButtonDisabled={!areMatchesChecked}
                />
            }
            sx={{ '& .MuiDialogContent-root': { padding: 0, overflowY: "hidden" } }}
        >
            {activeStep === 0 && (
                <Box display="flex" height={1}>
                    <Box sx={{ px: '3.25rem', pt: '1.75rem', pb: '2.5rem', flex: 1, overflowY: 'auto' }}>
                        <BasicTabs tabValue={tabValue} handleChange={handleChangeTabs} tabs={["Manually", "Import"]} />
                        {tabValue === 0 && (
                            <ManualImportTab
                                formState={formState}
                                onInputChange={handleFormInputChange}
                                handleSidebarOpen={() => setOpenSidebar(true)}
                                matchesChecked={areMatchesChecked}
                                handleMatchesChange={handleMatchesChange}
                                isResultsEmpty={isResultsEmpty}
                                existingIdsOptions={ids}
                                onExistingIdChange={handleAutocompleteChange}
                            />
                        )}
                        {tabValue === 1 && <ImportFileTab files={files} url={url} onFilesChange={handleFilesSelected} onChangeUrl={handleChangeUrl} />}
                    </Box>
                    {tabValue === 0 && <NewTermSidebar open={openSidebar} onToggle={handleSidebarToggle} results={termResults} isResultsEmpty={isResultsEmpty} />}
                </Box>
            )}
            {activeStep === 1 && <AddPredicatesStep termValue={termValue.charAt(0).toUpperCase() + termValue.slice(1)} predicatesOptions={predicatesOptions} />}
            {activeStep === 2 && <TermStatusStep responseStatus={responseStatus} termValue={termValue.charAt(0).toUpperCase() + termValue.slice(1)} onAddNewTerm={handleAddNewTerm} />}
        </CustomizedDialog>
    );
};

export default AddNewTermDialog;
