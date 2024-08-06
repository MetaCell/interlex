import React, { useEffect, useRef } from "react";
import {
    Box,
    TextField,
    Autocomplete,
    InputAdornment,
    Stack,
    Typography
} from "@mui/material";
import { HelpOutlinedIcon } from "../../Icons";
import { vars } from "../../theme/variables";
import ListItem from '@mui/material/ListItem';

const { white, brand600, gray50, gray200, gray600, gray800, gray300 } = vars;

const CustomAutocompleteBox = ({ label, value, onChange, isRequired, placeholder, isEndAdornmentVisible, helperText }) => {
    const options = [
        { label: 'Nervous system1', badge: 'My Organization 1', selected: false },
        { label: 'Nervous system2', badge: 'ODC-TBI', selected: false },
        { label: 'Nervous system3', badge: 'Dk-net', selected: false },
        { label: 'Nervous system4', badge: 'My Organization 2', selected: false }
    ];

    const [searchTerm, setSearchTerm] = React.useState('');
    const [openList, setOpenList] = React.useState(false);
    const autocompleteRef = useRef(null);
    const popperRef = useRef(null);
    const handleOpenList = () => {
        setOpenList(true);
    };

    const handleClickOutside = (event) => {
        if (
            autocompleteRef.current &&
            !autocompleteRef.current.contains(event.target) &&
            popperRef.current &&
            !popperRef.current.contains(event.target)
        ) {
            setOpenList(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <>
            <Stack direction="row" justifyContent="space-between" mb={1.5}>
                <Typography variant="body1" sx={{ fontWeight: 500, color: gray800 }}>{label}</Typography>
                {isRequired && <Typography variant="body1" sx={{ color: gray600 }}>Required</Typography>}
            </Stack>
            <div ref={autocompleteRef}>
                <Autocomplete
                    disableCloseOnSelect
                    disableClearable
                    options={options}
                    open={openList}
                    onOpen={handleOpenList}
                    forcePopupIcon={false}
                    value={value}
                    onChange={(event, value) => {
                        onChange(value)
                    }}
                    inputValue={searchTerm}
                    onInputChange={(event, newInputValue) => {
                        setSearchTerm(newInputValue);
                    }}
                    isOptionEqualToValue={(option, value) => option.label === value?.label && option.badge === value?.badge}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: openList ? '0.5rem 0.5rem 0 0' : '0.5rem',
                            padding: "0.5rem 0.75rem",
                            background: white,
                            boxShadow: "0px 1px 2px 0px rgba(16, 24, 40, 0.05)",
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: gray300,
                        },
                        '&.Mui-focused': {
                            transition: 'width 0.100s ease-in-out',
                            '& .MuiOutlinedInput-root': {
                                border: `0.125rem solid ${brand600}`,
                                background: gray50,
                                boxShadow: '0px 1px 2px 0px rgba(16, 24, 40, 0.05)',
                                borderRadius: '.5rem',
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                                border: 0,
                            },
                        },
                    }}
                    autoHighlight={false}
                    componentsProps={{
                        popper: {
                            sx: {
                                backgroundColor: 'white',
                            },
                            ref: popperRef
                        },
                        paper: {
                            sx: {
                                borderRadius: '0.5rem',
                                '& .MuiAutocomplete-option': {
                                    padding: '.06rem .38rem',
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
                    renderOption={(props, option) => (
                        <ListItem {...props} sx={{ padding: "0.063rem 0.375rem" }}>
                            <Box
                                p='0.563rem 0.625rem'
                                display='flex'
                                justifyContent='space-between'
                                alignItems='center'
                                gap='.5'
                                width={1}
                                sx={{ "&:hover": { backgroundColor: gray50, borderRadius: "0.375rem" } }}
                            >
                                <Typography sx={{ color: "#3B403F", fontSize: "0.875rem" }}>{option.label}</Typography>
                            </Box>
                        </ListItem>
                    )}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            variant="outlined"
                            placeholder={placeholder}
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: isEndAdornmentVisible ? (
                                    <InputAdornment position="end">
                                        <HelpOutlinedIcon />
                                    </InputAdornment>
                                ) : null
                            }}
                        />
                    )}
                    PaperComponent={({ children }) => (
                        <Box
                            ref={popperRef}
                            sx={{
                                borderRadius: '0.5rem',
                                border: `0.063rem solid ${gray200}`,
                                boxShadow:
                                    '0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03)',
                                "& .MuiAutocomplete-listbox": {
                                    padding: "0.25rem 0"
                                },
                                "& .MuiAutocomplete-option:hover": {
                                    backgroundColor: "transparent !important",
                                }
                            }}
                        >
                            {children}
                        </Box>
                    )}
                />
            </div>
            <Typography sx={{ marginTop: "0.5rem", fontSize: "0.875rem", color: gray600 }}>{helperText}</Typography>
        </>
    );
};

export default CustomAutocompleteBox;
