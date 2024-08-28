import React, { useState } from "react";
import PropTypes from "prop-types";
import {
	FormControl,
	Box,
	FormHelperText,
	OutlinedInput,
	InputAdornment,
	IconButton,
	Grid,
	Typography,
} from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";

const PasswordField = ({ xs = 12, label, placeholder, helperText }) => {
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

// Prop Types for validation
PasswordField.propTypes = {
	xs: PropTypes.number,
	label: PropTypes.string.isRequired,
	placeholder: PropTypes.string,
	helperText: PropTypes.string,
};

// Default Props
PasswordField.defaultProps = {
	placeholder: "",
	helperText: "",
};

export default PasswordField;
