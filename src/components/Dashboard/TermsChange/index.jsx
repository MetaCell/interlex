import { Box } from "@mui/material";
import {useState, useEffect, useCallback} from "react";
import { vars } from "../../../theme/variables";
import BasicTabs from "../../common/CustomTabs";
import CustomPagination from "../../common/CustomPagination";
import List from "./List";
import {getUserForks} from "../../../api/endpoints/swaggerMockMissingEndpoints";
import { debounce } from 'lodash';

const { gray25 } = vars;

const TermsChange = () => {
  const [numberOfVisiblePages, setNumberOfVisiblePages] = useState(8);
  const [page, setPage] = useState(1);
  const [tabValue, setTabValue] = useState(0);
  const [forks, setForks] = useState([])
  const handlePageChange = (event, value) => {
    setPage(value);
  };
  
  const handleChangeTabs = (event, newValue) => {
    setTabValue(newValue);
  };

  const getFilteredEntries = () => {
    switch (tabValue) {
      case 0:
        return forks?.filter(entry => entry.status === "requested");
      case 1:
        return forks?.filter(entry => entry.status === "approved");
      case 2:
        return forks?.filter(entry => entry.status === "rejected");
      default:
        return forks;
    }
  };
  
  const filteredEntries = getFilteredEntries();
  
  const fetchForks = useCallback(
    debounce(async () => {
      getUserForks("123").then(data => {
        setForks(data)
      }).catch(err => {
        console.log(err);
      })
    }, 500),
    [getUserForks]
  );
  
  useEffect(() => {
    fetchForks();
  }, [fetchForks]);
  
  return (
    <Box p='2.5rem 5rem' sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.75rem',
      backgroundColor: gray25
    }}>
      <BasicTabs tabValue={tabValue} handleChange={handleChangeTabs} tabs={["Requests", "Approved", "Rejected"]} />
      <List entries={filteredEntries} />
      <CustomPagination rowCount={filteredEntries?.length} rowsPerPage={numberOfVisiblePages} page={page} onPageChange={handlePageChange} />
    </Box>
  );
};

export default TermsChange;
