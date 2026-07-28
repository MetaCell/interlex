import PropTypes from "prop-types";
import CellCardWidget from "../CellCardWidget";
import PropertyList from "../PropertyList";
import { buildRows } from "../buildRows";
import { BIOLOGICAL_PROPERTY_ROWS } from "../../config/cellCardConfig";

export const TITLE = "Biological Properties";

/**
 * §3.1 Biological Properties (Figma 9535:96273): the cell's phenotype table.
 *
 * Every row is `required`, so the table keeps the fixed shape the design shows — Function,
 * Adaptation and Threshold read "not specified" rather than disappearing, which is what makes
 * the absence legible to a curator.
 *
 * Note the design also shows a small grey method chip beside Neurotransmitter and Marker genes
 * ("snRNA"). That is deliberately absent here: the graph has no rdf-star qualifiers and no
 * `determinedByMethod` — the method vocabulary exists only as six unused
 * `ilxtr:hasConnectionDeterminedBy*` property declarations, used on zero cells. When it is
 * populated it will arrive as a *separate predicate*, not a qualifier on a value, so the chip
 * needs a design revision rather than just data.
 */
const BiologicalProperties = ({ cell, predicateDisplay, actions }) => (
  <CellCardWidget title={TITLE} actions={actions}>
    <PropertyList rows={buildRows(BIOLOGICAL_PROPERTY_ROWS, cell, predicateDisplay)} />
  </CellCardWidget>
);

BiologicalProperties.propTypes = {
  cell: PropTypes.object.isRequired,
  predicateDisplay: PropTypes.object,
  actions: PropTypes.node,
};

export default BiologicalProperties;
