import OntologyCard from "./OntologyCard";
import { useCallback, useContext, useEffect, useState } from "react";
import { ListIcon, TableChartIcon } from "../../../Icons";
import CustomPagination from "../../common/CustomPagination";
import CustomViewButton from "../../common/CustomViewButton";
import CustomSingleSelect from "../../common/CustomSingleSelect";
import MessageDialog from "../../common/MessageDialog";
import { getOrganizationsOntologies } from "../../../api/endpoints/apiService";
import {Box, ButtonGroup, CircularProgress, Grid, Stack, Typography} from "@mui/material";
import { GlobalDataContext } from "../../../contexts/DataContext";
import { useNavigate } from "react-router-dom";
import { ontologyEntryForSpecUri, ontologyPath } from "../../CellCards/config/gridConfig";

import { vars } from "../../../theme/variables";
const { gray600 } = vars;

const UNROUTABLE_ONTOLOGY_MESSAGE = "This ontology is kept under a nested path the ontology viewer cannot open yet.";

const Ontologies = () => {
  const navigate = useNavigate();
  const { user } = useContext(GlobalDataContext);
  const groupname = user?.groupname;
  const [loading, setLoading] = useState(false);
  const [numberOfVisiblePages, setNumberOfVisiblePages] = useState(8);
  const [listView, setListView] = useState('list');
  const [ontologies, setOntologies] = useState([]);
  const [page, setPage] = useState(1);
  const [slicedOntologies, setSlicedOntologies] = useState([]);
  const [message, setMessage] = useState('');

  const handleNumberOfPagesChange = (v) => {
    setNumberOfVisiblePages(v);
    setPage(1);
  };

  const fetchOntologies = useCallback(async () => {
    if (!groupname) return;
    setLoading(true);
    getOrganizationsOntologies(groupname).then(data => {
      // Same transform as OntologySearch: derive a readable label, fall back to
      // an identifier parsed from the spec URI when there's no title.
      const parsed = (Array.isArray(data) ? data : []).map((ontology, index) => {
        let fallbackLabel = `Unknown Ontology ${ontology.id || index + 1}`;
        if (ontology.uri) {
          const uriParts = ontology.uri.split('/');
          const specIndex = uriParts.findIndex(part => part === 'spec');
          if (specIndex > 0) {
            fallbackLabel = `Ontology ${uriParts[specIndex - 1]}`;
          }
        }
        return {
          label: ontology.title || fallbackLabel,
          badge: groupname,
          id: ontology.id || `ontology-${index}`,
          description: ontology.uri,
          url: ontology.url,
        };
      });
      setOntologies(parsed);
      setPage(1);
      setLoading(false);
    }).catch(err => {
      console.log(err);
      setLoading(false);
    });
  }, [groupname]);

  useEffect(() => {
    fetchOntologies();
  }, [fetchOntologies]);

  useEffect(() => {
    const start = (page - 1) * numberOfVisiblePages;
    const end = start + numberOfVisiblePages;
    setSlicedOntologies(ontologies.slice(start, end));
  }, [ontologies, page, numberOfVisiblePages]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleSelectOntology = (ontology) => {
    const entry = ontologyEntryForSpecUri(ontology.description);
    if (entry) {
      navigate(ontologyPath(entry));
    } else {
      setMessage(UNROUTABLE_ONTOLOGY_MESSAGE);
    }
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
            My ontologies
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
          </Box>
        </Box>
        {loading ? <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </Box> : <Grid container spacing='2.75rem'>
          {
            slicedOntologies.map((ontology, index) => (
              <OntologyCard ontology={ontology} onSelect={handleSelectOntology} key={index} />
            ))
          }
        </Grid>}
        <CustomPagination rowCount={ontologies?.length} rowsPerPage={numberOfVisiblePages} page={page} onPageChange={handlePageChange} />
        {message && <MessageDialog title="Ontology viewer" open={!!message} handleClose={() => setMessage('')} message={message} />}
      </Box>
  );
};

export default Ontologies;
