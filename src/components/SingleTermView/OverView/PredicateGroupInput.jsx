import {Box, MenuItem, Select, Typography} from "@mui/material";
import FormControl from "@mui/material/FormControl";
import CustomizedInput from "../../common/CustomizedInput";
import {vars} from "../../../theme/variables";
import CustomIconTabs from "../../common/CustomIconTabs";
import {useState} from "react";
import TextFieldsIcon from '@mui/icons-material/TextFields';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
const {gray700, gray300, gray800, gray600} = vars
const PredicateGroupInput = () => {
  const [tabValues, setTabValues] = useState(0);
  const onChangeTab = (event, newValue) => {
    setTabValues(newValue);
  }
  return (
    <Box>
      <Box display='flex' alignItems='center' justifyContent='space-between' mb='.75rem'>
        <Typography sx={{
          fontSize: '1rem',
          fontWeight: '500',
          color: gray800,
        }}>
          Predicate
        </Typography>
        <Typography sx={{
          fontSize: '1rem',
          color: gray600,
        }}>
          Required
        </Typography>
      </Box>
   
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
        <CustomizedInput value='' placeholder='Enter object string' sx={{
          width: 'auto',
          flex: 1,
          height: '2.5rem',
          '& .MuiInputBase-input': {
            borderRadius: 0,
          }
        }} />
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
      
    </Box>
  )
}

export default PredicateGroupInput