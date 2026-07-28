import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Stack, Typography, Link, Divider, Skeleton } from "@mui/material";
import CellCardWidget from "../CellCardWidget";
import { fetchCitation } from "../citationService";
import { NOT_SPECIFIED } from "../../config/cellCardConfig";

export const TITLE = "Source publication";

/**
 * §5.1 Source Publication (Figma 9239:67920): the formatted citation for the cell's primary
 * source, plus a source-data pointer.
 *
 * The graph has only the DOI, so title / authors / journal / year come from CrossRef at render
 * time (see citationService). While that is in flight the widget shows skeletons; if it fails the
 * DOI link alone remains, which is exactly what the graph can support on its own.
 */
const SourcePublication = ({ cell, actions }) => {
  const primary = cell.sources?.[0];
  const [citation, setCitation] = useState(null);
  const [loading, setLoading] = useState(Boolean(primary));

  useEffect(() => {
    if (!primary) {
      setCitation(null);
      setLoading(false);
      return undefined;
    }
    let active = true;
    setLoading(true);
    fetchCitation(primary.iri || primary.id).then((result) => {
      if (!active) return;
      setCitation(result);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [primary]);

  if (!primary) return null;

  const dataCitation = cell.annotations?.dataCitations?.[0];

  return (
    <CellCardWidget title={TITLE} actions={actions}>
      {loading ? (
        <Stack gap={0.5}>
          <Skeleton variant="text" width="100%" />
          <Skeleton variant="text" width="85%" />
          <Skeleton variant="text" width="60%" />
        </Stack>
      ) : (
        <Stack gap={1}>
          {citation?.title && (
            <Typography variant="body2" sx={{ color: "text.primary" }}>
              {citation.title}
            </Typography>
          )}
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {[citation?.authors, citation?.journal, citation?.year]
              .filter(Boolean)
              .join(citation?.authors ? " " : ", ")}
            {citation?.doi && (
              <>
                {[citation?.authors, citation?.journal, citation?.year].some(Boolean) ? " · " : ""}
                DOI:{" "}
                <Link href={citation.url} target="_blank" rel="noopener">
                  {citation.doi}
                </Link>
              </>
            )}
          </Typography>
        </Stack>
      )}

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
