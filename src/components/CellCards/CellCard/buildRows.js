import { labelFor, PREDICATE_TOOLTIPS } from "../config/gridConfig";

/**
 * Turn `cellCardConfig` rows + a cell into the row models PropertyList renders.
 *
 * Labels and tooltips prefer the ontology's own `ilxtr:displayLabel` / `ilxtr:shortDefinition`
 * (14 of the 15 predicates Precision cells use ship both), falling back to gridConfig's
 * hardcoded maps. That keeps the wording in the curators' hands: changing a displayLabel in the
 * ontology changes the Cell Card, with no front-end edit.
 *
 * @param {Array} rows            entries from cellCardConfig (localName, render, required)
 * @param {object} cell           the CellTerm
 * @param {object} display        predicateDisplay from the parse, keyed by local name
 */
export const buildRows = (rows, cell, display = {}) =>
  rows.map(({ localName, render, required }) => {
    const meta = display[localName];
    return {
      localName,
      label: meta?.label || labelFor(localName),
      tooltip: meta?.description || PREDICATE_TOOLTIPS[localName],
      prop: cell.properties[localName],
      render,
      required,
    };
  });

/** Does a cell have any value for at least one of these predicates? */
export const hasAnyValue = (cell, localNames) =>
  localNames.some((n) => cell.properties[n]?.values?.length);

export default buildRows;
