import React from "react";
import {Box, Button, ButtonGroup, FormControl, MenuItem, Select, Typography} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import {vars} from "../../../theme/variables";
import ExpandIcon from '@mui/icons-material/Expand';
import RemoveIcon from '@mui/icons-material/Remove';

const { gray600, gray800, gray500, gray700, gray300 } = vars;

const Predicates = () => {
  const [type, setType] = React.useState('Children');
  
  return <Box display='flex' alignItems='center' justifyContent='space-between'>
    <Typography color={gray800} fontWeight={500}>Predicates</Typography>
    <Box display='flex' alignItems='center' gap='.75rem'>
      <FormControl sx={{ minWidth: 75 }}>
        <Select
          value={type}
          onChange={(v) => setType(v)}
          displayEmpty
          IconComponent={KeyboardArrowDownIcon}
          sx={{
            color: gray700,
            borderRadius: '0.5rem !important',
            fontSize: '0.875rem',
            fontWeight: 600,
            '& .MuiOutlinedInput-input': {
              padding: '0.625rem 0.875rem'
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: gray300
            },
            '& .MuiSvgIcon-root': {
              color: gray700,
              fontSize: '1.25rem',
              right: '0.875rem !important'
            }
          }}
        >
          <MenuItem value={'Children'}>Show Sections</MenuItem>
          <MenuItem value={'Superclasses'}>Superclasses</MenuItem>
        </Select>
      </FormControl>
      <ButtonGroup variant="outlined" aria-label="Basic button group">
        <Button>
         <ExpandIcon />
        </Button>
        <Button>
          <RemoveIcon />
        </Button>
      </ButtonGroup>
    </Box>
  
  </Box>
}

export default Predicates