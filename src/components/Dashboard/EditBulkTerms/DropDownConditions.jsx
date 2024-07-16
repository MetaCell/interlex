import { Box } from "@mui/material";
import { useState, useEffect } from "react";
import { vars } from "../../../theme/variables";
import CustomIconTabs from "../../common/CustomIconTabs";
import { FiberSmartIcon, JoinInnerIcon } from "../../../Icons";
import SearchTermsData from "../../../static/SearchTermsData.json"
import CustomSingleSelect from "../../common/CustomSingleSelect";
const { gray300 } = vars;
const DropDownConditions = ({ value, onChange, index, handleTermChange }) => {
  const [tabValues, setTabValues] = useState(0);
  const [dropdownOptions, setDropdownOptions] = useState(SearchTermsData.objectOptions);
  
  useEffect(() => {
    setDropdownOptions(tabValues === 0 ? SearchTermsData.objectOptions : SearchTermsData.annotationOptions);
    handleTermChange(index, 'condition', tabValues === 0 ? SearchTermsData.objectOptions[0].value : SearchTermsData.annotationOptions[0].value);
  }, [tabValues]);
  
  const onConditionValueChange = (v) => {
    onChange(v);
  }
  
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
