import PropTypes from "prop-types";
import { Stack, Typography, Link, Divider } from "@mui/material";
import CellCardWidget from "../CellCardWidget";
import TermValueLink from "../TermValueLink";
import { NOT_SPECIFIED } from "../../config/cellCardConfig";

export const TITLE = "Source publication";

/**
 * §5.1 Source Publication (Figma 9239:67920): the cell's primary source, plus a source-data
 * pointer.
 *
 * Everything shown is what the ontology states about the cited work, read by the parser; no
 * publisher API is asked (#187). The title and the short citation appear once the graph carries
 * them, and until then the DOI stands alone. No journal: the curators asked for none.
 */
const SourcePublication = ({ cell, actions }) => {
  const primary = cell.sources?.[0];
  if (!primary) return null;

  const { title } = primary;
  const shortCitation = primary.label !== primary.curie ? primary.label : undefined;
  const dataCitation = cell.annotations?.dataCitations?.[0];

  return (
    <CellCardWidget title={TITLE} actions={actions}>
      <Stack gap={1}>
        {title && (
          <Typography variant="body2" sx={{ color: "text.primary" }}>
            {title}
          </Typography>
        )}
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {shortCitation && `${shortCitation} · `}
          <TermValueLink value={{ ...primary, label: primary.curie }} />
        </Typography>
      </Stack>

      <Divider />

      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        Source data citation:{" "}
        {dataCitation ? (
          <Link href={dataCitation.iri || dataCitation.id} target="_blank" rel="noopener">
            {dataCitation.label || dataCitation.curie}
          </Link>
        ) : (
          <Typography component="span" variant="body2" sx={{ color: "text.disabled", fontStyle: "italic" }}>
            {NOT_SPECIFIED}
          </Typography>
        )}
      </Typography>
    </CellCardWidget>
  );
};

SourcePublication.propTypes = {
  cell: PropTypes.object.isRequired,
  actions: PropTypes.node,
};


export default SourcePublication;
