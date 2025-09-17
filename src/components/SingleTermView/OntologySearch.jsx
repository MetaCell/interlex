import React, { useEffect, useRef, useCallback, useMemo } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  TextField,
  Autocomplete,
  InputAdornment,
  FormControlLabel,
} from "@mui/material";
import PropTypes from "prop-types";
import ListItem from '@mui/material/ListItem';
import CustomizedRadio from "../common/CustomizedRadio";
import FolderSharedOutlinedIcon from '@mui/icons-material/FolderSharedOutlined';
import { vars } from "../../theme/variables";

const { brand600, gray50, gray300, gray400, white, gray700, gray200, paperShadow } = vars;

const OPTIONS = [
  { label: 'Nervous system1', badge: 'My Organization 1', selected: false },
  { label: 'Nervous system2', badge: 'ODC-TBI', selected: false },
  { label: 'Nervous system3', badge: 'Dk-net', selected: false },
  { label: 'Nervous system666', badge: 'My Organization 2', selected: false }
];

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

const OntologySearch = ({ placeholder, fullWidth = false, disabled, extra }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [openList, setOpenList] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState(null);
  const autocompleteRef = useRef(null);
  const popperRef = useRef(null);

  const handleOpenList = useCallback(() => {
    setOpenList(true);
  }, []);

  const handleInputChange = useCallback((event) => {
    setSearchTerm(event.target.value);
  }, []);

  const onSetActive = useCallback((event) => {
    event.stopPropagation();
    setOpenList(false);
    setSelectedValue(prev => prev ? { ...prev, selected: true } : null);
  }, []);

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
    option.label === value?.label && option.badge === value?.badge,
    []
  );

  const handleChange = useCallback((event, value) => {
    setSearchTerm('');
    setSelectedValue(value);
  }, []);

  const popperProps = useMemo(() => ({
    sx: {
      width: fullWidth ? 'auto !important' : '21.75rem !important',
      minWidth: fullWidth ? 'auto !important' : '21.75rem !important',
      backgroundColor: 'white',
    },
    ref: popperRef
  }), [fullWidth]);

  const PaperComponent = useMemo(() => {
    const Component = ({ children }) => (
      <Box sx={{ ...styles.popperBox, ...extra }}>
        {children}
        <Divider sx={{ marginTop: '.31rem' }} />
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
    );
    Component.displayName = 'PaperComponent';
    return Component;
  }, [onSetActive]);

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
                checked={selectedValue?.label === option.label}
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
        disableClearable
        options={OPTIONS}
        open={openList}
        disabled={disabled}
        onOpen={handleOpenList}
        forcePopupIcon={false}
        onChange={handleChange}
        isOptionEqualToValue={isOptionEqualToValue}
        sx={styles.autocomplete(fullWidth, selectedValue, openList)}
        autoHighlight={false}
        componentsProps={{
          popper: popperProps,
          paper: { sx: styles.paper },
        }}
        inputValue={searchTerm ? searchTerm : selectedValue?.selected ? selectedValue?.label : ''}
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
  extra: PropTypes.object
};

export default OntologySearch;
