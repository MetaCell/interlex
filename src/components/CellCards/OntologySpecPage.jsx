import PropTypes from "prop-types";
import { Link as RouterLink } from "react-router-dom";
import { useOntologyData } from "./OntologyDataContext";
import {
  Alert,
  AlertTitle,
  Container,
  Link,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { iriLink, ontologyEntryForUrl, ontologyPath } from "./config/gridConfig";
import { useTermLinkContext } from "../../hooks/useContextOntology";

const OWL = "http://www.w3.org/2002/07/owl#";
const ONTOLOGY_VALUED_PROPERTIES = ["imports", "priorVersion", "backwardCompatibleWith", "incompatibleWith"];
const ONTOLOGY_VALUED_PREDICATES = new Set(
  ONTOLOGY_VALUED_PROPERTIES.flatMap((name) => [`owl:${name}`, `${OWL}${name}`])
);

// The header names things outside InterLex as often as terms in it (the community's site, a
// licence), and those keep their own address. An ontology it points at opens in this viewer and
// an InterLex IRI on its term page, so neither takes the reader out of the app. An InterLex IRI
// with no page here (the owl:versionIRI the backend stamps per response) has nothing to open.
const hrefFor = (predicate, iri, linkContext) => {
  if (ONTOLOGY_VALUED_PREDICATES.has(predicate)) {
    const entry = ontologyEntryForUrl(iri);
    if (entry) return ontologyPath(entry);
  }
  return iriLink(iri, linkContext);
};

const isInAppPath = (href) => href.startsWith("/");

const SpecValue = ({ value, href }) => {
  const text = value.label || value.curie;
  if (!href) return <Typography variant="body2">{text}</Typography>;
  if (isInAppPath(href)) {
    return (
      <Link component={RouterLink} to={href} variant="body2" title={value.iri}>
        {text}
      </Link>
    );
  }
  return (
    <Link href={href} target="_blank" rel="noopener" variant="body2" title={value.iri}>
      {text}
    </Link>
  );
};

SpecValue.propTypes = {
  value: PropTypes.shape({
    label: PropTypes.string,
    curie: PropTypes.string,
    iri: PropTypes.string,
  }).isRequired,
  href: PropTypes.string,
};

const NoTermsYet = () => (
  <Alert severity="info">
    <AlertTitle>This ontology has no terms yet</AlertTitle>
    Set it as your active ontology, then add terms to it with &quot;Add term to active
    ontology&quot; on a term&apos;s page, or create new terms with the active ontology selected.
  </Alert>
);

// The "Specification" tab: the ontology's own header (its owl:Ontology node), one row per
// annotation, read from the same document the other tabs are built from.
const OntologySpecPage = () => {
  const data = useOntologyData();
  const { entry, meta, spec } = data;
  const linkContext = useTermLinkContext();

  return (
    <Container sx={{ flex: 1, minHeight: 0, overflowY: "auto", py: 3 }}>
      <Stack gap={3}>
        {!spec.hasTerms && <NoTermsYet />}
        <TableContainer component={Paper} variant="outlined">
          <Table aria-label={`${meta.title} specification`}>
            <TableHead>
              <TableRow>
                <TableCell>Property</TableCell>
                <TableCell>Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {meta.iri && (
                <TableRow>
                  <TableCell>Identifier</TableCell>
                  <TableCell>
                    <SpecValue value={{ label: meta.iri, iri: meta.iri }} href={ontologyPath(entry)} />
                  </TableCell>
                </TableRow>
              )}
              {spec.header.map((row) => (
                <TableRow key={row.predicate}>
                  <TableCell>{row.predicate}</TableCell>
                  <TableCell>
                    <Stack gap={0.5}>
                      {row.values.map((value) => (
                        <SpecValue
                          key={value.id}
                          value={value}
                          href={value.iri ? hrefFor(row.predicate, value.iri, linkContext) : undefined}
                        />
                      ))}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </Container>
  );
};

export default OntologySpecPage;
