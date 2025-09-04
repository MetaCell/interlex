// SingleTermView/OverView/Hierarchy.jsx
import React from "react";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  Divider,
  Stack,
  Typography,
  CircularProgress
} from "@mui/material";
import { vars } from "../../../theme/variables";
import { RestartAlt, TargetCross } from "../../../Icons";
import SingleSearch from "../SingleSearch";
import CustomizedTreeView from "../../common/CustomizedTreeView";
import CustomSingleSelect from "../../common/CustomSingleSelect";

const { gray600, gray800 } = vars;
const CHILDREN = 'children';
const SUPERCLASSES = 'superclasses';

// Find first tree item whose .iri matches focusIri
const findFirstRenderedId = (items = [], focusIri) => {
  const stack = [...items];
  while (stack.length) {
    const node = stack.shift();
    if (node?.iri === focusIri) return node.id;
    if (Array.isArray(node?.children)) stack.push(...node.children);
  }
  return null;
};

// Normalize "ILX:0100573" -> "http://uri.interlex.org/base/ilx_0100573"
const toIri = (idLike) => {
  if (!idLike) return "";
  if (/^https?:\/\//i.test(idLike)) return idLike;
  const m = String(idLike).match(/^ILX:(\d+)$/i);
  if (m) return `http://uri.interlex.org/base/ilx_${m[1]}`;
  return idLike;
};

// Collect all item ids that match a filter (id | label | iri)
const collectMatchingIds = (items = [], term = "") => {
  if (!term) return [];
  const q = String(term).toLowerCase();
  const out = new Set();
  const stack = [...items];
  while (stack.length) {
    const node = stack.pop();
    const id = String(node?.id ?? "");
    const label = String(node?.label ?? "");
    const iri = String(node?.iri ?? "");
    if (
      id.toLowerCase().includes(q) ||
      label.toLowerCase().includes(q) ||
      iri.toLowerCase().includes(q)
    ) out.add(id);
    if (Array.isArray(node?.children)) stack.push(...node.children);
  }
  return [...out];
};

const Hierarchy = ({
  options = { children: [], superclasses: [] }, // {children:[{id,label}], superclasses:[...]}
  selectedValue,                                 // { id, label }
  onSelect,
  // prebuilt trees (arrays of {id,label,iri,children})
  treeChildren = [],
  treeSuperclasses = [],
  loading = false,
}) => {
  const [type, setType] = React.useState(SUPERCLASSES); // default to superclasses
  const [currentId, setCurrentId] = React.useState(null);

  // remember the *initial* selected term so the Aim button can always go back to it
  const initialSelectedRef = React.useRef(selectedValue?.id || null);

  // keep track of what was selected before a search so Refresh can restore it
  const preSearchSelectionRef = React.useRef(null);
  const [searchTerm, setSearchTerm] = React.useState("");

  const items = type === CHILDREN ? treeChildren : treeSuperclasses;
  const childCount = items?.[0]?.children?.length || 0;

  // when selection or type changes, recompute which tree + currentId to show
  React.useEffect(() => {
    const focusIri = toIri(selectedValue?.id);
    const renderedId = findFirstRenderedId(items, focusIri);
    setCurrentId(renderedId);
  }, [selectedValue, type, treeChildren, treeSuperclasses, items]); // mirrors your original logic:contentReference[oaicite:1]{index=1}

  // highlight matches (by id/label/iri) in the rendered tree
  const highlightedIds = React.useMemo(
    () => collectMatchingIds(items, searchTerm),
    [items, searchTerm]
  );

  // ⬇️ IMPORTANT: selecting from the autocomplete should NOT turn it into a "search mode"
  // We (1) set upstream selection, (2) clear searchTerm, (3) focus that node in the tree.
  const handleSelectChange = (value) => {
    if (!preSearchSelectionRef.current && selectedValue) {
      preSearchSelectionRef.current = selectedValue;
    }
    onSelect?.(value);

    // clear search highlight so the tree doesn't jump/contract
    setSearchTerm("");

    // focus the selected item in the *current* tree
    const focusIri = toIri(value?.id);
    const idInTree = findFirstRenderedId(items, focusIri);
    if (idInTree) setCurrentId(idInTree);
  };

  const handleRefresh = () => {
    // restore selection prior to search; keep hierarchy data intact
    const toRestore = preSearchSelectionRef.current || initialSelectedRef.current || selectedValue;
    if (toRestore) {
      onSelect?.(toRestore);
      const iri = toIri(toRestore?.id);
      const idInTree = findFirstRenderedId(items, iri);
      setCurrentId(idInTree);
    }
    setSearchTerm("");
    preSearchSelectionRef.current = null;
  };

  // Aim icon should focus the *original* requested node for the hierarchy (not the last searched)
  const handleAimFocus = () => {
    const base = initialSelectedRef.current || selectedValue;
    const focusIri = toIri(base?.id);
    const id = findFirstRenderedId(items, focusIri);
    setCurrentId(id);
  };

  const singleSearchOptions = type === CHILDREN ? options.children : options.superclasses;

  if (loading) {
    return <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress />
    </Box>
  }

  return (
    <Box display='flex' flexDirection='column' gap='1rem'>
      <Box display='flex' alignItems='center' justifyContent='space-between'>
        <Typography color={gray800} fontWeight={500}>Hierarchy</Typography>
        <Stack direction="row" alignItems="center" spacing={'.75rem'}>
          <Typography variant="caption" sx={{ fontSize: '0.875rem', color: gray600 }}>Type:</Typography>
          <CustomSingleSelect
            value={type}
            onChange={(v) => {
              setType(v);
              // reset only the visual search highlight when switching trees
              setSearchTerm("");
            }}
            options={[
              { value: CHILDREN, label: 'Children' },
              { value: SUPERCLASSES, label: 'Superclasses' },
            ]}
          />
          <Divider orientation="vertical" flexItem />
          <Button
            sx={{ p: '0.625rem 0.5625rem', minWidth: '0.0625rem' }}
            variant='outlined'
            onClick={handleRefresh}
            title="Restore to the state before search"
          >
            <RestartAlt />
          </Button>
          {/* Previously a no-op placeholder — now focuses the originally requested node:contentReference[oaicite:2]{index=2} */}
          <Button
            sx={{ p: '0.625rem 0.5625rem', minWidth: '0.0625rem' }}
            variant='outlined'
            onClick={handleAimFocus}
            title="Highlight original current term"
          >
            <TargetCross />
          </Button>
        </Stack>
      </Box>

      <SingleSearch
        onChange={handleSelectChange}
        selectedValue={selectedValue}
        options={singleSearchOptions}
      />

      <CustomizedTreeView
        items={items}
        loading={false}
        currentId={currentId}
        highlightedIds={highlightedIds}
        defaultExpanded={type !== CHILDREN} // superclasses open by default, children collapsed
      />

      <Typography color={gray600} fontSize='.875rem'>
        Total number of first generation {type === CHILDREN ? CHILDREN : SUPERCLASSES}: {childCount}
      </Typography>
    </Box>
  );
};

Hierarchy.propTypes = {
  options: PropTypes.shape({
    children: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string, label: PropTypes.string })),
    superclasses: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string, label: PropTypes.string })),
  }),
  selectedValue: PropTypes.shape({ id: PropTypes.string, label: PropTypes.string }),
  onSelect: PropTypes.func,
  treeChildren: PropTypes.array,      // array of TreeItem
  treeSuperclasses: PropTypes.array,  // array of TreeItem
  loading: PropTypes.bool,
};

export default Hierarchy;
