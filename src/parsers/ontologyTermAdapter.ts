// Adapt a term as the context ontology describes it into the shapes the term Overview's three
// streams carry (details$ / hierarchy$ / predicates$ in OverView.jsx), which the term API fills for
// every other term. Pure functions over the parse, so the ontology path needs no fetch.

import type {
  CellTerm,
  CellProperty,
  HierarchyNode,
  ParsedOntology,
  PredicateDisplay,
  ResolvedRef,
} from "../components/CellCards/model/types";
import { labelFor } from "../components/CellCards/config/gridConfig";

// The CURIE is the term's identity throughout this mode: the hierarchy focus, a tree node's `iri`
// and a predicate row's subject must all match, and `Hierarchy` passes a non-ILX id through
// unchanged.
export const ontologyFocus = (cell: CellTerm): { id: string; label: string } => ({
  id: cell.curie,
  label: cell.label,
});

// --- details ----------------------------------------------------------------

// The subset of termParser's `Term` that Details reads. The ontology carries no synonyms, existing
// ids, OWL equivalent or provenance for these cells, so those are left out rather than faked.
export interface OntologyTermDetails {
  id: string;
  label: string;
  description?: string;
  type?: string;
}

export const ontologyDetails = (cell: CellTerm): OntologyTermDetails => ({
  id: cell.curie,
  label: cell.label,
  description: cell.definition,
  type: cell.rdfTypes.join(", "),
});

// --- hierarchy --------------------------------------------------------------

// `TreeItem` in hierarchies-parser: `id` unique per position (RichTreeView), `iri` the identity the
// focus is matched against.
export interface OntologyTreeItem {
  id: string;
  label: string;
  iri: string;
  children: OntologyTreeItem[];
}

export interface OntologyHierarchyOption {
  id: string;
  label: string;
}

export interface OntologyHierarchy {
  options: { children: OntologyHierarchyOption[]; superclasses: OntologyHierarchyOption[] };
  treeChildren: OntologyTreeItem[];
  treeSuperclasses: OntologyTreeItem[];
}

const EMPTY_HIERARCHY: OntologyHierarchy = {
  options: { children: [], superclasses: [] },
  treeChildren: [],
  treeSuperclasses: [],
};

const toTreeItem = (node: HierarchyNode): OntologyTreeItem => ({
  id: node.id,
  label: node.label,
  iri: node.curie,
  children: node.children.map(toTreeItem),
});

// Any position of the class will do: the parse computes children per class, not per position.
const findNode = (nodes: HierarchyNode[], termId: string): HierarchyNode | undefined => {
  for (const node of nodes) {
    if (node.termId === termId) return node;
    const hit = findNode(node.children, termId);
    if (hit) return hit;
  }
  return undefined;
};

// The hierarchy is a DAG: 15 Precision cells have several parents, and the superclass tree shows
// every way of reaching the term, as the API path's forest does.
const pathsTo = (
  nodes: HierarchyNode[],
  termId: string,
  trail: HierarchyNode[] = []
): HierarchyNode[][] => {
  const out: HierarchyNode[][] = [];
  for (const node of nodes) {
    const here = [...trail, node];
    if (node.termId === termId) out.push(here);
    else out.push(...pathsTo(node.children, termId, here));
  }
  return out;
};

// Folded into one forest, so two parents render as two branches of one root, not two trees.
const mergePaths = (paths: HierarchyNode[][]): OntologyTreeItem[] => {
  const roots: OntologyTreeItem[] = [];
  for (const path of paths) {
    let level = roots;
    let id = "";
    for (const node of path) {
      id = id ? `${id}/${node.termId}` : node.termId;
      let item = level.find((candidate) => candidate.iri === node.curie);
      if (!item) {
        item = { id, label: node.label, iri: node.curie, children: [] };
        level.push(item);
      }
      level = item.children;
    }
  }
  return roots;
};

const collectOptions = (items: OntologyTreeItem[]): OntologyHierarchyOption[] => {
  const byId = new Map<string, string>();
  const walk = (list: OntologyTreeItem[]) => {
    for (const item of list) {
      if (!byId.has(item.iri)) byId.set(item.iri, item.label);
      walk(item.children);
    }
  };
  walk(items);
  return [...byId.entries()]
    .map(([id, label]) => ({ id, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
};

/**
 * Both hierarchy directions for one class, from the tree the parse already reduced. Keyed by
 * `termId`, so it answers for a class with no record of its own — the root the cells hang from.
 */
export const ontologyHierarchy = (
  ontology: Pick<ParsedOntology, "hierarchy"> | null | undefined,
  termId: string
): OntologyHierarchy => {
  const roots = ontology?.hierarchy;
  if (!roots?.length || !termId) return EMPTY_HIERARCHY;

  const self = findNode(roots, termId);
  const treeChildren = self ? [toTreeItem(self)] : [];
  const treeSuperclasses = mergePaths(pathsTo(roots, termId));

  return {
    options: {
      children: collectOptions(treeChildren),
      superclasses: collectOptions(treeSuperclasses),
    },
    treeChildren,
    treeSuperclasses,
  };
};

// --- predicates -------------------------------------------------------------

// `predicateParser`'s PredicateGroup: what CustomizedTable normalises into Subject | Predicates |
// Objects rows.
export interface OntologyPredicateRow {
  subject: string;
  predicate: string;
  object: string;
}

export interface OntologyPredicateGroup {
  title: string;
  count: number;
  tableData: OntologyPredicateRow[];
}

const refText = (ref: ResolvedRef): string => ref.label || ref.curie;

// "soma in A *or* B" is a different claim from two independent assertions, and a flat table has
// nowhere else to say which one it is.
const withCombinator = (title: string, prop: CellProperty): string =>
  prop.combinator ? `${title} (${prop.combinator === "or" ? "any of" : "all of"})` : title;

/**
 * Everything the ontology asserts about one cell, grouped per predicate. Titles come from the
 * ontology's own `ilxtr:displayLabel` as the Cell Card's rows do, so both tabs name a predicate the
 * same way; objects fall back to the CURIE for a value the graph never labels.
 */
export const ontologyPredicateGroups = (
  cell: CellTerm,
  display: Record<string, PredicateDisplay> = {}
): OntologyPredicateGroup[] => {
  const groups: OntologyPredicateGroup[] = [];
  const subject = cell.curie;

  const add = (title: string, objects: (string | undefined)[]) => {
    const values = objects.filter((value): value is string => Boolean(value));
    if (!values.length) return;
    groups.push({
      title,
      count: values.length,
      tableData: values.map((object) => ({ subject, predicate: title, object })),
    });
  };

  const titleFor = (localName: string) => display[localName]?.label || labelFor(localName);

  add("@id", [cell.curie]);
  add("Label", [cell.label]);
  add("Type", cell.rdfTypes);
  // For every Precision cell today this is the generated phenotype string, not curated prose.
  if (cell.definition) {
    add(cell.definitionCurated === false ? "Definition (generated)" : "Definition", [cell.definition]);
  }

  for (const [localName, prop] of Object.entries(cell.properties)) {
    add(withCombinator(titleFor(localName), prop), prop.values.map(refText));
  }
  // Without the marker in the title, the row would state the opposite of what the ontology says.
  for (const [localName, prop] of Object.entries(cell.negated)) {
    add(withCombinator(`Not: ${titleFor(localName)}`, prop), prop.values.map(refText));
  }

  add("Source publication", cell.sources.map(refText));
  for (const evidence of ["described", "inferred", "proposed"] as const) {
    add(
      `Cross-nomenclature mapping (${evidence})`,
      cell.mappings.filter((m) => m.evidence === evidence).map((m) => refText(m.ref))
    );
  }

  const { annotations } = cell;
  add("Dataset annotation", annotations.atlasAnnotation);
  add("Data citation", annotations.dataCitations.map(refText));
  add("Curator note", annotations.curatorNotes);
  add("Alert", annotations.alertNotes);
  add("Temporary ID", [annotations.temporaryId]);
  add("Generated label", [annotations.generatedLabel]);
  add("Error", annotations.errors);
  add("SPARC transcriptomics", annotations.sparcTranscriptomicsLinks.map(refText));
  add("SPARC map", annotations.sparcMaps.map(refText));
  add("NervoSensus", annotations.nervoSensusLinks.map(refText));

  return groups;
};
