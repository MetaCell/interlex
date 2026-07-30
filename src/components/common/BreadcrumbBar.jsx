import PropTypes from "prop-types";
import { useState } from "react";
import { Box, Container, Link, Tooltip, Typography } from "@mui/material";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import CustomBreadcrumbs from "./CustomBreadcrumbs";
import { vars } from "../../theme/variables";

const { gray200, gray300, gray600, gray700 } = vars;

// App-wide breadcrumb container: the breadcrumb lives in its own top bar (never
// nested in a page's title block), with an optional "copy path" permalink control
// and optional right-aligned content (e.g. an active-ontology selector).
const BreadcrumbBar = ({ breadcrumbItems, copyPath, permalink, copyLabel, rightContent }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = permalink || window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — no-op */
    }
  };

  return (
    <Container
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        py: 2,
        borderBottom: `1px solid ${gray200}`,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
        <CustomBreadcrumbs breadcrumbItems={breadcrumbItems} />
        {copyPath && (
          <>
            <Typography component="span" sx={{ color: gray300, fontSize: "0.875rem" }}>
              ·
            </Typography>
            <Tooltip title={copied ? "Copied!" : "Copy link"}>
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
                  "&:hover": { color: gray700 },
                }}
              >
                {copyLabel}
                <ContentCopyOutlinedIcon sx={{ fontSize: "1rem" }} />
              </Link>
            </Tooltip>
          </>
        )}
      </Box>
      {rightContent}
    </Container>
  );
};

BreadcrumbBar.propTypes = {
  breadcrumbItems: PropTypes.array.isRequired,
  copyPath: PropTypes.bool,
  permalink: PropTypes.string,
  copyLabel: PropTypes.string,
  rightContent: PropTypes.node,
};

BreadcrumbBar.defaultProps = {
  copyPath: false,
  permalink: undefined,
  copyLabel: "Copy link",
  rightContent: null,
};

export default BreadcrumbBar;
