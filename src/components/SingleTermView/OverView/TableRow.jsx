import { useState } from "react";
import PropTypes from "prop-types";
import CellEditor from "./CellEditor";
import { Box, Chip, IconButton, Tooltip, Typography, Link } from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

function isValidURL(value) {
  return /^https?:\/\/[\w.-]+(\.[a-z]{2,})(:\d+)?(\/.*)?$/i.test(value);
}

// Staged-change badge: the row already shows the value it will have once the
// edit session is saved, so the badge is what says it isn't persisted yet.
const STATUS_CHIP = {
  added: { label: "New", color: "success" },
  edited: { label: "Edited", color: "info" },
  deleted: { label: "Removed", color: "error" },
};

// Owns the draft so every opening starts from the row's current value, whether
// the row opened itself or the whole predicate was put in edit mode.
const RowEditor = ({ initialValue, onConfirm, ...editorProps }) => {
  const [draft, setDraft] = useState(initialValue);
  return <CellEditor {...editorProps} value={draft} onChange={setDraft} onConfirm={() => onConfirm(draft.trim())} />;
};

RowEditor.propTypes = {
  initialValue: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
};

const TableRow = ({
  tableStyles,
  data,
  onDragStart,
  onDragEnter,
  onDragEnd,
  index,
  columnFlex,
  actionsWidth,
  editable = false,
  isEditing = false,
  onEditingChange,
  status,
  objectKind = "text",
  group = "base",
  onEdit,
  onDelete,
}) => {
  const { id, subject, predicate, object } = data;
  const statusChip = STATUS_CHIP[status];
  const editorOpen = editable && isEditing;

  const startEdit = () => onEditingChange?.(true);
  const cancelEdit = () => onEditingChange?.(false);
  const confirmEdit = (next) => {
    onEditingChange?.(false);
    if (next && next !== object) onEdit?.(data, next);
  };

  return (
    <Box sx={tableStyles.root}
      draggable={!editorOpen}
      onDragStart={e => onDragStart(id, index, e)}
      onDragEnter={e => onDragEnter(id, index, e)}
      onDragEnd={onDragEnd}
    >
      <Box sx={{ flex: columnFlex.subject }}>
        <Tooltip title={subject}>
          {isValidURL(subject) ? (
            <Link href={subject} target="_blank" rel="noopener noreferrer">
              {subject}
            </Link>
          ) : (
            <Typography>{subject}</Typography>
          )}
        </Tooltip>
      </Box>
      <Box sx={{ flex: columnFlex.predicate }}>
        <Tooltip title={predicate}>
          <Typography>
            {predicate}
          </Typography>
        </Tooltip>
      </Box>
      <Box sx={{ flex: columnFlex.object }} onDoubleClick={editable ? startEdit : undefined}>
        <Tooltip title={object}>
          {isValidURL(object) ? (
            <Link href={object} target="_blank" rel="noopener noreferrer">
              {object}
            </Link>
          ) : (
            <Typography>{object}</Typography>
          )}
        </Tooltip>
        {statusChip && (
          <Chip size="small" color={statusChip.color} label={statusChip.label} sx={{ flexShrink: 0 }} />
        )}
      </Box>
      {actionsWidth && (
        <Box display="flex" sx={{ width: actionsWidth, flexShrink: 0, justifyContent: "flex-end", alignItems: "center" }}>
          {/* Edit mode shows the controls outright — hover-to-reveal was the
              affordance back when any row could be edited at any time. */}
          {editable && (
            <>
              <Tooltip placement="top" title="Edit">
                <IconButton onClick={startEdit} aria-label="Edit value">
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip placement="top" title="Delete">
                <IconButton onClick={() => onDelete?.(data)} aria-label="Delete value">
                  <DeleteOutlineOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      )}
      {editorOpen && (
        <RowEditor
          title={predicate}
          kind={objectKind}
          initialValue={object}
          group={group}
          onConfirm={confirmEdit}
          onCancel={cancelEdit}
        />
      )}
    </Box>);
};

TableRow.propTypes = {
  tableStyles: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
  onDragStart: PropTypes.func.isRequired,
  onDragEnter: PropTypes.func.isRequired,
  onDragEnd: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  columnFlex: PropTypes.shape({
    subject: PropTypes.number.isRequired,
    predicate: PropTypes.number.isRequired,
    object: PropTypes.number.isRequired,
  }).isRequired,
  actionsWidth: PropTypes.string,
  editable: PropTypes.bool,
  isEditing: PropTypes.bool,
  onEditingChange: PropTypes.func,
  status: PropTypes.oneOf(["clean", "added", "edited", "deleted"]),
  objectKind: PropTypes.oneOf(["term", "text"]),
  group: PropTypes.string,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

export default TableRow;
