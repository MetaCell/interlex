import * as React from "react";
import { Link } from "react-router-dom";
import PasswordField from "./UI/PasswordField";
import { ArrowBack } from "@mui/icons-material";
import { Box, Button, FormControl, Grid, Paper, Typography } from "@mui/material";

const ResetPassword = () => {
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const resetPassword = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      // Call the reset password API
      // await handleResetPassword(password);
      console.log("Password reset successful");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <>
      <Box className="authArea">
        <Paper className="authPaper" sx={{ p: 5, maxWidth: 528, flexGrow: 1 }}>
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <PasswordField
                label="Confirm new password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Grid item xs={12}>
                <FormControl>
                  <Button variant="contained" color="primary" onClick={resetPassword}>
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
