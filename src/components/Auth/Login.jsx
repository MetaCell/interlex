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
import CustomFormField from "../common/CustomFormField";
import { useCookies } from 'react-cookie';
import { API_CONFIG } from "../../config";
import { requestUserSettings } from "./utils";
import Checkbox from "@mui/material/Checkbox";
import PasswordField from "./UI/PasswordField";
import { ArrowBack } from "@mui/icons-material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { login } from "../../api/endpoints/apiService";
import { GlobalDataContext } from "../../contexts/DataContext";
import { CheckedIcon, UncheckedIcon, OrcidIcon } from "../../Icons";

const OLYMPIAN_GODS = import.meta.env.MODE === "production" ? "" : API_CONFIG.OLYMPIAN_GODS;
const popups = [];

const schema = yup.object().shape({
  username: yup.string().required().min(3),
  password: yup.string().required().min(6),
});

const closePopups = () => {
  popups.forEach(popup => {
    if (popup && !popup.closed) {
      popup.close();
    }
  });
  popups.length = 0; // Clear the array
}

// The ORCID identity authenticated fine but no InterLex account is linked to it. That is a
// registration, not a failed login — and the ORCID half of it is already done.
const NO_LINKED_ACCOUNT = 412;

const Login = () => {
  const [formData, setFormData] = React.useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(false);
  const [existingCookies, setCookie, removeCookie] = useCookies(['session']);

  const { setUserData } = React.useContext(GlobalDataContext);
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/";

  // Hand the verified ORCID over to registration, which then asks only for the InterLex half.
  // `registrationPath` is the endpoint the backend itself names for finishing the account, so the
  // form posts where it was told to rather than to an address guessed here.
  const goToOrcidRegistration = React.useCallback((orcidMeta, registrationPath) => {
    closePopups();
    setIsLoading(false);
    navigate("/register", {
      state: { from: redirectTo, orcid: orcidMeta || null, registrationPath: registrationPath || null },
    });
  }, [navigate, redirectTo]);

  React.useEffect(() => {
    const onMessage = async function (e) {
      if (e.data?.source === "react-devtools-bridge") return; // Ignore messages from React DevTools
      if (!(e.data?.orcid_meta || e.data?.redirect || e.data?.interlex)) return;
      const { cookies } = e.data;
      const { code, errors, redirect, groupname } = e.data.interlex;
      // orcid-land-login reports the identity inside `interlex`; other steps put it at the top.
      const orcidMeta = e.data.interlex.orcid_meta || e.data.orcid_meta;

      if (cookies) {
        const _cookies = JSON.parse(cookies);
        const sessionCookie = _cookies && Object.prototype.hasOwnProperty.call(_cookies, 'session') ? _cookies['session'] : undefined;
        let expires = new Date()
        if (sessionCookie) {
          if (existingCookies['session']) {
            removeCookie('session', { path: '/' });
          }
          expires.setTime(expires.getTime() + (2 * 24 * 60 * 60 * 1000)); // 2 days
          setCookie(
            'session',
            sessionCookie,
            {
              path: '/',
              secure: false,
              sameSite: false,
              httpOnly: false
            }
          );
        }
        localStorage.setItem(API_CONFIG.SESSION_DATA.COOKIE, JSON.stringify({
          name: 'session',
          value: sessionCookie,
          expires: expires
        }));
        localStorage.setItem("token", sessionCookie)
      }

      // Checked before `redirect`, which this response also carries: 412 names the registration
      // endpoint there, and following it only walks the popup into a form asking for the very
      // fields our own /register page collects.
      if (code === NO_LINKED_ACCOUNT) {
        goToOrcidRegistration(orcidMeta, redirect);
        return;
      }

      if (redirect) {
        handleRedirectInPopup(redirect);
        return;
      }

      // The registration endpoint answers 200 with instructions and no groupname ("please complete
      // registration by posting username, email, and optionally password") — a session that can
      // sign nothing yet. Asking for settings here requests /undefined/priv/settings and 401s.
      if (!groupname && code === 200) {
        goToOrcidRegistration(orcidMeta, e.data.interlex.path || null);
        return;
      }

      if (code === 200 || code === 302) {
        // Retrieve user settings
        try {
          const userData = await requestUserSettings(groupname);
          localStorage.setItem(API_CONFIG.SESSION_DATA.SETTINGS, JSON.stringify(userData));
          setUserData({
            name: userData['groupname'],
            id: userData['orcid'],
            email: userData?.emails[0]?.email,
            role: userData['own-role'],
            groupname: userData['groupname'],
            settings: userData
          });
          closePopups();
          navigate(redirectTo, { replace: true });
        } catch (error) {
          console.error("Error fetching user settings:", error);
          removeCookie('session', { path: '/' });
          setErrors((prev) => ({
            ...prev,
            auth: "Failed to fetch user settings. Please try again",
          }));
        }
      } else if (code > 400 && code < 500) {
          let errorMessage = '';
          const keys = Object.keys(errors);
          if (keys.length > 0) {
            errorMessage = String(keys[0]) + ' ' + errors[keys[0]];
          }
          setErrors((prev) => ({
            ...prev,
            auth: errorMessage || "Invalid username or password. Please try again",
          }));
      } else {
        setErrors((prev) => ({
          ...prev,
          auth: "An unknown error occurred. Please try again",
        }));
      }
    };

    // Removed on cleanup: this effect re-runs on every isLoading change, and without it each
    // login attempt left another live listener behind — one popup message then ran the whole
    // handler once per attempt so far, firing duplicate requests and duplicate navigations.
    window.addEventListener("message", onMessage);
    setIsLoading(false)
    return () => window.removeEventListener("message", onMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const handleRedirectInPopup = (url) => {
    setErrors({})
    setIsLoading(true);
    const finalURL = `${OLYMPIAN_GODS}${url.includes('?') ? url + "&aspopup=true" : url + "?aspopup=true"}`;
    const popup = window.open(
      finalURL,
      "loginRedirect",
      "width=600,height=600"
    );
    if (popup) {
      popups.push(popup);
      popup.focus();
    } else {
      alert("Popup blocked. Please allow popups for this site.");
      setErrors((prev) => ({
        ...prev,
        auth: "Popup blocked. Please allow popups for this site.",
      }));
    }
  }

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
        try {
          const userData = await requestUserSettings(formData.username);
          localStorage.setItem(API_CONFIG.SESSION_DATA.SETTINGS, JSON.stringify(userData));
          setUserData({
            name: userData['groupname'],
            id: userData['orcid'],
            email: userData?.emails[0]?.email,
            role: userData['own-role'],
            groupname: userData['groupname'],
            settings: userData
          });
          closePopups();
          navigate(redirectTo, { replace: true });
        } catch (error) {
          console.error("Error fetching user settings:", error);
          removeCookie('session', { path: '/' });
          setErrors((prev) => ({
            ...prev,
            auth: "Failed to fetch user settings. Please try again",
          }));
        }
      } else {
        const { code, orcid_meta } = result.data;
        if (code === NO_LINKED_ACCOUNT) {
          goToOrcidRegistration(orcid_meta);
          return;
        }
        if (code === 200 || code === 302) {
          // TODO: the backend should return the groupname, for now is just returning a message.
          setUserData({ name: orcid_meta.name, id: orcid_meta.orcid });
        }
        closePopups();
        navigate(redirectTo, { replace: true });
      }
    } catch (error) {
      console.error("Login error:", error);
      // Same case as above, arriving as an HTTP status rather than in the body.
      if (error?.response?.status === NO_LINKED_ACCOUNT) {
        goToOrcidRegistration(error.response.data?.orcid_meta);
        return;
      }
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
    const orcidSignInUrl = `${OLYMPIAN_GODS}${API_CONFIG.REAL_API.ORCID_SIGNIN}?aspopup=true`;
    const popup = window.open(orcidSignInUrl, "orcidPopup", "width=600,height=800");
    if (popup) {
      popup.focus();
      popups.push(popup);
    } else {
      alert("Popup blocked. Please allow popups for this site.");
      setErrors((prev) => ({
        ...prev,
        auth: "Popup blocked. Please allow popups for this site.",
      }));
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (formData.username.trim() && formData.password.trim()) {
      loginUser();
    }
  };

  return (
    <Box className="authArea">
      {isLoading ? <Box sx={{ height: 1, width: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
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
          <form className="authForm" onSubmit={handleFormSubmit}>
            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <CustomFormField
                  name="username"
                  label="Username"
                  isRequired
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleInputChange}
                  errorMessage={errors.username}
                />
              </Grid>
              <Grid item xs={12}>
                <PasswordField
                  name="password"
                  label="Password"
                  placeholder="Enter your password"
                  value={formData.password}
                  isRequired
                  onChange={handleInputChange}
                  errorMessage={errors.password}
                />
              </Grid>
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
                  <Button variant="contained" color="primary" type="submit">
                    Sign in
                  </Button>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" style={{ textAlign: "center", paddingBottom: '1rem' }}>
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
