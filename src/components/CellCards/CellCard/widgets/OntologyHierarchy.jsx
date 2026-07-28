import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Stack, Typography, IconButton, Tooltip } from "@mui/material";
import CellCardWidget from "../CellCardWidget";
import OntologyHierarchyTree from "../../OntologyHierarchyTree";
import GridSearchBar from "../../GridSearchBar";
import CustomSingleSelect from "../../../common/CustomSingleSelect";
import EmptyState from "../../../common/EmptyState";
import { RestartAlt, TargetCross } from "../../../../Icons";

export const TITLE = "Ontology hierarchy";

// The two directions the tree can be read in, as in the design's "Type:" select and in the
// existing SingleTermView Hierarchy widget.
const CHILDREN = "children";
const SUPERCLASSES = "superclasses";

/** Path of hierarchy nodes from a root down to the first position of `termId`. */
const findPath = (nodes, termId, trail = []) => {
  for (const node of nodes) {
    const next = [...trail, node];
    if (node.termId === termId) return next;
    const deeper = findPath(node.children || [], termId, next);
    if (deeper) return deeper;
  }
  return null;
};

/**
 * §3.2 Ontology Hierarchy (Figma 9239:67685).
 *
 * Shows the cell's position in the subClassOf tree: the ancestor chain collapsed to a single
 * spine, the cell highlighted, and its direct children one level below. The full ontology tree
 * lives on the Browse tab; here it is scoped so the widget stays readable in a 424px column.
 *
 * The tree is built from the parse's already-reduced hierarchy (transitive edges removed), so a
 * cell does not list its grandparents as parents.
 */
const OntologyHierarchy = ({ cell, hierarchy, rootLabel, actions }) => {
  const [direction, setDirection] = useState(CHILDREN);
  const [query, setQuery] = useState("");

  const path = useMemo(() => findPath(hierarchy || [], cell.id), [hierarchy, cell.id]);

  // The node for the cell itself, and the spine above it.
  const cellNode = path?.[path.length - 1];
  const ancestors = useMemo(() => (path ? path.slice(0, -1) : []), [path]);

  // The rendered tree, plus what it is showing out of what exists — the count line below reports
  // the filtered figure, so it can never contradict the rows on screen.
  const { items, shown, total } = useMemo(() => {
    if (!cellNode) return { items: [], shown: 0, total: 0 };
    const matches = (label) =>
      !query.trim() || label.toLowerCase().includes(query.trim().toLowerCase());

    if (direction === SUPERCLASSES) {
      // Ancestors, outermost first, each nesting the next — the spine on its own. The query
      // applies here too: leaving it out silently ignored the search box in this direction.
      // Dropping a non-matching intermediate is honest because subClassOf is transitive, so a
      // collapsed spine still only claims "ancestor of".
      const spine = ancestors.filter((a) => matches(a.label));
      return {
        items: [
          spine.reduceRight((child, node) => ({ ...node, children: [child] }), {
            ...cellNode,
            children: [],
          }),
        ],
        shown: spine.length,
        total: ancestors.length,
      };
    }

    // Children view: the cell as the root, its direct children below it.
    const all = cellNode.children || [];
    const children = all.filter((c) => matches(c.label)).map((c) => ({ ...c, children: [] }));
    return {
      items: [{ ...cellNode, children }],
      shown: children.length,
      total: all.length,
    };
  }, [cellNode, ancestors, direction, query]);

  // Expand the whole (small) scoped tree by default: with one spine and one level of children
  // there is nothing worth hiding, and the design shows it open.
  const [expanded, setExpanded] = useState(null);
  const allIds = useMemo(() => {
    const ids = [];
    const walk = (nodes) =>
      nodes.forEach((n) => {
        ids.push(n.id);
        walk(n.children || []);
      });
    walk(items);
    return ids;
  }, [items]);
  const expandedItems = expanded ?? allIds;

  // Named once so the select option and the count line below cannot describe different things.
  const directionLabel = {
    [CHILDREN]: `sub class of ${rootLabel}`,
    [SUPERCLASSES]: `super class of ${rootLabel}`,
  };

  return (
    <CellCardWidget title={TITLE} actions={actions}>
      <Stack direction="row" alignItems="center" gap={1}>
        <Typography variant="body2" sx={{ color: "text.secondary", flexShrink: 0 }}>
          Type:
        </Typography>
        <CustomSingleSelect
          value={direction}
          onChange={setDirection}
          options={[
            { value: CHILDREN, label: directionLabel[CHILDREN] },
            { value: SUPERCLASSES, label: directionLabel[SUPERCLASSES] },
          ]}
          isFormControlFullWidth
        />
        <Tooltip title="Reset">
          <IconButton
            onClick={() => {
              setDirection(CHILDREN);
              setQuery("");
              setExpanded(null);
            }}
            aria-label="Reset hierarchy"
          >
            <RestartAlt />
          </IconButton>
        </Tooltip>
        <Tooltip title="Focus current term">
          <IconButton onClick={() => setExpanded(allIds)} aria-label="Focus current term">
            <TargetCross />
          </IconButton>
        </Tooltip>
      </Stack>

      <GridSearchBar value={query} onSubmit={setQuery} />

      {items.length ? (
        <>
          <OntologyHierarchyTree
            items={items}
            currentTermId={cell.id}
            expandedItems={expandedItems}
            onExpandedItemsChange={(_e, ids) => setExpanded(ids)}
            selectedItems={cellNode ? [cellNode.id] : []}
          />
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {/* "3 of 7" while a query is filtering, so the number always matches the rows drawn. */}
            {`Total number of ${directionLabel[direction]}: ${
              shown === total ? total : `${shown} of ${total}`
            }`}
          </Typography>
        </>
      ) : (
        <EmptyState message="This term is not placed in the ontology hierarchy." />
      )}
    </CellCardWidget>
  );
};

OntologyHierarchy.propTypes = {
  cell: PropTypes.object.isRequired,
  hierarchy: PropTypes.array,
  // Display name of the ontology's root class, used in the select and the count line.
  rootLabel: PropTypes.string,
  actions: PropTypes.node,
};

export default OntologyHierarchy;
