import React from "react";
import PropTypes from "prop-types";
import ExpandIcon from "@mui/icons-material/Expand";
import RemoveIcon from "@mui/icons-material/Remove";
import ObjectInput from "./ObjectInput";
import PredicatesAccordion from "./PredicatesAccordion";
import CircularProgress from '@mui/material/CircularProgress';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import {
  Box, Typography, ToggleButton, ToggleButtonGroup,
  IconButton, Tooltip, FormControl, Select, MenuItem
} from "@mui/material";
import {
  ADDABLE_PREDICATES,
  getObjectInputKind,
} from "../../../configuration/predicateConfig";
import { vars } from "../../../theme/variables";

const { gray800, gray300, gray700 } = vars;

const Predicates = ({ data, isGraphVisible, loading, focusId, group, onMutate }) => {
  const [toggleButtonValue, setToggleButtonValue] = React.useState("expand");
  const [adding, setAdding] = React.useState(false);
  const [newPredicate, setNewPredicate] = React.useState(ADDABLE_PREDICATES[0].title);
  const [newValue, setNewValue] = React.useState("");

  const predicates = React.useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const onToggleButtonChange = (_e, v) => v && setToggleButtonValue(v);

  const objectKind = getObjectInputKind(newPredicate);

  const startAdd = () => { setNewValue(""); setNewPredicate(ADDABLE_PREDICATES[0].title); setAdding(true); };
  const cancelAdd = () => { setAdding(false); setNewValue(""); };
  const confirmAdd = () => {
    const value = newValue.trim();
    if (!value) return;
    onMutate?.({ predicate: newPredicate, op: "add", kind: getObjectInputKind(newPredicate), newValue: value });
    cancelAdd();
  };

  if (loading) {
    return <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress />
    </Box>
  }

  return (
    <Box display="flex" flexDirection="column" gap=".75rem">
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography color={gray800} fontWeight={500}>Predicates</Typography>
        <Box display="flex" alignItems="center" gap=".75rem">
          {!!onMutate && (
            <Tooltip title="Add a new predicate">
              <IconButton onClick={startAdd} sx={{ borderRadius: ".5rem", border: `1px solid ${gray300}` }}>
                <AddOutlinedIcon />
              </IconButton>
            </Tooltip>
          )}
          <ToggleButtonGroup
            value={toggleButtonValue}
            exclusive
            onChange={onToggleButtonChange}
            sx={{ gap: ".75rem", "& .MuiButtonBase-root": { borderRadius: ".5rem !important" } }}
          >
            <ToggleButton value="expand"><ExpandIcon /></ToggleButton>
            <ToggleButton value="compress"><RemoveIcon /></ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {adding && (
        <Box display="flex" alignItems="center" gap=".5rem">
          <FormControl sx={{ minWidth: '10rem' }}>
            <Select
              value={newPredicate}
              onChange={(e) => { setNewPredicate(e.target.value); setNewValue(""); }}
              sx={{
                color: gray700, fontSize: '0.875rem',
                '& .MuiOutlinedInput-input': { padding: '.5rem .75rem' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: gray300 },
              }}
            >
              {ADDABLE_PREDICATES.map((p) => (
                <MenuItem key={p.title} value={p.title}>{p.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <ObjectInput
            kind={objectKind}
            value={newValue}
            group={group}
            onChange={setNewValue}
            onConfirm={confirmAdd}
            onCancel={cancelAdd}
          />
          <Tooltip placement="top" title="Save">
            <IconButton onClick={confirmAdd}><CheckOutlinedIcon fontSize="small" /></IconButton>
          </Tooltip>
          <Tooltip placement="top" title="Cancel">
            <IconButton onClick={cancelAdd}><CloseOutlinedIcon fontSize="small" /></IconButton>
          </Tooltip>
        </Box>
      )}

      <PredicatesAccordion
        data={predicates}
        expandAllPredicates={toggleButtonValue === "expand"}
        isGraphVisible={isGraphVisible}
        focusId={focusId}
        group={group}
        onMutate={onMutate}
      />
    </Box>
  );
};

Predicates.propTypes = {
  data: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  isGraphVisible: PropTypes.bool,
  loading: PropTypes.bool,
  focusId: PropTypes.string,
  group: PropTypes.string,
  onMutate: PropTypes.func
};

export default Predicates;
