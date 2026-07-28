import PropTypes from "prop-types";
import { Box, Card, CardContent, Checkbox, Typography, Chip, Divider, Link } from "@mui/material";
import { ArrowOutwardIcon, CheckboxDefault, CheckboxSelected } from "../../Icons";
import { vars } from "../../theme/variables";
import { TILE_HEADER_CHIPS, TILE_ROWS, labelFor, termLink } from "./config/gridConfig";

const { gray500, gray700, gray800, brand700 } = vars;

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
        <Box display="flex" flexWrap="wrap" justifyContent="flex-end" gap={0.5} minWidth={0}>
          {prop.values.map((v) => (
            <Chip key={v.id} label={v.label} title={v.label} variant="outlined" />
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

// The design pins the checkbox 20px in from the tile's top-right corner; CardContent already pads
// 16px, so the 32px hit area is pulled back 4px to line the 16px glyph up with it.
const CHECKBOX_SX = { p: 1, mt: -0.5, mr: -0.5 };

// A cell record as a grid tile: header (title/id/chips + select checkbox) → property rows → source
// footer. Apart from the checkbox and the source links, the tile interior is not clickable; the
// whole tile navigates (handled by the grid).
const CellTile = ({ cell, selected = false, onToggleSelect }) => {
  const headerChips = TILE_HEADER_CHIPS.flatMap(({ localName, tone }) => {
    const prop = cell.properties[localName];
    if (!prop) return [];
    return prop.values.map((v) => (
      <Chip key={`${localName}-${v.id}`} label={v.label} title={v.label} color={CHIP_COLOR[tone]} />
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
    <Card
      variant="outlined"
      // `Mui-selected` is styled in the MuiCard theme override (Figma "State=Focus").
      className={selected ? "Mui-selected" : undefined}
      sx={{
        // Layout only — border, radius and background come from the MuiCard theme overrides.
        display: "flex", // keeps the footer's `mt: auto` working
        flexDirection: "column",
        width: "100%",
        minWidth: 0, // let long labels wrap instead of widening the tile
        height: "100%",
      }}
    >
      {/* Two columns, as in the design: the text block grows, the checkbox stays top-right. */}
      <CardContent sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, flex: 1, minWidth: 0 }}>
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
        <Checkbox
          disableRipple
          icon={<CheckboxDefault />}
          checkedIcon={<CheckboxSelected />}
          checked={selected}
          onChange={onToggleSelect}
          onClick={(e) => e.stopPropagation()} // selecting must not navigate
          inputProps={{ "aria-label": `Select ${cell.label}` }}
          sx={CHECKBOX_SX}
        />
      </CardContent>

      {rows.length > 0 && (
        <>
          <Divider />
          <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {rows}
          </CardContent>
        </>
      )}

      {cell.sources.length > 0 && (
        <>
          <Divider />
          <CardContent
            sx={{
              mt: "auto", // pin the source footer to the bottom of a short tile
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
                termLink(src) ? (
                  <Link
                    key={src.id}
                    href={termLink(src)}
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
          </CardContent>
        </>
      )}
    </Card>
  );
};

CellTile.propTypes = {
  cell: PropTypes.object.isRequired,
  selected: PropTypes.bool,
  onToggleSelect: PropTypes.func,
};

export default CellTile;
