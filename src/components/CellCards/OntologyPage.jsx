import { useState, useEffect } from "react";
import { useParams, useLocation, Outlet } from "react-router-dom";
import { Box, Typography, CircularProgress, Button } from "@mui/material";
import OntologyHeader from "./OntologyHeader";
import { ONTOLOGY_TABS } from "./config/gridConfig";
import { loadOntology } from "./services/ontologyGridService";
import { vars } from "../../theme/variables";

const { gray500, gray600 } = vars;

// Layout route for one ontology: owns the (single, ~16MB) load plus the loading/error states,
// and renders the shared header. Each tab is a child route and reads the parsed ontology from
// the outlet context, so switching tabs never refetches.
const OntologyPage = () => {
  const { slug } = useParams();
  const { pathname } = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  // The trailing segment after the slug identifies the tab ("" = Grid View).
  const tail = pathname.split(`/ontology/${slug}`)[1] || "";
  const tab = ONTOLOGY_TABS.some((t) => t.path && `/${t.path}` === tail)
    ? tail.slice(1)
    : "";

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    loadOntology(slug)
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
  }, [slug, reloadKey]);

  if (loading) {
    return (
      <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
        <Typography variant="body1" sx={{ color: gray600 }}>
          Could not load the ontology data.
        </Typography>
        <Typography variant="body2" sx={{ color: gray500 }}>
          {error}
        </Typography>
        <Button variant="outlined" onClick={() => setReloadKey((k) => k + 1)}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: 1, height: 1, overflow: "hidden" }}>
      <OntologyHeader data={data} tab={tab} />
      <Outlet context={{ data }} />
    </Box>
  );
};

export default OntologyPage;
