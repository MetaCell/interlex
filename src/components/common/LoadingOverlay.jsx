import PropTypes from "prop-types";
import { Backdrop, CircularProgress } from "@mui/material";
import { alpha, styled } from "@mui/material/styles";

// Above the page's fixed section nav (10) and below the sticky app header (99), so navigation
// stays reachable while a page loads.
const PAGE_OVERLAY_Z_INDEX = 50;

const Overlay = styled(Backdrop)(({ theme }) => ({
  zIndex: PAGE_OVERLAY_Z_INDEX,
  backgroundColor: alpha(theme.palette.background.default, 0.8),
}));

const LoadingOverlay = ({ open }) => (
  <Overlay open={open}>
    <CircularProgress aria-label="Loading" />
  </Overlay>
);

LoadingOverlay.propTypes = {
  open: PropTypes.bool.isRequired,
};

export default LoadingOverlay;
