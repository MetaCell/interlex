import { Box } from "@mui/material";
import { useState, useEffect } from "react";
import { vars } from "../../theme/variables";
import { FiberSmartIcon, JoinInnerIcon } from "../../Icons";
import SearchTermsData from "../../static/SearchTermsData.json"
import CustomSingleSelect from "../common/CustomSingleSelect";
import {ToggleButton, ToggleButtonGroup} from "@mui/lab";
const { gray300 } = vars;
const DropDownConditions = ({ value, onChange, index, handleTermChange }) => {
  const [toggleButtonValue, setToggleButtonValue] = useState('object');
  const [dropdownOptions, setDropdownOptions] = useState(SearchTermsData.objectOptions);
  
  useEffect(() => {
    setDropdownOptions(toggleButtonValue === 'object' ? SearchTermsData.objectOptions : SearchTermsData.annotationOptions);
    handleTermChange(index, 'relation', toggleButtonValue === 'object' ? SearchTermsData.objectOptions[0].value : SearchTermsData.annotationOptions[0].value);
  }, [toggleButtonValue]);
  
  const onConditionValueChange = (v) => {
    onChange(v);
  }
  
  const onToggleButtonChange = (event, newValue) => {
    if (newValue) {
      setToggleButtonValue(newValue);
    }
  };
  
  return (
    <Box display='flex'>
      <CustomSingleSelect value={value} onChange={onConditionValueChange} options={dropdownOptions} FormControlSX={{
        minWidth: '6.375rem',
        flexGrow: 1
      }}
      SelectSX={{
        border: `1px solid ${gray300}`,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
        height: '2.5rem',
        '& .MuiOutlinedInput-notchedOutline': {
          border: '0 !important'
        },
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
        <ToggleButton value={'object'}>
          <JoinInnerIcon />
        </ToggleButton>
        <ToggleButton value={'annotation'}>
          <FiberSmartIcon />
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};

export default DropDownConditions;
