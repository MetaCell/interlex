import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Grid, MenuItem, Select, Stack, FormControl, TableRow, TableCell, Chip } from "@mui/material";
import CustomTable from "../common/CustomTable";
import Checkbox from "../common/CustomCheckbox";
import { getComparator, stableSort } from "../../utils";
import { parseISO, format } from 'date-fns';
import * as mockApi from '../../api/endpoints/swaggerMockMissingEndpoints';
import { termParser } from '../../parsers/termParser'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { vars } from "../../theme/variables";
const { gray700, gray600, gray300 } = vars;

const headCells = [
    { id: 'label', label: 'Label' },
    { id: 'organization', label: 'Organization' },
    { id: 'type', label: 'Type' },
    { id: 'description', label: 'Description' },
    { id: 'timestamp', label: 'Timestamp' }
];

const descriptionTextStyle = {
    color: gray600,
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    minWidth: '11rem',
    maxWidth: '31.25rem'
};

const getChipColor = (type) => ({
    Approved: 'success',
    Edit: 'warning',
    Rejected: 'error',
    Imported: 'secondary',
    'New term': 'primary'
}[type]);

const formatDateString = (dateString) => {
    const simplifiedString = dateString.split(',')[0] + 'Z';
    const date = parseISO(simplifiedString);
    
    return format(date, 'dd MMM hh:mm a');
  };

const useMockApi = () => mockApi;


const TermActivity = () => {
    const { getMatchTerms } = useMockApi();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rows, setRows] = React.useState([]);
    const [order, setOrder] = React.useState('asc');
    const [orderBy, setOrderBy] = React.useState('prefix');
    const [selected, setSelected] = React.useState([]);
    const [page, setPage] = React.useState(1);
    const [numberOfVisiblePages, setNumberOfVisiblePages] = React.useState(0);
    const [pageOptions, setPageOptions] = useState([]);


    const sortedRows = React.useMemo(
        () => {
            const startIndex = (page - 1) * numberOfVisiblePages;
            const endIndex = startIndex + numberOfVisiblePages;

            return stableSort(rows, getComparator(order, orderBy)).slice(startIndex, endIndex);
        },
        [rows, order, orderBy, page, numberOfVisiblePages]
    );

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const handleNumberOfPagesChange = (event) => {
        setNumberOfVisiblePages(event.target.value);
        setPage(1);
    };

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelected = rows.map((n) => n.id);
            setSelected(newSelected);
            return;
        }
        setSelected([]);
    };

    const handleClick = (event, id) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1),
            );
        }
        setSelected(newSelected);
    };

    const isSelected = (id) => selected.indexOf(id) !== -1;

    useEffect(() => {
        setLoading(true)
        getMatchTerms("").then(data => { 
            const parsedData = termParser(data, 'brain')
            setRows(parsedData?.results)
            setLoading(false)
        });
    }, []);

    useEffect(() => {
        const computePageOptions = (rowCount) => {
            const options = [];
            for (let i = 5; i <= rowCount; i += 5) {
                options.push(i);
            }
            if (!options.includes(rowCount)) {
                options.push(rowCount);
            }
            return options;
        };

        const options = computePageOptions(rows.length);
        setPageOptions(options);

        if (options.length > 0) {
            setNumberOfVisiblePages(options[0]);
        }
    }, [rows]);

    if (loading) {
        return <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 1 }}>
            <CircularProgress />
        </Box>
    }

    if (error) {
        return <div>error</div>;
    }

    return (
        <Box p='1.5rem 2.5rem' flexGrow={1} overflow='auto'>
            <Grid container>
                <Grid item xs={12} lg={4}>
                    <Typography fontSize='1.5rem' color={gray600} fontWeight={600}>
                        {rows.length} items in term activity
                    </Typography>
                </Grid>
                <Grid item display="flex" justifyContent='end' xs={12} lg={8}>
                    <Stack direction="row" alignItems="center" gap={1}>
                        <Typography variant="caption" sx={{ fontSize: '0.875rem', color: gray600 }}>Show on page:</Typography>
                        <FormControl sx={{ minWidth: 75 }}>
                            <Select
                                value={numberOfVisiblePages}
                                onChange={handleNumberOfPagesChange}
                                displayEmpty
                                IconComponent={KeyboardArrowDownIcon}
                                sx={{
                                    color: gray700,
                                    borderRadius: '0.5rem !important',
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    '& .MuiOutlinedInput-input': {
                                        padding: '0.625rem 0.875rem'
                                    },
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: gray300
                                    },
                                    '& .MuiSvgIcon-root': {
                                        color: gray700,
                                        fontSize: '1.25rem',
                                        right: '0.875rem !important'
                                    }
                                }}
                            >
                                {pageOptions.map(option => (
                                    <MenuItem key={option} value={option}>{option}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Stack>
                </Grid>
            </Grid>
            <Grid container mt={3}>
                {numberOfVisiblePages > 0 && (
                    <CustomTable
                        rows={rows}
                        order={order}
                        orderBy={orderBy}
                        setOrder={setOrder}
                        setOrderBy={setOrderBy}
                        headCells={headCells}
                        rowsPerPage={numberOfVisiblePages}
                        page={page}
                        handlePageChange={handlePageChange}
                        isCheckboxPresent={true}
                        selected={selected}
                        handleSelectAllClick={handleSelectAllClick}
                    >
                        {sortedRows.map((row) => {
                            const isItemSelected = isSelected(row.id);

                            return (
                                <TableRow tabIndex={-1} key={row.id} >
                                    <TableCell
                                        role="checkbox"
                                        aria-checked={isItemSelected}
                                        selected={isItemSelected}
                                        onClick={(event) => handleClick(event, row.id)}
                                        sx={{ cursor: 'pointer' }}
                                    >
                                        <Checkbox checked={isItemSelected} />
                                    </TableCell>
                                    <TableCell align="left">{row.label}</TableCell>
                                    <TableCell align="left">{row.organization}</TableCell>
                                    <TableCell align="left">
                                        <Chip
                                            color={getChipColor(row.type)}
                                            label={row.type}
                                            sx={{ maxWidth: '5rem' }}
                                        />
                                    </TableCell>
                                    <TableCell align="left" sx={descriptionTextStyle}>{row.description}</TableCell>
                                    <TableCell align="left">
                                        <Chip color='default' label={formatDateString(row.versionInfo)} />
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </CustomTable>
                )}
            </Grid>
        </Box>
    );
}

export default TermActivity;
