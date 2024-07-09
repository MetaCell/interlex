import React from "react";
import { Box, Typography } from "@mui/material";
import { vars } from "../../../theme/variables";
import ExpandIcon from '@mui/icons-material/Expand';
import RemoveIcon from '@mui/icons-material/Remove';

import CustomIconTabs from "../../common/CustomIconTabs";
import PredicatesAccordion from "./PredicatesAccordion";


const { gray800 } = vars;

const Predicates = ({ data }) => {
  
  const [predicates, setPredicates] = React.useState([]);
  const [tabValue, setTabValue] = React.useState(0)

  const onTabsChanged = (event, newValue) => {
    setTabValue(newValue)
  }

  React.useEffect(() => {
    data?.predicates && setPredicates(data?.predicates)
  }, [data]);

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