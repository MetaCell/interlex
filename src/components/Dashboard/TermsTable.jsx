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
  TableBody, IconButton, Chip, Stack,
} from "@mui/material";
import { vars } from "../../theme/variables";
import { useState } from "react";
import CustomTableHead from "../SingleTermView/Variants/CustomTableHead";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import {getComparator, stableSort} from "../../helpers";
const { gray200, gray50, gray700, brand600 } = vars;
import SearchTermsData from "../../static/SearchTermsData.json";
const TermsTable = ({columns, setOpenEditAttributes, setAttributes, attributes}) => {
  const [visibleColumns, setVisibleColumns] = useState(
    columns.filter(column => column.visibility).map(column => column.id)
  );
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('name');
  const [anchorEl, setAnchorEl] = React.useState(null);
  
  const handleRequestSort = (event, property) => {
    setOrder(order === 'asc' ? 'desc' : 'asc')
    setOrderBy(property);
  };
  
  const sortedRows = React.useMemo(
    () => stableSort(SearchTermsData.termsRows, getComparator(order, orderBy)),
    [order, orderBy]
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
  
  const filteredColumns = columns.filter(column => visibleColumns.includes(column.id));
  
  return (
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
              key={column.id}
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
                    <TableCell key={column.id} style={{ minWidth: column.minWidth }}>
                      {Array.isArray(row[column.id]) ? (
                        <Stack gap='.25rem' direction="row" alignItems="center" maxWidth='20rem' flexWrap='wrap'>
                          {row[column.id].map((chip, chipIndex) => (
                            <Chip key={chipIndex} label={chip} className='rounded IDchip-outlined'/>
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
  );
};

export default TermsTable;
