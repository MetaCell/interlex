import PropTypes from "prop-types";
import { Stack, Typography, List, ListItem, ListItemButton, ListItemText, Link, Box } from "@mui/material";
import CellCardWidget from "../CellCardWidget";
import { toDoi } from "../citationService";

export const TITLE = "Other cells from this source";

// The list scrolls internally rather than stretching the column, per the design's flex:1 +
// overflow-y:auto on this widget.
const MAX_LIST_HEIGHT = "32rem";

/**
 * §5.2 Other Cells from This Source (Figma 9239:67932): the sibling cell types described by the
 * same publication.
 *
 * Tom, design review: this widget can only be populated when a context ontology is loaded — the
 * sibling relationships are not in a single term's own graph. That holds here by construction:
 * the Cell Card always renders from a full ontology load, so the siblings are simply the cells
 * sharing a `literatureCitation`.
 */
const RelatedCells = ({ cell, related, onSelect, actions }) => {
  if (!related?.length) return null;

  const doi = toDoi(cell.sources?.[0]?.iri || cell.sources?.[0]?.id);

  return (
    <CellCardWidget title={TITLE} count={`${related.length} cells`} actions={actions}>
      {doi && (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Sharing DOI:{" "}
          <Link href={`https://doi.org/${doi}`} target="_blank" rel="noopener">
            {doi}
          </Link>
        </Typography>
      )}

      <Box sx={{ maxHeight: MAX_LIST_HEIGHT, overflowY: "auto", mx: -0.5, px: 0.5 }}>
        <List>
          <Stack gap={1}>
            {related.map((sibling) => (
              <ListItem key={sibling.id} disablePadding>
                {/* `cellCardTile` carries the outlined-row style; it is scoped to this class in the
                    theme so the app's other ListItemButtons (Header nav, About) stay flat. */}
                <ListItemButton className="cellCardTile" onClick={() => onSelect?.(sibling)}>
                  <ListItemText primary={sibling.label} secondary={sibling.curie} />
                </ListItemButton>
              </ListItem>
            ))}
          </Stack>
        </List>
      </Box>

      <Typography variant="caption" sx={{ color: "text.disabled" }}>
        {`${related.length} of ${related.length} · via ilxtr:literatureCitation`}
      </Typography>
    </CellCardWidget>
  );
};

RelatedCells.propTypes = {
  cell: PropTypes.object.isRequired,
  related: PropTypes.array,
  // Called with the sibling CellTerm; the host decides how to navigate.
  onSelect: PropTypes.func,
  actions: PropTypes.node,
};

export default RelatedCells;
