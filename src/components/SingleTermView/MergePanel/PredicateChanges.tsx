import React, { useState, useEffect } from "react"
import { Box, Typography, Accordion, AccordionDetails, AccordionSummary, Stack, ToggleButton, ToggleButtonGroup } from "@mui/material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import CallMadeIcon from "@mui/icons-material/CallMade"
import ExpandIcon from '@mui/icons-material/Expand';
import RemoveIcon from '@mui/icons-material/Remove';
import TableChanges from "./TableChanges";
import { vars } from "../../../theme/variables"

const { gray600, gray800 } = vars;

type TableData = {
  id: string
  subject: string
  predicate: string
}

type PredicateData = {
  title: string
  count: number
  tableData: TableData[]
}

type PredicateChangesProps = {
  title: string
  data: PredicateData[]
  compareData: PredicateData[]
  status: string
}

export const PredicateChanges: React.FC<PredicateChangesProps> = ({ title, data, compareData, status }) => {
  const [toggleButtonValue, setToggleButtonValue] = useState('compress');
  const [expandedItems, setExpandedItems] = useState(data?.map(() => false) || []);

  const onToggleButtonChange = (event, newValue) => {
    if (newValue) {
      setToggleButtonValue(newValue)
    }
  }

  const handleAccordionChange = (index) => (event, isExpanded) => {
    const newExpandedItems = [...expandedItems];
    newExpandedItems[index] = isExpanded;
    setExpandedItems(newExpandedItems);
  };

  useEffect(() => {
    const newExpandedItems = data?.map(() => toggleButtonValue === "expand") || [];
  
    setExpandedItems(newExpandedItems);
  }, [data, toggleButtonValue]);

  return (
    <Box display="flex" flexDirection="column" gap=".75rem">
      <Box display="flex" sx={{ alignItems: "center", justifyContent: "space-between" }}>
        <Typography color={gray800} fontWeight={500}>
          {title}
        </Typography>
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
      {data.map((pred, index) => (
        <Accordion
          key={`${index}-${toggleButtonValue === 'expand'}`}
          disableGutters
          elevation={0}
          expanded={expandedItems[index] ?? false}
          onChange={handleAccordionChange(index)}
          square
          sx={{
            "&.MuiPaper-root": {
              backgroundColor: "transparent",
            },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon fontSize="medium" />}
            aria-controls={`panel${index + 1}-content`}
            id={`panel${index + 1}-header`}
          >
            <Stack direction="row" spacing=".25rem">
              <Typography>{pred.title}</Typography>
              <CallMadeIcon fontSize="medium" />
            </Stack>
            <Stack direction="row" alignItems="center" spacing=".75rem">
              <Typography color={gray600} fontSize=".875rem">
                Number of this type: {pred.count}
              </Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <TableChanges data={pred} compareData={compareData[index]} status={status} />
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  )
}

export default PredicateChanges;

