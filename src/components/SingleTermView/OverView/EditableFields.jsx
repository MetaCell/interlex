// Edit-mode presentations of a term's values. Each one stages mutations into
// the edit session (nothing is sent until Save), and shows what is staged:
// "new" for a value the user added, "edited" for one they changed.
//
// These render only while edit mode is on — the read-only views elsewhere are
// left untouched so the default screen is unchanged.
import { useState } from "react";
import PropTypes from "prop-types";
import { Box, Button, Chip, IconButton, Stack, TextField, Tooltip } from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import ObjectInput from "./ObjectInput";
import { useEditSession } from "../../../contexts/editSession";

// A staged value is flagged by chip colour rather than a second element, so the
// list keeps its shape while being edited.
const chipColorFor = (status) => (status === "added" ? "success" : status === "edited" ? "info" : "default");

export const EditableChipList = ({
  predicate,
  values = [],
  kind = "text",
  group = "base",
  subject,
  onMutate,
  addLabel = "Add",
  chipClassName = "rounded",
}) => {
  const { applyToValues } = useEditSession();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  const resolved = applyToValues(predicate, values, subject);

  const cancelAdd = () => {
    setAdding(false);
    setDraft("");
  };
  const confirmAdd = () => {
    const value = draft.trim();
    if (!value) return cancelAdd();
    onMutate?.({ subject, predicate, op: "add", kind, newValue: value });
    cancelAdd();
  };
  const remove = (entry) =>
    onMutate?.({ subject, predicate, op: "delete", kind, oldValue: entry.value });

  return (
    <Stack spacing=".5rem" alignItems="flex-start">
      <Box display="flex" flexWrap="wrap" gap=".5rem">
        {resolved.map((entry) => (
          <Chip
            key={`${entry.value}-${entry.status}`}
            className={chipClassName}
            variant="outlined"
            color={chipColorFor(entry.status)}
            label={entry.value}
            onDelete={() => remove(entry)}
          />
        ))}
      </Box>
      {adding ? (
        <Box display="flex" alignItems="center" gap=".5rem" width={1}>
          <ObjectInput
            kind={kind}
            value={draft}
            group={group}
            onChange={setDraft}
            onConfirm={confirmAdd}
            onCancel={cancelAdd}
          />
          <Tooltip placement="top" title="Add">
            <IconButton onClick={confirmAdd} aria-label="Add value">
              <CheckOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip placement="top" title="Cancel">
            <IconButton onClick={cancelAdd} aria-label="Cancel">
              <CloseOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ) : (
        <Button size="small" color="secondary" startIcon={<AddOutlinedIcon />} onClick={() => setAdding(true)}>
          {addLabel}
        </Button>
      )}
    </Stack>
  );
};

EditableChipList.propTypes = {
  predicate: PropTypes.string.isRequired,
  values: PropTypes.arrayOf(PropTypes.string),
  kind: PropTypes.oneOf(["term", "text"]),
  group: PropTypes.string,
  subject: PropTypes.string,
  onMutate: PropTypes.func,
  addLabel: PropTypes.string,
  chipClassName: PropTypes.string,
};

// Single-valued literal (definition): staged as an edit of the stored value, or
// an add when the term has none yet. Committed on blur so a long definition
// isn't staged keystroke by keystroke.
export const EditableTextValue = ({ predicate, value = "", subject, onMutate, multiline = true, placeholder }) => {
  const { applyToValues } = useEditSession();
  const staged = applyToValues(predicate, value ? [value] : [], subject);
  const current = staged[0]?.value ?? "";
  const [draft, setDraft] = useState(current);
  // Follow the staged value when it changes underneath (cancel, save, reload).
  const [lastSeen, setLastSeen] = useState(current);
  if (lastSeen !== current) {
    setLastSeen(current);
    setDraft(current);
  }

  const commit = () => {
    const next = draft.trim();
    if (next === String(current ?? "").trim()) return;
    if (!value) {
      onMutate?.({ subject, predicate, op: "add", kind: "text", newValue: next });
    } else {
      onMutate?.({ subject, predicate, op: "edit", kind: "text", oldValue: current, newValue: next });
    }
  };

  return (
    <TextField
      fullWidth
      multiline={multiline}
      minRows={multiline ? 3 : 1}
      value={draft}
      placeholder={placeholder}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      color={staged[0]?.status === "clean" ? undefined : "info"}
      focused={staged[0] && staged[0].status !== "clean" ? true : undefined}
    />
  );
};

EditableTextValue.propTypes = {
  predicate: PropTypes.string.isRequired,
  value: PropTypes.string,
  subject: PropTypes.string,
  onMutate: PropTypes.func,
  multiline: PropTypes.bool,
  placeholder: PropTypes.string,
};
