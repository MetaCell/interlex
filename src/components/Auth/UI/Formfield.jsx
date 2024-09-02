import * as React from "react";
import PropTypes from "prop-types";
import {
	Grid,
	FormControl,
	Box,
	FormHelperText,
	OutlinedInput,
} from "@mui/material";

const FormField = ({ xs = 12, label, helperText, placeholder }) => {
	return (
		<Grid item xs={xs}>
			<FormControl fullWidth>
				<Box display="flex" justifyContent="space-between">
					<label>{label}</label>
					<FormHelperText>{helperText}</FormHelperText>
				</Box>
				<OutlinedInput placeholder={placeholder} />
			</FormControl>
		</Grid>
	);
};

// Add prop types for validation
FormField.propTypes = {
	xs: PropTypes.number,
	label: PropTypes.string.isRequired,
	helperText: PropTypes.string,
	placeholder: PropTypes.string,
};

// Add default values for optional props
FormField.defaultProps = {
	helperText: "",
	placeholder: "",
};

export default FormField;
