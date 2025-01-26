import React from "react";
import { useMemo } from "react";
import { Grid, Box, Chip, Typography } from "@mui/material";
import Predicates from "../OverView/Predicates";
import { vars } from "../../../theme/variables";
import MergePanelSection from "./MergePanelSection";

const { white, gray800, gray200, gray25, gray300 } = vars;

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


const MergePanel = ({ data, comparingData, statusType }) => {

    const memoData = useMemo(() => data, [data]);

    return (
        <Grid container xs={12} lg={6} sx={{ borderRight: `1px solid ${gray200}`, backgroundColor: gray25, overflowY: 'auto' }}>
            <Box display="flex" justifyContent="space-between" sx={{ padding: "1.5rem", borderBottom: `1px solid ${gray200}`, background: "#fff", maxHeight: "4.75rem" }} width={1}>
                <Typography sx={styles.title}>{data?.label}</Typography>
                <Chip label={"Curated"} sx={styles.chip} />
            </Box>
            <Grid container item p={3}>
                <Grid item mb={5.5}>
                    <MergePanelSection 
                        title="Synonyms" 
                        data={data.synonym} 
                        comparingData={comparingData.synonym} 
                        statusType={statusType}
                    />
                </Grid>
                <Grid item mb={5.5} display="flex" alignItems="start" justifyContent="space-between">
                    <MergePanelSection 
                        title="Existing IDs" 
                        data={data.existingID} 
                        comparingData={comparingData.existingID} 
                        statusType={statusType}
                    />
                    <MergePanelSection
                        title="Preferred ID"
                        data={data?.hasIlxPreferredId}
                        comparingData={comparingData?.hasIlxPreferredId}
                        statusType={statusType}
                    />
                </Grid>
                <Grid item>
                    <MergePanelSection
                        title="Description"
                        data={data.description}
                        comparingData={comparingData.description}
                        statusType={statusType}
                    />
                </Grid>
            </Grid>
            <Grid container item p={3} spacing={5.5}>
                <Grid item xs={2} sm={4} md={4}>
                    <MergePanelSection
                        title="Type"
                        data={data?.type || "-"}
                        comparingData={comparingData?.type || "-"}
                        statusType={statusType}
                    />
                </Grid>
                <Grid item xs={2} sm={4} md={4}>
                    <MergePanelSection
                        title="Version"
                        data={data?.versionInfo || "-"}
                        comparingData={comparingData?.versionInfo || "-"}
                        statusType={statusType}
                    />
                </Grid>
                <Grid item xs={2} sm={4} md={4}>
                    <MergePanelSection
                        title="OWL equivalent"
                        data={data?.owlEquivalent || "-"}
                        comparingData={comparingData?.owlEquivalent || "-"}
                        statusType={statusType}
                    />
                </Grid>
                <Grid item xs={2} sm={4} md={4}>
                    <MergePanelSection
                        title="Originally submitted by"
                        data={data?.submittedBy || "-"}
                        comparingData={comparingData?.submittedBy || "-"}
                        statusType={statusType}
                    />
                </Grid>
                <Grid item xs={2} sm={4} md={4}>
                    <MergePanelSection
                        title="Last modified by"
                        data={data?.lastModifiedBy || "-"}
                        comparingData={comparingData?.lastModifiedBy || "-"}
                        statusType={statusType}
                    />
                </Grid>
                <Grid item xs={2} sm={4} md={4}>
                    <MergePanelSection
                        title="Last modify timestamp"
                        data={data?.lastModifyTimestamp || "-"}
                        comparingData={comparingData?.lastModifyTimestamp || "-"}
                        statusType={statusType}
                    />
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

export default MergePanel;