import { Box, Button, Divider, IconButton, TextField, Autocomplete, InputAdornment, Typography, Chip, tabClasses } from "@mui/material";
import { vars } from "../../theme/variables";
import { useEffect, useState, useCallback } from 'react';
import { searchAll } from "../../api/endpoints";
import { CloseIcon, ForwardIcon, SearchIcon, TermsIcon } from '../../Icons';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import BasicTabs from "../common/CustomTabs";
import { useNavigate } from "react-router-dom";
import { debounce } from 'lodash';
import { useQuery } from "../../helpers";

const { gray200, gray100, gray600, gray800, gray500, gray700 } = vars;

const styles = {
  keyBoardInfo: {
    borderRadius: '0.25rem',
    pointerEvents: 'none',
    background: gray100,
    color: gray600,
    fontSize: '0.875rem',
    lineHeight: '142.857%',
    p: '0.125rem 0.5rem',
  },
  listItem: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
    '&:hover .MuiChip-root': {
      display: 'none',
    },
    '&:not(:hover) .MuiButton-root': {
      display: 'none',
    },
  },
  searchButton: {
    p: 0,
    height: 'auto',
    lineHeight: 1,
    background: 'transparent',
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
  listbox: {
    p: '0.875rem 0.5rem 0.5rem 0.5rem',
  },
  listboxTypography: {
    '& .MuiTypography-body1': {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: '142.857%',
      color: gray800,
    },
    '& .MuiTypography-body2': {
      fontSize: '0.875rem',
      flex: 1,
      fontWeight: 400,
      lineHeight: '142.857%',
      color: gray500,
    },
  },
  listboxOption: {
    '&:hover': {
      backgroundColor: 'transparent !important',
      cursor: 'default',
    },
  },
};

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [openList, setOpenList] = useState(false);
  const [selectedValue, setSelectedValue] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();
  const query = useQuery();
  const storedSearchTerm = query.get('searchTerm');

  const [terms, setTerms] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [ontologies, setOntologies] = useState([]);

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
      fetchTerms(event.target.value);
    }
  }

  const handleChangeTabs = (event, newValue) => setTabValue(newValue);

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
    const data = await searchAll(searchTerm);
    const dataTerms = data?.results.filter(result => result.type === "TERM")
    const dataOrganizations = data?.results.filter(result => result.type === "ORGANIZATION")
    const dataOntologies = data?.results.filter(result => result.type === "ONTOLOGY")
    setTerms(dataTerms);
    setOrganizations(dataOrganizations)
    setOntologies(dataOntologies)
  }, 500), [searchAll]);

  useEffect(() => {
    if (searchTerm && storedSearchTerm !== searchTerm) {
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
      options={tabValue === 0 ? terms : tabValue === 1 ? organizations : ontologies}
      onChange={onSelectTerm}
      filterOptions={options => options}
      open={openList}
      onOpen={handleOpenList}
      onClose={handleCloseList}
      onFocus={handleInputFocus}
      forcePopupIcon={false}
      renderOption={(props, option, state) => {
        const { selected } = state;

        return (
          <ListItem sx={{
            display: "flex",
            gap: "0.5rem",
            alignItems: "center",
            "&:hover": {
              "& .MuiChip-root": {
                display: "none",
              },
            },
            "&:not(:hover)": {
              "& .MuiButton-root": {
                display: "none",
              },
            },
          }} {...props}>
            {tabValue === 0 ? <TermsIcon /> : <FolderOutlinedIcon />}
            <Typography variant="body1">{option?.label || option?.name}</Typography>
            <Typography variant="body2">{option?.submittedBy}</Typography>
            <Chip
              label={selected ? "Fork" : "Curated"}
              variant="outlined"
              color={selected ? "success" : "default"}
            />
            <Button
              variant="text"
              id={option?.label}
              sx={{
                p: 0,
                height: "auto",
                lineHeight: 1,
                background: "transparent",
                "&:hover": {
                  backgroundColor: "transparent",
                },
              }}
            >Go to <ForwardIcon /></Button>
          </ListItem>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          placeholder="Find something..."
          value={searchTerm || selectedValue}
          onChange={handleInputChange}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                {openList ? (
                  <Box display="flex" alignItems="center" gap="0.75rem">
                    <IconButton
                      sx={styles.searchButton}
                      onClick={() => setOpenList(true)}
                    >
                      <CloseIcon />
                    </IconButton>
                    <Box sx={styles.keyBoardInfo}>Esc</Box>
                  </Box>
                ) : (
                  <Box sx={styles.keyBoardInfo}>Ctrl + K</Box>
                )}
              </InputAdornment>
            ),
          }}
        />
      )}
      ListboxComponent={(props) => {
        return (
          <>
            {searchTerm && (<><Box p="0.5rem">
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
              }} {...props} onMouseDown={(event) => event.preventDefault()}>
                <ListItem
                  onClick={handleClickSearchTerm}
                  sx={{
                    display: 'flex',
                    gap: '0.5rem',
                    alignItems: 'center',
                    padding: "0.688rem 0.5rem"
                  }}>
                  <SearchIcon />
                  <Typography sx={{ flex: 1 }} variant='body1'>{searchTerm}</Typography>
                  <Button
                    variant='text'
                    sx={{
                      color: gray700,
                      p: 0, height: 'auto', lineHeight: 1, background: 'transparent',
                      '&:hover': {
                        backgroundColor: 'transparent'
                      }
                    }}
                  >Browse all</Button>
                </ListItem>
              </List>
            </Box>
              <Divider sx={{ borderColor: gray200 }} /></>)}
            <Box>
              <ListItem sx={{
                padding: "0.75rem 1rem",
                "& .MuiTypography-body1": {
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: gray600,
                  lineHeight: "1.25rem"
                },
                '&:hover': {
                  backgroundColor: 'transparent !important',
                  cursor: 'default'
                }
              }}>
                <Typography variant='body1'>I’m looking for specific type</Typography>
              </ListItem>
              <BasicTabs
                tabValue={tabValue}
                handleChange={handleChangeTabs}
                tabs={["Terms", "Organizations", "Ontologies"]}
                onMouseDown={(event) => event.preventDefault()}
                parentBoxStyles={{
                  margin: "0 0.875rem"
                }}
                tabStyles={{
                  '& .MuiTab-root': {
                    fontSize: "0.875rem",
                    lineHeight: "1.25rem",
                    minHeight: "2rem",
                    padding: "0 0.25rem 0.75rem 0.25rem",
                    minWidth: "3.188rem"
                  }
                }}
              />
              <List sx={{
                "&.MuiAutocomplete-listbox": {
                  padding: "0.813rem 0.5rem",
                  "& .MuiAutocomplete-option": {
                    padding: "0.5rem"
                  }
                },
                "& .MuiTypography-body1": {
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  lineHeight: '142.857%',
                  color: gray800
                },

                "& .MuiTypography-body2": {
                  fontSize: '0.875rem',
                  flex: 1,
                  fontWeight: 400,
                  lineHeight: '142.857%',
                  color: gray500
                }
              }} {...props}>
                {props?.children}
              </List>
            </Box>
          </>
        )
      }}
      inputValue={searchTerm ? searchTerm : selectedValue}
    />
  );
};

export default Search;