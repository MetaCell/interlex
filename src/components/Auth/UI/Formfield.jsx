import PropTypes from "prop-types";
import { Grid, FormControl, Box, FormHelperText, OutlinedInput } from "@mui/material";

const FormField = ({ xs = 12, label, helperText, placeholder, name, value, onChange }) => {
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
        />
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
};

FormField.defaultProps = {
  helperText: "",
  placeholder: "",
};

export default FormField;
