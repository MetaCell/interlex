import PropTypes from 'prop-types';
import { Box, Chip, CircularProgress, IconButton, Tooltip } from "@mui/material";
import { styled } from '@mui/material/styles';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import { TreeItem, treeItemClasses } from '@mui/x-tree-view/TreeItem';
import ExpandLessOutlinedIcon from '@mui/icons-material/ExpandLessOutlined';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import { useEffect, useMemo, useRef, useState } from "react";
import { vars } from "../../theme/variables";

const { gray500, brand200, brand50 } = vars;

const StyledLabel = styled('span')(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: '.5rem',
  position: 'relative'
}));

const HoverActions = styled('span')(() => ({
  display: 'none',
  alignItems: 'center',
  marginLeft: '0.25rem'
}));

const StyledTreeItemBase = (props) => {
  const {
    label,
    currentId,
    highlightedIds,
    itemId,
    idToIri,
    idToHasChildren
  } = props;

  const isCurrent = currentId && itemId === currentId;
  const isHighlighted = Array.isArray(highlightedIds) && highlightedIds.includes(itemId);
  const isLeaf = idToHasChildren?.get(itemId) === false;

  const iri = idToIri?.get(itemId) || itemId;

  return (
    <TreeItem
      {...props}
      label={
        <StyledLabel className="tree-item-label">
          <span style={{ fontWeight: isHighlighted ? 600 : 400 }}>
            {label}
          </span>

          {isCurrent && (
            <Chip
              className="rounded"
              variant="outlined"
              label={'Current Item'}
              sx={{ borderColor: brand200, backgroundColor: brand50 }}
              size="small"
            />
          )}

          {isHighlighted && !isCurrent && (
            <Chip
              className="rounded"
              variant="outlined"
              label={'Match'}
              sx={{ borderColor: brand200, backgroundColor: brand50 }}
              size="small"
            />
          )}

          {/* Leaf-only hover action: open in new tab */}
          {isLeaf && (
            <HoverActions className="hover-actions">
              <Tooltip title="Open term in new tab">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    try {
                      window.open(iri, "_blank", "noopener,noreferrer");
                    } catch {
                      window.open(String(iri), "_blank");
                    }
                  }}
                >
                  <OpenInNewOutlinedIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
            </HoverActions>
          )}
        </StyledLabel>
      }
      sx={{
        [`& .${treeItemClasses.content}:hover .hover-actions`]: { display: 'inline-flex' },
        [`& .${treeItemClasses.label}`]: { fontSize: '0.875rem', fontWeight: 400 },
        color: gray500,
      }}
    />
  );
};

StyledTreeItemBase.propTypes = {
  label: PropTypes.string,
  currentId: PropTypes.string,
  highlightedIds: PropTypes.arrayOf(PropTypes.string),
  itemId: PropTypes.string,
  idToIri: PropTypes.instanceOf(Map),
  idToHasChildren: PropTypes.instanceOf(Map)
};

const kidsOf = (n, getItemChildren) => {
  const k = getItemChildren(n);
  return Array.isArray(k) ? k : [];
};

// depth-first: return ids from root → target; [] if not found
function findPathToId(nodes, targetId, getItemId, getItemChildren) {
  for (const n of nodes || []) {
    const id = getItemId(n);
    if (id === targetId) return [id];
    const childPath = findPathToId(kidsOf(n, getItemChildren), targetId, getItemId, getItemChildren);
    if (childPath.length) return [id, ...childPath];
  }
  return [];
}

const CustomizedTreeView = ({
  items = [],
  loading = false,
  currentId = null,
  highlightedIds = [],
  getItemId = (i) => i.id,
  getItemLabel = (i) => i.label,
  getItemChildren = (i) => i.children || [],
  defaultExpanded = false
}) => {
  const [expanded, setExpanded] = useState([]);

  // precompute roots for safety (keeps tree visible even if expanded becomes empty)
  const rootIds = useMemo(() => (items || []).map(getItemId), [items, getItemId]);

  // index useful metadata for slots (fast lookups in item renderer)
  const { idToIri, idToHasChildren } = useMemo(() => {
    const iriMap = new Map();
    const hasChildrenMap = new Map();
    const stack = [...items];
    while (stack.length) {
      const node = stack.pop();
      const id = getItemId(node);
      const kids = kidsOf(node, getItemChildren);
      iriMap.set(id, node?.iri ?? null);
      hasChildrenMap.set(id, kids.length > 0);
      stack.push(...kids);
    }
    return { idToIri: iriMap, idToHasChildren: hasChildrenMap };
  }, [items, getItemChildren, getItemId]);

  // compute path to current node
  const pathToCurrent = useMemo(
    () => (currentId ? findPathToId(items, currentId, getItemId, getItemChildren) : []),
    [items, currentId, getItemId, getItemChildren]
  );

  // also expand ancestors of matched nodes so highlights are visible
  const matchAncestorIds = useMemo(() => {
    if (!highlightedIds?.length) return [];
    const set = new Set();
    const dfs = (nodes, ancestors = []) => {
      for (const n of nodes || []) {
        const id = getItemId(n);
        const nextAncestors = [...ancestors, id];
        if (highlightedIds.includes(id)) nextAncestors.forEach(a => set.add(a));
        dfs(getItemChildren(n), nextAncestors);
      }
    };
    dfs(items, []);
    return [...set];
  }, [items, highlightedIds, getItemChildren, getItemId]);

  // desired expansions: keep visibility of current and matches; retain user toggles
  const desiredExpanded = useMemo(() => {
    const ancestorsOfCurrent = pathToCurrent.slice(0, -1);
    if (defaultExpanded === true) {
      // superclasses: open roots initially; ensure ancestors for matches/current are open too
      return Array.from(new Set([...rootIds, ...ancestorsOfCurrent, ...matchAncestorIds]));
    }
    // children: collapsed by default, but still ensure current/match ancestors are visible
    return Array.from(new Set([...ancestorsOfCurrent, ...matchAncestorIds]));
  }, [defaultExpanded, pathToCurrent, matchAncestorIds, rootIds]);

  // only adjust expansions when the derived set changes — merge with existing so tree never "disappears"
  const desiredKey = useMemo(() => desiredExpanded.join('|'), [desiredExpanded]);
  const lastKey = useRef('');
  useEffect(() => {
    if (desiredKey !== lastKey.current) {
      setExpanded(prev => {
        const merged = new Set([...(prev || []), ...desiredExpanded]);
        // As a final guard: if merged is empty but we want roots visible for defaultExpanded=true
        if (merged.size === 0 && defaultExpanded === true && rootIds.length) {
          rootIds.forEach(id => merged.add(id));
        }
        return [...merged];
      });
      lastKey.current = desiredKey;
    }
  }, [desiredKey, desiredExpanded, defaultExpanded, rootIds]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={2}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  return (
    <RichTreeView
      aria-label="customized"
      items={items}
      getItemId={getItemId}
      getItemLabel={getItemLabel}
      getItemChildren={getItemChildren}
      expandedItems={expanded}
      onExpandedItemsChange={(_e, ids) => setExpanded(ids)}  // user can toggle
      slots={{
        item: StyledTreeItemBase,
        expandIcon: ChevronRightOutlinedIcon,
        collapseIcon: ExpandLessOutlinedIcon,
      }}
      slotProps={{
        item: {
          currentId,
          highlightedIds,
          idToIri,
          idToHasChildren
        }
      }}
    />
  );
};

CustomizedTreeView.propTypes = {
  items: PropTypes.array,
  loading: PropTypes.bool,
  currentId: PropTypes.string,
  highlightedIds: PropTypes.arrayOf(PropTypes.string),
  getItemId: PropTypes.func,
  getItemLabel: PropTypes.func,
  getItemChildren: PropTypes.func,
  defaultExpanded: PropTypes.bool
};

export default CustomizedTreeView;
