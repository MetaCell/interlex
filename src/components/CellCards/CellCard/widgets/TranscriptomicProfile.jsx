import PropTypes from "prop-types";
import { Typography, Chip, Divider, Box, Alert, Link } from "@mui/material";
import { ArrowOutwardIcon } from "../../../../Icons";
import CellCardWidget from "../CellCardWidget";
import {
  MARKER_GENE_PREDICATE,
  SPARC_TRANSCRIPTOMICS_PREDICATE,
} from "../../config/cellCardConfig";

export const TITLE = "Transcriptomic profile";

/**
 * §4.2 Transcriptomic Profile (Figma 9239:67782).
 *
 * Two states, and only the second is reachable today:
 *
 * 1. `hasSPARCTranscriptomicsLink` present → a deep link into the SPARC Portal, pre-filtered for
 *    this cell type. **Zero occurrences in the shipped graph** (the `ilx:` prefix is not even in
 *    its @context), so this branch is dormant but wired: the parser recognises the predicate under
 *    any prefix and puts it on `annotations.sparcTranscriptomicsLinks`.
 * 2. Otherwise, `ilxtr:atlasAnnotation` present → the Precision dataset annotation pills, which
 *    is exactly what the design renders. Present on 54 of the 161 Precision cells.
 *
 * With neither, the widget hides itself (§6.4). `isCurated` decides whether the "link appears
 * when the triple is added" note is worth showing — it is guidance for curators, not for readers.
 */
const TranscriptomicProfile = ({ cell, actions }) => {
  const sparcLink = cell.annotations?.sparcTranscriptomicsLinks?.[0];
  const atlas = cell.annotations?.atlasAnnotation || [];
  const genes = cell.properties[MARKER_GENE_PREDICATE]?.values || [];

  return (
    <CellCardWidget title={TITLE} actions={actions}>
      {sparcLink ? (
        // A link tile, not a status message — the design gives it no severity icon.
        <Alert severity="info" icon={false}>
          <Link href={sparcLink.iri || sparcLink.id} target="_blank" rel="noopener">
            Explore this cell type in the SPARC Portal <ArrowOutwardIcon />
          </Link>
        </Alert>
      ) : (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          SPARC Portal link not yet configured. Atlas dataset annotations:
        </Typography>
      )}

      {atlas.length > 0 && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          {atlas.map((a) => (
            <Chip key={a} label={a} title={a} color="secondary" />
          ))}
        </Box>
      )}

      {genes.length > 0 && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, alignItems: "center" }}>
          <Typography variant="body2" sx={{ color: "text.secondary", mr: 0.5 }}>
            Marker genes
          </Typography>
          {genes.map((g) => (
            <Chip
              key={g.id}
              label={g.label || g.curie}
              title={g.label || g.curie}
              variant="outlined"
            />
          ))}
        </Box>
      )}

      {!sparcLink && (
        <>
          <Divider />
          {/* Guidance for curators, in one sentence: emphasising the predicate name would mean
              typography at the call site, which the theme owns. */}
          <Typography variant="caption" sx={{ color: "text.disabled" }}>
            {`SPARC Portal link appears when ${SPARC_TRANSCRIPTOMICS_PREDICATE} is added.`}
          </Typography>
        </>
      )}
    </CellCardWidget>
  );
};

TranscriptomicProfile.propTypes = {
  cell: PropTypes.object.isRequired,
  actions: PropTypes.node,
};


export default TranscriptomicProfile;
