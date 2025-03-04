import * as React from 'react';
import {
  Box,
  Checkbox,
  ListItemText,
  Menu,
  MenuItem,
  Table,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  TableBody,
  IconButton,
  Chip,
  Stack, CircularProgress,
  Typography,
} from "@mui/material";
import { vars } from "../../../theme/variables";
import { useState } from "react";
import CustomTableHead from "../../SingleTermView/Variants/CustomTableHead";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import { getComparator, getSearchTermsFilter, stableSort } from "../../../helpers";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import { getMatchTerms } from "../../../api/endpoints";

const { gray200, gray50, gray700, brand600, gray800 } = vars;

const columns = [
  { "id": "label", "label": "Label", "minWidth": 300, "visibility": true },
  { "id": "organization", "label": "Organization", "minWidth": 150, "visibility": false },
  { "id": "description", "label": "Description", "minWidth": 300, "visibility": true, "sortable": false },
  { "id": "existingIDs", "label": "Existing IDs", "minWidth": 300, "visibility": false },
  { "id": "type", "label": "Type", "minWidth": 150, "visibility": false },
  { "id": "subClassOf", "label": "Superclass", "minWidth": 150, "visibility": false },
  { "id": "synonym", "label": "Has exact synonym", "minWidth": 300, "visibility": false },
  { "id": "type", "label": "OWL equivalent", "minWidth": 300, "visibility": false }
];

const TermsTable = ({ setOpenEditAttributes, setAttributes, attributes, searchConditions }) => {
  const [visibleColumns, setVisibleColumns] = useState(
    columns.filter(column => column.visibility).map(column => column.id)
  );
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('label'); // Set a valid initial orderBy value
  const [anchorEl, setAnchorEl] = useState(null);
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(false)

  const filters = getSearchTermsFilter(searchConditions);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedRows = React.useMemo(
    () => stableSort(terms, getComparator(order, orderBy)),
    [order, orderBy, terms]
  );

  const handleColumnChange = (event, columnId) => {
    const newVisibleColumns = [...visibleColumns];
    if (newVisibleColumns.includes(columnId)) {
      const index = newVisibleColumns.indexOf(columnId);
      newVisibleColumns.splice(index, 1);
    } else {
      newVisibleColumns.push(columnId);
    }
    setVisibleColumns(newVisibleColumns);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChipClick = (url) => {
    window.open(url, '_blank');
  };

  const filteredColumns = columns.filter(column => visibleColumns.includes(column.id));

  React.useEffect(() => {
    setLoading(true)
    getMatchTerms("i", { filters }).then(data => {
      setTerms(data.results);
      setLoading(false);
    }).catch(err => {
      console.log(err)
      setLoading(false);
    });
  }, []);
  if (loading) {
    return <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 1 }}>
      <CircularProgress />
    </Box>
  }
  return (
    terms && terms.length > 0 ? (
      <>
        <Typography color={gray800} fontSize='1.125rem' fontWeight={600} mb='2.75rem'>
          Edit your terms or select an header to bulk edit that property
        </Typography>
        <Box>
          <Paper sx={{
            width: '100%',
            border: `1px solid ${gray200}`,
            boxShadow: '0px 1px 3px 0px rgba(16, 24, 40, 0.10), 0px 1px 2px 0px rgba(16, 24, 40, 0.06)',
            borderRadius: '0.75rem',
            position: 'relative',
          }}>
            <IconButton aria-label="columns-menu" onClick={handleClick} sx={{
              position: 'absolute',
              right: '.25rem',
              top: '.25rem',
              zIndex: 1,
              border: `1px solid ${gray200}`,
              color: gray700
            }}>
              <AddOutlinedIcon />
            </IconButton>
            <Menu
              id="simple-menu"
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              {columns.map((column) => (
                <MenuItem
                  key={`${column.id}-${index}`}
                  value={column.id}
                  onClick={(event) => handleColumnChange(event, column.id)}
                  sx={{
                    '&:has(.Mui-checked)': {
                      backgroundColor: gray50,
                    }
                  }}
                >
                  <ListItemText primary={column.label} />
                  <Checkbox
                    checkedIcon={<CheckOutlinedIcon sx={{ fontSize: 16, color: brand600 }} />}
                    sx={{ color: 'transparent !important' }}
                    checked={visibleColumns.includes(column.id)}
                  />
                </MenuItem>
              ))}
            </Menu>
            <TableContainer sx={{ borderRadius: '0.75rem' }}>
              <Table aria-labelledby="tableTitle">
                <CustomTableHead
                  onRequestSort={handleRequestSort}
                  order={order}
                  orderBy={orderBy}
                  headCells={filteredColumns}
                  viewEditAttributes={true}
                  setOpenEditAttributes={setOpenEditAttributes}
                  setAttributes={setAttributes}
                  attributes={attributes}
                />
                <TableBody>
                  {sortedRows.map((row, index) => (
                    <TableRow key={index}>
                      {filteredColumns.map((column) => (
                        <TableCell key={`${column.id}-${index}`} style={{ minWidth: column.minWidth }}>
                          {Array.isArray(row[column.id]) ? (
                            <Stack gap='.25rem' direction="row" alignItems="center" maxWidth='20rem' flexWrap='wrap'>
                              {row[column.id].map((chip, chipIndex) => (
                                <Chip key={`${chip}-${chipIndex}`} label={chip} className='rounded IDchip-outlined' icon={<OpenInNewOutlinedIcon />} onClick={() => handleChipClick(chip)} />
                              ))}
                            </Stack>
                          ) : (
                            row[column.id]
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </>) : (
      <Box className="messageArea">
        <Typography variant="body1">No terms available with the parameters set</Typography>
      </Box>)
  )
};

export default TermsTable;
