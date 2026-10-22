// Reading the parsed subClassOf hierarchy around one term. Shared by every view that draws it —
// the Cell Card widget, the term Overview and the Browse tab — so they all start from the term's
// primary position and none can settle on a different "main" parent of its own.

import type { HierarchyNode } from "./types";

/** Nodes from a root down to the term's own position, or null when the tree does not place it. */
export const primaryPath = (
  nodes: HierarchyNode[],
  termId: string,
  trail: HierarchyNode[] = []
): HierarchyNode[] | null => {
  for (const node of nodes) {
    if (node.secondary) continue;
    const next = [...trail, node];
    if (node.termId === termId) return next;
    const deeper = primaryPath(node.children, termId, next);
    if (deeper) return deeper;
  }
  return null;
};

const holdsOwnRow = (node: HierarchyNode, termId: string): boolean =>
  node.termId === termId ? !node.secondary : node.children.some((n) => holdsOwnRow(n, termId));

/**
 * The tree cut down to the rows that lead to `termId`: the chain to its own position, plus a chain
 * to each further parent ending in the term's asterisked leaf there. Those are the rows the whole
 * tree draws for the term, so "superclasses of" can never name a parent the tree does not.
 *
 * The primary chain is listed first at every level, whatever the labels' order: it is the one
 * the reader is after, and the asterisked ones read as the asides they are.
 */
export const superclassTree = (nodes: HierarchyNode[], termId: string): HierarchyNode[] =>
  nodes
    .flatMap((node) => {
      if (node.termId === termId) return [{ ...node, children: [] }];
      const children = superclassTree(node.children, termId);
      return children.length ? [{ ...node, children }] : [];
    })
    .sort((a, b) => Number(holdsOwnRow(b, termId)) - Number(holdsOwnRow(a, termId)));
