import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useParams, useLocation, Navigate } from "react-router-dom";
import { Box, Typography, CircularProgress, Button } from "@mui/material";
import OntologyHeader from "./OntologyHeader";
import OntologyGridPage from "./OntologyGridPage";
import OntologyBrowsePage from "./OntologyBrowsePage";
import OntologySpecPage from "./OntologySpecPage";
import { OntologyDataContext } from "./OntologyDataContext";
import CollapsingHeaderLayout from "../common/CollapsingHeaderLayout";
import {
  SPECIFICATION_TAB,
  ontologyAtServedLocation,
  ontologyEntry,
  ontologyPath,
  splitOntologyTab,
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

const TAB_PAGES = {
  "": OntologyGridPage,
  browse: OntologyBrowsePage,
  [SPECIFICATION_TAB]: OntologySpecPage,
};

// The ontology a location names, and which of its tabs. Under /:org/ontology/:slug the slug names
// it; under /:group/ontologies/* it is the backend's own address for it, which may be any ontology
// InterLex serves, not only one with a route of its own.
const useOntologyLocation = () => {
  const { org, slug } = useParams();
  const { pathname } = useLocation();
  if (!slug) return { ...ontologyAtServedLocation(pathname), served: true };
  const { tab } = splitOntologyTab(pathname.split(`/ontology/${slug}`)[1] || "");
  return { entry: ontologyEntry(org, slug), tab, served: false };
};

// Owns the (single, ~16MB) load of one ontology plus the loading/error states, renders the shared
// header and the current tab, so switching tabs never refetches.
const OntologyPage = () => {
  const { search } = useLocation();
  const { entry, tab, served } = useOntologyLocation();
  // A served address naming an ontology the app already routes opens on that canonical page instead.
  const redirectsToRoute = Boolean(served && entry && !entry.servedPath);
  // Reading this ontology *is* the context, for terms later opened on a path that does not name one.
  usePublishContextOntology(redirectsToRoute ? undefined : entry);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

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
    return <Navigate to={ontologyPath(entry, tab, search)} replace />;
  }

  if (!entry) {
    return <CenteredMessage title="This address does not name an ontology." />;
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

  const TabPage = TAB_PAGES[tab];
  return (
    <CollapsingHeaderLayout header={<OntologyHeader data={data} tab={tab} />}>
      <OntologyDataContext.Provider value={data}>
        <TabPage />
      </OntologyDataContext.Provider>
    </CollapsingHeaderLayout>
  );
};

export default OntologyPage;
