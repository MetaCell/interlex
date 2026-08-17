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
import CustomFormField from "../common/CustomFormField";
import { API_CONFIG } from "../../config";
import { useCookies } from 'react-cookie';
import PasswordField from "./UI/PasswordField";
import { ArrowBack } from "@mui/icons-material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { OrcidIcon } from "../../Icons";
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

// Finishing an ORCID sign-in, the backend asks for "username, email, and optionally password" —
// that account can already authenticate through ORCID. A plain registration has no other way in,
// so there the password stays required.
const buildSchema = (passwordOptional) => yup.object().shape({
  email: yup.string().email().required(),
  username: yup.string().required().min(3),
  password: passwordOptional ? yup.string().min(10) : yup.string().required().min(10),
  confirmPassword: yup.string().when('password', {
    is: (value) => !!value,
    then: (field) => field
      .required('Please confirm your password')
      .oneOf([yup.ref('password')], 'Passwords must match'),
    otherwise: (field) => field.optional(),
  }),
});

// Where an ORCID-verified registration posts when the backend didn't name an endpoint itself.
const ORCID_REGISTRATION_PATH = "/u/priv/user-new?from=orcid-login";

// ORCID authenticated but no InterLex account is linked to it — what sent the user to this page.
const NO_LINKED_ACCOUNT = 412;

const Register = () => {
  const orcidState = useLocation().state?.orcid;
  const [formData, setFormData] = React.useState({
    username: "",
    // ORCID reports an email only when the account made it public, so this is a head start when
    // it is there and an ordinary empty field when it is not.
    email: orcidState?.email || "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(false);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [existingCookies, setCookie, removeCookie] = useCookies(['session']);
  const prevSnackbarOpen = React.useRef(snackbarOpen);
  const navigate = useNavigate();
  const location = useLocation();

  // Arriving from an ORCID sign-in that found no InterLex account (412). The ORCID identity is
  // already verified and its session established, so this registration only has to create the
  // InterLex half: it posts to the orcid-new endpoint, which does not send the user back through
  // ORCID authorization.
  const orcid = location.state?.orcid || null;
  const isOrcidVerified = Boolean(location.state && 'orcid' in location.state);
  const registrationPath = isOrcidVerified
    ? (location.state?.registrationPath || ORCID_REGISTRATION_PATH)
    // Pre-existing: the plain form has always posted with this marker.
    : `${API_CONFIG.REAL_API.NEWUSER_ILX}?from=orcid-login`;

  React.useEffect(() => {
    if (prevSnackbarOpen.current && !snackbarOpen) {
      closePopups();
      navigate("/login", { state: { from: location.state?.from } });
    }
    prevSnackbarOpen.current = snackbarOpen;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snackbarOpen]);

  React.useEffect(() => {
      const onMessage = function (e) {
        if (!(e.data?.orcid_meta || e.data?.redirect || e.data?.interlex)) return;
        const { cookies } = e.data;
        const { code, errors, redirect, groupname, message } = e.data.interlex;

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

        // Late arrivals from the ORCID sign-in that sent the user here: 412 is the very reason
        // this page is open, and the registration endpoint's 200 is an instruction ("please
        // complete registration by posting username, email, and optionally password"), not an
        // account. Treating that 200 as success raised the "registration successful" snackbar and
        // bounced the user to /login ten seconds after landing on the form.
        if (code === NO_LINKED_ACCOUNT) return;
        if (code === 200 && !groupname && message) return;

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
      };

    // Removed on cleanup: this effect re-runs on every isLoading change, so without it each
    // attempt left another live listener behind and one popup message ran the handler repeatedly.
    window.addEventListener("message", onMessage);
    setIsLoading(false)
    return () => window.removeEventListener("message", onMessage);
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
      await buildSchema(isOrcidVerified).validate(formData, { abortEarly: false })
      setErrors({})
      setIsLoading(true);

      // send a POST request to the server with the form data in a popup window
      const dataForm = document.createElement("form");
      dataForm.action = `${OLYMPIAN_GODS}${registrationPath}${registrationPath.includes("?") ? "&" : "?"}aspopup=true`;
      dataForm.method = "POST";
      dataForm.style.display = "none";
      dataForm.target = "postPopup";
      dataForm.enctype = "application/x-www-form-urlencoded";
      // The verified ORCID travels with the form so the account is linked on creation. Empty
      // fields are dropped rather than posted blank — the password is optional on this path.
      const payload = Object.fromEntries(
        Object.entries(orcid?.orcid ? { ...formData, orcid: orcid.orcid } : formData)
          .filter(([, value]) => String(value ?? "").trim() !== "")
      );
      for (const key in payload) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = payload[key];
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
          <Typography variant="h4">
            {isOrcidVerified ? "Finish creating your InterLex account" : "Register a new account and join"}
          </Typography>

          {isOrcidVerified && (
            <Alert severity="success" icon={<OrcidIcon />} sx={{ mt: 2 }}>
              ORCID verified{orcid?.name ? ` as ${orcid.name}` : ""}
              {orcid?.orcid ? ` (${orcid.orcid})` : ""}. No InterLex account is linked to it yet —
              choose your InterLex credentials below to finish.
            </Alert>
          )}

          {errors.auth && <Alert severity="error" sx={{ mt: 2 }}>{errors.auth}</Alert>}

          <form className="authForm">
            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <CustomFormField
                  label="Username"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  errorMessage={errors.username}
                  isRequired
                />
              </Grid>
              <Grid item xs={12}>
                <CustomFormField
                  label="Email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  errorMessage={errors.email}
                  isRequired
                />
              </Grid>
              <Grid item xs={12}>
                <PasswordField
                  label={isOrcidVerified ? "Password (optional)" : "Password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  errorMessage={errors.password}
                  isRequired={!isOrcidVerified}
                />
              </Grid>
              <Grid item xs={12}>
                <PasswordField
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  errorMessage={errors.confirmPassword}
                  isRequired={!isOrcidVerified}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={registerUser}
                    // With ORCID already verified a blank password is a valid choice, so the only
                    // bar is that whatever was typed matches its confirmation.
                    disabled={
                      formData.password !== formData.confirmPassword ||
                      (!isOrcidVerified && (!formData.password || !formData.confirmPassword))
                    }
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
