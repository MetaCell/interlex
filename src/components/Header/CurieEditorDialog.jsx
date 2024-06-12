import * as React from "react";
import { Box, Button, TableRow, TableCell, IconButton } from "@mui/material";
import CustomizedDialog from "../common/CustomizedDialog";
import { EditNoteIcon } from "../../Icons";
import BasicTabs from "../common/CustomTabs";
import CustomTable from "../common/CustomTable";
import { getComparator, stableSort } from "../../utils";
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';

const initialRows = [
    { id: 1, prefix: 'curiesILX', namespace: 'http://uri.interlex.org/Interlex/uris/ontologies/nervous-system12/' },
    { id: 2, prefix: 'iLX', namespace: 'http://uri.interlex.org/Interlex/uris/ontologies/nervous-system12/' },
    { id: 3, prefix: 'iLX', namespace: 'http://uri.interlex.org/Interlex/uris/ontologies/nervous-system12/' },
    { id: 4, prefix: 'curiesILX', namespace: 'http://uri.interlex.org/Interlex/uris/ontologies/nervous-system12/' },
    { id: 5, prefix: 'curiesILX', namespace: 'http://uri.interlex.org/Interlex/uris/ontologies/nervous-system12/' },
    { id: 6, prefix: 'curiesILX', namespace: 'http://uri.interlex.org/Interlex/uris/ontologies/nervous-system12/' },
    { id: 7, prefix: 'curiesILX', namespace: 'http://uri.interlex.org/Interlex/uris/ontologies/nervous-system12/' },
    { id: 8, prefix: 'curiesILX', namespace: 'http://uri.interlex.org/Interlex/uris/ontologies/nervous-system12/' },
    { id: 9, prefix: 'curiesILX', namespace: 'http://uri.interlex.org/Interlex/uris/ontologies/nervous-system12/' },
    { id: 10, prefix: 'curiesILX', namespace: 'http://uri.interlex.org/Interlex/uris/ontologies/nervous-system12/' },
    { id: 11, prefix: 'curiesILX', namespace: 'http://uri.interlex.org/Interlex/uris/ontologies/nervous-system12/' }
];

const headCells = [
    { id: 'prefix', label: 'Prefix' },
    { id: 'namespace', label: 'Namespace' },
    { id: 'delete-button', label: '' }
];

const HeaderRightSideContent = () => {

    return (
        <Box display='flex' alignItems='center' gap={1.5}>
            <Button sx={{ p: '0.625rem 0.875rem', minWidth: '0.0625rem' }} variant="outlined">Cancel</Button>
            <Button sx={{ p: '0.625rem 0.875rem', minWidth: '0.0625rem' }} variant='contained'>
                <EditNoteIcon />
                Save curies
            </Button>
        </Box>
    )
}

const CurieEditorDialog = ({ open, handleClose }) => {
    const [tabValue, setTabValue] = React.useState(0);
    const [rows, setRows] = React.useState(initialRows);
    const [order, setOrder] = React.useState('asc');
    const [orderBy, setOrderBy] = React.useState('prefix');

    const handleChangeTabs = (event, newValue) => {
        setTabValue(newValue);
    };

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

    const sortedRows = React.useMemo(
        () => stableSort(rows, getComparator(order, orderBy)),
        [rows, order, orderBy]
    );
    console.log("rows: ", rows)
    console.log("sortedRows: ", sortedRows)
    

    return (
        <CustomizedDialog title='Curie editor' open={open} handleClose={handleClose} HeaderRightSideContent={HeaderRightSideContent}>
            <Box sx={{ padding: '12px 20px' }}>
                <BasicTabs tabValue={tabValue} handleChange={handleChangeTabs} tabs={["My curies", "Curated", "Latest"]} />
                <Box flexGrow={1} overflow="auto" p="2.5rem 0.5rem">
                    {
                        tabValue === 0 && <CustomTable order={order} orderBy={orderBy} setOrder={setOrder} setOrderBy={setOrderBy} headCells={headCells}>
                            {sortedRows.map((row) => {
                                return (
                                    <TableRow tabIndex={-1} key={row.id}>
                                        <TableCell align="left" sx={{ minWidth: '600px', color: '#515252', fontWeight: 400 }}>{row.prefix}</TableCell>
                                        <TableCell align="left" sx={{ minWidth: '600px', color: '#515252', fontWeight: 400 }}>{row.namespace}</TableCell>
                                        <TableCell>
                                            <IconButton sx={{ background: 'transparent', '&:hover': { backgroundColor: '#E4E7E7' } }} onClick={() => deleteRow(row.id)}>
                                                <DeleteOutlineOutlinedIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            <TableRow>
                                <TableCell align="left" sx={{ borderBottom: 'none !important' }} onClick={addRow}>
                                    <IconButton sx={{ padding: '10px', border: '1px solid #BDC2C1' }}>
                                        <AddOutlinedIcon fontSize="small" sx={{ fill: '#313534' }} />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        </CustomTable>
                    }
                    {
                        tabValue === 1 && <Box>Variants</Box>
                    }
                    {
                        tabValue === 2 && <Box>history</Box>
                    }
                </Box>
            </Box>
        </CustomizedDialog>
    )
}

export default CurieEditorDialog;