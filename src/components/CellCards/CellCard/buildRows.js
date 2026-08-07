import { DEFAULT_MAPPINGS, predicateLabel, predicateTooltip } from "../config/mappingDefaults";

/**
 * Turn a region's configured rows + a cell into the row models PropertyList renders.
 *
 * Labels and tooltips prefer the ontology's own `ilxtr:displayLabel` / `ilxtr:shortDefinition`
 * (14 of the 15 predicates Precision cells use ship both), falling back to the mappings document's
 * `predicates` section. That keeps the wording in the curators' hands: changing a displayLabel in
 * the ontology changes the Cell Card, with no front-end edit. A row that pins its own `label`
 * outranks both — that is the region saying it wants different wording here.
 *
 * @param {Array} rows            the region's rows (localName, render, required, label)
 * @param {object} cell           the CellTerm
 * @param {object} display        predicateDisplay from the parse, keyed by local name
 * @param {object} mappings       the loaded ontology's mappings
 */
export const buildRows = (rows, cell, display = {}, mappings = DEFAULT_MAPPINGS) =>
  rows.map(({ localName, render, required, label }) => {
    const meta = display[localName];
    return {
      localName,
      label: label || meta?.label || predicateLabel(mappings, localName),
      tooltip: meta?.description || predicateTooltip(mappings, localName),
      prop: cell.properties[localName],
      render,
      required,
    };
  });

/** Does a cell have any value for at least one of these predicates? */
export const hasAnyValue = (cell, localNames) =>
  localNames.some((n) => cell.properties[n]?.values?.length);

export default buildRows;
