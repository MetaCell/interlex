import { useMemo, useEffect, useState } from "react";
import data from "./GraphStructure";
import * as d3 from "d3";
import { getMatchTerms } from './../../api/endpoints';
import {useQuery} from "../../helpers";
import {Box, Button, Collapse} from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import SingleSearch from "../SingleTermView/SingleSearch";

const MARGIN = { top: 60, right: 60, bottom: 60, left: 60 };

const Graph = ({ width, height, predicate }) => {
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  const [terms, setTerms] = useState(undefined);
  const [objectSearchTerm, setObjectSearchTerm] = useState('');
  const [object, setObject] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  
  const query = useQuery();
  const term = query.get('searchTerm');
  
  const handleSelectChange = (v) => {
    setObject(v.label)
    setIsSearchVisible(false)
  }
  
  const handleButtonClick = () => {
    setIsSearchVisible(!isSearchVisible);
  };
  
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
            setTerms(data)
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
  const allNodes = dendrogram.descendants().map((node, index) => {
    return (
      <g key={`${node.id}-${index}`} >
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

  const allEdges = dendrogram.descendants().map((node, index) => {
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
        key={`${node.id}-${index}`}
        fill="none"
        stroke="grey"
        markerStart='url(#arrow)'
        d={line(points)}
      />
    );
  });

  return (
    <Box id="div_template" >
      <Box id="tooltip" style={{position: "fixed", width: "200px",height: "200px"}}></Box>
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
      <Box sx={{
        display: 'flex',
        justifyContent: 'end',
        m: '1rem 8rem auto',
      }}>
        {isSearchVisible ? (
            <Collapse in={isSearchVisible} timeout={10000}
                      unmountOnExit
                      TransitionProps={{
                        timeout: { enter: 10000, exit: 100 }
                      }}>
              <SingleSearch
                isFullWidth={false}
                selectedValue={object}
                onChange={(e) => handleSelectChange(e)}
                startAdornment={false}
                options={terms}
                searchTerm={objectSearchTerm}
                setSearchTerm={setObjectSearchTerm}
                placeholder="Enter URL or term name"
                sx={{
                  width: '15rem'
                }}
              />
            </Collapse>
        ) : <Button
          startIcon={<AddOutlinedIcon />}
          type="string"
          color="secondary"
          onClick={handleButtonClick}
        >
          Add object
        </Button>}
      </Box>
      
    </Box>
  );
};

export default Graph;