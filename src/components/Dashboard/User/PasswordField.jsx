import { useState } from "react";
import { Button } from "@mui/material";
import ActionInput from "../../common/ActionInput";
import { VisibilityOutlined, VisibilityOffOutlined } from "@mui/icons-material"
import PropTypes from "prop-types";

const PasswordField = ({ value, name, placeholder, handleChange }) => {
    const [showPassword, setShowPassword] = useState(false)

    return (
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
    )
}

PasswordField.propTypes = {
    placeholder: PropTypes.string,
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    handleChange: PropTypes.func.isRequired
};

PasswordField.defaultProps = {
    placeholder: "",
};


export default PasswordField;