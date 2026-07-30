import PropTypes from "prop-types";
import {
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Typography,
  Divider,
  Stack,
  Paper,
} from "@mui/material";
import CellCardWidget from "../CellCardWidget";
import TermValueLink from "../TermValueLink";
import { EVIDENCE_TONE, FLAGGED_FOOTNOTE } from "../../config/cellCardConfig";

export const TITLE = "Cross-Nomenclature Mapping";

// Evidence badge. "proposed" has no palette colour (the design uses Purple, which the theme does
// not define), so it falls back to an outlined chip rather than inlining a hex here — the gap is
// raised with design instead.
const EvidenceChip = ({ evidence }) => {
  const tone = EVIDENCE_TONE[evidence];
  return tone === "outlined" ? (
    <Chip label={evidence} variant="outlined" />
  ) : (
    <Chip label={evidence} color={tone} />
  );
};

EvidenceChip.propTypes = { evidence: PropTypes.string.isRequired };

// Column proportions are the design's (280 / 176 / 196 / 196 of 848) as percentages, so the table
// keeps its shape as the card's middle column resizes. A long cell name then wraps to the two
// 1.25rem lines the 4.5rem row already has room for, rather than pushing the other three columns
// against the right edge.
const COLUMNS = [
  { label: "Cell name", width: "33%" },
  { label: "Evidence", width: "21%" },
  { label: "Source", width: "23%" },
  { label: "Reference", width: "23%" },
];

/**
 * §4.4 Cross-Nomenclature Mapping (Figma 9239:67833): how this cell type is named in other
 * nomenclatures.
 *
 * Evidence is derived from the *relation*, not from a dedicated predicate — there isn't one:
 * `TEMP:assertedSubClassOf` means the source explicitly describes this cell type ("described"),
 * `TEMP:mapsTo` means a computational mapping ("inferred"). The parser does that derivation, so
 * this component just renders it.
 */
const CrossNomenclature = ({ cell, actions }) => {
  const mappings = cell.mappings || [];
  if (!mappings.length) return null;

  const hasFlagged = mappings.some((m) => m.evidence === "proposed");

  return (
    <CellCardWidget title={TITLE} actions={actions}>
      {/* The design's table sits on its own outlined surface, which is what `component={Paper}`
          + `variant="outlined"` resolves to in the theme. TableContainer also brings the
          horizontal scroll the four columns need once the card's middle column narrows. */}
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
              <TableRow key={`${m.ref.id}-${m.evidence}`}>
                <TableCell>
                  <TermValueLink value={m.ref} />
                  {m.evidence === "proposed" && "*"}
                </TableCell>
                <TableCell>
                  <EvidenceChip evidence={m.evidence} />
                </TableCell>
                {/* Source and reference are Text sm/Regular; their Gray/600 comes from the
                    theme's small-table cell, so `variant` is all these carry. */}
                <TableCell>
                  <Typography variant="body2">{m.source || "—"}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{m.ref.curie}</Typography>
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
