import PropTypes from "prop-types";
import { Box, Grid, Typography } from "@mui/material";
import CellTile from "./CellTile";
import { vars } from "../../theme/variables";

const { gray500 } = vars;

// Responsive tile grid. Whole-tile click navigates; the per-tile checkbox selects instead.
const CellTileGrid = ({ cells, onSelect, selectedIds, onToggleSelect }) => {
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
    <Grid container spacing={2} alignItems="stretch">
      {cells.map((cell) => (
        <Grid
          item
          key={cell.id}
          xs={12}
          sm={6}
          md={6}
          lg={4}
          xl={3}
          onClick={() => onSelect(cell)}
          sx={{ cursor: "pointer", display: "flex" }}
        >
          <CellTile
            cell={cell}
            selected={!!selectedIds[cell.id]}
            onToggleSelect={() => onToggleSelect(cell.id)}
          />
        </Grid>
      ))}
    </Grid>
  );
};

CellTileGrid.propTypes = {
  cells: PropTypes.array.isRequired,
  onSelect: PropTypes.func.isRequired,
  selectedIds: PropTypes.object.isRequired,
  onToggleSelect: PropTypes.func.isRequired,
};

export default CellTileGrid;
