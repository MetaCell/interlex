import { useState, useContext } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import {
  IconButton,
  Popover,
  Stack,
  Typography,
  Button,
  TextField,
  Link,
  Tooltip,
  Alert,
  Divider,
} from "@mui/material";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import { CloseIcon, SendComment } from "../../../Icons";
import { GlobalDataContext } from "../../../contexts/DataContext";
import { postComment, commentPlaceholder, ANONYMOUS_AUTHOR } from "./commentService";

/**
 * The per-widget comment affordance (Figma 9272:85572 "commenting on cell card").
 *
 * The design replaced the spec's pencil-per-widget with a comment bubble that opens a popover
 * anchored to the widget, prefilled with the widget + cell context, plus a link out to the full
 * thread. There is no inline Discussion widget in the centre column, and no voting UI — spec
 * §2.6 and §2.8 are superseded on both counts.
 *
 * Commenting is not login-gated (spec §10.6): an unauthenticated comment posts as "Anonymous"
 * with an optional sign-in upgrade offered in the footer.
 */
const WidgetCommentButton = ({ widgetTitle, cellLabel, termId, group = "base", discussionHref }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [body, setBody] = useState("");
  const [status, setStatus] = useState(null); // { severity, message }
  const [sending, setSending] = useState(false);
  const { user } = useContext(GlobalDataContext);
  const navigate = useNavigate();

  const open = Boolean(anchorEl);
  const author = user?.username || user?.name;

  const handleOpen = (e) => {
    setAnchorEl(e.currentTarget);
    setBody(commentPlaceholder(widgetTitle, cellLabel));
    setStatus(null);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSending(false);
  };

  const handleSend = async () => {
    if (!body.trim()) return;
    setSending(true);
    setStatus(null);
    try {
      await postComment({ group, termId, body, widgetTitle, cellLabel, user });
      setStatus({ severity: "success", message: "Comment posted." });
      setBody("");
    } catch {
      // The discussions endpoint is not deployed yet (404 for every term id, ILX included), so
      // this is the expected path today. Say so rather than silently dropping the comment.
      setStatus({
        severity: "error",
        message: "Comments aren’t available yet — the discussions service is not deployed.",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Tooltip title="Comment on this widget">
        <IconButton onClick={handleOpen} aria-label={`Comment on ${widgetTitle}`}>
          <ChatBubbleOutlineOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { width: "20rem" } } }}
      >
        <Stack sx={{ p: 2 }} gap={1.5}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="sectionTitle">Comment</Typography>
            <IconButton onClick={handleClose} aria-label="Close" sx={{ mr: -1 }}>
              <CloseIcon />
            </IconButton>
          </Stack>

          <TextField
            multiline
            minRows={3}
            fullWidth
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Add a comment"
            autoFocus
          />

          {status && <Alert severity={status.severity}>{status.message}</Alert>}

          <Stack direction="row" justifyContent="flex-end">
            <Button
              variant="contained"
              endIcon={<SendComment />}
              onClick={handleSend}
              disabled={sending || !body.trim()}
            >
              Send comment
            </Button>
          </Stack>

          <Divider />

          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {author ? (
              <>You are commenting as: {author}</>
            ) : (
              <>
                Posting as {ANONYMOUS_AUTHOR} ·{" "}
                <Link component="button" type="button" onClick={() => navigate("/login")}>
                  Sign in to post under your name
                </Link>
              </>
            )}
          </Typography>

          {discussionHref && (
            <Link
              component="button"
              type="button"
              variant="body2"
              onClick={() => {
                handleClose();
                navigate(discussionHref);
              }}
            >
              View all related discussions
            </Link>
          )}
        </Stack>
      </Popover>
    </>
  );
};

WidgetCommentButton.propTypes = {
  widgetTitle: PropTypes.string.isRequired,
  cellLabel: PropTypes.string,
  termId: PropTypes.string,
  group: PropTypes.string,
  // Route to the Discussions tab for this term.
  discussionHref: PropTypes.string,
};

export default WidgetCommentButton;
