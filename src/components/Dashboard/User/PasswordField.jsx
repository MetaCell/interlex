import PropTypes from "prop-types";
import { useState } from "react";
import { Button, Typography } from "@mui/material";
import ActionInput from "../../common/ActionInput";
import { VisibilityOutlined, VisibilityOffOutlined } from "@mui/icons-material"
import { vars } from "../../../theme/variables";

const { gray700, error500 } = vars

const PasswordField = ({ value, name, label, placeholder, handleChange, errorMessage, helperText }) => {
    const [showPassword, setShowPassword] = useState(false)
    return (
        <div>
            <Typography variant="subtitle2" component="label" sx={{ color: gray700, marginBottom: "0.375rem" }}>
                {label}
            </Typography>
            <ActionInput
                placeholder={placeholder}
                type={showPassword ? "text" : "password"}
                name={name}
                value={value}
                onChange={handleChange}
                size="small"
                actionButton={
                    <Button
                        onClick={() => setShowPassword(!showPassword)}
                        startIcon={showPassword ? <VisibilityOutlined /> : <VisibilityOffOutlined />}
                    >
                        {showPassword ? "Show" : "Hide"}
                    </Button>
                }
                error={errorMessage}
            />
            {helperText && (
                <Typography variant="caption" sx={{ mt: 1, display: "flex", alignItems: "center", fontSize: "0.875rem" }}>
                    {helperText}
                </Typography>
            )}
            {errorMessage && <Typography variant="body2" sx={{ color: error500, marginTop: "0.375rem" }}>{`${errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1)}`}</Typography>}
        </div>
    )
}

PasswordField.propTypes = {
    placeholder: PropTypes.string,
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    errorMessage: PropTypes.string,
    helperText: PropTypes.string,
    handleChange: PropTypes.func.isRequired
};

PasswordField.defaultProps = {
    placeholder: "",
};


export default PasswordField;