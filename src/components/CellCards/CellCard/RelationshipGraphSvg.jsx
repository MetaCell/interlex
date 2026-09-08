import { useMemo } from "react";
import PropTypes from "prop-types";
import * as dagre from "@dagrejs/dagre";
import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { RELATION_EDGE_KINDS } from "../model/mappings";
import { ARROW_HEADS, arrowHeadProps, edgeStyle } from "./relationEdgeStyle";

// Node box metrics. Width still follows the label — a name near the cap gets a wider box than a
// short one, rather than every node sharing one fixed size — but every line of text (title,
// subtitle, edge caption) is capped at LABEL_MAX_CHARS characters; the node's <title> tooltip
// always carries the untruncated text. Heights are fixed — one or two lines.
const NODE_MIN_W = 148;
const NODE_MAX_W = 260;
const CHAR_W = 6.6; // approximate advance width of Inter at 12px
const NODE_H_1 = 34; // title only
const NODE_H_2 = 52; // title + subtitle
const RANK_SEP = 96;
const RUN_SPACING = 32; // between the horizontal runs at two different levels of one rank gap
const TRUNK_INSET = 16; // a side group's trunk leaves the current node's face this far from its corner
const NODE_SEP = 40;
const PAD = 16;
const LABEL_MAX_CHARS = 20;

const nodeHeight = (n) => (n.subtitle ? NODE_H_2 : NODE_H_1);

const nodeWidth = (n) => {
  const longest = Math.max(
    Math.min(n.label.length, LABEL_MAX_CHARS),
    Math.min((n.subtitle || "").length, LABEL_MAX_CHARS) * 0.9
  );
  return Math.min(NODE_MAX_W, Math.max(NODE_MIN_W, Math.round(longest * CHAR_W) + 24));
};

// How many characters fit in a box of this width, so truncation matches the drawn box — capped at
// LABEL_MAX_CHARS even when the box has room for more.
const fits = (width) => Math.min(LABEL_MAX_CHARS, Math.floor((width - 20) / CHAR_W));
const clamp = (text, width) =>
  text.length > fits(width) ? `${text.slice(0, Math.max(1, fits(width) - 1))}…` : text;

// Half the width of the plate drawn behind an edge caption, at 11px.
const captionHalfWidth = (label) => label.length * 3.2 + 6;

// A caption has no box to size against, so it gets the flat character cap directly.
const clampCaption = (label) => clamp(label, Infinity);

const isLateral = (edge) => edge.direction === "left" || edge.direction === "right";

// Every vertical edge has the current node at one end. Which end takes the upper rank follows from
// the direction: "up" ranks `to` above `from`.
const otherEnd = (edge, currentId) => (edge.from === currentId ? edge.to : edge.from);
const isAbove = (edge, currentId) =>
  edge.direction === "up" ? edge.from === currentId : edge.to === currentId;

// The relation kinds on one side of the current node, in first-appearance order.
const kindsOf = (edges) => [...new Set(edges.map((e) => e.kind))];

/**
 * Lay out one side of the current node so that every relation kind is a path of its own.
 *
 * dagre only fixes the rank. The nodes' order and positions, and how the edges reach them, are
 * decided here: each kind's nodes are packed as one group, the groups sit side by side with the
 * whole row centred on the current node, and each group gets its own trunk leaving the current
 * node's face, its own run and its own caption — the lines follow the boxes, not the other way
 * round. Two kinds sharing a trunk read as one relation with two labels; nested groups put one
 * kind's drops through the other kind's run. The runs share one height, except that a group whose
 * run reaches over another group's boxes takes a level further out, so nothing crosses.
 *
 * Returns the geometry each edge is drawn with and the captions, one per group. Mutates
 * `positions` for the side's nodes.
 */
const layoutSide = (edges, above, current, positions, nodeById) => {
  const cur = positions.get(current.id);
  const claimed = new Set();
  const groups = kindsOf(edges).flatMap((kind) => {
    const own = edges.filter((e) => e.kind === kind);
    const ids = [...new Set(own.map((e) => otherEnd(e, current.id)))].filter(
      (id) => positions.has(id) && !claimed.has(id)
    );
    ids.forEach((id) => claimed.add(id));
    return ids.length ? [{ kind, edges: own, ids, label: clampCaption(own[0].label) }] : [];
  });
  if (!groups.length) return { geometry: new Map(), captions: [] };

  // Pack the groups left to right and centre the row on the current node.
  const widthOf = (id) => nodeWidth(nodeById.get(id));
  const rowWidth =
    groups.flatMap((g) => g.ids).reduce((sum, id) => sum + widthOf(id) + NODE_SEP, -NODE_SEP);
  let x = cur.x - rowWidth / 2;
  // One trunk per group, spread across the current node's face in the groups' order; a lone
  // group's is at the centre. A group's span is what its run covers: trunk to farthest box.
  const reach = nodeWidth(current) / 2 - TRUNK_INSET;
  groups.forEach((g, i) => {
    for (const id of g.ids) {
      positions.set(id, { x: x + widthOf(id) / 2, y: positions.get(id).y });
      x += widthOf(id) + NODE_SEP;
    }
    g.trunkX = groups.length === 1 ? cur.x : cur.x - reach + (2 * reach * i) / (groups.length - 1);
    const xs = [g.trunkX, ...g.ids.map((id) => positions.get(id).x)];
    g.span = [Math.min(...xs), Math.max(...xs)];
  });

  // Runs share one height unless a group's run reaches over another group's boxes — a wide group
  // straddling the current node beside a narrow one. The covered group's drops would cut through
  // that run, so the covering group's run stays nearer the current node and the covered group's
  // goes a level further out, past where the nearer run ends; the far group's trunk then passes
  // the near level outside the near run's span. Trunks are in the groups' order and box spans are
  // disjoint, so the relation is acyclic.
  const covers = (g, other) =>
    other.ids.some((id) => {
      const px = positions.get(id).x;
      return px > g.span[0] && px < g.span[1];
    });
  const levelOf = (g) => {
    if (g.level === undefined) {
      const nearer = groups.filter((other) => other !== g && covers(other, g)).map(levelOf);
      g.level = nearer.length ? Math.max(...nearer) + 1 : 0;
    }
    return g.level;
  };
  const levels = Math.max(...groups.map(levelOf)) + 1;

  const sign = above ? -1 : 1;
  const face = cur.y + (sign * nodeHeight(current)) / 2;
  const gap = Math.min(
    ...groups.flatMap((g) =>
      g.ids.map((id) => Math.abs(positions.get(id).y - (sign * nodeHeight(nodeById.get(id))) / 2 - face))
    )
  );
  groups.forEach((g) => {
    g.runY = face + (sign * gap * (g.level + 1)) / (levels + 1);
  });

  const geometry = new Map();
  for (const g of groups) for (const e of g.edges) geometry.set(e, { trunkX: g.trunkX, runY: g.runY, sign });
  // A central caption sits at the foot of its trunk, as in the design. A side group's sits on its
  // run just past the elbow, on the side its boxes lie, so the two sides' captions are as far apart
  // as their paths — unless the run does not reach that far, when it would float past the drop;
  // then it sits on the trunk, halfway between the face and the run.
  const captions = groups.map((g) => {
    const half = captionHalfWidth(g.label);
    const outward = Math.sign(g.trunkX - cur.x);
    const runOut = Math.max(0, ...g.ids.map((id) => outward * (positions.get(id).x - g.trunkX)));
    if (!outward) return { x: g.trunkX, y: g.runY, label: g.label };
    if (runOut < half * 2 + 8) return { x: g.trunkX, y: (face + g.runY) / 2, label: g.label };
    return { x: g.trunkX + outward * (half + 4), y: g.runY, label: g.label };
  });
  return { geometry, captions };
};

/**
 * Lay out and draw the relationship graph.
 *
 * dagre computes ranks and positions; we draw the SVG ourselves so nodes keep the design's
 * rounded-rect style (title + "npokb:998 · Bhuiyan2025" subtitle) and the edge styles.
 *
 * dagre guarantees the *rank* but the order within a rank is heuristic, so the ranks next to the
 * current node are laid out by hand (layoutSide), and the lateral satellites (soma location,
 * expresses) are excluded from the layout graph entirely and pinned left and right of the current
 * node once it has a position.
 */
const RelationshipGraphSvg = ({ graph, onSelect, height }) => {
  const theme = useTheme();

  const layout = useMemo(() => {
    const nodeById = new Map(graph.nodes.map((n) => [n.id, n]));
    const current = graph.nodes.find((n) => n.isCurrent);
    if (!current) return null;

    const lateral = graph.edges.filter(isLateral);
    const lateralIds = new Set(lateral.map((e) => e.to));
    const structural = graph.edges.filter((e) => !lateralIds.has(e.to));
    const sides = {
      above: structural.filter((e) => isAbove(e, current.id)),
      below: structural.filter((e) => !isAbove(e, current.id)),
    };

    // The gap between ranks holds up to one run level per relation kind on a side (see
    // layoutSide), so it widens for an unusually crowded side.
    const mostKinds = Math.max(kindsOf(sides.above).length, kindsOf(sides.below).length);
    const ranksep = Math.max(RANK_SEP, RUN_SPACING * (mostKinds + 1));

    const g = new dagre.graphlib.Graph({ multigraph: true });
    g.setGraph({ rankdir: "TB", ranksep, nodesep: NODE_SEP, marginx: PAD, marginy: PAD });
    g.setDefaultEdgeLabel(() => ({}));

    for (const n of graph.nodes) {
      if (lateralIds.has(n.id)) continue;
      g.setNode(n.id, { width: nodeWidth(n), height: nodeHeight(n) });
    }
    // dagre ranks the tail above the head. An "up" edge points at the superclass, which takes the
    // rank above, so it enters the layout reversed.
    structural.forEach((e, i) => {
      const [top, bottom] = e.direction === "up" ? [e.to, e.from] : [e.from, e.to];
      if (g.hasNode(top) && g.hasNode(bottom)) g.setEdge(top, bottom, {}, `e${i}`);
    });

    dagre.layout(g);

    const positions = new Map();
    for (const id of g.nodes()) {
      const { x, y } = g.node(id);
      positions.set(id, { x, y });
    }
    if (!positions.has(current.id)) return null;

    const geometry = new Map();
    const captions = [];
    for (const [name, edges] of Object.entries(sides)) {
      const side = layoutSide(edges, name === "above", current, positions, nodeById);
      side.geometry.forEach((geo, edge) => geometry.set(edge, geo));
      captions.push(...side.captions);
    }

    // Pin each satellite on its own side of the current node, on the same rank.
    const currentPos = positions.get(current.id);
    for (const edge of lateral) {
      const node = nodeById.get(edge.to);
      if (!node) continue;
      // Half of each box plus room for the caption between them.
      const offset = nodeWidth(current) / 2 + nodeWidth(node) / 2 + 128;
      positions.set(edge.to, {
        x: currentPos.x + (edge.direction === "left" ? -offset : offset),
        y: currentPos.y,
      });
    }

    // Recompute the extent, since the hand-laid ranks and the pinned satellites sit outside
    // dagre's own bounds.
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

    // Shift into a 0-based viewBox with padding on every side.
    const dx = PAD - minX;
    const dy = PAD - minY;
    for (const [id, p] of positions) positions.set(id, { x: p.x + dx, y: p.y + dy });
    for (const [edge, geo] of geometry) geometry.set(edge, { ...geo, trunkX: geo.trunkX + dx, runY: geo.runY + dy });

    return {
      nodeById,
      positions,
      current,
      geometry,
      captions: captions.map((c) => ({ ...c, x: c.x + dx, y: c.y + dy })),
      width: maxX - minX + PAD * 2,
      height: maxY - minY + PAD * 2,
    };
  }, [graph]);

  if (!layout) return null;

  const { palette } = theme;
  const { current, positions, nodeById } = layout;

  // Orthogonal connectors — the design's right-angled elbows rather than dagre's spline points.
  // A vertical edge runs from the current node's face down its kind's trunk, along the run, then
  // drops into the node, drawn from `from` to `to` so the arrowhead lands on the object; a lateral
  // one is a straight line between the facing sides.
  const lateralPath = (from, to, fromNode, toNode, direction) => {
    const sign = direction === "left" ? -1 : 1;
    const x1 = from.x + (sign * nodeWidth(fromNode)) / 2;
    const x2 = to.x - (sign * nodeWidth(toNode)) / 2;
    return `M ${x1} ${from.y} L ${x2} ${to.y}`;
  };
  const verticalPath = (edge, { trunkX, runY, sign }) => {
    const node = nodeById.get(otherEnd(edge, current.id));
    const cur = positions.get(current.id);
    const p = positions.get(node.id);
    const points = [
      [trunkX, cur.y + (sign * nodeHeight(current)) / 2],
      [trunkX, runY],
      [p.x, runY],
      [p.x, p.y - (sign * nodeHeight(node)) / 2],
    ];
    if (edge.to === current.id) points.reverse();
    return `M ${points.map((pt) => pt.join(" ")).join(" L ")}`;
  };

  const captions = [...layout.captions];
  const lateralCaptioned = new Set();
  const paths = graph.edges.map((edge, i) => {
    const from = positions.get(edge.from);
    const to = positions.get(edge.to);
    const fromNode = nodeById.get(edge.from);
    const toNode = nodeById.get(edge.to);
    if (!from || !to || !fromNode || !toNode) return null;
    const { stroke, dash, bidirectional } = edgeStyle(edge.kind, palette);

    let d;
    if (isLateral(edge)) {
      d = lateralPath(from, to, fromNode, toNode, edge.direction);
      if (!lateralCaptioned.has(edge.kind)) {
        lateralCaptioned.add(edge.kind);
        captions.push({ x: (from.x + to.x) / 2, y: from.y, label: clampCaption(edge.label) });
      }
    } else {
      const geo = layout.geometry.get(edge);
      if (!geo) return null;
      d = verticalPath(edge, geo);
    }

    return (
      <path
        key={`${edge.from}-${edge.to}-${i}`}
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={1.5}
        strokeDasharray={dash}
        markerStart={bidirectional ? `url(#arrow-${edge.kind})` : undefined}
        markerEnd={`url(#arrow-${edge.kind})`}
      />
    );
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
          {RELATION_EDGE_KINDS.map((kind) => {
            const { stroke, head } = edgeStyle(kind, palette);
            return (
              // Sized in user units so the head is the same shape the legend draws.
              <marker
                key={kind}
                id={`arrow-${kind}`}
                viewBox="-12 -6 14 12"
                refX="0"
                refY="0"
                markerWidth="14"
                markerHeight="12"
                markerUnits="userSpaceOnUse"
                orient="auto-start-reverse"
              >
                <path d={ARROW_HEADS[head].d} {...arrowHeadProps(head, stroke, palette)} />
              </marker>
            );
          })}
        </defs>

        {paths}

        {/* Captions go on top of every connector, so a trunk never runs through a label. */}
        {captions.map(({ x, y, label }) => (
          <g key={`${label}-${x}-${y}`}>
            {/* The design's outlined pill (Figma 9674:68059) behind the caption, so the connector
                stops at the label's edge instead of running through it. */}
            <rect
              x={x - captionHalfWidth(label)}
              y={y - 9}
              width={captionHalfWidth(label) * 2}
              height={18}
              rx={4}
              fill={palette.background.paper}
              stroke={palette.grey[50]}
            />
            <text x={x} y={y + 4} textAnchor="middle" fontSize={11} fill={palette.text.secondary}>
              {label}
            </text>
          </g>
        ))}

        {graph.nodes.map((node) => {
          const p = positions.get(node.id);
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
