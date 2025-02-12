import * as React from "react";
import {
  Box,
  Button,
  FormControl,
  Grid,
  Paper,
  Typography,
  Alert,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import FormField from "./UI/Formfield";
import PasswordField from "./UI/PasswordField";
import { handleRegister } from "../../api/endpoints/index";

const Register = () => {
  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    organization: "",
  });

  const [errors, setErrors] = React.useState({});
  const [errorMessage, setErrorMessage] = React.useState("");
  const navigate = useNavigate();

  const registerUser = async () => {
    try {
      const response = await handleRegister(
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.password,
        formData.organization
      );
      
      if (response.status === 200) {
        navigate("/");
      } else {
        const errorData = await response.json();
        setErrors(errorData.errors || {});
        setErrorMessage(errorData.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <>
      <Box className="authArea">
        <Paper className="authPaper" sx={{ p: 5, maxWidth: 760, flexGrow: 1 }}>
          <Link variant="text" to={"/login"} className="authLink">
            <ArrowBack />
            Return to page
          </Link>
          <Typography variant="h4">Register a new account and join</Typography>

          {errorMessage && <Alert severity="error" sx={{ mt: 2 }}>{errorMessage}</Alert>}

          <form className="authForm">
            <Grid container spacing={2.5}>
              <FormField
                xs={6}
                label="First name"
                placeholder="Enter your name"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                error={!!errors.firstName}
                helperText={errors.firstName}
              />
              <FormField
                xs={6}
                label="Last name"
                placeholder="Enter your surname"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                error={!!errors.lastName}
                helperText={errors.lastName}
              />
              <FormField
                label="Email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                error={!!errors.email}
                helperText={errors.email}
              />
              <PasswordField
                label="Password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                error={!!errors.password}
                helperText={errors.password}
              />
              <Grid item xs={12}>
                <FormField
                  label="Organization"
                  placeholder="Enter your organization"
                  value={formData.organization}
                  onChange={(e) =>
                    setFormData({ ...formData, organization: e.target.value })
                  }
                  error={!!errors.organization}
                  helperText={errors.organization}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl>
                  <Button variant="contained" color="primary" onClick={registerUser}>
                    Register
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