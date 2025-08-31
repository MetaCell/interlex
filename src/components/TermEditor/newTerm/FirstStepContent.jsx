import PropTypes from "prop-types";
import { useState, useEffect, useContext, useMemo, useCallback } from "react";
import { debounce } from "lodash";
import {
    Box,
    Divider,
    Stack,
    Typography,
    Autocomplete,
    Chip,
    TextField
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { GlobalDataContext } from "../../../contexts/DataContext";
import CloseIcon from "@mui/icons-material/Close";
import CustomSingleSelect from "../../common/CustomSingleSelect";
import CustomFormField from "../../common/CustomFormField";
import NewTermSidebar from "../NewTermSidebar";
import { HelpOutlinedIcon } from "../../../Icons";
import { checkPotentialMatches } from "../../../api/endpoints/apiService";
import { vars } from "../../../theme/variables";

const { white, gray300, gray400, gray500, gray600 } = vars;

const TYPES = ['owl:Class', 'owl:AnnotationProperty', 'owl:ObjectProperty', 'TODO:CDE', 'TODO:FDE', 'TODO:PDE'];
const DEFAULT_TYPE = TYPES[0];

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
};

const SYNONYM_CHIP_STYLES = {
    flexDirection: "row !important",
    "& .MuiChip-deleteIcon": {
        color: `${gray400} !important`,
    },
};

const ID_CHIP_STYLES = {
    flexDirection: "row !important",
    borderRadius: "1rem !important",
    "& .MuiChip-deleteIcon": {
        color: `${gray400} !important`,
    },
};

const FirstStepContent = ({
    term,
    type,
    hasExactMatch,
    existingIds,
    synonyms,
    handleTermChange,
    handleTypeChange,
    handleExactMatchChange,
    handleExistingIdChange,
    handleSynonymChange,
    handleDialogClose
}) => {
    const [termResults, setTermResults] = useState([]);
    const [openSidebar, setOpenSidebar] = useState(true);
    const [loading, setLoading] = useState(false);

    const synonymOptions = useMemo(() => [], []);
    const idOptions = useMemo(() => [], []);

    const { user, updateStoredSearchTerm } = useContext(GlobalDataContext);
    const navigate = useNavigate();

    const searchForMatches = useMemo(() =>
        debounce(async (searchTerm, searchType) => {
            if (!searchTerm || !searchType) {
                setTermResults([]);
                handleExactMatchChange(false);
                return;
            }

            setLoading(true);

            const validType = TYPES.includes(searchType) ? searchType : DEFAULT_TYPE;

            try {
                await checkPotentialMatches(user?.groupname || 'base', {
                    "label": searchTerm,
                    "rdf-type": validType,
                    "exact": []
                });
            } catch (error) {
                if (error?.response?.status === 409 && error?.response?.data?.existing) {
                    const existingTerms = error.response.data.existing;
                    const results = [];

                    for (const [termUri, matches] of Object.entries(existingTerms)) {
                        const matchesArray = Array.isArray(matches) ? matches : [matches];

                        matchesArray.forEach(match => {
                            results.push({
                                ilx: termUri.split('/').pop(),
                                label: match.object,
                                predicateInfo: {
                                    existing: match.predicate_existing,
                                    submitted: match.predicate_submitted
                                }
                            });
                        });
                    }

                    handleExactMatchChange(true);
                    setTermResults(results);
                } else {
                    console.error("Non-conflict error:", error);
                    setTermResults([]);
                    handleExactMatchChange(false);
                }
            } finally {
                setLoading(false);
            }
        }, 500),
        [user]
    );

    const handleSidebarToggle = useCallback(() =>
        setOpenSidebar(prev => !prev)
        , []);

    const navigateToExistingTerm = useCallback((searchResult) => {
        updateStoredSearchTerm(searchResult?.label);
        const groupName = user?.groupname || 'base';
        navigate(`/${groupName}/${searchResult?.ilx}/overview`);
        handleDialogClose();
    }, [updateStoredSearchTerm, user, navigate, handleDialogClose]);

    const renderChips = useCallback((values, getTagProps, chipStyles) =>
        values.map((option, index) => (
            <Chip
                key={index}
                label={option}
                deleteIcon={<CloseIcon />}
                sx={chipStyles}
                {...getTagProps({ index })}
            />
        ))
        , []);

    useEffect(() => {
        if (term && type) {
            searchForMatches(term, type);
        }
        return () => {
            searchForMatches.cancel();
            handleExactMatchChange(false);
            setTermResults([]);
        };
    }, [term, type, searchForMatches]);

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
                            value={type}
                            onChange={handleTypeChange}
                        />
                        <CustomFormField
                            placeholder="Term label (i.e. Central Nervous System)"
                            value={term}
                            onChange={handleTermChange}
                            isEndAdornmentVisible
                            errorMessage={hasExactMatch ? "Your label has an exact match." : null}
                        />
                    </Stack>

                    <Autocomplete
                        multiple
                        id="exact-synonyms-autocomplete"
                        value={synonyms}
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
                isResultsEmpty={termResults.length === 0}
                searchValue={term}
                onResultAction={navigateToExistingTerm}
            />
        </Box>
    );
};

FirstStepContent.propTypes = {
    term: PropTypes.string,
    type: PropTypes.string,
    hasExactMatch: PropTypes.bool,
    existingIds: PropTypes.array,
    synonyms: PropTypes.array,
    handleTermChange: PropTypes.func,
    handleTypeChange: PropTypes.func,
    handleExactMatchChange: PropTypes.func,
    handleExistingIdChange: PropTypes.func,
    handleSynonymChange: PropTypes.func,
    handleDialogClose: PropTypes.func,
};

export default FirstStepContent;