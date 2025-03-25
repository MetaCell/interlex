import PropTypes from "prop-types";
import { Grid, FormControl, Box, FormHelperText, OutlinedInput, InputAdornment, Typography } from "@mui/material";
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';

const FormField = ({ xs = 12, label, helperText, placeholder, name, value, onChange, errorMessage }) => {
  return (
    <Grid item xs={xs}>
      <FormControl fullWidth>
        <Box display="flex" justifyContent="space-between">
          <label>{label}</label>
          <FormHelperText>{helperText}</FormHelperText>
        </Box>
        <OutlinedInput
          placeholder={placeholder}
          name={name} // Pass the name prop
          value={value}
          onChange={onChange}
          autoComplete="off"
          error={errorMessage}
          endAdornment={
            errorMessage && (
              <InputAdornment>
                <ErrorOutlineOutlinedIcon />
              </InputAdornment>
            )
          }
        />
        {errorMessage && <Typography variant="body2" sx={{ color: "#F04438", marginTop: "0.375rem" }}>{`${errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1)}`}</Typography>}
      </FormControl>
    </Grid>
  );
};

FormField.propTypes = {
  xs: PropTypes.number,
  label: PropTypes.string.isRequired,
  helperText: PropTypes.string,
  placeholder: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  errorMessage: PropTypes.string,
};

FormField.defaultProps = {
  helperText: "",
  placeholder: "",
};

export default FormField;