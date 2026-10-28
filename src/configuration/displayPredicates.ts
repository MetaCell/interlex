// Which predicate an element renders its text from. Each element of displayPredicates.json lists
// candidate predicates by rank; the first one the node carries a value for wins.
//  - termTitle: the single term page title, breadcrumb and fork dialogs.
//  - termLabel: the parsed term's label (search results, hierarchy focus, merge panel).
//  - hierarchyNode: the label of each node in the Hierarchy tree.

import displayPredicates from "./displayPredicates.json";
import { shortenIri } from "./predicateConfig";

export type DisplayElement = keyof typeof displayPredicates;

type Literal = string | { "@value"?: string; "@language"?: string };

const textOf = (literal: Literal): string | undefined =>
  typeof literal === "string" ? literal : literal?.["@value"];

// A multilingual value prefers its English (or untagged) form over whichever came first.
const literalText = (value: Literal | Literal[] | undefined): string | undefined => {
  const literals = (Array.isArray(value) ? value : [value]).filter(Boolean) as Literal[];
  const english = literals.find(
    (l) => typeof l === "string" || !l["@language"] || l["@language"] === "en"
  );
  return textOf(english ?? literals[0])?.trim() || undefined;
};

// A node's keys are curies under the base @context but full IRIs when a fork's context is stripped.
export const resolveDisplayText = (
  node: Record<string, any> | null | undefined,
  element: DisplayElement
): string | undefined => {
  if (!node) return undefined;
  const valueByPredicate = new Map(Object.keys(node).map((key) => [shortenIri(key), node[key]]));
  for (const predicate of displayPredicates[element]) {
    const text = literalText(valueByPredicate.get(predicate));
    if (text) return text;
  }
  return undefined;
};
