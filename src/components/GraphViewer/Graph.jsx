import { useMemo, useEffect, useState } from "react";
import data from "./GraphStructure";
import * as d3 from "d3";
import * as mockApi from './../../api/endpoints/swaggerMockMissingEndpoints';
import { termParser } from "../../parsers/termParser";

const MARGIN = { top: 60, right: 60, bottom: 60, left: 60 };
const useMockApi = () => mockApi;

const Graph = ({ width, height }) => {
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  const {  getMatchTerms } = useMockApi();

  const [terms, setTerms] = useState(undefined);

  // Three function that change the tooltip when user hover / move / leave a cell
  const mouseover = (d) => {
    d3.select("#tooltip")
      .html( (c) => { 
        return "The exact value of<br>this tooltip is: " + d.currentTarget.id
      }).style("opacity", 1).style("left", (d.pageX) + "px").style("top", (d.pageY) + "px")
  }
  const mousemove = (event,d) => {
    d3.select("#tooltip")
      .html( (c) => { 
        return "The exact value of<br>this tooltip is: " + event.currentTarget.id
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
    setTimeout( () => {
        getMatchTerms("ilx_0101431").then(data => { 
            const parsedData = termParser(data, "brain")
            setTerms(parsedData)
        });
    }, 750);
  }, []);
  
  const hierarchy = useMemo(() => {
    return d3.hierarchy(data).sum((d) => d.value);
  }, [terms]);

  const dendrogram = useMemo(() => {
    const dendrogramGenerator = d3.cluster().size([boundsHeight, boundsWidth]);
    return dendrogramGenerator(hierarchy);
  }, [hierarchy, width, height]);
  const xMargin = 4
  const yMargin = 2
  const allNodes = dendrogram.descendants().map((node) => {
    return (
      <g key={node.id} >
        <g>
          <rect
            x={boundsWidth - (node.y)}
            y={node.x - 5}
            width={100}
            height={20}
            fill="white"
            className="node--g"
          >
            {node.data.name}
          </rect>
          </g>
        {(
          <text
            x={boundsWidth - (node.y) }
            y={node.x }
            id={node.data.name}
            width={100}
            height={20}
            className="node--leaf-g" 
            fontSize={12}
            textAnchor="left"
            alignmentBaseline="middle"
            fill="grey"
            target="_blank"
            href="google.com"
            textDecoration="underline"
          >
            {node.data.name.substring(0, 15) + '...'}
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
    .curve(d3.curveBundle.beta(1));

    const start = [boundsWidth - node.parent.y, node.parent.x]
    const end = [boundsWidth - node.y, node.x]
    const radius = 5;
    
    const points = [
      start,
      [start[0], end[1] - radius],
      [start[0] + radius, end[1]],
      end
    ];
    
    return (
      <path
        key={node.id}
        fill="none"
        stroke="grey"
        markerStart='url(#arrow)'
        d={line(points)}
      />
    );
  });

  return (
    <div id="div_template" >
      <div id="tooltip" style={{position: "fixed", width: "200px",height: "200px"}}></div>
      <svg width={width} height={height} >
        <g
          width={boundsWidth}
          height={boundsHeight}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
        >
          {allEdges}
          {allNodes}
        </g>
      </svg>
    </div>
  );
};

export default Graph;