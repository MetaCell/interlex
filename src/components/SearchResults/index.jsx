import React, {useEffect, useRef, useState} from 'react';
import { Box, Typography, Grid, ButtonGroup, Button, Stack, Divider } from '@mui/material';
import { TableChartIcon, ListIcon } from '../../Icons';
import ListView from './ListView';
import OntologySearch from '../SingleTermView/OntologySearch';
import { vars } from '../../theme/variables';
import { termParser } from "../../parsers/termParser";
import * as mockApi from './../../api/endpoints/swaggerMockMissingEndpoints';
import {useQuery} from "../../helpers";
import { debounce } from 'lodash';
import CustomSingleSelect from "../common/CustomSingleSelect";

const { gray50, gray200, gray300, gray600 } = vars;
const CustomViewButton = ({ view, listView, onClick, icon }) => (
    <Button
        sx={{
            background: listView === view ? gray50 : 'transparent',
            padding: '0.5rem 0.75rem',
            border: `1px solid ${gray300}`,
            '&.Mui-disabled': {
                border: `1px solid ${gray300}` 
            },
            '& svg path': {
                fill: listView !== view ? gray300 : 'currentColor'
            }
        }}
        disabled={view === 'table' && true}
        onClick={onClick}
    >
        {icon}
    </Button>
);
const useMockApi = () => mockApi;

const SearchResultsBox = () => {
    const [numberOfVisiblePages, setNumberOfVisiblePages] = React.useState(20);
    const [listView, setListView] = React.useState('list');
    const [loading, setLoading] = useState(false)
    const query = useQuery();
    const searchTerm = query.get('searchTerm');
    const {  getMatchTerms } = useMockApi();

    const [terms, setTerms] = React.useState({});

    const handleNumberOfPagesChange = (v) => {
        setNumberOfVisiblePages(v);
    };
  
  const fetchTerms = useRef(
    debounce((searchTerm) => {
      setLoading(true);
      getMatchTerms(searchTerm, searchTerm)
        .then((data) => {
          const parsedData = termParser(data, searchTerm);
          setTerms(parsedData);
          setLoading(false);
        })
        .catch((error) => {
          setLoading(false);
        });
    }, 500)
  ).current;
  
  useEffect(() => {
    fetchTerms(searchTerm);
  }, [searchTerm, fetchTerms]);
  
  return (
        <Box width={1} flex={1} display="flex" flexDirection="column" px={4} py={3} gap={3} sx={{ overflowY: 'auto' }}>
            <Grid container justifyContent={{ lg: 'space-between', xs: 'flex-end', md: 'flex-end' }} alignItems="center">
                <Grid item xs={12} lg={6} sm={6}>
                    <Typography variant="h5">{terms?.results?.length} results for {searchTerm} search</Typography>
                </Grid>
                <Grid item xs={12} lg={6} sm={6}>
                    <Box display="flex" alignItems="center" gap={2} justifyContent="end">
                        <Stack direction="row" alignItems="center" gap={1}>
                            <Typography variant="caption" sx={{ fontSize: '0.875rem', color: gray600 }}>Show on page:</Typography>
                            <CustomSingleSelect value={numberOfVisiblePages} onChange={handleNumberOfPagesChange} options={['10', '20', '30']} />
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
                        <Stack direction="row" alignItems="center" gap={1}>
                            <Typography variant="caption" sx={{ fontSize: '0.875rem', color: gray600 }}>Active Ontology:</Typography>
                            <OntologySearch />
                        </Stack>
                    </Box>
                </Grid>
            </Grid>
            {listView === 'list' ? (
                <ListView searchResults={terms?.results} loading={loading}/>
            ) : (
                <p>table</p>
            )}
        </Box>
    );
};

export default SearchResultsBox;