import React from "react";
import { Grid, Box, Chip, Typography } from "@mui/material";
import ChipChanges from "./ChipChanges";
import LabelChanges from "./LabelChanges";
import TextChanges from "./TextChanges";
import PredicateChanges from "./PredicateChanges";
import mapping from './mapping.json';
import { vars } from "../../../theme/variables";

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

const keyToTitleMap = {
  versionInfo: "Version",
  hasIlxPreferredId: "Preferred ID",
  description: "Description",
  type: "Type",
  owlEquivalent: "OWL equivalent",
  submittedBy: "Originally submitted by",
  lastModifiedBy: "Last modified by",
  lastModifyTimestamp: "Last modify timestamp",
  predicates: "Predicates"
}

const orderedKeys = ["synonym", "existingID", "hasIlxPreferredId", "description", "type", "versionInfo", "owlEquivalent", "submittedBy", "lastModifiedBy", "lastModifyTimestamp", "predicates"]


const MergePanel = ({ data, changedData, status }) => {

  const getTitle = (key: string): string => {
    return keyToTitleMap[key] || key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
  }

  return (
    <Grid container xs={12} lg={6} sx={{ borderRight: `1px solid ${gray200}`, backgroundColor: gray25, overflowY: 'auto' }}>
      <Box display="flex" justifyContent="space-between" sx={{ padding: "1.5rem", borderBottom: `1px solid ${gray200}`, background: "#fff", maxHeight: "4.75rem" }} width={1}>
        <Typography sx={styles.title}>{data?.label}</Typography>
        <Chip label={"Curated"} sx={styles.chip} />
      </Box>
      <Grid container p={3} spacing={5.5}>
        {Object.keys(data).sort((a, b) => orderedKeys.indexOf(a) - orderedKeys.indexOf(b)).map(property => {
          const component = mapping[property]
          switch (component) {
            case "ChipSynonymChanges":
              return <Grid item lg={12}>
                  <ChipChanges data={data[property]} compareData={changedData[property]} status={status} type="synonym" />
                </Grid>
            case "ChipExistingIDChanges":
              return <Grid item lg={6} xs={12}>
                  <ChipChanges data={data[property]} compareData={changedData[property]} status={status} type="existingID" />
                </Grid>
            case "LabelChanges":
                return <Grid item lg={6} xs={2} sm={4} md={4}>
                  <LabelChanges title={getTitle(property)} data={data[property]} compareData={changedData[property]} status={status} />
                </Grid>
            case "TextChanges":
                return <Grid item lg={12}>
                  <TextChanges title={getTitle(property)} data={data[property]} compareData={changedData[property]} status={status} />
                </Grid>
            case "TableChanges":
                return <Grid item lg={12}>
                  <PredicateChanges title={getTitle(property)} data={data[property]} compareData={changedData[property]} status={status} />
                </Grid>
            default:
                return <></>
          }
        })}
      </Grid>
    </Grid>
  )
}

export default MergePanel;