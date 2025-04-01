import React from 'react';
import ListView from './ListView';
import PropTypes from 'prop-types';
import { TableChartIcon, ListIcon } from '../../Icons';
import OntologySearch from '../SingleTermView/OntologySearch';
import CustomSingleSelect from "../common/CustomSingleSelect";
import { Box, Typography, Grid, ButtonGroup, Button, Stack, Divider } from '@mui/material';

import { vars } from '../../theme/variables';
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

const SearchResultsBox = ({ terms, searchTerm, loading }) => {
    const [numberOfVisiblePages, setNumberOfVisiblePages] = React.useState(20);
    const [listView, setListView] = React.useState('list');

    const handleNumberOfPagesChange = (v) => {
        setNumberOfVisiblePages(v);
    };

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
                <ListView searchResults={terms} loading={loading} />
            ) : (
                <p>table</p>
            )}
        </Box>
    );
};

CustomViewButton.propTypes = {
    view: PropTypes.string,
    listView: PropTypes.string,
    onClick: PropTypes.func,
    icon: PropTypes.node
};

SearchResultsBox.propTypes = {
    terms: PropTypes.object,
    searchTerm: PropTypes.string,
    loading: PropTypes.bool
};

export default SearchResultsBox;
