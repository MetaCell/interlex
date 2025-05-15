import {
  Box,
  Button,
  Divider,
  IconButton,
  TextField,
  Autocomplete,
  InputAdornment,
  Typography,
  Chip,
  List,
  ListItem,
} from "@mui/material";
import { debounce } from 'lodash';
import PropTypes from 'prop-types';
import BasicTabs from "../common/CustomTabs";
import { useNavigate } from "react-router-dom";
import { SEARCH_TYPES } from "../../constants/types";
import { searchAll, elasticSearch } from "../../api/endpoints";
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import { useEffect, useState, useCallback, forwardRef, useContext } from 'react';
import { CloseIcon, ForwardIcon, SearchIcon, TermsIcon } from '../../Icons';
import CorporateFareOutlinedIcon from '@mui/icons-material/CorporateFareOutlined';
import { GlobalDataContext } from "../../contexts/DataContext";

import { vars } from "../../theme/variables";
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
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();
  const [terms, setTerms] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [ontologies, setOntologies] = useState([]);
  const { storedSearchTerm, updateStoredSearchTerm } = useContext(GlobalDataContext);

  const handleOpenList = () => setOpenList(true);
  const handleCloseList = () => setOpenList(false);
  const handleInputChange = (event) => setSearchTerm(event.target.value);

  const handleSelectTerm = (event, newInputValue) => {
    if (!newInputValue) return;
    
    handleCloseList();
    updateStoredSearchTerm(newInputValue?.label)
    navigate(`/view?searchTerm=${newInputValue?.ilx}`);
  };

  const handleSearchTermClick = () => {
    navigate(`/search?searchTerm=${searchTerm}`);
    handleCloseList();
  };

  const handleInputFocus = (event) => {
    if (event.target.value) {
      fetchTerms(event.target.value);
    }
  }

  const handleEnterKey = (event) => {
    if (event.key === 'Enter' && searchTerm.trim()) {
      event.preventDefault();
      handleSearchTermClick();
    }
  };

  const handleChangeTabs = (event, newValue) => setTabValue(newValue);

  const resetSearch = () => {
    setOpenList(false);
    setSearchTerm("");
    setTerms([])
    setOntologies([])
    setOrganizations([])
  };

  const escapeSearch = useCallback(() => {
    setOpenList(false);
    setSearchTerm("");
    setTabValue(0);
    setTerms([])
    setOntologies([])
    setOrganizations([])
  },[]);

  const handleKeyDown = useCallback(event => {
    if (event.ctrlKey && event.key === 'k') {
      setOpenList(true);
    }
    if (event.key === 'Escape') {
      escapeSearch();
    }
  }, [escapeSearch]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchTerms = useCallback(debounce(async (searchTerm) => {
    const data = await elasticSearch(searchTerm, 20, 0);
    const dataTerms = data?.results.results?.filter(result => result.type === SEARCH_TYPES.TERM);
    const dataOrganizations = data?.results.results?.filter(result => result.type === SEARCH_TYPES.ORGANIZATION);
    const dataOntologies = data?.results.results?.filter(result => result.type === SEARCH_TYPES.ONTOLOGY);
    setTerms(dataTerms);
    setOrganizations(dataOrganizations);
    setOntologies(dataOntologies);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storedSearchTerm]);

  // eslint-disable-next-line no-unused-vars
  const ListboxComponent = forwardRef(function ListboxComponent(props, ref) {
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
              onClick={handleSearchTermClick}
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
    );
  });

  const displayOptions = (tabValue === 0 ? terms : tabValue === 1 ? organizations : ontologies);
  const options = displayOptions?.length ? displayOptions : [{ hidden: true }];

  return (
    <Autocomplete
      sx={{ '& .MuiOutlinedInput-root': { borderRadius: openList ? '0.5rem 0.5rem 0 0' : '0.5rem' } }}
      options={options}
      inputValue={searchTerm || ""}
      onChange={handleSelectTerm}
      filterOptions={(options) => options}
      open={openList}
      onOpen={handleOpenList}
      onClose={handleCloseList}
      onFocus={handleInputFocus}
      forcePopupIcon={false}
      getOptionLabel={(option) => option?.hidden ? '' : (option.label || option.name || '')}
      renderOption={(props, option, { selected }) => {
        if (option?.hidden) return null;
      
        const { key, ...otherProps } = props;
        return (
          <ListItem
            key={key}
            sx={styles.listItem}
            {...otherProps}
          >
            {tabValue === 0 ? <TermsIcon /> : tabValue === 1 ? <CorporateFareOutlinedIcon sx={{ color: gray600 }} /> : <FolderOutlinedIcon sx={{ color: gray600 }} />}
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
              sx={styles.searchButton}
            >
              Go to <ForwardIcon />
            </Button>
          </ListItem>
        );
      }}      
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          placeholder="Find something..."
          onChange={handleInputChange}
          onKeyDown={handleEnterKey}
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
                      onClick={resetSearch}
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
      ListboxComponent={ListboxComponent}
    />
  );
};

Search.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  onUndoDelete: PropTypes.func,
  data: PropTypes.object,
  children: PropTypes.node,
  key: PropTypes.string
};

export default Search;
