import { Box, IconButton, Typography } from "@mui/material";
import {useEffect, useRef, useState} from "react";
import TableRow from "./TableRow";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import { vars } from "../../../theme/variables";
import SingleSearch from "../SingleSearch";

const { gray100, gray50, gray600, gray500, brand600 } = vars;

const types = [
  'Is part of',
  'Related to',
  'Has Dbx ref',
  'Has exact synonym'
]

const initialTableContent = [
  {
    "id": "1",
    "Subject": "Central nervous system 1",
    "Predicates": "is part of",
    "Objects": "Central nervous system 2",
  },
  {
    "id": "2",
    "Subject": "Peripheral nervous system 2",
    "Predicates": "is part of",
    "Objects": "Central nervous system 4",
  },
  {
    "id": "3",
    "Subject": "Autonomic nervous system 3",
    "Predicates": "is part of",
    "Objects": "Central nervous system 7",
  },
  {
    "id": "4",
    "Subject": "Somatic nervous system 4",
    "Predicates": "is part of",
    "Objects": "Central nervous system 3",
  }
];

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
      color: gray600,
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: '1.25rem',
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
  }
};

const CustomizedTable = () => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [tableContent, setTableContent] = useState(initialTableContent);
  const [tableHeader, setTableHeader] = useState([
    { key: 'Subject', label: 'Subject', allowSort: true, direction: 'desc' },
    { key: 'Predicates', label: 'Predicates', allowSort: false },
    { key: 'Objects', label: 'Objects', allowSort: true, direction: 'desc' },
    { key: '', label: '' }
  ]);
  
  const [showSelect, setShowSelect] = useState(false);
  const [subject, setSubject] = useState('');
  const [object, setObject] = useState('');
  
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
  
  const handleAddClick = () => {
    setShowSelect(true);
  };
  const updateTableContent = (newSubject, newObject) => {
    const newId = tableContent.length + 1;
    const newRow = {
      id: newId.toString(),
      Subject: newSubject,
      Predicates: 'is part of',
      Objects: newObject
    };
    
    setTableContent([...tableContent, newRow]);
    setShowSelect(false);
    setSubject('');
    setObject('');
  };
  const handleSelectChange = (e, type) => {
    if (type === 'subject') {
      setSubject(e);
    }
    if (type === 'object') {
      setObject(e);
    }

    if (subject && object) {
      updateTableContent(type === 'subject' ? e.label : subject, type === 'object' ? e.label : object);
    }
  };
  
  useEffect(() => {
    if (subject && object) {
      updateTableContent(subject, object);
    }
  }, [subject, object])
  return (
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
          <TableRow key={row.id} tableStyles={tableStyles} data={row} index={index} onDragStart={dragStart} onDragEnter={dragEnter} onDragEnd={dragEnd} />)
        }
      </Box>
    
      <Box sx={tableStyles.root}>
        {!showSelect ? (
          <Box sx={{ paddingLeft: '0 !important' }}>
            <IconButton onClick={handleAddClick}>
              <AddOutlinedIcon />
            </IconButton>
          </Box>
        ) : (
          <>
            <>
              <Box sx={{paddingLeft: '0 !important', width: '100%'}}>
                <SingleSearch selectedValue={subject} onChange={(e) => handleSelectChange(e, 'subject')} startAdornment={false} options={types} />
              </Box>
              <Box />
              <Box sx={{ width: '100%'}}>
                <SingleSearch selectedValue={object} onChange={(e) => handleSelectChange(e, 'object')} startAdornment={false} options={types} />
              </Box>
              <Box />
            </>
          </>
        )}
      </Box>
    </Box>
  );
};

export default CustomizedTable;
