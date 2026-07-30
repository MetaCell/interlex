import PropTypes from "prop-types";
import { forwardRef, useMemo } from "react";
import { Link, Stack, Typography } from "@mui/material";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import ExpandLessOutlinedIcon from "@mui/icons-material/ExpandLessOutlined";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import { termLink } from "./config/gridConfig";

// Tree row: label + the term's CURIE, per the design. The CURIE is dropped when it *is* the
// label (a class with no rdfs:label falls back to its curie, and showing it twice is noise).
//
// The label is the row's activation target, not the row itself: it stops the click from reaching
// the item, so opening a term never doubles as expanding it. Expansion stays on the chevron. It
// carries the term's own colour rather than the link colour — the design draws these as plain
// text.
//
// Where it goes depends on the caller. Without `onSelectTerm` it is a real link that opens the
// term in a new tab (the Browse tab's behaviour), which gets middle-click and keyboard activation
// for free. With `onSelectTerm` the caller navigates in place instead — the Cell Card needs the
// tree to stay put while the page moves, which a new document cannot do.
const HierarchyTreeItem = forwardRef(function HierarchyTreeItem(props, ref) {
  // `meta` and `onSelectTerm` arrive via slotProps and must not reach the DOM.
  const { meta, onSelectTerm, label, itemId, ...treeItemProps } = props;
  const { curie, href, isCurrent, node } = meta?.get(itemId) || {};

  return (
    <TreeItem
      {...treeItemProps}
      ref={ref}
      itemId={itemId}
      label={
        <Stack direction="row" alignItems="center" gap={1} sx={{ minWidth: 0 }}>
          {/* The term whose page we are on is the anchor of the tree, so it reads as text rather
              than a link to itself, in the theme's `currentTerm` variant — the semibold brand
              emphasis is a design token, not a call-site style. */}
          {onSelectTerm && !isCurrent ? (
            <Link
              component="button"
              type="button"
              color="inherit"
              underline="hover"
              variant="body2"
              noWrap
              title={`Open ${label}`}
              onClick={(e) => {
                e.stopPropagation();
                onSelectTerm(node);
              }}
            >
              {label}
            </Link>
          ) : href && !isCurrent ? (
            <Link
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              color="inherit"
              underline="hover"
              variant="body2"
              noWrap
              title={`Open ${label} in a new tab`}
              onClick={(e) => e.stopPropagation()}
            >
              {label}
            </Link>
          ) : (
            <Typography variant={isCurrent ? "currentTerm" : "body2"} noWrap title={label}>
              {label}
            </Typography>
          )}
          {curie && curie !== label && (
            <Typography variant="body2" color="text.secondary" noWrap>
              {curie}
            </Typography>
          )}
        </Stack>
      }
    />
  );
});

HierarchyTreeItem.propTypes = {
  meta: PropTypes.instanceOf(Map),
  onSelectTerm: PropTypes.func,
  label: PropTypes.string,
  itemId: PropTypes.string,
};

const OntologyHierarchyTree = ({
  items,
  expandedItems,
  onExpandedItemsChange,
  selectedItems,
  currentTermId,
  onSelectTerm,
}) => {
  // itemId -> { node, curie, href, isCurrent }, resolved once here so the item slot needs no walk
  // of its own. `currentTermId` is a *term* id, matched against node.termId — a class with several
  // parents appears at more than one path, and every one of those positions is "current".
  const meta = useMemo(() => {
    const map = new Map();
    const stack = [...items];
    while (stack.length) {
      const node = stack.pop();
      map.set(node.id, {
        node,
        curie: node.curie,
        href: termLink(node),
        isCurrent: !!currentTermId && node.termId === currentTermId,
      });
      stack.push(...(node.children || []));
    }
    return map;
  }, [items, currentTermId]);

  return (
    <RichTreeView
      aria-label="ontology hierarchy"
      items={items}
      getItemId={(item) => item.id}
      getItemLabel={(item) => item.label}
      expandedItems={expandedItems}
      onExpandedItemsChange={onExpandedItemsChange}
      selectedItems={selectedItems}
      slots={{
        item: HierarchyTreeItem,
        expandIcon: ChevronRightOutlinedIcon,
        collapseIcon: ExpandLessOutlinedIcon,
      }}
      slotProps={{ item: { meta, onSelectTerm } }}
    />
  );
};

OntologyHierarchyTree.propTypes = {
  items: PropTypes.array.isRequired,
  expandedItems: PropTypes.arrayOf(PropTypes.string).isRequired,
  onExpandedItemsChange: PropTypes.func.isRequired,
  selectedItems: PropTypes.arrayOf(PropTypes.string),
  // The term the page is about; every position of that class renders highlighted.
  currentTermId: PropTypes.string,
  // Given a hierarchy node, take the caller somewhere in this same page. When set, term labels
  // activate this instead of opening the term in a new tab.
  onSelectTerm: PropTypes.func,
};

export default OntologyHierarchyTree;
