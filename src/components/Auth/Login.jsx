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
import { CheckedIcon, UncheckedIcon, OrcidIcon } from "../../Icons";
import FormField from "./UI/Formfield";
import PasswordField from "./UI/PasswordField";
import { handleLogin } from "../../api/endpoints/index";

const Login = () => {
  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const loginUser = async () => {
    try {
      await handleLogin(formData.email, formData.password);
      console.log("Login successful");
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleOrcidSignIn = () => {
    const originUrl = window.location.href;
    const orcidSignInUrl = `https://uri.olympiangods.org/u/ops/orcid-login`;
    window.location.href = orcidSignInUrl;
  };

  return (
    <Box className="authArea">
      <Paper className="authPaper" sx={{ maxWidth: 528, flexGrow: 1 }}>
        <Link variant="text" to={"/"} className="authLink">
          <ArrowBack />
          Return to page
        </Link>
        <Typography variant="h4">Log in to your account</Typography>
        <Typography variant="body1">Welcome! Please enter your details.</Typography>
        <form className="authForm">
          <Grid container spacing={2.5}>
            <FormField
              name="email"
              label="Email"
              helperText="Required"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
            />
            <PasswordField
              name="password"
              label="Password"
              placeholder="Enter your password"
              helperText="Required"
              value={formData.password}
              onChange={handleInputChange}
            />
            <Grid item xs={12}>
              <Box
                className="authRemember"
                display={"flex"}
                alignItems={"center"}
                justifyContent={"space-between"}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      icon={<UncheckedIcon />}
                      checkedIcon={<CheckedIcon />}
                      defaultChecked
                      color="primary"
                    />
                  }
                  label="Remember for 30 days"
                />
                <Link to={"/forgot"} className="authLink">
                  Forgot password
                </Link>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <FormControl>
                <Button variant="contained" color="primary" onClick={loginUser}>
                  Sign in
                </Button>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2"> or </Typography>
            </Grid>
          </Grid>
          <FormControl>
            <Button
              startIcon={<OrcidIcon />}
              variant="contained"
              className="authlightButton"
              onClick={handleOrcidSignIn}
            >
              Sign in with ORCID
            </Button>
          </FormControl>
          <Box className="authFooter">
            <Typography variant="body1">
              Don’t have an account? <Link to={"/register"}>Register</Link>
            </Typography>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default Login;
