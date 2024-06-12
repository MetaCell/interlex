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

  useEffect(() => {
    setTimeout( () => {
        getMatchTerms("ilx_0101431").then(data => { 
            const parsedData = termParser(data, "brain")
            console.log("Parsed retrieved data : ", parsedData)
            setTerms(parsedData)
        });
    }, 750);
  }, []);
  
  const hierarchy = useMemo(() => {
    console.log("Terms ", terms)
    return d3.hierarchy(data).sum((d) => d.value);
  }, [terms]);

  const dendrogram = useMemo(() => {
    const dendrogramGenerator = d3.cluster().size([boundsHeight, boundsWidth]);
    return dendrogramGenerator(hierarchy);
  }, [hierarchy, width, height]);

  const allNodes = dendrogram.descendants().map((node) => {
    return (
      <g key={node.id}>
        {(
          <text
            x={boundsWidth - (node.y + 30)}
            y={node.x - 15}
            fontSize={12}
            textAnchor="left"
            alignmentBaseline="middle"
            stroke="black"
            fill="darkOrange"
          >
            {node.data.name}
          </text>
        )}
      </g>
    );
  });

  const horizontalLinkGenerator = d3.linkHorizontal();

  const allEdges = dendrogram.descendants().map((node) => {
    if (!node.parent) {
      return;
    }
    return (
      <path
        key={node.id}
        fill="none"
        stroke="grey"
        markerStart='url(#arrow)'
        d={horizontalLinkGenerator({
          source: [boundsWidth - node.parent.y + 30, node.parent.x - 15],
          target: [boundsWidth - node.y + 30, node.x - 15],
        })}
      />
    );
  });

  return (
    <div>
      <svg width={width} height={height}>
        <g
          width={boundsWidth}
          height={boundsHeight}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
        >
          {allNodes}
          {allEdges}
        </g>
      </svg>
    </div>
  );
};

export default Graph;