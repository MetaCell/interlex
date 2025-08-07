import { useState } from "react";
import PropTypes from "prop-types";
import {
  InputAdornment,
  IconButton
} from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import CustomFormField from "../../common/CustomFormField";

const PasswordField = ({ label, placeholder, isRequired, helperText, name, value, onChange, errorMessage }) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => event.preventDefault();

  return (
    <CustomFormField
      label={label}
      type={showPassword ? "text" : "password"}
      placeholder={placeholder}
      name={name} // Pass the name prop
      value={value}
      onChange={onChange}
      error={errorMessage}
      autoComplete="off"
      helperText={helperText}
      isRequired={isRequired}
      endAdornment={
        <InputAdornment position="end">
          <IconButton
            aria-label="toggle password visibility"
            onClick={handleClickShowPassword}
            onMouseDown={handleMouseDownPassword}
            sx={{ padding: 0, background: "transparent", "&:hover": { background: "transparent" } }}
          >
            {errorMessage ? <ErrorOutlineOutlinedIcon /> : <>
              {showPassword ? (
                <VisibilityOffOutlinedIcon />
              ) : (
                <VisibilityOutlinedIcon />
              )}
            </>
            }
          </IconButton>
        </InputAdornment>
      }
    />
  );
};

PasswordField.propTypes = {
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  helperText: PropTypes.string,
  isRequired: PropTypes.bool,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  errorMessage: PropTypes.string.isRequired,
};

PasswordField.defaultProps = {
  placeholder: "",
  helperText: "",
};

export default PasswordField;