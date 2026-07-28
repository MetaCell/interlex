import { useMemo } from "react";
import PropTypes from "prop-types";
import * as dagre from "@dagrejs/dagre";
import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";

// Node box metrics. Widths are derived from the label rather than fixed: these cell names run
// long ("DRG C-NP.MRGPRX1 MRGPRX4 (Bhuiyan2025)") and a fixed box truncated them to the point of
// ambiguity. Heights are fixed — one or two lines.
const NODE_MIN_W = 148;
const NODE_MAX_W = 260;
const CHAR_W = 6.6; // approximate advance width of Inter at 12px
const NODE_H_1 = 34; // title only
const NODE_H_2 = 52; // title + subtitle
const RANK_SEP = 96;
const NODE_SEP = 40;
const PAD = 16;

const nodeHeight = (n) => (n.subtitle ? NODE_H_2 : NODE_H_1);

const nodeWidth = (n) => {
  const longest = Math.max(n.label.length, (n.subtitle || "").length * 0.9);
  return Math.min(NODE_MAX_W, Math.max(NODE_MIN_W, Math.round(longest * CHAR_W) + 24));
};

// How many characters fit in a box of this width, so truncation matches the drawn box.
const fits = (width) => Math.floor((width - 20) / CHAR_W);
const clamp = (text, width) =>
  text.length > fits(width) ? `${text.slice(0, Math.max(1, fits(width) - 1))}…` : text;

// Edge style per relation kind, matching the expanded legend (Figma 8917:35906):
// subclass-of and soma-location are dashed, asserted-subclass and expresses are solid, and only
// "expresses" is drawn in the brand colour.
const edgeStyle = (kind, palette) => {
  switch (kind) {
    case "subClassOf":
      return { stroke: palette.grey[400], dash: "2 4" };
    case "somaLocation":
      return { stroke: palette.grey[500], dash: "6 4" };
    case "expresses":
      return { stroke: palette.primary.main, dash: undefined };
    case "assertedSubClassOf":
    default:
      return { stroke: palette.grey[400], dash: undefined };
  }
};

/**
 * Lay out and draw the relationship graph.
 *
 * dagre computes ranks and positions; we draw the SVG ourselves so nodes keep the design's
 * rounded-rect style (title + "npokb:998 · Bhuiyan2025" subtitle) and the four edge styles.
 *
 * Lateral satellites (soma location, expresses) are placed by hand afterwards rather than left
 * to dagre: dagre guarantees the *rank* but the order within a rank is heuristic, so "soma on
 * the left, expression on the right" would otherwise be luck. They are excluded from the layout
 * graph entirely and pinned relative to the current node once it has a position.
 */
const RelationshipGraphSvg = ({ graph, onSelect, height }) => {
  const theme = useTheme();

  const layout = useMemo(() => {
    const lateral = graph.edges.filter((e) => e.direction === "left" || e.direction === "right");
    const lateralIds = new Set(lateral.map((e) => e.to));
    const structural = graph.edges.filter((e) => !lateralIds.has(e.to));

    const g = new dagre.graphlib.Graph({ multigraph: true });
    g.setGraph({ rankdir: "TB", ranksep: RANK_SEP, nodesep: NODE_SEP, marginx: PAD, marginy: PAD });
    g.setDefaultEdgeLabel(() => ({}));

    for (const n of graph.nodes) {
      if (lateralIds.has(n.id)) continue;
      g.setNode(n.id, { width: nodeWidth(n), height: nodeHeight(n) });
    }
    structural.forEach((e, i) => {
      if (g.hasNode(e.from) && g.hasNode(e.to)) g.setEdge(e.from, e.to, {}, `e${i}`);
    });

    dagre.layout(g);

    const positions = new Map();
    for (const id of g.nodes()) {
      const { x, y } = g.node(id);
      positions.set(id, { x, y });
    }

    const current = graph.nodes.find((n) => n.isCurrent);
    const currentPos = current && positions.get(current.id);

    // Pin each satellite on its own side of the current node, on the same rank. dagre fixes the
    // rank but not the order within it, so left/right would otherwise be luck.
    for (const edge of lateral) {
      if (!currentPos || !current) continue;
      const node = graph.nodes.find((n) => n.id === edge.to);
      if (!node) continue;
      // Half of each box plus room for the caption between them.
      const offset = nodeWidth(current) / 2 + nodeWidth(node) / 2 + 128;
      positions.set(edge.to, {
        x: currentPos.x + (edge.direction === "left" ? -offset : offset),
        y: currentPos.y,
      });
    }

    // Recompute the extent, since the pinned satellites sit outside dagre's own bounds.
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const n of graph.nodes) {
      const p = positions.get(n.id);
      if (!p) continue;
      const h = nodeHeight(n);
      const w = nodeWidth(n);
      minX = Math.min(minX, p.x - w / 2);
      maxX = Math.max(maxX, p.x + w / 2);
      minY = Math.min(minY, p.y - h / 2);
      maxY = Math.max(maxY, p.y + h / 2);
    }
    if (!Number.isFinite(minX)) return null;

    // Shift into a 0-based viewBox with padding on every side.
    const dx = PAD - minX;
    const dy = PAD - minY;
    for (const [id, p] of positions) positions.set(id, { x: p.x + dx, y: p.y + dy });

    return {
      positions,
      width: maxX - minX + PAD * 2,
      height: maxY - minY + PAD * 2,
    };
  }, [graph]);

  if (!layout) return null;

  const { palette } = theme;

  // Orthogonal connector: leave the source vertically, travel, then enter the target. Matches
  // the design's right-angled elbows rather than dagre's spline points.
  const path = (from, to, fromNode, toNode, direction) => {
    if (direction === "left" || direction === "right") {
      const sign = direction === "left" ? -1 : 1;
      const x1 = from.x + (sign * nodeWidth(fromNode)) / 2;
      const x2 = to.x - (sign * nodeWidth(toNode)) / 2;
      return `M ${x1} ${from.y} L ${x2} ${to.y}`;
    }
    const fromH = nodeHeight(fromNode);
    const toH = nodeHeight(toNode);
    const up = to.y < from.y;
    const y1 = from.y + (up ? -fromH / 2 : fromH / 2);
    const y2 = to.y + (up ? toH / 2 : -toH / 2);
    const mid = (y1 + y2) / 2;
    return `M ${from.x} ${y1} L ${from.x} ${mid} L ${to.x} ${mid} L ${to.x} ${y2}`;
  };

  // First edge index per relation kind — the one that carries the caption.
  const captioned = new Map();
  graph.edges.forEach((edge, i) => {
    if (!captioned.has(edge.kind)) captioned.set(edge.kind, i);
  });

  return (
    <Box sx={{ width: "100%", height: height || "auto", overflow: "auto" }}>
      <svg
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        width="100%"
        height={height ? "100%" : undefined}
        style={{ display: "block", minWidth: layout.width > 560 ? layout.width : undefined }}
        role="img"
        aria-label="Relationship graph"
      >
        <defs>
          {["subClassOf", "somaLocation", "expresses", "assertedSubClassOf"].map((kind) => {
            const { stroke } = edgeStyle(kind, palette);
            return (
              <marker
                key={kind}
                id={`arrow-${kind}`}
                viewBox="0 0 8 8"
                refX="7"
                refY="4"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 7 4 L 0 7 z" fill={stroke} />
              </marker>
            );
          })}
        </defs>

        {graph.edges.map((edge, i) => {
          const from = layout.positions.get(edge.from);
          const to = layout.positions.get(edge.to);
          const fromNode = graph.nodes.find((n) => n.id === edge.from);
          const toNode = graph.nodes.find((n) => n.id === edge.to);
          if (!from || !to || !fromNode || !toNode) return null;
          const { stroke, dash } = edgeStyle(edge.kind, palette);
          // The design captions a *relation*, not every edge of it: four parents share one
          // "subclass of" on the trunk. Repeating it per edge collided at the shared midpoint.
          const label = captioned.has(edge.kind) && captioned.get(edge.kind) === i ? edge.label : null;
          const lx =
            edge.direction === "left" || edge.direction === "right"
              ? (from.x + to.x) / 2
              : from.x;
          const ly = (from.y + to.y) / 2;
          return (
            <g key={`${edge.from}-${edge.to}-${i}`}>
              <path
                d={path(from, to, fromNode, toNode, edge.direction)}
                fill="none"
                stroke={stroke}
                strokeWidth={1.5}
                strokeDasharray={dash}
                markerEnd={`url(#arrow-${edge.kind})`}
              />
              {label && (
                <>
                  {/* A filled plate behind the caption so the connector does not run through it. */}
                  <rect
                    x={lx - label.length * 3.2 - 6}
                    y={ly - 9}
                    width={label.length * 6.4 + 12}
                    height={18}
                    rx={4}
                    fill={palette.background.paper}
                  />
                  <text
                    x={lx}
                    y={ly + 4}
                    textAnchor="middle"
                    fontSize={11}
                    fill={palette.text.secondary}
                  >
                    {label}
                  </text>
                </>
              )}
            </g>
          );
        })}

        {graph.nodes.map((node) => {
          const p = layout.positions.get(node.id);
          if (!p) return null;
          const h = nodeHeight(node);
          const w = nodeWidth(node);
          const clickable = Boolean(node.ref && onSelect && !node.isCurrent);
          return (
            <g
              key={node.id}
              transform={`translate(${p.x - w / 2}, ${p.y - h / 2})`}
              onClick={clickable ? () => onSelect(node) : undefined}
              style={{ cursor: clickable ? "pointer" : "default" }}
            >
              <rect
                width={w}
                height={h}
                rx={6}
                fill={node.isCurrent ? palette.primary.light : palette.grey[50]}
                fillOpacity={node.isCurrent ? 0.28 : 1}
                stroke={node.isCurrent ? palette.primary.main : palette.divider}
                strokeWidth={node.isCurrent ? 1.5 : 1}
                // A flagged node is proposed evidence only — dashed border, per the legend.
                strokeDasharray={node.flagged ? "4 3" : undefined}
              />
              <text
                x={w / 2}
                y={node.subtitle ? 21 : h / 2 + 4}
                textAnchor="middle"
                fontSize={12}
                fontWeight={node.isCurrent ? 600 : 500}
                fill={palette.text.primary}
              >
                {/* Truncate to the box rather than overflow it; <title> carries the full text. */}
                {clamp(node.label, w)}
                {node.flagged ? "*" : ""}
              </text>
              {node.subtitle && (
                <text
                  x={w / 2}
                  y={38}
                  textAnchor="middle"
                  fontSize={10.5}
                  fill={palette.text.secondary}
                >
                  {clamp(node.subtitle, w)}
                </text>
              )}
              <title>{[node.label, node.subtitle].filter(Boolean).join(" — ")}</title>
            </g>
          );
        })}
      </svg>
    </Box>
  );
};

RelationshipGraphSvg.propTypes = {
  graph: PropTypes.shape({
    nodes: PropTypes.array.isRequired,
    edges: PropTypes.array.isRequired,
  }).isRequired,
  onSelect: PropTypes.func,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default RelationshipGraphSvg;
