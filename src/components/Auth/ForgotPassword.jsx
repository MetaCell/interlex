import * as React from "react";
import {
	Box,
	Button,
	FormControl,
	Grid,
	Paper,
	Typography,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import FormField from "./UI/Formfield";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
	return (
		<>
			<Box className="authArea">
				<Paper
					className="authPaper"
					sx={{
						p: 5,
						maxWidth: 528,
						flexGrow: 1,
					}}
				>
					<Link variant="text" to={"/login"} className="authLink">
						<ArrowBack />
						Back to log in
					</Link>
					<Typography variant="h4">Forgot password</Typography>
					<Typography variant="body1">
						Enter your email address and we’ll send you an email with a link to
						reset your password.
					</Typography>
					<form className="authForm">
						<Grid container spacing={2.5}>
							<FormField
								label="Email"
								helperText="Required"
								placeholder="Enter your email"
							/>
							<Grid item xs={12}>
								<FormControl>
									<Button variant="contained" color="primary">
										Reset my password
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
export default ForgotPassword;
