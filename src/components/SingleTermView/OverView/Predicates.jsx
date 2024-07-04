import React, { useEffect, useState } from "react";
import { Box, Typography, tabClasses } from "@mui/material";
import { vars } from "../../../theme/variables";
import ExpandIcon from '@mui/icons-material/Expand';
import RemoveIcon from '@mui/icons-material/Remove';
import CustomIconTabs from "../../common/CustomIconTabs";
import PredicatesAccordion from "./PredicatesAccordion";
import predicates from '../../../static/predicates.json';

const { gray800 } = vars;
const URL = ""

const Predicates = () => {
  const [tabValue, setTabValue] = React.useState(1)
  const [data, setData] = React.useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null);
  const onTabsChanged = (event, newValue) => {
    setTabValue(newValue)
  }

  useEffect(() => {
    setLoading(true)
    fetch(URL)
      .then((response) => response.json())
      .then((jsonData) => {
        setData(jsonData);
        setLoading(false)
      })
      .catch((error) => {
        setError(error)
        setLoading(false)
      });
  }, []);


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