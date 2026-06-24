import PropTypes from "prop-types";
import { useState, useContext } from "react";
import {
    Box,
    Divider,
    Stack,
    Typography,
    Autocomplete,
    TextField,
    Chip
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { GlobalDataContext } from "../../../contexts/DataContext";
import CustomSingleSelect from "../../common/CustomSingleSelect";
import CustomFormField from "../../common/CustomFormField";
import NewTermSidebar from "../NewTermSidebar";
import { HelpOutlinedIcon } from "../../../Icons";
import CloseIcon from "@mui/icons-material/Close";
import { vars } from "../../../theme/variables";
import { TYPES, DEFAULT_TYPE } from "../../../constants/types";
import { useTermSearch } from "../../../hooks/useTermSearch";

const { white, gray300, gray400, gray500, gray600, error500 } = vars;

const styles = {
    contentBox: {
        px: "3.25rem",
        pt: "1.75rem",
        pb: "2.5rem",
        flex: 1,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "2.75rem",
    },
    autocomplete: {
        "& .MuiOutlinedInput-root": {
            background: white,
            borderColor: gray300,
            padding: "0.5rem 0.75rem !important"
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
    },
    chip: {
        synonym: {
            flexDirection: "row !important",
            "& .MuiChip-deleteIcon": {
                color: `${gray400} !important`,
            },
        },
        synonymExactMatch: {
            flexDirection: "row !important",
            border: `1px solid ${error500} !important`,
            color: `${error500} !important`,
            "& .MuiChip-deleteIcon": {
                color: `${error500} !important`,
            },
        },
        id: {
            flexDirection: "row !important",
            borderRadius: "1rem !important",
            "& .MuiChip-deleteIcon": {
                color: `${gray400} !important`,
            },
        },
    },
};

const FirstStepContent = ({ term, type, existingIds, synonyms, isEditing, handleTermChange, handleTypeChange, handleExistingIdChange, handleSynonymChange, handleExactMatchChange, handleDialogClose }) => {
    const [openSidebar, setOpenSidebar] = useState(true);
    const { user, updateStoredSearchTerm } = useContext(GlobalDataContext);
    const navigate = useNavigate();

    const { loading, searchResults, displayedValue, exactMatchValues } = useTermSearch({
        term,
        type,
        synonyms,
        isEditing,
        onExactMatchChange: handleExactMatchChange,
    });

    const exactMatchSet = new Set((exactMatchValues || []).map((value) => value.toLowerCase()));

    const handleSidebarToggle = () => setOpenSidebar(!openSidebar);

    const handleResultSelect = (searchResult) => {
        updateStoredSearchTerm(searchResult?.label);
        const groupName = user?.groupname || 'base';
        navigate(`/${groupName}/${searchResult?.ilx}/overview`);
        handleDialogClose();
    };

    const renderChips = (values, getTagProps, chipStyles, exactMatchStyles) => {
        return values.map((option, index) => {
            const isExactMatch =
                exactMatchStyles &&
                typeof option === "string" &&
                exactMatchSet.has(option.trim().toLowerCase());
            return (
                <Chip
                    key={index}
                    label={option}
                    deleteIcon={<CloseIcon />}
                    sx={isExactMatch ? exactMatchStyles : chipStyles}
                    {...getTagProps({ index })}
                />
            );
        });
    };

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
                        />
                    </Stack>

                    <Autocomplete
                        multiple
                        id="exact-synonyms-autocomplete"
                        value={synonyms}
                        onChange={handleSynonymChange}
                        popupIcon={<HelpOutlinedIcon />}
                        options={[]}
                        freeSolo
                        renderTags={(values, getTagProps) => renderChips(values, getTagProps, styles.chip.synonym, styles.chip.synonymExactMatch)}
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
                        options={[]}
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
                results={searchResults}
                isResultsEmpty={searchResults.length === 0}
                searchValue={displayedValue || term}
                onResultAction={handleResultSelect}
                user={user}
                selectedTerm={displayedValue || term}
            />
        </Box>
    )
}

FirstStepContent.propTypes = {
    term: PropTypes.string,
    type: PropTypes.oneOf(TYPES),
    existingIds: PropTypes.arrayOf(PropTypes.string),
    synonyms: PropTypes.arrayOf(PropTypes.string),
    isEditing: PropTypes.bool,
    handleTermChange: PropTypes.func.isRequired,
    handleTypeChange: PropTypes.func.isRequired,
    handleExactMatchChange: PropTypes.func.isRequired,
    handleExistingIdChange: PropTypes.func.isRequired,
    handleSynonymChange: PropTypes.func.isRequired,
    handleDialogClose: PropTypes.func.isRequired,
    onTermSelect: PropTypes.func,
}

FirstStepContent.defaultProps = {
    term: "",
    type: DEFAULT_TYPE,
    existingIds: [],
    synonyms: [],
    isEditing: false,
}

export default FirstStepContent
