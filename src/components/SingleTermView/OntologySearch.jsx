import { useEffect, useRef, useCallback, useMemo, useState, useContext } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  TextField,
  Autocomplete,
  InputAdornment,
  FormControlLabel,
  CircularProgress,
} from "@mui/material";
import PropTypes from "prop-types";
import ListItem from '@mui/material/ListItem';
import CustomizedRadio from "../common/CustomizedRadio";
import FolderSharedOutlinedIcon from '@mui/icons-material/FolderSharedOutlined';
import { vars } from "../../theme/variables";
import { getOrganizationsOntologies } from "../../api/endpoints/apiService";
import { GlobalDataContext } from "../../contexts/DataContext";

const { brand600, gray50, gray300, gray400, white, gray700, gray200, paperShadow } = vars;



const styles = {
  autocomplete: (fullWidth, selectedValue, openList) => ({
    width: fullWidth ? '100%' : 'auto',
    '& .MuiOutlinedInput-root': {
      minWidth: fullWidth ? '100%' : (selectedValue ? '21.75rem' : '11.75rem'),
      width: fullWidth ? '100%' : 'fit-content',
      borderRadius: openList ? '0.5rem 0.5rem 0 0' : '0.5rem',
      background: white,
      "-webkit-text-fill-color": `${gray700} !important`,
      "& .MuiSvgIcon-root": {
        fill: gray700
      },
    },
    '&.Mui-focused': {
      transition: 'width 0.100s ease-in-out',
      '& .MuiOutlinedInput-root': {
        minWidth: fullWidth ? '100%' : '21.75rem',
        border: `2px solid ${brand600}`,
        background: gray50,
        boxShadow: '0px 1px 2px 0px rgba(16, 24, 40, 0.05)',
        borderRadius: '.5rem'
      },
      '& .MuiOutlinedInput-notchedOutline': {
        border: 0,
      },
    }
  }),
  paper: {
    borderRadius: '0.5rem',
    '& .MuiAutocomplete-listbox': {
      maxHeight: '200px',
      overflow: 'auto',
      padding: 0
    },
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
  popperBox: {
    borderRadius: '0.5rem',
    border: `1px solid ${gray200}`,
    boxShadow: paperShadow
  }
};

const OntologySearch = ({ placeholder, fullWidth = false, disabled, extra, userGroupname, onOntologySelect, disableGlobalUpdate = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openList, setOpenList] = useState(false);
  const [selectedValue, setSelectedValue] = useState(null);
  const [ontologies, setOntologies] = useState([]);
  const [loading, setLoading] = useState(false);
  const autocompleteRef = useRef(null);
  const popperRef = useRef(null);
  
  const { activeOntology, setOntologyData, ontologiesRefreshKey } = useContext(GlobalDataContext);

  // Initialize selectedValue from context immediately if available
  useEffect(() => {
    if (activeOntology && !selectedValue) {
      console.log('Pre-initializing selectedValue from context before ontologies load:', activeOntology);
      setSelectedValue({ ...activeOntology, selected: true });
    }
  }, [activeOntology, selectedValue]);

  // Fetch ontologies when userGroupname changes
  useEffect(() => {
    const fetchOntologies = async () => {
      if (!userGroupname) {
        setOntologies([]);
        return;
      }

      setLoading(true);
      try {
        const data = await getOrganizationsOntologies(userGroupname);
        // Transform the ontologies data to match the expected format
        const transformedOntologies = Array.isArray(data) ? data.map((ontology, index) => {
          // Extract identifier from URI for fallback label
          let fallbackLabel = `Unknown Ontology ${ontology.id || index + 1}`;
          if (ontology.uri) {
            const uriParts = ontology.uri.split('/');
            const specIndex = uriParts.findIndex(part => part === 'spec');
            if (specIndex > 0) {
              const identifier = uriParts[specIndex - 1];
              fallbackLabel = `Ontology ${identifier}`;
            }
          }
          
          return {
            label: ontology.title || fallbackLabel,
            badge: userGroupname,
            selected: false,
            id: ontology.id || `ontology-${index}`,
            description: ontology.uri,
            url: ontology.url
          };
        }) : [];
        
        setOntologies(transformedOntologies);
      } catch (error) {
        console.error('Error fetching ontologies:', error);
        setOntologies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOntologies();
  }, [userGroupname, ontologiesRefreshKey]);

  // Initialize selectedValue from context when ontologies are loaded
  useEffect(() => {
    console.log('Context initialization check:', { 
      activeOntology, 
      ontologiesLength: ontologies.length,
      ontologies: ontologies.map(o => ({ id: o.id, label: o.label }))
    });
    
    if (activeOntology && ontologies.length > 0) {
      // Try to find by ID first, then by label as fallback
      let contextOntology = ontologies.find(ont => ont.id === activeOntology.id);
      
      if (!contextOntology && activeOntology.label) {
        contextOntology = ontologies.find(ont => ont.label === activeOntology.label);
      }
      
      if (contextOntology) {
        console.log('Initializing selectedValue from context (matched):', contextOntology);
        setSelectedValue({ ...contextOntology, selected: true });
      } else {
        console.log('Context ontology not found in loaded ontologies. Context:', activeOntology);
        console.log('Available ontologies:', ontologies);
        // If we still can't find it, keep the context ontology as selected
        setSelectedValue({ ...activeOntology, selected: true });
      }
    }
  }, [activeOntology, ontologies]);

  const handleOpenList = useCallback(() => {
    setOpenList(true);
  }, []);

  const handleInputChange = useCallback((event) => {
    setSearchTerm(event.target.value);
  }, []);

  const onSetActive = useCallback((event) => {
    event.stopPropagation();
    setOpenList(false);
    setSelectedValue(prev => {
      if (prev) {
        const updatedOntology = { ...prev, selected: true };
        // Save to context only if global updates are enabled
        if (!disableGlobalUpdate) {
          setOntologyData(updatedOntology);
          console.log('Active ontology saved to context:', updatedOntology);
        }
        return updatedOntology;
      }
      return null;
    });
  }, [setOntologyData, disableGlobalUpdate]);

  const handleClickOutside = useCallback((event) => {
    if (
      autocompleteRef.current &&
      !autocompleteRef.current.contains(event.target) &&
      popperRef.current &&
      !popperRef.current.contains(event.target)
    ) {
      setOpenList(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  const isOptionEqualToValue = useCallback((option, value) =>
    option.id === value?.id,
    []
  );

  const handleChange = useCallback((event, value) => {
    setSearchTerm('');
    setSelectedValue(value);

    // If value is null (cleared), also clear from context only if global updates are enabled
    if (!value && !disableGlobalUpdate) {
      setOntologyData(null);
      console.log('Ontology cleared from context');
    }

    // Call the callback if provided
    if (onOntologySelect) {
      onOntologySelect(value);
    }
  }, [onOntologySelect, setOntologyData, disableGlobalUpdate]);

  const popperProps = useMemo(() => ({
    sx: {
      width: fullWidth ? 'auto !important' : '21.75rem !important',
      minWidth: fullWidth ? 'auto !important' : '21.75rem !important',
      backgroundColor: 'white',
    },
    ref: popperRef
  }), [fullWidth]);

  const paperStyles = useMemo(() => ({
    ...styles.paper,
    ...extra
  }), [extra]);

  const PaperComponent = useMemo(() => {
    const Component = ({ children }) => (
      <Box sx={{ ...styles.popperBox, ...extra }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={2}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          children
        )}
        <Divider sx={{ marginTop: '.31rem' }} />
        <Box p='.75rem 1rem'>
          <Button
            variant="contained"
            size="small"
            fullWidth
            onClick={onSetActive}
            disabled={loading || !selectedValue}
          >
            Set as active ontology
          </Button>
        </Box>
      </Box>
    );
    Component.displayName = 'PaperComponent';
    return Component;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onSetActive, loading, selectedValue]);

  const renderOption = useCallback((props, option) => {
    const { key, ...otherProps } = props;
    return (
      <ListItem key={key} {...otherProps}>
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
                checked={selectedValue?.id === option.id}
              />
            }
            label={option.label}
          />
          <Chip label={option.badge} variant='outlined' />
        </Box>
      </ListItem>
    );
  }, [selectedValue]);

  const renderInput = useCallback((params) => (
    <TextField
      {...params}
      variant="outlined"
      placeholder={placeholder || "Search for ontology"}
      onChange={handleInputChange}
      InputProps={{
        ...params.InputProps,
        startAdornment: (
          <InputAdornment position='start'>
            <FolderSharedOutlinedIcon />
          </InputAdornment>
        ),
        endAdornment: (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {selectedValue?.selected && (
              <Chip
                label={selectedValue.badge}
                variant='outlined'
                size='small'
                sx={{ marginRight: '0.5rem' }}
              />
            )}
            {params.InputProps.endAdornment}
          </Box>
        ),
      }}
      sx={{
        "& .MuiOutlinedInput-root.Mui-disabled": {
          background: white,
          "-webkit-text-fill-color": `${gray400} !important`,
          "& .MuiSvgIcon-root": {
            fill: gray400
          },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: gray300
          }
        }
      }}
    />
  ), [handleInputChange, placeholder, selectedValue]);

  return (
    <div ref={autocompleteRef} style={{ width: fullWidth ? '100%' : 'fit-content' }}>
      <Autocomplete
        disableCloseOnSelect
        disableClearable={false}
        options={ontologies}
        value={selectedValue}
        open={openList}
        disabled={disabled}
        onOpen={handleOpenList}
        forcePopupIcon={false}
        onChange={handleChange}
        isOptionEqualToValue={isOptionEqualToValue}
        getOptionKey={(option) => option.id}
        sx={styles.autocomplete(fullWidth, selectedValue, openList)}
        autoHighlight={false}
        componentsProps={{
          popper: popperProps,
          paper: { sx: paperStyles },
        }}
        inputValue={searchTerm ? searchTerm : selectedValue?.selected ? selectedValue?.label : selectedValue?.label || ''}
        renderOption={renderOption}
        renderInput={renderInput}
        PaperComponent={PaperComponent}
      />
    </div>
  );
};

OntologySearch.propTypes = {
  placeholder: PropTypes.string,
  fullWidth: PropTypes.bool,
  key: PropTypes.string,
  children: PropTypes.node,
  disabled: PropTypes.bool,
  extra: PropTypes.object,
  userGroupname: PropTypes.string,
  onOntologySelect: PropTypes.func,
  disableGlobalUpdate: PropTypes.bool
};

export default OntologySearch;
