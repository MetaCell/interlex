import * as d3 from "d3";
import PropTypes from "prop-types";
import { Box } from "@mui/material";
import { useMemo, useEffect } from "react";
import { getGraphStructure , OBJECT, SUBJECT, PREDICATE, ROOT} from "./GraphStructure";

const MARGIN = { top: 60, right: 60, bottom: 60, left: 60 };

const Graph = ({ width, height, predicate }) => {
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  // Three function that change the tooltip when user hover / move / leave a cell
  // eslint-disable-next-line no-unused-vars
  const mouseover = (event) => {
    d3.select("#tooltip")
      .html(event.currentTarget.id)
      .style("opacity", 1)
    d3.select("#tooltip").style("left", (d.pageX) + "px").style("top", (d.pageY) + "px")
  }
  // eslint-disable-next-line no-unused-vars
  const mousemove = (event) => {
    d3.select("#tooltip")
      .style("left", `${event.clientX + 10}px`)
      .style("top", `${event.clientY + 10}px`);
  }
  // eslint-disable-next-line no-unused-vars
  const mouseleave = (d) => {
    d3.select("#tooltip").style("opacity", 0)
  }

  useEffect(() => {
    // attach mouse listeners
    const nodes = d3.selectAll(".node--leaf-g");
    nodes
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave);

    // Hide tooltip on scroll
    window.addEventListener("scroll", () => {
      d3.select("#tooltip").style("opacity", 0);
    });

    return () => {
      nodes.on("mouseover", null).on("mousemove", null).on("mouseleave", null);
      window.removeEventListener("scroll", () => {});
    };
  }, []);

  const hierarchy = useMemo(() => {
    const data = getGraphStructure(predicate)
    return d3.hierarchy(data).sum((d) => d.value);
  }, [predicate]);

  const dendrogram = useMemo(() => {
    const dendrogramGenerator = d3.cluster().size([boundsHeight, boundsWidth]);
    return dendrogramGenerator(hierarchy);
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const truncatedName = node.data.name.length > 20 
      ? `${node.data.name.substring(0, 20)}...` 
      : node.data.name;

    return (
      <g key={node.id} >
        {(
          <text
            x={(boundsWidth - (node.y) ) - textOffset }
            y={node.x - (node.data.type === ROOT ? 0 : 10)}
            id={node.data.name}
            className="node--leaf-g"
            fontSize={12}
            textAnchor="left"
            alignmentBaseline="middle"
            fill="black"
            target="_blank"
            href={node.data.name}
          >
            {truncatedName}
          </text>
        )}
      </g>
    );
  });

  const allEdges = dendrogram.descendants().map((node, index) => {
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
    const radius = 5;

    const points = [
      start,
      [start[0] + radius, end[1]],
      end
    ];

    return (
      <path
        key={`${node.id}-${index}`}
        fill="none"
        stroke="grey"
        markerStart='url(#head)'
        d={line(points)}
      />
    );
  });

  return (
    <Box id="div_template" >
      <Box id="tooltip" style={{
        position: "fixed", 
        pointerEvents: "none",
        opacity: 0,
        zIndex: 1000,
      }}>
      </Box>
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

Graph.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  predicate: PropTypes.string.isRequired,
};

export default Graph;
