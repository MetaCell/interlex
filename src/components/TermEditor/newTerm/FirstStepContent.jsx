import PropTypes from "prop-types";
import React, { useState, useContext, useCallback, useMemo, useEffect } from "react";
import {
    Box,
    Divider,
    Stack,
    Typography,
    Autocomplete,
    TextField,
    Chip
} from "@mui/material";
import { GlobalDataContext } from "../../../contexts/DataContext";
import CustomSingleSelect from "../../common/CustomSingleSelect";
import CustomFormField from "../../common/CustomFormField";
import NewTermSidebar from "../NewTermSidebar";
import { HelpOutlinedIcon } from "../../../Icons";
import CloseIcon from "@mui/icons-material/Close";
import { vars } from "../../../theme/variables";
import { TYPES, DEFAULT_TYPE } from "../../../constants/types";
import { useTermSearch } from "../../../hooks/useTermSearch";

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
        synonymWarning: {
            flexDirection: "row !important",
            border: `1px solid ${vars.warning300} !important`,
            background: `${vars.warning50} !important`,
            color: `${vars.warning700} !important`,
            "& .MuiChip-deleteIcon": {
                color: `${vars.warning500} !important`,
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

const FirstStepContent = ({
    term,
    type,
    hasExactMatch,
    existingIds,
    synonyms,
    isEditing,
    handleTermChange,
    handleTypeChange,
    handleExactMatchChange,
    handleExistingIdChange,
    handleSynonymChange,
    onTermSelect,
    onAnySynonymMatchChange,
}) => {
    const [openSidebar, setOpenSidebar] = useState(true);
    const { user } = useContext(GlobalDataContext);

    const {
        loading,
        searchResults,
        getSynonymStatus,
        hasAnySynonymMatch,
        clearSynonymValidation
    } = useTermSearch({
        term,
        type,
        synonyms,
        isEditing,
        onExactMatchChange: handleExactMatchChange,
    });

    // Notify parent about synonym match changes
    useEffect(() => {
        if (onAnySynonymMatchChange) {
            onAnySynonymMatchChange(hasAnySynonymMatch);
        }
    }, [hasAnySynonymMatch, onAnySynonymMatchChange]);

    const handleEnhancedSynonymChange = useCallback((event, newValue, reason, details) => {
        if (reason === 'removeOption' && details?.option) {
            clearSynonymValidation(details.option);
        }
        handleSynonymChange(event, newValue, reason, details);
    }, [handleSynonymChange, clearSynonymValidation]);

    const handleSidebarToggle = useCallback(() => {
        setOpenSidebar(prev => !prev);
    }, []);

    const handleResultSelect = useCallback((result) => {
        if (!result?.label) return;

        handleTermChange(result.label);
        if (onTermSelect) {
            onTermSelect(result);
        }
    }, [handleTermChange, onTermSelect]);

    // Chip renderers
    const renderSynonymChips = useMemo(() => (values, getTagProps) =>
        values.map((option, index) => {
            const synonymStatus = getSynonymStatus(option);
            const hasWarning = synonymStatus.hasMatch;
            const chipStyles = hasWarning ? styles.chip.synonymWarning : styles.chip.synonym;

            return (
                <Chip
                    key={index}
                    label={option}
                    deleteIcon={<CloseIcon />}
                    sx={chipStyles}
                    {...getTagProps({ index })}
                />
            );
        }), [getSynonymStatus]);

    const renderIdChips = useMemo(() => (values, getTagProps) =>
        values.map((option, index) => (
            <Chip
                key={index}
                label={option}
                deleteIcon={<CloseIcon />}
                sx={styles.chip.id}
                {...getTagProps({ index })}
            />
        )), []);

    return (
        <Box display="flex" height={1}>
            <Box sx={styles.contentBox}>
                {/* Header Section */}
                <Stack spacing={0.5}>
                    <Typography variant="h6">
                        How would you like to proceed?
                    </Typography>
                    <Typography variant="body1" sx={{ color: gray600 }}>
                        Link this term to an existing source, either by reusing an existing ID or by specifying an exact synonym.
                    </Typography>
                </Stack>

                {/* Synonyms Section */}
                <Stack spacing={3}>
                    <Stack>
                        <Typography variant="h6" sx={{ fontWeight: 500 }}>
                            Exact synonyms
                        </Typography>
                        <Typography variant="body1" sx={{ color: gray600 }}>
                            Synonyms are especially useful when the term is known by different names. Please enter the type, label and exact synonym(s) for your object.
                        </Typography>
                    </Stack>

                    {/* Type and Term Input */}
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

                    {/* Synonyms Autocomplete */}
                    <Autocomplete
                        multiple
                        id="exact-synonyms-autocomplete"
                        value={synonyms}
                        onChange={handleEnhancedSynonymChange}
                        popupIcon={<HelpOutlinedIcon />}
                        options={[]}
                        freeSolo
                        renderTags={renderSynonymChips}
                        fullWidth
                        renderInput={(params) => 
                            <TextField {...params} placeholder="Enter exact synonym(s)" />
                        }
                        sx={styles.autocomplete}
                    />
                </Stack>

                <Divider />

                {/* Existing IDs Section */}
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
                        options={[]}
                        freeSolo
                        renderTags={renderIdChips}
                        fullWidth
                        renderInput={(params) => 
                            <TextField {...params} placeholder="Type existing ID(s)" />
                        }
                        sx={styles.autocomplete}
                    />
                </Box>
            </Box>

            <NewTermSidebar
                open={openSidebar}
                loading={loading}
                onToggle={handleSidebarToggle}
                results={searchResults}
                isResultsEmpty={searchResults.length === 0}
                searchValue={term}
                onResultAction={handleResultSelect}
                user={user}
                selectedTerm={term}
                hasAnySynonymMatch={hasAnySynonymMatch}
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
    isEditing: PropTypes.bool,
    handleTermChange: PropTypes.func.isRequired,
    handleTypeChange: PropTypes.func.isRequired,
    handleExactMatchChange: PropTypes.func.isRequired,
    handleExistingIdChange: PropTypes.func.isRequired,
    handleSynonymChange: PropTypes.func.isRequired,
    onTermSelect: PropTypes.func,
    onAnySynonymMatchChange: PropTypes.func,
};

FirstStepContent.defaultProps = {
    term: "",
    type: DEFAULT_TYPE,
    hasExactMatch: false,
    existingIds: [],
    synonyms: [],
};

export default FirstStepContent;
