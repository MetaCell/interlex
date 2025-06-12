import { debounce } from 'lodash';
import PropTypes from 'prop-types';
import SingleSearch from "../SingleSearch";
import FormControl from "@mui/material/FormControl";
import {getMatchTerms} from "../../../api/endpoints";
import {useCallback, useEffect, useState} from "react";
import TextFieldsIcon from '@mui/icons-material/TextFields';
import predicatesData from "../../../static/predicates.json";
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import {Box, MenuItem, Select, Typography, ToggleButton, ToggleButtonGroup} from "@mui/material";

import {vars} from "../../../theme/variables";
const {gray700, gray300, gray800, gray600} = vars

const PredicateGroupInput = ({ predicate, onChange }) => {
  const [toggleButtonValue, setToggleButtonValue] = useState('text');
  const [objectSearchTerm, setObjectSearchTerm] = useState('');
  const [terms, setTerms] = useState([]);
  const [selectedType, setSelectedType] = useState(predicate.object.type);

  const onToggleButtonChange = (event, newValue) => {
    if (newValue) {
      setToggleButtonValue(newValue);
      onChange({ ...predicate.object, isLink: newValue === 'link' });
      }
    };

  const handleSelectChange = (e) => {
    const newType = e.target.value;
    setSelectedType(newType);
    onChange({ ...predicate.object, type: newType, value: '' });
  };
  
  const handleTermsChange = (e) => {
    onChange({ ...predicate.object, value: e.label });
    setObjectSearchTerm('');
    setTerms([]);
  }
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchTerms = useCallback(debounce(async (searchTerm) => {
    const data = await getMatchTerms("base", searchTerm);
    setTerms(data?.results);
  }, 500), [getMatchTerms]);
  
  useEffect(() => {
    if (objectSearchTerm) {
      fetchTerms(objectSearchTerm);
    }
  }, [objectSearchTerm, fetchTerms]);

  return (
    <Box>
      <Box display='flex' alignItems='center' justifyContent='space-between' mb='.75rem'>
        <Typography sx={{ fontSize: '1rem', fontWeight: '500', color: gray800 }}>
          Object
        </Typography>
        <Typography sx={{ fontSize: '1rem', color: gray600 }}>
          Required
        </Typography>
      </Box>
      
      <Box display='flex'>
        <FormControl sx={{ minWidth: '6.375rem' }}>
          <Select
            displayEmpty
            value={selectedType}
            onChange={handleSelectChange}
            sx={{
              color: gray700,
              fontSize: '1rem',
              border: `1px solid ${gray300}`,
              borderRadius: '0.5rem',
              borderRight: 0,
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
              height: '2.5rem',
              '& .MuiOutlinedInput-input': { padding: '.5rem .75rem' },
              '& .MuiOutlinedInput-notchedOutline': { border: '0 !important' },
              '& .MuiSvgIcon-root': {
                color: gray700,
                fontSize: '1.25rem',
                right: '0.875rem !important'
              }
            }}
          >
            <MenuItem value='Object'>Object</MenuItem>
            <MenuItem value='Annotation'>Annotation</MenuItem>
          </Select>
        </FormControl>
        <SingleSearch
          selectedValue={predicate.object.value}
          onChange={handleTermsChange}
          startAdornment={false}
          options={selectedType === 'Object' ? terms : predicatesData.annotationOptions}
          searchTerm={objectSearchTerm}
          setSearchTerm={setObjectSearchTerm}
          sx={{
            '& .MuiInputBase-root': {
              border: 0,
              backgroundColor: 'transparent',
              borderRadius: 0,
              '& .MuiOutlinedInput-notchedOutline': { borderColor: gray300 }
            }
          }}
        />
        <ToggleButtonGroup
          value={toggleButtonValue}
          exclusive
          onChange={onToggleButtonChange}
          sx={{
            height: '2.5rem',
            '& .MuiToggleButtonGroup-firstButton': {
              borderLeft: 0,
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
            }
          }}
        >
          <ToggleButton value={'text'}>
            <TextFieldsIcon />
          </ToggleButton>
          <ToggleButton value={'link'}>
            <LinkOutlinedIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </Box>
  );
};

PredicateGroupInput.propTypes = {
  predicate: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired
};

export default PredicateGroupInput;
