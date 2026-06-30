import * as React from "react";
import PropTypes from 'prop-types';
import CustomTable from "../common/CustomTable";
import { getComparator, stableSort } from "../../utils";
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { Box, TableRow, TableCell, IconButton, TextField, ClickAwayListener, CircularProgress, Tooltip } from "@mui/material";

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
    const { curieValue, error, loading, rows, editMode, onCurieAmountChange, onAddRow, onChangeRow } = props;
    const [rowId, setRowId] = React.useState(null);
    const [columnIndex, setColumnIndex] = React.useState(-1);
    const [order, setOrder] = React.useState('asc');
    const [orderBy, setOrderBy] = React.useState('prefix');
    const [displayOrder, setDisplayOrder] = React.useState([]);
    const isEditing = rowId !== null;

    const sortIds = (rowsArr) => stableSort(rowsArr, getComparator(order, orderBy)).map((row) => row._id);

    // Manual header sort always re-orders, even mid-edit.
    React.useEffect(() => {
        setDisplayOrder(sortIds(Array.isArray(rows) ? rows : []));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [order, orderBy]);

    // Row content changes (typing, add/delete) only trigger a full re-sort once
    // editing is done; while editing, just reconcile which rows exist so a row
    // doesn't jump position under the user as soon as it gets a value.
    React.useEffect(() => {
        const safeRows = Array.isArray(rows) ? rows : [];
        if (!isEditing) {
            setDisplayOrder(sortIds(safeRows));
            return;
        }
        const currentIds = safeRows.map((row) => row._id);
        setDisplayOrder((prevOrder) => {
            const stillPresent = prevOrder.filter((id) => currentIds.includes(id));
            const newIds = currentIds.filter((id) => !prevOrder.includes(id));
            return [...stillPresent, ...newIds];
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rows, isEditing]);

    const sortedRows = React.useMemo(() => {
        const rowsById = new Map((Array.isArray(rows) ? rows : []).map((row) => [row._id, row]));
        return displayOrder.map((id) => rowsById.get(id)).filter(Boolean);
    }, [displayOrder, rows]);

    React.useEffect(() => {
        onCurieAmountChange?.(rows.length)
    }, [rows, onCurieAmountChange]);

    const handleExit = () => {
        setRowId(null);
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
                    {Array.isArray(sortedRows) && sortedRows.map((row) => {
                        const isEditingPrefix = rowId === row._id && columnIndex === 0 && editMode;
                        const isEditingNamespace = rowId === row._id && columnIndex === 1 && editMode;
                        return (
                            <TableRow tabIndex={-1} key={row._id}>
                                <TableCell
                                    align="left"
                                    onClick={() => { setRowId(row._id); setColumnIndex(0); }}
                                    sx={{ border: isEditingPrefix ? `2px solid ${brand500} !important` : 'inherit', ...prefixCellStyle }}
                                >
                                    {isEditingPrefix ?
                                        <TextField
                                            placeholder={row.prefix}
                                            defaultValue={row.prefix}
                                            fullWidth
                                            onChange={(e) => onChangeRow(e, row._id, "prefix", curieValue)}
                                            sx={fieldStyle}
                                            onKeyDown={(e) => { if (e.key === "Enter") handleExit(); }}
                                        /> : row.prefix
                                    }
                                </TableCell>
                                <TableCell
                                    align="left"
                                    onClick={() => { setRowId(row._id); setColumnIndex(1); }}
                                    sx={{ border: isEditingNamespace ? `2px solid ${brand500} !important` : 'inherit', ...namespaceCellStyle }}
                                >
                                    {isEditingNamespace ?
                                        <TextField
                                            placeholder={row.namespace}
                                            defaultValue={row.namespace}
                                            fullWidth
                                            onChange={(e) => onChangeRow(e, row._id, "namespace", curieValue)}
                                            sx={fieldStyle}
                                            onKeyDown={(e) => { if (e.key === "Enter") handleExit(); }}
                                        /> : row.namespace
                                    }
                                </TableCell>
                                {editMode && (
                                    <TableCell>
                                        <Tooltip title="Delete action on the curie endpoint is not yet supported">
                                            <span>
                                                <IconButton disabled sx={{ background: 'transparent', '&:hover': { backgroundColor: gray100 } }}>
                                                    <DeleteOutlineOutlinedIcon fontSize="small" />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
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
