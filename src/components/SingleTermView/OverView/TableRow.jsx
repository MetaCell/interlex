import {Box, Divider, IconButton, Stack, Tooltip, Typography} from "@mui/material";
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import {tableStyles} from './CustomizedTable';
import {useState} from "react";
import ModeEditOutlineOutlinedIcon from "@mui/icons-material/ModeEditOutlineOutlined";
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
const TableRow = ({data, onDragStart, onDragEnter, onDragEnd, index}) => {
  const {id, Subject, Predicates, Objects} = data;
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
    <Box sx={{paddingLeft: '0 !important'}}>
      <Typography>
        {Subject}
      </Typography>
    </Box>
    <Box>
      <Typography>
        {Predicates}
      </Typography>
    </Box>
    <Box>
      <Typography>
        {Objects}
      </Typography>
    </Box>
    <Box>
      {
        isHovered &&  <Stack direction='row' spacing='.5rem'>
            <IconButton>
              <ModeEditOutlineOutlinedIcon fontSize='small' />
            </IconButton>
            <IconButton>
              <DeleteOutlineOutlinedIcon fontSize='small' />
            </IconButton>
            <IconButton sx={{
              '&:hover': {
                cursor: 'grab',
                backgroundColor: 'transparent',
              }
            }}>
              <DragIndicatorIcon fontSize='small' />
            </IconButton>
          <Divider orientation="vertical" flexItem />
          <Tooltip placement='right' title={"Help"}>
            <IconButton>
              <HelpOutlineOutlinedIcon fontSize='small' />
            </IconButton>
          </Tooltip>
        </Stack>
      }
    </Box>
  </Box>);
};

export default TableRow;