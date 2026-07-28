import { useOutletContext } from "react-router-dom";
import { Box, Grid } from "@mui/material";
import OntologyHierarchyPanel from "./OntologyHierarchyPanel";
import OntologyTermsTable from "./OntologyTermsTable";

// The "Browse" tab: the ontology's subClassOf hierarchy next to the flat list of its terms.
// One third / two thirds, matching the design's 576 / 1152 split of a 1760px container.
const OntologyBrowsePage = () => {
  const { data } = useOutletContext();

  // Side by side the two panels each own the full height and scroll internally. Once they
  // stack (below md) a full-height panel would push the other off-screen, so there they take
  // a fixed slice of the viewport and the page itself scrolls.
  const panelHeight = { xs: "32rem", md: 1 };

  return (
    <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", px: 4, py: 3 }}>
      <Grid container spacing={4} sx={{ height: { md: 1 }, minHeight: 0 }}>
        <Grid item xs={12} md={4} sx={{ height: panelHeight, minHeight: 0 }}>
          <OntologyHierarchyPanel
            hierarchy={data.hierarchy}
            rootClass={data.entry.rootClass}
          />
        </Grid>
        <Grid item xs={12} md={8} sx={{ height: panelHeight, minHeight: 0 }}>
          <OntologyTermsTable cells={data.cells} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default OntologyBrowsePage;
