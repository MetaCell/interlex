import PropTypes from "prop-types";
import { Button, Card, CardContent, Stack, Typography } from "@mui/material";
import ObjectInput from "./ObjectInput";

// Airtable-style field editor, opened inside its row: the row grows to hold it rather than the card
// floating over the rows below, so several rows of a predicate can be open for editing at once and
// none of them is hidden behind another. Only Save/Enter keeps the edit; Esc or Cancel discards it.
const CellEditor = ({ title, kind, value, group, onChange, onConfirm, onCancel }) => (
  <Card raised sx={{ flexBasis: "100%", mt: 1 }}>
    <CardContent>
      <Stack spacing={1.5}>
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
    </CardContent>
  </Card>
);

CellEditor.propTypes = {
  title: PropTypes.string,
  kind: PropTypes.oneOf(["term", "text"]).isRequired,
  value: PropTypes.string,
  group: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default CellEditor;
