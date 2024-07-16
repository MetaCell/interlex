import { Box } from "@mui/material";
import { useState, useEffect } from "react";
import { vars } from "../../../theme/variables";
import BasicTabs from "../../common/CustomTabs";
import CustomPagination from "../../common/CustomPagination";
import List from "./List";
import versionsParser from "../../../parsers/versionsParser";
import * as mockApi from "../../../api/endpoints/swaggerMockMissingEndpoints";
const useMockApi = () => mockApi;

const { gray25 } = vars;

const entries = [
  { author: "Phoenix Baker", action: "approve", date: "Friday 2:05pm", fork: 'ForkPB08', base: 'Central nervous system', tag: 'Spark Anatomical Working Group' },
  { author: "Phoenix Baker", action: "approve", date: "Friday 2:05pm", fork: 'ForkPB08', base: 'Central nervous system', tag: 'Spark Anatomical Working Group' },
  { author: "Phoenix Baker", action: "reject", date: "Friday 2:05pm", fork: 'ForkPB08', base: 'Central nervous system', tag: 'Spark Anatomical Working Group' },
  { author: "Phoenix Baker", action: "reject", date: "Friday 2:05pm", fork: 'ForkPB08', base: 'Central nervous system', tag: 'Spark Anatomical Working Group' },
  { author: "Phoenix Baker", action: "request", date: "Friday 2:05pm", fork: 'ForkPB08', base: 'Central nervous system', tag: 'Spark Anatomical Working Group' },
  { author: "Phoenix Baker", action: "request", date: "Friday 2:05pm", fork: 'ForkPB08', base: 'Central nervous system', tag: 'Spark Anatomical Working Group' },
];

const TermsChange = () => {
  const [numberOfVisiblePages, setNumberOfVisiblePages] = useState(8);
  const [page, setPage] = useState(1);
  const [tabValue, setTabValue] = useState(0);
  const [versions, setVersions] = useState([]);
  const { getVersions } = useMockApi();
  
  const handlePageChange = (event, value) => {
    setPage(value);
  };
  
  const handleChangeTabs = (event, newValue) => {
    setTabValue(newValue);
  };
  
  useEffect(() => {
    getVersions("base", "ILX_....").then(data => {
      const parsedData = versionsParser(data);
      setVersions(parsedData);
    });
  }, []);
  
  const getFilteredEntries = () => {
    switch (tabValue) {
      case 0:
        return entries.filter(entry => entry.action === "request");
      case 1:
        return entries.filter(entry => entry.action === "approve");
      case 2:
        return entries.filter(entry => entry.action === "reject");
      default:
        return entries;
    }
  };
  
  const filteredEntries = getFilteredEntries();
  
  return (
    <Box p='2.5rem 5rem' sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.75rem',
      backgroundColor: gray25
    }}>
      <BasicTabs tabValue={tabValue} handleChange={handleChangeTabs} tabs={["Requests", "Approved", "Rejected"]} />
      <List entries={filteredEntries} />
      <CustomPagination rowCount={entries?.length} rowsPerPage={numberOfVisiblePages} page={page} onPageChange={handlePageChange} />
    </Box>
  );
};

export default TermsChange;
