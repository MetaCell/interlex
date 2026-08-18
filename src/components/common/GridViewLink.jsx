import PropTypes from "prop-types";
import { Button } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";

// The internal counterpart of [CommunityHubLink]: the way back from a cell to the grid it was
// read from, scoped to the same context ontology (mappings.md §4.2). A real router link rather
// than an onClick, so it middle-clicks and copies like the crumbs beside it.
const GridViewLink = ({ to }) =>
  to ? (
    <Button
      variant="text"
      color="secondary"
      component={RouterLink}
      to={to}
      startIcon={<GridViewOutlinedIcon />}
    >
      Grid View
    </Button>
  ) : null;

GridViewLink.propTypes = {
  to: PropTypes.string,
};

GridViewLink.defaultProps = {
  to: undefined,
};

export default GridViewLink;
