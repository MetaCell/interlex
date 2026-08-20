import PropTypes from "prop-types";
import { Stack, Divider, Typography, Chip, Box, Tooltip, IconButton } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import TermValueLink from "./TermValueLink";
import { NOT_SPECIFIED } from "../config/cellCardConfig";

// How several values on one predicate read. neurdf distinguishes an owl:unionOf (the soma is in
// one of these) from independent assertions, and rendering both as "A, B" would state something
// the ontology does not: "dorsal root ganglion or trigeminal ganglion" is not the same claim as
// asserting both. 61 of the 161 Precision cells carry a union soma location, so this matters.
const joinValues = (combinator) => (combinator === "or" ? " or " : combinator === "and" ? " and " : ", ");

/**
 * One row: label left, value(s) right (Figma component "Biological properties item",
 * 9535:92212 — a 50/50 split with the value right-aligned).
 *
 * A row with no value renders "not specified" when `required`, so the table keeps the fixed
 * shape the design shows; otherwise it hides itself and the widget collapses.
 */
// The filter-grid affordance is hidden until the row is hovered (or the button is reached by
// keyboard — opacity keeps it in the tab order and taking layout space, where visibility/display
// would not), so the table reads as plain data at rest. Hoisted so the ten-odd rows share one
// Emotion class.
const revealFilterActionSx = {
  "&:hover .filterGridAction, &:focus-within .filterGridAction": { opacity: 1 },
};
// The negative margin keeps the hover pill from inflating the 20px text row.
const filterActionSx = { opacity: 0, p: 0.5, my: -0.5 };
// A tabular three-column row (the design's 50/50 label/value split, 9535:92212, with the
// control between): label and value flex equally, so this fixed-width middle column pins every
// row's control to the same x and the icons read as a column of their own.
const labelColumnSx = { flex: 1, minWidth: 0 };
const valueColumnSx = { flex: 1, minWidth: 0, display: "flex", justifyContent: "flex-end" };
const filterColumnSx = {
  flexShrink: 0,
  width: "2.25rem",
  alignSelf: "stretch",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

export const PropertyRow = ({
  label,
  tooltip,
  prop,
  render = "text",
  required = false,
  filterTo,
}) => {
  const values = prop?.values || [];
  if (!values.length && !required) return null;

  const labelNode = (
    <Typography variant="body2" sx={{ color: "text.secondary" }}>
      {label}
    </Typography>
  );

  return (
    <Stack direction="row" alignItems="flex-start" gap={1} sx={revealFilterActionSx}>
      <Box sx={labelColumnSx}>
        {/* The predicate's own ilxtr:shortDefinition, when the ontology ships one. */}
        {tooltip ? (
          <Tooltip title={tooltip} placement="top-start">
            {/* Tooltip needs a DOM node that can hold a ref and receive hover. */}
            <Box component="span" sx={{ display: "inline-flex" }}>
              {labelNode}
            </Box>
          </Tooltip>
        ) : (
          labelNode
        )}
      </Box>

      {/* The way back to the grid, pre-filtered on this row (meeting-3): clicking a value keeps
          opening the term URI, so the filter action is its own control. The design marks it with
          a "Filter Grid View by" text button; we keep the grid-view icon (it pairs with the Grid
          View breadcrumb button) and take the design's placement and hover colour — see the
          theme's MuiIconButton "&.filterGridAction". */}
      <Box sx={filterColumnSx}>
        {filterTo && (
          <Tooltip title={`Filter grid view by ${label}`} placement="top">
            <IconButton
              size="small"
              className="filterGridAction"
              component={RouterLink}
              to={filterTo}
              aria-label={`Filter grid view by ${label}`}
              sx={filterActionSx}
            >
              <GridViewOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Box sx={valueColumnSx}>
        {!values.length ? (
          // `notSpecified` is a theme variant: the greyed italic is a design token, not a call-site
          // style. See src/theme/index.jsx typography.
          <Typography variant="notSpecified">{NOT_SPECIFIED}</Typography>
        ) : render === "chip" ? (
          <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-end", gap: 0.5, minWidth: 0 }}>
            {values.map((v) => (
              // The theme caps chip labels at 20ch, so a long gene symbol needs its own title.
              <Chip key={v.id} label={v.label || v.curie} title={v.label || v.curie} variant="outlined" />
            ))}
          </Box>
        ) : (
          <Box sx={{ textAlign: "right", minWidth: 0 }}>
            {values.map((v, i) => (
              <Box component="span" key={v.id}>
                {i > 0 && (
                  <Typography component="span" variant="body2" sx={{ color: "text.secondary" }}>
                    {joinValues(prop.combinator)}
                  </Typography>
                )}
                <TermValueLink value={v} />
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Stack>
  );
};

PropertyRow.propTypes = {
  label: PropTypes.string.isRequired,
  tooltip: PropTypes.string,
  prop: PropTypes.object,
  render: PropTypes.oneOf(["text", "chip"]),
  required: PropTypes.bool,
  filterTo: PropTypes.string,
};

/**
 * A divider-separated run of property rows. Rows are built by the calling widget from its region
 * of the mappings document, so order and membership are configuration, not JSX.
 */
const PropertyList = ({ rows, filterHref }) => {
  const visible = rows
    .filter((r) => r.required || r.prop?.values?.length)
    .map((row) => ({
      ...row,
      filterTo: row.prop?.values?.length
        ? filterHref?.(row.localName, row.prop.values)
        : undefined,
    }));
  if (!visible.length) return null;

  return (
    <Stack divider={<Divider />} gap={1} sx={{ "& > hr": { my: 0 } }}>
      {visible.map((row) => (
        <PropertyRow
          key={row.localName}
          label={row.label}
          tooltip={row.tooltip}
          prop={row.prop}
          render={row.render}
          required={row.required}
          filterTo={row.filterTo}
        />
      ))}
    </Stack>
  );
};

PropertyList.propTypes = {
  rows: PropTypes.arrayOf(
    PropTypes.shape({
      localName: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      tooltip: PropTypes.string,
      prop: PropTypes.object,
      render: PropTypes.oneOf(["text", "chip"]),
      required: PropTypes.bool,
    })
  ).isRequired,
  // (localName, values) -> pre-filtered Grid View URL, or undefined when that predicate/value
  // is not a facet the grid offers. Absent entirely on widgets (or contexts) without the
  // filter-grid affordance.
  filterHref: PropTypes.func,
};

export default PropertyList;
