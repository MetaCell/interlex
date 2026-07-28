import PropTypes from "prop-types";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Typography,
  Divider,
  Stack,
  Box,
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
      <Box sx={{ overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Cell name</TableCell>
              <TableCell>Evidence</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Reference</TableCell>
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
                <TableCell>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {m.source || "—"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {m.ref.curie}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

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
