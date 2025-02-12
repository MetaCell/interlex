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
import { Link } from "react-router-dom";
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

  const registerUser = async () => {
    try {
      await handleRegister(
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.password,
        formData.organization
      );
      console.log("Registration successful");
    } catch (error) {
      console.error("Registration error:", error);
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
              />
              <FormField
                xs={6}
                label="Last name"
                placeholder="Enter your surname"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />
              <FormField
                label="Email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <PasswordField
                label="Password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
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