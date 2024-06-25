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
import { FullscreenOutlined, SchemaOutlined, TableChartOutlined } from "@mui/icons-material";
import CustomizedTable from "./CustomizedTable";
import CustomIconTabs from "../../common/CustomIconTabs";
import ViewDiagramDialog from "./ViewDiagramDialog";
import { useQuery } from "../../../helpers";

const { gray600 } = vars;

const PredicatesAccordion = ({ data, expandedTabValue }) => {
  const [tabValues, setTabValues] = useState(data.map(() => 0));
  const [openViewDiagram, setOpenViewDiagram] = React.useState(false);
  const [selectedItem, setSelectedItem] = useState(null)
  const [expandedItems, setExpandedItems] = useState(data.map(() => false));
  const query = useQuery();
  const term = query.get('searchTerm');

  const imgStyle = { width: '100%' };
  const imgPath = '/success.png';
  const onTabsChanged = (index) => (event, newValue) => {
    event.preventDefault();
    event.stopPropagation();
    const newTabValues = [...tabValues];
    newTabValues[index] = newValue;
    setTabValues(newTabValues);
  };
  const handleClickViewDiagram = (e, item) => {
    setSelectedItem(item)
    setOpenViewDiagram(true);
  };
  const handleCloseViewDiagram = () => {
    setOpenViewDiagram(false);
  };

  const handleAccordionChange = (index) => (event, isExpanded) => {
    const newExpandedItems = [...expandedItems];
    newExpandedItems[index] = isExpanded;
    setExpandedItems(newExpandedItems);
  };

  React.useEffect(() => {
    if (expandedTabValue) {
      setExpandedItems(data.map(() => true));
    } else {
      setExpandedItems(data.map(() => false));
    }
  }, [expandedTabValue, data])

  const image = new Image();
  image.onload = () => <img style={imgStyle} src={imgPath} alt="preview" />
  image.src = imgPath;

  return (
    <>
      {data.map((item, index) => (
        <Accordion key={index} disableGutters elevation={0} expanded={expandedItems[index]} onChange={handleAccordionChange(index)} square>
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
                tabs={[{
                  icon: <TableChartOutlined />,
                  value: 0
                }, {
                  icon: <SchemaOutlined />,
                  value: 1
                }]}
                value={tabValues[index]}
                handleChange={onTabsChanged(index)}
              />
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            {tabValues[index] === 0 ? (
              <CustomizedTable data={item} predicates={data} term={term}/>
            ) : (
              <Box display='flex' flexDirection='column'>
                <Button
                  variant='outlined'
                  onClick={(e) => handleClickViewDiagram(e, item)}
                  disableRipple
                  sx={{
                    minWidth: 'auto',
                    alignSelf: 'flex-end'
                  }}>
                  <FullscreenOutlined />
                </Button>
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
      ))}

      <ViewDiagramDialog
        open={openViewDiagram}
        handleClose={handleCloseViewDiagram}
        image={image}
        selectedItem={selectedItem}
        predicates={data}
      />
    </>
  );
};

export default PredicatesAccordion;
