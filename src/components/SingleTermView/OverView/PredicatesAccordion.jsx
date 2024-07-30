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
import { FullscreenOutlined } from "@mui/icons-material";
import CustomizedTable from "./CustomizedTable";
import ViewDiagramDialog from "./ViewDiagramDialog";
import { useQuery } from "../../../helpers";
import Graph from "../../GraphViewer/Graph";
import {ToggleButton, ToggleButtonGroup} from "@mui/lab";
import ExpandIcon from "@mui/icons-material/Expand";
import RemoveIcon from "@mui/icons-material/Remove";

const { gray600 } = vars;

const PredicatesAccordion = ({ data, expandAllPredicates }) => {
  const [toggleButtonValues, setToggleButtonValues] = useState(data?.map(() => 'tableView') || []);
  const [openViewDiagram, setOpenViewDiagram] = React.useState(false);
  const [selectedItem, setSelectedItem] = useState(null)
  const [expandedItems, setExpandedItems] = useState(data?.map(() => false) || []);
  const query = useQuery();
  const term = query.get('searchTerm');

  const imgStyle = { width: '100%' };
  const imgPath = '/success.png';
  const onToggleButtonChange = (index) => (event, newValue) => {
    if (newValue) {
      event.preventDefault();
      event.stopPropagation();
      const newTabValues = [...toggleButtonValues];
      newTabValues[index] = newValue;
      setToggleButtonValues(newTabValues);
    }
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
    setToggleButtonValues(data?.map(() => 'tableView'))
    setExpandedItems(data.map(() => false));
  }, [data])

  React.useEffect(() => {
    if (expandAllPredicates) {
      setExpandedItems(data.map(() => true));
    } else {
      setExpandedItems(data.map(() => false));
    }
  }, [expandAllPredicates, data])

  const image = new Image();
  image.onload = () => <img style={imgStyle} src={imgPath} alt="preview" />
  image.src = imgPath;

  return (
    <>
      {data.map((pred, index) => (
        <Accordion
          key={`${index}-${expandAllPredicates}`}
          disableGutters
          elevation={0}
          expanded={expandedItems[index]}
          onChange={handleAccordionChange(index)}
          square
        >
        <AccordionSummary
            expandIcon={<ExpandMoreIcon fontSize='medium' />}
            aria-controls={`panel${index + 1}-content`}
            id={`panel${index + 1}-header`}
          >
            <Stack direction='row' spacing='.25rem'>
              <Typography>
                {pred.title}
              </Typography>
              <CallMadeIcon fontSize='medium' />
            </Stack>
            <Stack direction='row' alignItems='center' spacing='.75rem'>
              <Typography color={gray600} fontSize='.875rem'>
                Number of this type: {pred?.count}
              </Typography>
              <Divider orientation="vertical" flexItem />
              <ToggleButtonGroup
                value={toggleButtonValues[index]}
                exclusive
                onChange={onToggleButtonChange(index)}
              >
                <ToggleButton value={'tableView'}>
                  <ExpandIcon />
                </ToggleButton>
                <ToggleButton value={'graphView'}>
                  <RemoveIcon />
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            {toggleButtonValues[index] === 'tableView' ? (
              <CustomizedTable data={pred} term={term} />
            ) : (
              <Box display='flex' flexDirection='column'>
                <Graph width={600} height={300} predicate={pred} />
                <Button
                  variant='outlined'
                  onClick={(e) => handleClickViewDiagram(e, pred)}
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
      {
        openViewDiagram &&  <ViewDiagramDialog
          open={openViewDiagram}
          handleClose={handleCloseViewDiagram}
          image={image}
          selectedItem={selectedItem}
          predicates={data}
        />
      }
     
    </>
  );
};

export default PredicatesAccordion;
