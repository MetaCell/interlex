import PropTypes from "prop-types";
import { Divider } from "@mui/material";
import ImageNotSupportedOutlinedIcon from "@mui/icons-material/ImageNotSupportedOutlined";
import CellCardWidget from "../CellCardWidget";
import PropertyList from "../PropertyList";
import EmptyState from "../../../common/EmptyState";
import { buildRows } from "../buildRows";
import { useMappings } from "../../config/mappingsAtom";

export const TITLE = "Anatomical & Circuit Context";

/**
 * §3.3 Anatomical & Circuit Context (Figma 9239:67695): the anatomical reading of the cell,
 * followed by a schematic.
 *
 * Two things are conditional on triples the shipped ontology does not have:
 *
 * - **SPARC Maps row** — needs `hasSPARCMap`, which has zero occurrences (the `ilx:` prefix is not
 *   even in the file's @context). The row is hidden until it exists, per spec §6; the parser
 *   recognises the predicate under any prefix and lands it on `annotations.sparcMaps`.
 * - **The schematic** — the design shows a labelled spinal-cord cross-section, with an explicit
 *   "Context image not available" empty state (Figma 9239:67736). We render that empty state:
 *   `ilxtr:hasLaminarTermination`, which would drive the laminae shading, also has zero
 *   occurrences, so a drawn diagram would be decorative rather than data-bearing.
 */
const AnatomicalContext = ({ cell, predicateDisplay, actions, filterGridHref }) => {
  const mappings = useMappings();
  // hasSPARCMap is a deep link, so the parser routes it to `annotations` rather than treating it
  // as a phenotype. Shaped into a CellProperty here so PropertyRow renders it like any other row.
  const sparcMaps = cell.annotations?.sparcMaps || [];
  const rows = buildRows(
    mappings.regions.cellCard.anatomicalContext.rows,
    cell,
    predicateDisplay,
    mappings
  );
  if (sparcMaps.length) {
    // Joins the same PropertyList so it shares the table's columns, with the label resolved
    // through the standard chain (the ontology's own displayLabel, then the mappings document's
    // `predicates` entry) instead of wording pinned here. Only the row's *membership* is the
    // widget's: the values live on `annotations` (external map deep links, kept out of
    // `properties` so they can never become grid facets), so a region row could not find them.
    const [sparcRow] = buildRows([{ localName: "hasSPARCMap" }], cell, predicateDisplay, mappings);
    rows.push({
      ...sparcRow,
      prop: { localName: "hasSPARCMap", family: "eqv", negated: false, values: sparcMaps },
    });
  }

  return (
    <CellCardWidget title={TITLE} actions={actions}>
      <PropertyList rows={rows} filterHref={filterGridHref} />

      <Divider />

      <EmptyState
        icon={<ImageNotSupportedOutlinedIcon sx={{ color: "text.disabled" }} />}
        message="Context image not available"
        supportingText="A spinal-cord schematic appears once laminar termination data is published for this cell."
      />
    </CellCardWidget>
  );
};

AnatomicalContext.propTypes = {
  cell: PropTypes.object.isRequired,
  predicateDisplay: PropTypes.object,
  actions: PropTypes.node,
  // Same contract as BiologicalProperties: (localName, values) -> pre-filtered Grid View URL.
  // Not offered on the SPARC Maps row — those values are external deep links, not grid facets.
  filterGridHref: PropTypes.func,
};

export default AnatomicalContext;
