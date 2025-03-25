import * as React from "react";
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  Grid,
  Paper,
  Typography,
  Alert,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import Checkbox from "@mui/material/Checkbox";
import { Link, useNavigate } from "react-router-dom";
import { CheckedIcon, UncheckedIcon, OrcidIcon } from "../../Icons";
import FormField from "./UI/Formfield";
import PasswordField from "./UI/PasswordField";
import { handleLogin } from "../../api/endpoints/index";
import { API_CONFIG } from "../../config";
import { GlobalDataContext } from "../../contexts/DataContext";
import * as yup from "yup";

const schema = yup.object().shape({
  username: yup.string().required().min(3),
  password: yup.string().required().min(6),
});

const Login = () => {
  const [formData, setFormData] = React.useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = React.useState({});
  const { setUserData } = React.useContext(GlobalDataContext);
  const navigate = useNavigate();

  React.useEffect(() => {
    let eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
    let eventer = window[eventMethod];
    let messageEvent = eventMethod === "attachEvent" ? "onmessage" : "message";
    eventer(messageEvent, function (e) {
      console.log(e);
      
      let response = {
        code: "200",
        status: "200",
        username: "johndoe",
        email: "johndoe@gmail.com",
        token: "1234567890",
        orcid: "0000-0000-0000-0000",
      };

      if(response.code === 200) {
        setUserData({ username: response.username, email: response.email, id: response.orcid });
        navigate("/");
      } else if (response.code === 401) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          auth: "Invalid username or password. Please try again",
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          auth: "An unknown error occurred. Please try again",
        }));
      }
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const loginUser = async () => {
    try {
      await schema.validate(formData, { abortEarly: false })
      setErrors({})

      await handleLogin(formData.username, formData.password)
    } catch (error) {
      console.error("Login error:", error);
      setErrors((prevErrors) => ({
        ...prevErrors,
        auth: "An unknown error occurred. Please try again",
      }));
    }
  };

  const handleOrcidSignIn = () => {
    const orcidSignInUrl = API_CONFIG.OLYMPIAN_GODS + API_CONFIG.REAL_API.LOGIN_ORCID;
    window.open(orcidSignInUrl, "Orcid Sign In", "width=600,height=800").focus();
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
        {errors.auth && <Alert severity="error" sx={{ mt: 2 }}>{errors.auth}</Alert>}
        <form className="authForm">
          <Grid container spacing={2.5}>
            <FormField
              name="username"
              label="Username"
              helperText="Required"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleInputChange}
              errorMessage={errors.username}
            />
            <PasswordField
              name="password"
              label="Password"
              placeholder="Enter your password"
              helperText="Required"
              value={formData.password}
              onChange={handleInputChange}
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
              <Typography variant="body2" style={{ textAlign: "center", paddingBottom: '1rem'}}>
                or
              </Typography>
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
