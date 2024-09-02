import React from "react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Box, Grid, Chip, Typography, Stack, Button } from "@mui/material";
import Hierarchy from "./OverView/Hierarchy";
import Predicates from "./OverView/Predicates";
import CustomizedDialog from "../common/CustomizedDialog";
import StatusDialog from "../common/StatusDialog";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { EditNoteIcon } from "../../Icons";
import { getMatchTerms } from "../../api/endpoints";
import { debounce } from 'lodash';
import { vars } from "../../theme/variables";

const { white, gray800, gray500, gray200, gray25, gray300 } = vars;

const styles = {
    title: {
        fontSize: "1.125rem",
        color: gray800,
        fontWeight: 600,
        lineHeight: "1.75rem"
    },
    chip: {
        border: `1px solid ${gray300}`,
        background: white,
        fontSize: "0.875rem"
    }
}

const HeaderRightSideContent = ({ handleClose, handleSubmit }) => {
    return (
        <Box display='flex' alignItems='center' gap='.75rem'>
            <Button variant="outlined" onClick={handleClose}>Cancel</Button>
            <Button variant='contained' color='primary' onClick={handleSubmit} startIcon={<EditNoteIcon />}>
                Request to merge changes to curated
            </Button>
        </Box>
    );
};


const RequestMergeChanges = ({ searchTerm, open, handleClose }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [openStatusDialog, setOpenStatusDialog] = useState(false);

    const fetchTerms = useCallback(
        debounce((searchTerm) => {
            if (searchTerm) {
                getMatchTerms(searchTerm).then(data => {
                    setData(data?.results[0]);
                    setLoading(false);
                });
            }
        }, 300),
        []
    );

    const handleOpenStatusDialog = () => {
        setOpenStatusDialog(true)
    }

    const handleCloseStatusDialog = () => {
        setOpenStatusDialog(false)
    }

    useEffect(() => {
        setLoading(true);
        fetchTerms(searchTerm);
        return () => {
            fetchTerms.cancel();
        };
    }, [searchTerm, fetchTerms]);

    const memoData = useMemo(() => data, [data]);

    return (
        <>
            <CustomizedDialog
                title={"Request to merge changes to curated"}
                open={open}
                handleClose={handleClose}
                HeaderRightSideContent={<HeaderRightSideContent handleClose={handleClose} handleSubmit={handleOpenStatusDialog} />}
                sx={{ '& .MuiDialogContent-root': { padding: 0 } }}
            >
                <Box display="flex">
                    <Grid container xs={12} lg={6} sx={{ borderRight: `1px solid ${gray200}`, backgroundColor: gray25 }}>
                        <Box display="flex" justifyContent="space-between" sx={{ padding: "1.5rem", borderBottom: `1px solid ${gray200}`, background: "#fff" }} width={1}>
                            <Typography sx={styles.title}>Central nervous system</Typography>
                            <Chip label={"Curated"} sx={styles.chip} />
                        </Box>
                        <Grid container item p={3}>
                            <Grid item mb={5.5}>
                                <Stack spacing=".75rem">
                                    <Typography color={gray800} fontWeight={500}>
                                        Synonyms
                                    </Typography>
                                    <Box display="flex" flexWrap="wrap" gap=".5rem">
                                        {data?.synonym?.map((synonym) => (
                                            <Chip
                                                className="rounded synonyms"
                                                variant="outlined"
                                                key={synonym}
                                                label={
                                                    <span>
                                                        {synonym} <span>{synonym}</span>
                                                    </span>
                                                }
                                            />
                                        ))}
                                    </Box>
                                </Stack>
                            </Grid>
                            <Grid item mb={5.5} display="flex" alignItems="start" justifyContent="space-between">
                                <Stack spacing=".75rem">
                                    <Typography color={gray800} fontWeight={500}>
                                        Existing IDs
                                    </Typography>
                                    <Box display="flex" flexWrap="wrap" gap=".5rem">
                                        {data?.existingID?.map((id) => (
                                            <Chip className="rounded IDchip-outlined" variant="outlined" key={id} label={id} icon={<OpenInNewOutlinedIcon />} onClick={() => handleChipClick(id)} />
                                        ))}
                                    </Box>
                                </Stack>
                                <Stack spacing=".75rem">
                                    <Typography color={gray800} fontWeight={500}>
                                        Preferred ID
                                    </Typography>
                                    <Typography fontSize=".875rem" color={gray500}>
                                        {data?.hasIlxPreferredId}
                                    </Typography>
                                </Stack>
                            </Grid>
                            <Grid item>
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
                        <Grid container item p={3} spacing={5.5}>
                            <Grid item xs={2} sm={4} md={4}>
                                <Stack spacing=".75rem">
                                    <Typography color={gray800} fontWeight={500}>
                                        Type
                                    </Typography>
                                    <Typography fontSize=".875rem" color={gray500}>
                                        {data?.type || "-"}
                                    </Typography>
                                </Stack>
                            </Grid>
                            <Grid item xs={2} sm={4} md={4}>
                                <Stack spacing=".75rem">
                                    <Typography color={gray800} fontWeight={500}>
                                        Version
                                    </Typography>
                                    <Typography fontSize=".875rem" color={gray500}>
                                        {data?.versionInfo || "-"}
                                    </Typography>
                                </Stack>
                            </Grid>
                            <Grid item xs={2} sm={4} md={4}>
                                <Stack spacing=".75rem">
                                    <Typography color={gray800} fontWeight={500}>
                                        OWL equivalent
                                    </Typography>
                                    <Typography fontSize=".875rem" color={gray500}>
                                        {data?.owlEquivalent || "-"}
                                    </Typography>
                                </Stack>
                            </Grid>
                            <Grid item xs={2} sm={4} md={4}>
                                <Stack spacing=".75rem">
                                    <Typography color={gray800} fontWeight={500}>
                                        Originally submitted by
                                    </Typography>
                                    <Typography fontSize=".875rem" color={gray500}>
                                        {data?.submittedBy || "-"}
                                    </Typography>
                                </Stack>
                            </Grid>
                            <Grid item xs={2} sm={4} md={4}>
                                <Stack spacing=".75rem">
                                    <Typography color={gray800} fontWeight={500}>
                                        Last modified by
                                    </Typography>
                                    <Typography fontSize=".875rem" color={gray500}>
                                        {data?.lastModifiedBy || "-"}
                                    </Typography>
                                </Stack>
                            </Grid>
                            <Grid item xs={2} sm={4} md={4}>
                                <Stack spacing=".75rem">
                                    <Typography color={gray800} fontWeight={500}>
                                        Last modify timestamp
                                    </Typography>
                                    <Typography fontSize=".875rem" color={gray500}>
                                        {data?.lastModifyTimestamp || "-"}
                                    </Typography>
                                </Stack>
                            </Grid>
                        </Grid>
                        <Grid container item p={3} lg={12}>
                            <Grid item lg={12} mb={5.5}>
                                <Hierarchy />
                            </Grid>
                            <Grid item lg={12}>
                                <Predicates data={memoData} loading={loading} isGraphVisible={false} />
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid container xs={12} lg={6} sx={{ borderRight: `1px solid ${gray200}`, backgroundColor: gray25 }}>
                        <Box display="flex" justifyContent="space-between" sx={{ padding: "1.5rem", borderBottom: `1px solid ${gray200}`, background: "#fff" }} width={1}>
                            <Typography sx={styles.title}>Central nervous system</Typography>
                            <Chip label={"Curated"} sx={styles.chip} />
                        </Box>
                        <Grid container item p={3}>
                            <Grid item mb={5.5}>
                                <Stack spacing=".75rem">
                                    <Typography color={gray800} fontWeight={500}>
                                        Synonyms
                                    </Typography>
                                    <Box display="flex" flexWrap="wrap" gap=".5rem">
                                        {data?.synonym?.map((synonym) => (
                                            <Chip
                                                className="rounded synonyms"
                                                variant="outlined"
                                                key={synonym}
                                                label={
                                                    <span>
                                                        {synonym} <span>{synonym}</span>
                                                    </span>
                                                }
                                            />
                                        ))}
                                    </Box>
                                </Stack>
                            </Grid>
                            <Grid item mb={5.5} display="flex" alignItems="start" justifyContent="space-between">
                                <Stack spacing=".75rem">
                                    <Typography color={gray800} fontWeight={500}>
                                        Existing IDs
                                    </Typography>
                                    <Box display="flex" flexWrap="wrap" gap=".5rem">
                                        {data?.existingID?.map((id) => (
                                            <Chip className="rounded IDchip-outlined" variant="outlined" key={id} label={id} icon={<OpenInNewOutlinedIcon />} onClick={() => handleChipClick(id)} />
                                        ))}
                                    </Box>
                                </Stack>
                                <Stack spacing=".75rem">
                                    <Typography color={gray800} fontWeight={500}>
                                        Preferred ID
                                    </Typography>
                                    <Typography fontSize=".875rem" color={gray500}>
                                        {data?.hasIlxPreferredId}
                                    </Typography>
                                </Stack>
                            </Grid>
                            <Grid item>
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
                        <Grid container item p={3} spacing={5.5}>
                            <Grid item xs={2} sm={4} md={4}>
                                <Stack spacing=".75rem">
                                    <Typography color={gray800} fontWeight={500}>
                                        Type
                                    </Typography>
                                    <Typography fontSize=".875rem" color={gray500}>
                                        {data?.type || "-"}
                                    </Typography>
                                </Stack>
                            </Grid>
                            <Grid item xs={2} sm={4} md={4}>
                                <Stack spacing=".75rem">
                                    <Typography color={gray800} fontWeight={500}>
                                        Version
                                    </Typography>
                                    <Typography fontSize=".875rem" color={gray500}>
                                        {data?.versionInfo || "-"}
                                    </Typography>
                                </Stack>
                            </Grid>
                            <Grid item xs={2} sm={4} md={4}>
                                <Stack spacing=".75rem">
                                    <Typography color={gray800} fontWeight={500}>
                                        OWL equivalent
                                    </Typography>
                                    <Typography fontSize=".875rem" color={gray500}>
                                        {data?.owlEquivalent || "-"}
                                    </Typography>
                                </Stack>
                            </Grid>
                            <Grid item xs={2} sm={4} md={4}>
                                <Stack spacing=".75rem">
                                    <Typography color={gray800} fontWeight={500}>
                                        Originally submitted by
                                    </Typography>
                                    <Typography fontSize=".875rem" color={gray500}>
                                        {data?.submittedBy || "-"}
                                    </Typography>
                                </Stack>
                            </Grid>
                            <Grid item xs={2} sm={4} md={4}>
                                <Stack spacing=".75rem">
                                    <Typography color={gray800} fontWeight={500}>
                                        Last modified by
                                    </Typography>
                                    <Typography fontSize=".875rem" color={gray500}>
                                        {data?.lastModifiedBy || "-"}
                                    </Typography>
                                </Stack>
                            </Grid>
                            <Grid item xs={2} sm={4} md={4}>
                                <Stack spacing=".75rem">
                                    <Typography color={gray800} fontWeight={500}>
                                        Last modify timestamp
                                    </Typography>
                                    <Typography fontSize=".875rem" color={gray500}>
                                        {data?.lastModifyTimestamp || "-"}
                                    </Typography>
                                </Stack>
                            </Grid>
                        </Grid>
                        <Grid container item p={3} lg={12}>
                            <Grid item lg={12} mb={5.5}>
                                <Hierarchy />
                            </Grid>
                            <Grid item lg={12}>
                                <Predicates data={memoData} loading={loading} isGraphVisible={false} />
                            </Grid>
                        </Grid>
                    </Grid>
                </Box>
            </CustomizedDialog>
            <StatusDialog
                open={openStatusDialog}
                handleClose={handleCloseStatusDialog}
                title={"Request to merge changes to curated"}
                message={"Request to merge changes successfully sent"}
                subMessage={"Close or go to your fork."}
                finishButtonTitle={"Go to fork"}
                finishButtonEndIcon={<ArrowForwardIcon />}
            />
        </>
    )
}

export default RequestMergeChanges;