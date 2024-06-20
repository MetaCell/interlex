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
import { vars } from "../../../theme/variables";
import ExpandIcon from '@mui/icons-material/Expand';
import RemoveIcon from '@mui/icons-material/Remove';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CallMadeIcon from '@mui/icons-material/CallMade';
import { SchemaOutlined, TableChartOutlined } from "@mui/icons-material";
import CustomizedTable from "./CustomizedTable";
const { gray600, gray800, gray500, gray700, gray300 } = vars;

const Predicates = () => {
  const [type, setType] = React.useState('Children');
  const [allExpanded, setAllExpanded] = React.useState(true);

  const collapse = () => {
    setAllExpanded(false);
  }

  const expand = () => {
    setAllExpanded(true);
  }

  return <Box display='flex' flexDirection='column' gap='.75rem'>
    <Box display='flex' alignItems='center' justifyContent='space-between'>
      <Typography color={gray800} fontWeight={500}>Predicates</Typography>
      <Box display='flex' alignItems='center' gap='.75rem'>
        {/* <FormControl sx={{ minWidth: 75 }}>
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
        </FormControl> */}
        <ButtonGroup variant="outlined" aria-label="Basic button group">
          <Button onClick={expand}>
            <ExpandIcon />
          </Button>
          <Button onClick={collapse}>
            <RemoveIcon />
          </Button>
        </ButtonGroup>
      </Box>
    </Box>
    <Accordion expanded={allExpanded} disableGutters elevation={0} square>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon fontSize='medium' />}
        aria-controls="panel1-content"
        id="panel1-header"
      >
        <Stack direction='row' spacing='.25rem'>
          <Typography>
            Is part of
          </Typography>
          <CallMadeIcon fontSize='medium' />
        </Stack>
        <Stack direction='row' alignItems='center' spacing='.75rem'>
          <Typography color={gray600} fontSize='.875rem'>Number of this type: 7</Typography>
          <Divider orientation="vertical" flexItem />
          <ButtonGroup variant="outlined" aria-label="Basic button group">
            <Button>
              <TableChartOutlined />
            </Button>
            <Button>
              <SchemaOutlined />
            </Button>
          </ButtonGroup>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <CustomizedTable />
      </AccordionDetails>
    </Accordion>
  </Box>

}

export default Predicates