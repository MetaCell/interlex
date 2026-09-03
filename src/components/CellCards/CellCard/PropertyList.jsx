import { Fragment } from "react";
import PropTypes from "prop-types";
import { Divider, Typography, Chip, Box, Tooltip, IconButton } from "@mui/material";
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
// The list is one shared CSS grid — label | control | value — so the columns are sized by the
// *table*, not per row: labels get the widest label's width, the control column is fixed (every
// row's icon at the same x), and the value column absorbs all remaining space instead of the
// 50/50 split that wrapped long values beside a half-empty label column. Each row spans the
// grid via subgrid so it keeps a real box of its own for the hover reveal above.
const propertyTableSx = {
  display: "grid",
  gridTemplateColumns: "auto 2.25rem minmax(0, 1fr)",
  alignItems: "start",
  gap: 1,
  "& > hr": { gridColumn: "1 / -1" },
};
const propertyRowSx = {
  ...revealFilterActionSx,
  gridColumn: "1 / -1",
  display: "grid",
  gridTemplateColumns: "subgrid",
  alignItems: "start",
};
const labelColumnSx = { minWidth: 0 };
const valueColumnSx = { minWidth: 0, display: "flex", justifyContent: "flex-end" };
const filterColumnSx = {
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
  filter,
}) => {
  const values = prop?.values || [];
  if (!values.length && !required) return null;

  const labelNode = (
    <Typography variant="body2" sx={{ color: "text.secondary" }}>
      {label}
    </Typography>
  );

  return (
    <Box sx={propertyRowSx}>
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
          theme's MuiIconButton "&.filterGridAction". A `uniform` filter still navigates, but its
          tooltip warns that every cell shares the value, so it cannot narrow the results. */}
      <Box sx={filterColumnSx}>
        {filter?.to && (
          <Tooltip
            title={
              filter.uniform
                ? `All cells in this ontology share the same ${label}, so this cannot narrow the grid view`
                : `Filter grid view by ${label}`
            }
            placement="top"
          >
            <IconButton
              size="small"
              className="filterGridAction"
              component={RouterLink}
              to={filter.to}
              aria-label={
                filter.uniform
                  ? `Filter grid view by ${label} (all cells share this value)`
                  : `Filter grid view by ${label}`
              }
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
    </Box>
  );
};

PropertyRow.propTypes = {
  label: PropTypes.string.isRequired,
  tooltip: PropTypes.string,
  prop: PropTypes.object,
  render: PropTypes.oneOf(["text", "chip"]),
  required: PropTypes.bool,
  // { to } links to the pre-filtered grid; `uniform` swaps the tooltip for a warning that the
  // filter cannot narrow the grid (every cell shares the value).
  filter: PropTypes.shape({ to: PropTypes.string, uniform: PropTypes.bool }),
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
      filter: row.prop?.values?.length
        ? filterHref?.(row.localName, row.prop.values)
        : undefined,
    }));
  if (!visible.length) return null;

  return (
    <Box sx={propertyTableSx}>
      {visible.map((row, i) => (
        <Fragment key={row.localName}>
          {i > 0 && <Divider />}
          <PropertyRow
            label={row.label}
            tooltip={row.tooltip}
            prop={row.prop}
            render={row.render}
            required={row.required}
            filter={row.filter}
          />
        </Fragment>
      ))}
    </Box>
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
  // (localName, values) -> { to: pre-filtered Grid View URL, uniform?: true } | undefined
  // (see CellCard.filterGridHref). Absent entirely on widgets (or contexts) without the
  // filter-grid affordance.
  filterHref: PropTypes.func,
};

export default PropertyList;
