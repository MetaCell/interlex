import React from "react";
import {
    TextField,
    Autocomplete,
    Typography
} from "@mui/material";
import { vars } from "../../theme/variables";

const { white, brand600, gray50, gray800, gray300, gray400 } = vars;

const ExistingIdsSearch = ({ options, value, onChange, label, placeholder }) => {
    const [searchTerm, setSearchTerm] = React.useState(value || '');

    const handleInputChange = (event, newInputValue) => {
        setSearchTerm(newInputValue);
    };

    return (
        <>
            <Typography variant="body1" sx={{ fontWeight: 500, color: gray800, marginBottom: '0.75rem' }}>{label}</Typography>
            <Autocomplete
                options={options}
                disableClearable
                value={value}
                onChange={onChange}
                inputValue={searchTerm}
                onInputChange={handleInputChange}
                forcePopupIcon={false}
                sx={{
                    '& .MuiInputBase-root': {
                        padding: '0.5rem 0.75rem !important',
                        borderRadius: '0.5rem',
                        boxShadow: '0px 1px 2px 0px rgba(16, 24, 40, 0.05)',
                        background: white
                    },
                    '& input': {
                        padding: 0,
                        fontSize: '1rem !important',
                        fontWeight: '400 !important',
                    },
                    '& fieldset': { borderColor: gray300 },
                    '& .MuiInputAdornment-root': {
                        color: gray400
                    },
                    '&.Mui-focused': {
                        transition: 'width 0.100s ease-in-out',
                        '& .MuiOutlinedInput-root': {
                            border: `2px solid ${brand600}`,
                            background: gray50,
                            boxShadow: '0px 1px 2px 0px rgba(16, 24, 40, 0.05)',
                            borderRadius: '.5rem',
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                            border: 0,
                        },
                    },
                }}
                componentsProps={{
                    popper: {
                        sx: {
                            width: '100%'
                        },
                    },
                    paper: {
                        sx: {
                            backgroundColor: '#fff',
                            padding: '1px 6px',
                            borderRadius: '0.5rem',
                            '& .MuiAutocomplete-option': {
                                padding: '0.563rem 0.625rem !important',
                                height: 'initial',
                                '& .MuiFormControlLabel-root': {
                                    margin: 0,
                                    '& .MuiTypography-root': {
                                        fontSize: '0.875rem',
                                    },
                                    '& .MuiButtonBase-root': {
                                        padding: 0,
                                        marginRight: '.5rem',
                                    },
                                },
                                '&:hover': {
                                    backgroundColor: gray50,
                                },
                                '&[aria-selected="true"]': {
                                    backgroundColor: 'transparent !important',
                                },
                            },
                        },
                    },
                }}
                renderInput={(params) => (
                    <TextField {...params} variant="outlined" placeholder={placeholder} />
                )}
            />
        </>
    );
};

export default ExistingIdsSearch;
