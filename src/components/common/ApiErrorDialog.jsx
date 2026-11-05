import { useEffect, useReducer } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Stack,
  Typography,
  Chip,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { apiError$ } from "../../api/apiErrorBus";
import { readableErrorMessage } from "../../api/errorMessage";
import { vars } from "../../theme/variables";

const { gray100, gray200, gray600, gray800, error500, error700 } = vars;

// Listens on the API error bus and shows a modal listing the requests that
// failed, with the queried URL and the message returned by the backend.
const errorKey = (error) => `${error?.context || ""}|${error?.url || ""}|${error?.status || ""}`;

const INITIAL_STATE = { open: false, errors: [] };

const reducer = (state, action) => {
  switch (action.type) {
    case "report": {
      const isKnown = state.errors.some((e) => errorKey(e) === errorKey(action.error));
      if (isKnown) return state;
      // A failure arriving while the dialog fades out starts a fresh list rather than reviving the
      // ones the user just dismissed.
      const errors = state.open ? [...state.errors, action.error] : [action.error];
      return { open: true, errors };
    }
    case "dismiss":
      return { ...state, open: false };
    case "exited":
      return state.open ? state : INITIAL_STATE;
    default:
      return state;
  }
};

const ApiErrorDialog = () => {
  const [{ open, errors }, dispatch] = useReducer(reducer, INITIAL_STATE);

  useEffect(() => {
    const sub = apiError$.subscribe((error) => dispatch({ type: "report", error }));
    return () => sub.unsubscribe();
  }, []);

  const handleClose = () => dispatch({ type: "dismiss" });

  // The list is kept until the exit transition ends: emptying it on dismiss re-renders the fading
  // dialog with no content, which shows up as a second, smaller dialog behind the closing one.
  const handleExited = () => dispatch({ type: "exited" });

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      TransitionProps={{ onExited: handleExited }}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, pr: 6 }}>
        <ErrorOutlineIcon sx={{ color: error500 }} />
        <Typography component="span" sx={{ fontWeight: 600, color: gray800 }}>
          {errors.length > 1 ? `${errors.length} requests failed` : "Request failed"}
        </Typography>
        <IconButton
          onClick={handleClose}
          sx={{ position: "absolute", right: 8, top: 8, color: gray600 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {errors.map((error, index) => (
            <Box
              key={`${error?.url || "err"}-${index}`}
              sx={{
                border: `1px solid ${gray200}`,
                borderRadius: "0.5rem",
                p: 1.5,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                {error?.status != null && (
                  <Chip
                    size="small"
                    label={`HTTP ${error.status}`}
                    sx={{ color: error700, borderColor: error500 }}
                    variant="outlined"
                  />
                )}
                {error?.context && (
                  <Typography variant="body2" sx={{ color: gray600 }}>
                    {error.context}
                  </Typography>
                )}
              </Stack>
              {error?.url && (
                <Box
                  sx={{
                    background: gray100,
                    borderRadius: "0.375rem",
                    p: 1,
                    mb: 1,
                    fontFamily: "monospace",
                    fontSize: "0.8125rem",
                    wordBreak: "break-all",
                    color: gray800,
                  }}
                >
                  {error.url}
                </Box>
              )}
              <Typography variant="body2" sx={{ color: gray600, wordBreak: "break-word" }}>
                {readableErrorMessage(error?.message) || "The backend did not return a message."}
              </Typography>
            </Box>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="contained">
          Dismiss
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApiErrorDialog;
