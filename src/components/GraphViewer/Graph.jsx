import * as d3 from "d3";
import PropTypes from "prop-types";
import { Box } from "@mui/material";
import { useMemo, useEffect, useCallback, useRef, useState } from "react";
import { getGraphStructure, PREDICATE, ROOT } from "./GraphStructure";
import { vars } from "../../theme/variables";
const { gray600, white } = vars;

const MARGIN = { top: 40, right: 40, bottom: 40, left: 40 };
// The graph is laid out in fixed "natural" coordinates and then scaled to the
// container width via the SVG viewBox. Because gaps and font size scale
// together, labels never overlap regardless of how many objects a predicate
// has, and there is never any horizontal scroll.
const ROW_HEIGHT = 26;          // vertical room per object in natural units
const COL_WIDTH = 460;          // horizontal spread between hierarchy depths
const LABEL_ALLOWANCE = 380;    // room reserved for (truncated) leaf labels
const MIN_LAYOUT_HEIGHT = 180;  // keep small graphs from looking cramped
const MAX_LABEL_CHARS = 48;     // truncate long IRIs; full text shows on hover

const truncateLabel = (label) =>
  label.length > MAX_LABEL_CHARS ? `${label.slice(0, MAX_LABEL_CHARS - 1)}…` : label;

const Graph = ({ width, height, predicate }) => {
  const containerRef = useRef(null);
  // Expand to fill the available container width so full IRIs are visible;
  // fall back to the `width` prop before the container is measured.
  const [measuredWidth, setMeasuredWidth] = useState(width);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect?.width;
      if (w) setMeasuredWidth(w);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const effectiveWidth = measuredWidth || width;
  // Natural (pre-scale) drawing area for the dendrogram itself.
  const boundsWidth = COL_WIDTH;

  const mouseover = useCallback((event) => {
    d3.select("#tooltip").html(event.currentTarget.id).style("opacity", 1);
  }, []);
  const mousemove = useCallback((event) => {
    d3.select("#tooltip")
      .style("left", `${event.clientX + 10}px`)
      .style("top", `${event.clientY + 10}px`);
  }, []);
  const mouseleave = useCallback(() => {
    d3.select("#tooltip").style("opacity", 0);
  }, []);
  const onScroll = useCallback(() => {
    d3.select("#tooltip").style("opacity", 0);
  }, []);

  const hierarchy = useMemo(() => {
    const data = getGraphStructure(predicate);
    return d3.hierarchy(data).sum((d) => d.value || 1);
  }, [predicate]);

  // Grow the vertical layout with the number of leaves so each object gets at
  // least ROW_HEIGHT of space; small graphs keep a sensible minimum.
  const leafCount = useMemo(() => hierarchy.leaves().length, [hierarchy]);
  const layoutHeight = Math.max(MIN_LAYOUT_HEIGHT, leafCount * ROW_HEIGHT);

  // Natural canvas size, then scale to fill the container width. Height follows
  // the same scale so the whole graph is visible with no scrollbars.
  const naturalWidth = MARGIN.left + boundsWidth + LABEL_ALLOWANCE + MARGIN.right;
  const naturalHeight = MARGIN.top + layoutHeight + MARGIN.bottom;
  const scale = effectiveWidth ? effectiveWidth / naturalWidth : 1;
  // `height` acts as a minimum so small graphs still fill the area; tall graphs
  // grow with their content (full width, no scrollbars).
  const displayHeight = Math.max(height, naturalHeight * scale);

  const dendrogram = useMemo(() => {
    const gen = d3
      .cluster()
      .size([layoutHeight, boundsWidth])
      // Give a little extra gap between objects of different parents.
      .separation((a, b) => (a.parent === b.parent ? 1 : 1.4));
    return gen(hierarchy);
  }, [hierarchy, layoutHeight, boundsWidth]);

  useEffect(() => {
    const nodes = d3.selectAll(".node--leaf-g");
    nodes.on("mouseover", mouseover).on("mousemove", mousemove).on("mouseleave", mouseleave);
    window.addEventListener("scroll", onScroll);
    return () => {
      nodes.on("mouseover", null).on("mousemove", null).on("mouseleave", null);
      window.removeEventListener("scroll", onScroll);
    };
  }, [predicate, mouseover, mousemove, mouseleave, onScroll]);

  const allNodes = dendrogram.descendants().map((node) => {
    const isGroup = node.data.type === PREDICATE || node.data.type === ROOT;
    const textOffset = isGroup ? -40 : 5;
    const label = String(node.data.name ?? "unknown");
    const truncated = truncateLabel(label);

    return (
      <g key={`${node.data.id}-${node.x}-${node.y}`}>
        <text
          x={node.y + textOffset}
          y={node.x - (isGroup ? 10 : 0)}
          id={label}
          className="node--leaf-g"
          fontSize={12}
          textAnchor="start"
          alignmentBaseline="middle"
          fill="black"
        >
          {truncated}
        </text>
      </g>
    );
  });

  const allEdges = dendrogram.descendants().map((node, i) => {
    if (!node.parent) {
      return <circle key={`root-${i}`} cx={node.y} cy={node.x} r={5} fill="grey" />;
    }
    const line = d3.line().x((d) => d[0]).y((d) => d[1]).curve(d3.curveBundle.beta(0.75));
    const start = [node.parent.y, node.parent.x];
    const end = [node.y, node.x];
    const points = [start, [start[0] - 5, end[1]], end];
    return (
      <path
        key={`edge-${i}`}
        fill="none"
        stroke="grey"
        markerEnd="url(#arrowhead)"
        d={line(points)}
      />
    );
  });

  const hasChildren =
    hierarchy && hierarchy.data && Array.isArray(hierarchy.data.children) && hierarchy.data.children.length > 0;

  return (
    <Box ref={containerRef} sx={{ width: "100%", overflow: "hidden" }}>
      <Box
        id="tooltip"
        style={{
          position: "fixed",
          pointerEvents: "none",
          opacity: 0,
          zIndex: 1000,
          background: gray600,
          color: white,
          padding: "0.5rem",
          borderRadius: "0.5rem",
        }}
      />
      <svg
        width="100%"
        height={displayHeight}
        viewBox={`0 0 ${naturalWidth} ${naturalHeight}`}
        preserveAspectRatio="xMinYMin meet"
      >
        <defs>
          <marker
            id="arrowhead"
            viewBox="0 0 10 10"
            refX="10"
            refY="5"
            fill="grey"
            markerWidth="10"
            markerHeight="10"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" />
          </marker>
        </defs>
        <g transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}>
          {hasChildren ? (
            <>
              {allNodes}
              {allEdges}
            </>
          ) : (
            // fallback: show root only with a hint
            <text x={0} y={0} fontSize={12} fill="grey">
              No graph data
            </text>
          )}
        </g>
      </svg>
    </Box>
  );
};

Graph.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  // IMPORTANT: now expects the predicate GROUP object (with rows/values/edges or legacy tableData)
  predicate: PropTypes.shape({
    title: PropTypes.string,
    rows: PropTypes.array,
    values: PropTypes.array,
    edges: PropTypes.array,
    tableData: PropTypes.array,
  }).isRequired,
};

export default Graph;
