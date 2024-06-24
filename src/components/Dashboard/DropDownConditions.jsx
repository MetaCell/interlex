import {Box, MenuItem, Select} from "@mui/material";
import FormControl from "@mui/material/FormControl";
import {useState} from "react";
import TextFieldsIcon from '@mui/icons-material/TextFields';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import {vars} from "../../theme/variables";
import CustomIconTabs from "../common/CustomIconTabs";
const {gray700, gray300} = vars
const DropDownConditions = () => {
  const [tabValues, setTabValues] = useState(0);
  const onChangeTab = (event, newValue) => {
    setTabValues(newValue);
  }
  return (
    <Box display='flex'>
      <FormControl sx={{
        minWidth: '6.375rem',
      }}>
        <Select
          displayEmpty
          defaultValue='Object'
          sx={{
            color: gray700,
            fontSize: '1rem',
            border: `1px solid ${gray300}`,
            borderRadius: '0.5rem',
            borderRight: 0,
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            height: '2.5rem',
            '& .MuiOutlinedInput-input': {
              padding: '.5rem .75rem'
            },
            '& .MuiOutlinedInput-notchedOutline': {
              border: '0 !important',
            },
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
      <CustomIconTabs
        tabs={[{
          icon: <TextFieldsIcon />,
          value: 0
        },{
          icon: <LinkOutlinedIcon />,
          value: 1
        }]}
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
  )
}

export default DropDownConditions