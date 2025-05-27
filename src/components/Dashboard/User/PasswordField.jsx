import { useState } from "react";
import { Button } from "@mui/material";
import ActionInput from "../../common/ActionInput";
import { VisibilityOutlinedIcon, VisibilityOffOutlinedIcon } from "@mui/icons-material"
import PropTypes from "prop-types";

const PasswordField = ({ value, name, placeholder, handleChange }) => {
    const [showPassword, setShowPassword] = useState(false)

    return (
        <ActionInput
            placeholder={placeholder}
            actionButton={
                <Button
                    onClick={() => setShowPassword(!showPassword)}
                    startIcon={showPassword ? <VisibilityOutlinedIcon /> : <VisibilityOffOutlinedIcon />}
                >
                    {showPassword ? "Show" : "Hide"}
                </Button>
            }
            type={showPassword ? "text" : "password"}
            name={name}
            value={value}
            onChange={handleChange}
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