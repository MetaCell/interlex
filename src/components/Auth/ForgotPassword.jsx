import * as React from "react";
import { Box, Button, FormControl, Grid, Paper, Typography } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import FormField from "./UI/Formfield";
import { Link } from "react-router-dom";
import { handleForgotPassword } from "../../api/endpoints/index";

const ForgotPassword = () => {
  const [email, setEmail] = React.useState("");

  const forgotPassword = async () => {
    try {
      await handleForgotPassword(email);
      console.log("Password reset email sent");
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
          <Typography variant="h4">Forgot password</Typography>
          <form className="authForm">
            <Grid container spacing={2.5}>
              <FormField
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Grid item xs={12}>
                <FormControl>
                  <Button variant="contained" color="primary" onClick={forgotPassword}>
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