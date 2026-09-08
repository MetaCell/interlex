import PropTypes from "prop-types";
import {
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  Divider,
  Stack,
  Paper,
} from "@mui/material";
import CellCardWidget from "../CellCardWidget";
import TermValueLink from "../TermValueLink";
import { FLAGGED_FOOTNOTE } from "../../config/cellCardConfig";
import { useMappings } from "../../config/mappingsAtom";

export const TITLE = "Cross-Nomenclature Mapping";
export const DESCRIPTION =
  "Provisional mapping of possible relationships between cell types across publications.";

// Column proportions of 848 (33/33/34), so the table keeps its shape as the card's middle column
// resizes. A long cell name then wraps rather than pushing the other columns against the edge.
const COLUMNS = [
  { label: "Relationship", width: "33%" },
  { label: "Cell Name", width: "33%" },
  { label: "Source", width: "34%" },
];

// The Cross-Nomenclature table's relationship label per predicate, read from the mappings
// document rather than hardcoded here (issue #189: "displayLabel for predicates TEMP:mapsTo,
// TEMP:assertedSubClassOf"). `TEMP:subClassOf` also lands on `cell.mappings` (it is claimed by
// `fields.crossNomenclature`) but is deliberately not one of the graph's `crossNomenclature`
// relations — see buildRelationGraph.js — so its label comes from `subClassOfLabel` instead. A
// predicate outside both falls back to its local name rather than a wrong borrowed label.
const relationshipLabel = (predicates, config) => {
  const known = new Map(config.crossNomenclature.map((r) => [r.predicate, r.label]));
  known.set("TEMP:subClassOf", config.subClassOfLabel);
  return predicates.map((p) => known.get(p) || p.split(":").pop()).join(", ");
};

/**
 * §4.4 Cross-Nomenclature Mapping (Figma 9239:67833): how this cell type is named in other
 * nomenclatures.
 *
 * Per issue #189, the table states the relationship explicitly rather than through an "Evidence"
 * badge derived from it — the badge only ever read "described"/"inferred", which didn't say what
 * relation it came from. The Source column still shows the label's trailing parenthetical
 * (`m.source`, e.g. "Qi2024") rather than a fetched DOI citation: `m.ref` is a bare reference to
 * the other nomenclature's term, with no citation IRI to resolve, and #187 hasn't yet settled how
 * author/year should be formatted here.
 */
const CrossNomenclature = ({ cell, actions }) => {
  const mappingsConfig = useMappings();
  const config = mappingsConfig.regions.cellCard.relationshipGraph;
  const mappings = cell.mappings || [];
  if (!mappings.length) return null;

  const hasFlagged = mappings.some((m) => m.evidence === "proposed");

  return (
    <CellCardWidget title={TITLE} description={DESCRIPTION} actions={actions}>
      {/* The design's table sits on its own outlined surface, which is what `component={Paper}`
          + `variant="outlined"` resolves to in the theme. TableContainer also brings the
          horizontal scroll the columns need once the card's middle column narrows. */}
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              {COLUMNS.map((column) => (
                <TableCell key={column.label} sx={{ width: column.width }}>
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {mappings.map((m) => (
              <TableRow key={m.ref.id}>
                <TableCell>
                  <Typography variant="body2">{relationshipLabel(m.predicates, config)}</Typography>
                </TableCell>
                <TableCell>
                  <TermValueLink value={m.ref} />
                  {m.evidence === "proposed" && "*"}
                </TableCell>
                {/* Text sm/Regular, Gray/600, comes from the theme's small-table cell, so
                    `variant` is all this carries. */}
                <TableCell>
                  <Typography variant="body2">{m.source || "—"}</Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {hasFlagged && (
        <Stack gap={1}>
          <Divider />
          <Typography variant="caption" sx={{ color: "text.disabled" }}>
            {FLAGGED_FOOTNOTE}
          </Typography>
        </Stack>
      )}
    </CellCardWidget>
  );
};

CrossNomenclature.propTypes = {
  cell: PropTypes.object.isRequired,
  actions: PropTypes.node,
};


export default CrossNomenclature;
