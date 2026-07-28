import PropTypes from "prop-types";
import { Stack, Typography } from "@mui/material";

/**
 * The shared "nothing here" placeholder (Figma component "Empty state", e.g. 9239:67736 —
 * a centred featured icon over a message and optional supporting text).
 *
 * Replaces the copies that had been inlined in CellTileGrid, OntologyTermsTable and Graph.
 */
const EmptyState = ({ icon, message, supportingText, actions, sx }) => (
  <Stack
    alignItems="center"
    justifyContent="center"
    gap={1}
    sx={{ textAlign: "center", py: 4, px: 2, ...sx }}
  >
    {icon}
    <Typography variant="body2" sx={{ color: "text.secondary" }}>
      {message}
    </Typography>
    {supportingText && (
      <Typography variant="caption" sx={{ color: "text.disabled" }}>
        {supportingText}
      </Typography>
    )}
    {actions}
  </Stack>
);

EmptyState.propTypes = {
  icon: PropTypes.node,
  message: PropTypes.string.isRequired,
  supportingText: PropTypes.string,
  actions: PropTypes.node,
  sx: PropTypes.object,
};

export default EmptyState;
