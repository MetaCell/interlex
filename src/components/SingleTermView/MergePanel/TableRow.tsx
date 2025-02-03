import React from "react"
import { Box, Typography } from "@mui/material"
import MergeStatusWrapper from "./MergeStatusWrapper"
import { vars } from "../../../theme/variables"

const { gray100, gray50, gray500, brand600, gray700 } = vars;

type RowProps = {
  id: string;
  subject: string;
  predicate: string;
}


type TableRowProps = {
  row: RowProps;
  compareRow?: RowProps;
  status: string;
  onDragStart: (id: string, index: number) => void;
  onDragEnter: (id: string, index: number) => void;
  onDragEnd: () => void;
  index: number;
}

const styles = {
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
  }
};

const TableRow: React.FC<TableRowProps> = ({ row, compareRow, status, onDragStart, onDragEnter, onDragEnd, index }) => {
  return (
    <Box
      sx={styles.root}
      draggable={true}
      onDragStart={() => onDragStart(row.id, index)}
      onDragEnter={() => onDragEnter(row.id, index)}
      onDragEnd={onDragEnd}
    >
      {(compareRow || status) && compareRow?.subject !== row.subject ? (
        <MergeStatusWrapper status={status}>
          <Box sx={{ paddingLeft: "0 !important" }}>
            <Typography>{row.subject}</Typography>
          </Box>
        </MergeStatusWrapper>
        ) : (
        <Box sx={{ paddingLeft: "0 !important" }}>
          <Typography>{row.subject}</Typography>
        </Box>
      )}
      {(compareRow || status) && compareRow?.predicate !== row.predicate ? (
        <MergeStatusWrapper status={status}>
          <Box>
            <Typography>{row.predicate}</Typography>
          </Box>
        </MergeStatusWrapper>
        ) : (
        <Box>
          <Typography>{row.predicate}</Typography>
        </Box>
      )}
    </Box>
  )
}

export default TableRow;

