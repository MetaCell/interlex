import PropTypes from "prop-types";
import { Button, Popover, Stack, Typography } from "@mui/material";
import ObjectInput from "./ObjectInput";

const MIN_EDITOR_WIDTH_REM = 28;

// Airtable-style field editor: the cell expands into a card that sits over its
// neighbours, so a long value can be read and edited whole instead of through a
// one-line slot a third of the table wide. Clicking away keeps the edit, as in
// Airtable; only Esc or Cancel discards it.
const CellEditor = ({ anchorEl, title, kind, value, group, onChange, onConfirm, onCancel }) => {
  const cellWidth = anchorEl?.getBoundingClientRect().width ?? 0;

  const handleClose = (_event, reason) => (reason === "escapeKeyDown" ? onCancel() : onConfirm());

  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{ vertical: "top", horizontal: "left" }}
      transformOrigin={{ vertical: "top", horizontal: "left" }}
      slotProps={{ paper: { sx: { width: `max(${cellWidth}px, ${MIN_EDITOR_WIDTH_REM}rem)`, maxWidth: "calc(100vw - 2rem)" } } }}
    >
      <Stack spacing={1.5} p={1.5}>
        {title && <Typography variant="caption" color="text.secondary">{title}</Typography>}
        <ObjectInput
          kind={kind}
          value={value}
          group={group}
          multiline={kind === "text"}
          onChange={onChange}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          <Typography variant="caption" color="text.secondary">
            {kind === "text" ? "Enter to save · Shift+Enter for a new line · Esc to cancel" : "Enter to save · Esc to cancel"}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button size="small" variant="outlined" onClick={onCancel}>Cancel</Button>
            <Button size="small" variant="contained" onClick={onConfirm}>Save</Button>
          </Stack>
        </Stack>
      </Stack>
    </Popover>
  );
};

CellEditor.propTypes = {
  anchorEl: PropTypes.instanceOf(Element),
  title: PropTypes.string,
  kind: PropTypes.oneOf(["term", "text"]).isRequired,
  value: PropTypes.string,
  group: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default CellEditor;
