import { debounce } from 'lodash';
import TermForm from "./TermForm";
import PropTypes from 'prop-types';
import TermSidebar from "./TermSidebar";
import StatusStep from "../common/StatusStep";
import AddPredicatesStep from "./AddPredicatesStep";
import { elasticSearch } from "../../api/endpoints";
import { getTermStatusProps } from "./termStatusProps";
import { Box, Stack, Typography, Chip } from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { useState, useEffect, useMemo, useCallback } from "react";

import { vars } from "../../theme/variables";
const { success600, success700 } = vars;

const TermDialogContent = ({ activeStep, searchTerm, onReset }) => {
    const [loading, setLoading] = useState(true);
    const [openSidebar, setOpenSidebar] = useState(true);
    // eslint-disable-next-line no-unused-vars
    const [termValue, setTermValue] = useState(searchTerm);
    // eslint-disable-next-line no-unused-vars
    const [responseStatus, setResponseStatus] = useState({ success: true })
    const [predicates, setPredicates] = useState([{ subject: '', predicate: '', object: { type: 'Object', value: '', isLink: false } }])
    const [data, setData] = useState(null);
    const [formState, setFormState] = useState({
        label: searchTerm || '',
        age: '',
        synonyms: [],
        superclass: '',
        existingIds: [],
        urls: '',
        description: '',
        comment: ''
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const fetchTerms = useCallback(
        debounce(async(searchTerm) => {
            setLoading(true);
            if (searchTerm) {
                const data = await elasticSearch(searchTerm);
                setData(data);
                setLoading(false);
            } else {
                setLoading(false);
            }
        }, 300),
        []
    );

    const handleSidebarToggle = () => setOpenSidebar(!openSidebar);
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

    const handleAutocompleteChange = (name) => (event, value) => {
        setFormState((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    useEffect(() => {
        fetchTerms(searchTerm);
        return () => {
            fetchTerms.cancel();
        };
    }, [searchTerm, fetchTerms]);

    useEffect(() => {
        if (data) {
            setFormState((prevState) => ({
                ...prevState,
                synonyms: data.synonym || [],
                existingIds: data.existingID || [],
                description: data.description || ''
            }));
        }
    }, [data]);

    const memoData = useMemo(() => data, [data]);

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

    const predicatesOptions = predicates.map(row => ({
        label: row.title,
        value: row.title
    }));

    const statusProps = getTermStatusProps(responseStatus, searchTerm);

    return (
        <>
            {activeStep === 0 && (
                <Box display="flex" height={1}>
                    <Box sx={{ px: '3.25rem', pt: '1.75rem', pb: '2.5rem', flex: 1, overflowY: 'auto' }}>
                        <Stack direction="row" gap={1.5} alignItems="center">
                            <Typography variant="h5" sx={{ fontWeight: 500 }}>{searchTerm}</Typography>
                            <Chip
                                label="Active"
                                sx={{
                                    border: `1.5px solid ${success600}`,
                                    background: 'transparent',
                                    color: success700
                                }}
                            />
                        </Stack>
                        <TermForm
                            formState={formState}
                            data={memoData}
                            onInputChange={handleFormInputChange}
                            onAutocompleteChange={handleAutocompleteChange}
                        />
                    </Box>
                    <TermSidebar open={openSidebar} loading={loading} onToggle={handleSidebarToggle} data={memoData} />
                </Box>
            )}
            {activeStep === 1 && <AddPredicatesStep searchTerm={searchTerm} predicatesOptions={predicatesOptions} />}
            {/* {activeStep === 2 && <StatusStep showAddButton={false} responseStatus={responseStatus} termValue={searchTerm} onUndo={handleUndoAction} onAddNewTerm={onReset} />} */}
            {activeStep === 2 && (
                <StatusStep
                    statusProps={statusProps}
                    onAction={onReset}
                    onTryAgain={() => console.log("Try again")}
                    // onClose={handleCancelBtnClick}
                    actionButtonStartIcon={<AddOutlinedIcon />}
                />
            )}
        </>
    )
}

TermDialogContent.propTypes = {
    activeStep: PropTypes.number.isRequired,
    searchTerm: PropTypes.string.isRequired,
    onReset: PropTypes.func.isRequired
}

export default TermDialogContent;
