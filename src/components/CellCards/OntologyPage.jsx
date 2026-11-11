import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useParams, useLocation, useSearchParams, Outlet, Navigate } from "react-router-dom";
import { Box, Typography, CircularProgress, Button } from "@mui/material";
import OntologyHeader from "./OntologyHeader";
import CollapsingHeaderLayout from "../common/CollapsingHeaderLayout";
import {
  ONTOLOGY_TABS,
  ONTOLOGY_URL_PARAM,
  URL_ONTOLOGY_SEGMENT,
  ontologyEntry,
  ontologyEntryForUrl,
  ontologyPath,
} from "./config/gridConfig";
import { loadOntology } from "./services/ontologyGridService";
import { usePublishContextOntology } from "../../hooks/useContextOntology";
import { vars } from "../../theme/variables";

const { gray500, gray600 } = vars;

const CenteredMessage = ({ title, detail, action }) => (
  <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
    <Typography variant="body1" sx={{ color: gray600 }}>
      {title}
    </Typography>
    {detail && (
      <Typography variant="body2" sx={{ color: gray500 }}>
        {detail}
      </Typography>
    )}
    {action}
  </Box>
);

CenteredMessage.propTypes = {
  title: PropTypes.string.isRequired,
  detail: PropTypes.string,
  action: PropTypes.node,
};

// Layout route for one ontology: owns the (single, ~16MB) load plus the loading/error states,
// and renders the shared header. Each tab is a child route and reads the parsed ontology from
// the outlet context, so switching tabs never refetches.
//
// Mounted twice: under /:org/ontology/:slug, and under /ontology?url=… for an ontology named by
// its URL, which may be any ontology InterLex serves, not only one with a route of its own.
const OntologyPage = () => {
  const { org, slug } = useParams();
  const { pathname, search } = useLocation();
  const [searchParams] = useSearchParams();
  const sourceUrl = slug ? null : searchParams.get(ONTOLOGY_URL_PARAM);
  const entry = slug ? ontologyEntry(org, slug) : ontologyEntryForUrl(sourceUrl);
  // A URL naming an ontology the app already routes opens on that canonical page instead.
  const redirectsToRoute = Boolean(sourceUrl && entry && !entry.sourceUrl);
  // Reading this ontology *is* the context, for terms later opened on a path that does not name one.
  usePublishContextOntology(redirectsToRoute ? undefined : entry);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  // The trailing segment after the ontology's own path identifies the tab ("" = Grid View).
  const tail = pathname.split(slug ? `/ontology/${slug}` : URL_ONTOLOGY_SEGMENT)[1] || "";
  const tab = ONTOLOGY_TABS.some((t) => t.path && `/${t.path}` === tail)
    ? tail.slice(1)
    : "";

  useEffect(() => {
    if (!entry || redirectsToRoute) return undefined;
    let active = true;
    setLoading(true);
    setError(null);
    loadOntology(entry)
      .then((res) => {
        if (active) setData(res);
      })
      .catch((err) => {
        if (active) setError(err.message || "Failed to load ontology");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [entry, redirectsToRoute, reloadKey]);

  if (redirectsToRoute) {
    const params = new URLSearchParams(search);
    params.delete(ONTOLOGY_URL_PARAM);
    const rest = params.toString();
    return <Navigate to={ontologyPath(entry, tab, rest ? `?${rest}` : "")} replace />;
  }

  if (!entry) {
    return (
      <CenteredMessage
        title="This address does not name an ontology."
        detail={sourceUrl ? `No ontology can be opened from "${sourceUrl}".` : "The ontology URL is missing."}
      />
    );
  }

  if (loading) {
    return (
      <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <CenteredMessage
        title="Could not load the ontology data."
        detail={error}
        action={
          <Button variant="outlined" onClick={() => setReloadKey((k) => k + 1)}>
            Retry
          </Button>
        }
      />
    );
  }

  return (
    <CollapsingHeaderLayout header={<OntologyHeader data={data} tab={tab} />}>
      <Outlet context={{ data }} />
    </CollapsingHeaderLayout>
  );
};

export default OntologyPage;
