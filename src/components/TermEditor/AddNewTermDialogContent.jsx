import { debounce } from 'lodash';
import PropTypes from "prop-types";
import { Box } from "@mui/material";
import ImportFileTab from "./ImportFileTab";
import BasicTabs from "../common/CustomTabs";
import { addTerm } from "../../api/endpoints";
import NewTermSidebar from "./NewTermSidebar";
import StatusStep from "../common/StatusStep";
import { useNavigate } from "react-router-dom";
import ManualImportTab from "./ManualImportTab";
import AddPredicatesStep from "./AddPredicatesStep";
import { getAddTermStatusProps } from "./termStatusProps";
import { termParser } from "../../../src/parsers/termParser";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { getExistingIDs, getUser } from "../../api/endpoints";
import { useState, useEffect, useMemo, useCallback } from "react";
import * as mockApi from "../../api/endpoints/swaggerMockMissingEndpoints";
import * as mockApiInterlex from "../../api/endpoints/interLexURIStructureAPI";

import { vars } from "../../theme/variables";
const { gray800, gray700 } = vars;

const useMockApi = () => mockApi;
const useMockApiInterlex = () => mockApiInterlex;

const initialFormState = {
    label: "",
    synonyms: [],
    superClass: "",
    existingIDs: [],
    isDefinedBy: "",
    description: "",
    comment: ""
}

const formatIdText = (termId) => {
    const [prefix, suffix] = termId.split('_');
    return (
        <div>
            <span style={{ fontSize: '1rem', fontWeight: 500, color: gray800 }}>
                {prefix.toUpperCase()}:
            </span>
            <span style={{ fontSize: '1rem', fontWeight: 400, color: gray700 }}>
                {suffix}
            </span>
        </div>
    );
}

const AddNewTermDialogContent = ({ activeStep, areMatchesChecked, onMatchesChange, onReset }) => {

    const { getMatchTerms } = useMockApi();
    const { getEndpointsIlx } = useMockApiInterlex();
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
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
    const [newTermId, setNewTermId] = useState("");

    const memoData = useMemo(() => data, [data]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const addTermRequest = useCallback(async (group, term) => {
        await addTerm("base", term).then((response) => {
            console.log("Term added ", response)
            setNewTermId(response.term.id.split("/").pop())
        })
            .catch((error) => {
                console.log("Error ", error)
            });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [addTerm]);

    const handleChangeTabs = (_, newValue) => setTabValue(newValue);
    const handleSidebarToggle = () => setOpenSidebar(!openSidebar);
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

    const handleExistingIDsChange = (event, value) => {
        setFormState((prevState) => ({
            ...prevState,
            existingIDs: value
        }));
    };

    const handleSynonymsChange = (value) => {
        setFormState((prevState) => ({
            ...prevState,
            synonyms: value
        }));
    }

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

    const handleGoToTermClick = () => {
        navigate(`/view?searchTerm=${termValue.charAt(0).toUpperCase() + termValue.slice(1)}`);
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const getIds = useCallback(debounce(async () => {
        const ids = await getExistingIDs();
        setIds(ids)
    }), [getUser]);

    useEffect(() => {
        getIds();
    }, [getIds]);

    useEffect(() => {
        if (activeStep === 2) {
            addTermRequest("base", formState)
        }
    }, [addTermRequest, formState, activeStep]);

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
                // should be success: false, but true for now so we can wee success status message
                setResponseStatus({ success: true, error: error.message });
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
    const isLabelEmpty = formState.label === "";
    // eslint-disable-next-line no-unused-vars
    const isContinueButtonDisabled = !areMatchesChecked || isLabelEmpty
    const formattedNewTermId = formatIdText(newTermId);


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
                                existingIDsOptions={ids}
                                onExistingIDsChange={handleExistingIDsChange}
                                onSynonymsChange={handleSynonymsChange}
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
                onClose={handleGoToTermClick}
                actionButtonStartIcon={<AddOutlinedIcon />}
                additionalInfo={formattedNewTermId}
            />}
        </>
    );
};

AddNewTermDialogContent.propTypes = {
    activeStep: PropTypes.number.isRequired,
    areMatchesChecked: PropTypes.bool.isRequired,
    onMatchesChange: PropTypes.func.isRequired,
    onReset: PropTypes.func.isRequired
};

export default AddNewTermDialogContent;
