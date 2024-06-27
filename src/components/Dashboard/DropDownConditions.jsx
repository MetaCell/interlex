import { Box, MenuItem, Select } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import { useState, useEffect } from "react";
import { vars } from "../../theme/variables";
import CustomIconTabs from "../common/CustomIconTabs";
import { FiberSmartIcon, JoinInnerIcon } from "../../Icons";
import SearchTermsData from "../../static/SearchTermsData.json"
const { gray700, gray300 } = vars;
const DropDownConditions = ({ value, onChange, index, handleTermChange }) => {
  const [tabValues, setTabValues] = useState(0);
  const [dropdownOptions, setDropdownOptions] = useState(SearchTermsData.objectOptions);
  
  useEffect(() => {
    setDropdownOptions(tabValues === 0 ? SearchTermsData.objectOptions : SearchTermsData.annotationOptions);
    handleTermChange(index, 'condition', tabValues === 0 ? SearchTermsData.objectOptions[0].value : SearchTermsData.annotationOptions[0].value);
  }, [tabValues]);
  
  const onConditionValueChange = (e) => {
    onChange(e.target.value);
  }
  
  return (
    <Box display='flex'>
      <FormControl
        sx={{
          minWidth: '6.375rem',
          flexGrow: 1
        }}
      >
        <Select
          value={value}
          onChange={onConditionValueChange}
          sx={{
            color: gray700,
            fontSize: '1rem',
            border: `1px solid ${gray300}`,
            borderRadius: '0.5rem',
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            height: '2.5rem',
            '& .MuiOutlinedInput-input': {
              padding: '.5rem .75rem'
            },
            '& .MuiOutlinedInput-notchedOutline': {
              border: '0 !important'
            },
            '& .MuiSvgIcon-root': {
              color: gray700,
              fontSize: '1.25rem',
              right: '0.875rem !important'
            }
          }}
        >
          {dropdownOptions.map(option => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <CustomIconTabs
        tabs={[
          {
            icon: <JoinInnerIcon />,
            value: 0
          },
          {
            icon: <FiberSmartIcon />,
            value: 1
          }
        ]}
        value={tabValues}
        handleChange={(event, newValue) => setTabValues(newValue)}
        sx={{
          borderLeft: 0,
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
          height: '2.5rem'
        }}
      />
    </Box>
  );
};

export default DropDownConditions;
