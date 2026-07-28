import PropTypes from "prop-types";
import { useState, useCallback } from "react";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  FormControl,
  FormLabel,
  FormGroup,
  Button,
  Switch,
  Checkbox,
  FormControlLabel,
  Link,
} from "@mui/material";
import {
  CheckboxDefault,
  CheckboxSelected,
  CheckboxIndeterminate,
  HelpOutlinedIcon,
  ExpandRowsIcon,
} from "../../Icons";
import { vars } from "../../theme/variables";
import { termLink } from "./config/gridConfig";

const { gray200, gray300, gray400, gray500, gray600, gray700, gray800, brand700, brand800 } = vars;

// Values shown per facet while collapsed; above it the expand control appears.
const VISIBLE_LIMIT = 5;

// Labels ellipsize instead of widening the pane — the sidebar never scrolls sideways.
const ellipsis = { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };

// "Clear filters" / "Show more" — text-only buttons (Text sm/Semibold).
const textButtonSx = {
  minWidth: 0,
  flexShrink: 0,
  height: "1.25rem",
  p: 0,
  fontSize: "0.875rem",
  fontWeight: 600,
  lineHeight: "1.25rem",
  whiteSpace: "nowrap",
  color: brand700,
  "&:hover": { color: brand800, background: "transparent" },
  "&.Mui-disabled": { color: gray400 },
};

const iconButtonSx = {
  p: 0,
  flexShrink: 0,
  color: gray600,
  background: "transparent",
  "&:hover": { background: "transparent", color: gray800 },
  "&.Mui-disabled": { color: gray300 },
};

const checkboxSx = { p: 0, flexShrink: 0 };

// Master checkbox: clears every facet, so it is inert (and must look inert)
// while no filter is active — the icon SVGs carry their own colours, hence the
// explicit disabled treatment.
const masterCheckboxSx = { ...checkboxSx, "&.Mui-disabled": { opacity: 0.45 } };

const FacetCheckbox = ({ checked, onChange, label }) => (
  <Checkbox
    disableRipple
    icon={<CheckboxDefault />}
    checkedIcon={<CheckboxSelected />}
    checked={checked}
    onChange={onChange}
    sx={checkboxSx}
    inputProps={{ "aria-label": label }}
  />
);

FacetCheckbox.propTypes = {
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
};

const FacetGroup = ({ facet, checked, expanded, onToggle, onClear, onToggleExpanded }) => {
  const anyChecked = Object.values(checked || {}).some(Boolean);
  const expandable = facet.values.length > VISIBLE_LIMIT;
  const values = expanded ? facet.values : facet.values.slice(0, VISIBLE_LIMIT);
  const toggleExpanded = () => onToggleExpanded(facet.localName);

  return (
    <FormControl
      sx={{ width: 1, minWidth: 0, gap: 1.5 }}
      component="fieldset"
      variant="standard"
    >
      <Box display="flex" alignItems="center" gap={1.5} sx={{ minWidth: 0 }}>
        <Box display="flex" alignItems="center" gap={0.5} sx={{ flex: 1, minWidth: 0 }}>
          <FormLabel component="legend" title={facet.title} sx={{ ...ellipsis, minWidth: 0 }}>
            {facet.title}
          </FormLabel>
          {facet.tooltip && (
            <Tooltip title={facet.tooltip}>
              <IconButton sx={iconButtonSx} aria-label={`About ${facet.title}`}>
                <HelpOutlinedIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        {/* Expand control lives on the header so it stays put when the list grows. */}
        <Box display="flex" alignItems="center" gap={1} sx={{ flexShrink: 0 }}>
          {expandable && (
            <>
              <Tooltip title={expanded ? "Show fewer values" : "Show all values"}>
                <IconButton onClick={toggleExpanded} sx={iconButtonSx}>
                  <ExpandRowsIcon />
                </IconButton>
              </Tooltip>
              <Box sx={{ mx: "2px", width: "1px", height: "1.25rem", background: gray200 }} />
            </>
          )}
          <Button
            variant="text"
            disabled={!anyChecked}
            onClick={() => onClear(facet.localName)}
            sx={textButtonSx}
          >
            Clear filters
          </Button>
        </Box>
      </Box>

      {/* nowrap: FormGroup wraps by default, which would size rows to their
          max-content width and defeat the per-label ellipsis. */}
      <FormGroup sx={{ gap: 1.5, width: 1, minWidth: 0, flexWrap: "nowrap" }}>
        {values.map((v) => {
          const href = termLink(v);
          const labelSx = {
            ...ellipsis,
            flex: 1,
            minWidth: 0,
            color: gray700,
            fontWeight: 500,
          };
          return (
            <Box key={v.key} display="flex" alignItems="center" gap={1} sx={{ width: 1, minWidth: 0 }}>
              <FacetCheckbox
                checked={!!checked?.[v.key]}
                onChange={() => onToggle(facet.localName, v.key)}
                label={v.label}
              />
              {href ? (
                <Link
                  href={href}
                  target="_blank"
                  rel="noopener"
                  underline="hover"
                  variant="body2"
                  title={v.label}
                  sx={labelSx}
                >
                  {v.label}
                </Link>
              ) : (
                <Typography variant="body2" title={v.label} sx={labelSx}>
                  {v.label}
                </Typography>
              )}
              {/* Count: right-aligned against the pane edge, natural width (no count column). */}
              <Typography variant="body2" sx={{ flexShrink: 0, color: gray500, textAlign: "right" }}>
                {v.count}
              </Typography>
            </Box>
          );
        })}
      </FormGroup>

      {expandable && (
        <Button variant="text" onClick={toggleExpanded} sx={{ ...textButtonSx, alignSelf: "flex-start" }}>
          {expanded ? "Show less" : "Show more"}
        </Button>
      )}
    </FormControl>
  );
};

FacetGroup.propTypes = {
  facet: PropTypes.object.isRequired,
  checked: PropTypes.object,
  expanded: PropTypes.bool,
  onToggle: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  onToggleExpanded: PropTypes.func.isRequired,
};

// Left filter pane. Facets are data-driven; unchecked = all, checking filters down.
const GridFilterSidebar = ({
  facets,
  checked,
  onToggle,
  onClear,
  onClearAll,
  displayedOnly,
  onToggleDisplayedOnly,
}) => {
  const [expanded, setExpanded] = useState({});

  const onToggleExpanded = useCallback(
    (localName) => setExpanded((prev) => ({ ...prev, [localName]: !prev[localName] })),
    []
  );

  const expandable = facets.filter((f) => f.values.length > VISIBLE_LIMIT);
  const allExpanded = expandable.length > 0 && expandable.every((f) => expanded[f.localName]);
  const toggleAll = () =>
    setExpanded(
      allExpanded ? {} : Object.fromEntries(expandable.map((f) => [f.localName, true]))
    );

  const anySelection = Object.values(checked).some((sel) =>
    Object.values(sel || {}).some(Boolean)
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        width: "22.5rem",
        minWidth: 0,
        borderRight: `1px solid ${gray200}`,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 3,
          pt: 3,
          pb: 1.5,
          minHeight: "4.5rem",
          minWidth: 0,
          flexShrink: 0,
        }}
      >
        <Tooltip title={anySelection ? "Clear all filters" : "No active filters"}>
          {/* Wrapper: a disabled input fires no events, so the tooltip needs a host. */}
          <Box component="span" sx={{ display: "inline-flex", flexShrink: 0 }}>
            <Checkbox
              disableRipple
              icon={<CheckboxDefault />}
              indeterminateIcon={<CheckboxIndeterminate />}
              indeterminate={anySelection}
              checked={false}
              disabled={!anySelection}
              onChange={onClearAll}
              sx={masterCheckboxSx}
              inputProps={{ "aria-label": "Clear all filters" }}
            />
          </Box>
        </Tooltip>
        <Typography
          title="Filters"
          sx={{ ...ellipsis, flex: 1, minWidth: 0, fontSize: "1.125rem", fontWeight: 600, color: gray800 }}
        >
          Filters
        </Typography>
        <FormControlLabel
          control={<Switch size="small" checked={displayedOnly} onChange={onToggleDisplayedOnly} />}
          label={
            <Typography variant="body2" noWrap sx={{ color: gray500 }}>
              Displayed properties
            </Typography>
          }
          sx={{ m: 0, gap: 0.5, flexShrink: 0 }}
        />
        <Tooltip title={allExpanded ? "Collapse all filters" : "Expand all filters"}>
          <IconButton onClick={toggleAll} disabled={!expandable.length} sx={iconButtonSx}>
            <ExpandRowsIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Own scroll, independent of the results panel; never scrolls horizontally. */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          overflowY: "auto",
          overflowX: "hidden",
          display: "flex",
          flexDirection: "column",
          gap: 4,
          px: 3,
          pt: 1.5,
          pb: 5,
        }}
      >
        {facets.map((facet) => (
          <FacetGroup
            key={facet.localName}
            facet={facet}
            checked={checked[facet.localName]}
            expanded={!!expanded[facet.localName]}
            onToggle={onToggle}
            onClear={onClear}
            onToggleExpanded={onToggleExpanded}
          />
        ))}
      </Box>
    </Box>
  );
};

GridFilterSidebar.propTypes = {
  facets: PropTypes.array.isRequired,
  checked: PropTypes.object.isRequired,
  onToggle: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  onClearAll: PropTypes.func.isRequired,
  displayedOnly: PropTypes.bool.isRequired,
  onToggleDisplayedOnly: PropTypes.func.isRequired,
};

export default GridFilterSidebar;
