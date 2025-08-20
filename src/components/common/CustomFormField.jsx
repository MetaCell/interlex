import PropTypes from "prop-types";
import {
    FormControl,
    Box,
    InputAdornment,
    Typography,
    styled
} from "@mui/material";
import InputBase from '@mui/material/InputBase';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import { HelpOutlinedIcon } from "../../Icons";
import { vars } from "../../theme/variables";

const {
    gray50,
    gray300,
    gray500,
    brand600,
    gray600,
    gray700,
    gray800,
    error300,
    error600,
    inputErrorBoxShadow
} = vars;

const StyledInput = styled(InputBase)(({ error }) => ({
    "& .MuiInputBase-input": {
        borderRadius: ".5rem",
        border: error ? `1px solid ${error300}` : `1px solid ${gray300}`,
        fontSize: "1rem",
        width: "100%",
        padding: ".5rem .75rem",
        height: "2.5rem",
        color: error ? error600 : gray700,

        "&:focus": {
            borderColor: error ? error300 : brand600,
            boxShadow: error ? inputErrorBoxShadow : "none",
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

const InputLabelSection = ({ label, isRequired, textFontSize, labelColor }) => (
    <Box
        display="flex"
        justifyContent="space-between"
        sx={{ marginBottom: "0.375rem" }}
    >
        <Typography
            variant={textFontSize}
            sx={{
                fontWeight: "500 !important",
                color: labelColor
            }}
        >
            {label}
        </Typography>

        {isRequired && (
            <Typography variant={textFontSize} sx={{ color: gray600 }}>
                Required
            </Typography>
        )}
    </Box>
);

const getEndAdornment = (endAdornment, errorMessage, isEndAdornmentVisible) => {
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

const InputMessage = ({ message, isError = false }) => {
    if (!message) return null;

    return (
        <Typography
            variant="body2"
            sx={{
                marginTop: "0.375rem",
                color: isError ? "#F04438" : gray600
            }}
        >
            {isError ? `${message.charAt(0).toUpperCase() + message.slice(1)}` : message}
        </Typography>
    );
};

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
    textFontSize = "body2",
    labelColor = gray700,
    ...otherProps
}) => {
    return (
        <Box sx={{ width: 1 }}>
            <FormControl fullWidth>
                {label && (
                    <InputLabelSection
                        label={label}
                        isRequired={isRequired}
                        textFontSize={textFontSize}
                        labelColor={labelColor}
                    />
                )}

                <FormControl
                    variant="standard"
                    sx={{
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
                    }}
                >
                    <StyledInput
                        value={value}
                        onChange={onChange}
                        id={label}
                        placeholder={placeholder}
                        endAdornment={getEndAdornment(endAdornment, errorMessage, isEndAdornmentVisible)}
                        error={!!errorMessage}
                        {...otherProps}
                    />
                </FormControl>

                <InputMessage message={errorMessage} isError={true} />
                <InputMessage message={helperText} />
            </FormControl>
        </Box>
    );
};

CustomFormField.propTypes = {
    label: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    helperText: PropTypes.string,
    placeholder: PropTypes.string,
    endAdornment: PropTypes.node,
    multiline: PropTypes.bool,
    rows: PropTypes.number,
    minRows: PropTypes.number,
    disabled: PropTypes.bool,
    errorMessage: PropTypes.string,
    isRequired: PropTypes.bool,
    isEndAdornmentVisible: PropTypes.bool,
    sx: PropTypes.object,
    textFontSize: PropTypes.string,
    labelColor: PropTypes.string,
};

CustomFormField.defaultProps = {
    helperText: "",
    placeholder: "",
    errorMessage: "",
    isRequired: false,
    isEndAdornmentVisible: false,
    textFontSize: "body2",
    labelColor: gray700,
};

export default CustomFormField;