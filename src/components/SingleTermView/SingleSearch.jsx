import React, { useRef } from "react";
import {
  TextField,
  Autocomplete,
  InputAdornment, Typography, Box,
} from "@mui/material";
import { vars } from "../../theme/variables";
import {SearchIcon} from "../../Icons";
import ListItem from "@mui/material/ListItem";

const { brand300, gray50, gray200, gray900, gray600 } = vars;

const SingleSearch = () => {
  const options = [
    { label: 'Oliver Hansen', handler: 'Oliver'},
    { label: 'April Tucker', handler: 'April'},
    { label: 'Van Henry', handler: 'Van'},
    { label: 'Omar Alexander', handler: 'Omar'}
  ];
  
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedValue, setSelectedValue] = React.useState(null);
  const autocompleteRef = useRef(null);
  
  const handleInputChange = (event, value) => {
    setSearchTerm(event.target.value);
  };
  
  return (
    <div ref={autocompleteRef}>
      <Autocomplete
        fullWidth
        disableCloseOnSelect
        disableClearable
        options={options}
        forcePopupIcon={false}
        onChange={(event, value) => {
          setSearchTerm('')
          setSelectedValue(value);
        }}
        inputValue={searchTerm ? searchTerm : selectedValue ? selectedValue?.label : ''}
        componentsProps={{
          paper: {
            sx: {
              borderRadius: '0.5rem',
              border: `1px solid ${gray200}`
            },
          },
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius:  '0.5rem',
          },
          '&.Mui-focused': {
            '& .MuiOutlinedInput-root': {
              border: `2px solid ${brand300}`,
              background: gray50,
              boxShadow: '0px 1px 2px 0px rgba(16, 24, 40, 0.05), 0px 0px 0px 4px rgba(50, 129, 115, 0.24)',
              borderRadius: '.5rem',
            },
            '& .MuiOutlinedInput-notchedOutline': {
              border: 0,
            },
          },
        }}
        autoHighlight={false}
        renderOption={(props, option) => (
          <ListItem {...props}>
            <Box
              p='.5rem'
              display='flex'
              alignItems='center'
              gap='.5rem'
              width={1}
            >
              <Typography variant='body1' fontWeight={500} color={gray900}>{option.label}</Typography>
              <Typography variant='body2' color={gray600}>@{option.handler}</Typography>
            </Box>
          </ListItem>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            placeholder="Search for children"
            onChange={handleInputChange}
            InputProps={{
              ...params.InputProps,
              startAdornment: <InputAdornment position='start'><SearchIcon /></InputAdornment>,
              endAdornment: <InputAdornment position='end'><SearchIcon /></InputAdornment>,
            }}
          />
        )}
      />
    </div>
  );
};

export default SingleSearch;
