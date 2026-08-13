import React from "react"
import { Box, Typography } from "@mui/material"
import MergeStatusWrapper from "./MergeStatusWrapper"
import { rowKey } from "./termDiff"
import { COLUMN_WIDTHS, cellSx } from "./TableChanges"
import { vars } from "../../../theme/variables"

const { gray100, gray50, gray500, brand600, gray700 } = vars;

type RowProps = {
  id?: string;
  subject?: string;
  predicate?: string;
  object?: string;
}


type TableRowProps = {
  row: RowProps;
  /** Triple keys the other side of the delta carries; a row missing from it is a change. */
  compareRowKeys?: Set<string>;
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
    },
  }
};

const TableRow: React.FC<TableRowProps> = ({ row, compareRowKeys, status, onDragStart, onDragEnter, onDragEnd, index }) => {
  // The whole triple is the unit of change: a predicate/object pair either exists on the other
  // side or it doesn't, so the row is flagged as a whole rather than cell by cell.
  const isDifferent = !!compareRowKeys && !compareRowKeys.has(rowKey(row));

  const cell = (value: string | undefined, width: string) => (
    <Box sx={cellSx(width)}>
      <Typography title={value}>{value}</Typography>
    </Box>
  );

  const content = (
    <>
      {cell(row.subject, COLUMN_WIDTHS[0])}
      {cell(row.predicate, COLUMN_WIDTHS[1])}
      {cell(row.object, COLUMN_WIDTHS[2])}
    </>
  );

  return (
    <Box
      sx={styles.root}
      draggable={true}
      onDragStart={() => onDragStart(row.id, index)}
      onDragEnter={() => onDragEnter(row.id, index)}
      onDragEnd={onDragEnd}
    >
      {isDifferent ? (
        <MergeStatusWrapper status={status} fullWidth>
          <Box display="flex" width={1}>{content}</Box>
        </MergeStatusWrapper>
      ) : (
        content
      )}
    </Box>
  )
}

export default TableRow;
