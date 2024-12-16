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
import CustomizedTable from "./CustomizedTable";
import ViewDiagramDialog from "./ViewDiagramDialog";
import { useQuery } from "../../../helpers";
import Graph from "../../GraphViewer/Graph";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CallMadeIcon from '@mui/icons-material/CallMade';
import { FullscreenOutlined } from "@mui/icons-material";
import { TableChartIcon, GraphIcon } from "../../../Icons";
import { vars } from "../../../theme/variables";

const { gray600 } = vars;

const PredicatesAccordion = ({ data, comparingData=[], expandAllPredicates, isGraphVisible, statusType }) => {
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

  useEffect(() => {
    const newToggleButtonValues = data?.map(() => "tableView") || [];
    const newExpandedItems = data?.map(() => expandAllPredicates) || [];

    setToggleButtonValues(newToggleButtonValues);
    setExpandedItems(newExpandedItems);
  }, [data, expandAllPredicates]);

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
          expanded={expandedItems[index] ?? false}
          onChange={handleAccordionChange(index)}
          square
          sx={{
            "&.MuiPaper-root": {
              backgroundColor: "transparent"
            }
          }}
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
              {isGraphVisible ? (
                <>
                  <Divider orientation="vertical" flexItem />
                  <ToggleButtonGroup
                    value={toggleButtonValues[index]}
                    exclusive
                    onChange={onToggleButtonChange(index)}
                  >
                    <ToggleButton value={'tableView'}>
                      <TableChartIcon />
                    </ToggleButton>
                    <ToggleButton value={'graphView'}>
                      <GraphIcon />
                    </ToggleButton>
                  </ToggleButtonGroup>
                </>
              ) : <></>}
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            {toggleButtonValues[index] === 'tableView' ? (
              <CustomizedTable data={pred} comparingData={comparingData[index]} term={term} isAddButtonVisible={isGraphVisible} statusType={statusType}/>
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
        openViewDiagram && <ViewDiagramDialog
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
