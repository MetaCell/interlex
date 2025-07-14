import { useState } from "react";
import { Button, Typography } from "@mui/material";
import ActionInput from "../../common/ActionInput";
import { VisibilityOutlined, VisibilityOffOutlined } from "@mui/icons-material"
import PropTypes from "prop-types";

const PasswordField = ({ value, name, placeholder, handleChange, error, helperText }) => {
    const [showPassword, setShowPassword] = useState(false)

    return (
        <div>
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
            />
            {helperText && (
                <Typography variant="caption" sx={{ mt: 1, display: "flex", alignItems: "center", fontSize: "0.875rem" }}>
                    {helperText}
                </Typography>
            )}
            {error && <Typography variant="body2" sx={{ color: "#F04438", marginTop: "0.375rem" }}>{`${error.charAt(0).toUpperCase() + error.slice(1)}`}</Typography>}
        </div>
    )
}

PasswordField.propTypes = {
    placeholder: PropTypes.string,
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    error: PropTypes.bool,
    helperText: PropTypes.string,
    handleChange: PropTypes.func.isRequired
};

PasswordField.defaultProps = {
    placeholder: "",
};


export default PasswordField;