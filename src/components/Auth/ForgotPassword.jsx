import * as React from "react";
import { Box, Button, FormControl, Grid, Paper, Typography } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import FormField from "./UI/Formfield";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../api/endpoints/apiService";

const ForgotPassword = () => {
  const [username, setUsername] = React.useState("");
  const [error, setError] = React.useState("");

  const handleForgotPassword = async () => {
    try {
      await forgotPassword({username: username});
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
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
                label="Username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                errorMessage={error}
              />
              <Grid item xs={12}>
                <FormControl>
                  <Button variant="contained" color="primary" onClick={handleForgotPassword}>
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