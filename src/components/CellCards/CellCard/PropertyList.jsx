import PropTypes from "prop-types";
import { Stack, Divider, Typography, Chip, Box, Tooltip } from "@mui/material";
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
export const PropertyRow = ({ label, tooltip, prop, render = "text", required = false }) => {
  const values = prop?.values || [];
  if (!values.length && !required) return null;

  const labelNode = (
    <Typography variant="body2" sx={{ color: "text.secondary", flexShrink: 0 }}>
      {label}
    </Typography>
  );

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1.5}>
      {/* The predicate's own ilxtr:shortDefinition, when the ontology ships one. */}
      {tooltip ? (
        <Tooltip title={tooltip} placement="top-start">
          {/* Tooltip needs a DOM node that can hold a ref and receive hover. */}
          <Box component="span" sx={{ display: "inline-flex", flexShrink: 0 }}>
            {labelNode}
          </Box>
        </Tooltip>
      ) : (
        labelNode
      )}

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
    </Stack>
  );
};

PropertyRow.propTypes = {
  label: PropTypes.string.isRequired,
  tooltip: PropTypes.string,
  prop: PropTypes.object,
  render: PropTypes.oneOf(["text", "chip"]),
  required: PropTypes.bool,
};

/**
 * A divider-separated run of property rows. Rows are built by the calling widget from
 * `cellCardConfig`, so order and membership are config, not JSX.
 */
const PropertyList = ({ rows }) => {
  const visible = rows.filter((r) => r.required || r.prop?.values?.length);
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
};

export default PropertyList;
