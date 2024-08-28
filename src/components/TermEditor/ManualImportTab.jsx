import React from "react";
import { Box, Grid, Button, FormControlLabel } from "@mui/material";
import CustomInputBox from "../common/CustomInputBox";
import Checkbox from "../common/CustomCheckbox";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { vars } from "../../theme/variables";
import ExistingIdsSearch from "./ExistingIdsSearch";
import CustomAutocompleteBox from "../common/CustomAutocompleteBox";

const { gray600, brand700, brand800 } = vars;

const ManualImportTab = ({ formState, onInputChange, handleSidebarOpen, matchesChecked, handleMatchesChange, isResultsEmpty, existingIDsOptions, onExistingIDsChange, onSynonymsChange }) => {

    return (
        <Box component="form" sx={{ width: '100%', mt: '2.75rem', display: 'flex', flexDirection: 'column', gap: '2.75rem' }} noValidate autoComplete="off">
            <Grid container spacing={5.5}>
                <Grid item xs={12}>
                    <CustomInputBox
                        id="new-term-label-field"
                        name="label"
                        value={formState.label}
                        onInputChange={onInputChange}
                        label="Label"
                        isRequired
                        helperText={"Label of your term."}
                        placeholder={"Enter your term label"}
                        isEndAdornmentVisible
                    />
                    <Button
                        variant="text"
                        sx={{ mt: 1, p: 0, height: '1.25rem', color: brand700, '&:hover': { color: brand800, backgroundColor: 'transparent' } }}
                        endIcon={<ArrowForwardIcon />}
                        onClick={handleSidebarOpen}
                    >
                        Go check potential matches
                    </Button>
                </Grid>
            </Grid>
            <Box>
                <CustomAutocompleteBox
                    value={formState.synonyms}
                    onChange={onSynonymsChange}
                    label="Synonyms"
                    placeholder="Type a new synonym"
                />
            </Box>
            <Grid container spacing={5.5}>
                <Grid item xs={12} lg={6}>
                    <CustomInputBox
                        id="new-term-superclass-field"
                        name="superClass"
                        value={formState.superClass}
                        onInputChange={onInputChange}
                        label="Superclass"
                        isEndAdornmentVisible
                        placeholder={"Add a superclass"}
                    />
                </Grid>
                <Grid item xs={12} lg={6}>
                    <ExistingIdsSearch options={existingIDsOptions} value={formState.existingIDs} onChange={onExistingIDsChange} label={"Existing IDs"} placeholder={"Search for an existing ID"} />
                </Grid>
            </Grid>
            <Box>
                <CustomInputBox
                    id="search-urls"
                    name="isDefinedBy"
                    value={formState.isDefinedBy}
                    onInputChange={onInputChange}
                    label="Is Defined by"
                    placeholder={"Search for an URL"}
                />
            </Box>
            <Box>
                <CustomInputBox
                    id="new-term-description-field"
                    name="description"
                    value={formState.description}
                    onInputChange={onInputChange}
                    label="Description"
                    placeholder={"Type your term description"}
                    sx={{
                        '& .MuiInputBase-root': {
                            padding: '0.75rem 0.875rem !important'
                        }
                    }}
                />
            </Box>
            <Box>
                <CustomInputBox
                    id="new-term-comment-field"
                    name="comment"
                    value={formState.comment}
                    onInputChange={onInputChange}
                    placeholder={"Add a comment"}
                    label="Comment"
                />
            </Box>
            <Box display="flex" alignItems="center" gap={1.5}>
                <FormControlLabel
                    control={<Checkbox checked={matchesChecked} onChange={handleMatchesChange} />}
                    label="I have checked the potential matches."
                    sx={{
                        margin: 0,
                        '& .MuiFormControlLabel-root': {
                            margin: 0
                        },
                        '& .MuiCheckbox-root': {
                            padding: 0,
                            marginRight: '0.5rem'
                        },
                        '& .MuiFormControlLabel-label': {
                            color: gray600,
                            fontSize: '0.875rem',
                            fontWeight: 500
                        }
                    }}
                />
                {!isResultsEmpty && (
                    <Button
                        variant="text"
                        sx={{ p: 0, height: '1.25rem', color: brand700, '&:hover': { color: brand800, backgroundColor: 'transparent' } }}
                        endIcon={<ArrowForwardIcon />}
                        onClick={handleSidebarOpen}
                    >
                        Go check potential matches
                    </Button>
                )}
            </Box>
        </Box>
    );
};

export default ManualImportTab;
