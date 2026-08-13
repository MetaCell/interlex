import { useCallback, useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Alert, Box, Chip, CircularProgress, Divider, Stack, Typography } from "@mui/material";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import CustomBreadcrumbs from "../common/CustomBreadcrumbs";
import MergePanel from "../SingleTermView/MergePanel/MergePanel";
import ReviewActions from "./ReviewActions";
import CommentSection from "./CommentSection";
import { mergeEligibility, normalizeRole, isAdminFromRoles } from "./permissions";
import { getPullRequest, getVariantTerm, getUserRoleForGroup, getOrganizations } from "../../api/endpoints/apiService";
import { mapPullRecord } from "../Dashboard/TermsChange/pullRequests";
import { GlobalDataContext } from "../../contexts/DataContext";
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
 *
 * Reviewers — users with a role on the target group — additionally get the merge controls and
 * the (not yet implemented) comment thread below the delta.
 */
const PullRequestView = () => {
  const { group, pullId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(GlobalDataContext);

  const [record, setRecord] = useState(null);
  const [baseTerm, setBaseTerm] = useState(null);
  const [variantTerm, setVariantTerm] = useState(null);
  const [role, setRole] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

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
  }, [group, pullId, reloadKey]);

  // The merge is authorised against the request's *to* group, so that is the group to ask
  // about — never the one in the URL, which a link could point anywhere.
  const toGroup = record?.toGroup;
  useEffect(() => {
    if (!user?.groupname || !toGroup || toGroup === user.groupname) return;
    let active = true;
    getUserRoleForGroup(toGroup).then(data => {
      if (active) setRole(normalizeRole(data));
    });
    return () => { active = false; };
  }, [user?.groupname, toGroup]);

  // An admin curates every group, so their status is read once, independent of this request.
  useEffect(() => {
    if (!user?.groupname) return;
    let active = true;
    getOrganizations(user.groupname)
      .then(pairs => { if (active) setIsAdmin(isAdminFromRoles(pairs)); })
      .catch(() => { /* not an admin, or no session */ });
    return () => { active = false; };
  }, [user?.groupname]);

  const { canReview, canMerge, reason } = mergeEligibility({ user, record, role, isAdmin });

  const termLabel = variantTerm?.label || baseTerm?.label || record?.termId || '';

  const breadcrumbItems = [
    { label: '', href: '/', icon: HomeOutlinedIcon },
    { label: 'My dashboard', href: `/${record?.fromGroup || group}/dashboard` },
    { label: `Merge request #${pullId}` },
  ];

  const handleTermClick = useCallback(() => {
    if (record?.termId) navigate(`/${record.fromGroup}/${record.termId}/overview`);
  }, [navigate, record]);

  const handleMerged = useCallback(() => setReloadKey(key => key + 1), []);

  // The review block is only rendered for users the target group lets review. When it is
  // absent, nothing sits under the delta, so the panels take the rest of the page instead of
  // stopping short and leaving the reserved space empty.
  const showReview = !!record && canReview && !loading && !error;

  const renderDelta = () => {
    if (error) {
      return <Alert severity="error">Could not load this merge request: {error}</Alert>;
    }
    if (loading) {
      return (
        <Box display="flex" alignItems="center" justifyContent="center" minHeight="20rem">
          <CircularProgress />
        </Box>
      );
    }
    if (!baseTerm || !variantTerm) {
      return <Alert severity="warning">This merge request does not carry both sides of the comparison.</Alert>;
    }
    return (
      <Box
        display="flex"
        sx={{
          border: `1px solid ${gray200}`,
          borderRadius: '0.5rem',
          overflow: 'hidden',
          // With review controls below, the delta takes a fixed slice of the viewport (and does
          // not shrink further as a flex child) so the controls stay reachable and the page
          // scrolls; without them, it fills the page and each panel scrolls on its own.
          ...(showReview
            ? { height: '65vh', flexShrink: 0 }
            : { flexGrow: 1, minHeight: '20rem' }),
        }}
      >
        <MergePanel data={baseTerm} compareData={variantTerm} status="delete" chipLabel={record?.toGroup || 'Curated'} />
        <MergePanel data={variantTerm} compareData={baseTerm} status="add" chipLabel={record?.fromGroup || 'Variant'} />
      </Box>
    );
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      sx={{
        minWidth: "100%",
        // Only the reviewer's page is tall enough to scroll; otherwise the panels own the
        // overflow and the page itself stays put.
        overflowY: showReview ? 'auto' : 'hidden',
      }}
    >
      <Box
        display="flex"
        flexDirection="column"
        flexGrow={1}
        minHeight={0}
        p="1.5rem 5rem 2.5rem 5rem"
      >
        <CustomBreadcrumbs breadcrumbItems={breadcrumbItems} />
        <Stack direction="row" alignItems="center" spacing="0.75rem" mt="1.75rem">
          <Typography color={gray600} fontSize="1.875rem" fontWeight={600}>
            {loading && !termLabel ? <CircularProgress size={20} /> : termLabel}
          </Typography>
          {record?.rawStatus && <Chip label={record.rawStatus} variant="outlined" />}
        </Stack>
        {record && (
          <Stack direction="row" alignItems="center" spacing="1rem" mt="0.5rem" mb="1.75rem">
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

        {renderDelta()}

        {showReview && (
          <Stack spacing="2.5rem" mt="2.5rem">
            <ReviewActions
              record={{ ...record, pullId: record.pullId || pullId }}
              group={record.toGroup}
              canMerge={canMerge}
              blockedReason={reason}
              onMerged={handleMerged}
            />
            <Divider />
            <CommentSection logs={record.logs} />
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default PullRequestView;
