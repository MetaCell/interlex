import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Paper,
  Stack,
  Typography,
  IconButton,
  Tooltip,
  ButtonBase,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import OpenInFullOutlinedIcon from "@mui/icons-material/OpenInFullOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CellCardWidget from "../CellCardWidget";
import RelationshipGraphSvg from "../RelationshipGraphSvg";
import { ARROW_HEADS, arrowHeadProps, edgeStyle } from "../relationEdgeStyle";
import EmptyState from "../../../common/EmptyState";
import { CloseIcon } from "../../../../Icons";
import buildRelationGraph from "../buildRelationGraph";
import { FLAGGED_FOOTNOTE } from "../../config/cellCardConfig";
import { useMappings } from "../../config/mappingsAtom";

export const TITLE = "Relationship Graph";

// The legend's line samples, drawn from the same style table and arrowheads as the edges.
const SWATCH_W = 32;
const SWATCH_H = 12;
const LegendSwatch = ({ kind, hidden }) => {
  const { palette } = useTheme();
  const { stroke: kindStroke, dash, head, bidirectional } = edgeStyle(kind, palette);
  const stroke = hidden ? palette.action.disabled : kindStroke;
  const { d, length } = ARROW_HEADS[head];
  const headProps = arrowHeadProps(head, stroke, palette);
  const mid = SWATCH_H / 2;
  return (
    <Box component="svg" width={SWATCH_W} height={SWATCH_H} sx={{ flexShrink: 0 }}>
      <line
        x1={bidirectional ? length : 0}
        y1={mid}
        x2={SWATCH_W - length}
        y2={mid}
        stroke={stroke}
        strokeWidth={1.5}
        strokeDasharray={dash}
      />
      <path d={d} transform={`translate(${SWATCH_W} ${mid})`} {...headProps} />
      {bidirectional && <path d={d} transform={`translate(0 ${mid}) rotate(180)`} {...headProps} />}
    </Box>
  );
};

LegendSwatch.propTypes = { kind: PropTypes.string.isRequired, hidden: PropTypes.bool };

// `hasFlagged` gates the footnote: nothing in the shipped graph produces "proposed" evidence, so
// an unconditional footnote explains a marker no node can carry. Same rule as CrossNomenclature,
// which describes the same asterisk.
const Legend = ({ rows, hasFlagged, hiddenKinds, onToggleKind }) => (
  <Stack gap={0.5}>
    <Stack direction="row" flexWrap="wrap" gap={2}>
      {rows.map(({ kind, label }) => {
        const hidden = hiddenKinds.has(kind);
        return (
          <Tooltip key={kind} title={hidden ? "Show in graph" : "Hide from graph"}>
            <ButtonBase
              className="legendToggle"
              onClick={() => onToggleKind(kind)}
              aria-pressed={!hidden}
              sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
            >
              <LegendSwatch kind={kind} hidden={hidden} />
              <Typography
                variant="caption"
                sx={{ color: hidden ? "text.disabled" : "text.secondary" }}
              >
                {label}
              </Typography>
            </ButtonBase>
          </Tooltip>
        );
      })}
    </Stack>
    {hasFlagged && (
      <Typography variant="caption" sx={{ color: "text.disabled" }}>
        {FLAGGED_FOOTNOTE}
      </Typography>
    )}
  </Stack>
);

Legend.propTypes = {
  rows: PropTypes.array.isRequired,
  hasFlagged: PropTypes.bool,
  hiddenKinds: PropTypes.instanceOf(Set).isRequired,
  onToggleKind: PropTypes.func.isRequired,
};

/**
 * §4.1 Relationship Graph (Figma 9478:72004 inline, 8917:35906 expanded).
 *
 * A new component rather than a reuse of GraphViewer/Graph.jsx: that one is a d3.cluster
 * dendrogram taking a single predicate group, and it resolves `d3.select("#tooltip")` plus a
 * global `d3.selectAll(".node--leaf-g")`, so two instances fight over the same DOM — and this
 * widget needs two (inline and in the dialog). The Overview tab's graphs are left untouched.
 */
const RelationshipGraph = ({ cell, neighbours, onNavigate, actions }) => {
  const mappings = useMappings();
  const [expanded, setExpanded] = useState(false);
  const [hiddenKinds, setHiddenKinds] = useState(() => new Set());
  const graph = useMemo(
    () => buildRelationGraph(cell, neighbours, mappings),
    [cell, neighbours, mappings]
  );
  const legend = mappings.regions.cellCard.relationshipGraph.legend;

  // Excluding a relation kind thins out a crowded graph. The edges are passed through by identity,
  // never copied: the layout keys its geometry on the edge objects themselves.
  const shownGraph = useMemo(() => {
    if (!hiddenKinds.size) return graph;
    const edges = graph.edges.filter((e) => !hiddenKinds.has(e.kind));
    const related = new Set(edges.flatMap((e) => [e.from, e.to]));
    return { nodes: graph.nodes.filter((n) => n.isCurrent || related.has(n.id)), edges };
  }, [graph, hiddenKinds]);

  const toggleKind = (kind) =>
    setHiddenKinds((current) => {
      const next = new Set(current);
      if (!next.delete(kind)) next.add(kind);
      return next;
    });

  // One node is always the cell itself; fewer than two means there is nothing to relate. Measured
  // on the unfiltered graph, so hiding every kind leaves the frame — and its legend — in place.
  const hasRelations = graph.nodes.length > 1;
  const hasFlagged = shownGraph.nodes.some((n) => n.flagged);

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
            <RelationshipGraphSvg graph={shownGraph} onSelect={handleSelect} />
          </Box>
          {/* The design puts the legend in a collapsed bar at the bottom of the graph frame. */}
          <Accordion disableGutters elevation={0} square>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="body2">Legend</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Legend
                rows={legend}
                hasFlagged={hasFlagged}
                hiddenKinds={hiddenKinds}
                onToggleKind={toggleKind}
              />
            </AccordionDetails>
          </Accordion>
        </Paper>
      ) : (
        <EmptyState message="No related terms in this ontology." />
      )}

      <Dialog open={expanded} onClose={() => setExpanded(false)} fullScreen>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton onClick={() => setExpanded(false)} aria-label="Close" sx={{ ml: -1 }}>
            <CloseIcon />
          </IconButton>
          {TITLE}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          <Stack gap={2} sx={{ flex: 1, minHeight: 0 }}>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <RelationshipGraphSvg graph={shownGraph} onSelect={handleSelect} height="100%" />
            </Box>
            <Legend
              rows={legend}
              hasFlagged={hasFlagged}
              hiddenKinds={hiddenKinds}
              onToggleKind={toggleKind}
            />
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
