import { Box, Button, Divider, IconButton, TextField, Autocomplete, InputAdornment, Typography, Chip } from "@mui/material";
import { vars } from "../../theme/variables";
import { useEffect, useState } from 'react';
import * as mockApi from './../../api/endpoints/swaggerMockMissingEndpoints';
import { CloseIcon, ForwardIcon, SearchIcon, TermsIcon } from '../../Icons';
import React from "react";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import {useNavigate} from "react-router-dom";

const { gray200, gray100, gray600, gray800, gray500 } = vars;

const styles = {
    keyBoardInfo: {
        borderRadius: '0.25rem', pointerEvents: 'none', background: gray100, color: gray600, fontSize: '0.875rem', lineHeight: '142.857%', p: '0.125rem 0.5rem'
    }
}

const useMockApi = () => mockApi;
const Search = () => {
    const options = ['Nervous', 'Central Nervous System', 'Nervous System', 'ELectric Nervous Sytem'];
    const [searchTerm, setSearchTerm] = React.useState('');
    const [openList, setOpenList] = React.useState(false);
    const navigate = useNavigate();

    const {  getMatchTerms } = useMockApi();

    const [terms, setTerms] = useState(undefined);

    useEffect(() => {
        setTimeout(() => {
            getMatchTerms("ilx_0101431").then(setTerms);
        }, 1000);
    }, []);
    
    const handleOpenList = () => {
      setOpenList(true);
    };
  
    const handleCloseList = () => {
      setOpenList(false);
    };
  
    const handleInputChange = (event, newInputValue) => {
      setSearchTerm(newInputValue);
      navigate(`/search/${newInputValue}`)
    };
  
    const toggleList = () => {
      setOpenList(!openList);
    };

    React.useEffect(() => {
      const handleKeyDown = (event) => {
        if (event.ctrlKey && event.key === 'k') {
          toggleList();
        }
        if (event.key === 'Escape') {
          handleCloseList();
        }
      };
  
      document.addEventListener('keydown', handleKeyDown);
  
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }, []);

    return (
      <Autocomplete
          sx={{ 
              '& .MuiOutlinedInput-root': {
                  borderRadius: openList ? '0.5rem 0.5rem 0 0' : '0.5rem'
              }
            }}
          options={terms ? terms?.map( term => term.name ) : options}
          open={openList}
          onOpen={handleOpenList}
          onClose={handleCloseList}
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
                    <Typography variant='body1'>{option}</Typography>
                    <Typography variant='body2'>Olivia Rhye</Typography>
                    {selected ? <Chip label="Fork" variant='outlined' className="green-glow-chip" /> : <Chip label="Curated" variant='outlined' />}
                      <Button
                          variant='text'
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
                                      }} onClick={toggleList}>
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
          onInputChange={handleInputChange}
          ListboxComponent={(props) => {
              return (
                  <>
                      { searchTerm && ( <><Box p="0.875rem 0.5rem 0.5rem 0.5rem">
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
                              <ListItem className='MuiAutocomplete-option' sx={{
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
          />
    )
}

export default Search