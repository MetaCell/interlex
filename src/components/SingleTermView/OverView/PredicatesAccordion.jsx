import React, { useState, useEffect } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Divider,
  Stack,
  Typography,
  Box, Button,
  ToggleButtonGroup,
  ToggleButton
} from "@mui/material";
import PropTypes from "prop-types";
import Graph from "../../GraphViewer/Graph";
import CustomizedTable from "./CustomizedTable";
import ViewDiagramDialog from "./ViewDiagramDialog";
import CallMadeIcon from '@mui/icons-material/CallMade';
import { FullscreenOutlined } from "@mui/icons-material";
import { TableChartIcon, GraphIcon } from "../../../Icons";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { vars } from "../../../theme/variables";
const { gray600 } = vars;
const TABLE_VIEW = 'tableView';
const GRAPH_VIEW = 'graphView';

const PredicatesAccordion = ({ data, expandAllPredicates, isGraphVisible, focusId, group, onMutate }) => {
  const [toggleButtonValues, setToggleButtonValues] = useState(data?.map(() => TABLE_VIEW) || []);
  const [openViewDiagram, setOpenViewDiagram] = React.useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [expandedItems, setExpandedItems] = useState(data?.map(() => false) || []);

  const onToggleButtonChange = (index) => (event, newValue) => {
    if (newValue) {
      event.preventDefault();
      event.stopPropagation();
      const newTabValues = [...toggleButtonValues];
      newTabValues[index] = newValue;
      setToggleButtonValues(newTabValues);
    }
  };

  const handleClickViewDiagram = (_e, item) => {
    setSelectedItem(item);
    setOpenViewDiagram(true);
  };
  const handleCloseViewDiagram = () => setOpenViewDiagram(false);

  const handleAccordionChange = (index) => (_event, isExpanded) => {
    const newExpandedItems = [...expandedItems];
    newExpandedItems[index] = isExpanded;
    setExpandedItems(newExpandedItems);
  };

  useEffect(() => {
    const newToggleButtonValues = data?.map((d) => (d.forceGraph ? GRAPH_VIEW : TABLE_VIEW)) || [];
    const newExpandedItems = data?.map(() => expandAllPredicates) || [];
    setToggleButtonValues(newToggleButtonValues);
    setExpandedItems(newExpandedItems);
  }, [data, expandAllPredicates]);

  // lightweight image for the dialog (existing behavior)
  const imgStyle = { width: '100%' };
  const imgPath = '/success.png';
  const image = new Image();
  image.onload = () => <img style={imgStyle} src={imgPath} alt="preview" />;
  image.src = imgPath;

  return (
    <>
      {data.map((pred, index) => (
        <Accordion
          key={`${index}-${expandAllPredicates}`}
          disableGutters
          elevation={0}
          expanded={expandedItems[index] ?? false}
          onChange={handleAccordionChange(index)}
          square
          sx={{ "&.MuiPaper-root": { backgroundColor: "transparent" } }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon fontSize='medium' />}
            aria-controls={`panel${index + 1}-content`}
            id={`panel${index + 1}-header`}
          >
            <Stack direction='row' spacing='.25rem'>
              <Typography>{pred.title}</Typography>
              <CallMadeIcon fontSize='medium' />
            </Stack>
            <Stack direction='row' alignItems='center' spacing='.75rem'>
              <Typography color={gray600} fontSize='.875rem'>
                Number of this type: {pred?.count}
              </Typography>
              {isGraphVisible ? (
                <>
                  <Divider orientation="vertical" flexItem />
                  <ToggleButtonGroup
                    value={toggleButtonValues[index]}
                    exclusive
                    onChange={onToggleButtonChange(index)}
                  >
                    <ToggleButton value={TABLE_VIEW}>
                      <TableChartIcon />
                    </ToggleButton>
                    <ToggleButton value={GRAPH_VIEW}>
                      <GraphIcon />
                    </ToggleButton>
                  </ToggleButtonGroup>
                </>
              ) : null}
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            {toggleButtonValues[index] === TABLE_VIEW ? (
              <CustomizedTable
                data={pred}           // expects object with rows/values
                focusId={focusId}
                group={group}
                onMutate={onMutate}
              />
            ) : (
              <Box display='flex' flexDirection='column'>
                <Graph width={800} height={400} predicate={pred} />
                <Button
                  variant='outlined'
                  onClick={(e) => handleClickViewDiagram(e, pred)}
                  disableRipple
                  sx={{ minWidth: 'auto', alignSelf: 'flex-end' }}
                >
                  <FullscreenOutlined />
                </Button>
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
      ))}
      {openViewDiagram && (
        <ViewDiagramDialog
          open={openViewDiagram}
          handleClose={handleCloseViewDiagram}
          image={image}
          selectedItem={selectedItem}
          predicates={data}
        />
      )}
    </>
  );
};

PredicatesAccordion.propTypes = {
  data: PropTypes.array.isRequired,
  expandAllPredicates: PropTypes.bool,
  isGraphVisible: PropTypes.bool,
  focusId: PropTypes.string,
  group: PropTypes.string,
  onMutate: PropTypes.func
};

export default PredicatesAccordion;
