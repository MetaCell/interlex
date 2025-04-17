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
} from "@mui/material";
import * as yup from "yup";
import FormField from "./UI/Formfield";
import { API_CONFIG } from "../../config";
import PasswordField from "./UI/PasswordField";
import { ArrowBack } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { GlobalDataContext } from "../../contexts/DataContext";
// import { register } from "../../api/endpoints/apiService";

const schema = yup.object().shape({
  email: yup.string().email().required(),
  username: yup.string().required().min(3),
  password: yup.string().required().min(10),
});

const Register = () => {
  const [formData, setFormData] = React.useState({
    username: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(false);
  const { setUserData } = React.useContext(GlobalDataContext);
  const navigate = useNavigate();

  React.useEffect(() => {
      let eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
      let eventer = window[eventMethod];
      let messageEvent = eventMethod === "attachEvent" ? "onmessage" : "message";
      eventer(messageEvent, function (e) {
        if (!e.data || !e.data.orcid_meta) return;
        const { code, orcid_meta } = e.data;

        if (code === 200 || code === 302) {
          setUserData({ name: orcid_meta.name, id: orcid_meta.orcid });
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

  const registerUser = async () => {
    try {
      await schema.validate(formData, { abortEarly: false })
      setErrors({})
      setIsLoading(true);

      // send a POST request to the server with the form data in a popup window
      const dataForm = document.createElement("form");
      dataForm.action = `${API_CONFIG.REAL_API.NEWUSER_ILX}`;
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
      const popup = window.open("", "postPopup", "width=600,height=600");
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
