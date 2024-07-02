import React, { useState } from "react";
import {
    Box, TextField, Autocomplete, Grid,
    Stack, Typography, Button, Select, FormControl, FormHelperText, MenuItem,
    FormControlLabel, Chip
} from "@mui/material";
import CustomInputBox from "../common/CustomInputBox";
import Checkbox from "../common/CustomCheckbox";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloseIcon from '@mui/icons-material/Close';
import { vars } from "../../theme/variables";

const { gray50, gray300, gray400, gray500, gray600, gray700, brand700, brand800 } = vars;

const styles = {
    autocomplete: {
        '& .MuiOutlinedInput-root': {
            padding: '0.5rem 0.75rem !important',
            backgroundColor: '#fff',
            boxShadow: '0px 1px 2px 0px rgba(16, 24, 40, 0.05)',
            height: 'auto !important'
        },
        '& .MuiOutlinedInput-notchedOutline': {
            borderColor: gray300
        },
        '& input': {
            fontSize: '1rem !important',
            fontWeight: '400 !important',
            color: `${gray500} !important`
        },
        '& .MuiChip-deleteIcon': {
            color: `${gray400} !important`
        },
        '& .MuiChip-root': {
            fontSize: '0.875rem',
            padding: '0.125rem 0.625rem',
            height: '1.625rem'
        }
    },
    IDChipOutlined: {
        border: `1.5px solid ${gray600}`,
        background: 'transparent',
        color: gray700
    },
    ulrChip: {
        padding: '0.125rem 0.5rem',
        border: `1px solid ${gray300}`,
        borderRadius: '0.375rem',
        background: 'transparent',
        boxShadow: '0px 1px 2px 0px rgba(16, 24, 40, 0.05)'
    },
    select: {
        borderRadius: '0.5rem',
        color: gray500,
        '& .MuiOutlinedInput-input': {
            padding: '0.5rem 0.75rem',
            backgroundColor: gray50,
            borderRadius: '0.5rem'
        },
        '& fieldset': {
            borderColor: gray300
        }
    }
};

const options = [
    { title: "The Shawshank Redemption", year: 1994 },
    { title: "The Godfather", year: 1972 },
    { title: "The Godfather: Part II", year: 1974 },
    { title: "The Dark Knight", year: 2008 },
    { title: "12 Angry Men", year: 1957 },
    { title: "Schindler's List", year: 1993 },
];

const ManualImportTab = ({ handleSidebarOpen, matchesChecked, handleMatchesChange }) => {
    const [formState, setFormState] = useState({
        label: "Central nervous system",
        ilx: "ILX:0101901",
        age: '',
        synonyms: [options[0]],
        superclass: "Regional part of nervous system",
        existingIds: [options[0]],
        urls: [options[0]],
        description: "The central nervous system (CNS) is the part of the nervous system which includes the brain, spinal cord, and nerve cell layer of the retina.",
        comment: "Old definition:"
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormState((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSelectChange = (event) => {
        setFormState((prevState) => ({
            ...prevState,
            age: event.target.value
        }));
    };

    const handleAutocompleteChange = (name) => (event, value) => {
        setFormState((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    return (
        <Box component="form" sx={{ width: '100%', mt: '2.75rem', display: 'flex', flexDirection: 'column', gap: '2.75rem' }} noValidate autoComplete="off">
            <Grid container spacing={5.5}>
                <Grid item xs={16} md={6} lg={4}>
                    <CustomInputBox
                        id="new-term-label-field"
                        name="label"
                        value={formState.label}
                        onInputChange={handleInputChange}
                        label="Label"
                        isRequired
                        helperText={"Label of your term."}
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
                <Grid item xs={12} md={6} lg={4}>
                    <CustomInputBox
                        id="new-term-ilx-field"
                        name="ilx"
                        value={formState.ilx}
                        onInputChange={handleInputChange}
                        label="ILX"
                        helperText={"This is automatically generated but editable."}
                        isEndAdornmentVisible
                    />
                </Grid>
                <Grid item xs={12} md={6} lg={4}>
                    <Stack direction="row" justifyContent="space-between" mb={1.5}>
                        <Typography>Type</Typography>
                    </Stack>
                    <FormControl sx={{ width: '100%' }}>
                        <Select
                            labelId="demo-simple-select-helper-label"
                            id="demo-simple-select-helper"
                            value={formState.age}
                            onChange={handleSelectChange}
                            IconComponent={KeyboardArrowDownIcon}
                            sx={styles.select}
                        >
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                            <MenuItem value={10}>Ten</MenuItem>
                            <MenuItem value={20}>Twenty</MenuItem>
                            <MenuItem value={30}>Thirty</MenuItem>
                        </Select>
                        <FormHelperText>Select the type.</FormHelperText>
                    </FormControl>
                </Grid>
            </Grid>
            <Box>
                <Stack direction="row" justifyContent="space-between" mb={1.5}>
                    <Typography>Synonyms</Typography>
                </Stack>
                <Autocomplete
                    multiple
                    id="term-synonyms"
                    options={options}
                    sx={styles.autocomplete}
                    getOptionLabel={(option) => option.title}
                    value={formState.synonyms}
                    onChange={handleAutocompleteChange('synonyms')}
                    renderTags={(tagValue, getTagProps) =>
                        tagValue.map((option, index) => (
                            <Chip
                                label={option.title}
                                deleteIcon={<CloseIcon />}
                                {...getTagProps({ index })}
                            />
                        ))
                    }
                    renderInput={(params) => (
                        <TextField {...params} placeholder="Type a new synonym" />
                    )}
                />
            </Box>
            <Grid container spacing={5.5}>
                <Grid item xs={16} lg={6}>
                    <CustomInputBox
                        id="new-term-superclass-field"
                        name="superclass"
                        value={formState.superclass}
                        onInputChange={handleInputChange}
                        label="Superclass"
                        isEndAdornmentVisible
                    />
                </Grid>
                <Grid item xs={12} lg={6}>
                    <Stack direction="row" justifyContent="space-between" mb={1.5}>
                        <Typography>Existing IDs</Typography>
                    </Stack>
                    <Autocomplete
                        multiple
                        id="existing-ids"
                        options={options}
                        sx={styles.autocomplete}
                        getOptionLabel={(option) => option.title}
                        value={formState.existingIds}
                        onChange={handleAutocompleteChange('existingIds')}
                        renderTags={(tagValue, getTagProps) =>
                            tagValue.map((option, index) => (
                                <Chip
                                    label={option.title}
                                    variant="outlined"
                                    sx={styles.IDChipOutlined}
                                    deleteIcon={<CloseIcon />}
                                    {...getTagProps({ index })}
                                />
                            ))
                        }
                        renderInput={(params) => (
                            <TextField {...params} placeholder="Search for an existing ID" />
                        )}
                    />
                </Grid>
            </Grid>
            <Box>
                <Stack direction="row" justifyContent="space-between" mb={1.5}>
                    <Typography>Is Defined by</Typography>
                </Stack>
                <Autocomplete
                    multiple
                    id="search-urls"
                    options={options}
                    sx={styles.autocomplete}
                    getOptionLabel={(option) => option.title}
                    value={formState.urls}
                    onChange={handleAutocompleteChange('urls')}
                    renderTags={(tagValue, getTagProps) =>
                        tagValue.map((option, index) => (
                            <Chip
                                label={option.title}
                                deleteIcon={<CloseIcon />}
                                sx={styles.ulrChip}
                                {...getTagProps({ index })}
                            />
                        ))
                    }
                    renderInput={(params) => (
                        <TextField {...params} placeholder="Search for an URL" />
                    )}
                />
            </Box>
            <Box>
                <CustomInputBox
                    id="new-term-description-field"
                    name="description"
                    value={formState.description}
                    onInputChange={handleInputChange}
                    label="Description"
                    multiline
                />
            </Box>
            <Box>
                <CustomInputBox
                    id="new-term-comment-field"
                    name="comment"
                    value={formState.comment}
                    onInputChange={handleInputChange}
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
                <Button
                    variant="text"
                    sx={{ p: 0, height: '1.25rem', color: brand700, '&:hover': { color: brand800, backgroundColor: 'transparent' } }}
                    endIcon={<ArrowForwardIcon />}
                    onClick={handleSidebarOpen}
                >
                    Go check potential matches
                </Button>
            </Box>
        </Box>
    );
};

export default ManualImportTab;
