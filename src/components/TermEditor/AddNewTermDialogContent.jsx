import * as React from "react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Box } from "@mui/material";
import BasicTabs from "../common/CustomTabs";
import ManualImportTab from "./ManualImportTab";
import ImportFileTab from "./ImportFileTab";
import NewTermSidebar from "./NewTermSidebar";
import AddPredicatesStep from "./AddPredicatesStep";
import StatusStep from "../common/StatusStep";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { getAddTermStatusProps } from "./termStatusProps";
import * as mockApi from "../../api/endpoints/swaggerMockMissingEndpoints";
import * as mockApiInterlex from "../../api/endpoints/interLexURIStructureAPI";
import { termParser } from "../../parsers/termParser";
import { getExistingIDs } from "../../api/endpoints";
import { debounce } from 'lodash';

const useMockApi = () => mockApi;
const useMockApiInterlex = () => mockApiInterlex;

const initialFormState = {
    label: '',
    age: '',
    synonyms: '',
    superclass: '',
    existingId: null,
    urls: '',
    description: '',
    comment: ''
}

const AddNewTermDialogContent = ({ activeStep, areMatchesChecked, onMatchesChange, onReset }) => {

    const { getMatchTerms } = useMockApi();
    const { getEndpointsIlx } = useMockApiInterlex();
    const [loading, setLoading] = useState(true);
    const [termResults, setTermResults] = useState([]);
    const [tabValue, setTabValue] = useState(0);
    const [openSidebar, setOpenSidebar] = useState(true);
    const [data, setData] = useState(null);
    const [responseStatus, setResponseStatus] = useState(null)
    const [termValue, setTermValue] = useState('');
    const [ids, setIds] = useState([]);
    const [predicates, setPredicates] = useState([{ subject: '', predicate: '', object: { type: 'Object', value: '', isLink: false } }]);
    const [files, setFiles] = useState([]);
    const [url, setUrl] = useState('');
    const [formState, setFormState] = useState(initialFormState);

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
    const handleSidebarToggle = () => setOpenSidebar(!openSidebar);
    const handleUndoAction = () => { console.log("here connect to DELETE method") }
    const handleAddNewTerm = () => {
        onReset();
        setTermValue('');
        setIds([]);
        setFormState(initialFormState)
    }
    const handleFormInputChange = (e) => {
        const { name, value } = e.target;
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

    useEffect(() => {
        if (activeStep === 2) {
            console.log("POST: connect post method here and set response status")
        }
    }, [activeStep])

    const fetchIds = async () => {
        const ids = await getExistingIDs();
        setIds(ids);
        console.log("getExistingIDs ", ids)
    }

    useEffect(() => {
        if (ids.length > 0) return;
        fetchIds()
    }, [fetchIds])

    //can be deleted, use only for testing purposes
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/some-endpoint');
                if (!response.ok) {
                    throw new Error('HTTP error');
                }
                const data = await response.json();
                setResponseStatus({ success: true, data });
            } catch (error) {
                setResponseStatus({ success: false, error: error.message });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);


    const predicatesOptions = predicates.map(row => ({
        label: row.title,
        value: row.title
    }));

    const isResultsEmpty = termResults.length === 0;

    const statusProps = getAddTermStatusProps(responseStatus, termValue);

    return (
        <>
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
                                handleMatchesChange={onMatchesChange}
                                isResultsEmpty={isResultsEmpty}
                                existingIdsOptions={ids}
                                onExistingIdChange={handleAutocompleteChange}
                            />
                        )}
                        {tabValue === 1 && <ImportFileTab files={files} url={url} onFilesChange={handleFilesSelected} onChangeUrl={handleChangeUrl} />}
                    </Box>
                    {tabValue === 0 && <NewTermSidebar open={openSidebar} loading={loading} onToggle={handleSidebarToggle} results={termResults} isResultsEmpty={isResultsEmpty} />}
                </Box>
            )}
            {activeStep === 1 && <AddPredicatesStep termValue={termValue.charAt(0).toUpperCase() + termValue.slice(1)} predicatesOptions={predicatesOptions} />}
            {activeStep === 2 && <StatusStep
                statusProps={statusProps}
                onAction={handleAddNewTerm}
                onTryAgain={() => console.log("Try again")}
                onClose={handleCancelBtnClick}
                actionButtonStartIcon={<AddOutlinedIcon />}
            />}
        </>
    );
};

export default AddNewTermDialogContent;