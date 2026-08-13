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

import { DEFAULT_MAPPINGS } from "../config/mappingDefaults";

// Species / soma location / marker genes by default. The auto-description needs at least two of
// them to read as a sentence rather than a fragment (spec §6) — the bindings and the minimum are
// both the `definition` region of the mappings document, so an ontology whose cells are described
// by other predicates still gets a banner. Counted straight off the same three bindings
// `DefinitionBanner` reads (not a separately configured list), so the two cannot drift apart:
// `cellClass` is excluded because its clause always falls back to "cell" and is never a hole.
export const hasDefinition = (cell, mappings = DEFAULT_MAPPINGS) => {
  const { species, somaLocation, markerGenes, minPredicates } = mappings.regions.cellCard.definition;
  const populated = [species, somaLocation, markerGenes].filter(
    (localName) => localName && cell.properties[localName]?.values?.length
  ).length;
  return populated >= minPredicates;
};

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
