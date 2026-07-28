import { Fragment } from "react";
import PropTypes from "prop-types";
import { Alert, AlertTitle, Typography, Link } from "@mui/material";
import TermValueLink from "./TermValueLink";
import { toDoi } from "./citationService";

const joinRefs = (values, conjunction = "and") =>
  values.map((v, i) => (
    <Fragment key={v.id}>
      {i > 0 && (i === values.length - 1 ? ` ${conjunction} ` : ", ")}
      <TermValueLink value={v} />
    </Fragment>
  ));

/**
 * §2.3 Auto-generated Description (Figma 9239:67573, the "Definition" banner).
 *
 * Assembled from the cell's structured properties rather than read from a definition field: not
 * one of the 161 Precision cells carries `definition`, `skos:definition`, `NIFRID:definition` or
 * `rdfs:comment`. (The parser's `definition` therefore always falls through to
 * `ilxtr:genLabel`, a ~300-character machine string — usable as a tooltip, not as prose.)
 *
 * Suppressed when fewer than two of species / soma location / marker genes are populated, so it
 * never renders a sentence with holes in it.
 */
const DefinitionBanner = ({ cell }) => {
  const taxon = cell.properties.hasInstanceInTaxon?.values || [];
  const soma = cell.properties.hasSomaLocatedIn?.values || [];
  const genes = cell.properties.hasNucleicAcidExpressionPhenotype?.values || [];
  const baseClass = cell.properties.neurondmBaseClass?.values?.[0];
  const source = cell.sources?.[0];
  const doi = toDoi(source?.iri || source?.id);

  return (
    // The design's banner is a brand-tinted panel with a title, and carries no status icon.
    <Alert severity="info" icon={false}>
      <AlertTitle>Definition</AlertTitle>
      <Typography variant="body2" component="div" sx={{ color: "text.secondary" }}>
        This {baseClass ? baseClass.label : "cell"}
        {taxon.length > 0 && <>, observed in {joinRefs(taxon)},</>}
        {soma.length > 0 && (
          <>
            {" "}
            is located in {joinRefs(soma, cell.properties.hasSomaLocatedIn?.combinator === "or" ? "or" : "and")}
          </>
        )}
        {genes.length > 0 && <> and expresses {joinRefs(genes)}</>}
        {"."}
        {source && (
          <>
            {" "}
            To access the source nomenclature, view{" "}
            {doi ? (
              <Link href={`https://doi.org/${doi}`} target="_blank" rel="noopener">
                {source.label && source.label !== source.curie ? source.label : doi}
              </Link>
            ) : (
              <TermValueLink value={source} />
            )}
            {"."}
          </>
        )}
      </Typography>
    </Alert>
  );
};

DefinitionBanner.propTypes = {
  cell: PropTypes.object.isRequired,
};


export default DefinitionBanner;
