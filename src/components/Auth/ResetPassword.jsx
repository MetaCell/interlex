import * as React from "react";
import {
	Box,
	Button,
	FormControl,
	Grid,
	Link,
	Paper,
	Typography,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import PasswordField from "./UI/PasswordField";

const ResetPassword = () => {
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
					<Typography variant="h4">Reset your password</Typography>
					<form className="authForm">
						<Grid container spacing={2.5}>
							<PasswordField
								label="New password"
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
export default ResetPassword;
