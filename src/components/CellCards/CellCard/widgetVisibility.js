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

// `hasNervoSensusLink` has zero occurrences today, so this is false for every cell — the widget is
// built and wired, waiting on the triple (which the parser already recognises under any prefix).
export const hasCellGrouping = (cell) =>
  Boolean(cell.annotations?.nervoSensusLinks?.length);

export const hasCrossNomenclature = (cell) => Boolean(cell.mappings?.length);

export const hasSourcePublication = (cell) => Boolean(cell.sources?.length);
