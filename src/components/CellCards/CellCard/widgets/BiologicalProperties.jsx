import PropTypes from "prop-types";
import CellCardWidget from "../CellCardWidget";
import PropertyList from "../PropertyList";
import { buildRows } from "../buildRows";
import { useMappings } from "../../config/mappingsAtom";

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
const BiologicalProperties = ({ cell, predicateDisplay, actions }) => {
  const mappings = useMappings();
  return (
    <CellCardWidget title={TITLE} actions={actions}>
      <PropertyList
        rows={buildRows(
          mappings.regions.cellCard.biologicalProperties.rows,
          cell,
          predicateDisplay,
          mappings
        )}
      />
    </CellCardWidget>
  );
};

BiologicalProperties.propTypes = {
  cell: PropTypes.object.isRequired,
  predicateDisplay: PropTypes.object,
  actions: PropTypes.node,
};

export default BiologicalProperties;
