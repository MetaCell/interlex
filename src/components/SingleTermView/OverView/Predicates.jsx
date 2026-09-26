import React from "react";
import PropTypes from "prop-types";
import ExpandIcon from "@mui/icons-material/Expand";
import RemoveIcon from "@mui/icons-material/Remove";
import ObjectInput from "./ObjectInput";
import PredicatesAccordion from "./PredicatesAccordion";
import CreatePredicateDialog from "./CreatePredicateDialog";
import CircularProgress from '@mui/material/CircularProgress';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import {
  Autocomplete, Box, Typography, ToggleButton, ToggleButtonGroup,
  IconButton, TextField, Tooltip, createFilterOptions
} from "@mui/material";
import {
  ADDABLE_PREDICATES,
  getObjectInputKind,
  isReadOnlyPredicate,
} from "../../../configuration/predicateConfig";
import { samePredicate, useEditSession } from "../../../contexts/editSession";
import { vars } from "../../../theme/variables";

const { gray800, gray300 } = vars;

const filterPredicates = createFilterOptions({ stringify: (option) => `${option.label} ${option.title}` });

// Picking the trailing entry opens the create dialog instead of selecting a
// predicate; it carries whatever was typed so the dialog starts from it.
const withCreateOption = (options, state) => {
  const filtered = filterPredicates(options, state);
  const typed = state.inputValue.trim();
  const exists = options.some((o) => o.label.toLowerCase() === typed.toLowerCase());
  return [
    ...filtered,
    {
      create: true,
      title: "",
      label: typed && !exists ? `Create new predicate "${typed}"` : "Create a new predicate…",
      inputValue: exists ? "" : typed,
    },
  ];
};

const objectKindOf = (option) => option?.kind || getObjectInputKind(option?.title);

const Predicates = ({ data, isGraphVisible, loading, focusId, group, onMutate }) => {
  const { pending, applyToValues } = useEditSession();
  // Predicates created in this view: entity-new has already persisted them, but
  // the term only carries them once a staged value is saved.
  const [createdPredicates, setCreatedPredicates] = React.useState([]);

  const [toggleButtonValue, setToggleButtonValue] = React.useState("expand");
  const [adding, setAdding] = React.useState(false);
  const [newPredicate, setNewPredicate] = React.useState(null);
  const [newValue, setNewValue] = React.useState("");
  const [createDialog, setCreateDialog] = React.useState({ open: false, initialLabel: "" });

  const loadedPredicates = React.useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const predicateOptions = React.useMemo(() => {
    const onTerm = loadedPredicates
      .filter((p) => p.title && !isReadOnlyPredicate(p.title))
      .map((p) => ({ title: p.title, label: p.title }));
    const options = [];
    [...createdPredicates, ...ADDABLE_PREDICATES, ...onTerm].forEach((option) => {
      if (!options.some((o) => samePredicate(o.title, option.title))) options.push(option);
    });
    return options;
  }, [loadedPredicates, createdPredicates]);

  // A value staged under a predicate the term doesn't carry yet has no group to
  // show up in until it's saved, so give it one.
  const predicates = React.useMemo(() => {
    const staged = [];
    pending.forEach((entry) => {
      if (entry.op !== "add") return;
      if ([...loadedPredicates, ...staged].some((p) => samePredicate(p.title, entry.predicate))) return;
      if (!applyToValues(entry.predicate, []).length) return;
      const option = predicateOptions.find((o) => samePredicate(o.title, entry.predicate));
      staged.push({
        title: entry.predicate,
        label: option?.label,
        count: 0,
        rows: [],
        objectKind: entry.kind,
      });
    });
    return staged.length ? [...staged, ...loadedPredicates] : loadedPredicates;
  }, [pending, applyToValues, loadedPredicates, predicateOptions]);

  const onToggleButtonChange = (_e, v) => v && setToggleButtonValue(v);

  const objectKind = objectKindOf(newPredicate);

  const startAdd = () => { setNewValue(""); setNewPredicate(predicateOptions[0] ?? null); setAdding(true); };
  const cancelAdd = () => { setAdding(false); setNewValue(""); };
  const confirmAdd = () => {
    const value = newValue.trim();
    if (!value || !newPredicate) return;
    onMutate?.({ predicate: newPredicate.title, op: "add", kind: objectKind, newValue: value });
    cancelAdd();
  };

  const selectPredicate = (_e, option) => {
    if (option?.create) {
      setCreateDialog({ open: true, initialLabel: option.inputValue });
      return;
    }
    setNewPredicate(option);
    setNewValue("");
  };

  const onPredicateCreated = ({ iri, label, kind }) => {
    const option = { title: iri, label, kind };
    setCreatedPredicates((list) => [option, ...list]);
    setNewPredicate(option);
    setNewValue("");
    setCreateDialog({ open: false, initialLabel: "" });
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
          <Autocomplete
            disableClearable
            options={predicateOptions}
            value={newPredicate}
            onChange={selectPredicate}
            filterOptions={withCreateOption}
            getOptionLabel={(option) => option?.label ?? ""}
            isOptionEqualToValue={(option, value) => samePredicate(option.title, value?.title)}
            renderOption={(props, option) => (
              <li {...props} key={option.create ? "create-predicate" : option.title}>
                <Typography variant="body2" color={option.create ? "primary" : undefined}>
                  {option.label}
                </Typography>
              </li>
            )}
            renderInput={(params) => <TextField {...params} placeholder="Predicate" />}
            sx={{ width: "16rem" }}
          />
          <ObjectInput
            key={newPredicate?.title}
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

      <CreatePredicateDialog
        open={createDialog.open}
        initialLabel={createDialog.initialLabel}
        onClose={() => setCreateDialog({ open: false, initialLabel: "" })}
        onCreated={onPredicateCreated}
      />

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
