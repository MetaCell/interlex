import * as React from "react";
import { TableRow, TableCell, IconButton, TextField, ClickAwayListener } from "@mui/material";
import CustomTable from "../common/CustomTable";
import { getComparator, stableSort } from "../../utils";
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import { vars } from "../../theme/variables";

const { gray600, brand500, gray100, gray300, gray700 } = vars;

const initialRows = [
    { id: 1, prefix: 'curiesILX', namespace: 'http://uri.interlex.org/Interlex/uris/ontologies/nervous-system12/' },
    { id: 2, prefix: 'ILX', namespace: 'http://uri.interlex.org/Interlex/uris/ontologies/nervous-system12/' },
    { id: 3, prefix: 'ILXm', namespace: 'http://uri.interlex.org/Interlex/uris/ontologies/nervous-system12/' },
    { id: 4, prefix: 'MSTL', namespace: 'http://uri.interlex.org/Interlex/uris/ontologies/nervous-system12/' }
];

const headCells = [
    { id: 'prefix', label: 'Prefix' },
    { id: 'namespace', label: 'Namespace' },
    { id: 'delete-button', label: '' }
];

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

const tableCellStyle = {
    minWidth: '37.5rem',
    color: gray600,
    fontWeight: 400
}

const MyCuriesTabPanel = () => {
    const [rows, setRows] = React.useState(initialRows);
    const [rowIndex, setRowIndex] = React.useState(-1);
    const [columnIndex, setColumnIndex] = React.useState(-1);
    const [order, setOrder] = React.useState('asc');
    const [orderBy, setOrderBy] = React.useState('prefix');

    const addRow = () => {
        const newRow = {
            id: rows.length + 1,
            prefix: '',
            namespace: ''
        };
        setRows([...rows, newRow]);
    };

    const deleteRow = (rowId) => {
        const newRows = rows.filter(row => row.id !== rowId);
        setRows(newRows)
    };

    const handleTextFieldChange = (rowInd, colName, value) => {
        rows[rowInd][colName] = value;
    };

    const sortedRows = React.useMemo(
        () => stableSort(rows, getComparator(order, orderBy)),
        [rows, order, orderBy]
    );

    const handleExit = () => {
        setRowIndex(-1);
        setColumnIndex(-1);
    }

    return (
        <ClickAwayListener onClickAway={() => handleExit()}>
            <CustomTable order={order} orderBy={orderBy} setOrder={setOrder} setOrderBy={setOrderBy} headCells={headCells}>
                {sortedRows.map((row, index) => {
                    return (
                        <TableRow tabIndex={-1} key={row.id}>
                            <TableCell
                                align="left"
                                onClick={() => { setRowIndex(index); setColumnIndex(0); }}
                                sx={{ border: rowIndex === index && columnIndex === 0 ? `2px solid ${brand500} !important` : 'inherit', ...tableCellStyle }}
                            >
                                {
                                    rowIndex === index && columnIndex === 0 ?
                                        <TextField
                                            placeholder={row.prefix}
                                            defaultValue={row.prefix}
                                            onChange={(event) => handleTextFieldChange(index, "prefix", event.target.value)}
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
                                sx={{ border: rowIndex === index && columnIndex === 1 ? `2px solid ${brand500} !important` : 'inherit', ...tableCellStyle }}
                            >
                                {
                                    rowIndex === index && columnIndex === 1 && row.namespace === '' ?
                                        <TextField
                                            placeholder={row.namespace}
                                            defaultValue={row.namespace}
                                            onChange={(event) => handleTextFieldChange(index, "namespace", event.target.value)}
                                            sx={fieldStyle}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    handleExit();
                                                }
                                            }}
                                        /> : row.namespace
                                }
                            </TableCell>
                            <TableCell>
                                <IconButton sx={{ background: 'transparent', '&:hover': { backgroundColor: gray100 } }} onClick={() => deleteRow(row.id)}>
                                    <DeleteOutlineOutlinedIcon fontSize="small" />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    );
                })}
                <TableRow>
                    <TableCell align="left" sx={{ borderBottom: 'none !important' }} onClick={addRow}>
                        <IconButton sx={{ padding: '0.625rem', border: `1px solid ${gray300}` }}>
                            <AddOutlinedIcon fontSize="small" sx={{ fill: gray700 }} />
                        </IconButton>
                    </TableCell>
                </TableRow>
            </CustomTable>
        </ClickAwayListener>
    )
}
export default MyCuriesTabPanel;