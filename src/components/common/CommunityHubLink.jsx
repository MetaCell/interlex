import PropTypes from "prop-types";
import { Button } from "@mui/material";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";

// The context ontology's "leave the app" affordance, sitting at the right of the breadcrumb bar on
// every page read inside an ontology (mappings.md §4.1). The destination is the community the file
// itself names, so a term with no context ontology — and an ontology that asserts no community —
// renders nothing at all, never a disabled button or a fallback destination.
const CommunityHubLink = ({ href }) =>
  href ? (
    <Button
      variant="breadcrumbAction"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      startIcon={<LanguageOutlinedIcon />}
    >
      Community hub
    </Button>
  ) : null;

CommunityHubLink.propTypes = {
  href: PropTypes.string,
};

CommunityHubLink.defaultProps = {
  href: undefined,
};

export default CommunityHubLink;
