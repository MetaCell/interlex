import { DEFAULT_MAPPINGS } from "../config/mappingDefaults";

// A label (with its provenance parenthetical, e.g. "DRG PEP3.2 (Krauter2025)") is never split
// across the title and subtitle lines — Filippo asked that a label always stay intact on its own
// line, truncated with an ellipsis rather than divided. The subtitle carries the curie alone.
const cellNode = (cell, isCurrent) => ({
  id: cell.id,
  label: cell.label || cell.curie,
  subtitle: cell.label ? cell.curie : undefined,
  isCurrent,
  ref: { id: cell.id, curie: cell.curie, label: cell.label, iri: cell.iri, kind: "interlex" },
});

// Every cross-nomenclature target is itself an npokb record (`CellMapping.ref`), the same as the
// current cell and its hierarchy neighbours — so it carries the same internal id, shown the same
// way `cellNode` shows one, instead of the box going without.
const refNode = (ref) => ({
  id: ref.id,
  label: ref.label || ref.curie,
  subtitle: ref.label ? ref.curie : undefined,
  isCurrent: false,
  ref,
});

/**
 * Build the relationship-graph model for one cell (§4.1, Figma 9478:72004).
 *
 * Shape: the current cell in the middle; above it, on one rank, its subClassOf parents and the
 * cross-nomenclature types it is asserted a subclass of; below it, its subClassOf children and the
 * records it is consistent with; and two lateral satellites — soma location to the left and gene
 * expression to the right. Which rank a cross-nomenclature relation takes is its configured
 * `direction`.
 *
 * Every edge runs subject -> object, so its arrow reads the way the relation does: a subclass-of
 * edge climbs from the subclass to its superclass, and `direction` tells the layout which rank the
 * object takes. (The mockup pointed subclass-of down into the cell and fanned every mapping out
 * below; the curators asked for both to change.)
 *
 * Edges are pushed hierarchy first: the layout fans a side's relation kinds out left to right in
 * order of first appearance, so the hierarchy sits left above and below.
 *
 * A record related in both directions — a superclass the cell is also "consistent with", which the
 * shipped graph has eleven of — is drawn once per side. One box can only take one rank, so the
 * other relation's path would have to cross the whole graph to reach it and run into the first
 * relation's drop; two boxes give each relation its own entry.
 *
 * Which phenotype predicates may appear is the mappings document's `relationshipGraph` region, not
 * a hardcoded list here: Fahim asked for this explicitly, because drawing every phenotype would
 * make the graph unreadable.
 *
 * @param {object} cell      the CellTerm at the centre
 * @param {object} neighbours { parents, children } from hierarchyNeighbours
 * @param {object} mappings  the loaded ontology's mappings
 */
export const buildRelationGraph = (cell, neighbours = {}, mappings = DEFAULT_MAPPINGS) => {
  const config = mappings.regions.cellCard.relationshipGraph;
  const nodes = [cellNode(cell, true)];
  const edges = [];
  const seen = new Set([cell.id]);
  const sideOf = new Map();

  // Returns the id to draw the edge against: the node itself, or its copy on the other side.
  const place = (node, side) => {
    const first = sideOf.get(node.id);
    const id = first === undefined || first === side ? node.id : `${node.id}::${side}`;
    if (!seen.has(id)) {
      seen.add(id);
      if (first === undefined) sideOf.set(node.id, side);
      nodes.push({ ...node, id });
    }
    return id;
  };

  // Parents above ("subclass of"): the cell is the subclass, so the arrow climbs into them.
  for (const parent of neighbours.parents || []) {
    const to = place(cellNode(parent, false), "above");
    if (!edges.some((e) => e.to === to && e.kind === "subClassOf")) {
      edges.push({ from: cell.id, to, kind: "subClassOf", label: config.subClassOfLabel, direction: "up" });
    }
  }

  // Direct subClassOf children, on the rank below: each child is the subclass, so its arrow climbs
  // into the current node.
  for (const child of neighbours.children || []) {
    const from = place(cellNode(child, false), "below");
    if (!edges.some((e) => e.from === from && e.kind === "subClassOf")) {
      edges.push({ from, to: cell.id, kind: "subClassOf", label: config.subClassOfLabel, direction: "up" });
    }
  }

  // Cross-nomenclature relations, one edge kind per configured predicate, to the sibling records
  // in other nomenclatures. A record reached by two relations is one node with two edges: they are
  // different claims.
  //
  // `flagged` draws the dashed border and the asterisk, and it means what the legend's footnote
  // says: proposed evidence only. The parser derives evidence from the relation, which yields only
  // "described" and "inferred" in the shipped graph, so no node is flagged today — the marker
  // waits on a curator "don't add" flag. The legend footnote is shown only when one appears.
  for (const relation of config.crossNomenclature) {
    for (const mapping of cell.mappings || []) {
      if (!mapping.predicates.includes(relation.predicate)) continue;
      const node = refNode(mapping.ref);
      node.flagged = mapping.evidence === "proposed";
      const to = place(node, relation.direction === "up" ? "above" : "below");
      edges.push({
        from: cell.id,
        to,
        kind: relation.kind,
        label: relation.label,
        direction: relation.direction,
      });
    }
  }

  // Lateral phenotype satellites. Several values collapse into one node ("SCGN, ADRA2C" in the
  // design) so the graph shows the relation rather than one node per gene.
  for (const predicate of config.predicates) {
    const values = cell.properties[predicate.localName]?.values || [];
    if (!values.length) continue;
    const id = `${cell.id}::${predicate.localName}`;
    nodes.push({
      id,
      label: values.map((v) => v.label || v.curie).join(", "),
      isCurrent: false,
      // A single value is navigable; a collapsed list has no one target.
      ref: values.length === 1 ? values[0] : undefined,
    });
    seen.add(id);
    edges.push({
      from: cell.id,
      to: id,
      kind: predicate.kind,
      label: predicate.label,
      direction: predicate.direction,
    });
  }

  return { nodes, edges };
};

export default buildRelationGraph;
