import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import {FormControl, InputLabel, MenuItem, Select} from "@mui/material";
import {vars} from "../../theme/variables";

const {gray700, gray300, gray500} = vars
const CustomSingleSelect = ({value, onChange, options, FormControlSX, SelectSX, isFormControlFullWidth, placeholder}) => {
  return(
    <FormControl sx={{ minWidth: 75, ...FormControlSX }} fullWidth={isFormControlFullWidth}>
      {
        !value && value !== 0 && <InputLabel
          sx={{
            transform: "translate(0, 0.625rem) scale(1)",
            transformOrigin: "top left",
            left: ".75rem",
            fontSize: '1rem !important',
            lineHeight: 1,
            fontWeight: '400 !important',
            color: `${gray500} !important`
          }}
          id="single-select-label">
          {placeholder || 'Select an option'}
        </InputLabel>
      }
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
          options?.map((option, i) => <MenuItem key={i} value={typeof option === 'object' ? option.value : option}>{typeof option === 'object' ? option.label : option}</MenuItem>)
        }
      </Select>
    </FormControl>
  )
}

export default CustomSingleSelect