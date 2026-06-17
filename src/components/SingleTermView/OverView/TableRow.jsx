import { useState } from "react";
import PropTypes from "prop-types";
import ObjectInput from "./ObjectInput";
import { Box, IconButton, Tooltip, Typography, Link } from "@mui/material";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

function isValidURL(value) {
  return /^https?:\/\/[\w.-]+(\.[a-z]{2,})(:\d+)?(\/.*)?$/i.test(value);
}

const TableRow = ({
  tableStyles,
  data,
  onDragStart,
  onDragEnter,
  onDragEnd,
  index,
  columnWidth,
  editable = false,
  objectKind = "text",
  group = "base",
  onEdit,
  onDelete,
}) => {
  const { id, subject, predicate, object } = data;
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(object);

  const startEdit = () => {
    setDraft(object);
    setIsEditing(true);
  };
  const cancelEdit = () => setIsEditing(false);
  const confirmEdit = () => {
    setIsEditing(false);
    if (draft !== object) onEdit?.(data, draft);
  };

  return (
    <Box sx={tableStyles.root}
      draggable={!isEditing}
      onDragStart={e => onDragStart(id, index, e)}
      onDragEnter={e => onDragEnter(id, index, e)}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Box sx={{ width: columnWidth }}>
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
      <Box sx={{ width: columnWidth }}>
        <Tooltip title={predicate}>
          <Typography>
            {predicate}
          </Typography>
        </Tooltip>
      </Box>
      <Box sx={{ width: columnWidth }}>
        {isEditing ? (
          <ObjectInput
            kind={objectKind}
            value={draft}
            group={group}
            onChange={setDraft}
            onConfirm={confirmEdit}
            onCancel={cancelEdit}
          />
        ) : (
          <Tooltip title={object}>
            {isValidURL(object) ? (
              <Link href={object} target="_blank" rel="noopener noreferrer">
                {object}
              </Link>
            ) : (
              <Typography>{object}</Typography>
            )}
          </Tooltip>
        )}
      </Box>
      <Box display="flex" sx={{ width: '6.25rem', justifyContent: "flex-end" }}>
        {isEditing ? (
          <>
            <Tooltip placement="top" title="Save">
              <IconButton onClick={confirmEdit}>
                <CheckOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip placement="top" title="Cancel">
              <IconButton onClick={cancelEdit}>
                <CloseOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        ) : (
          editable && isHovered && (
            <>
              <Tooltip placement="top" title="Edit">
                <IconButton onClick={startEdit}>
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip placement="top" title="Delete">
                <IconButton onClick={() => onDelete?.(data)}>
                  <DeleteOutlineOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )
        )}
      </Box>
    </Box>);
};

TableRow.propTypes = {
  tableStyles: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
  onDragStart: PropTypes.func.isRequired,
  onDragEnter: PropTypes.func.isRequired,
  onDragEnd: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  columnWidth: PropTypes.number.isRequired,
  editable: PropTypes.bool,
  objectKind: PropTypes.oneOf(["term", "text"]),
  group: PropTypes.string,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

export default TableRow;
