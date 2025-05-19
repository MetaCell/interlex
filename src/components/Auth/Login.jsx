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
  CircularProgress
} from "@mui/material";
import * as yup from "yup";
import FormField from "./UI/Formfield";
import { useCookies } from 'react-cookie';
import { requestUserSettings } from "./utils";
import Checkbox from "@mui/material/Checkbox";
import PasswordField from "./UI/PasswordField";
import { ArrowBack } from "@mui/icons-material";
import { API_CONFIG, BASE_URL } from "../../config";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../api/endpoints/apiService";
import { GlobalDataContext } from "../../contexts/DataContext";
import { CheckedIcon, UncheckedIcon, OrcidIcon } from "../../Icons";


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
  const [isLoading, setIsLoading] = React.useState(false);
  // eslint-disable-next-line no-unused-vars
  const [cookies, setCookie] = useCookies(['session']);

  const { setUserData } = React.useContext(GlobalDataContext);
  const navigate = useNavigate();

  React.useEffect(() => {
    let eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
    let eventer = window[eventMethod];
    let messageEvent = eventMethod === "attachEvent" ? "onmessage" : "message";
    eventer(messageEvent, async function (e) {
      if (!e.data || !e.data.orcid_meta) return;
      const { code, cookies, groupname } = e.data;
      if (code === 200 || code === 302) {
        const _cookies = JSON.parse(cookies);
        const sessionCookie = _cookies.find(cookie => cookie.name === "session");
        let expires = new Date()
        if (sessionCookie) {
          expires.setTime(expires.getTime() + (2 * 24 * 60 * 60 * 1000)); // 2 days
          setCookie('session', sessionCookie.value, { path: '/', domain: BASE_URL, secure: false, sameSite: false, expires, httpOnly: false });
        }
        const userData = await requestUserSettings(groupname);
        localStorage.setItem(API_CONFIG.SESSION_DATA.SETTINGS, JSON.stringify(userData));
        localStorage.setItem(API_CONFIG.SESSION_DATA.COOKIE, JSON.stringify({
          name: 'session',
          value: sessionCookie.value,
          expires: expires
        }));
        setUserData({
          name: userData['groupname'],
          id: userData['orcid'],
          email: userData?.emails[0]?.email,
          role: userData['own-role'],
          groupname: userData['groupname'],
          settings: userData
        });
        navigate("/")
      } else if (code === 401) {
        setErrors((prev) => ({
          ...prev,
          auth: "Invalid username or password. Please try again",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          auth: "An unknown error occurred. Please try again",
        }));
      }
    });

    setIsLoading(false)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const loginUser = async () => {
    try {
      setIsLoading(true)
      await schema.validate(formData, { abortEarly: false })
      setErrors({})

      const result = await login({ username: formData.username, password: formData.password })
      if (!result.data || !result.data?.orcid_meta) {
        setErrors((prev) => ({
          ...prev,
          auth: "Interlex API is not returning the user information, reminder to ask Tom to send the groupname back so that we can query the priv/setting endpoint to get the rest of the info required",
        }));
      } else {
        const { code, orcid_meta } = result.data;
        if (code === 200 || code === 302) {
          // TODO: the backend should return the groupname, for now is just returning a message.
          setUserData({ name: orcid_meta.name, id: orcid_meta.orcid });
        }
        navigate("/")
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors((prevErrors) => ({
        ...prevErrors,
        auth: error.message + " - " + error.errors?.[0] || " - An unknown error occurred. Please try again",
      }));
    } finally {
      setIsLoading(false)
    }
  };

  const handleOrcidSignIn = () => {
    setIsLoading(true)
    const orcidSignInUrl = `${API_CONFIG.OLYMPIAN_GODS}${API_CONFIG.REAL_API.ORCID_SIGNIN}?aspopup=true`;
    window.open(orcidSignInUrl, "Orcid Sign In", "width=600,height=800").focus();
  };

  return (
    <Box className="authArea">
      {isLoading ? <Box sx={{ height: 1, width: 1, display: "flex", alignItems: "center", justifyContent: "center"}}>
        <CircularProgress />
      </Box> : (
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
      )}
    </Box>
  );
};

export default Login;
