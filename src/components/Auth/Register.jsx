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
import { register } from "../../api/endpoints/apiService";
import * as yup from "yup";

const schema = yup.object().shape({
  firstName: yup.string().required("First name is a required field"),
  lastName: yup.string().required("Last name is a required field"),
  email: yup.string().email().required(),
  username: yup.string().required().min(3),
  password: yup.string().required().min(6),
  organization: yup.string().required()
});

const Register = () => {
  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    organization: "",
  });

  const [errors, setErrors] = React.useState({});
  const navigate = useNavigate();

  const registerUser = async () => {
    try {
      await schema.validate(formData, { abortEarly: false })
      setErrors({})

      const response = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        organization: formData.organization
      });
      
      if (response.status === 200) {
        navigate("/");
      } else if(response.status === 401) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            auth: "Invalid data. Please try again",
        })) 
      } else {
        const errorData = await response.json();
        setErrors((prevErrors) => ({
          ...prevErrors,
          auth: errorData.message || "An unknown error occurred. Please try again",
        }));
      }
    } catch (error) {
      console.error("Registration error:", error);
      setErrors((prevErrors) => ({
        ...prevErrors,
        auth: "An unknown error occurred. Please try again",
      }));
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

          {errors.auth && <Alert severity="error" sx={{ mt: 2 }}>{errors.auth}</Alert>}

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
                errorMessage={errors.firstName}
                helperText="Required"
              />
              <FormField
                xs={6}
                label="Last name"
                placeholder="Enter your surname"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                errorMessage={errors.lastName}
                helperText="Required"
              />
              <FormField
                label="Username"
                placeholder="Enter your username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                errorMessage={errors.username}
                helperText="Required"
              />
              <FormField
                label="Email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                errorMessage={errors.email}
                helperText="Required"
              />
              <PasswordField
                label="Password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                errorMessage={errors.password}
                helperText="Required"
              />
              <Grid item xs={12}>
                <FormField
                  label="Organization"
                  placeholder="Enter your organization"
                  value={formData.organization}
                  onChange={(e) =>
                    setFormData({ ...formData, organization: e.target.value })
                  }
                  errorMessage={errors.organization}
                  helperText="Required"
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