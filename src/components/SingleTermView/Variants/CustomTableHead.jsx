import PropTypes from 'prop-types';
import {TableHead, TableSortLabel, TableRow, TableCell, Box, IconButton} from '@mui/material';
import {EditNoteOutlined} from "@mui/icons-material";

export default function CustomTableHead(props) {
    const { order, orderBy, onRequestSort, headCells, viewEditAttributes = false, setOpenEditAttributes, setAttributes, attributes } = props;
    const createSortHandler = (property) => (event) => {
        onRequestSort(event, property);
    };
    return (
      <TableHead>
          <TableRow>
            {headCells.map((headCell, index) => (
              <TableCell
                key={headCell.id}
                align='left'
                sortDirection={orderBy === headCell.id ? order : false}
                sx={{
                  padding: (index === headCells.length - 1 && viewEditAttributes) ? '.75rem 3.5rem .75rem 1.5rem !important' : 'default',
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center" gap='.75rem'>
                  <span>{headCell.label}</span>
                  <Box display="flex" alignItems="center">
                    {headCell.sortable !== false && (
                      <TableSortLabel
                        active={orderBy === headCell.id}
                        direction={orderBy === headCell.id ? order : 'asc'}
                        onClick={createSortHandler(headCell.id)}
                        sx={{
                          '& .MuiSvgIcon-root': {
                            opacity: headCell.label === '' ? '0 !important' : 1
                          }
                        }}
                      />
                    )}
                    {viewEditAttributes && (headCell.sortable !== false) && (
                      <IconButton
                        variant="contained"
                        size="small"
                        onClick={() => {
                          let newAttributes = [...attributes];
                          newAttributes[0].attribute = headCell.id
                          setOpenEditAttributes(true)
                          setAttributes(newAttributes)
                        }}
                        sx={{
                          padding: 0,
                          backgroundColor: 'transparent',
                          
                          '&:hover': {
                            backgroundColor: 'transparent',
                          }
                        }}
                      >
                        <EditNoteOutlined />
                      </IconButton>
                    )}
                  </Box>
                </Box>
              </TableCell>
            ))}
          </TableRow>
      </TableHead>
    );
}

CustomTableHead.propTypes = {
    onRequestSort: PropTypes.func,
    order: PropTypes.oneOf(['asc', 'desc']),
    orderBy: PropTypes.string,
    headCells: PropTypes.arrayOf(
      PropTypes.shape({
          id: PropTypes.string,
          label: PropTypes.string,
          sortable: PropTypes.bool,
      })
    ),
    viewEditAttributes: PropTypes.bool,
    setOpenEditAttributes: PropTypes.func,
  setAttributes: PropTypes.func,
};
