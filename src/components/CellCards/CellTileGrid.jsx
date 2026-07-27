import PropTypes from "prop-types";
import { Box, Typography } from "@mui/material";
import CellTile from "./CellTile";
import { vars } from "../../theme/variables";

const { gray500 } = vars;

// Responsive tile grid. Whole-tile click navigates (tile interior is not interactive).
const CellTileGrid = ({ cells, onSelect }) => {
  if (!cells.length) {
    return (
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "12rem",
        }}
      >
        <Typography variant="body1" sx={{ color: gray500 }}>
          No cells match the current filters.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "1fr 1fr",
          md: "repeat(auto-fill, minmax(20rem, 1fr))",
        },
        gap: 2,
        alignItems: "stretch",
      }}
    >
      {cells.map((cell) => (
        <Box
          key={cell.id}
          onClick={() => onSelect(cell)}
          sx={{ cursor: "pointer", display: "flex" }}
        >
          <CellTile cell={cell} />
        </Box>
      ))}
    </Box>
  );
};

CellTileGrid.propTypes = {
  cells: PropTypes.array.isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default CellTileGrid;
