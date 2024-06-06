import React from "react";
import {
  Accordion, AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  ButtonGroup, Divider,
  FormControl,
  MenuItem,
  Select, Stack,
  Typography
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import {vars} from "../../../theme/variables";
import ExpandIcon from '@mui/icons-material/Expand';
import RemoveIcon from '@mui/icons-material/Remove';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CallMadeIcon from '@mui/icons-material/CallMade';
import {SchemaOutlined, TableChartOutlined} from "@mui/icons-material";
import CustomizedTable from "./CustomizedTable";
import CustomIconTabs from "../../common/CustomIconTabs";
import PredicatesAccordion from "./PredicatesAccordion";
const { gray600, gray800, gray500, gray700, gray300 } = vars;

const accordionData = [
  {
    title: "Is part of 1",
    count: 7,
    tableData: [{ /* table data for the first accordion */ }]
  },
  {
    title: "Is part of 2",
    count: 5,
    tableData: [{ /* table data for the second accordion */ }]
  },
  // add more objects for additional accordions
];
const Predicates = () => {
  const [type, setType] = React.useState('Children');
  const [tabValue, setTabValue] = React.useState(0)
  
  const onTabsChanged = (event, newValue) => {
    setTabValue(newValue)
  }
  
  return <Box display='flex' flexDirection='column' gap='.75rem'>
    <Box display='flex' alignItems='center' justifyContent='space-between'>
      <Typography color={gray800} fontWeight={500}>Predicates</Typography>
      <Box display='flex' alignItems='center' gap='.75rem'>
        <FormControl sx={{ minWidth: 75 }}>
          <Select
            value={type}
            onChange={(v) => setType(v)}
            displayEmpty
            IconComponent={KeyboardArrowDownIcon}
            sx={{
              color: gray700,
              borderRadius: '0.5rem !important',
              fontSize: '0.875rem',
              fontWeight: 600,
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
              }
            }}
          >
            <MenuItem value={'Children'}>Show Sections</MenuItem>
            <MenuItem value={'Superclasses'}>Superclasses</MenuItem>
          </Select>
        </FormControl>
        <CustomIconTabs tabs={[<ExpandIcon />, <RemoveIcon />]} value={tabValue} handleChange={onTabsChanged} />
      </Box>
    </Box>
    <PredicatesAccordion data={accordionData} />
  </Box>
  
}

export default Predicates