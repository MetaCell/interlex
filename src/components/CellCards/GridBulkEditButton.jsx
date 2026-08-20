import PropTypes from "prop-types";
import { Button, Tooltip } from "@mui/material";
import ModeEditOutlineOutlinedIcon from "@mui/icons-material/ModeEditOutlineOutlined";

// Bulk editing the picked cells has no backend yet, so the affordance sits where the design puts
// it (Figma 9236:63824, left of "Filter by word" in the results toolbar) and says why on hover.
const NOT_IMPLEMENTED = "Bulk editing cells is not implemented yet.";

// The design keeps the button present and grey with an empty selection; here it appears only
// once tiles are picked, so the toolbar carries no affordance for cells nobody chose.
const GridBulkEditButton = ({ selectedCount }) => {
  if (!selectedCount) return null;

  return (
    <Tooltip title={NOT_IMPLEMENTED} arrow>
      {/* A disabled button swallows pointer events, so the tooltip needs a wrapper to hang on. */}
      <span>
        <Button color="secondary" disabled startIcon={<ModeEditOutlineOutlinedIcon />}>
          Bulk edit
        </Button>
      </span>
    </Tooltip>
  );
};

GridBulkEditButton.propTypes = {
  selectedCount: PropTypes.number,
};

export default GridBulkEditButton;
