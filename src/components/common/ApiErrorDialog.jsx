import { useEffect, useState } from "react";
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
import { vars } from "../../theme/variables";

const { gray100, gray200, gray600, gray800, error500, error700 } = vars;

// Listens on the API error bus and shows a modal listing the requests that
// failed, with the queried URL and the message returned by the backend.
const ApiErrorDialog = () => {
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    const sub = apiError$.subscribe((error) => {
      setErrors((prev) => {
        const key = `${error?.context || ""}|${error?.url || ""}|${error?.status || ""}`;
        // Avoid stacking the exact same failure multiple times.
        if (prev.some((e) => `${e.context || ""}|${e.url || ""}|${e.status || ""}` === key)) {
          return prev;
        }
        return [...prev, error];
      });
    });
    return () => sub.unsubscribe();
  }, []);

  const handleClose = () => setErrors([]);

  return (
    <Dialog open={errors.length > 0} onClose={handleClose} maxWidth="sm" fullWidth>
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
                {error?.message || "The backend did not return a message."}
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
