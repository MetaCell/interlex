import * as React from "react";
import {
  Box,
  Button,
  FormControl,
  Grid,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import * as yup from "yup";
import FormField from "./UI/Formfield";
import { API_CONFIG } from "../../config";
import { useCookies } from 'react-cookie';
import PasswordField from "./UI/PasswordField";
import { ArrowBack } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
// import { GlobalDataContext } from "../../contexts/DataContext";

const OLYMPIAN_GODS = import.meta.env.MODE === "production" ? "" : API_CONFIG.OLYMPIAN_GODS;
const popups = []; // Array to keep track of open popups

const closePopups = () => {
  popups.forEach(popup => {
    if (popup && !popup.closed) {
      popup.close();
    }
  });
  popups.length = 0; // Clear the array
}

const schema = yup.object().shape({
  email: yup.string().email().required(),
  username: yup.string().required().min(3),
  password: yup.string().required().min(10),
  confirmPassword: yup.string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password'), null], 'Passwords must match'),
});

const Register = () => {
  const [formData, setFormData] = React.useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(false);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [existingCookies, setCookie, removeCookie] = useCookies(['session']);
  const prevSnackbarOpen = React.useRef(snackbarOpen);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (prevSnackbarOpen.current && !snackbarOpen) {
      closePopups();
      navigate("/login");
    }
    prevSnackbarOpen.current = snackbarOpen;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snackbarOpen]);

  React.useEffect(() => {
      let eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
      let eventer = window[eventMethod];
      let messageEvent = eventMethod === "attachEvent" ? "onmessage" : "message";
      eventer(messageEvent, function (e) {
        if (!(e.data?.orcid_meta || e.data?.redirect || e.data?.interlex)) return;
        const { cookies } = e.data;
        const { code, errors, redirect } = e.data.interlex;

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
        }

        if (redirect) {
          handleRedirectInPopup(redirect);
          return;
        }

        if (code === 200 || code === 302) {
          setSnackbarOpen(true);
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
      });

      setIsLoading(false)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoading]);

  const handleRedirectInPopup = (url) => {
    setErrors({})
    setIsLoading(true);
    const finalURL = `${OLYMPIAN_GODS}${url.includes('?') ? url + "&aspopup=true" : url + "?aspopup=true"}`;
    const popup = window.open(finalURL, "registrationRedirect", "width=600,height=600");
    if (popup) {
      popup.focus();
    } else {
      alert("Popup blocked. Please allow popups for this site.");
      setErrors((prev) => ({
        ...prev,
        auth: "Popup blocked. Please allow popups for this site.",
      }));
    }
  }

  const registerUser = async () => {
    try {
      await schema.validate(formData, { abortEarly: false })
      setErrors({})
      setIsLoading(true);

      // send a POST request to the server with the form data in a popup window
      const dataForm = document.createElement("form");
      dataForm.action = `${OLYMPIAN_GODS}${API_CONFIG.REAL_API.NEWUSER_ILX}?from=orcid-login&aspopup=true`;
      dataForm.method = "POST";
      dataForm.style.display = "none";
      dataForm.target = "postPopup";
      dataForm.enctype = "application/x-www-form-urlencoded";
      for (const key in formData) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = formData[key];
        dataForm.appendChild(input);
      }
      document.body.appendChild(dataForm);
      const popup = window.open("", "registrationPopup", "width=600,height=600");
      if (popup) {
        dataForm.submit();
        popup.focus();
      } else {
        alert("Popup blocked. Please allow popups for this site.");
        setErrors((prev) => ({
          ...prev,
          auth: "Popup blocked. Please allow popups for this site.",
        }));
        setIsLoading(false);
      }

      document.body.removeChild(dataForm);
    } catch (error) {
      console.error("Registration error:", error);
      setErrors((prevErrors) => ({
        ...prevErrors,
        auth: error.message + " - " + error.errors?.[0] || " - An unknown error occurred. Please try again",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && (
        <Box sx={{ height: 1, width: 1, top: 0, left: 0, position: 'absolute', backgroundColor: 'rgba(255, 255, 255, 0.8)', zIndex: 1000 }}>
          <Box sx={{ height: 1, width: 1, top: '100%', left: '100%', position: 'relative', transform: 'translate(-50%, -50%)' }}>
            <CircularProgress />
          </Box>
        </Box>
      )}
      <Box className="authArea">
        <Paper className="authPaper" sx={{ p: 5, maxWidth: 528, flexGrow: 1 }}>
          <Link variant="text" to={"/"} className="authLink">
            <ArrowBack />
            Return to page
          </Link>
          <Typography variant="h4">Register a new account and join</Typography>

          {errors.auth && <Alert severity="error" sx={{ mt: 2 }}>{errors.auth}</Alert>}

          <form className="authForm">
            <Grid container spacing={2.5}>
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
              <PasswordField
                label="Confirm Password"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                errorMessage={errors.confirmPassword}
                helperText="Passwords must match"
              />
              <Grid item xs={12}>
                <FormControl>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={registerUser}
                    disabled={formData.password !== formData.confirmPassword || !formData.password || !formData.confirmPassword}
                  >
                    Register
                  </Button>
                </FormControl>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={10000}
        onClose={() => setSnackbarOpen(false)}
        message="User Registration successful, please login with your credentials"
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
    </>
  );
};

export default Register;
