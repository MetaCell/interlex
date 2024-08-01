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
import { vars } from "../../theme/variables";
import { useEffect, useState, useCallback } from 'react';
import {getMatchTerms} from "../../api/endpoints";
import { CloseIcon, ForwardIcon, SearchIcon, TermsIcon } from '../../Icons';
import { useNavigate } from "react-router-dom";
import { debounce } from 'lodash';
import { useQuery } from "../../helpers";

const { gray200, gray100, gray600, gray800, gray500 } = vars;

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
  const [terms, setTerms] = useState([]);
  const navigate = useNavigate();
  const query = useQuery();
  const storedSearchTerm = query.get('searchTerm');

  const handleOpenList = () => setOpenList(true);
  const handleCloseList = () => setOpenList(false);
  const handleInputChange = (event) => setSearchTerm(event.target.value);

  const handleSelectTerm = (event, newInputValue) => {
    setSearchTerm("");
    setSelectedValue(newInputValue?.label);
    handleCloseList();
    navigate(`/view?searchTerm=${newInputValue?.label}`);
  };

  const handleSearchTermClick = () => {
    setSelectedValue(searchTerm);
    navigate(`/search?searchTerm=${searchTerm}`);
    handleCloseList();
  };

  const handleInputFocus = (event) => {
    if (event.target.value) {
      fetchTerms(event.target.value);
    }
  };

  const handleKeyDown = useCallback((event) => {
    if (event.ctrlKey && event.key === 'k') {
      setOpenList(true);
    }
    if (event.key === 'Escape') {
      handleCloseList();
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const fetchTerms = useCallback(debounce(async (searchTerm) => {
    const data = await getMatchTerms(searchTerm);
    setTerms(data?.results);
  }, 500), []);

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

  const ListboxComponent = forwardRef(function ListboxComponent(props, ref) {
    return (
      <>
        {searchTerm && (
          <>
            <Box sx={styles.listbox}>
              <List sx={styles.listboxTypography} {...props} ref={ref}>
                <ListItem sx={styles.listboxOption}>
                  <Typography variant="body1">I’m looking for...</Typography>
                </ListItem>
                <ListItem onClick={handleSearchTermClick} sx={styles.listItem}>
                  <SearchIcon />
                  <Typography sx={{ flex: 1 }} variant="body1">
                    {searchTerm}
                  </Typography>
                  <Button variant="text" sx={styles.searchButton}>
                    Search all
                  </Button>
                </ListItem>
              </List>
            </Box>
            <Divider sx={{ borderColor: gray200 }} />
          </>
        )}
        <Box sx={styles.listbox}>
          <List sx={styles.listboxTypography} {...props} ref={ref}>
            <ListItem sx={styles.listboxOption}>
              <Typography variant="body1">Terms</Typography>
            </ListItem>
            {props?.children}
          </List>
        </Box>
      </>
    );
  });

  return (
    <Autocomplete
      sx={{ '& .MuiOutlinedInput-root': { borderRadius: openList ? '0.5rem 0.5rem 0 0' : '0.5rem' } }}
      options={terms}
      onChange={handleSelectTerm}
      filterOptions={(options) => options}
      open={openList}
      onOpen={handleOpenList}
      onClose={handleCloseList}
      onFocus={handleInputFocus}
      forcePopupIcon={false}
      renderOption={(props, option, { selected }) => {
        const { key, ...otherProps } = props;
        return (
          <ListItem key={key} {...otherProps} sx={styles.listItem}>
            <TermsIcon />
            <Typography variant="body1">{option?.label}</Typography>
            <Typography variant="body2">{option?.submittedBy}</Typography>
            <Chip label={selected ? "Fork" : "Curated"} variant="outlined" color={selected ? 'success' : 'default'} />
            <Button variant="text" id={option?.label} sx={styles.searchButton}>
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
      ListboxComponent={ListboxComponent}
    />
  );
};

export default Search;