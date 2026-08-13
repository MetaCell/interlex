import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Alert, Box, Chip, CircularProgress, Divider, Stack, Typography } from "@mui/material";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import CustomBreadcrumbs from "../common/CustomBreadcrumbs";
import MergePanel from "../SingleTermView/MergePanel/MergePanel";
import { getPullRequest, getVariantTerm } from "../../api/endpoints/apiService";
import { mapPullRecord } from "../Dashboard/TermsChange/pullRequests";
import { formatTimestamp } from "../../utils";

import { vars } from "../../theme/variables";
const { gray200, gray500, gray600 } = vars;

/**
 * A single merge request, shown as the same delta the requester saw before sending it: the
 * curated side (`to-variant-uri`) with everything the variant drops marked as deleted, and the
 * variant side (`from-variant-uri`) with everything it introduces marked as added.
 *
 * Both sides come from the record's variant URIs rather than the live terms, so the view keeps
 * showing what was actually proposed even after either term moves on.
 */
const PullRequestView = () => {
  const { group, pullId } = useParams();
  const navigate = useNavigate();

  const [record, setRecord] = useState(null);
  const [baseTerm, setBaseTerm] = useState(null);
  const [variantTerm, setVariantTerm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!group || !pullId) return;
    let active = true;
    setLoading(true);
    setError(null);

    getPullRequest(group, pullId)
      .then(async data => {
        if (!active) return;
        const entry = mapPullRecord(data);
        setRecord({ ...entry, logs: Array.isArray(data?.logs) ? data.logs : [] });

        const [to, from] = await Promise.all([
          getVariantTerm(data?.['to-variant-uri'], entry.termId),
          getVariantTerm(data?.['from-variant-uri'], entry.termId),
        ]);
        if (!active) return;
        setBaseTerm(to);
        setVariantTerm(from);
        setLoading(false);
      })
      .catch(err => {
        if (!active) return;
        console.error('Error loading merge request:', err);
        setError(err?.message || String(err));
        setLoading(false);
      });

    return () => { active = false; };
  }, [group, pullId]);

  const termLabel = variantTerm?.label || baseTerm?.label || record?.termId || '';

  const breadcrumbItems = [
    { label: '', href: '/', icon: HomeOutlinedIcon },
    { label: 'My dashboard', href: `/${record?.fromGroup || group}/dashboard` },
    { label: `Merge request #${pullId}` },
  ];

  const handleTermClick = useCallback(() => {
    if (record?.termId) navigate(`/${record.fromGroup}/${record.termId}/overview`);
  }, [navigate, record]);

  return (
    <Box display="flex" flexDirection="column" sx={{ minWidth: "100%" }}>
      <Box p="1.5rem 5rem 1.5rem 5rem">
        <CustomBreadcrumbs breadcrumbItems={breadcrumbItems} />
        <Stack direction="row" alignItems="center" spacing="0.75rem" mt="1.75rem">
          <Typography color={gray600} fontSize="1.875rem" fontWeight={600}>
            {loading && !termLabel ? <CircularProgress size={20} /> : termLabel}
          </Typography>
          {record?.rawStatus && <Chip label={record.rawStatus} variant="outlined" />}
        </Stack>
        {record && (
          <Stack direction="row" alignItems="center" spacing="1rem" mt="0.5rem">
            <Typography fontSize=".875rem" color={gray500}>
              <Typography component="span" fontSize=".875rem" color={gray600} fontWeight={600}
                          sx={{ cursor: record.termId ? 'pointer' : 'default' }} onClick={handleTermClick}>
                {record.fromGroup}
              </Typography>
              {' '}wants to merge {record.termId} into {record.toGroup}
            </Typography>
            <Divider orientation="vertical" flexItem />
            <Typography fontSize=".875rem" color={gray500}>
              Opened {formatTimestamp(record.date)}
            </Typography>
          </Stack>
        )}
      </Box>

      {error ? (
        <Box px="5rem" pb="2.5rem">
          <Alert severity="error">Could not load this merge request: {error}</Alert>
        </Box>
      ) : loading ? (
        <Box display="flex" alignItems="center" justifyContent="center" flexGrow={1} minHeight="20rem">
          <CircularProgress />
        </Box>
      ) : !baseTerm || !variantTerm ? (
        <Box px="5rem" pb="2.5rem">
          <Alert severity="warning">
            This merge request does not carry both sides of the comparison.
          </Alert>
        </Box>
      ) : (
        <Box display="flex" flexGrow={1} minHeight={0} sx={{ borderTop: `1px solid ${gray200}` }}>
          <MergePanel
            data={baseTerm}
            compareData={variantTerm}
            status="delete"
            chipLabel={record?.toGroup || 'Curated'}
          />
          <MergePanel
            data={variantTerm}
            compareData={baseTerm}
            status="add"
            chipLabel={record?.fromGroup || 'Variant'}
          />
        </Box>
      )}
    </Box>
  );
};

export default PullRequestView;
