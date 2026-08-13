import PropTypes from "prop-types";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { EditNoteIcon } from "../../Icons";
import MergePanel from "./MergePanel/MergePanel";
import StatusDialog from "../common/StatusDialog";
import CustomizedDialog from "../common/CustomizedDialog";
import CustomSingleSelect from "../common/CustomSingleSelect";
import { getMatchTerms, getVersions, createPullRequest } from '../../api/endpoints/apiService';
import { hasTermChanges } from "./MergePanel/termDiff";
import { vars } from "../../theme/variables";

const { gray200, gray600 } = vars;

const CURATED_GROUP = "base";

const HeaderRightSideContent = ({ handleClose, handleSubmit, disabled, submitting, targetLabel }) => {
    return (
        <Box display='flex' alignItems='center' gap='.75rem'>
            <Button variant="outlined" onClick={handleClose}>Cancel</Button>
            <Button
                variant='contained'
                color='primary'
                onClick={handleSubmit}
                disabled={disabled}
                startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <EditNoteIcon />}
            >
                Request to merge changes to {targetLabel}
            </Button>
        </Box>
    );
};

HeaderRightSideContent.propTypes = {
    handleClose: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    submitting: PropTypes.bool,
    targetLabel: PropTypes.string,
};

/**
 * Side-by-side delta between the curated (base) term and this fork's variant of it, and the
 * entry point for proposing the variant back to curated.
 *
 * Left panel shows the curated term with everything the variant dropped marked as deleted;
 * right panel shows the variant with everything it introduced marked as added.
 */
const RequestMergeChanges = ({ term, group, open, handleClose }) => {
    const navigate = useNavigate();
    const [baseTerm, setBaseTerm] = useState(null);
    const [variantTerm, setVariantTerm] = useState(null);
    const [targetGroup, setTargetGroup] = useState(CURATED_GROUP);
    const [targetGroups, setTargetGroups] = useState([CURATED_GROUP]);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null); // { ok, pullUrl, error }

    // A merge request only makes sense from a fork, never from curated itself.
    const isVariant = !!group && group !== CURATED_GROUP;

    // This fork's own version of the term — the right-hand side, and what gets proposed.
    useEffect(() => {
        if (!open || !term || !isVariant) return;
        let active = true;
        getMatchTerms(group, term)
            .then(variant => { if (active) setVariantTerm(variant?.results?.[0] ?? null); })
            .catch(error => { if (active) setLoadError(error?.message || String(error)); });
        return () => { active = false; };
    }, [open, term, group, isVariant]);

    // Which groups hold a variant of this term: every group a version of it has appeared in.
    // Curated is always offered, and this fork is not a target for its own request.
    useEffect(() => {
        if (!open || !term || !isVariant) return;
        let active = true;
        setTargetGroup(CURATED_GROUP);
        getVersions(group, term)
            .then(data => {
                if (!active) return;
                const groups = new Set();
                (Array.isArray(data?.versions) ? data.versions : []).forEach(version => {
                    (Array.isArray(version?.appears_in) ? version.appears_in : []).forEach(appearance => {
                        const owner = String(appearance?.uri ?? '').split('http://uri.interlex.org/')[1]?.split('/')[0];
                        if (owner && owner !== CURATED_GROUP && owner !== group) groups.add(owner);
                    });
                });
                setTargetGroups([CURATED_GROUP, ...[...groups].sort()]);
            })
            .catch(error => {
                // The picker falls back to curated only; the comparison itself still works.
                console.warn('Could not list the variants of this term:', error);
                if (active) setTargetGroups([CURATED_GROUP]);
            });
        return () => { active = false; };
    }, [open, term, group, isVariant]);

    // The side being merged into, refetched whenever the target changes.
    useEffect(() => {
        if (!open || !term || !isVariant || !targetGroup) return;
        let active = true;
        setLoading(true);
        setLoadError(null);
        getMatchTerms(targetGroup, term)
            .then(target => {
                if (!active) return;
                setBaseTerm(target?.results?.[0] ?? null);
                setLoading(false);
            })
            .catch(error => {
                if (!active) return;
                setLoadError(error?.message || String(error));
                setLoading(false);
            });
        return () => { active = false; };
    }, [open, term, targetGroup, isVariant]);

    // Reset the outcome whenever the dialog is reopened, so a previous result never leaks in.
    useEffect(() => {
        if (open) setResult(null);
    }, [open]);

    const handleSubmit = useCallback(async () => {
        setSubmitting(true);
        const response = await createPullRequest({ groupFrom: group, groupTo: targetGroup, termId: term });
        setSubmitting(false);
        setResult(response);
    }, [group, targetGroup, term]);

    const handleCloseResult = useCallback(() => {
        setResult(null);
        handleClose();
    }, [handleClose]);

    const handleGoToFork = useCallback(() => {
        setResult(null);
        handleClose();
        navigate(`/${group}/${term}/overview`);
    }, [handleClose, navigate, group, term]);

    // Curated always leads the list; the other groups holding a variant follow.
    const targetOptions = targetGroups.map(name => ({
        value: name,
        label: name === CURATED_GROUP ? `${name} (curated)` : name,
    }));

    // "curated" reads better than the group name for base, which is what the entry point promises.
    const targetLabel = targetGroup === CURATED_GROUP ? 'curated' : targetGroup;

    const hasChanges = hasTermChanges(baseTerm, variantTerm);
    const canSubmit = !loading && !submitting && !loadError && !!baseTerm && !!variantTerm && hasChanges;

    return (
        <>
            <CustomizedDialog
                title={`Request to merge changes to ${targetLabel}`}
                open={open && !result}
                handleClose={handleClose}
                HeaderRightSideContent={
                    <HeaderRightSideContent
                        handleClose={handleClose}
                        handleSubmit={handleSubmit}
                        disabled={!canSubmit}
                        submitting={submitting}
                        targetLabel={targetLabel}
                    />
                }
                sx={{ '& .MuiDialogContent-root': { padding: 0, overflowY: "hidden" } }}
            >
                <Box display="flex" flexDirection="column" width={1} height={1}>
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing="0.75rem"
                        sx={{ p: '0.75rem 1.5rem', borderBottom: `1px solid ${gray200}` }}
                    >
                        <Typography fontSize=".875rem" color={gray600}>Merge into:</Typography>
                        <CustomSingleSelect
                            value={targetGroup}
                            onChange={setTargetGroup}
                            options={targetOptions}
                            FormControlSX={{ minWidth: '14rem' }}
                        />
                        <Typography fontSize=".875rem" color={gray600}>
                            Comparing {group}&apos;s variant of {term} against {targetGroup}.
                        </Typography>
                    </Stack>

                    {loading ? (
                        <Box display="flex" alignItems="center" justifyContent="center" width={1} flexGrow={1}>
                            <CircularProgress />
                        </Box>
                    ) : loadError ? (
                        <Box p={3} width={1}>
                            <Alert severity="error">Could not load the comparison: {loadError}</Alert>
                        </Box>
                    ) : !baseTerm || !variantTerm ? (
                        <Box p={3} width={1}>
                            <Alert severity="warning">
                                {baseTerm
                                    ? `No variant of this term exists in "${group}".`
                                    : `"${targetGroup}" has no version of this term to merge into.`}
                            </Alert>
                        </Box>
                    ) : (
                        <>
                            {!hasChanges && (
                                <Alert severity="info" sx={{ borderRadius: 0 }}>
                                    This variant does not differ from {targetGroup}, so there is nothing to merge.
                                </Alert>
                            )}
                            <Box display="flex" width={1} flexGrow={1} minHeight={0}>
                                <MergePanel
                                    data={baseTerm}
                                    compareData={variantTerm}
                                    status="delete"
                                    chipLabel={targetGroup === CURATED_GROUP ? 'Curated' : targetGroup}
                                />
                                <MergePanel
                                    data={variantTerm}
                                    compareData={baseTerm}
                                    status="add"
                                    chipLabel={group}
                                />
                            </Box>
                        </>
                    )}
                </Box>
            </CustomizedDialog>
            <StatusDialog
                open={!!result}
                handleClose={handleCloseResult}
                title={`Request to merge changes to ${targetLabel}`}
                errored={!result?.ok}
                message={result?.ok
                    ? "Request to merge changes successfully sent"
                    : "Request to merge changes could not be sent"}
                subMessage={result?.ok ? "Close or go to your fork." : result?.error}
                finishButtonTitle={"Close"}
                actionButtonTitle={result?.ok ? "Go to fork" : undefined}
                handleActionButtonClick={handleGoToFork}
                actionButtonStartIcon={result?.ok ? <ArrowForwardIcon /> : undefined}
            />
        </>
    )
}

RequestMergeChanges.propTypes = {
    term: PropTypes.string.isRequired,
    group: PropTypes.string.isRequired,
    open: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
};

export default RequestMergeChanges;
