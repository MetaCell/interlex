import { useCallback, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Box, Stack, Typography, IconButton, Tooltip } from "@mui/material";
import CellCardWidget from "../CellCardWidget";
import OntologyHierarchyTree from "../../OntologyHierarchyTree";
import GridSearchBar from "../../GridSearchBar";
import CustomSingleSelect from "../../../common/CustomSingleSelect";
import EmptyState from "../../../common/EmptyState";
import { RestartAlt, TargetCross } from "../../../../Icons";
import { primaryPath, superclassTree } from "../../model/hierarchy";

export const TITLE = "Ontology hierarchy";

// The three ways the design's "Type:" select can scope the tree: the ontology as a whole, or the
// anchor term read in either direction.
const ROOT_SUBCLASSES = "root";
const SUPERCLASSES = "superclasses";
const SUBCLASSES = "subclasses";

/** The tree with only the nodes that match, plus the ancestors needed to reach them. */
const prune = (nodes, matches) =>
  nodes.reduce((kept, node) => {
    const children = prune(node.children || [], matches);
    if (children.length || matches(node.label)) kept.push({ ...node, children });
    return kept;
  }, []);

/** The tree without the rows `keep` rejects, each one's children lifted into its place. */
const collapse = (nodes, keep) =>
  nodes.flatMap((node) => {
    const children = collapse(node.children || [], keep);
    return keep(node) ? [{ ...node, children }] : children;
  });

/**
 * One row per class at each level, the class's own row winning over an asterisked one: collapsing
 * the superclass tree can lift both rows of the anchor side by side.
 */
const oneRowPerTerm = (nodes) => {
  const byTerm = new Map();
  for (const node of nodes) {
    const kept = byTerm.get(node.termId);
    if (!kept || (kept.secondary && !node.secondary)) byTerm.set(node.termId, node);
  }
  return [...byTerm.values()].map((node) => ({ ...node, children: oneRowPerTerm(node.children) }));
};

/** Distinct classes in a tree: an asterisked row is a class already counted at its own row. */
const countTerms = (nodes, except) => {
  const ids = new Set();
  const walk = (list) =>
    list.forEach((n) => {
      ids.add(n.termId);
      walk(n.children || []);
    });
  walk(nodes);
  ids.delete(except);
  return ids.size;
};

// How long the tree has to stop mutating before the highlighted row is scrolled to; see
// requestReveal. Long enough to bridge a slow re-render, short enough not to read as a delay.
const SETTLE_MS = 80;

/** Every position id in a tree, in the order the rows are drawn. */
const allIds = (nodes) => {
  const ids = [];
  const walk = (list) =>
    list.forEach((n) => {
      ids.push(n.id);
      walk(n.children || []);
    });
  walk(nodes);
  return ids;
};

/**
 * §3.2 Ontology Hierarchy (Figma 9239:67685).
 *
 * Shows a cell's position in the subClassOf tree, in one of three scopes: the whole ontology, or
 * the *anchor* term's superclasses / direct children. The scoped views are a readability choice
 * for a 424px column, not a size limit.
 *
 * The anchor is deliberately *not* the term the page is on. Clicking a term navigates the card,
 * and the requirement is that the tree does not move when it does: "when you click through the
 * hierarchy, the hierarchy should stay stationary and the rest of the page should change around
 * it" (meeting-3). So the tree, its scope label and its expansion all hang off `anchor`, which
 * only the reset and focus buttons move, while the highlight follows `cell`. That also keeps the
 * select honest: the option text describes the tree it produces, never the term you drifted to.
 *
 * The tree is built from the parse's already-reduced hierarchy (transitive edges removed), so a
 * cell does not list its grandparents as parents. A class with several superclasses is read from
 * its own position, under its primary parent; the superclass view also draws each further parent,
 * ending in the class's asterisked row — the same links, marked the same way, as the graph's.
 */
const OntologyHierarchy = ({ cell, hierarchy, rootLabel, ontologyTitle, onNavigate, actions }) => {
  const [mode, setMode] = useState(SUPERCLASSES);
  const [query, setQuery] = useState("");
  // The term the tree is read around, and the expansion the user has since chosen (null = the
  // default for the current scope). Neither follows `cell`: that is what keeps the tree still
  // across a navigation.
  const [anchorId, setAnchorId] = useState(cell.id);
  const [expanded, setExpanded] = useState(null);
  const treeBoxRef = useRef(null);

  const anchorPath = useMemo(() => primaryPath(hierarchy || [], anchorId), [hierarchy, anchorId]);
  const anchorNode = anchorPath?.[anchorPath.length - 1];
  // Falls back to the cell's own label so the select still reads sensibly for a term the
  // hierarchy does not place.
  const anchorLabel = anchorNode?.label || cell.label;

  // The rendered tree, plus what it is showing out of what exists — the count line below reports
  // the filtered figure, so it can never contradict the rows on screen. Both counts exclude the
  // class the tree hangs from — a configured root class, or the anchor — which is not one of its
  // own sub/superclasses.
  const { items, shown, total } = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matches = (label) => !needle || label.toLowerCase().includes(needle);
    const roots = hierarchy || [];

    if (mode === ROOT_SUBCLASSES) {
      const kept = needle ? prune(roots, matches) : roots;
      const rootClassId = rootLabel ? roots[0]?.termId : undefined;
      return {
        items: kept,
        shown: countTerms(kept, rootClassId),
        total: countTerms(roots, rootClassId),
      };
    }

    if (!anchorNode) return { items: [], shown: 0, total: 0 };

    if (mode === SUPERCLASSES) {
      // The query applies here too: leaving it out silently ignored the search box in this
      // direction. Dropping a non-matching intermediate is honest because subClassOf is
      // transitive, so a collapsed chain still only claims "ancestor of".
      const tree = superclassTree(roots, anchorId);
      const kept = needle
        ? oneRowPerTerm(collapse(tree, (n) => n.termId === anchorId || matches(n.label)))
        : tree;
      return {
        items: kept,
        shown: countTerms(kept, anchorId),
        total: countTerms(tree, anchorId),
      };
    }

    // Children view: the anchor as the root, its direct children below it.
    const all = anchorNode.children || [];
    const children = all.filter((c) => matches(c.label)).map((c) => ({ ...c, children: [] }));
    return {
      items: [{ ...anchorNode, children }],
      shown: children.length,
      total: all.length,
    };
  }, [hierarchy, rootLabel, anchorId, anchorNode, mode, query]);

  // Open the scoped views completely: one spine, or one level of children, has nothing worth
  // hiding, and the design shows it open. The whole ontology opens only down to the anchor, so
  // the widget is not a wall of rows — unless a filter is on, where the point is to see the hits.
  const defaultExpanded = useMemo(() => {
    if (mode === ROOT_SUBCLASSES && !query.trim()) {
      return anchorPath ? anchorPath.map((n) => n.id) : [];
    }
    return allIds(items);
  }, [mode, query, items, anchorPath]);
  const expandedItems = expanded ?? defaultExpanded;

  // Scrolls the highlighted row into view inside the tree's own box — the term's own row, not an
  // asterisked one that happens to be drawn above it. `block: "nearest"` keeps the scroll inside
  // that box while the widget itself is on screen.
  const reveal = useCallback(() => {
    const box = treeBoxRef.current;
    const row =
      box?.querySelector('[aria-selected="true"]:not([data-secondary])') ||
      box?.querySelector('[aria-selected="true"]');
    row?.scrollIntoView({ block: "nearest" });
  }, []);

  // Waits for the tree to settle before scrolling, rather than for a render or a fixed delay:
  // RichTreeView draws its rows from its own item store, some renders after the props change, and
  // building the whole ontology's rows can outlast a frame — so at effect time (and often a frame
  // or two later) the row to scroll to is not in the DOM yet, and scrolling early is spent on the
  // outgoing tree. The trailing timeout is what handles the opposite case, re-anchoring on the
  // term the tree already shows, where nothing changes at all.
  const requestReveal = useCallback(() => {
    const box = treeBoxRef.current;
    if (!box) return;
    let timer;
    const observer = new MutationObserver(() => restart());
    const settle = () => {
      observer.disconnect();
      reveal();
    };
    const restart = () => {
      clearTimeout(timer);
      timer = setTimeout(settle, SETTLE_MS);
    };
    observer.observe(box, { childList: true, subtree: true });
    restart();
  }, [reveal]);

  // Re-scoping is an explicit act, so each of these clears the expansion the user had built on
  // the previous scope — otherwise a stale set would override the default for the new one.
  const changeMode = useCallback(
    (next) => {
      setMode(next);
      setExpanded(null);
      // The whole-ontology scope is far taller than its box, so say where we are in it.
      if (next === ROOT_SUBCLASSES) requestReveal();
    },
    [requestReveal]
  );

  const changeQuery = useCallback((next) => {
    setQuery(next);
    setExpanded(null);
  }, []);

  const handleReset = useCallback(() => {
    setMode(SUPERCLASSES);
    setQuery("");
    setAnchorId(cell.id);
    setExpanded(null);
  }, [cell.id]);

  // Brings the tree back to the term in view after clicking through it — the one affordance that
  // moves the anchor without changing anything else.
  const handleFocus = useCallback(() => {
    setAnchorId(cell.id);
    setExpanded(null);
    requestReveal();
  }, [cell.id, requestReveal]);

  // A node is handed to the parent as a *ref*, keyed by its term id rather than its position id,
  // so a cell opens its Cell Card in place and a class that is not a cell here (the ontology's
  // root) still resolves to the best page there is for it.
  const handleSelectTerm = useCallback(
    (node) => node && onNavigate?.({ id: node.termId, curie: node.curie, iri: node.iri }),
    [onNavigate]
  );

  // Named once so the select option and the count line below cannot describe different things.
  // Without a root class the whole tree is named after the ontology, not as its subclasses: the
  // document scopes the terms but is no superclass of them.
  const typeLabel = {
    [ROOT_SUBCLASSES]: rootLabel ? `sub class of ${rootLabel}` : `classes in ${ontologyTitle}`,
    [SUPERCLASSES]: `super class of ${anchorLabel}`,
    [SUBCLASSES]: `sub class of ${anchorLabel}`,
  };

  return (
    <CellCardWidget title={TITLE} actions={actions}>
      <Stack direction="row" alignItems="center" gap={1}>
        <Typography variant="body2" sx={{ color: "text.secondary", flexShrink: 0 }}>
          Type:
        </Typography>
        <CustomSingleSelect
          value={mode}
          onChange={changeMode}
          options={[ROOT_SUBCLASSES, SUPERCLASSES, SUBCLASSES].map((value) => ({
            value,
            label: typeLabel[value],
          }))}
          isFormControlFullWidth
        />
        <Tooltip title="Reset">
          <IconButton onClick={handleReset} aria-label="Reset hierarchy">
            <RestartAlt />
          </IconButton>
        </Tooltip>
        <Tooltip title="Focus current term">
          <IconButton onClick={handleFocus} aria-label="Focus current term">
            <TargetCross />
          </IconButton>
        </Tooltip>
      </Stack>

      <GridSearchBar value={query} onSubmit={changeQuery} />

      {items.length ? (
        <>
          {/* The scoped views are a handful of rows, but the whole ontology is far more — it
              scrolls in its own box rather than stretching the column past the widgets below it,
              the same way the Browse tab's hierarchy sidebar does. */}
          <Box ref={treeBoxRef} sx={{ maxHeight: "24rem", overflow: "auto" }}>
            <OntologyHierarchyTree
              items={items}
              expandedItems={expandedItems}
              onExpandedItemsChange={(_e, ids) => setExpanded(ids)}
              anchorTermId={cell.id}
              anchorIsCurrent
              onSelectTerm={handleSelectTerm}
            />
          </Box>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {/* "3 of 7" while a query is filtering, so the number always matches the rows drawn. */}
            {`Total number of ${typeLabel[mode]}: ${
              shown === total ? total : `${shown} of ${total}`
            }`}
          </Typography>
        </>
      ) : (
        <EmptyState
          message={
            query.trim()
              ? "No term in the hierarchy matches this filter."
              : mode === ROOT_SUBCLASSES
                ? "This ontology has no class hierarchy."
                : "This term is not placed in the ontology hierarchy."
          }
        />
      )}
    </CellCardWidget>
  );
};

OntologyHierarchy.propTypes = {
  cell: PropTypes.object.isRequired,
  hierarchy: PropTypes.array,
  // Display name of the ontology's root class, used in the select and the count line. Absent when
  // the ontology configures none, and the whole tree is then named after `ontologyTitle`.
  rootLabel: PropTypes.string,
  ontologyTitle: PropTypes.string,
  // Opens a term clicked in the tree, as a ResolvedRef-shaped { id, curie, iri }.
  onNavigate: PropTypes.func,
  actions: PropTypes.node,
};

export default OntologyHierarchy;
