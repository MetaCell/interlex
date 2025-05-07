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
import { getEndpointsIlx, elasticSearch } from './../../api/endpoints/index';
import { GlobalDataContext } from "../../contexts/DataContext";
import { useContext } from "react";

import { vars } from "../../theme/variables";
const { gray800, gray700 } = vars;

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

    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [termResults, setTermResults] = useState([]);
    const [tabValue, setTabValue] = useState(0);
    const [openSidebar, setOpenSidebar] = useState(true);
    const [data, setData] = useState(null);
    const [responseStatus] = useState(null)
    const [termValue, setTermValue] = useState('');
    const [ids, setIds] = useState([]);
    const [predicates, setPredicates] = useState([{ subject: '', predicate: '', object: { type: 'Object', value: '', isLink: false } }]);
    const [files, setFiles] = useState([]);
    const [url, setUrl] = useState('');
    const [formState, setFormState] = useState(initialFormState);
    const [newTermId, setNewTermId] = useState("");
    const { user } = useContext(GlobalDataContext);

    const memoData = useMemo(() => data, [data]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const fetchTerms = useCallback(
        debounce((termValue) => {
            setLoading(true);
            if (termValue) {
                getEndpointsIlx("base", termValue).then(data => {
                    setLoading(false);
                    const parsedData = termParser(data);
                    setData(parsedData?.results[0]);
                });
            } else {
                elasticSearch("a").then(data => {
                    setTermResults(data.results);
                    setLoading(false);
                });
            }
        }, 300),
        [getEndpointsIlx, elasticSearch]
    );

    const addTermRequest = useCallback(async (group, term) => {
        const token = localStorage.getItem("appToken")
        const groupName = user?.name || group
        await addTerm(groupName, token, term).then((response) => {
            setNewTermId(response.term.id.split("/").pop())
        })
            .catch((error) => {
                console.log("Error ", error)
            });
    }, [user]);

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
        elasticSearch(termValue).then(data => {
            setTermResults(data.results);
            setLoading(false);
        });
    }, [termValue]);

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
    const getIds = useCallback(debounce(async (termValue) => {
        const ids = await getExistingIDs(termValue || "a");
        setIds(ids)
    }), [getUser]);

    useEffect(() => {
        getIds(termValue);
    }, [termValue,getIds]);

    useEffect(() => {
        if (activeStep === 2) {
            addTermRequest("base", formState)
        }
    }, [addTermRequest, formState, activeStep]);

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
                onTryAgain={handleAddNewTerm}
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
