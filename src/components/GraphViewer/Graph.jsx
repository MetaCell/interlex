import * as d3 from "d3";
import PropTypes from "prop-types";
import { Box } from "@mui/material";
import { useMemo, useEffect, useCallback, useRef, useState } from "react";
import { getGraphStructure, PREDICATE, ROOT } from "./GraphStructure";
import { vars } from "../../theme/variables";
const { gray600, white } = vars;

const MARGIN = { top: 60, right: 60, bottom: 60, left: 60 };

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

  const effectiveWidth = Math.max(measuredWidth || width, width);
  const boundsWidth = Math.max(0, effectiveWidth - (MARGIN.right + MARGIN.left * 4));
  const boundsHeight = Math.max(0, height - MARGIN.top - MARGIN.bottom);
  // Extra horizontal room so full (untruncated) IRI labels are visible; the
  // container scrolls horizontally when labels run past the container width.
  const LABEL_SPACE = 900;
  const svgWidth = effectiveWidth + LABEL_SPACE;

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

  const dendrogram = useMemo(() => {
    const gen = d3.cluster().size([boundsHeight, boundsWidth]);
    return gen(hierarchy);
  }, [hierarchy, boundsHeight, boundsWidth]);

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
    // Show the full IRI for now (most will become curies / be hidden later)
    const truncated = label;

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
    <Box ref={containerRef} sx={{ width: "100%", overflowX: "auto" }}>
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
      <svg width={svgWidth} height={height}>
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
        <g
          width={boundsWidth}
          height={boundsHeight}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
        >
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
