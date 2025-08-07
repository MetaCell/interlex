import PropTypes from "prop-types";
import { FormControl, Box, OutlinedInput, InputAdornment, Typography } from "@mui/material";
import { styled } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import { HelpOutlinedIcon } from "../../Icons";
import { vars } from "../../theme/variables";

const { gray50, gray300, gray500, brand600, gray600, gray700, gray800 } = vars;

const BootstrapInput = styled(InputBase)(({ theme }) => ({
    "& .MuiInputBase-input": {
        borderRadius: ".5rem",
        border: `1px solid ${gray300}`,
        fontSize: "1rem",
        width: "100%",
        padding: ".5rem .75rem",
        height: "2.5rem",
        color: gray700,
        "&:focus": {
            borderColor: brand600,
            boxShadow: "none",
            borderWidth: "2px",
        },
        "&::placeholder": {
            color: gray500,
            fontSize: "1rem",
        },
        "&.Mui-disabled": {
            backgroundColor: gray50,
            fontWeight: 400,
            opacity: 1,
        },
    },
    "& .MuiInputBase-root": {
        position: "relative",
    },
    "& .MuiInputAdornment-root": {
        position: "absolute",
        right: ".75rem",
        top: "50%",
        transform: "translateY(-50%)",
        pointerEvents: "auto",
    },
    "&.MuiInputBase-adornedEnd .MuiInputBase-input": {
        paddingRight: "2.5rem"
    }
}));

const CustomFormField = ({
    label,
    value,
    onChange,
    placeholder,
    helperText,
    errorMessage,
    isEndAdornmentVisible,
    isRequired,
    endAdornment,
    sx,
    ...otherProps
}) => {
    const getEndAdornment = () => {
        if (endAdornment) {
            return endAdornment;
        }

        if (errorMessage) {
            return (
                <InputAdornment position="end">
                    <ErrorOutlineOutlinedIcon color="error" />
                </InputAdornment>
            );
        }
        if (isEndAdornmentVisible) {
            return (
                <InputAdornment position="end">
                    <HelpOutlinedIcon />
                </InputAdornment>
            );
        }
        return null;
    };

    return (
        <Box sx={{ width: 1 }}>
            <FormControl fullWidth>
                {label && (
                    <Box display="flex" justifyContent="space-between" sx={{ marginBottom: "0.375rem" }}>
                        <Typography variant="body2" sx={{
                            fontWeight: "500 !important",
                            color: gray700,
                        }}>
                            {label}
                        </Typography>
                        {isRequired && <Typography variant="body2" sx={{ color: gray600 }}>Required</Typography>}
                    </Box>
                )}
                <FormControl variant="standard" sx={{
                    position: "relative",
                    width: "100%",
                    "& .MuiFormLabel-root": {
                        fontSize: "1rem",
                        fontWeight: "500",
                        transform: "none",
                        transition: "none",
                        top: "-2rem",
                        color: gray800,
                    },
                    ...sx
                }}>
                    <BootstrapInput
                        value={value}
                        onChange={onChange}
                        id={label}
                        placeholder={placeholder}
                        endAdornment={getEndAdornment()}
                        {...otherProps}
                    />
                </FormControl>
                {errorMessage && <Typography variant="body2" sx={{ color: "#F04438", marginTop: "0.375rem" }}>{`${errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1)}`}</Typography>}
                {helperText && <Typography variant="body2" sx={{ marginTop: "0.375rem", color: gray600 }}>{helperText}</Typography>}
            </FormControl>
        </Box>
    );
};

CustomFormField.propTypes = {
    label: PropTypes.string.isRequired,
    helperText: PropTypes.string,
    placeholder: PropTypes.string,
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    endAdornment: PropTypes.node,
    multiline: PropTypes.bool,
    rows: PropTypes.number,
    minRows: PropTypes.number,
    disabled: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    errorMessage: PropTypes.string,
    isRequired: PropTypes.bool,
    isEndAdornmentVisible: PropTypes.bool,
    sx: PropTypes.object
};

CustomFormField.defaultProps = {
    helperText: "",
    placeholder: "",
    errorMessage: "",
    isRequired: false,
    isEndAdornmentVisible: false,
};

export default CustomFormField;