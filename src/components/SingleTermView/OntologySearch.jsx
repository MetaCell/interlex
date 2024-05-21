import React, { useEffect, useRef } from "react";
import {
  Box,
  Button,
  Divider,
  TextField,
  Autocomplete,
  InputAdornment,
  Chip,
  FormControlLabel,
} from "@mui/material";
import { vars } from "../../theme/variables";
import ListItem from '@mui/material/ListItem';
import FolderSharedOutlinedIcon from '@mui/icons-material/FolderSharedOutlined';
import CustomizedRadio from "./CustomizedRadio";

const { brand600, gray50 } = vars;

const OntologySearch = () => {
  const options = [
    { label: 'Nervous system1', badge: 'My Organization 1', selected: false},
    { label: 'Nervous system2', badge: 'ODC-TBI', selected: false},
    { label: 'Nervous system3', badge: 'Dk-net', selected: false},
    { label: 'Nervous system4', badge: 'My Organization 2', selected: false}
  ];
  
  const [searchTerm, setSearchTerm] = React.useState('');
  const [openList, setOpenList] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState(null);
  const autocompleteRef = useRef(null);
  const popperRef = useRef(null);
  const handleOpenList = () => {
    setOpenList(true);
  };
  
  const handleInputChange = (event, value) => {
    setSearchTerm(event.target.value);
  };
  
  const onSetActive = (event) => {
    event.stopPropagation();
    event.preventDefault();
    setOpenList(false);
    setSelectedValue({...selectedValue, selected: true})
  };
  
  const handleClickOutside = (event) => {
    if (
      autocompleteRef.current &&
      !autocompleteRef.current.contains(event.target) &&
      popperRef.current &&
      !popperRef.current.contains(event.target)
    ) {
      setOpenList(false);
    }
  };
  
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={autocompleteRef}>
      <Autocomplete
        disableCloseOnSelect
        disableClearable
        options={options}
        open={openList}
        onOpen={handleOpenList}
        forcePopupIcon={false}
        onChange={(event, value) => {
          setSearchTerm('')
          setSelectedValue(value);
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            minWidth: selectedValue ? '21.75rem' : '11.75rem',
            width: 'fit-content',
            borderRadius: openList ? '0.5rem 0.5rem 0 0' : '0.5rem',
          },
          '&.Mui-focused': {
            transition: 'width 0.100s ease-in-out',
            '& .MuiOutlinedInput-root': {
              minWidth: '21.75rem',
              border: `2px solid ${brand600}`,
              background: gray50,
              boxShadow: '0px 1px 2px 0px rgba(16, 24, 40, 0.05)',
              borderRadius: '.5rem',
            },
            '& .MuiOutlinedInput-notchedOutline': {
              border: 0,
            },
          },
        }}
        autoHighlight={false}
        componentsProps={{
          popper: {
            sx: {
              width: '21.75rem !important',
            },
            ref: popperRef
          },
          paper: {
            sx: {
              borderRadius: '0.5rem',
              '& .MuiAutocomplete-option': {
                padding: '.06rem .38rem',
                height: 'initial',
                '& .MuiFormControlLabel-root': {
                  margin: 0,
                  '& .MuiTypography-root': {
                    fontSize: '0.875rem',
                  },
                  '& .MuiButtonBase-root': {
                    padding: 0,
                    marginRight: '.5rem',
                  },
                },
                '&:hover': {
                  backgroundColor: gray50,
                },
                '&[aria-selected="true"]': {
                  backgroundColor: 'transparent !important',
                },
              },
            },
          },
        }}
        inputValue={searchTerm ? searchTerm : selectedValue?.selected ? selectedValue?.label : ''}
        renderOption={(props, option) => (
          <ListItem {...props}>
            <Box
              p='.5rem'
              display='flex'
              justifyContent='space-between'
              alignItems='center'
              gap='.5'
              width={1}
            >
              <FormControlLabel
                control={
                  <CustomizedRadio
                    checked={selectedValue?.label === option.label}
                  />
                }
                label={option.label}
              />
              <Chip label={option.badge} variant='outlined' />
            </Box>
          </ListItem>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            placeholder="Search for ontology"
            onChange={handleInputChange}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position='start'>
                  <FolderSharedOutlinedIcon />
                </InputAdornment>
              ),
              endAdornment: selectedValue?.selected && (
                <InputAdornment position='end'>
                  <Chip
                    label={selectedValue.badge}
                    variant='outlined'
                    size='small'
                    sx={{ marginLeft: '0.5rem' }}
                  />
                </InputAdornment>
              ),
            }}
          />
        )}
        PaperComponent={({ children }) => (
          <Box
            ref={popperRef}
            sx={{
              borderRadius: '0.5rem',
              border: '1px solid #DADDDC',
              boxShadow:
                '0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03)',
            }}
          >
            {children}
            <Divider sx={{
              marginTop: '.31rem'
            }} />
            <Box p='.75rem 1rem'>
              <Button
                variant="contained"
                size="small"
                fullWidth
                onClick={onSetActive}
              >
                Set as active ontology
              </Button>
            </Box>
          </Box>
        )}
      />
    </div>
  );
};

export default OntologySearch;
