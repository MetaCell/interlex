import PropTypes from 'prop-types';
import CloseIcon from '@mui/icons-material/Close';
import CustomFormField from '../common/CustomFormField';
import { Box, Grid, Autocomplete, Chip, Stack, Typography, TextField } from "@mui/material";

import { vars } from "../../theme/variables";
const { gray50, gray300, gray400, gray500, gray600, gray700, brand600, gray800 } = vars;

const styles = {
    autocomplete: {
        '& .MuiOutlinedInput-root': {
            padding: '0.5rem 0.75rem !important',
            backgroundColor: '#fff',
            boxShadow: '0px 1px 2px 0px rgba(16, 24, 40, 0.05)',
            height: 'auto !important',
            '&.Mui-focused': {
                border: `0.125rem solid ${brand600}`,
                backgroundColor: gray50,
                boxShadow: 'none'
            }
        },
        '& .MuiOutlinedInput-notchedOutline': {
            borderColor: gray300,
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

const TermForm = ({ formState, data, onInputChange, onAutocompleteChange }) => {
    const safeData = data ?? {};

    return (
        <Box component="form" sx={{ width: '100%', mt: '2.75rem', display: 'flex', flexDirection: 'column', gap: '2.75rem' }} noValidate autoComplete="off">
            <Grid container spacing={5.5}>
                <Grid item xs={16} md={6} lg={12}>
                    <CustomFormField
                        name="label"
                        value={formState.label}
                        onChange={onInputChange}
                        label="Label"
                        isRequired
                        helperText={"This is a hint text to help user."}
                        placeholder={"Enter your term label"}
                        isEndAdornmentVisible
                        textFontSize="body1"
                        labelColor={gray800}
                    />
                </Grid>
            </Grid>
            <Box>
                <Stack direction="row" justifyContent="space-between" mb={1.5}>
                    <Typography sx={{ color: gray800, fontWeight: 500 }}>Synonyms</Typography>
                </Stack>
                <Autocomplete
                    multiple
                    id="term-synonyms"
                    options={safeData?.synonym || []}
                    sx={styles.autocomplete}
                    getOptionLabel={(option) => option}
                    value={formState?.synonyms}
                    onChange={onAutocompleteChange('synonyms')}
                    renderTags={(tagValue, getTagProps) =>
                        tagValue.map((option, index) => (
                            <Chip
                                key={option}
                                label={option}
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
                    <CustomFormField
                        name="superclass"
                        value={formState.superclass}
                        onChange={onInputChange}
                        label="Superclass"
                        isEndAdornmentVisible
                        placeholder={"Add a superclass"}
                        textFontSize="body1"
                        labelColor={gray800}
                    />
                </Grid>
                <Grid item xs={12} lg={6}>
                    <Stack direction="row" justifyContent="space-between" mb={1.5}>
                        <Typography sx={{ color: gray800, fontWeight: 500 }}>Existing IDs</Typography>
                    </Stack>
                    <Autocomplete
                        multiple
                        id="term-existingIds"
                        options={safeData?.existingID || []}
                        sx={styles.autocomplete}
                        getOptionLabel={(option) => option}
                        value={formState?.existingIds}
                        onChange={onAutocompleteChange('existingIds')}
                        renderTags={(tagValue, getTagProps) =>
                            tagValue.map((option, index) => (
                                <Chip
                                    key={option}
                                    label={option}
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
                <CustomFormField
                    name="urls"
                    value={formState.urls}
                    onChange={onInputChange}
                    label="Is Defined by"
                    placeholder={"Search for an URL"}
                    textFontSize="body1"
                    labelColor={gray800}
                />
            </Box>
            <Box>
                <CustomFormField
                    name="description"
                    value={formState.description}
                    onChange={onInputChange}
                    label="Description"
                    placeholder={"Type your term description"}
                    textFontSize="body1"
                    labelColor={gray800}
                />
            </Box>
            <Box>
                <CustomFormField
                    name="comment"
                    value={formState.comment}
                    onChange={onInputChange}
                    placeholder={"Add a comment"}
                    label="Comment"
                    textFontSize="body1"
                    labelColor={gray800}
                />
            </Box>
        </Box>
    );
};

TermForm.propTypes = {
    formState: PropTypes.object,
    data: PropTypes.object,
    onInputChange: PropTypes.func,
    onAutocompleteChange: PropTypes.func
};

export default TermForm;
