import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import * as yup from 'yup';
import OrcidWidget from "./UI/OrcidWidget";

const schema = yup.object().shape({
  username: yup.string().required().min(3),
  password: yup.string().required().min(6),
});

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const loginUser = async () => {
    try {
      await schema.validate(formData, { abortEarly: false })
      setErrors({})

      try {
        await handleLogin(formData.username || "", formData.password || "")
        navigate("/")
      } catch (error) {
        if (error.status === 401) {
          setErrors({
            auth: "Invalid username or password. Please try again",
          })
        } else {
          setErrors({
            auth: `${error.message}. Please try again` || "An unknown error occured. Please try again",
          })
        }
      }
    } catch (error) {
      const newErrors = {}
      error.inner.forEach((e) => {
        if (e.path) {
          newErrors[e.path] = e.message
        }
      })
      setErrors(newErrors)
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

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
          {errors.auth && <Typography variant="body2" sx={{ marginBottom: "0.375rem", color: "#F04438" }}>{errors.auth}</Typography>}
          <Grid container spacing={2.5}>
            <FormField
              name="username"
              label="Username"
              helperText="Required"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              errorMessage={errors.username}
            />
            <PasswordField
              name="password"
              label="Password"
              placeholder="Enter your password"
              helperText="Required"
              value={formData.password}
              onChange={handleChange}
              errorMessage={errors.password}
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
              <Typography variant="body2" sx={{textAlign: 'center', paddingBottom: '10px'}}> or </Typography>
            </Grid>
          </Grid>
          <FormControl>
            <OrcidWidget clientId={"APP-W38FCVGUSBXCUI3B"} redirectUri={"https://uri.olympiangods.org/"} />
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
