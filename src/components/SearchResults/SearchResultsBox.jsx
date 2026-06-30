import { useState, useEffect, useMemo, useContext } from 'react';
import ListView from './ListView';
import PropTypes from 'prop-types';
import { TableChartIcon, ListIcon } from '../../Icons';
import OntologySearch from '../SingleTermView/OntologySearch';
import CustomSingleSelect from '../common/CustomSingleSelect';
import CustomViewButton from '../common/CustomViewButton';
import { Box, Typography, Grid, ButtonGroup, Stack, Divider, CircularProgress } from '@mui/material';
import CustomPagination from '../common/CustomPagination';
import { vars } from '../../theme/variables';
import { GlobalDataContext } from '../../contexts/DataContext';

const { gray200, gray600 } = vars;



const getPaginationSettings = (totalItems) => {
    const largeDatasetOptions = [20, 50, 100, 200];
    const smallDatasetOptions = [10, 20, 50, 100];

    const options = totalItems >= 200
        ? largeDatasetOptions.filter(opt => opt <= totalItems)
        : smallDatasetOptions.filter(opt => opt <= totalItems);

    if (options.length === 0) {
        return {
            options: [totalItems],
            defaultSize: totalItems
        };
    }

    let defaultSize;
    if (totalItems >= 1000) defaultSize = 100;
    else if (totalItems >= 500) defaultSize = 100;
    else if (totalItems >= 200) defaultSize = 50;
    else if (totalItems >= 100) defaultSize = 50;
    else if (totalItems >= 50) defaultSize = 20;
    else defaultSize = 10;

    if (!options.includes(defaultSize)) {
        defaultSize = options[Math.floor(options.length / 2)];
    }

    return { options, defaultSize };
};

const SearchResultsBox = ({
    pageResults,
    searchTerm,
    loading,
    totalItems,
    fetchPage,
    hasActiveFilters
}) => {
    const { options, defaultSize } = getPaginationSettings(totalItems);
    const [listView, setListView] = useState('list');
    const [page, setPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(defaultSize);
    const { user } = useContext(GlobalDataContext);

    useEffect(() => {
        if (!hasActiveFilters) {
            const from = (page - 1) * itemsPerPage;
            const remainingItems = totalItems - from;
            const size = Math.min(itemsPerPage, remainingItems);

            if (size > 0) {
                fetchPage(from, size);
            }
        }
    }, [page, itemsPerPage, totalItems, fetchPage, hasActiveFilters]);

    useEffect(() => {
        const { defaultSize: newDefault } = getPaginationSettings(totalItems);
        setItemsPerPage(newDefault);
        setPage(1);
    }, [totalItems]);

    const paginatedResults = useMemo(() => {
        if (!hasActiveFilters) return pageResults;

        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return pageResults.slice(startIndex, endIndex);
    }, [pageResults, page, itemsPerPage, hasActiveFilters]);

    const handlePageChange = (_, newPage) => {
        setPage(newPage);
    };

    const handleItemsPerPageChange = (value) => {
        const newItemsPerPage = Number(value);
        setItemsPerPage(newItemsPerPage);
        setPage(1)
    };

    return (
        <Box width={1} flex={1} display="flex" flexDirection="column" px={4} py={3} gap={3} sx={{ overflowY: 'auto' }}>
            <Grid container justifyContent={{ lg: 'space-between', xs: 'flex-end', md: 'flex-end' }} alignItems="center">
                <Grid item xs={12} lg={6} sm={6}>
                    <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {loading ? (
                            <CircularProgress size={20} />
                        ) : (
                            `${totalItems} results for ${searchTerm} search`
                        )}
                    </Typography>
                </Grid>
                <Grid item xs={12} lg={6} sm={6}>
                    <Box display="flex" alignItems="center" gap={2} justifyContent="end">
                        <Stack direction="row" alignItems="center" gap={1}>
                            <Typography variant="caption" sx={{ fontSize: '0.875rem', color: gray600 }}>Show on page:</Typography>
                            <CustomSingleSelect
                                value={itemsPerPage}
                                onChange={handleItemsPerPageChange}
                                options={options}
                            />
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
                            <OntologySearch userGroupname={user?.groupname} />
                        </Stack>
                    </Box>
                </Grid>
            </Grid>

            {listView === 'list' ? (
                <ListView searchResults={paginatedResults} loading={loading} />
            ) : (
                <p>table</p>
            )}

            <CustomPagination
                rowCount={totalItems}
                rowsPerPage={itemsPerPage}
                page={page}
                onPageChange={handlePageChange}
            />
        </Box>
    );
};

SearchResultsBox.propTypes = {
    pageResults: PropTypes.object,
    searchTerm: PropTypes.string,
    loading: PropTypes.bool,
    totalItems: PropTypes.number,
    fetchPage: PropTypes.func,
    hasActiveFilters: PropTypes.bool
};

export default SearchResultsBox;
