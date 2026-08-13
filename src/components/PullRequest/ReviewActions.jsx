import PropTypes from "prop-types";
import { useState } from "react";
import { Alert, Button, CircularProgress, Stack, Tooltip, Typography } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import { mergePullRequest } from "../../api/endpoints/apiService";

import { vars } from "../../theme/variables";
const { gray600 } = vars;

// Closing and reopening a request are routed but still answer 501, so the buttons exist and
// say why rather than being wired to a call that cannot succeed.
const NOT_IMPLEMENTED = "Rejecting a merge request is not implemented yet.";

/**
 * Reviewer controls for a pending merge request.
 *
 * The merge call is guarded by the identities the record was read with: the backend compares
 * them against the live heads and refuses if either side has moved on, so a stale page cannot
 * merge something other than the delta shown above it.
 */
const ReviewActions = ({ record, group, canMerge, blockedReason, onMerged }) => {
  const [merging, setMerging] = useState(false);
  const [result, setResult] = useState(null); // { ok, error }

  const handleMerge = async () => {
    setMerging(true);
    setResult(null);
    const response = await mergePullRequest({
      group,
      pullId: record.pullId,
      expectedFromIdentity: record.fromIdentity,
      expectedToIdentity: record.toIdentity,
    });
    setMerging(false);
    setResult(response);
    if (response.ok) onMerged?.();
  };

  const mergeButton = (
    <Button
      variant="contained"
      color="primary"
      disabled={!canMerge || merging}
      onClick={handleMerge}
      startIcon={merging ? <CircularProgress size={16} color="inherit" /> : <CheckCircleOutlineIcon />}
    >
      Approve and merge
    </Button>
  );

  return (
    <Stack spacing="1rem">
      <Stack direction="row" alignItems="center" spacing="0.75rem">
        {/* A disabled button swallows pointer events, so the tooltip needs a wrapper to hang on. */}
        {canMerge ? mergeButton : (
          <Tooltip title={blockedReason || ''} arrow>
            <span>{mergeButton}</span>
          </Tooltip>
        )}
        <Tooltip title={NOT_IMPLEMENTED} arrow>
          <span>
            <Button variant="outlined" color="secondary" disabled startIcon={<BlockOutlinedIcon />}>
              Reject
            </Button>
          </span>
        </Tooltip>
        <Typography fontSize=".875rem" color={gray600}>
          Merging replaces {record.toGroup}&apos;s version of {record.termId} with the one on the right.
        </Typography>
      </Stack>

      {result?.ok && <Alert severity="success">Merged. {record.toGroup} now carries these changes.</Alert>}
      {result && !result.ok && (
        <Alert severity="error">Could not merge: {result.error}</Alert>
      )}
    </Stack>
  );
};

ReviewActions.propTypes = {
  record: PropTypes.object.isRequired,
  group: PropTypes.string.isRequired,
  canMerge: PropTypes.bool,
  blockedReason: PropTypes.string,
  onMerged: PropTypes.func,
};

export default ReviewActions;
