import PropTypes from "prop-types";
import { Box, Typography, Chip, Divider, Link } from "@mui/material";
import { ArrowOutwardIcon } from "../../Icons";
import { vars } from "../../theme/variables";
import { TILE_HEADER_CHIPS, TILE_ROWS, labelFor, linkFor } from "./config/gridConfig";

const { gray200, gray500, gray700, gray800, brand700 } = vars;

const CHIP_COLOR = { class: "secondary", subtype: "success", species: "default" };

// One property row: label on the left, value(s) on the right.
const PropertyRow = ({ label, prop, render }) => {
  if (!prop || !prop.values.length) return null; // auto-hide empty rows (tile auto-sizes)
  return (
    <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={1.5}>
      <Typography variant="body2" sx={{ color: gray500, flexShrink: 0 }}>
        {label}
      </Typography>
      {render === "text" ? (
        <Typography
          variant="body2"
          sx={{ color: brand700, fontWeight: 500, textAlign: "right" }}
        >
          {prop.values.map((v) => v.label).join(", ")}
        </Typography>
      ) : (
        <Box display="flex" flexWrap="wrap" justifyContent="flex-end" gap={0.5}>
          {prop.values.map((v) => (
            <Chip key={v.id} label={v.label} variant="outlined" />
          ))}
        </Box>
      )}
    </Box>
  );
};

PropertyRow.propTypes = {
  label: PropTypes.string.isRequired,
  prop: PropTypes.object,
  render: PropTypes.oneOf(["text", "chip"]),
};

// A cell record as a grid tile: header (title/id/chips) → property rows → source footer.
// Objects inside the tile are not clickable; the whole tile navigates (handled by the grid).
const CellTile = ({ cell }) => {
  const headerChips = TILE_HEADER_CHIPS.flatMap(({ localName, tone }) => {
    const prop = cell.properties[localName];
    if (!prop) return [];
    return prop.values.map((v) => (
      <Chip key={`${localName}-${v.id}`} label={v.label} color={CHIP_COLOR[tone]} />
    ));
  });

  const rows = TILE_ROWS.map(({ localName, render }) => (
    <PropertyRow
      key={localName}
      label={labelFor(localName)}
      prop={cell.properties[localName]}
      render={render}
    />
  )).filter((row) => row.props.prop);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        border: `1px solid ${gray200}`,
        borderRadius: "0.75rem",
        overflow: "hidden",
        height: "100%",
        background: vars.white,
      }}
    >
      <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
        <Box>
          <Typography variant="subtitle2" sx={{ color: gray800, fontWeight: 600 }}>
            {cell.label}
          </Typography>
          <Typography variant="caption" sx={{ color: gray500 }}>
            {cell.curie}
          </Typography>
        </Box>
        {headerChips.length > 0 && (
          <Box display="flex" flexWrap="wrap" gap={0.5}>
            {headerChips}
          </Box>
        )}
      </Box>

      {rows.length > 0 && (
        <>
          <Divider />
          <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1 }}>{rows}</Box>
        </>
      )}

      {cell.sources.length > 0 && (
        <>
          <Divider />
          <Box
            sx={{
              p: 2,
              mt: "auto",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 1.5,
            }}
          >
            <Typography variant="body2" sx={{ color: gray500, flexShrink: 0 }}>
              {labelFor("source")}
            </Typography>
            <Box display="flex" flexWrap="wrap" justifyContent="flex-end" gap={1}>
              {cell.sources.map((src) =>
                linkFor(src.iri) ? (
                  <Link
                    key={src.id}
                    href={src.iri}
                    target="_blank"
                    rel="noopener"
                    underline="hover"
                    onClick={(e) => e.stopPropagation()}
                    sx={{ color: brand700, fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 0.25 }}
                  >
                    <Typography variant="body2" sx={{ color: brand700, fontWeight: 500 }}>
                      {src.label}
                    </Typography>
                    <ArrowOutwardIcon />
                  </Link>
                ) : (
                  <Typography key={src.id} variant="body2" sx={{ color: gray700 }}>
                    {src.label}
                  </Typography>
                )
              )}
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

CellTile.propTypes = {
  cell: PropTypes.object.isRequired,
};

export default CellTile;
