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
import { CLIENT_ID, REDIRECT_URI, ORCID_LINK } from "../../model/frontend/auth";
import * as mockApi from "../../api/endpoints/swaggerMockMissingEndpoints";
import * as yup from 'yup';

const useMockApi = () => mockApi;

const schema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().required().min(6),
});

const Login = () => {
  const [formData, setFormData] = useState({
	email: '',
	password: ''
  });
  const [errors, setErrors] = useState({});
  const label = { inputProps: { "aria-label": "Checkbox demo" } };
  const { login } = useMockApi();
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
	e.preventDefault();
	try {
	  await schema.validate(formData, { abortEarly: false })
	  setErrors({})

	  login(formData).then(response => {
		if(response.status === 200){
			localStorage.setItem("token", response.token)
		    navigate("/")
		}
	  })
	} catch (err) {
		if (err) {
		  const newErrors = {}
		  err.inner.forEach((error) => {
			if (error.path) {
			  newErrors[error.path] = error.message
			}
		  })
		  setErrors(newErrors)
		}
	}
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleOrcidLogin = () => {
    const authUrl = `${ORCID_LINK}/oauth/authorize?client_id=${CLIENT_ID}&response_type=code&scope=/authenticate&redirect_uri=${REDIRECT_URI}`;
	window.location.href = authUrl;
  };
  
  return (
    <Box className="authArea">
	  <Paper
	    className="authPaper"
		sx={{
		  maxWidth: 528,
		  flexGrow: 1,
		}}
	  >
		<Link variant="text" to={"/"} className="authLink">
		  <ArrowBack />
		  Return to page
		</Link>
		<Typography variant="h4">Log in to your account</Typography>
		<Typography variant="body1">Welcome! Please enter your details.</Typography>
		<form className="authForm">
		  <Grid container spacing={2.5}>
			<FormField
			  label="Email"
			  helperText="Required"
			  placeholder="Enter your email"
			  value={formData.email}
			  name="email"
			  onChange={handleChange}
			  errorMessage={errors.email}
			/>
			<PasswordField
			  xs={12}
			  label="Password"
			  placeholder="Enter your password"
		      helperText="Required"
			  value={formData.password}
			  name="password"
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
				<Box display={"flex"} alignItems={"center"}>
				  <FormControlLabel
				    control={
					  <Checkbox
						size="small"
						icon={<UncheckedIcon />}
						checkedIcon={<CheckedIcon />}
						{...label}
						defaultChecked
						color="primary"
					  />
					}
				    label="Remember for 30 days"
				  />
				</Box>
				<Link
				  color="primary"
				  variant="text"
				  to={"/forgot"}
				  className="authLink"
				>
				  Forgot password
				</Link>
			  </Box>
			</Grid>
			<Grid item xs={12}>
			  <FormControl>
				<Button variant="contained" color="primary" onClick={handleSubmit}>
				  Sign in
				</Button>
			  </FormControl>
			</Grid>
		    <Grid item xs={12}>
			  <Box className="authOption">
				<Typography variant="body2"> or </Typography>
			  </Box>
		    </Grid>
		  </Grid>
		  <Box>
			<FormControl>
			  <Button
			    startIcon={<OrcidIcon />}
				variant="contained"
				className="authlightButton"
				onClick={handleOrcidLogin}
			   >
				Sign in ORCID
			  </Button>
			</FormControl>
		  </Box>
		    <Box className="authFooter">
			  <FormControl>
				<Typography variant="body1">
				  Don't have an account? <Link to={"/register"}>Register</Link>
				</Typography>
			  </FormControl>
			</Box>
		</form>
	  </Paper>
    </Box>
  );
};
export default Login;
