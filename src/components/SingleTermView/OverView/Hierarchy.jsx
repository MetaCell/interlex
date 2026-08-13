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
import { EditableChipList } from "./EditableFields";
import { API_CONFIG } from "../../../config";

const { gray600, gray800 } = vars;
const CHILDREN = 'children';
const SUPERCLASSES = 'superclasses';
const SUBCLASS_OF_PREDICATE = 'rdfs:subClassOf';

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
  // TODO replace base to point to groupname when the API supports it
  if (m) return `${API_CONFIG.INTERLEX_URL}base/ilx_${m[1]}`;
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
  options = { children: [], superclasses: [] },
  selectedValue,
  onSelect,
  treeChildren = [],
  treeSuperclasses = [],
  loading = false,
  directSuperclasses = [],
  group = "base",
  onMutate,
}) => {
  const editing = !!onMutate;
  const [type, setType] = React.useState(SUPERCLASSES);
  const [currentId, setCurrentId] = React.useState(null);
  const [manualHighlightedIds, setManualHighlightedIds] = React.useState([]);
  const hasSearchedRef = React.useRef(false);
  const initialSelectedRef = React.useRef(selectedValue?.id || null);

  const preSearchSelectionRef = React.useRef(null);
  const [searchTerm, setSearchTerm] = React.useState("");

  const items = type === CHILDREN ? treeChildren : treeSuperclasses;
  const childCount = items?.[0]?.children?.length || 0;

  React.useEffect(() => {
    const focusIri = toIri(selectedValue?.id);
    const renderedId = findFirstRenderedId(items, focusIri);
    setCurrentId(renderedId);
  }, [selectedValue, type, treeChildren, treeSuperclasses, items]);

  const handleSelectChange = (value) => {
    if (!preSearchSelectionRef.current && selectedValue) {
      preSearchSelectionRef.current = selectedValue;
    }
    onSelect?.(value);
    hasSearchedRef.current = true;

    setSearchTerm("");
    setManualHighlightedIds([]);

    const focusIri = toIri(value?.id);
    const idInTree = findFirstRenderedId(items, focusIri);
    if (idInTree) setCurrentId(idInTree);
  };

  const handleRefresh = () => {
    const toRestore = preSearchSelectionRef.current || initialSelectedRef.current || selectedValue;
    if (toRestore) {
      onSelect?.(toRestore);
      const iri = toIri(toRestore?.id);
      const idInTree = findFirstRenderedId(items, iri);
      setCurrentId(idInTree);
    }
    setSearchTerm("");
    setManualHighlightedIds([]);
    hasSearchedRef.current = false;
    preSearchSelectionRef.current = null;
  };

  const handleAimFocus = () => {
    const base = hasSearchedRef.current
      ? (selectedValue || preSearchSelectionRef.current || { id: initialSelectedRef.current })
      : (preSearchSelectionRef.current || selectedValue || { id: initialSelectedRef.current });

    const focusIri = toIri(base?.id);
    const id = findFirstRenderedId(items, focusIri);

    setCurrentId(id);
    setManualHighlightedIds(id ? [id] : []);  // <-- pass to tree as highlight
  };

  const singleSearchOptions = type === CHILDREN ? options.children : options.superclasses;
  const highlightedIdsFromSearch = React.useMemo(
    () => collectMatchingIds(items, searchTerm),
    [items, searchTerm]
  );

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
        highlightedIds={
          highlightedIdsFromSearch.length
            ? highlightedIdsFromSearch
            : manualHighlightedIds
        }
        defaultExpanded={type !== CHILDREN}
      />

      <Typography color={gray600} fontSize='.875rem'>
        Total number of first generation {type === CHILDREN ? CHILDREN : SUPERCLASSES}: {childCount}
      </Typography>

      {editing && (
        <Stack spacing='.75rem'>
          <Divider />
          <Typography color={gray800} fontWeight={500}>Direct superclasses</Typography>
          <Typography color={gray600} fontSize='.875rem'>
            Only the rdfs:subClassOf triples on this term can be changed here. Children are that
            same relation on other terms, so they are edited from those terms.
          </Typography>
          <EditableChipList
            predicate={SUBCLASS_OF_PREDICATE}
            values={directSuperclasses}
            kind='term'
            group={group}
            onMutate={onMutate}
            addLabel='Add superclass'
          />
        </Stack>
      )}
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
  treeChildren: PropTypes.array,
  treeSuperclasses: PropTypes.array,
  loading: PropTypes.bool,
  directSuperclasses: PropTypes.arrayOf(PropTypes.string),
  group: PropTypes.string,
  onMutate: PropTypes.func,
};

export default Hierarchy;
