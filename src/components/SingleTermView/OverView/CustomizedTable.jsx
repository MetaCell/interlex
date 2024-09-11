import { Box, IconButton, Typography } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import TableRow from "./TableRow";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import { vars } from "../../../theme/variables";
import _, { debounce } from 'lodash';
import { getMatchTerms } from "../../../api/endpoints";
import CustomSnackbar from "./CustomSnackbar";
import TermDialog from "../../TermEditor/TermDialog";

const { gray100, gray50, gray600, gray500, brand600, brand50, brand700, gray700 } = vars;

const tableStyles = {
  head: {
    display: 'flex',
    p: '0.75rem 0 0.5rem',
    borderBottom: `1px solid ${gray100}`,

    '& > .MuiBox-root': {
      width: '20rem',
      px: '0.75rem',
      '&:first-of-type': {
        width: 'calc(55% - 5.625rem)'
      },
      '&:last-of-type': {
        width: 'calc(45% - 5.625rem)'
      },
    },
    '& .MuiTypography-root': {
      color: gray600,
      fontWeight: 500,
      fontSize: '.75rem',
      lineHeight: '1.125rem'
    }
  },
  root: {
    padding: '.5rem',
    display: 'flex',
    border: '1 solid transparent',
    position: 'relative',
    borderBottom: `1px solid ${gray100}`,
    marginTop: '.25rem',

    '& .MuiLink-root': {
      color: 'red',
      gap: '0.5rem',
      fontSize: '0.875rem',
      flexShrink: 0,
      lineHeight: '142.857%',
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center'
    },
    '& .MuiIconButton-root': {
      padding: '0',
      backgroundColor: 'transparent',
      '& .MuiSvgIcon-root': {
        fontSize: '1rem',
        color: gray500,
      },
    },
    '& .MuiTypography-root': {
      color: gray700,
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: '1.25rem',
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    },
    '& > .MuiBox-root': {
      display: 'flex',
      alignItems: 'center',
      minWidth: 0,
    },
    '&:not(.secondary)': {
      '&:hover': {
        background: gray50,
        borderColor: gray100,
        borderRadius: '0.5rem',

        '&:before': {
          content: '""',
          height: '1.5rem',
          width: '0.125rem',
          background: brand600,
          position: 'absolute',
          left: '0rem',
          top: '50%',
          transform: 'translateY(-50%)',
          margin: 'auto 0',
          borderRadius: '0.1875rem'
        },
      },

      '& > .MuiBox-root': {
        width: '20rem',
        gap: '0.5rem',
        px: '0.75rem',
        '&:first-of-type': {
          width: 'calc(55% - 5.625rem)',
        },
        '&:last-of-type': {
          width: 'calc(45% - 5.625rem)'
        },
      },
    },
  },
  inputParentBox: {
    width: '100%',
    borderRadius: '0.5rem',
    background: '#F0F2F2',
    '&:before': {
      content: '""',
      height: '1.5rem',
      width: '0.125rem',
      background: brand600,
      position: 'absolute',
      left: '0rem',
      top: '50%',
      transform: 'translateY(-50%)',
      margin: 'auto 0',
      borderRadius: '0.1875rem'
    }
  },
  input: {
    '& .MuiOutlinedInput-root': {
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      color: '#313534',
      background: '#fff',
      boxShadow: '0px 1px 2px 0px rgba(16, 24, 40, 0.05)'
    },
    '& input': {
      padding: '0.5rem 0.75rem',
      height: '2.25rem'
    },
    '& .Mui-focused': {
      border: '2px solid #1C5F54',
      background: '#F0F2F2',
      color: '#313534'
    }
  },
  confirmButton: {
    p: '0.5rem 0.75rem',
    background: 'transparent',
    color: brand700,
    '&:hover': {
      background: brand50,
      color: brand700
    }
  }
};

const CustomizedTable = ({ data, term, isAddButtonVisible }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [tableContent, setTableContent] = useState(data?.tableData);
  const [tableHeader, setTableHeader] = useState([
    { key: 'subject', label: 'Subject', allowSort: false, direction: 'desc' },
    { key: 'predicate', label: 'Predicates', allowSort: false },
    { key: 'object', label: 'Objects', allowSort: true, direction: 'desc' },
    { key: '', label: '' }
  ]);

  const [terms, setTerms] = useState([]);
  const [objectSearchTerm, setObjectSearchTerm] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [deletedObj, setDeletedObj] = useState({});
  const [editTermDialogOpen, setEditTermDialogOpen] = useState(false);

  const targetRow = useRef();
  const sourceRow = useRef();
  const move = (arr, fromIndex, toIndex) => {
    let element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, element);
    return arr;
  };

  const dragStart = (id, index) => {
    sourceRow.current = { id, index };
  };

  const dragEnter = (id, index) => {
    targetRow.current = { id, index };
  };

  const onReorder = (source, target) => {
    if (source.index === target.index) {
      return;
    }
    const updatedContent = move([...tableContent], source.index, target.index);
    setTableContent(updatedContent);
  };

  const dragEnd = () => {
    onReorder(sourceRow.current, targetRow.current);
  };

  const requestSort = (e, key) => {
    if (!key) return;
    e.stopPropagation();
    e.preventDefault();

    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });

    const updatedHeader = tableHeader.map((item) => {
      if (item.key === key) {
        return { ...item, direction };
      }
      return item;
    });
    setTableHeader(updatedHeader);

    setTableContent((prevContent) => {
      const sortedContent = [...prevContent];
      sortedContent.sort((a, b) => {
        if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
        if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
        return 0;
      });
      return sortedContent;
    });
  };

  const getSortIcon = (key) => {
    const column = tableHeader.find((item) => item.key === key);
    if (column && column.direction) {
      return column.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />;
    }
    return <ArrowDownwardIcon fontSize="small" style={{ opacity: 0.3 }} />;
  };

  const handleOpenEditTermDialog = () => {
    setEditTermDialogOpen(true);
  };

  const handleCloseEditTermDialog = () => {
    setEditTermDialogOpen(false);
  };

  const handleUndoDelete = () => {
    console.log("Undo deletion!")
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  const fetchTerms = useCallback(debounce(async (searchTerm) => {
    const data = await getMatchTerms(searchTerm);
    setTerms(data?.results[0]);
  }, 500), [getMatchTerms]);

  useEffect(() => {
    if (objectSearchTerm) {
      fetchTerms(objectSearchTerm);
    }
  }, [objectSearchTerm, fetchTerms]);

  return (
    <>
      <Box pb={1.5}>
        <Box sx={tableStyles.head}>
          {tableHeader.map((head, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography>{head.label}</Typography>
              {head.key && head.allowSort && (
                <IconButton
                  size="small"
                  onClick={(e) => requestSort(e, head.key)}
                  sx={{
                    transition: 'opacity 0.3s',
                    marginLeft: '0.5rem'
                  }}
                >
                  {getSortIcon(head.key)}
                </IconButton>
              )}
            </Box>
          ))}
        </Box>
        <Box sx={tableStyles.body}>
          {tableContent.map((row, index) =>
            <TableRow
              key={`${row.id}-${index}`}
              tableStyles={tableStyles}
              data={row}
              index={index}
              onDragStart={dragStart}
              onDragEnter={dragEnter}
              onDragEnd={dragEnd}
            />
          )}
        </Box>
        <Box sx={tableStyles.root}>
          <Box sx={{ paddingLeft: '0 !important' }}>
            <IconButton onClick={handleOpenEditTermDialog}>
              <AddOutlinedIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>
      <TermDialog open={editTermDialogOpen} handleClose={handleCloseEditTermDialog} searchTerm={term} forwardPredicateStep={true} />
      <CustomSnackbar open={snackbarOpen} handleClose={handleSnackbarClose} onUndoDelete={handleUndoDelete} data={deletedObj} />
    </>
  );
};

export default CustomizedTable;