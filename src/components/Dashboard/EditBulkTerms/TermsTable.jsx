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
  TextField,
} from "@mui/material";
import { useState } from "react";
import PropTypes from 'prop-types';
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import CustomTableHead from "../../SingleTermView/Variants/CustomTableHead";
import { getComparator, stableSort } from "../../../helpers";

import { vars } from "../../../theme/variables";
const { gray200, gray50, gray700, brand600, gray800 } = vars;

const TermsTable = ({ setOpenEditAttributes, setAttributes, attributes, ontologyTerms, dynamicColumns }) => {
  // Memoize the static columns
  const interlexIdColumn = React.useMemo(() => ({ 
    "id": "@id", 
    "label": "Interlex ID", 
    "minWidth": 200, 
    "visibility": true,
    "readOnly": true,
    "sortable": false
  }), []);
  
  const defaultColumns = React.useMemo(() => [
    { "id": "label", "label": "Label", "minWidth": 300, "visibility": true },
    { "id": "organization", "label": "Organization", "minWidth": 150, "visibility": false },
    { "id": "description", "label": "Description", "minWidth": 300, "visibility": true, "sortable": false },
    { "id": "existingIDs", "label": "Existing IDs", "minWidth": 300, "visibility": false },
    { "id": "type", "label": "Type", "minWidth": 150, "visibility": false },
    { "id": "subClassOf", "label": "Superclass", "minWidth": 150, "visibility": false },
    { "id": "synonym", "label": "Has exact synonym", "minWidth": 300, "visibility": false },
    { "id": "type", "label": "OWL equivalent", "minWidth": 300, "visibility": false }
  ], []);
  
  const baseColumns = dynamicColumns || defaultColumns;
  
  // Always add Interlex ID column as the first column
  const columns = React.useMemo(() => [interlexIdColumn, ...baseColumns], [interlexIdColumn, baseColumns]);
  const [visibleColumns, setVisibleColumns] = useState(['@id']); // Start with just the ID column
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('@id'); // Set a valid initial orderBy value
  const [anchorEl, setAnchorEl] = useState(null);
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingCell, setEditingCell] = useState(null); // { rowIndex, columnId }
  const [editValue, setEditValue] = useState('');

  // Update visible columns when columns change
  React.useEffect(() => {
    const newVisibleColumns = columns.filter(column => column.visibility).map(column => column.id);
    setVisibleColumns(newVisibleColumns);
  }, [columns, dynamicColumns]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleCellDoubleClick = (rowIndex, columnId, currentValue) => {
    // Don't allow editing read-only columns
    if (columnId === 'interlex_id') return;
    
    setEditingCell({ rowIndex, columnId });
    setEditValue(currentValue || '');
  };

  const handleEditSave = () => {
    if (!editingCell) return;

    const { rowIndex, columnId } = editingCell;
    const updatedTerms = [...terms];
    updatedTerms[rowIndex] = {
      ...updatedTerms[rowIndex],
      [columnId]: editValue
    };
    
    setTerms(updatedTerms);
    setEditingCell(null);
    setEditValue('');
  };

  const handleEditCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleEditSave();
    } else if (event.key === 'Escape') {
      handleEditCancel();
    }
  };

  const sortedRows = React.useMemo(
    () => {
      if (!terms || terms.length === 0) return [];
      return stableSort(terms, getComparator(order, orderBy));
    },
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
    if (ontologyTerms && ontologyTerms.length > 0) {
      setTerms(ontologyTerms);
      setLoading(false);
    } else {
      setTerms([]);
      setLoading(false);
    }
  }, [ontologyTerms]);
  if (loading) {
    return <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 1 }}>
      <CircularProgress />
    </Box>
  }
  return (
    terms && terms.length > 0 ? (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Typography color={gray800} fontSize='1.125rem' fontWeight={600} mb='2.75rem'>
          Edit your terms or select an header to bulk edit that property
        </Typography>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Paper sx={{
            width: '100%',
            border: `1px solid ${gray200}`,
            boxShadow: '0px 1px 3px 0px rgba(16, 24, 40, 0.10), 0px 1px 2px 0px rgba(16, 24, 40, 0.06)',
            borderRadius: '0.75rem',
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
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
              {columns.map((column, index) => (
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
            <TableContainer sx={{ 
              borderRadius: '0.75rem', 
              overflowX: 'auto',
              overflowY: 'auto',
              maxHeight: 'calc(100vh - 14rem)', // Adjust based on your layout
              flex: 1, // Take remaining space
              '&::-webkit-scrollbar': {
                height: 8,
                width: 8,
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: '#f1f1f1',
                borderRadius: 4,
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#c1c1c1',
                borderRadius: 4,
                '&:hover': {
                  backgroundColor: '#a8a8a8',
                },
              },
            }}>
              <Table aria-labelledby="tableTitle" stickyHeader sx={{ minWidth: 1200 }}>
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
                  {sortedRows && sortedRows.length > 0 ? sortedRows.map((row, index) => (
                    <TableRow key={index}>
                      {filteredColumns.map((column) => {
                        const isEditing = editingCell?.rowIndex === index && editingCell?.columnId === column.id;
                        const cellValue = row && row[column.id];
                        
                        return (
                          <TableCell 
                            key={`${column.id}-${index}`} 
                            title={column.readOnly ? 'This column is read-only and cannot be edited' : 'Double-click to edit'}
                            style={{ 
                              minWidth: column.minWidth,
                              backgroundColor: column.readOnly ? gray50 : 'transparent',
                              fontFamily: column.id === '@id' ? 'monospace' : 'inherit',
                              cursor: column.readOnly ? 'default' : 'pointer'
                            }}
                            onDoubleClick={() => !column.readOnly && handleCellDoubleClick(index, column.id, cellValue)}
                          >
                            {isEditing ? (
                              <TextField
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={handleKeyPress}
                                onBlur={handleEditCancel}
                                autoFocus
                                size="small"
                                variant="outlined"
                                fullWidth
                                sx={{ minWidth: 0 }}
                              />
                            ) : Array.isArray(cellValue) && cellValue.length > 0 ? (
                              <Stack gap='.25rem' direction="row" alignItems="center" maxWidth='20rem' flexWrap='wrap'>
                                {cellValue.map((chip, chipIndex) => {
                                  const chipLabel = typeof chip === 'object' && chip !== null 
                                    ? chip['@value'] || chip.value || chip['@id'] || JSON.stringify(chip)
                                    : chip || '';
                                  const chipValue = typeof chip === 'object' && chip !== null 
                                    ? chip['@id'] || chip.value || chip['@value']
                                    : chip;
                                  return (
                                    <Chip 
                                      key={`${chipLabel}-${chipIndex}`} 
                                      label={chipLabel} 
                                      className='rounded IDchip-outlined' 
                                      icon={<OpenInNewOutlinedIcon />} 
                                      onClick={() => handleChipClick(chipValue)} 
                                    />
                                  );
                                })}
                              </Stack>
                            ) : column.id === '@id' ? (
                              // Format the Interlex ID to show just the ID part - read-only display
                              <span style={{ color: gray700, fontWeight: 500 }}>
                                {(() => {
                                  if (!cellValue) return '';
                                  if (typeof cellValue === 'object') {
                                    const idValue = cellValue['@id'] || cellValue.id || cellValue['@value'] || JSON.stringify(cellValue);
                                    return typeof idValue === 'string' ? idValue.split('/').pop() || idValue : idValue;
                                  }
                                  return typeof cellValue === 'string' ? cellValue.split('/').pop() || cellValue : cellValue;
                                })()}
                              </span>
                            ) : (
                              <span>
                                {typeof cellValue === 'object' && cellValue !== null 
                                  ? cellValue['@value'] || cellValue.value || JSON.stringify(cellValue)
                                  : cellValue || ''
                                }
                              </span>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  )) : null}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </Box>) : (
      <Box className="messageArea">
        <Typography variant="body1">No terms available with the parameters set</Typography>
      </Box>)
  )
};

TermsTable.propTypes = {
  setOpenEditAttributes: PropTypes.func,
  setAttributes: PropTypes.func,
  attributes: PropTypes.array,
  ontologyTerms: PropTypes.array,
  dynamicColumns: PropTypes.array,
};

export default TermsTable;
