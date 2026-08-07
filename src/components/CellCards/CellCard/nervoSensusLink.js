import {
  NERVOSENSUS_URL,
  NERVOSENSUS_SPECIES,
  NERVOSENSUS_SOMA,
  NERVOSENSUS_AXON,
} from "../config/cellCardConfig";
import { DEFAULT_MAPPINGS } from "../config/mappingDefaults";

/**
 * Build the NervoSensus deep link for a cell.
 *
 * NervoSensus is one app rather than a per-cell resource, so the widget always has somewhere to
 * send the user. What varies is how precisely: the app reads a documented set of query params on
 * load, so we pass everything the cell can supply and it applies what it recognises.
 *
 * Params (from the app's own deep-link handler; verified identical in the deployed build):
 *   atlasannotation  opens that cell's modal, via its ATLAS_TO_CELL lookup
 *   species          mouse | human | macaque | guinea pig
 *   location         soma_drg | soma_tg
 *   axon             fiber_a_beta | fiber_a_delta | fiber_c
 *   gene             a gene symbol, matched against its own filter options
 *
 * Deliberately no attempt to know which values the app has data for: every filter is looked up
 * against its own `<select>` options and **silently ignored when absent**, so passing a value it
 * does not know costs nothing, while hardcoding its vocabulary here would rot the moment their
 * dataset changes.
 */

// Match a label to a target value by keyword, case-insensitively. The ontology labels are stable
// prose ("Mus musculus", "type Aβ (beta) nerve fiber") and the app's values are short slugs, so a
// keyword table is both sufficient and easy to extend.
const matchLabel = (label, table) => {
  const text = (label || "").toLowerCase();
  for (const [keyword, value] of Object.entries(table)) {
    if (text.includes(keyword)) return value;
  }
  return undefined;
};

const firstValue = (cell, localName) => cell?.properties?.[localName]?.values?.[0];

/**
 * The atlas annotation the app can resolve. Ours carry a dataset suffix its keys do not:
 * `A-PEP.SCGN/ADRA2C:U19_HMS` here vs `A-PEP.SCGN/ADRA2C` there, so the suffix is dropped.
 * 48 of the 161 Precision cells resolve to a NervoSensus cell this way.
 */
export const atlasCellKey = (cell) => {
  const first = cell?.annotations?.atlasAnnotation?.[0];
  return first ? String(first).split(":")[0] : undefined;
};

/**
 * @param {object} cell      the CellTerm
 * @param {object} mappings  the loaded ontology's mappings (species/soma/axon/gene predicates)
 * @returns {{ href: string, precise: boolean, filters: string[] }}
 *   href     where the tile points
 *   precise  true when the link opens this exact cell rather than a filtered list
 *   filters  human-readable names of the filters applied, for the widget's caption
 */
export const buildNervoSensusLink = (cell, mappings = DEFAULT_MAPPINGS) => {
  // A curator-supplied per-cell link wins outright — it is more specific than anything we infer.
  // (`hasNervoSensusLink` has zero occurrences upstream today; this is the forward-compatible path.)
  const curated = cell?.annotations?.nervoSensusLinks?.[0];
  if (curated) {
    return { href: curated.iri || curated.id, precise: true, filters: [] };
  }

  let url;
  try {
    url = new URL(NERVOSENSUS_URL);
  } catch {
    return { href: NERVOSENSUS_URL, precise: false, filters: [] };
  }

  const filters = [];

  const atlas = atlasCellKey(cell);
  if (atlas) url.searchParams.set("atlasannotation", atlas);

  // Species and soma location read the same bindings the auto-generated description uses
  // (`regions.cellCard.definition`): both features mean the same predicate, so repointing one
  // for an ontology whose cells carry it under a different name keeps the two in agreement rather
  // than requiring the operator to update two independent settings to stay in sync.
  const { species: speciesPredicate, somaLocation: somaPredicate } = mappings.regions.cellCard.definition;
  const { axonPredicate } = mappings.regions.cellCard.cellGrouping;

  const speciesValue = firstValue(cell, speciesPredicate);
  const species = matchLabel(speciesValue?.label, NERVOSENSUS_SPECIES);
  if (species) {
    url.searchParams.set("species", species);
    filters.push(species);
  }

  const somaValue = firstValue(cell, somaPredicate);
  const soma = matchLabel(somaValue?.label, NERVOSENSUS_SOMA);
  if (soma) {
    url.searchParams.set("location", soma);
    filters.push(somaValue.label);
  }

  const axonValue = firstValue(cell, axonPredicate);
  const axon = matchLabel(axonValue?.label, NERVOSENSUS_AXON);
  if (axon) {
    url.searchParams.set("axon", axon);
    filters.push(axonValue.label);
  }

  const gene = firstValue(cell, mappings.regions.cellCard.transcriptomicProfile.markerGenePredicate);
  // Only a resolved symbol is useful; an unlabelled gene falls back to its CURIE
  // ("NCBIGene:667742"), which the app's gene filter has no option for.
  if (gene && gene.label && !gene.label.includes(":")) {
    url.searchParams.set("gene", gene.label);
    filters.push(gene.label);
  }

  return { href: url.toString(), precise: Boolean(atlas), filters };
};

export default buildNervoSensusLink;
