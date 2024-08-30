import { useMemo, useEffect, useState } from "react";
import { getGraphStructure , OBJECT, SUBJECT, PREDICATE, ROOT} from "./GraphStructure";
import * as d3 from "d3";
import { Box } from "@mui/material";

const MARGIN = { top: 60, right: 60, bottom: 60, left: 60 };

const Graph = ({ width, height, predicate }) => {
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  // Three function that change the tooltip when user hover / move / leave a cell
  const mouseover = (d) => {
    d3.select("#tooltip")
      .html((c) => {
        return d.currentTarget.id
      }).style("opacity", 1).style("left", (d.pageX) + "px").style("top", (d.pageY) + "px")
  }
  const mousemove = (event, d) => {
    d3.select("#tooltip")
      .html((c) => {
        return event.currentTarget.id
      }).style("opacity", 1).style("left", (event.pageX) + "px").style("top", (event.pageY) + "px")

  }
  const mouseleave = (d) => {
    d3.select("#tooltip").style("opacity", 0)
  }

  useEffect(() => {
    // attach mouse listeners
    d3.selectAll(".node--leaf-g")
      .on("mousemove", mousemove)
    d3.selectAll(".node--g")
      .on("mouseleave", mouseleave)
  }, []);

  const hierarchy = useMemo(() => {
    const data = getGraphStructure(predicate)
    return d3.hierarchy(data).sum((d) => d.value);
  }, [predicate]);

  const dendrogram = useMemo(() => {
    const dendrogramGenerator = d3.cluster().size([boundsHeight, boundsWidth]);
    return dendrogramGenerator(hierarchy);
  }, [hierarchy, width, height]);

  const allNodes = dendrogram.descendants().map((node) => {
    let textOffset = 0;
    if ( node.data.type === OBJECT ) {
      textOffset = 40;
    } else if ( node.data.type === SUBJECT ) {
      textOffset = 40;
    } else if ( node.data.type === PREDICATE ) {
      textOffset = 40;
    }

    return (
      
      <g key={node.id} >
        {(
          <text
            x={(boundsWidth - (node.y) ) - textOffset }
            y={node.x - (node.data.type === ROOT ? 0 : 10)}
            id={node.data.name}
            width={80}
            height={20}
            className="node--leaf-g"
            fontSize={12}
            textAnchor="left"
            alignmentBaseline="middle"
            fill="black"
            target="_blank"
            href="google.com"
          >
            {node.data.name }
          </text>
        )}
      </g>
    );
  });

  const allEdges = dendrogram.descendants().map((node) => {
    if (!node.parent) {
      return;
    }

    const line = d3
      .line()
      .x(d => d[0])
      .y(d => d[1])
      .curve(d3.curveBundle.beta(.75));

    const start = [boundsWidth - node.parent.y, node.parent.x]
    const end = [boundsWidth - node.y, node.x]
    const radius = 4;

    const points = [
      start,
      [start[0] + radius, end[1]],
      end
    ];

    return (
      <path
        key={node.id}
        fill="none"
        stroke="grey"
        markerStart='url(#head)'
        d={line(points)}
      />
    );
  });

  return (
    <Box id="div_template" >
      <Box id="tooltip" style={{ position: "fixed", width: "200px", height: "200px" }}></Box>
      <svg width={width} height={height} >
        <defs>
          <marker
            id="head"
            viewBox="0 0 10 10"
            refX="10"
            refY="5"
            fill="grey"
            markerWidth="10"
            markerHeight="10"
            orient="auto-start">
            <path d="M 0 0 L 10 5 L 0 10 z" />
          </marker>
        </defs>
        <g
          width={boundsWidth}
          height={boundsHeight}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
        >
          {allNodes}
          {allEdges}
        </g>
      </svg>
      <Box sx={{
        display: 'flex',
        justifyContent: 'end',
        m: '1rem 8rem auto',
      }}>
      </Box>

    </Box>
  );
};

export default Graph;