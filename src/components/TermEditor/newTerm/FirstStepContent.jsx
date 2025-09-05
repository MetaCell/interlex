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
import { elasticSearch } from "../../../api/endpoints";
import { vars } from "../../../theme/variables";
import { TYPES, DEFAULT_TYPE } from "../../../constants/types";

const { white, gray300, gray400, gray600, gray700 } = vars;

const styles = {
    autocomplete: {
        "& .MuiOutlinedInput-root": {
            background: white,
            borderColor: gray300,
            padding: "0.5rem 0.75rem !important"
        },
        "& .MuiOutlinedInput-root .MuiAutocomplete-input": {
            color: gray700,
            fontWeight: 400,
        },
        "& .MuiAutocomplete-popupIndicator": {
            transform: "none !important",
        },
        "& .MuiAutocomplete-tag": {
            background: "transparent",
        },
    },
    chip: {
        synonym: {
            flexDirection: "row !important",
            "& .MuiChip-deleteIcon": {
                color: `${gray400} !important`,
            },
        },
        id: {
            flexDirection: "row !important",
            borderRadius: "1rem !important",
            "& .MuiChip-deleteIcon": {
                color: `${gray400} !important`,
            },
        }
    },
    contentBox: {
        px: "3.25rem",
        pt: "1.75rem",
        pb: "2.5rem",
        flex: 1,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "2.75rem",
    }
};

const useTermSearch = (user, handleExactMatchChange) => {
    const [termResults, setTermResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const searchForMatches = useMemo(() =>
        debounce(async (searchTerm, searchType, synonyms = []) => {
            if (!searchTerm || !searchType) {
                setTermResults([]);
                handleExactMatchChange(false);
                return;
            }

            setLoading(true);

            try {
                try {
                    await checkPotentialMatches(user?.groupname || 'base', {
                        label: searchTerm,
                        'rdf-type': searchType,
                        exact: synonyms
                    });
                    handleExactMatchChange(false);
                } catch (error) {
                    if (error?.response?.status === 409 && error?.response?.data?.existing) {
                        handleExactMatchChange(true);
                    } else {
                        handleExactMatchChange(false);
                    }
                }

                const { results } = await elasticSearch(searchTerm);
                const similarResults = (results?.results || []).map(result => ({
                    ...result,
                    isExactMatch: false
                }));

                setTermResults(similarResults);
            } catch (error) {
                console.error("Term search error:", error);
                setTermResults([]);
                handleExactMatchChange(false);
            } finally {
                setLoading(false);
            }
        }, 500),
        [user, handleExactMatchChange]
    );

    return { termResults, loading, searchForMatches, setTermResults };
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
    const [openSidebar, setOpenSidebar] = useState(true);
    const { user, updateStoredSearchTerm } = useContext(GlobalDataContext);
    const navigate = useNavigate();

    const { termResults, loading, searchForMatches, setTermResults } = useTermSearch(user, handleExactMatchChange);

    const synonymOptions = useMemo(() => [], []);
    const idOptions = useMemo(() => [], []);

    const handleSidebarToggle = useCallback(() =>
        setOpenSidebar(prev => !prev), []);

    const navigateToExistingTerm = useCallback((searchResult) => {
        if (!searchResult?.label || !searchResult?.ilx) return;

        updateStoredSearchTerm(searchResult.label);
        const groupName = user?.groupname || 'base';
        navigate(`/${groupName}/${searchResult.ilx}/overview`);
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
        )), []);

    useEffect(() => {
        if (!term) {
            setTermResults([]);
            handleExactMatchChange(false);
            return;
        }
        if (term && type) {
            searchForMatches(term, type, synonyms);
        }
        return () => searchForMatches.cancel();
    }, [term, type, synonyms, searchForMatches, handleExactMatchChange, setTermResults]);


    return (
        <Box display="flex" height={1}>
            <Box sx={styles.contentBox}>
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
                        renderTags={(values, getTagProps) => renderChips(values, getTagProps, styles.chip.synonym)}
                        fullWidth
                        renderInput={(params) => <TextField {...params} placeholder="Enter exact synonym(s)" />}
                        sx={styles.autocomplete}
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
                        renderTags={(values, getTagProps) => renderChips(values, getTagProps, styles.chip.id)}
                        fullWidth
                        renderInput={(params) => <TextField {...params} placeholder="Type existing ID(s)" />}
                        sx={styles.autocomplete}
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
    type: PropTypes.oneOf(TYPES),
    hasExactMatch: PropTypes.bool,
    existingIds: PropTypes.arrayOf(PropTypes.string),
    synonyms: PropTypes.arrayOf(PropTypes.string),
    handleTermChange: PropTypes.func.isRequired,
    handleTypeChange: PropTypes.func.isRequired,
    handleExactMatchChange: PropTypes.func.isRequired,
    handleExistingIdChange: PropTypes.func.isRequired,
    handleSynonymChange: PropTypes.func.isRequired,
    handleDialogClose: PropTypes.func.isRequired,
};

FirstStepContent.defaultProps = {
    term: '',
    type: DEFAULT_TYPE,
    hasExactMatch: false,
    existingIds: [],
    synonyms: [],
};

export default FirstStepContent;