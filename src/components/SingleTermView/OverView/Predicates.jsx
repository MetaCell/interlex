import React, {useEffect, useState} from "react";
import {
  Box,
  FormControl,
  MenuItem,
  Select,
  Typography
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import {vars} from "../../../theme/variables";
import ExpandIcon from '@mui/icons-material/Expand';
import RemoveIcon from '@mui/icons-material/Remove';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import CustomIconTabs from "../../common/CustomIconTabs";
import PredicatesAccordion from "./PredicatesAccordion";
import predicates from '../../../static/predicates.json';
import * as mockApi from './../../../api/endpoints/interLexURIStructureAPI';
import { termParser } from './../../../parsers/termParser'

const useMockApi = () => mockApi;

const { gray800, gray700, gray300 } = vars;
const URL = ""

const Predicates = ({ term }) => {
  
  const [predicates, setPredicates] = React.useState([]);
  const [type, setType] = React.useState('Children');
  const [tabValue, setTabValue] = React.useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null);

  const { getEndpointsIlx } = useMockApi();

  const onTabsChanged = (event, newValue) => {
    setTabValue(newValue)
  }

  React.useEffect(() => {
    getEndpointsIlx("base",term).then( dat => { 
      const parsedData = termParser(dat);
      console.log("Predicates ", parsedData[0]?.predicates)
      setPredicates(parsedData[0]?.predicates)
      setLoading(false)
    })
  }, [term]);

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
        <CustomIconTabs
          tabs={[{
            icon: <ExpandIcon />,
            value: 0
          },{
            icon: <RemoveIcon />,
            value: 1
        }]} value={tabValue} handleChange={onTabsChanged} />
      </Box>
    </Box>
    <PredicatesAccordion data={predicates} />
  </Box>
  
}

export default Predicates