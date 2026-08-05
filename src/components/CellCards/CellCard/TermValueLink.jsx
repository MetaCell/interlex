import PropTypes from "prop-types";
import { Link, Typography } from "@mui/material";
import { termLink } from "../config/gridConfig";

/**
 * One resolved reference rendered as its label, linked where we can address the term.
 *
 * Link target comes from the shared `termLink()`: an InterLex ILX term goes to its own page,
 * an OBO term (UBERON / CHEBI / NCBITaxon) to OLS, and anything else to its own IRI. A literal
 * or an unaddressable reference renders as plain text rather than a dead link.
 *
 * Note there is no definition tooltip here. The shipped graph carries labels and synonyms but
 * *zero* definitions for UBERON / NCBIGene / CHEBI / NCBITaxon / npokb, so spec §2.4's hover
 * definition has no data source yet; adding one needs OLS/NCBI at runtime or new triples.
 */
const TermValueLink = ({ value, variant = "body2" }) => {
  const href = termLink(value);
  // A gene with no rdfs:label in the graph (26% of NCBIGene nodes) resolves to its CURIE —
  // show it, per Tom: render the compacted form rather than dropping the value.
  const text = value.label || value.curie;

  if (!href) {
    return (
      <Typography component="span" variant={variant} sx={{ color: "text.primary" }}>
        {text}
      </Typography>
    );
  }

  return (
    <Link
      href={href}
      // Cross-ontology targets (OLS, NCBI, a DOI) are external; the InterLex term route is not,
      // but the design opens term links in a new tab from the card either way so the card stays put.
      target="_blank"
      rel="noopener"
      variant={variant}
      title={value.curie}
    >
      {text}
    </Link>
  );
};

TermValueLink.propTypes = {
  value: PropTypes.shape({
    id: PropTypes.string,
    curie: PropTypes.string,
    label: PropTypes.string,
    iri: PropTypes.string,
    kind: PropTypes.string,
  }).isRequired,
  variant: PropTypes.string,
};

export default TermValueLink;
