import { Box, Button, Divider, IconButton, TextField, Autocomplete, InputAdornment, Typography, Chip } from "@mui/material";
import { vars } from "../../theme/variables";
import { useEffect, useState, useCallback } from 'react';
import * as mockApi from './../../api/endpoints/swaggerMockMissingEndpoints';
import { CloseIcon, ForwardIcon, SearchIcon, TermsIcon } from '../../Icons';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { termParser } from "../../parsers/termParser";
import { useNavigate } from "react-router-dom";
import { debounce } from 'lodash';
import { useQuery } from "../../helpers";

const { gray200, gray100, gray600, gray800, gray500 } = vars;

const styles = {
  keyBoardInfo: {
    borderRadius: '0.25rem', pointerEvents: 'none', background: gray100, color: gray600, fontSize: '0.875rem', lineHeight: '142.857%', p: '0.125rem 0.5rem'
  }
}

const useMockApi = () => mockApi;

const Search = () => {
  const [searchTerm, setSearchTerm] = useState( "");
  const [openList, setOpenList] = useState(false);
  const [selectedValue, setSelectedValue] = useState(null);
  const navigate = useNavigate();
  const query = useQuery();
  const storedSearchTerm = query.get('searchTerm');
  const { getMatchTerms } = useMockApi();
  
  const [terms, setTerms] = useState([]);
  
  const handleOpenList = () => {
    setOpenList(true);
  };
  
  const handleCloseList = () => {
    setOpenList(false);
  };
  
  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };
  
  const onSelectTerm = (event, newInputValue) => {
    setSearchTerm("");
    setSelectedValue(newInputValue?.label);
    handleCloseList();
    navigate(`/view?searchTerm=${newInputValue?.label}`);
  };
  
  const handleClickSearchTerm = () => {
    setSelectedValue(searchTerm);
    navigate(`/search?searchTerm=${searchTerm}`);
    handleCloseList();
  };
  
  const onInputFocus = (event) => {
    if (event.target.value) {
      fetchTerms(event.target.value)
    }
  }
  
  const handleKeyDown = useCallback(event => {
    if (event.ctrlKey && event.key === 'k') {
      setOpenList(true);
    }
    if (event.key === 'Escape') {
      handleCloseList();
    }
  }, []);
  
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
  
  const fetchTerms = useCallback(debounce(async (searchTerm) => {
    const data = await getMatchTerms(searchTerm);
    const parsedData = termParser(data, searchTerm);
    setTerms(parsedData?.results);
  }, 500), [getMatchTerms]);
  
  useEffect(() => {
    if (storedSearchTerm !== searchTerm) {
      fetchTerms(searchTerm);
    }
  }, [searchTerm, fetchTerms, storedSearchTerm]);
  
  
  useEffect(() => {
    if (storedSearchTerm !== searchTerm) {
      setSearchTerm(storedSearchTerm);
    }
  }, [storedSearchTerm]);
  
  
  return (
    <Autocomplete
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: openList ? '0.5rem 0.5rem 0 0' : '0.5rem'
        }
      }}
      options={terms}
      onChange={onSelectTerm}
      filterOptions={options => options}
      open={openList}
      onOpen={handleOpenList}
      onClose={handleCloseList}
      onFocus={onInputFocus}
      forcePopupIcon={false}
      renderOption={(props, option, state) => {
        const { selected } = state;
        return (
          <ListItem sx={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center',
            
            '&:hover': {
              '& .MuiChip-root': {
                display: 'none',
              }
            },
            
            '&:not(:hover)': {
              '& .MuiButton-root': {
                display: 'none'
              }
            },
          }} {...props}>
            <TermsIcon />
            <Typography variant='body1'>{option?.label}</Typography>
            <Typography variant='body2'>{option?.submittedBy}</Typography>
            {selected ? <Chip label="Fork" variant='outlined' color='success' /> : <Chip label="Curated" variant='outlined' />}
            <Button
              variant='text'
              id={option?.label}
              sx={{
                p: 0, height: 'auto', lineHeight: 1, background: 'transparent',
                '&:hover': {
                  backgroundColor: 'transparent'
                }
              }}>
              Go to <ForwardIcon />
            </Button>
          </ListItem>
        )
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          placeholder="Find something..."
          onChange={handleInputChange}
          InputProps={{
            ...params.InputProps,
            startAdornment: <InputAdornment position='start'><SearchIcon /></InputAdornment>,
            endAdornment: (
              <>
                <InputAdornment position='end'>
                  {openList ? (
                    <Box display='flex' alignItems='center' gap='0.75rem'>
                      <IconButton sx={{
                        p: 0, background: 'transparent',
                        '&:hover': {
                          background: 'transparent'
                        }
                      }} onClick={() => setOpenList(true)}>
                        <CloseIcon />
                      </IconButton>
                      <Box sx={styles.keyBoardInfo}>Esc</Box>
                    </Box>
                  ) : <Box sx={styles.keyBoardInfo}>Ctrl + K</Box>}
                </InputAdornment>
              </>
            )
          }}
        />
      )}
      ListboxComponent={(props) => {
        return (
          <>
            {searchTerm && (<><Box p="0.875rem 0.5rem 0.5rem 0.5rem">
              <List sx={{
                '& .MuiTypography-body1': {
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  lineHeight: '142.857%',
                  color: gray800
                },
                
                '& .MuiTypography-body2': {
                  fontSize: '0.875rem',
                  flex: 1,
                  fontWeight: 400,
                  lineHeight: '142.857%',
                  color: gray500
                },
              }} {...props}>
                <ListItem className='MuiAutocomplete-option' sx={{
                  '&:hover': {
                    backgroundColor: 'transparent !important',
                    cursor: 'default'
                  }
                }}>
                  <Typography variant='body1'>I’m looking for...</Typography>
                </ListItem>
                <ListItem className='MuiAutocomplete-option'
                  onClick={handleClickSearchTerm}
                  sx={{
                  display: 'flex',
                  gap: '0.5rem',
                  alignItems: 'center',
                }}>
                  <SearchIcon />
                  <Typography sx={{flex: 1}} variant='body1'>{searchTerm}</Typography>
                  <Button
                    variant='text'
                    sx={{
                      p: 0, height: 'auto', lineHeight: 1, background: 'transparent',
                      '&:hover': {
                        backgroundColor: 'transparent'
                      }
                    }}
                  >Search all</Button>
                </ListItem>
              </List>
            </Box>
              <Divider sx={{borderColor: gray200}} /></> ) }
            
            <Box p="0.875rem 0.5rem 0.5rem 0.5rem">
              <List sx={{
                '& .MuiTypography-body1': {
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  lineHeight: '142.857%',
                  color: gray800
                },
                
                '& .MuiTypography-body2': {
                  fontSize: '0.875rem',
                  flex: 1,
                  fontWeight: 400,
                  lineHeight: '142.857%',
                  color: gray500
                },
              }} {...props}>
                <ListItem className='MuiAutocomplete-option' sx={{
                  '&:hover': {
                    backgroundColor: 'transparent !important',
                    cursor: 'default'
                  }
                }}>
                  <Typography variant='body1'>Terms</Typography>
                </ListItem>
                {props?.children}
              </List>
            </Box>
          </>
        )
      }}
      inputValue={searchTerm ? searchTerm : selectedValue}
    />
  )
}

export default Search;
