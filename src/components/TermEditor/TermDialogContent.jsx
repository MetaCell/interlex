import * as React from "react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Box, Stack, Typography, Chip } from "@mui/material";
import AddPredicatesStep from "./AddPredicatesStep";
import TermStatusStep from "./TermStatusStep";
import TermForm from "./TermForm";
import TermSidebar from "./TermSidebar";
import * as mockApi from "../../api/endpoints/swaggerMockMissingEndpoints";
import { termParser } from "../../parsers/termParser";
import { debounce } from 'lodash';
import { vars } from "../../theme/variables";

const { success600, success700 } = vars;

const useMockApi = () => mockApi;

const TermDialogContent = ({ activeStep, searchTerm, onReset }) => {

    const { getMatchTerms } = useMockApi();
    const [loading, setLoading] = useState(true);
    const [openSidebar, setOpenSidebar] = useState(true);
    const [responseStatus, setResponseStatus] = useState('success')
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

    const fetchTerms = useCallback(
        debounce((searchTerm) => {
            setLoading(true);
            if (searchTerm) {
                getMatchTerms("base", searchTerm).then(data => {
                    const parsedData = termParser(data);
                    setData(parsedData?.results[0]);
                    setLoading(false);
                });
            }
        }, 300),
        [getMatchTerms]
    );

    const handleSidebarToggle = () => setOpenSidebar(!openSidebar);
    const handleUndoAction = () => { console.log("here connect to DELETE method") }
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
        if(activeStep === 2){
            console.log("POST: connect post method here and set response status")
        }
    }, [activeStep])

    const predicatesOptions = predicates.map(row => ({
        label: row.title,
        value: row.title
    }));

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
            {activeStep === 2 && <TermStatusStep showAddButton={false} responseStatus={responseStatus} termValue={searchTerm} onUndo={handleUndoAction} onAddNewTerm={onReset} />}
        </>
    )
}

export default TermDialogContent;