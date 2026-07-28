import {
  RELATION_PREDICATES,
  SUBCLASS_EDGE_LABEL,
  ASSERTED_SUBCLASS_EDGE_LABEL,
} from "../config/cellCardConfig";

// A cell label carries its provenance as a trailing parenthetical — "DRG PEP3.2 (Krauter2025)".
// The graph node shows the id and that provenance on its own line, so strip it from the title.
const splitProvenance = (label = "") => {
  const m = /^(.*?)\s*\(([^()]+)\)\s*$/.exec(label);
  return m ? { title: m[1], provenance: m[2] } : { title: label, provenance: undefined };
};

const cellNode = (cell, isCurrent) => {
  const { title, provenance } = splitProvenance(cell.label);
  return {
    id: cell.id,
    label: title || cell.curie,
    // Figma draws "npokb:998 · Bhuiyan2025" beneath the title.
    subtitle: [cell.curie, provenance].filter(Boolean).join(" · "),
    isCurrent,
    ref: { id: cell.id, curie: cell.curie, label: cell.label, iri: cell.iri, kind: "interlex" },
  };
};

const refNode = (ref) => ({
  id: ref.id,
  label: ref.label || ref.curie,
  isCurrent: false,
  ref,
});

/**
 * Build the relationship-graph model for one cell (§4.1, Figma 9478:72004).
 *
 * Shape, per the design: the subClassOf parent above, the current cell in the middle, its
 * asserted-subclass mappings fanned out below, and two lateral satellites — soma location to the
 * left and gene expression to the right.
 *
 * Which phenotype predicates may appear is `RELATION_PREDICATES` in cellCardConfig, not a
 * hardcoded list here: Fahim asked for this explicitly, because drawing every phenotype would
 * make the graph unreadable.
 *
 * @param {object} cell      the CellTerm at the centre
 * @param {object} neighbours { parents, children } from hierarchyNeighbours
 */
export const buildRelationGraph = (cell, neighbours = {}) => {
  const nodes = [cellNode(cell, true)];
  const edges = [];
  const seen = new Set([cell.id]);

  const add = (node) => {
    if (seen.has(node.id)) return false;
    seen.add(node.id);
    nodes.push(node);
    return true;
  };

  // Parents above (dotted "subclass of"). The edge runs parent -> cell so the layout puts the
  // parent on the rank *above* and the arrow points down into the current node, as designed.
  for (const parent of neighbours.parents || []) {
    if (add(cellNode(parent, false))) {
      edges.push({
        from: parent.id,
        to: cell.id,
        kind: "subClassOf",
        label: SUBCLASS_EDGE_LABEL,
      });
    }
  }

  // Cross-nomenclature mappings below ("asserted subclass of"). These are the sibling records in
  // other nomenclatures, which is what the design fans out under the current node.
  //
  // `flagged` draws the dashed border and the asterisk, and it means what the legend's footnote
  // says: proposed evidence only. The parser derives evidence from the relation, which yields only
  // "described" and "inferred" in the shipped graph, so no node is flagged today — the marker
  // waits on a curator "don't add" flag. The legend footnote is shown only when one appears.
  for (const mapping of cell.mappings || []) {
    const node = refNode(mapping.ref);
    node.flagged = mapping.evidence === "proposed";
    if (add(node)) {
      edges.push({
        from: cell.id,
        to: mapping.ref.id,
        kind: "assertedSubClassOf",
        label: ASSERTED_SUBCLASS_EDGE_LABEL,
      });
    }
  }

  // Direct subClassOf children, on the rank below (cell -> child, arrow pointing down at them).
  for (const child of neighbours.children || []) {
    if (add(cellNode(child, false))) {
      edges.push({
        from: cell.id,
        to: child.id,
        kind: "subClassOf",
        label: SUBCLASS_EDGE_LABEL,
      });
    }
  }

  // Lateral phenotype satellites. Several values collapse into one node ("SCGN, ADRA2C" in the
  // design) so the graph shows the relation rather than one node per gene.
  for (const predicate of RELATION_PREDICATES) {
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
