import React, { useEffect, useState } from "react";
import { Box, Typography, tabClasses } from "@mui/material";
import { vars } from "../../../theme/variables";
import ExpandIcon from '@mui/icons-material/Expand';
import RemoveIcon from '@mui/icons-material/Remove';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import CustomIconTabs from "../../common/CustomIconTabs";
import PredicatesAccordion from "./PredicatesAccordion";
import predicates from '../../../static/predicates.json';
import * as mockApi from './../../../api/endpoints/interLexURIStructureAPI';
import { termParser } from './../../../parsers/termParser'

const useMockApi = () => mockApi;

const { gray800 } = vars;
const URL = ""

const Predicates = ({ term }) => {
  
  const [predicates, setPredicates] = React.useState([]);
  const [type, setType] = React.useState('Children');
  const [tabValue, setTabValue] = React.useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null);

  const { getEndpointsIlx } = useMockApi();

  const onTabsChanged = (event, newValue) => {
    setTabValue(newValue)
  }

  React.useEffect(() => {
    getEndpointsIlx("base",term).then( dat => { 
      const parsedData = termParser(dat);
      setPredicates(parsedData?.results[0]?.predicates)
      setLoading(false)
    })
  }, [term]);

  return <Box display='flex' flexDirection='column' gap='.75rem'>
    <Box display='flex' alignItems='center' justifyContent='space-between'>
      <Typography color={gray800} fontWeight={500}>Predicates</Typography>
      <Box display='flex' alignItems='center' gap='.75rem'>
        <CustomIconTabs
          tabs={[{
            icon: <ExpandIcon />,
            value: 1
          }, {
            icon: <RemoveIcon />,
            value: 0
          }]} value={tabValue} handleChange={onTabsChanged} />
      </Box>
    </Box>
    <PredicatesAccordion data={predicates} expandedTabValue={tabValue}/>
  </Box>

}

export default Predicates