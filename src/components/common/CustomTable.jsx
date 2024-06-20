import * as React from 'react';
import {
    Box, Table, TableBody, TableContainer, Paper
} from '@mui/material';
import CustomTableHead from './CustomTableHead';
import CustomPagination from './CustomPagination';
import { vars } from '../../theme/variables';

const { gray200 } = vars;

const paperStyle = {
    width: '100%',
    border: `1px solid ${gray200}`,
    boxShadow: '0px 1px 3px 0px rgba(16, 24, 40, 0.10), 0px 1px 2px 0px rgba(16, 24, 40, 0.06)',
    borderRadius: '0.75rem'
};


const CustomTable = (props) => {
    const {rows, order, orderBy, setOrder, setOrderBy, 
        headCells, isCheckboxPresent, selected, handleSelectAllClick, rowsPerPage, page, handlePageChange, children} = props;

    const handleRequestSort = (event, property) => {
        setOrder(order === 'asc' ? 'desc' : 'asc')
        setOrderBy(property);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Paper sx={paperStyle}>
                <TableContainer sx={{ borderRadius: '0.75rem' }}>
                    <Table aria-labelledby="tableTitle">
                        <CustomTableHead
                            numSelected={selected.length}
                            order={order}
                            orderBy={orderBy}
                            onSelectAllClick={handleSelectAllClick}
                            onRequestSort={handleRequestSort}
                            headCells={headCells}
                            rowCount={rows.length}
                            isCheckboxPresent={isCheckboxPresent}
                        />
                        <TableBody>
                            {children}
                        </TableBody>
                    </Table>
                </TableContainer>
                <CustomPagination rowCount={rows.length} rowsPerPage={rowsPerPage} page={page} onPageChange={handlePageChange} />
            </Paper>
        </Box>
    );
};

export default CustomTable;