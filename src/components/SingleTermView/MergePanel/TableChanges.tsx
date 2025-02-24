import React, { useRef, useState, useEffect } from "react"
import { Box, Typography, IconButton } from "@mui/material"
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import TableRow from "./TableRow"
import { vars } from "../../../theme/variables"

const { gray100, gray600 } = vars;

const styles = {
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
  }
};

export const TableChanges = ({ data, compareData, status }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [tableContent, setTableContent] = useState(data?.tableData);
  const [tableHeader, setTableHeader] = useState([
    { key: 'subject', label: 'Subject', allowSort: false, direction: 'desc' },
    { key: 'predicate', label: 'Predicates', allowSort: false },
    { key: 'object', label: 'Objects', allowSort: true, direction: 'desc' },
    { key: '', label: '' }
  ]);

  const sourceRow = useRef<{ id: string; index: number } | null>(null);
  const targetRow = useRef<{ id: string; index: number } | null>(null);

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

  return (
    <Box pb={1.5}>
      <Box sx={styles.head}>
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
      <Box>
        {tableContent.map((row, idx) => (
          <TableRow
            key={`${row.id}-${idx}`}
            row={row}
            compareRow={compareData?.tableData[idx]}
            status={status}
            onDragStart={dragStart}
            onDragEnter={dragEnter}
            onDragEnd={dragEnd}
            index={idx}
          />
        ))}
      </Box>
    </Box>
  )
}

export default TableChanges;

