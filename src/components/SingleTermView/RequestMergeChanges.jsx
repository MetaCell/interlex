import PropTypes from "prop-types";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Box, Button, CircularProgress } from "@mui/material";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { EditNoteIcon } from "../../Icons";
import MergePanel from "./MergePanel/MergePanel";
import StatusDialog from "../common/StatusDialog";
import CustomizedDialog from "../common/CustomizedDialog";
import { getMatchTerms, createPullRequest } from '../../api/endpoints/apiService';
import { hasTermChanges } from "./MergePanel/termDiff";

const CURATED_GROUP = "base";

const HeaderRightSideContent = ({ handleClose, handleSubmit, disabled, submitting }) => {
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
                Request to merge changes to curated
            </Button>
        </Box>
    );
};

HeaderRightSideContent.propTypes = {
    handleClose: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    submitting: PropTypes.bool,
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
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null); // { ok, pullUrl, error }

    // A merge request only makes sense from a fork, never from curated itself.
    const isVariant = !!group && group !== CURATED_GROUP;

    useEffect(() => {
        if (!open || !term || !isVariant) return;
        let active = true;
        setLoading(true);
        setLoadError(null);
        Promise.all([
            getMatchTerms(CURATED_GROUP, term),
            getMatchTerms(group, term),
        ])
            .then(([base, variant]) => {
                if (!active) return;
                setBaseTerm(base?.results?.[0] ?? null);
                setVariantTerm(variant?.results?.[0] ?? null);
                setLoading(false);
            })
            .catch(error => {
                if (!active) return;
                setLoadError(error?.message || String(error));
                setLoading(false);
            });
        return () => { active = false; };
    }, [open, term, group, isVariant]);

    // Reset the outcome whenever the dialog is reopened, so a previous result never leaks in.
    useEffect(() => {
        if (open) setResult(null);
    }, [open]);

    const handleSubmit = useCallback(async () => {
        setSubmitting(true);
        const response = await createPullRequest({ groupFrom: group, groupTo: CURATED_GROUP, termId: term });
        setSubmitting(false);
        setResult(response);
    }, [group, term]);

    const handleCloseResult = useCallback(() => {
        setResult(null);
        handleClose();
    }, [handleClose]);

    const handleGoToFork = useCallback(() => {
        setResult(null);
        handleClose();
        navigate(`/${group}/${term}/overview`);
    }, [handleClose, navigate, group, term]);

    const hasChanges = hasTermChanges(baseTerm, variantTerm);
    const canSubmit = !loading && !submitting && !loadError && !!baseTerm && !!variantTerm && hasChanges;

    return (
        <>
            <CustomizedDialog
                title={"Request to merge changes to curated"}
                open={open && !result}
                handleClose={handleClose}
                HeaderRightSideContent={
                    <HeaderRightSideContent
                        handleClose={handleClose}
                        handleSubmit={handleSubmit}
                        disabled={!canSubmit}
                        submitting={submitting}
                    />
                }
                sx={{ '& .MuiDialogContent-root': { padding: 0, overflowY: "hidden" } }}
            >
                {loading ? (
                    <Box display="flex" alignItems="center" justifyContent="center" width={1} height={1}>
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
                                : 'This term has no curated version to merge into.'}
                        </Alert>
                    </Box>
                ) : (
                    <Box display="flex" flexDirection="column" width={1} height={1}>
                        {!hasChanges && (
                            <Alert severity="info" sx={{ borderRadius: 0 }}>
                                This variant does not differ from the curated term, so there is nothing to merge.
                            </Alert>
                        )}
                        <Box display="flex" width={1} flexGrow={1} minHeight={0}>
                            <MergePanel
                                data={baseTerm}
                                compareData={variantTerm}
                                status="delete"
                                chipLabel="Curated"
                            />
                            <MergePanel
                                data={variantTerm}
                                compareData={baseTerm}
                                status="add"
                                chipLabel={group}
                            />
                        </Box>
                    </Box>
                )}
            </CustomizedDialog>
            <StatusDialog
                open={!!result}
                handleClose={handleCloseResult}
                title={"Request to merge changes to curated"}
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
