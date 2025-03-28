import { useState } from "react";
import PropTypes from "prop-types";
import { Box, IconButton, Tooltip, Typography, Link } from "@mui/material";
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';

function isValidURL(value) {
  return /^https?:\/\/[\w.-]+(\.[a-z]{2,})(:\d+)?(\/.*)?$/i.test(value);
}

const TableRow = ({ tableStyles, data, onDragStart, onDragEnter, onDragEnd, index, columnWidth }) => {
  const { id, subject, predicate, object } = data;
  const [isHovered, setIsHovered] = useState(false);
  console.log(isValidURL("owl:Class"))
  return (
    <Box sx={tableStyles.root}
      draggable={true}
      onDragStart={e => onDragStart(id, index, e)}
      onDragEnter={e => onDragEnter(id, index, e)}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Box sx={{ paddingLeft: "0 !important", width: columnWidth }}>
        <Tooltip title={subject}>
          {isValidURL(subject) ? (
            <Link href={subject} target="_blank" rel="noopener noreferrer">
              {subject}
            </Link>
          ) : (
            <Typography>{subject}</Typography>
          )}
        </Tooltip>
      </Box>
      <Box sx={{ width: columnWidth }}>
        <Tooltip title={predicate}>
          <Typography>
            {predicate}
          </Typography>
        </Tooltip>
      </Box>
      <Box sx={{ width: columnWidth }}>
        <Tooltip title={object}>
          {isValidURL(object) ? (
            <Link href={object} target="_blank" rel="noopener noreferrer">
              {object}
            </Link>
          ) : (
            <Typography>{object}</Typography>
          )}
        </Tooltip>
      </Box>
      <Box display="flex" sx={{ width: "1rem", height: "1rem" }}>
        {
          isHovered && (
            <Tooltip placement='right' title={"Help"}>
              <IconButton>
                <HelpOutlineOutlinedIcon fontSize='small' />
              </IconButton>
            </Tooltip>
          )
        }
      </Box>
    </Box>);
};

TableRow.propTypes = {
  tableStyles: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
  onDragStart: PropTypes.func.isRequired,
  onDragEnter: PropTypes.func.isRequired,
  onDragEnd: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  columnWidth: PropTypes.number.isRequired
};

export default TableRow;
