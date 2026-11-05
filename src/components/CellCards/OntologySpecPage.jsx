import PropTypes from "prop-types";
import { useOutletContext } from "react-router-dom";
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
import { isIri } from "../../parsers/neurdfParser";

// The header names things outside InterLex as often as terms in it (imported ontology files, the
// community's site), so an IRI links to itself rather than through the term-page rewrite.
const SpecValue = ({ value }) =>
  value.iri ? (
    <Link href={value.iri} target="_blank" rel="noopener" variant="body2" title={value.iri}>
      {value.label || value.curie}
    </Link>
  ) : (
    <Typography variant="body2">{value.label}</Typography>
  );

SpecValue.propTypes = {
  value: PropTypes.shape({
    label: PropTypes.string,
    curie: PropTypes.string,
    iri: PropTypes.string,
  }).isRequired,
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
  const { data } = useOutletContext();
  const { meta, spec } = data;

  return (
    <Container sx={{ py: 3 }}>
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
                    <SpecValue value={{ label: meta.iri, iri: isIri(meta.iri) ? meta.iri : "" }} />
                  </TableCell>
                </TableRow>
              )}
              {spec.header.map((row) => (
                <TableRow key={row.predicate}>
                  <TableCell>{row.predicate}</TableCell>
                  <TableCell>
                    <Stack gap={0.5}>
                      {row.values.map((value) => (
                        <SpecValue key={value.id} value={value} />
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
