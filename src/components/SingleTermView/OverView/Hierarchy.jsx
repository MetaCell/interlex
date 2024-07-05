import {
  Box,
  Button,
  Divider,
  Stack,
  Typography
} from "@mui/material";
import { vars } from "../../../theme/variables";
import React from "react";
import { RestartAlt, TargetCross} from "../../../Icons";
import SingleSearch from "../SingleSearch";
import CustomizedTreeView from "../../common/CustomizedTreeView";
import CustomSingleSelect from "../../common/CustomSingleSelect";

const { gray600, gray800 } = vars;
const options = [
  { label: 'Oliver Hansen', handler: 'Oliver'},
  { label: 'April Tucker', handler: 'April'},
  { label: 'Van Henry', handler: 'Van'},
  { label: 'Omar Alexander', handler: 'Omar'}
];
const Hierarchy = () => {
  const [type, setType] = React.useState('children');
  const [selectedValue, setSelectedValue] = React.useState(null);
  
  const handleSelectChange = (event, value) => {
    setSelectedValue(value);
  }

  return (
    <Box display='flex' flexDirection='column' gap='1rem'>
      <Box display='flex' alignItems='center' justifyContent='space-between'>
        <Typography color={gray800} fontWeight={500}>Hierarchy</Typography>
        <Stack direction="row" alignItems="center" spacing={'.75rem'}>
          <Typography variant="caption" sx={{ fontSize: '0.875rem', color: gray600 }}>Type:</Typography>
          <CustomSingleSelect value={type} onChange={(v) => setType(v)} options={[
            {
              value: 'children',
              label: 'Children',
            },
            {
              value: 'superclasses',
              label: 'Superclasses',
            },
          ]} />
          <Divider orientation="vertical" flexItem />
          <Button sx={{ p: '0.625rem 0.5625rem', minWidth: '0.0625rem' }} variant='outlined'>
            <RestartAlt />
          </Button>
          <Button sx={{ p: '0.625rem 0.5625rem', minWidth: '0.0625rem' }} variant='outlined'>
            <TargetCross />
          </Button>
        </Stack>
      </Box>
      <SingleSearch onChange={handleSelectChange} selectedValue={selectedValue} options={options} />
      <CustomizedTreeView />
      <Typography color={gray600} fontSize='.875rem'>Total number of first generation children: 3</Typography>
    </Box>
  )}

export default Hierarchy