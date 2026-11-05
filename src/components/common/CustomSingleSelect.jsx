import PropTypes from 'prop-types';
import {Box, FormControl, MenuItem, Select} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import {vars} from "../../theme/variables";
const {gray700, gray300, gray500} = vars

const optionValue = (option) => (typeof option === 'object' ? option.value : option);
const optionLabel = (option) => (typeof option === 'object' ? option.label : option);

const CustomSingleSelect = ({value, onChange, options, FormControlSX, SelectSX, isFormControlFullWidth, placeholder}) => {
  const hasValue = !!value || value === 0;

  // The placeholder is rendered as the select's own value, not as a floating label, so the box
  // sizes to it and keeps the arrow icon's area clear of the text.
  const renderValue = (selected) => {
    if (!hasValue) {
      return (
        <Box component="span" sx={{ fontSize: '1rem', fontWeight: 400, color: gray500 }}>
          {placeholder || 'Select an option'}
        </Box>
      );
    }
    const selectedOption = options?.find((option) => optionValue(option) === selected);
    return selectedOption === undefined ? selected : optionLabel(selectedOption);
  };

  return(
    <FormControl sx={{ minWidth: 75, ...FormControlSX }} fullWidth={isFormControlFullWidth}>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        displayEmpty
        renderValue={renderValue}
        IconComponent={KeyboardArrowDownIcon}
        sx={{
          color: gray700,
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: 600,
          background: '#fff',
          '& .MuiOutlinedInput-input': {
            padding: '0.625rem 0.875rem'
          },
          '& .MuiSelect-select.MuiInputBase-input.MuiOutlinedInput-input': {
            paddingRight: '2.75rem'
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: gray300
          },
          '& .MuiSvgIcon-root': {
            color: gray700,
            fontSize: '1.25rem',
            right: '0.875rem !important'
          },
          ...SelectSX
        }}
      >
        {
          options?.map((option, i) => <MenuItem key={i} value={optionValue(option)}>{optionLabel(option)}</MenuItem>)
        }
      </Select>
    </FormControl>
  )
}

CustomSingleSelect.propTypes = {
  value: PropTypes.any.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.array.isRequired,
  FormControlSX: PropTypes.object,
  SelectSX: PropTypes.object,
  isFormControlFullWidth: PropTypes.bool,
  placeholder: PropTypes.string
}

export default CustomSingleSelect
