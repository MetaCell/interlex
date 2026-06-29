import * as React from 'react';
import PropTypes from 'prop-types';
import {
    Box, Table, TableBody,
    TableCell, TableContainer, TableRow,
    Paper, Chip, Typography, IconButton, Pagination, PaginationItem
} from '@mui/material';
import { Link } from 'react-router-dom';
import CustomTableHead from './CustomTableHead';
import {getComparator, stableSort} from "../../../helpers";
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { ArrowOutwardIcon } from '../../../Icons';

import { vars } from '../../../theme/variables';
const { gray100, gray200, gray600, gray700, gray900 } = vars;

const paperStyle = {
    width: '100%',
    border: `1px solid ${gray200}`,
    boxShadow: '0px 1px 3px 0px rgba(16, 24, 40, 0.10), 0px 1px 2px 0px rgba(16, 24, 40, 0.06)',
    borderRadius: '0.75rem',
};

const descriptionTextStyle = {
    color: gray600,
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    maxWidth: '30rem',
};

const iconButtonStyle = {
    padding: '0.625rem',
    background: 'transparent',
    height: '2.5rem',
    '&:hover': {
        background: gray100
    }
};

const VariantsTable = ({ rows, headCells, group, term }) => {
    const [order, setOrder] = React.useState('asc');
    const [orderBy, setOrderBy] = React.useState('firstSeen');
    const [page, setPage] = React.useState(1);
    const rowsPerPage = 5; // Define how many rows you want to display per page

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const handleRequestSort = (event, property) => {
        setOrder(order === 'asc' ? 'desc' : 'asc')
        setOrderBy(property);
    };

    const sortedRows = React.useMemo(
        () => stableSort(rows, getComparator(order, orderBy)),
        [order, orderBy, rows]
    );

    const displayedRows = React.useMemo(
        () => sortedRows.slice((page - 1) * rowsPerPage, page * rowsPerPage),
        [sortedRows, page, rowsPerPage]
    );

    return (
        <Box sx={{ width: '100%' }}>
            <Paper sx={paperStyle}>
                <TableContainer sx={{ borderRadius: '0.75rem' }}>
                    <Table aria-labelledby="tableTitle">
                        <CustomTableHead
                            order={order}
                            orderBy={orderBy}
                            onRequestSort={handleRequestSort}
                            headCells={headCells}
                        />
                        <TableBody>
                            {displayedRows.map((row) => {
                                return (
                                    <TableRow tabIndex={-1} key={row.id}>
                                        <TableCell>
                                            <Chip color='default' sx={{ maxWidth: '8.125rem' }} label={row.fork} />
                                        </TableCell>
                                        <TableCell sx={descriptionTextStyle}>{row.title}</TableCell>
                                        <TableCell sx={{ color: gray700 }}>{row.firstSeen}</TableCell>
                                        <TableCell sx={{ color: gray700 }}>{row.tripleCount}</TableCell>
                                        <TableCell>
                                            <Typography variant='body2' sx={{ color: gray900, fontFamily: 'monospace' }}>{row.identityRecord}</Typography>
                                        </TableCell>
                                        <TableCell sx={{ width: '3.5rem', whiteSpace: 'nowrap' }}>
                                            <IconButton
                                                sx={iconButtonStyle}
                                                disabled={!row.id}
                                                component={row.id ? Link : 'button'}
                                                to={row.id ? `/${group}/${term}/versions/${row.id}` : undefined}
                                                title="Open this version"
                                            >
                                                <ArrowOutwardIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Pagination
                    count={Math.ceil(rows.length / rowsPerPage)}
                    page={page}
                    onChange={handlePageChange}
                    shape="rounded"
                    renderItem={(item) => (
                        <PaginationItem
                            slots={{
                                previous: () => (
                                    <>
                                        <ChevronLeftIcon />
                                        <Typography variant="label">Previous</Typography>
                                    </>
                                ),
                                next: () => (
                                    <>
                                        <Typography variant="label">
                                            Next
                                        </Typography>
                                        <ChevronRightIcon />
                                    </>
                                ),
                            }}
                            {...item}
                        />
                    )}
                />
            </Paper>
        </Box>
    );
};

VariantsTable.propTypes = {
    rows: PropTypes.array.isRequired,
    headCells: PropTypes.array.isRequired,
    group: PropTypes.string,
    term: PropTypes.string,
};

export default VariantsTable;
