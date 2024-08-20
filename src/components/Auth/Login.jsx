import * as React from "react";
import {
	Box,
	Button,
	FormControl,
	FormControlLabel,
	Grid,
	Paper,
	Typography,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import Checkbox from "@mui/material/Checkbox";
import { Link } from "react-router-dom";
import { CheckedIcon, OrcidIcon, UncheckedIcon } from "../../Icons";
import FormField from "./UI/Formfield";
import PasswordField from "./UI/PasswordField";

const Login = () => {
	const label = { inputProps: { "aria-label": "Checkbox demo" } };

	return (
		<>
			<Box className="authArea">
				<Paper
					className="authPaper"
					sx={{
						maxWidth: 528,
						flexGrow: 1,
					}}
				>
					<Link variant="text" to={"/"} className="authLink">
						<ArrowBack />
						Return to page
					</Link>
					<Typography variant="h4">Log in to your account</Typography>
					<Typography variant="body1">
						Welcome! Please enter your details.
					</Typography>
					<form className="authForm">
						<Grid container spacing={2.5}>
							<FormField
								label="Email"
								helperText="Required"
								placeholder="Enter your email"
							/>
							<PasswordField
								xs={12}
								label="Password"
								placeholder="Enter your password"
								helperText="Required"
							/>
							<Grid item xs={12}>
								<Box
									className="authRemember"
									display={"flex"}
									alignItems={"center"}
									justifyContent={"space-between"}
								>
									<Box display={"flex"} alignItems={"center"}>
										<FormControlLabel
											control={
												<Checkbox
													size="small"
													icon={<UncheckedIcon />}
													checkedIcon={<CheckedIcon />}
													{...label}
													defaultChecked
													color="primary"
												/>
											}
											label="Remember for 30 days"
										/>
									</Box>
									<Link
										color="primary"
										variant="text"
										to={"/forgot"}
										className="authLink"
									>
										Forgot password
									</Link>
								</Box>
							</Grid>
							<Grid item xs={12}>
								<FormControl>
									<Button variant="contained" color="primary">
										Sign in
									</Button>
								</FormControl>
							</Grid>
							<Grid item xs={12}>
								<Box className="authOption">
									<Typography variant="body2"> or </Typography>
								</Box>
							</Grid>
						</Grid>
						<Box>
							<FormControl>
								<Button
									startIcon={<OrcidIcon />}
									variant="contained"
									className="authlightButton"
								>
									Sign in ORCID
								</Button>
							</FormControl>
						</Box>
						<Box className="authFooter">
							<FormControl>
								<Typography variant="body1">
									Don’t have an account? <Link to={"/register"}>Register</Link>
								</Typography>
							</FormControl>
						</Box>
					</form>
				</Paper>
			</Box>
		</>
	);
};
export default Login;
