import PropTypes from "prop-types";
import { useState } from "react";
import { Link, Tooltip, Typography } from "@mui/material";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import { vars } from "../../theme/variables";

const { gray300, gray600, gray700 } = vars;

// The "copy this page's link" control that trails a breadcrumb, separator included so every page
// renders it identically. `permalink` is the canonical URL to hand out, which is not always the one
// in the address bar; without it the current URL is already canonical. The label shares the
// breadcrumb's row with the rest of the page's header controls, so anything longer than a few words
// belongs in `tooltip`.
const CopyPathLink = ({ permalink, label, tooltip }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(permalink || window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — no-op */
    }
  };

  return (
    <>
      <Typography component="span" sx={{ color: gray300, fontSize: "0.875rem" }}>
        ·
      </Typography>
      <Tooltip title={copied ? "Copied!" : tooltip} describeChild>
        <Link
          component="button"
          type="button"
          onClick={handleCopy}
          underline="hover"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            color: gray600,
            fontSize: "0.875rem",
            fontWeight: 500,
            whiteSpace: "nowrap",
            "&:hover": { color: gray700 },
          }}
        >
          {label}
          <ContentCopyOutlinedIcon sx={{ fontSize: "1rem" }} />
        </Link>
      </Tooltip>
    </>
  );
};

CopyPathLink.propTypes = {
  permalink: PropTypes.string,
  label: PropTypes.string,
  tooltip: PropTypes.string,
};

CopyPathLink.defaultProps = {
  permalink: undefined,
  label: "Copy link",
  tooltip: "Copy link",
};

export default CopyPathLink;
