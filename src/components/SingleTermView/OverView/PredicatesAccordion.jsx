import React, { useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Divider,
  Stack,
  Typography,
  Box, Button
} from "@mui/material";
import { vars } from "../../../theme/variables";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CallMadeIcon from '@mui/icons-material/CallMade';
import {FullscreenOutlined, SchemaOutlined, TableChartOutlined} from "@mui/icons-material";
import CustomizedTable from "./CustomizedTable";
import CustomIconTabs from "../../common/CustomIconTabs";
import ViewDiagramDialog from "./ViewDiagramDialog";

const { gray600 } = vars;

const PredicatesAccordion = ({ data }) => {
  const [tabValues, setTabValues] = useState(data.map(() => 0));
  const [openViewDiagram, setOpenViewDiagram] = React.useState(false);
  
  const onTabsChanged = (index) => (event, newValue) => {
    event.preventDefault();
    event.stopPropagation();
    const newTabValues = [...tabValues];
    newTabValues[index] = newValue;
    setTabValues(newTabValues);
  };
  const handleClickViewDiagram = () => {
    setOpenViewDiagram(true);
  };
  const handleCloseViewDiagram = () => {
    setOpenViewDiagram(false);
  };
  
  
  return (
    <>
      {data.map((item, index) => (
        <Accordion key={index} disableGutters elevation={0} square defaultExpanded>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon fontSize='medium' />}
            aria-controls={`panel${index + 1}-content`}
            id={`panel${index + 1}-header`}
          >
            <Stack direction='row' spacing='.25rem'>
              <Typography>
                {item.title}
              </Typography>
              <CallMadeIcon fontSize='medium' />
            </Stack>
            <Stack direction='row' alignItems='center' spacing='.75rem'>
              <Typography color={gray600} fontSize='.875rem'>
                Number of this type: {item.count}
              </Typography>
              <Divider orientation="vertical" flexItem />
              <CustomIconTabs
                tabs={[<TableChartOutlined />, <SchemaOutlined />]}
                value={tabValues[index]}
                handleChange={onTabsChanged(index)}
              />
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            {tabValues[index] === 0 ? (
              <CustomizedTable />
            ) : (
              <Box display='flex' flexDirection='column'>
                <Button
                  variant='outlined'
                  onClick={handleClickViewDiagram}
                  disableRipple
                  sx={{
                  minWidth:'auto',
                  alignSelf: 'flex-end'
                }}>
                  <FullscreenOutlined  />
                </Button>
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
      ))}
      
      <ViewDiagramDialog open={openViewDiagram} handleClose={handleCloseViewDiagram} />
    </>
  );
};

export default PredicatesAccordion;
