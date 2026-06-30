import {
  Box,
  Chip, CircularProgress,
  Grid,
  Stack,
  Tooltip,
  Typography
} from "@mui/material";
import PropTypes from "prop-types";
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import { formatTimestamp } from "../../../utils";

import { vars } from "../../../theme/variables";
const { gray800, gray500 } = vars;

const RELATED_SYNONYM_IRI = "http://uri.interlex.org/base/ilx_0737162";

const Details = ({ loading, data, jsonData }) => {
  const handleChipClick = (url) => {
    window.open(url, '_blank');
  };

  const processExistingIds = (existingID) => {
    if (Array.isArray(existingID)) {
      return existingID;
    } else if (typeof existingID === 'string') {
      return [existingID];
    }
    return [];
  };

  const getSynonymGroups = () => {
    const synonyms = processExistingIds(data?.synonym);
    const synonymSet = new Set(synonyms);
    const graph = jsonData?.["@graph"];
    const focusNode = Array.isArray(graph)
      ? graph.find(n => String(n?.["@type"] || "").toLowerCase().includes("class")) || null
      : null;
    const relatedRaw = focusNode?.[RELATED_SYNONYM_IRI];
    const relatedArr = Array.isArray(relatedRaw) ? relatedRaw : relatedRaw ? [relatedRaw] : [];
    const related = relatedArr
      .map(v => (typeof v === "string" ? v : v?.["@value"] || null))
      .filter(v => v && !synonymSet.has(v));
    return { synonyms, related };
  };

  if (loading) {
    return <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress />
    </Box>
  }

  if (!data) {
    return <div>No data available</div>;
  }
  const graphArray = jsonData?.["@graph"] || [];
  const lastGraphItem = graphArray[graphArray.length - 1]
  const versionIRI = lastGraphItem?.["owl:versionIRI"]?.["@id"];
  // versionIRI is normally a full IRI (.../version/<id>/...); a term-version
  // snapshot surfaces the bare identity-graph hash instead.
  const versionDisplay = versionIRI?.includes('/version/')
    ? versionIRI.split('/version/')[1]?.split('/')[0]
    : versionIRI;
  const versionInfo = formatTimestamp(lastGraphItem?.["owl:versionInfo"]);

  return (
    <>
      <Grid container>
        <Grid item xs={12} lg={5}>
          <Stack spacing=".75rem">
            <Typography
              id="synonyms"
              color={gray800}
              fontWeight={500}
              component="a"
              href="#synonyms"
              sx={{ textDecoration: 'none', color: 'inherit', '&:hover': { textDecoration: 'underline' } }}
            >
              Synonyms
            </Typography>
            {(() => {
              const { synonyms, related } = getSynonymGroups();
              return (
                <Stack spacing=".5rem">
                  {synonyms.length > 0 && (
                    <Box display="flex" flexWrap="wrap" gap=".5rem">
                      {synonyms.map((syn) => (
                        <Tooltip key={syn} title="Synonym" arrow>
                          <Chip className="rounded" variant="outlined" label={syn} />
                        </Tooltip>
                      ))}
                    </Box>
                  )}
                  {related.length > 0 && (
                    <>
                      <Typography variant="caption" color={gray500}>Related</Typography>
                      <Box display="flex" flexWrap="wrap" gap=".5rem">
                        {related.map((syn) => (
                          <Tooltip key={syn} title="Related synonym" arrow>
                            <Chip className="rounded" variant="outlined" label={syn} color="info" size="small" />
                          </Tooltip>
                        ))}
                      </Box>
                    </>
                  )}
                  {synonyms.length === 0 && related.length === 0 && null}
                </Stack>
              );
            })()}
          </Stack>
        </Grid>
        <Grid item xs={12} lg={3}>
          <Stack spacing=".75rem">
            <Typography color={gray800} fontWeight={500}>
              Preferred ID
            </Typography>
            <Typography fontSize=".875rem" color={gray500}>
              {data?.id}
            </Typography>
          </Stack>
        </Grid>
        {processExistingIds(data?.existingID).length > 0 && (
          <Grid item xs={12} lg={4}>
            <Stack spacing=".75rem">
              <Typography color={gray800} fontWeight={500}>
                Existing IDs
              </Typography>
              <Box display="flex" flexWrap="wrap" gap=".5rem">
                {processExistingIds(data?.existingID).map((id) =>
                  <Chip className="rounded IDchip-outlined" variant="outlined" key={id} label={id} icon={<OpenInNewOutlinedIcon />} onClick={() => handleChipClick(id)} />
                )}
              </Box>
            </Stack>
          </Grid>
        )}
      </Grid>
      <Grid container mt="2.5rem">
        <Grid item xs={12}>
          <Stack spacing=".75rem">
            <Typography color={gray800} fontWeight={500}>
              Description
            </Typography>
            <Typography fontSize=".875rem" color={gray500}>
              {data?.description}
            </Typography>
          </Stack>
        </Grid>
      </Grid>
      <Grid container mt="2.5rem">
        <Grid item xs={12} lg={4} mb=".75rem">
          <Stack spacing=".75rem">
            <Typography color={gray800} fontWeight={500}>
              Type
            </Typography>
            <Typography fontSize=".875rem" color={gray500}>
              {data?.type}
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} lg={4} mb=".75rem">
          <Stack spacing=".75rem">
            <Typography color={gray800} fontWeight={500}>
              Version
            </Typography>
            <Typography fontSize=".875rem" color={gray500}>
              {versionDisplay}
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} lg={4} mb=".75rem">
          <Stack spacing=".75rem">
            <Typography color={gray800} fontWeight={500}>
              OWL equivalent
            </Typography>
            <Typography fontSize=".875rem" color={gray500}>
              {data?.owlEquivalent}
            </Typography>
          </Stack>
        </Grid>
        {data?.submittedBy && (
          <Grid item xs={12} lg={4} mb=".75rem">
            <Stack spacing=".75rem">
              <Typography color={gray800} fontWeight={500}>
                Originally submitted by
              </Typography>
              <Typography fontSize=".875rem" color={gray500}>
                {data?.submittedBy}
              </Typography>
            </Stack>
          </Grid>
        )}
        {data?.lastModifiedBy && (
          <Grid item xs={12} lg={4} mb=".75rem">
            <Stack spacing=".75rem">
              <Typography color={gray800} fontWeight={500}>
                Last modified by
              </Typography>
              <Typography fontSize=".875rem" color={gray500}>
                {data?.lastModifiedBy}
              </Typography>
            </Stack>
          </Grid>
        )}
        <Grid item xs={12} lg={4} mb=".75rem">
          <Stack spacing=".75rem">
            <Typography color={gray800} fontWeight={500}>
              Last modify timestamp
            </Typography>
            <Typography fontSize=".875rem" color={gray500}>
              {versionInfo}
            </Typography>
          </Stack>
        </Grid>
      </Grid>
    </>
  );
}

Details.propTypes = {
  loading: PropTypes.bool.isRequired,
  data: PropTypes.object,
  jsonData: PropTypes.object
};

export default Details;
