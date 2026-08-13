// Header controls for the term edit session.
//
// Out of edit mode a logged-in user sees a single "Edit" button; turning it on
// makes every field that maps to a triple on this term editable, and the pair
// of Save / Cancel buttons replaces it until the session ends.
import PropTypes from "prop-types";
import { Button, Chip, CircularProgress, Stack } from "@mui/material";
import ModeEditOutlineOutlinedIcon from "@mui/icons-material/ModeEditOutlineOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import { useEditSession } from "../../contexts/editSession";

const TermEditActions = ({ visible = true }) => {
  const { available, isEditing, saving, pendingCount, startEdit, cancelEdit, save } = useEditSession();

  // Anonymous visitors get no edit affordance, and neither do tabs/screens that
  // have nothing editable on them — but an open session keeps its Save/Cancel
  // wherever the user navigates to, so staged changes are never stranded.
  if (!available || (!visible && !isEditing)) return null;

  if (!isEditing) {
    return (
      <Button type="string" color="secondary" startIcon={<ModeEditOutlineOutlinedIcon />} onClick={startEdit}>
        Edit
      </Button>
    );
  }

  return (
    <Stack direction="row" alignItems="center" spacing=".75rem">
      <Chip
        size="small"
        color={pendingCount ? "info" : "default"}
        label={pendingCount === 1 ? "1 unsaved change" : `${pendingCount} unsaved changes`}
      />
      <Button
        type="string"
        color="secondary"
        startIcon={<CloseOutlinedIcon />}
        onClick={cancelEdit}
        disabled={saving}
      >
        Cancel
      </Button>
      <Button
        variant="contained"
        startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <CheckOutlinedIcon />}
        onClick={save}
        disabled={saving || !pendingCount}
      >
        Save changes
      </Button>
    </Stack>
  );
};

TermEditActions.propTypes = {
  visible: PropTypes.bool,
};

export default TermEditActions;
