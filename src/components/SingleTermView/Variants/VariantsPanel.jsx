import * as React from 'react';
import PropTypes from 'prop-types';
import {
    Box, Table, TableBody,
    TableCell, TableContainer, TableHead,
    TableRow, TableSortLabel,
    Paper, Chip, Typography, IconButton, Pagination, PaginationItem
} from '@mui/material';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import ArrowOutwardOutlinedIcon from '@mui/icons-material/ArrowOutwardOutlined';
import DoneIcon from '@mui/icons-material/Done';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

const rows = [
    {
        id: 1, organization: 'Cupcake',
        description: "The central nervous system (CNS) is the part of the nervous system which includes the brain, spinal cord, and nerve cell layer of the retina. In animals with bilateral symmetry, it is a topographic division that is a condensation of the nervous system in the longitudinal plane, lying on or near the median plane. For invertebrates the longitudinal division consists of one or more nerve cords, whereas for vertebrates it consists of a single, hollow, and dorsal cerebrospinal axis.In adult Echinoderms, which are radially symmetrical, a presumptive CNS is formed by a circular cord with associated radial cords. However, there is no ganglion that could be considered as brain in invertebrate When a CNS is present, its obligate companion topographic division is a peripheral nervous system.",
        timestamp: '24 Mar 12:08 AM', status: 'Active', originated_user: 'Olivia Rhye', editing_user: 'Olivia Rhye', originated_user_email: 'olivia@untitledui.com', editing_user_email: 'olivia@untitledui.com'
    },
    {
        id: 2, organization: 'Donut',
        description: "The central nervous system (CNS) is the part of the nervous system which includes the brain, spinal cord, and nerve cell layer of the retina. In animals with bilateral symmetry, it is a topographic division that is a condensation of the nervous system in the longitudinal plane, lying on or near the median plane. For invertebrates the longitudinal division consists of one or more nerve cords, whereas for vertebrates it consists of a single, hollow, and dorsal cerebrospinal axis.In adult Echinoderms, which are radially symmetrical, a presumptive CNS is formed by a circular cord with associated radial cords. However, there is no ganglion that could be considered as brain in invertebrate When a CNS is present, its obligate companion topographic division is a peripheral nervous system.",
        timestamp: '24 Mar 12:08 AM', status: 'Active', originated_user: 'Olivia Rhye', editing_user: 'Olivia Rhye', originated_user_email: 'olivia@untitledui.com', editing_user_email: 'olivia@untitledui.com'
    },
    {
        id: 3, organization: 'Eclair',
        description: "The central nervous system (CNS) is the part of the nervous system which includes the brain, spinal cord, and nerve cell layer of the retina. In animals with bilateral symmetry, it is a topographic division that is a condensation of the nervous system in the longitudinal plane, lying on or near the median plane. For invertebrates the longitudinal division consists of one or more nerve cords, whereas for vertebrates it consists of a single, hollow, and dorsal cerebrospinal axis.In adult Echinoderms, which are radially symmetrical, a presumptive CNS is formed by a circular cord with associated radial cords. However, there is no ganglion that could be considered as brain in invertebrate When a CNS is present, its obligate companion topographic division is a peripheral nervous system.",
        timestamp: '24 Mar 12:08 AM', status: 'Inactive', originated_user: 'Olivia Rhye', editing_user: 'Olivia Rhye', originated_user_email: 'olivia@untitledui.com', editing_user_email: 'olivia@untitledui.com'
    },
    {
        id: 4, organization: 'Frozen yoghurt',
        description: "The central nervous system (CNS) is the part of the nervous system which includes the brain, spinal cord, and nerve cell layer of the retina. In animals with bilateral symmetry, it is a topographic division that is a condensation of the nervous system in the longitudinal plane, lying on or near the median plane. For invertebrates the longitudinal division consists of one or more nerve cords, whereas for vertebrates it consists of a single, hollow, and dorsal cerebrospinal axis.In adult Echinoderms, which are radially symmetrical, a presumptive CNS is formed by a circular cord with associated radial cords. However, there is no ganglion that could be considered as brain in invertebrate When a CNS is present, its obligate companion topographic division is a peripheral nervous system.",
        timestamp: '24 Mar 12:08 AM', status: 'Active', originated_user: 'Olivia Rhye', editing_user: 'Olivia Rhye', originated_user_email: 'olivia@untitledui.com', editing_user_email: 'olivia@untitledui.com'
    },
    {
        id: 5, organization: 'Gingerbread',
        description: "The central nervous system (CNS) is the part of the nervous system which includes the brain, spinal cord, and nerve cell layer of the retina. In animals with bilateral symmetry, it is a topographic division that is a condensation of the nervous system in the longitudinal plane, lying on or near the median plane. For invertebrates the longitudinal division consists of one or more nerve cords, whereas for vertebrates it consists of a single, hollow, and dorsal cerebrospinal axis.In adult Echinoderms, which are radially symmetrical, a presumptive CNS is formed by a circular cord with associated radial cords. However, there is no ganglion that could be considered as brain in invertebrate When a CNS is present, its obligate companion topographic division is a peripheral nervous system.",
        timestamp: '24 Mar 12:08 AM', status: 'Deleted', originated_user: 'Olivia Rhye', editing_user: 'Olivia Rhye', originated_user_email: 'olivia@untitledui.com', editing_user_email: 'olivia@untitledui.com'
    },
    {
        id: 6, organization: 'Honeycomb',
        description: "For invertebrates the longitudinal division consists of one or more nerve cords, whereas for vertebrates it consists of a single, hollow, and dorsal cerebrospinal axis.In adult Echinoderms, which are radially symmetrical, a presumptive CNS is formed by a circular cord with associated radial cords. However, there is no ganglion that could be considered as brain in invertebrate When a CNS is present, its obligate companion topographic division is a peripheral nervous system.",
        timestamp: '24 Mar 12:08 AM', status: 'Active', originated_user: 'Olivia Rhye', editing_user: 'Olivia Rhye', originated_user_email: 'olivia@untitledui.com', editing_user_email: 'olivia@untitledui.com'
    },
    {
        id: 7, organization: 'Ice cream sandwich',
        description: "For invertebrates the longitudinal division consists of one or more nerve cords, whereas for vertebrates it consists of a single, hollow, and dorsal cerebrospinal axis.In adult Echinoderms, which are radially symmetrical, a presumptive CNS is formed by a circular cord with associated radial cords. However, there is no ganglion that could be considered as brain in invertebrate When a CNS is present, its obligate companion topographic division is a peripheral nervous system.",
        timestamp: '24 Mar 12:08 AM', status: 'Active', originated_user: 'Olivia Rhye', editing_user: 'Olivia Rhye', originated_user_email: 'olivia@untitledui.com', editing_user_email: 'olivia@untitledui.com'
    },
    {
        id: 8, organization: 'Jelly Bean',
        description: "For invertebrates the longitudinal division consists of one or more nerve cords, whereas for vertebrates it consists of a single, hollow, and dorsal cerebrospinal axis.In adult Echinoderms, which are radially symmetrical, a presumptive CNS is formed by a circular cord with associated radial cords. However, there is no ganglion that could be considered as brain in invertebrate When a CNS is present, its obligate companion topographic division is a peripheral nervous system.",
        timestamp: '24 Mar 12:08 AM', status: 'Active', originated_user: 'Olivia Rhye', editing_user: 'Olivia Rhye', originated_user_email: 'olivia@untitledui.com', editing_user_email: 'olivia@untitledui.com'
    },
    {
        id: 9, organization: 'KitKat',
        description: "For invertebrates the longitudinal division consists of one or more nerve cords, whereas for vertebrates it consists of a single, hollow, and dorsal cerebrospinal axis.In adult Echinoderms, which are radially symmetrical, a presumptive CNS is formed by a circular cord with associated radial cords. However, there is no ganglion that could be considered as brain in invertebrate When a CNS is present, its obligate companion topographic division is a peripheral nervous system.",
        timestamp: '24 Mar 12:08 AM', status: 'Active', originated_user: 'Olivia Rhye', editing_user: 'Olivia Rhye', originated_user_email: 'olivia@untitledui.com', editing_user_email: 'olivia@untitledui.com'
    },
    {
        id: 10, organization: 'Lollipop',
        description: "For invertebrates the longitudinal division consists of one or more nerve cords, whereas for vertebrates it consists of a single, hollow, and dorsal cerebrospinal axis.In adult Echinoderms, which are radially symmetrical, a presumptive CNS is formed by a circular cord with associated radial cords. However, there is no ganglion that could be considered as brain in invertebrate When a CNS is present, its obligate companion topographic division is a peripheral nervous system.",
        timestamp: '24 Mar 12:08 AM', status: 'Active', originated_user: 'Olivia Rhye', editing_user: 'Olivia Rhye', originated_user_email: 'olivia@untitledui.com', editing_user_email: 'olivia@untitledui.com'
    },
    {
        id: 11, organization: 'Marshmallow',
        description: "For invertebrates the longitudinal division consists of one or more nerve cords, whereas for vertebrates it consists of a single, hollow, and dorsal cerebrospinal axis.In adult Echinoderms, which are radially symmetrical, a presumptive CNS is formed by a circular cord with associated radial cords. However, there is no ganglion that could be considered as brain in invertebrate When a CNS is present, its obligate companion topographic division is a peripheral nervous system.",
        timestamp: '24 Mar 12:08 AM', status: 'Active', originated_user: 'Olivia Rhye', editing_user: 'Olivia Rhye', originated_user_email: 'olivia@untitledui.com', editing_user_email: 'olivia@untitledui.com'
    }
];

function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

function getComparator(order, orderBy) {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

// stableSort brings sort stability to non-modern browsers
function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) {
            return order;
        }
        return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
}

const headCells = [
    { id: 'organization', label: 'Organization' },
    { id: 'description', label: 'Description' },
    { id: 'timestamp', label: 'Timestamp' },
    { id: 'status', label: 'Status' },
    { id: 'originated_user', label: 'Originated User' },
    { id: 'editing_user', label: 'Editing User' },
    { id: 'action_buttons', label: '' }
];

const paperStyle = {
    width: '100%',
    border: '1px solid #EAECF0',
    boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05)',
    borderRadius: '0.75rem'
};

const descriptionTextStyle = {
    color: '#515252',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    maxWidth: '700px'
};

const iconButtonStyle = {
    padding: '10px',
    background: 'transparent',
    height: '40px',
    '&:hover': {
        background: '#E4E7E7'
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

function EnhancedTableHead(props) {
    const { order, orderBy, onRequestSort } = props;
    const createSortHandler = (property) => (event) => {
        onRequestSort(event, property);
    };

    return (
        <TableHead>
            <TableRow>
                {headCells.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align='left'
                        sortDirection={orderBy === headCell.id ? order : false}
                        sx={{
                            padding: '12px 24px',
                            background: '#F0F2F2',
                            lineHeight: '1.25rem',
                            borderBottom: '1px solid #DADDDC'
                        }}
                    >
                        <TableSortLabel
                            active={orderBy === headCell.id}
                            direction={orderBy === headCell.id ? order : 'asc'}
                            onClick={createSortHandler(headCell.id)}
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '0.75rem',
                                color: '#515252',
                                '&.Mui-active': {
                                    color: '#515252'
                                },
                                '& .MuiSvgIcon-root': {
                                    width: '1rem',
                                    height: '1rem',
                                    fill: '#515252',
                                    opacity: headCell.label === '' ? 0 : 1
                                },
                                '&:hover': {
                                    color: '#313534',
                                    '& .MuiSvgIcon-root': {
                                        fill: '#313534',
                                        opacity: 1
                                    }
                                }
                            }}
                        >
                            {headCell.label}
                        </TableSortLabel>
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}

EnhancedTableHead.propTypes = {
    onRequestSort: PropTypes.func.isRequired,
    order: PropTypes.oneOf(['asc', 'desc']).isRequired,
    orderBy: PropTypes.string.isRequired,
};

function EnhancedTable() {
    const [order, setOrder] = React.useState('asc');
    const [orderBy, setOrderBy] = React.useState('organization');
    const [page, setPage] = React.useState(1);
    const rowsPerPage = 5; // Define how many rows you want to display per page

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
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
                        <EnhancedTableHead
                            order={order}
                            orderBy={orderBy}
                            onRequestSort={handleRequestSort}
                        />
                        <TableBody>
                            {displayedRows.map((row) => {
                                return (
                                    <TableRow tabIndex={-1} key={row.id}
                                        sx={{
                                            '& .MuiTableCell-root': {
                                                padding: '1rem 1.5rem',
                                                height: '4.5rem',
                                                borderBottom: `1px solid #DADDDC`
                                            }
                                        }}
                                    >
                                        <TableCell align="left" sx={{ color: '#313534', minWidth: '176px' }}>{row.organization}</TableCell>
                                        <TableCell align="left" sx={descriptionTextStyle}>{row.description}</TableCell>
                                        <TableCell align="left"><Chip color='default' label={row.timestamp} /></TableCell>
                                        <TableCell align="left">
                                            <Chip
                                                color={getChipColor(row.status)}
                                                icon={getChipIcon(row.status)}
                                                label={row.status}
                                            />
                                        </TableCell>
                                        <TableCell align="left">
                                            <Typography variant='body2' sx={{ color: '#111212' }}>{row.originated_user}</Typography>
                                            <Typography variant='body2' sx={{ color: '#515252' }}>{row.originated_user_email}</Typography>
                                        </TableCell>
                                        <TableCell align="left">
                                            <Typography variant='body2' sx={{ color: '#111212' }}>{row.editing_user}</Typography>
                                            <Typography variant='body2' sx={{ color: '#515252' }}>{row.editing_user_email}</Typography>
                                        </TableCell>
                                        <TableCell align='left'>
                                            <Box display="flex" gap={0.5}>
                                                <IconButton sx={iconButtonStyle}><DownloadOutlinedIcon /></IconButton>
                                                <IconButton sx={iconButtonStyle}>
                                                    <ArrowOutwardOutlinedIcon />
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
}

const VariantsPanel = () => {
    return (
        <Box width={1}>
            <EnhancedTable />
        </Box>
    )
}
export default VariantsPanel;
