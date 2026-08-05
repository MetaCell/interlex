import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { SearchIcon } from "../../Icons";

// Free-text prefix filter over the ontology. Per design: does not filter until Enter.
const GridSearchBar = ({ value, onSubmit }) => {
  const [text, setText] = useState(value || "");
  useEffect(() => setText(value || ""), [value]);

  const submit = (next) => onSubmit(next.trim());

  return (
    <TextField
      size="small"
      placeholder="Filter by word"
      value={text}
      onChange={(e) => setText(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") submit(text);
      }}
      sx={{ width: "18rem" }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
        endAdornment: text ? (
          <InputAdornment position="end">
            <IconButton
              size="small"
              aria-label="clear filter"
              onClick={() => {
                setText("");
                submit("");
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ) : null,
      }}
    />
  );
};

GridSearchBar.propTypes = {
  value: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
};

export default GridSearchBar;
