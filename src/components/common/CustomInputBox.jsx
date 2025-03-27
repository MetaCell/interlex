import PropTypes from 'prop-types';
import { HelpOutlinedIcon } from "../../Icons";
import { Stack, Typography, TextField, InputAdornment } from "@mui/material";

import { vars } from "../../theme/variables";
const { gray50, gray300, gray400, gray600, gray700, gray800, gray900, brand600 } = vars;

const CustomInputBox = ({ id, name, value, onInputChange, label, isRequired, helperText, placeholder, isEndAdornmentVisible, multiline, rows, sx }) => {
    return (
        <>
            <Stack direction="row" justifyContent="space-between" mb={1.5}>
                <Typography variant="body1" sx={{ fontWeight: 500, color: gray800 }}>{label}</Typography>
                {isRequired && <Typography variant="body1" sx={{ color: gray600 }}>Required</Typography>}
            </Stack>
            <TextField
                id={id}
                value={value}
                name={name}
                onChange={onInputChange}
                fullWidth
                variant="outlined"
                helperText={helperText}
                placeholder={placeholder}
                multiline={multiline}
                rows={rows}
                InputProps={{
                    endAdornment: isEndAdornmentVisible ? (
                        <InputAdornment position="end">
                            <HelpOutlinedIcon />
                        </InputAdornment>
                    ) : null
                }}
                sx={{
                    ...sx,
                    '& .MuiInputBase-root': {
                        padding: '0.5rem 0.75rem',
                        borderRadius: '0.5rem',
                        boxShadow: '0px 1px 2px 0px rgba(16, 24, 40, 0.05)',
                        color: isRequired ? gray900 : gray700,
                        '&.Mui-focused': {
                            border: `2px solid ${brand600}`,
                            backgroundColor: gray50,
                            boxShadow: 'none'
                        }
                    },
                    '& input': {
                        padding: 0
                    },
                    '& fieldset': { borderColor: gray300 },
                    '& .MuiInputAdornment-root': {
                        color: gray400
                    },
                    '& .MuiFormHelperText-root': {
                        marginTop: '0.5rem',
                        mx: 0,
                        color: gray600,
                        fontSize: '0.875rem'
                    }
                }}
            />
        </>
    )
}

CustomInputBox.propTypes = {
    id: PropTypes.string,
    name: PropTypes.string,
    value: PropTypes.string,
    onInputChange: PropTypes.func,
    label: PropTypes.string,
    isRequired: PropTypes.bool,
    helperText: PropTypes.string,
    placeholder: PropTypes.string,
    isEndAdornmentVisible: PropTypes.bool,
    multiline: PropTypes.bool,
    rows: PropTypes.number,
    sx: PropTypes.object
}

export default CustomInputBox;
