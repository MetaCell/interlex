import PropTypes from 'prop-types';
import Checkbox from './CustomCheckbox';
import { TableHead, TableSortLabel, TableRow, TableCell } from '@mui/material';


export default function CustomTableHead(props) {
    const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort, headCells, isCheckboxPresent } = props;

    const createSortHandler = (property) => (event) => {
        onRequestSort(event, property);
    };

    return (
        <TableHead>
            <TableRow>
                {isCheckboxPresent && (
                    <TableCell>
                        <Checkbox
                            indeterminate={numSelected > 0 && numSelected < rowCount}
                            checked={rowCount > 0 && numSelected === rowCount}
                            onChange={onSelectAllClick}
                            inputProps={{
                                'aria-label': 'select all term items',
                            }}
                        />
                    </TableCell>
                )}
                {headCells.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align='left'
                        sortDirection={orderBy === headCell.id ? order : false}
                    >
                        <TableSortLabel
                            active={orderBy === headCell.id}
                            direction={orderBy === headCell.id ? order : 'asc'}
                            onClick={createSortHandler(headCell.id)}
                            sx={{
                                '& .MuiSvgIcon-root': {
                                    opacity: headCell.label === '' ? '0 !important' : 1
                                }
                            }}
                        >
                            {headCell.label}
                        </TableSortLabel>
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}

CustomTableHead.propTypes = {
    onSelectAllClick: PropTypes.func,
    order: PropTypes.oneOf(['asc', 'desc']),
    orderBy: PropTypes.string,
    numSelected: PropTypes.number,
    rowCount: PropTypes.number,
    onRequestSort: PropTypes.func,
    headCells: PropTypes.array,
    isCheckboxPresent: PropTypes.bool
}
