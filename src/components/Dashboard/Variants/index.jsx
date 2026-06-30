import PropTypes from "prop-types";
import VariantCard from "./VariantCard";
import { useCallback, useContext, useEffect, useState } from "react";
import { ListIcon, TableChartIcon } from "../../../Icons";
import CustomPagination from "../../common/CustomPagination";
import CustomViewButton from "../../common/CustomViewButton";
import CustomSingleSelect from "../../common/CustomSingleSelect";
import { getOrganizationsTerms } from "../../../api/endpoints/apiService";
import ModeEditOutlineOutlinedIcon from "@mui/icons-material/ModeEditOutlineOutlined";
import {Box, Button, ButtonGroup, CircularProgress, Divider, Grid, Stack, Typography} from "@mui/material";
import { GlobalDataContext } from "../../../contexts/DataContext";

import { vars } from "../../../theme/variables";
const { gray600, gray200 } = vars;

const Variants = ({handleOpenEditBulkTerms}) => {
  const { user } = useContext(GlobalDataContext);
  const groupname = user?.groupname;
  const [loading, setLoading] = useState(false);
  const [numberOfVisiblePages, setNumberOfVisiblePages] = useState(8);
  const [listView, setListView] = useState('list');
  const [terms, setTerms] = useState([]);
  const [page, setPage] = useState(1);
  const [slicedTerms, setSlicedTerms] = useState([]);

  const handleNumberOfPagesChange = (v) => {
    setNumberOfVisiblePages(v);
    setPage(1);
  };

  const fetchTerms = useCallback(async () => {
    if (!groupname) return;
    setLoading(true);
    getOrganizationsTerms(groupname).then(data => {
      const seen = new Set();
      const parsed = (Array.isArray(data) ? data : [])
        .filter(([iri]) => {
          if (seen.has(iri)) return false;
          seen.add(iri);
          return true;
        })
        .map(([iri, label, lastModified]) => {
          const idMatch = iri.match(/((?:tmp|ilx)_\d+)/i);
          const termId = idMatch ? idMatch[1] : iri;
          const status = termId.toLowerCase().startsWith('tmp_') ? 'draft' : 'published';
          return { id: termId, iri, label, lastModified, status };
        });
      setTerms(parsed);
      setPage(1);
      setLoading(false);
    }).catch(err => {
      console.log(err);
      setLoading(false);
    });
  }, [groupname]);

  useEffect(() => {
    fetchTerms();
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

Variants.propTypes = {
  handleOpenEditBulkTerms: PropTypes.func.isRequired
};

export default Variants;
