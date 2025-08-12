import { debounce } from 'lodash';
import TableRow from "./TableRow";
import PropTypes from 'prop-types';
import CustomSnackbar from "./CustomSnackbar";
import TermDialog from "../../TermEditor/TermDialog";
import { getMatchTerms } from "../../../api/endpoints";
import { Box, IconButton, Typography } from "@mui/material";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import { useCallback, useEffect, useRef, useState, useContext } from "react";
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { GlobalDataContext } from "../../../contexts/DataContext";

import { vars } from "../../../theme/variables";
const { gray100, gray50, gray600, gray500, brand600, brand50, brand700, gray700 } = vars;

const tableStyles = {
  head: {
    display: 'flex',
    p: '0.75rem 0.5rem 0.5rem 0.5rem',
    borderBottom: `1px solid ${gray100}`,
    '& > .MuiBox-root': { paddingRight: '0.75rem', paddingLeft: 0 },
    '& .MuiTypography-root': {
      color: gray600, fontWeight: 500, fontSize: '.75rem', lineHeight: '1.125rem'
    }
  },
  root: {
    padding: '.5rem',
    display: 'flex',
    alignItems: 'center',
    border: '1px solid transparent',
    position: 'relative',
    borderBottom: `1px solid ${gray100}`,
    marginTop: '.25rem',
    '& .MuiLink-root': {
      color: 'red', gap: '0.5rem', fontSize: '0.875rem', lineHeight: '1.25rem', fontWeight: 600, textDecoration: 'none'
    },
    '& .MuiIconButton-root': {
      padding: '0', backgroundColor: 'transparent',
      '& .MuiSvgIcon-root': { fontSize: '1rem', color: gray500 },
    },
    '& .MuiTypography-root': {
      color: gray700, fontSize: '0.875rem', fontWeight: 400, lineHeight: '1.25rem',
      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
    },
    '& > .MuiBox-root': {
      display: 'flex', alignItems: 'center', minWidth: 0, gap: '0.5rem', paddingRight: '0.75rem', paddingLeft: 0
    },
    '&:not(.secondary)': {
      '&:hover': {
        background: gray50, borderColor: gray100, borderRadius: '0.5rem',
        '&:before': {
          content: '""', height: '1.5rem', width: '0.125rem', background: brand600,
          position: 'absolute', left: '0rem', top: '50%', transform: 'translateY(-50%)',
          margin: 'auto 0', borderRadius: '0.1875rem'
        },
      }
    },
  },
  inputParentBox: {
    width: '100%', borderRadius: '0.5rem', background: '#F0F2F2',
    '&:before': {
      content: '""', height: '1.5rem', width: '0.125rem', background: brand600,
      position: 'absolute', left: '0rem', top: '50%', transform: 'translateY(-50%)',
      margin: 'auto 0', borderRadius: '0.1875rem'
    }
  },
  input: {
    '& .MuiOutlinedInput-root': {
      borderRadius: '0.5rem', fontSize: '0.875rem', color: '#313534',
      background: '#fff', boxShadow: '0px 1px 2px 0px rgba(16, 24, 40, 0.05)'
    },
    '& input': { padding: '0.5rem 0.75rem', height: '2.25rem' },
    '& .Mui-focused': { border: '2px solid #1C5F54', background: '#F0F2F2', color: '#313534' }
  },
  confirmButton: {
    p: '0.5rem 0.75rem', background: 'transparent', color: brand700,
    '&:hover': { background: brand50, color: brand700 }
  }
};

// ---------- helpers ----------
const safe = (v) => (v == null ? "" : String(v));

function normalizeTableData(data) {
  if (!data) return [];
  if (Array.isArray(data.tableData) && data.tableData.length) {
    return data.tableData.map((r, i) => ({
      id: r.id ?? `${safe(r.subject)}|${safe(r.predicate)}|${safe(r.object)}|${i}`,
      subject: safe(r.subject),
      predicate: safe(r.predicate),
      object: safe(r.object),
    }));
  }
  const rows = Array.isArray(data.rows) && data.rows.length
    ? data.rows
    : (Array.isArray(data.values) ? data.values : []);
  if (rows && rows.length) {
    return rows.map((r, i) => ({
      id: `${safe(r.subjectId || r.subject)}|${safe(data.title)}|${safe(r.objectId || r.object)}|${i}`,
      subject: safe(r.subject || r.subjectId),
      predicate: safe(data.title || "predicate"),
      object: safe(r.object || r.objectId),
    }));
  }
  if (Array.isArray(data.edges) && data.edges.length) {
    return data.edges.map((e, i) => {
      const subj = e?.from?.label || e?.from?.id;
      const obj  = e?.to?.label || e?.to?.id;
      const pred = e?.predicate?.label || e?.predicate?.id || data.title || "predicate";
      return {
        id: `${safe(subj)}|${safe(pred)}|${safe(obj)}|${i}`,
        subject: safe(subj),
        predicate: safe(pred),
        object: safe(obj),
      };
    });
  }
  return [];
}

// ---------- component ----------
const CustomizedTable = ({ data, term, isAddButtonVisible }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [tableContent, setTableContent] = useState(() => normalizeTableData(data));
  const [tableHeader, setTableHeader] = useState([
    { key: 'subject', label: 'Subject', allowSort: false, direction: 'desc' },
    { key: 'predicate', label: 'Predicates', allowSort: false },
    { key: 'object', label: 'Objects', allowSort: true, direction: 'desc' },
  ]);

  // eslint-disable-next-line no-unused-vars
  const [terms, setTerms] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [objectSearchTerm, setObjectSearchTerm] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [deletedObj, setDeletedObj] = useState({});
  const [editTermDialogOpen, setEditTermDialogOpen] = useState(false);
  const { user } = useContext(GlobalDataContext);

  const targetRow = useRef();
  const sourceRow = useRef();

  // keep table in sync with prop `data`
  useEffect(() => {
    setTableContent(normalizeTableData(data));
  }, [data]);

  const move = (arr, fromIndex, toIndex) => {
    const element = arr[fromIndex];
    const copy = [...arr];
    copy.splice(fromIndex, 1);
    copy.splice(toIndex, 0, element);
    return copy;
  };

  const dragStart = (id, index) => { sourceRow.current = { id, index }; };
  const dragEnter = (id, index) => { targetRow.current = { id, index }; };
  const onReorder = (source, target) => {
    if (!source || !target || source.index === target.index) return;
    setTableContent((prev) => move(prev, source.index, target.index));
  };
  const dragEnd = () => onReorder(sourceRow.current, targetRow.current);

  const requestSort = (e, key) => {
    if (!key) return;
    e.stopPropagation();
    e.preventDefault();

    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    else if (sortConfig.key === key && sortConfig.direction === 'desc') direction = 'asc';

    setSortConfig({ key, direction });

    setTableHeader((prev) =>
      prev.map((item) => (item.key === key ? { ...item, direction } : item))
    );

    setTableContent((prevContent) => {
      const sorted = [...prevContent].sort((a, b) => {
        const av = safe(a[key]).toLowerCase();
        const bv = safe(b[key]).toLowerCase();
        const cmp = av.localeCompare(bv, undefined, { numeric: true, sensitivity: 'base' });
        return direction === 'asc' ? cmp : -cmp;
      });
      return sorted;
    });
  };

  const getSortIcon = (key) => {
    const column = tableHeader.find((item) => item.key === key);
    if (column?.direction) {
      return column.direction === 'asc'
        ? <ArrowUpwardIcon fontSize="small" />
        : <ArrowDownwardIcon fontSize="small" />;
    }
    return <ArrowDownwardIcon fontSize="small" style={{ opacity: 0.3 }} />;
  };

  const handleOpenEditTermDialog = () => setEditTermDialogOpen(true);
  const handleCloseEditTermDialog = () => setEditTermDialogOpen(false);
  const handleUndoDelete = () => {};
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  // NOTE: rename inner var to avoid shadowing prop `data` (fixes react/prop-types lint)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchTerms = useCallback(debounce(async (searchTerm) => {
    const resp = await getMatchTerms(user?.groupname, searchTerm);
    setTerms(resp?.results?.[0]);
  }, 500), [user?.groupname]);

  useEffect(() => {
    if (objectSearchTerm) fetchTerms(objectSearchTerm);
  }, [objectSearchTerm, fetchTerms]);

  const tableWidth = 800;
  const columnWidth = "100%";

  return (
    <>
      <Box pb={1.5} width={1} sx={{ maxWidth: `${tableWidth}px` }}>
        <Box sx={tableStyles.head}>
          {tableHeader.map((head, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', width: columnWidth }}>
              <Typography>{head.label}</Typography>
              {head.key && head.allowSort && (
                <IconButton
                  size="small"
                  onClick={(e) => requestSort(e, head.key)}
                  sx={{ transition: 'opacity 0.3s', marginLeft: '0.5rem' }}
                >
                  {getSortIcon(head.key)}
                </IconButton>
              )}
            </Box>
          ))}
          <Box sx={{ width: '6.25rem' }} />
        </Box>

        {(tableContent || []).map((row, index) => (
          <TableRow
            key={`${row.id}-${index}`}
            tableStyles={tableStyles}
            columnWidth={columnWidth}
            data={row}
            index={index}
            onDragStart={dragStart}
            onDragEnter={dragEnter}
            onDragEnd={dragEnd}
          />
        ))}

        {isAddButtonVisible && (
          <Box sx={tableStyles.root}>
            <Box sx={{ paddingLeft: '0 !important' }}>
              <IconButton onClick={handleOpenEditTermDialog}>
                <AddOutlinedIcon />
              </IconButton>
            </Box>
          </Box>
        )}
      </Box>

      <TermDialog
        open={editTermDialogOpen}
        handleClose={handleCloseEditTermDialog}
        searchTerm={term}
        forwardPredicateStep={true}
      />
      <CustomSnackbar
        open={snackbarOpen}
        handleClose={handleSnackbarClose}
        onUndoDelete={handleUndoDelete}
        data={{}}
      />
    </>
  );
};

CustomizedTable.propTypes = {
  data: PropTypes.shape({
    title: PropTypes.string,
    count: PropTypes.number,
    tableData: PropTypes.array, // legacy
    rows: PropTypes.array,      // new
    values: PropTypes.array,    // new alias
    edges: PropTypes.array      // fallback
  }),
  term: PropTypes.string,
  isAddButtonVisible: PropTypes.bool
};

export default CustomizedTable;
