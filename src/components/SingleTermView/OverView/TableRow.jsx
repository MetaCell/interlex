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
  status,
  objectKind = "text",
  group = "base",
  onEdit,
  onDelete,
}) => {
  const { id, subject, predicate, object } = data;
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(object);
  const statusChip = STATUS_CHIP[status];

  const startEdit = () => {
    setDraft(object);
    setIsEditing(true);
  };
  const cancelEdit = () => setIsEditing(false);
  const confirmEdit = () => {
    setIsEditing(false);
    const next = draft.trim();
    if (next && next !== object) onEdit?.(data, next);
  };

  return (
    <Box sx={tableStyles.root}
      draggable={!isEditing}
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
      {isEditing && (
        <CellEditor
          title={predicate}
          kind={objectKind}
          value={draft}
          group={group}
          onChange={setDraft}
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
  status: PropTypes.oneOf(["clean", "added", "edited", "deleted"]),
  objectKind: PropTypes.oneOf(["term", "text"]),
  group: PropTypes.string,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

export default TableRow;
