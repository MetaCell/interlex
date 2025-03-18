import { useState } from "react";
import PropTypes from "prop-types";
import {
  FormControl,
  Box,
  FormHelperText,
  OutlinedInput,
  InputAdornment,
  IconButton,
  Grid,
} from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";

const PasswordField = ({ xs = 12, label, placeholder, helperText, name, value, onChange }) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => event.preventDefault();

  return (
    <Grid item xs={xs}>
      <FormControl fullWidth>
        <Box display="flex" justifyContent="space-between">
          <label>{label}</label>
          <FormHelperText>{helperText}</FormHelperText>
        </Box>
        <OutlinedInput
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          name={name} // Pass the name prop
          value={value}
          onChange={onChange}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleClickShowPassword}
                onMouseDown={handleMouseDownPassword}
              >
                {showPassword ? (
                  <VisibilityOffOutlinedIcon />
                ) : (
                  <VisibilityOutlinedIcon />
                )}
              </IconButton>
            </InputAdornment>
          }
        />
      </FormControl>
    </Grid>
  );
};

PasswordField.propTypes = {
  xs: PropTypes.number,
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  helperText: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

PasswordField.defaultProps = {
  placeholder: "",
  helperText: "",
};

export default PasswordField;
