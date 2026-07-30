/**
 * Which widgets a given cell has anything to show for (§6.4 conditional rendering).
 *
 * Kept out of the widget files so each of those exports a component and nothing else — mixing a
 * component and a helper in one module breaks Vite's fast refresh for that file.
 *
 * The rule throughout is: a widget with no data hides entirely rather than rendering an empty
 * frame, so a sparse cell produces a clean, collapsed card. The one exception is the anatomical
 * context image, which the design gives an explicit "not available" state.
 */

// Species / soma location / marker genes. The auto-description needs at least two of these to
// read as a sentence rather than a fragment (spec §6).
const DESCRIPTION_PREDICATES = [
  "hasInstanceInTaxon",
  "hasSomaLocatedIn",
  "hasNucleicAcidExpressionPhenotype",
];

export const hasDefinition = (cell) =>
  DESCRIPTION_PREDICATES.filter((n) => cell.properties[n]?.values?.length).length >= 2;

// Either the SPARC deep link or the atlas annotation pills. The link's triple does not exist in
// the shipped ontology, so in practice this is the atlas-pill branch (54 of 161 cells).
export const hasTranscriptomicProfile = (cell) =>
  Boolean(
    cell.annotations?.sparcTranscriptomicsLinks?.length ||
      cell.annotations?.atlasAnnotation?.length
  );

// No `hasCellGrouping` here on purpose: the Interactive Cell Grouping widget always renders.
// NervoSensus is a single application rather than a per-cell resource, so there is always somewhere
// to link; only the precision of the link varies (see buildNervoSensusLink). Gating it on a
// per-cell `hasNervoSensusLink` triple — which has zero occurrences upstream — meant the widget
// never appeared at all, though the design shows it.

export const hasCrossNomenclature = (cell) => Boolean(cell.mappings?.length);

export const hasSourcePublication = (cell) => Boolean(cell.sources?.length);
