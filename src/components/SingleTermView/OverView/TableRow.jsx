import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { useState } from "react";
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';


const TableRow = ({ tableStyles, data, onDragStart, onDragEnter, onDragEnd, index }) => {
  const { id, subject, predicate, object } = data;
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Box sx={tableStyles.root}
      draggable={true}
      onDragStart={e => onDragStart(id, index, e)}
      onDragEnter={e => onDragEnter(id, index, e)}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Box sx={{ paddingLeft: "0 !important" }}>
        <Typography>
          {subject}
        </Typography>
      </Box>
      <Box>
        <Typography>
          {predicate}
        </Typography>
      </Box>
      <Box display="flex" justifyContent="flex-end" sx={{ paddingRight: "0 !important" }}>
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

export default TableRow;