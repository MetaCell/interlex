import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Paper,
  Stack,
  Typography,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import OpenInFullOutlinedIcon from "@mui/icons-material/OpenInFullOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CellCardWidget from "../CellCardWidget";
import RelationshipGraphSvg from "../RelationshipGraphSvg";
import EmptyState from "../../../common/EmptyState";
import { CloseIcon } from "../../../../Icons";
import buildRelationGraph from "../buildRelationGraph";
import { RELATION_LEGEND, FLAGGED_FOOTNOTE } from "../../config/cellCardConfig";

export const TITLE = "Relationship Graph";

// The legend's line samples, drawn with the same dash patterns as the edges themselves.
const LEGEND_DASH = {
  subClassOf: "2 4",
  somaLocation: "6 4",
  assertedSubClassOf: undefined,
  expresses: undefined,
};

const LegendSwatch = ({ kind }) => (
  <Box
    component="svg"
    width={20}
    height={8}
    sx={{ flexShrink: 0, color: kind === "expresses" ? "primary.main" : "grey.400" }}
  >
    <line
      x1="0"
      y1="4"
      x2="20"
      y2="4"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeDasharray={LEGEND_DASH[kind]}
    />
  </Box>
);

LegendSwatch.propTypes = { kind: PropTypes.string.isRequired };

// `hasFlagged` gates the footnote: nothing in the shipped graph produces "proposed" evidence, so
// an unconditional footnote explains a marker no node can carry. Same rule as CrossNomenclature,
// which describes the same asterisk.
const Legend = ({ hasFlagged }) => (
  <Stack gap={0.5}>
    <Stack direction="row" flexWrap="wrap" gap={2}>
      {RELATION_LEGEND.map(({ kind, label }) => (
        <Stack key={kind} direction="row" alignItems="center" gap={0.75}>
          <LegendSwatch kind={kind} />
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {label}
          </Typography>
        </Stack>
      ))}
    </Stack>
    {hasFlagged && (
      <Typography variant="caption" sx={{ color: "text.disabled" }}>
        {FLAGGED_FOOTNOTE}
      </Typography>
    )}
  </Stack>
);

Legend.propTypes = { hasFlagged: PropTypes.bool };

/**
 * §4.1 Relationship Graph (Figma 9478:72004 inline, 8917:35906 expanded).
 *
 * A new component rather than a reuse of GraphViewer/Graph.jsx: that one is a d3.cluster
 * dendrogram taking a single predicate group, and it resolves `d3.select("#tooltip")` plus a
 * global `d3.selectAll(".node--leaf-g")`, so two instances fight over the same DOM — and this
 * widget needs two (inline and in the dialog). The Overview tab's graphs are left untouched.
 */
const RelationshipGraph = ({ cell, neighbours, onNavigate, actions }) => {
  const [expanded, setExpanded] = useState(false);
  const graph = useMemo(() => buildRelationGraph(cell, neighbours), [cell, neighbours]);

  // One node is always the cell itself; fewer than two means there is nothing to relate.
  const hasRelations = graph.nodes.length > 1;
  const hasFlagged = graph.nodes.some((n) => n.flagged);

  const handleSelect = (node) => {
    if (node.ref && onNavigate) {
      setExpanded(false);
      onNavigate(node.ref);
    }
  };

  const graphActions = (
    <>
      {actions}
      <Tooltip title="Expand">
        <IconButton onClick={() => setExpanded(true)} aria-label="Expand relationship graph">
          <OpenInFullOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </>
  );

  return (
    <CellCardWidget title={TITLE} actions={graphActions}>
      {hasRelations ? (
        // An outlined surface, so the border and the 12px radius come from the theme
        // (`.graphFrame`) rather than from a call-site `sx`.
        <Paper variant="outlined" className="graphFrame">
          <Box sx={{ p: 2 }}>
            <RelationshipGraphSvg graph={graph} onSelect={handleSelect} />
          </Box>
          {/* The design puts the legend in a collapsed bar at the bottom of the graph frame. */}
          <Accordion disableGutters elevation={0} square>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="body2">Legend</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Legend hasFlagged={hasFlagged} />
            </AccordionDetails>
          </Accordion>
        </Paper>
      ) : (
        <EmptyState message="No related terms in this ontology." />
      )}

      <Dialog open={expanded} onClose={() => setExpanded(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton onClick={() => setExpanded(false)} aria-label="Close" sx={{ ml: -1 }}>
            <CloseIcon />
          </IconButton>
          {TITLE}
        </DialogTitle>
        <DialogContent>
          <Stack gap={2}>
            <RelationshipGraphSvg graph={graph} onSelect={handleSelect} />
            <Legend hasFlagged={hasFlagged} />
          </Stack>
        </DialogContent>
      </Dialog>
    </CellCardWidget>
  );
};

RelationshipGraph.propTypes = {
  cell: PropTypes.object.isRequired,
  neighbours: PropTypes.shape({
    parents: PropTypes.array,
    children: PropTypes.array,
  }),
  // Called with a ResolvedRef when a node is clicked, so the host decides how to navigate.
  onNavigate: PropTypes.func,
  actions: PropTypes.node,
};

export default RelationshipGraph;
