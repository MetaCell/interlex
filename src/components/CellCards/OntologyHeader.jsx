import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { Container, Typography, Chip, Stack } from "@mui/material";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import BreadcrumbBar from "../common/BreadcrumbBar";
import CustomTabs from "../common/CustomTabs";
import { ONTOLOGY_TABS, ontologyPath } from "./config/gridConfig";
import { vars } from "../../theme/variables";

const { gray200, gray500, gray600 } = vars;

// Breadcrumb + ontology identity + tab bar. Shared by every tab of an ontology, so switching
// tabs changes only the body below it.
const OntologyHeader = ({ data, tab }) => {
  const navigate = useNavigate();
  const tabIndex = Math.max(0, ONTOLOGY_TABS.findIndex((t) => t.path === tab));

  return (
    <>
      {/* Breadcrumb bar — its own container (app-wide pattern) with copy-path.
          Crumbs mirror the /:org/ontology/:slug hierarchy. */}
      <BreadcrumbBar
        breadcrumbItems={[
          { label: "", href: "/", icon: HomeOutlinedIcon },
          { label: data.entry.community, href: `/${data.entry.org}` },
          { label: data.meta.title },
        ]}
        copyPath
        copyLabel="Permalink to ontology"
      />

      {/* Header: title + curation status -> description -> version -> tags -> tabs.
          Title / description / version are read from the file's owl:Ontology node;
          the curie is the real root class the grid is scoped to. */}
      <Container variant="header" sx={{ borderBottom: `1px solid ${gray200}`, display: "flex", flexDirection: "column", gap: 1 }}>
        <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap">
          <Typography variant="h5">{data.meta.title}</Typography>
          {data.entry.curationStatus && (
            <Chip label={data.entry.curationStatus} variant="outlined" />
          )}
        </Stack>
        {data.meta.description && (
          <Typography variant="body2" sx={{ color: gray600 }}>
            {data.meta.description}
          </Typography>
        )}
        {data.meta.version && (
          <Typography variant="caption" sx={{ color: gray500 }}>
            Version {data.meta.version}
          </Typography>
        )}
        <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap" sx={{ mt: 0.5 }}>
          <Typography variant="body2" sx={{ color: gray500 }}>
            Tags
          </Typography>
          <Chip label={data.entry.type} color="secondary" />
          <Chip label={data.entry.community} color="success" />
          <Chip label={data.entry.rootClass} variant="outlined" />
        </Stack>

        <CustomTabs
          tabs={ONTOLOGY_TABS.map((t) => ({ label: t.label, disabled: t.path === undefined }))}
          tabValue={tabIndex}
          handleChange={(_e, i) => {
            const next = ONTOLOGY_TABS[i]?.path;
            if (next !== undefined) navigate(ontologyPath(data.entry, next));
          }}
          parentBoxStyles={{ mt: 1, borderBottom: 0 }}
        />
      </Container>
    </>
  );
};

OntologyHeader.propTypes = {
  data: PropTypes.object.isRequired,
  tab: PropTypes.string.isRequired,
};

export default OntologyHeader;
