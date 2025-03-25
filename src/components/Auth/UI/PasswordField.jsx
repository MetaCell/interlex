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
  Typography
} from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';

const PasswordField = ({ xs = 12, label, placeholder, helperText, name, value, onChange, errorMessage }) => {
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
          error={errorMessage}
          autoComplete="off"
          endAdornment={
          <InputAdornment position="end">
            <IconButton
            aria-label="toggle password visibility"
            onClick={handleClickShowPassword}
            onMouseDown={handleMouseDownPassword}
            sx={{ padding: 0 }}
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
        {errorMessage && <Typography variant="body2" sx={{ color: "#F04438", marginTop: "0.375rem" }}>{`${errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1)}`}</Typography>}
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
  errorMessage: PropTypes.string,
};

PasswordField.defaultProps = {
  placeholder: "",
  helperText: "",
};

export default PasswordField;
