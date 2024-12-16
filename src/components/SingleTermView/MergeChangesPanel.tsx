import React from "react";
import { useMemo } from "react";
import { Grid, Box, Chip, Stack, Typography } from "@mui/material";
import Predicates from "./OverView/Predicates";
import MergeStatusContainer from "./MergeStatusContainer";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import { compareArrays, compareSentences } from "../../utils";
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


const MergeChangesPanel = ({ data, comparingData, statusType }) => {

    const memoData = useMemo(() => data, [data]);

    const differencesOfSynonym = compareArrays(data?.synonym, comparingData?.synonym);
    const differencesOfExistingID = compareArrays(data.existingID, comparingData.existingID);
    const differencesOfDescription = compareSentences(data.description, comparingData.description);


    return (
        <Grid container xs={12} lg={6} sx={{ borderRight: `1px solid ${gray200}`, backgroundColor: gray25, overflowY: 'auto' }}>
            <Box display="flex" justifyContent="space-between" sx={{ padding: "1.5rem", borderBottom: `1px solid ${gray200}`, background: "#fff", maxHeight: "4.75rem" }} width={1}>
                <Typography sx={styles.title}>{data?.label}</Typography>
                <Chip label={"Curated"} sx={styles.chip} />
            </Box>
            <Grid container item p={3}>
                <Grid item mb={5.5}>
                    <Stack spacing=".75rem">
                        <Typography color={gray800} fontWeight={500}>
                            Synonyms
                        </Typography>
                        <Box display="flex" flexWrap="wrap" gap=".5rem">
                            {data.synonym.map((synonym: string) => {
                                const isDifferent = differencesOfSynonym.includes(synonym);

                                return isDifferent ? (
                                    <MergeStatusContainer key={synonym} status={statusType}>
                                        <Chip
                                            className="rounded synonyms"
                                            variant="outlined"
                                            label={
                                                <span>
                                                    {synonym} <span>{synonym}</span>
                                                </span>
                                            }
                                        />
                                    </MergeStatusContainer>
                                ) : (
                                    <Chip
                                        key={synonym}
                                        className="rounded synonyms"
                                        variant="outlined"
                                        label={
                                            <span>
                                                {synonym} <span>{synonym}</span>
                                            </span>
                                        }
                                    />
                                );
                            })}
                        </Box>
                    </Stack>
                </Grid>
                <Grid item mb={5.5} display="flex" alignItems="start" justifyContent="space-between">
                    <Stack spacing=".75rem">
                        <Typography color={gray800} fontWeight={500}>
                            Existing IDs
                        </Typography>
                        <Box display="flex" flexWrap="wrap" gap=".5rem">
                            {data?.existingID?.map((id: string) => {
                                const isDifferent = differencesOfExistingID.includes(id);

                                return isDifferent ? (
                                    <MergeStatusContainer key={id} status={statusType}>
                                        <Chip
                                            className="rounded IDchip-outlined"
                                            variant="outlined"
                                            label={id}
                                            icon={<OpenInNewOutlinedIcon />}
                                        />
                                    </MergeStatusContainer>
                                ) : (
                                    <Chip
                                        key={id}
                                        className="rounded IDchip-outlined"
                                        variant="outlined"
                                        label={id}
                                        icon={<OpenInNewOutlinedIcon />}
                                    />
                                );
                            })}
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
                            {data?.description.split(new RegExp(`(${differencesOfDescription.join('|')})`, 'g')).map((part, index) => {
                                if (differencesOfDescription.includes(part)) {
                                    return (
                                        <MergeStatusContainer key={index} status={statusType}>
                                            {part}
                                        </MergeStatusContainer>
                                    );
                                }
                                return part;
                            })}
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
                <Grid item lg={12}>
                    <Predicates data={memoData} comparingData={comparingData} isGraphVisible={false} statusType={statusType} />
                </Grid>
            </Grid>
        </Grid>
    )
}

export default MergeChangesPanel;