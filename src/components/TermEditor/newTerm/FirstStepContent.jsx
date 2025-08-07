import { useState, useCallback, useEffect } from "react"
import { debounce } from "lodash"
import { Box, Divider, Stack, Typography, Autocomplete, Chip, TextField } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import CustomSingleSelect from "../../common/CustomSingleSelect"
import CustomFormField from "../../common/CustomFormField"
import NewTermSidebar from "../NewTermSidebar"
import { HelpOutlinedIcon } from "../../../Icons"
import { elasticSearch } from "../../../api/endpoints"
import { vars } from "../../../theme/variables"

const { white, gray300, gray400, gray500, gray600 } = vars;

const TYPES = ["Term", "Relationship", "Ontology"]

const AUTOCOMPLETE_STYLES = {
    "& .MuiOutlinedInput-root": {
        background: white,
        borderColor: gray300,
    },
    "& .MuiOutlinedInput-root .MuiAutocomplete-input": {
        color: gray500,
        fontWeight: 400,
    },
    "& .MuiAutocomplete-popupIndicator": {
        transform: "none !important",
    },
    "& .MuiAutocomplete-tag": {
        background: "transparent",
    },
}

const SYNONYM_CHIP_STYLES = {
    flexDirection: "row !important",
    "& .MuiChip-deleteIcon": {
        color: `${gray400} !important`,
    },
}

const ID_CHIP_STYLES = {
    flexDirection: "row !important",
    borderRadius: "1rem !important",
    "& .MuiChip-deleteIcon": {
        color: `${gray400} !important`,
    },
}

const FirstStepContent = () => {
    const [termResults, setTermResults] = useState([]);
    const [exactSynonyms, setExactSynonyms] = useState([])
    const [existingIds, setExistingIds] = useState([])
    const [openSidebar, setOpenSidebar] = useState(true)
    const [selectedType, setSelectedType] = useState(null)
    const [termValue, setTermValue] = useState("")
    const [loading, setLoading] = useState(false);

    const [synonymOptions] = useState([])
    const [idOptions] = useState([])

    const fetchTerms = useCallback(
        debounce((searchTerm, type) => {
            if (!searchTerm && !type) {
                setTermResults([]);
                return;
            }

            setLoading(true);
            // it should be elastiSearch(searchTerm, type)
            elasticSearch(searchTerm)
                .then(data => {
                    setTermResults(data.results?.results || []);
                })
                .catch(error => {
                    console.error("Search error:", error);
                    setTermResults([]);
                })
                .finally(() => {
                    setLoading(false);
                });
        }, 500),
        []
    );

    const handleSynonymChange = (event, newValue) => {
        setExactSynonyms(newValue)
    }

    const handleExistingIdChange = (event, newValue) => {
        setExistingIds(newValue)
    }

    const handleTermValueChange = (event) => {
        const value = event.target.value;
        setTermValue(value);
    }

    const handleTypeChange = (newType) => {
        setSelectedType(newType);
    }

    const handleSidebarToggle = () => setOpenSidebar(!openSidebar);

    const renderChips = (values, getTagProps, chipStyles) => {
        return values.map((option, index) => (
            <Chip key={index} label={option} deleteIcon={<CloseIcon />} sx={chipStyles} {...getTagProps({ index })} />
        ))
    }

    const isResultsEmpty = termResults?.length === 0;

    useEffect(() => {
        fetchTerms(termValue, selectedType);
        return () => {
            fetchTerms.cancel();
        };
    }, [termValue, selectedType, fetchTerms]);

    return (
        <Box display="flex" height={1}>
            <Box
                sx={{
                    px: "3.25rem",
                    pt: "1.75rem",
                    pb: "2.5rem",
                    flex: 1,
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2.75rem",
                }}
            >
                <Stack spacing={0.5}>
                    <Typography variant="h6">How would you like to proceed?</Typography>
                    <Typography variant="body1" sx={{ color: gray600 }}>
                        Link this term to an existing source, either by reusing an existing ID or by specifying an exact synonym.
                    </Typography>
                </Stack>

                <Stack spacing={3}>
                    <Stack>
                        <Typography variant="h6" sx={{ fontWeight: 500 }}>
                            Exact synonyms
                        </Typography>
                        <Typography variant="body1" sx={{ color: gray600 }}>
                            Synonyms are especially useful when the term is known by different names. Please enter the type, label and
                            exact synonym(s) for your object.
                        </Typography>
                    </Stack>

                    <Stack direction="row" spacing={3}>
                        <CustomSingleSelect
                            isFormControlFullWidth={true}
                            options={TYPES}
                            placeholder="Select object type"
                            value={selectedType}
                            onChange={handleTypeChange}
                        />
                        <CustomFormField
                            placeholder="Term label (i.e. Central Nervous System)"
                            value={termValue}
                            onChange={handleTermValueChange}
                            isEndAdornmentVisible
                        />
                    </Stack>

                    <Autocomplete
                        multiple
                        id="exact-synonyms-autocomplete"
                        value={exactSynonyms}
                        onChange={handleSynonymChange}
                        popupIcon={<HelpOutlinedIcon />}
                        options={synonymOptions}
                        freeSolo
                        renderTags={(values, getTagProps) => renderChips(values, getTagProps, SYNONYM_CHIP_STYLES)}
                        fullWidth
                        renderInput={(params) => <TextField {...params} placeholder="Enter exact synonym(s)" />}
                        sx={AUTOCOMPLETE_STYLES}
                    />
                </Stack>

                <Divider />

                <Box>
                    <Stack sx={{ mb: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 500 }}>
                            Existing IDs
                        </Typography>
                        <Typography variant="body1" sx={{ color: gray600 }}>
                            Link to existing identifiers from external databases or ontologies.
                        </Typography>
                    </Stack>

                    <Autocomplete
                        multiple
                        id="existing-ids-autocomplete"
                        value={existingIds}
                        onChange={handleExistingIdChange}
                        popupIcon={<HelpOutlinedIcon />}
                        options={idOptions}
                        freeSolo
                        renderTags={(values, getTagProps) => renderChips(values, getTagProps, ID_CHIP_STYLES)}
                        fullWidth
                        renderInput={(params) => <TextField {...params} placeholder="Type existing ID(s)" />}
                        sx={AUTOCOMPLETE_STYLES}
                    />
                </Box>
            </Box>

            <NewTermSidebar
                open={openSidebar}
                loading={loading}
                onToggle={handleSidebarToggle}
                results={termResults}
                isResultsEmpty={isResultsEmpty}
                searchValue={termValue}
                selectedType={selectedType}
            />
        </Box>
    )
}

export default FirstStepContent;