import PropTypes from "prop-types";
import { Alert, Snackbar } from "@mui/material";

const SUCCESS_HIDE_MS = 3000;

// The one place a request outcome is announced, so every screen shows it at the same spot and in
// the same filled Alert. Errors stay until dismissed: they usually need reading.
const FeedbackSnackbar = ({ feedback, onClose, autoHideDuration }) => {
  const handleClose = (_, reason) => {
    if (reason === "clickaway") return;
    onClose();
  };

  return (
    <Snackbar
      open={!!feedback}
      autoHideDuration={autoHideDuration ?? (feedback?.severity === "error" ? null : SUCCESS_HIDE_MS)}
      onClose={handleClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      {feedback ? (
        <Alert onClose={handleClose} severity={feedback.severity} variant="filled" sx={{ width: "100%" }}>
          {feedback.message}
        </Alert>
      ) : undefined}
    </Snackbar>
  );
};

FeedbackSnackbar.propTypes = {
  feedback: PropTypes.shape({
    severity: PropTypes.oneOf(["success", "info", "warning", "error"]).isRequired,
    message: PropTypes.node.isRequired,
  }),
  onClose: PropTypes.func.isRequired,
  autoHideDuration: PropTypes.number,
};

export default FeedbackSnackbar;
