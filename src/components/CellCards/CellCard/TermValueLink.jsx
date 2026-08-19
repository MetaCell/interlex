import PropTypes from "prop-types";
import { Link, Typography } from "@mui/material";
import { termLink } from "../config/gridConfig";
import { useTermLinkContext } from "../../../hooks/useContextOntology";

/**
 * One resolved reference rendered as its label, linked where we can address the term.
 *
 * Link target comes from the shared `termLink()`, and always stays on InterLex, inside the
 * context ontology the page is read under: an InterLex term goes to its own page, an external
 * term (UBERON / CHEBI / NCBIGene…) to InterLex's `dns/` record of it — never to the external
 * site itself. Display is untouched by the rewrite: the label and CURIE render exactly what the
 * ontology states. A literal or an unaddressable reference renders as plain text rather than a
 * dead link.
 *
 * Note there is no definition tooltip here. The shipped graph carries labels and synonyms but
 * *zero* definitions for UBERON / NCBIGene / CHEBI / NCBITaxon / npokb, so spec §2.4's hover
 * definition has no data source yet; adding one needs OLS/NCBI at runtime or new triples.
 */
const TermValueLink = ({ value, variant = "body2" }) => {
  const linkContext = useTermLinkContext();
  const href = termLink(value, linkContext);
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
      // The design opens term links in a new tab from the card, so the card stays put.
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
