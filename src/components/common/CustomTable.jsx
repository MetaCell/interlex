import * as React from 'react';
import {
    Box, Table, TableBody, TableContainer, Paper
} from '@mui/material';
import CustomTableHead from './CustomTableHead';
import { vars } from '../../theme/variables';

const { gray200 } = vars;

const paperStyle = {
    width: '100%',
    border: `1px solid ${gray200}`,
    boxShadow: '0px 1px 3px 0px rgba(16, 24, 40, 0.10), 0px 1px 2px 0px rgba(16, 24, 40, 0.06)',
    borderRadius: '0.75rem'
};


const CustomTable = (props) => {
    const {order, orderBy, setOrder, setOrderBy, headCells, children} = props;

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
                            order={order}
                            orderBy={orderBy}
                            onRequestSort={handleRequestSort}
                            headCells={headCells}
                        />
                        <TableBody>
                            {children}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
};

export default CustomTable;