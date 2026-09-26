import { useContext, useState } from "react";
import PropTypes from "prop-types";
import {
  Alert,
  Autocomplete,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  Link,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CustomizedRadio from "../../common/CustomizedRadio";
import { createProperty } from "../../../api/endpoints/apiService";
import { GlobalDataContext } from "../../../contexts/DataContext";

// entity-new also accepts owl:Class and the CDE placeholders, and rejects
// owl:DatatypeProperty, so these two are the only predicate types on offer.
const PROPERTY_TYPES = [
  {
    rdfType: "owl:ObjectProperty",
    kind: "term",
    label: "Object property",
    hint: "Links the term to another term",
  },
  {
    rdfType: "owl:AnnotationProperty",
    kind: "text",
    label: "Annotation property",
    hint: "Annotates the term with a text value",
  },
];

const CreatePredicateDialog = ({ open, initialLabel = "", onClose, onCreated }) => {
  const { user } = useContext(GlobalDataContext);
  const [label, setLabel] = useState(initialLabel);
  const [rdfType, setRdfType] = useState(PROPERTY_TYPES[0].rdfType);
  const [synonyms, setSynonyms] = useState([]);
  const [saving, setSaving] = useState(false);
  const [clashes, setClashes] = useState([]);
  const [error, setError] = useState("");

  // The dialog stays mounted between openings, so reset the form each time it opens.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setLabel(initialLabel);
      setRdfType(PROPERTY_TYPES[0].rdfType);
      setSynonyms([]);
      setClashes([]);
      setError("");
    }
  }

  const trimmedLabel = label.trim();

  const submit = async () => {
    if (!trimmedLabel || saving) return;
    setSaving(true);
    setClashes([]);
    setError("");
    try {
      const result = await createProperty(user?.groupname || "base", {
        rdfType,
        label: trimmedLabel,
        exact: synonyms.map((s) => s.trim()).filter(Boolean),
      });
      if ("clashes" in result) setClashes(result.clashes);
      else if ("error" in result) setError(result.error);
      else {
        const { kind } = PROPERTY_TYPES.find((t) => t.rdfType === rdfType);
        onCreated({ iri: result.iri, label: trimmedLabel, kind });
      }
    } catch (e) {
      setError(e?.message || "Could not create the predicate");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create a new predicate</DialogTitle>
      <DialogContent>
        <Stack spacing={3} pt={1}>
          {/* Labels sit above the fields: the theme fixes input heights, which
              throws MUI's floating label off-centre inside the outline. */}
          <FormControl fullWidth required sx={{ gap: 0.75 }}>
            <FormLabel htmlFor="create-predicate-label">Label</FormLabel>
            <TextField
              id="create-predicate-label"
              autoFocus
              size="small"
              // Same inset as the synonyms Autocomplete below, whose padding the theme forces.
              sx={{ "& .MuiOutlinedInput-root": { px: 1 } }}
              placeholder="e.g. has part"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </FormControl>
          {/* Only the label is wrapped, to share the theme's FormLabel styling: the
              theme also pins every FormControlLabel inside a FormControl to a
              fixed-width single line, sized for the filter checkbox lists. */}
          <Stack spacing={0.5}>
            <FormControl>
              <FormLabel id="create-predicate-type">Type</FormLabel>
            </FormControl>
            <RadioGroup
              aria-labelledby="create-predicate-type"
              value={rdfType}
              onChange={(e) => setRdfType(e.target.value)}
            >
              {PROPERTY_TYPES.map((type) => (
                <FormControlLabel
                  key={type.rdfType}
                  value={type.rdfType}
                  control={<CustomizedRadio />}
                  label={
                    <Stack>
                      <Typography variant="body2">{type.label}</Typography>
                      <Typography variant="caption" color="text.secondary">{type.hint}</Typography>
                    </Stack>
                  }
                />
              ))}
            </RadioGroup>
          </Stack>
          <FormControl fullWidth sx={{ gap: 0.75 }}>
            <FormLabel htmlFor="create-predicate-synonyms">Exact synonyms</FormLabel>
            <Autocomplete
              id="create-predicate-synonyms"
              multiple
              freeSolo
              options={[]}
              value={synonyms}
              onChange={(_e, value) => setSynonyms(value)}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                  const { key, ...tagProps } = getTagProps({ index });
                  return <Chip key={key} variant="outlined" label={option} {...tagProps} />;
                })
              }
              renderInput={(params) => (
                <TextField {...params} placeholder="Type a synonym and press Enter" />
              )}
            />
          </FormControl>
          {clashes.length > 0 && (
            <Alert severity="warning">
              A term with this label or synonym already exists:
              <Stack component="ul" pl={2} m={0}>
                {clashes.map((iri) => (
                  <li key={iri}>
                    <Link href={iri} target="_blank" rel="noopener noreferrer">{iri}</Link>
                  </li>
                ))}
              </Stack>
            </Alert>
          )}
          {error && <Alert severity="error">{error}</Alert>}
          <Typography variant="caption" color="text.secondary">
            The predicate is created in {user?.groupname || "base"} right away. Its definition, domain and range
            can be added later by editing the new term.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button
          variant="contained"
          onClick={submit}
          disabled={!trimmedLabel || saving}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          Create predicate
        </Button>
      </DialogActions>
    </Dialog>
  );
};

CreatePredicateDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  initialLabel: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onCreated: PropTypes.func.isRequired,
};

export default CreatePredicateDialog;
