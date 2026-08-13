import PropTypes from "prop-types";
import { forwardRef, useMemo } from "react";
import { Link, Stack, Typography } from "@mui/material";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import ExpandLessOutlinedIcon from "@mui/icons-material/ExpandLessOutlined";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";

// Tree row: label + the term's CURIE, per the design. The CURIE is dropped when it *is* the
// label (a class with no rdfs:label falls back to its curie, and showing it twice is noise).
//
// The label is the row's activation target, not the row itself: it stops the click from reaching
// the item, so activating a term never doubles as expanding it. Expansion stays on the chevron. It
// carries the term's own colour rather than the link colour — the design draws these as plain
// text.
//
// What activation *does* is the caller's business (`onSelectTerm`): the Browse tab scopes its
// Terms table to the clicked class, the Cell Card navigates to it. Neither is a document link, so
// the label is a button.
const HierarchyTreeItem = forwardRef(function HierarchyTreeItem(props, ref) {
  // `meta` and `onSelectTerm` arrive via slotProps and must not reach the DOM.
  const { meta, onSelectTerm, label, itemId, ...treeItemProps } = props;
  const { curie, isAnchor, isCurrent, node } = meta?.get(itemId) || {};

  return (
    <TreeItem
      {...treeItemProps}
      ref={ref}
      itemId={itemId}
      label={
        <Stack direction="row" alignItems="center" gap={1} sx={{ minWidth: 0 }}>
          {/* The anchor of the tree is marked two ways: the row's selected background, and the
              label in brand rather than the plain text colour the other rows inherit. A caller
              already *on* that term gets the `currentTerm` variant instead — same emphasis, but as
              text, because activating a link to the page you are on would go nowhere. (That
              variant is not reused for the activatable case: `MuiLink`'s own styleOverrides set a
              weight, and component styles win over a typography variant.) */}
          {onSelectTerm && !isCurrent ? (
            <Link
              component="button"
              type="button"
              color={isAnchor ? "primary" : "inherit"}
              underline="hover"
              variant="body2"
              noWrap
              title={label}
              onClick={(e) => {
                e.stopPropagation();
                onSelectTerm(node);
              }}
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
  anchorTermId,
  anchorIsCurrent,
  onSelectTerm,
}) => {
  // itemId -> { node, curie, isCurrent }, plus the anchor's positions, resolved in one walk here
  // so neither the item slot nor the caller needs a walk of its own. `anchorTermId` is a *term*
  // id: a class with several parents (17 of these) appears at more than one path, and every one
  // of those positions is the anchor.
  const { meta, selectedItems } = useMemo(() => {
    const map = new Map();
    const positions = [];
    const stack = [...items];
    while (stack.length) {
      const node = stack.pop();
      const isAnchor = !!anchorTermId && node.termId === anchorTermId;
      if (isAnchor) positions.push(node.id);
      map.set(node.id, {
        node,
        curie: node.curie,
        isAnchor,
        isCurrent: isAnchor && !!anchorIsCurrent,
      });
      stack.push(...(node.children || []));
    }
    return { meta: map, selectedItems: positions };
  }, [items, anchorTermId, anchorIsCurrent]);

  return (
    <RichTreeView
      aria-label="ontology hierarchy"
      items={items}
      getItemId={(item) => item.id}
      getItemLabel={(item) => item.label}
      expandedItems={expandedItems}
      onExpandedItemsChange={onExpandedItemsChange}
      // The anchor is highlighted at every position it occupies, which is a set — hence
      // `multiSelect`, whose contract is the array. Selection is ours to set, never the row
      // click's: the label already carries the term's action, so `disableSelection` keeps a stray
      // click on the row's padding from moving the highlight away from what is actually anchored.
      multiSelect
      disableSelection
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
  // The term the tree is read around; every position of that class renders highlighted.
  anchorTermId: PropTypes.string,
  // Render the anchor as plain current-term text instead of an activatable label. For a caller
  // already *on* that term (the Cell Card), where activating it would go nowhere.
  anchorIsCurrent: PropTypes.bool,
  // Given a hierarchy node, do whatever this tree's owner does with a chosen term.
  onSelectTerm: PropTypes.func,
};

export default OntologyHierarchyTree;
