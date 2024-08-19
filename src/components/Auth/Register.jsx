import * as React from "react";
import {
	Box,
	Button,
	FormControl,
	Grid,
	OutlinedInput,
	Paper,
	Typography,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import Checkbox from "@mui/material/Checkbox";
import { Link } from "react-router-dom";
import FormField from "./UI/Formfield";
import PasswordField from "./UI/PasswordField";
const Register = () => {
	const label = { inputProps: { "aria-label": "Checkbox demo" } };

	return (
		<>
			<Box className="authArea">
				<Paper
					className="authPaper"
					sx={{
						p: 5,
						maxWidth: 760,
						flexGrow: 1,
					}}
				>
					<Link startIcon={<ArrowBack />} variant="text" to={"/login"}>
						Return to page
					</Link>
					<Typography variant="h4">Register a new account and join</Typography>
					<Typography variant="body1">
						Welcome! Please enter your details.
					</Typography>
					<form className="authForm">
						<Grid container spacing={2.5}>
							<FormField
								xs={6}
								label="First name"
								helperText="Required"
								placeholder="Enter your name"
							/>
							<FormField
								xs={6}
								label="Last name"
								helperText="Required"
								placeholder="Enter your surname"
							/>
							<FormField
								label="Email"
								helperText="Required"
								placeholder="Enter your email"
							/>
							<PasswordField
								label="Password"
								placeholder="Enter your password"
								helperText="Required"
							/>
							<PasswordField
								label="Confirm new password"
								placeholder="Confirm your new password"
								helperText="Required"
							/>
							<Grid item xs={12}>
								<FormControl>
									<Box display={"flex"} justifyContent={"space-between"}>
										<label>Organization</label>
									</Box>
									<OutlinedInput
										type="password"
										placeholder="Type your organization here"
										endAdornment={
											<InputAdornment position="end">
												<IconButton>
													<HelpOutlineIcon />
												</IconButton>
											</InputAdornment>
										}
									/>
								</FormControl>
							</Grid>
							<Grid item xs={12}>
								<Box
									className="authRemember"
									display={"flex"}
									alignItems={"center"}
								>
									<Checkbox {...label} defaultChecked color="primary" />
									<Typography variant="body2">
										I have read the <Link>Terms and Conditions</Link> and{" "}
										<Link>Privacy Policy.</Link>
									</Typography>
								</Box>
							</Grid>
							<Grid item xs={12}>
								<FormControl>
									<Button variant="contained" color="primary">
										Sign in
									</Button>
								</FormControl>
							</Grid>
						</Grid>
					</form>
				</Paper>
			</Box>
		</>
	);
};
export default Register;
