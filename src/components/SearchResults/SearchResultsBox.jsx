import { useState, useEffect } from 'react';
import ListView from './ListView';
import PropTypes from 'prop-types';
import { TableChartIcon, ListIcon } from '../../Icons';
import OntologySearch from '../SingleTermView/OntologySearch';
import CustomSingleSelect from '../common/CustomSingleSelect';
import { Box, Typography, Grid, ButtonGroup, Button, Stack, Divider } from '@mui/material';
import CustomPagination from '../common/CustomPagination';
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

const SearchResultsBox = ({
    pageResults,
    searchTerm,
    loading,
    totalItems,
    fetchPage
}) => {
    const [listView, setListView] = useState('list');
    const [page, setPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    useEffect(() => {
        const from = (page - 1) * itemsPerPage;
        const remainingItems = totalItems - from;
        const size = Math.min(itemsPerPage, remainingItems);

        if (size > 0) {
            fetchPage(from, size);
        }
    }, [page, itemsPerPage, totalItems, fetchPage]);

    const handlePageChange = (_, newPage) => {
        setPage(newPage);
    };

    const handleItemsPerPageChange = (value) => {
        const newItemsPerPage = Number(value);
        setItemsPerPage(newItemsPerPage);
        setPage(1)
    };

    const getPaginationOptions = () => {
        const options = [5, 10, 15, 20];
        if (!options.includes(itemsPerPage)) {
            options.push(itemsPerPage);
        }
        return options.sort((a, b) => a - b);
    };

    return (
        <Box width={1} flex={1} display="flex" flexDirection="column" px={4} py={3} gap={3} sx={{ overflowY: 'auto' }}>
            <Grid container justifyContent={{ lg: 'space-between', xs: 'flex-end', md: 'flex-end' }} alignItems="center">
                <Grid item xs={12} lg={6} sm={6}>
                    <Typography variant="h5">
                        {totalItems} results for {searchTerm} search
                    </Typography>
                </Grid>
                <Grid item xs={12} lg={6} sm={6}>
                    <Box display="flex" alignItems="center" gap={2} justifyContent="end">
                        <Stack direction="row" alignItems="center" gap={1}>
                            <Typography variant="caption" sx={{ fontSize: '0.875rem', color: gray600 }}>Show on page:</Typography>
                            <CustomSingleSelect
                                value={itemsPerPage}
                                onChange={handleItemsPerPageChange}
                                options={getPaginationOptions()}
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
                            <OntologySearch />
                        </Stack>
                    </Box>
                </Grid>
            </Grid>

            {listView === 'list' ? (
                <ListView searchResults={pageResults} loading={loading} />
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

CustomViewButton.propTypes = {
    view: PropTypes.string,
    listView: PropTypes.string,
    onClick: PropTypes.func,
    icon: PropTypes.node
};

SearchResultsBox.propTypes = {
    pageResults: PropTypes.object,
    searchTerm: PropTypes.string,
    loading: PropTypes.bool,
    totalItems: PropTypes.number,
    fetchPage: PropTypes.func
};

export default SearchResultsBox;
