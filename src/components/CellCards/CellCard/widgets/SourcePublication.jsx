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
  const doi = primary?.iri || primary?.id;
  // Keyed by the DOI it was fetched for, and read only when that still matches. Navigating between
  // cells re-renders this widget rather than remounting it (see useCellTerm), so plain state would
  // caption the new cell with the previous cell's paper until the fetch came back.
  const [citation, setCitation] = useState(null);

  useEffect(() => {
    if (!doi) return undefined;
    let active = true;
    fetchCitation(doi).then((result) => {
      if (active) setCitation({ doi, result });
    });
    return () => {
      active = false;
    };
  }, [doi]);

  if (!primary) return null;

  const resolved = citation?.doi === doi ? citation.result : null;
  // A source with no IRI at all is never fetched, so it is not "loading" — it renders whatever the
  // graph gave, which is the same fallback a failed lookup lands on.
  const loading = Boolean(doi) && !resolved;

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
          {resolved?.title && (
            <Typography variant="body2" sx={{ color: "text.primary" }}>
              {resolved.title}
            </Typography>
          )}
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {[resolved?.authors, resolved?.journal, resolved?.year]
              .filter(Boolean)
              .join(resolved?.authors ? " " : ", ")}
            {resolved?.doi && (
              <>
                {[resolved?.authors, resolved?.journal, resolved?.year].some(Boolean) ? " · " : ""}
                DOI:{" "}
                <Link href={resolved.url} target="_blank" rel="noopener">
                  {resolved.doi}
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
