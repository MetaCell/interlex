import PropTypes from "prop-types";
import { useState, useCallback, useEffect, useContext } from "react";
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
import { elasticSearch } from "../../../api/endpoints";
import { vars } from "../../../theme/variables";

const { white, gray300, gray400, gray500, gray600 } = vars;

const TYPES = ["Term", "Relationship", "Ontology"];

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

const FirstStepContent = ({ term, type, existingIds, synonyms, handleTermChange, handleTypeChange, handleExistingIdChange, handleSynonymChange, handleDialogClose }) => {
    const [termResults, setTermResults] = useState([]);
    const [openSidebar, setOpenSidebar] = useState(true);
    const [loading, setLoading] = useState(false);
    const [hasExactMatch, setHasExactMatch] = useState(false);

    const [synonymOptions] = useState([]);
    const [idOptions] = useState([]);
    const { user, updateStoredSearchTerm } = useContext(GlobalDataContext);
    const navigate = useNavigate();

    const searchForMatches = useCallback(
        debounce(async (searchTerm, type) => {
            if (!searchTerm || !type) {
                setTermResults([]);
                setHasExactMatch(false);
                return;
            }

            setLoading(true);

            try {
                const response = await elasticSearch(searchTerm, 10);
                const rawResults = response.results.results || [];

                const filteredResults = rawResults.filter(result => {
                    return result.type === type.toLowerCase() ||
                        (result.type === "term") ||
                        (result.type === "relationship") ||
                        (result.type === "ontology");
                });

                const exactMatch = filteredResults.find(result =>
                    result.label?.toLowerCase() === searchTerm.toLowerCase() &&
                    result.type === type.toLowerCase()
                );

                setHasExactMatch(!!exactMatch);

                const sortedResults = filteredResults.sort((a, b) => {
                    const aIsExact = a.label?.toLowerCase() === searchTerm.toLowerCase();
                    const bIsExact = b.label?.toLowerCase() === searchTerm.toLowerCase();

                    if (aIsExact && !bIsExact) return -1;
                    if (!aIsExact && bIsExact) return 1;
                    return 0;
                });

                setTermResults(sortedResults);
            } catch (error) {
                setTermResults([]);
                setHasExactMatch(false);
            } finally {
                setLoading(false);
            }
        }, 500),
        []
    );

    const handleSidebarToggle = () => setOpenSidebar(!openSidebar);

    const navigateToExistingTerm = (searchResult) => {
        updateStoredSearchTerm(searchResult?.label);
        const groupName = user?.groupname || 'base';
        navigate(`/${groupName}/${searchResult?.ilx}/overview`);
        handleDialogClose();
    };

    const renderChips = (values, getTagProps, chipStyles) => {
        return values.map((option, index) => (
            <Chip
                key={index}
                label={option}
                deleteIcon={<CloseIcon />}
                sx={chipStyles}
                {...getTagProps({ index })}
            />
        ));
    };

    useEffect(() => {
        if (term && type) {
            searchForMatches(term, type);
        }
        return () => {
            searchForMatches.cancel();
            setHasExactMatch(false);
            setTermResults([])
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
    existingIds: PropTypes.array,
    synonyms: PropTypes.array,
    handleTermChange: PropTypes.func,
    handleTypeChange: PropTypes.func,
    handleExistingIdChange: PropTypes.func,
    handleSynonymChange: PropTypes.func,
    handleDialogClose: PropTypes.func,
};

export default FirstStepContent;