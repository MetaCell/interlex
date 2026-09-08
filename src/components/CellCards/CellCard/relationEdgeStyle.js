// Edge style per relation kind, in UML class-diagram notation — the notation ontology diagrams
// (Graffoo, Protégé's plug-ins, most papers) borrow for class hierarchies, so a reader can tell the
// taxonomy from the properties without the legend:
//   - subclass of: generalisation — a solid line with a hollow triangle at the superclass;
//   - asserted subclass of: realisation — the same triangle on a dashed line, UML's mark for
//     "conforms to a description made elsewhere", which is what a curator's subclass claim against
//     another nomenclature's cell type is;
//   - soma location, expresses: association — a solid line with a filled arrowhead at the value;
//     "expresses" keeps the brand colour from the design;
//   - consistent with (TEMP:mapsTo): a symmetric claim, so an association headed at both ends.
// One table for the graph's connectors and the legend's swatches, so the two cannot drift apart.
export const edgeStyle = (kind, palette) => {
  switch (kind) {
    case "subClassOf":
      return { stroke: palette.grey[500], head: "hollow" };
    case "assertedSubClassOf":
      return { stroke: palette.grey[500], dash: "6 4", head: "hollow" };
    case "mapsTo":
      return { stroke: palette.grey[500], head: "filled", bidirectional: true };
    case "expresses":
      return { stroke: palette.primary.main, head: "filled" };
    case "somaLocation":
    default:
      return { stroke: palette.grey[500], head: "filled" };
  }
};

// Arrowhead outlines with the tip at the origin, pointing along +x, in px for a 1.5px line. The
// hollow one is filled with the paper colour so the line does not show through it.
export const ARROW_HEADS = {
  filled: { d: "M 0 0 L -7 -3.5 L -7 3.5 z", length: 7 },
  hollow: { d: "M 0 0 L -10 -4.5 L -10 4.5 z", length: 10 },
};

export const arrowHeadProps = (head, stroke, palette) =>
  head === "hollow"
    ? { fill: palette.background.paper, stroke, strokeWidth: 1.2, strokeLinejoin: "miter" }
    : { fill: stroke };
