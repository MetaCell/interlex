import { useCallback, useEffect, useState } from "react";
import {Box, Button, ButtonGroup, CircularProgress, Divider, Grid, Stack, Typography} from "@mui/material";
import ModeEditOutlineOutlinedIcon from "@mui/icons-material/ModeEditOutlineOutlined";
import { vars } from "../../../theme/variables";
import CustomSingleSelect from "../../common/CustomSingleSelect";
import { ListIcon, TableChartIcon } from "../../../Icons";
import CustomPagination from "../../common/CustomPagination";
import termParser from "../../../parsers/termParser";
import { debounce } from 'lodash';
import * as mockApi from "../../../api/endpoints/swaggerMockMissingEndpoints";
import VariantCard from "./VariantCard";
import CustomViewButton from "../../common/CustomViewButton";

const { gray600, gray200 } = vars;
const useMockApi = () => mockApi;
const Variants = ({handleOpenEditBulkTerms}) => {
  const [loading, setLoading] = useState(false);
  const [numberOfVisiblePages, setNumberOfVisiblePages] = useState(8);
  const [listView, setListView] = useState('list');
  const [terms, setTerms] = useState([]);
  const [page, setPage] = useState(1);
  const [slicedTerms, setSlicedTerms] = useState([]);
  const { getMatchTerms } = useMockApi();

  const handleNumberOfPagesChange = (v) => {
    setNumberOfVisiblePages(v);
    setPage(1);
  };
  
  const fetchTerms = useCallback(
    debounce(async (searchTerm) => {
      getMatchTerms("base", searchTerm).then(data => {
        const parsedData = termParser(data, searchTerm);
        setTerms(parsedData.results)
        setPage(1);
        setLoading(false)
      }).catch(err => {
        console.log(err);
        setLoading(false)
      })
    }, 500),
    [getMatchTerms]
  );
  
  useEffect(() => {
    setLoading(true)
    fetchTerms('a');
  }, [fetchTerms]);
  
  useEffect(() => {
    const start = (page - 1) * numberOfVisiblePages;
    const end = start + numberOfVisiblePages;
    setSlicedTerms(terms.slice(start, end));
  }, [terms, page, numberOfVisiblePages]);
  
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
      <Box p='2.5rem 5rem' sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.75rem',
      }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Typography fontSize='1.5rem' color={gray600} fontWeight={600}>
            My term variants
          </Typography>
          <Box display="flex" alignItems="center" gap={2} justifyContent="end">
            <Stack direction="row" alignItems="center" gap={1}>
              <Typography variant="caption" sx={{ fontSize: '0.875rem', color: gray600 }}>Show on page:</Typography>
              <CustomSingleSelect value={numberOfVisiblePages} onChange={handleNumberOfPagesChange} options={['8', '12', '24']} />
            </Stack>
            <ButtonGroup variant="outlined" aria-label="View mode">
              <CustomViewButton
                view="list"
                listView={listView}
                onClick={() => setListView('list')}
                icon={<ListIcon />}
              />
              <CustomViewButton
                view="table"
                listView={listView}
                disabled
                onClick={() => setListView('table')}
                icon={<TableChartIcon />}
              />
            </ButtonGroup>
            <Divider orientation="vertical" flexItem sx={{ borderColor: gray200 }} />
            <Button type="string" color="secondary" startIcon={<ModeEditOutlineOutlinedIcon />} onClick={handleOpenEditBulkTerms}>
              Edit bulk terms
            </Button>
          </Box>
        </Box>
        {loading ? <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </Box> : <Grid container spacing='2.75rem'>
          {
            slicedTerms.map((term, index) => (
              <VariantCard term={term} key={index} />
            ))
          }
        </Grid>}
        <CustomPagination rowCount={terms?.length} rowsPerPage={numberOfVisiblePages} page={page} onPageChange={handlePageChange} />
      </Box>
  );
};

export default Variants;
