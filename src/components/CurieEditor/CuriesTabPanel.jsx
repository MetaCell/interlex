import * as React from "react";
import PropTypes from 'prop-types';
import CustomTable from "../common/CustomTable";
import { getComparator, stableSort } from "../../utils";
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { Box, TableRow, TableCell, IconButton, TextField, ClickAwayListener, CircularProgress } from "@mui/material";

import { vars } from "../../theme/variables";
const { gray600, brand500, gray100, gray300, gray700 } = vars;

const headCells = [
    { id: 'prefix', label: 'Prefix' },
    { id: 'namespace', label: 'Namespace' }
];

const headCellsEditMode = [
    { id: 'prefix', label: 'Prefix' },
    { id: 'namespace', label: 'Namespace' },
    { id: 'delete-button', label: '' }
]

const fieldStyle = {
    '& .MuiOutlinedInput-root': {
        fontWeight: 500,
        fontSize: '0.875rem',
        color: gray600,
    },
    '& input': { padding: 0 },
    '& .MuiOutlinedInput-notchedOutline': {
        border: 'none'
    }
};

const tableCellBaseStyle = {
    color: gray600,
    fontWeight: 400
};

const prefixCellStyle = {
    ...tableCellBaseStyle,
    width: '25%'
};

const namespaceCellStyle = {
    ...tableCellBaseStyle,
    width: '75%'
};

const CuriesTabPanel = (props) => {
    const { curieValue, error, loading, rows, editMode, onCurieAmountChange, onAddRow, onDeleteRow, onChangeRow } = props;
    const [rowIndex, setRowIndex] = React.useState(-1);
    const [columnIndex, setColumnIndex] = React.useState(-1);
    const [order, setOrder] = React.useState('asc');
    const [orderBy, setOrderBy] = React.useState('prefix');

    const sortedRows = React.useMemo(() => {
        // Ensure rows is always an array and apply natural sorting by default
        const safeRows = Array.isArray(rows) ? rows : [];
        return stableSort(safeRows, getComparator(order, orderBy));
    }, [rows, order, orderBy]);

    React.useEffect(() => {
        onCurieAmountChange?.(rows.length)
    }, [rows, onCurieAmountChange]);

    const handleExit = () => {
        setRowIndex(-1);
        setColumnIndex(-1);
    }

    if (error) {
        return <div>error</div>;
    }

    return (
        <ClickAwayListener onClickAway={() => handleExit()}>
            {loading ? <Box display="flex" alignItems="center" justifyContent="center" p={12} width={1}>
                <CircularProgress />
            </Box> : (
                <CustomTable
                    rows={rows}
                    order={order}
                    orderBy={orderBy}
                    setOrder={setOrder}
                    setOrderBy={setOrderBy}
                    headCells={editMode ? headCellsEditMode : headCells}
                >
                    {editMode && (
                        <TableRow>
                            <TableCell align="left" sx={{ borderBottom: 'none !important', ...prefixCellStyle }} onClick={() => onAddRow(curieValue)}>
                                <IconButton sx={{ padding: '0.625rem', border: `1px solid ${gray300}` }}>
                                    <AddOutlinedIcon fontSize="small" sx={{ fill: gray700 }} />
                                </IconButton>
                            </TableCell>
                            <TableCell sx={{ borderBottom: 'none !important', ...namespaceCellStyle }}></TableCell>
                            <TableCell sx={{ borderBottom: 'none !important' }}></TableCell>
                        </TableRow>
                    )}
                    {Array.isArray(sortedRows) && sortedRows.map((row, index) => {
                        return (
                            <TableRow tabIndex={-1} key={`${row.prefix}_${row.namespace}`}>
                                <TableCell
                                    align="left"
                                    onClick={() => { setRowIndex(index); setColumnIndex(0); }}
                                    sx={{ border: rowIndex === index && columnIndex === 0 && editMode ? `2px solid ${brand500} !important` : 'inherit', ...prefixCellStyle }}
                                >
                                    {
                                        rowIndex === index && columnIndex === 0 && editMode ?
                                            <TextField
                                                placeholder={row.prefix}
                                                defaultValue={row.prefix}
                                                fullWidth
                                                onChange={(e) => onChangeRow(e, index, "prefix", curieValue)}
                                                sx={fieldStyle}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        handleExit();
                                                    }
                                                }}
                                            /> : row.prefix
                                    }
                                </TableCell>
                                <TableCell
                                    align="left"
                                    onClick={() => { setRowIndex(index); setColumnIndex(1); }}
                                    sx={{ border: rowIndex === index && columnIndex === 1 && editMode ? `2px solid ${brand500} !important` : 'inherit', ...namespaceCellStyle }}
                                >
                                    {
                                        rowIndex === index && columnIndex === 1 && editMode ?
                                            <TextField
                                                placeholder={row.namespace}
                                                defaultValue={row.namespace}
                                                fullWidth
                                                onChange={(e) => onChangeRow(e, index, "namespace", curieValue)}
                                                sx={fieldStyle}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        handleExit();
                                                    }
                                                }}
                                            /> : row.namespace
                                    }
                                </TableCell>
                                {editMode && (
                                    <TableCell>
                                        <IconButton sx={{ background: 'transparent', '&:hover': { backgroundColor: gray100 } }} onClick={() => onDeleteRow(curieValue, row.prefix, row.namespace)}>
                                            <DeleteOutlineOutlinedIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                )}
                            </TableRow>
                        );
                    })}
                </CustomTable>
            )}
        </ClickAwayListener>
    )
}

CuriesTabPanel.propTypes = {
    curieValue: PropTypes.string.isRequired,
    error: PropTypes.bool,
    loading: PropTypes.bool,
    rows: PropTypes.array,
    editMode: PropTypes.bool,
    onCurieAmountChange: PropTypes.func,
    onAddRow: PropTypes.func,
    onDeleteRow: PropTypes.func,
    onChangeRow: PropTypes.func
}

export default CuriesTabPanel;
