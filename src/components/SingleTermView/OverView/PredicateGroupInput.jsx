import {Box, MenuItem, Select, Typography} from "@mui/material";
import FormControl from "@mui/material/FormControl";
import {vars} from "../../../theme/variables";
import CustomIconTabs from "../../common/CustomIconTabs";
import {useCallback, useEffect, useState} from "react";
import TextFieldsIcon from '@mui/icons-material/TextFields';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import SingleSearch from "../SingleSearch";
import { debounce } from 'lodash';
import { getMatchTerms } from "../../../api/endpoints";
import predicatesData from "../../../static/predicates.json"

const {gray700, gray300, gray800, gray600} = vars

const PredicateGroupInput = ({ predicate, onChange }) => {
  const [tabValues, setTabValues] = useState(0);
  const [objectSearchTerm, setObjectSearchTerm] = useState('');
  const [terms, setTerms] = useState([]);
  const [selectedType, setSelectedType] = useState(predicate.object.type);
    
  const onChangeTab = (event, newValue) => {
    setTabValues(newValue);
    onChange({ ...predicate.object, isLink: newValue === 1 });
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
  
  const fetchTerms = useCallback(debounce(async (searchTerm) => {
    const data = await getMatchTerms(searchTerm);
    setTerms(data);
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
        <CustomIconTabs
          tabs={[{ icon: <TextFieldsIcon />, value: 0 }, { icon: <LinkOutlinedIcon />, value: 1 }]}
          value={tabValues}
          handleChange={onChangeTab}
          sx={{
            borderLeft: 0,
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            height: '2.5rem'
          }}
        />
      </Box>
    </Box>
  );
};

export default PredicateGroupInput;
