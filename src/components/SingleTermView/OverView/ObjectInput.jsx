import { debounce } from "lodash";
import PropTypes from "prop-types";
import { useCallback, useEffect, useState } from "react";
import { Autocomplete, Box, TextField } from "@mui/material";
import { getMatchTerms } from "../../../api/endpoints/apiService";

import { vars } from "../../../theme/variables";
const { gray300 } = vars;

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "0.5rem",
    fontSize: "0.875rem",
    background: "#fff",
  },
  "& input": { padding: "0.5rem 0.75rem", height: "1.25rem" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: gray300 },
};

const moveCaretToEnd = (e) => {
  const { length } = e.target.value;
  e.target.setSelectionRange(length, length);
};

// Inline editor for a predicate object. Behaviour depends on `kind`:
//  - "text": plain text box (e.g. ilxr:synonym, definition)
//  - "term": term-search combobox that also accepts an exact URI (freeSolo)
// A `multiline` text box grows with its content; Enter still confirms there, so
// a newline takes Shift+Enter.
const ObjectInput = ({ kind, value, onChange, onConfirm, onCancel, group = "base", autoFocus = true, multiline = false }) => {
  const [terms, setTerms] = useState([]);
  const [inputValue, setInputValue] = useState(value || "");

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchTerms = useCallback(
    debounce(async (searchTerm) => {
      const data = await getMatchTerms(group, searchTerm);
      setTerms(data?.results || []);
    }, 400),
    [group]
  );

  useEffect(() => {
    if (kind === "term" && inputValue) fetchTerms(inputValue);
  }, [kind, inputValue, fetchTerms]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onConfirm?.();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel?.();
    }
  };

  if (kind === "term") {
    return (
      <Box flex={1}>
        <Autocomplete
          freeSolo
          disableClearable
          forcePopupIcon={false}
          options={terms}
          getOptionLabel={(o) => (typeof o === "string" ? o : o?.label || o?.id || "")}
          inputValue={inputValue}
          onInputChange={(_e, v) => {
            setInputValue(v);
            onChange(v);
          }}
          onChange={(_e, v) => {
            const next = typeof v === "string" ? v : v?.iri || v?.id || v?.label || "";
            setInputValue(next);
            onChange(next);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              autoFocus={autoFocus}
              placeholder="Search a term or paste an exact URI"
              onKeyDown={handleKeyDown}
              sx={inputSx}
            />
          )}
        />
      </Box>
    );
  }

  return (
    <Box flex={1}>
      <TextField
        fullWidth
        autoFocus={autoFocus}
        multiline={multiline}
        minRows={multiline ? 3 : undefined}
        maxRows={multiline ? 12 : undefined}
        size={multiline ? "small" : undefined}
        onFocus={multiline ? moveCaretToEnd : undefined}
        value={inputValue}
        placeholder="Enter a value"
        onChange={(e) => {
          setInputValue(e.target.value);
          onChange(e.target.value);
        }}
        onKeyDown={handleKeyDown}
        sx={inputSx}
      />
    </Box>
  );
};

ObjectInput.propTypes = {
  kind: PropTypes.oneOf(["term", "text"]).isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  group: PropTypes.string,
  autoFocus: PropTypes.bool,
  multiline: PropTypes.bool,
};

export default ObjectInput;
