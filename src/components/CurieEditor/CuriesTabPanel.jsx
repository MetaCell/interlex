import * as React from "react";
import { Box, TableRow, TableCell, IconButton, TextField, ClickAwayListener, CircularProgress } from "@mui/material";
import CustomTable from "../common/CustomTable";
import { getComparator, stableSort } from "../../utils";
import * as mockApi from './../../api/endpoints/swaggerMockMissingEndpoints';
import curieParser from '../../parsers/curieParser';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import { vars } from "../../theme/variables";

const { gray600, brand500, gray100, gray300, gray700 } = vars;


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
};

const useMockApi = () => mockApi;

const CuriesTabPanel = (props) => {
    const { rows, setRows, curieValue, editMode, headCells, numberOfVisibleCuries, onCurieAmountChange } = props;
    const { getCuries } = useMockApi();
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [rowIndex, setRowIndex] = React.useState(-1);
    const [columnIndex, setColumnIndex] = React.useState(-1);
    const [order, setOrder] = React.useState('asc');
    const [orderBy, setOrderBy] = React.useState('prefix');
    const [page, setPage] = React.useState(1);

    const addRow = () => {
        const newRow = {
            id: rows.length + 1,
            prefix: '',
            namespace: ''
        };
        setRows([...rows, newRow]);
    };

    const deleteRow = (rowPrefix, rowNamespace) => {
        console.log("here we connect DELETE method")
        const newRows = sortedRows.filter(row => row.prefix !== rowPrefix && row.namespace !== rowNamespace);
        setRows(newRows)
        setRowIndex(-1)
    };

    const handleTextFieldChange = (e, rowIndex, columnName) => {
        const { value } = e.target;
        const updatedRows = sortedRows.map((row, index) => {
            if (index === rowIndex) {
                return { ...row, [columnName]: value };
            }
            return row;
        });
        console.log("here we connect UPDATE method")
        setRows(updatedRows);
    };

    const sortedRows = React.useMemo(() => {
        const sorted = stableSort(rows, getComparator(order, orderBy));

        if (numberOfVisibleCuries !== undefined) {
            const startIndex = (page - 1) * numberOfVisibleCuries;
            const endIndex = startIndex + numberOfVisibleCuries;
            return sorted.slice(startIndex, endIndex);
        }

        return sorted;
    }, [rows, order, orderBy, page, numberOfVisibleCuries]);

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    React.useEffect(() => {
        setLoading(true)
        getCuries(curieValue)
            .then(data => {
                const parsedData = curieParser(data)
                setRows(parsedData)
                setLoading(false)
            })
            .catch((error) => {
                setError(error)
                setLoading(false)
            });
    }, [])

    React.useEffect(() => {
        onCurieAmountChange?.(rows.length)
    }, [rows])

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
                    headCells={headCells}
                    rowsPerPage={numberOfVisibleCuries}
                    handlePageChange={handlePageChange}
                >
                    {sortedRows.map((row, index) => {
                        return (
                            <TableRow tabIndex={-1} key={row.id}>
                                <TableCell
                                    align="left"
                                    onClick={() => { setRowIndex(index); setColumnIndex(0); }}
                                    sx={{ border: rowIndex === index && columnIndex === 0 && editMode ? `2px solid ${brand500} !important` : 'inherit', ...tableCellStyle }}
                                >
                                    {
                                        rowIndex === index && columnIndex === 0 && editMode ?
                                            <TextField
                                                placeholder={row.prefix}
                                                defaultValue={row.prefix}
                                                fullWidth
                                                onChange={(e) => handleTextFieldChange(e, index, "prefix")}
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
                                    sx={{ border: rowIndex === index && columnIndex === 1 && editMode ? `2px solid ${brand500} !important` : 'inherit', ...tableCellStyle }}
                                >
                                    {
                                        rowIndex === index && columnIndex === 1 && editMode ?
                                            <TextField
                                                placeholder={row.namespace}
                                                defaultValue={row.namespace}
                                                fullWidth
                                                onChange={(e) => handleTextFieldChange(e, index, "namespace")}
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
                                        <IconButton sx={{ background: 'transparent', '&:hover': { backgroundColor: gray100 } }} onClick={() => deleteRow(row.prefix, row.namespace)}>
                                            <DeleteOutlineOutlinedIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                )}
                            </TableRow>
                        );
                    })}
                    {editMode && (
                        <TableRow>
                            <TableCell align="left" sx={{ borderBottom: 'none !important' }} onClick={addRow}>
                                <IconButton sx={{ padding: '0.625rem', border: `1px solid ${gray300}` }}>
                                    <AddOutlinedIcon fontSize="small" sx={{ fill: gray700 }} />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    )}
                </CustomTable>
            )}
        </ClickAwayListener>
    )
}
export default CuriesTabPanel;