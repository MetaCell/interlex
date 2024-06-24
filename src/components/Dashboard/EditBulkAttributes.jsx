import React from 'react';
import { Box, Typography, IconButton, Tooltip, FormGroup, FormLabel, FormControl, Button } from '@mui/material';
import Checkbox from '../common/CustomCheckbox';
import { useContext } from "react";
import { GlobalDataContext } from "./../../contexts/DataContext";
import { CollapseIcon, HelpOutlinedIcon, ExpandIcon } from '../../Icons';
import { vars } from '../../theme/variables';

const { gray200, gray600, gray800, brand700, brand800 } = vars;

const EditBulkAttributes = () => {
  const [open, setOpen] = React.useState(false);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        borderRight: `1px solid ${gray200}`,
        transition: 'all 0.5s ease',
        p: 3,
        pl: open ? 3 : 4,
        width: open ? '18.75rem' : '5.75rem',
        overflowY: 'auto',
        '::-webkit-scrollbar': {
          display: 'none', // Hide scrollbar in Chrome, Safari
        },
        scrollbarWidth: 'none', // Hide scrollbar in Firefox
      }}
    >
      {open ? (
        <Box width={1} display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: gray800 }}>Filters</Typography>
          <IconButton onClick={() => setOpen(!open)} sx={{ border: `1px solid ${gray200}` }}>
            <CollapseIcon />
          </IconButton>
        </Box>
      ) : (
        <Box>
          <IconButton onClick={() => setOpen(!open)} sx={{ border: `1px solid ${gray200}` }}>
            <ExpandIcon />
          </IconButton>
        </Box>
      )}
      {open && (
        <Box width={1} display="flex" flexDirection="column" alignItems="center" gap={3}>
         lkm
        </Box>
      )}
    </Box>
  );
}

export default EditBulkAttributes