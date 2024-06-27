import * as React from 'react';
import {
    Box, Table, TableBody,
    TableCell, TableContainer, TableRow,
    Paper, Chip, Typography, IconButton, Pagination, PaginationItem
} from '@mui/material';
import CustomTableHead from './CustomTableHead';
import { ArrowOutwardIcon, DownloadIcon } from '../../../Icons';
import DoneIcon from '@mui/icons-material/Done';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { vars } from '../../../theme/variables';
import {getComparator, stableSort} from "../../../helpers";

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

const getChipColor = (status) => ({
    Active: 'success',
    Inactive: 'default',
    Deleted: 'error'
}[status]);

const getChipIcon = (status) => ({
    Active: <DoneIcon />,
    Inactive: <CloseOutlinedIcon />,
    Deleted: <DeleteOutlineOutlinedIcon />
}[status]);


const VariantsTable = ({ rows, headCells }) => {
    const [order, setOrder] = React.useState('asc');
    const [orderBy, setOrderBy] = React.useState('organization');
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
        [order, orderBy]
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
                                        <TableCell sx={{ color: gray700}}>{row.organization}</TableCell>
                                        <TableCell sx={descriptionTextStyle}>{row.description}</TableCell>
                                        <TableCell><Chip color='default' sx={{ maxWidth: '8.125rem' }} label={row.timestamp} /></TableCell>
                                        <TableCell>
                                            <Chip
                                                color={getChipColor(row.status)}
                                                icon={getChipIcon(row.status)}
                                                label={row.status}
                                                sx={{ maxWidth: '5rem' }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant='body2' sx={{ color: gray900 }}>{row.originated_user}</Typography>
                                            <Typography variant='body2' sx={{ color: gray600 }}>{row.originated_user_email}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant='body2' sx={{ color: gray900 }}>{row.editing_user}</Typography>
                                            <Typography variant='body2' sx={{ color: gray600 }}>{row.editing_user_email}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Box display="flex" gap={0.5} justifyContent="flex-end">
                                                <IconButton sx={iconButtonStyle} onClick={() => console.log("Import")}><DownloadIcon /></IconButton>
                                                <IconButton sx={iconButtonStyle} onClick={() => console.log("Go")}>
                                                    <ArrowOutwardIcon />
                                                </IconButton>
                                            </Box>
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

export default VariantsTable;