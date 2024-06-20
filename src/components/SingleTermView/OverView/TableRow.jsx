import { Box, Divider, IconButton, Stack, Tooltip, Typography, TextField, Button } from "@mui/material";
import { useState } from "react";
import ModeEditOutlineOutlinedIcon from "@mui/icons-material/ModeEditOutlineOutlined";
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
const TableRow = ({ tableStyles, data, onDragStart, onDragEnter, onDragEnd, index, onInputChange, onDeleteClick, rowIndex, onRowIndexChange, onSaveEdits }) => {
  const { id, Subject, Predicates, Objects } = data;
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
      <Box sx={{ paddingLeft: '0 !important' }}>
        {rowIndex === index ? (
          <TextField
            value={Subject}
            name="Subject"
            onChange={(e) => onInputChange(e, index)}
            placeholder="Enter URL or term name"
            sx={tableStyles.input}
          />
        ) : (
          <Typography>
            {Subject}
          </Typography>
        )}
      </Box>
      <Box>
        <Typography>
          {Predicates}
        </Typography>
      </Box>
      <Box>
        {rowIndex === index ? (
          <TextField
            value={Objects}
            name="Objects"
            onChange={(e) => onInputChange(e, index)}
            placeholder="Enter URL or term name"
            sx={tableStyles.input}
          />
        ) : (
          <Typography>
            {Objects}
          </Typography>
        )}
      </Box>
      <Box display="flex" justifyContent="flex-end">
        {
          isHovered && rowIndex !== index && <Stack direction='row' spacing='.5rem'>
            <IconButton onClick={() => onRowIndexChange(index)}>
              <ModeEditOutlineOutlinedIcon fontSize='small' />
            </IconButton>
            <IconButton onClick={() => onDeleteClick(index)}>
              <DeleteOutlineOutlinedIcon fontSize='small' />
            </IconButton>
            <Divider orientation="vertical" flexItem />
            <Tooltip placement='right' title={"Help"}>
              <IconButton>
                <HelpOutlineOutlinedIcon fontSize='small' />
              </IconButton>
            </Tooltip>
          </Stack>
        }
        {
          rowIndex === index && (
            <Box justifyContent="flex-end">
              <Button variant="text" onClick={() => onSaveEdits(index)} sx={tableStyles.confirmButton}>Save edits</Button>
            </Box>
          )
        }
      </Box>
    </Box>);
};

export default TableRow;