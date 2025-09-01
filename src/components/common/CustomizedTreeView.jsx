import PropTypes from 'prop-types';
import { Box, Chip, CircularProgress } from "@mui/material";
import { styled } from '@mui/material/styles';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import { TreeItem, treeItemClasses } from '@mui/x-tree-view/TreeItem';
import ExpandLessOutlinedIcon from '@mui/icons-material/ExpandLessOutlined';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import { useEffect, useMemo, useRef, useState } from "react";
import { vars } from "../../theme/variables";

const { gray500, brand200, brand50 } = vars;

const StyledTreeItemBase = (props) => (
  <TreeItem
    {...props}
    label={
      <Box display='flex' alignItems='center' gap='.5rem'>
        <span>{props.label}</span>
        {props.currentId && props.itemId === props.currentId && (
          <Chip
            className="rounded"
            variant="outlined"
            label={'Current Item'}
            sx={{ borderColor: brand200, backgroundColor: brand50 }}
          />
        )}
      </Box>
    }
  />
);

StyledTreeItemBase.propTypes = {
  label: PropTypes.string,
  currentId: PropTypes.string,
  itemId: PropTypes.string
};


const StyledTreeItem = styled(StyledTreeItemBase)(() => ({
  color: gray500,
  [`& .${treeItemClasses.content}`]: {
    [`& .${treeItemClasses.label}`]: { fontSize: '0.875rem', fontWeight: 400 },
  },
  [`& .${treeItemClasses.groupTransition}`]: { marginLeft: 14 },
}));

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
  getItemId = (i) => i.id,
  getItemLabel = (i) => i.label,
  getItemChildren = (i) => i.children || [],
}) => {
  const [expanded, setExpanded] = useState([]);

  // compute path to current node
  const pathToCurrent = useMemo(
    () => (currentId ? findPathToId(items, currentId, getItemId, getItemChildren) : []),
    [items, currentId, getItemId, getItemChildren]
  );

  // only auto-expand when the path actually changes
  const pathKey = useMemo(() => pathToCurrent.join('|'), [pathToCurrent]);
  const lastPathKeyRef = useRef('');
  useEffect(() => {
    if (pathKey && pathKey !== lastPathKeyRef.current) {
      const ancestors = pathToCurrent.slice(0, -1);
      setExpanded(ancestors);                // set once per path change
      lastPathKeyRef.current = pathKey;
    }
  }, [pathKey, pathToCurrent]);

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
        item: StyledTreeItem,
        expandIcon: ChevronRightOutlinedIcon,
        collapseIcon: ExpandLessOutlinedIcon,
      }}
      slotProps={{ item: { currentId } }}
    />
  );
};

CustomizedTreeView.propTypes = {
  items: PropTypes.array,
  loading: PropTypes.bool,
  currentId: PropTypes.string,
  getItemId: PropTypes.func,
  getItemLabel: PropTypes.func,
  getItemChildren: PropTypes.func,
};

export default CustomizedTreeView;
