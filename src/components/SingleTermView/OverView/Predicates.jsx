import React from "react";
import {Box, Typography, ToggleButton, ToggleButtonGroup} from "@mui/material";
import { vars } from "../../../theme/variables";
import ExpandIcon from '@mui/icons-material/Expand';
import RemoveIcon from '@mui/icons-material/Remove';
import PredicatesAccordion from "./PredicatesAccordion";


const { gray800 } = vars;

const Predicates = ({ data }) => {
  const [predicates, setPredicates] = React.useState([]);
  const [toggleButtonValue, setToggleButtonValue] = React.useState('compress')
  
  const onToggleButtonChange = (event, newValue) => {
    if (newValue) {
      setToggleButtonValue(newValue)
    }
  }
  
  React.useEffect(() => {
    data?.predicates && setPredicates(data?.predicates)
  }, [data]);

  return <Box display='flex' flexDirection='column' gap='.75rem'>
    <Box display='flex' alignItems='center' justifyContent='space-between'>
      <Typography color={gray800} fontWeight={500}>Predicates</Typography>
      <Box display='flex' alignItems='center' gap='.75rem'>
        <ToggleButtonGroup
          value={toggleButtonValue}
          exclusive
          onChange={onToggleButtonChange}
          sx={{
            gap: '.75rem',
            
            '& .MuiButtonBase-root': {
              borderRadius: '.5rem !important'
            }
          }}
        >
          <ToggleButton value={'expand'}>
            <ExpandIcon />
          </ToggleButton>
          <ToggleButton value={'compress'}>
            <RemoveIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </Box>
    <PredicatesAccordion data={predicates} expandAllPredicates={toggleButtonValue === 'expand'} />
  </Box>

}

export default Predicates