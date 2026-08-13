import React from "react";
import { Grid, Box, Chip, Typography } from "@mui/material";
import ChipChanges from "./ChipChanges";
import LabelChanges from "./LabelChanges";
import TextChanges from "./TextChanges";
import PredicateChanges from "./PredicateChanges";
import DefaultComponentChanges from "./DefaultComponentChanges";
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


const MergePanel = ({ data, compareData, status, chipLabel = "Curated" }) => {

  const getTitle = (key: string): string => {
    return keyToTitleMap[key] || key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
  }

  // Either side can be missing (a term with no curated version, or no variant in this fork);
  // the panel still renders its half rather than throwing on Object.keys(null).
  const term = data || {};
  const other = compareData || {};

  return (
    <Grid container xs={12} lg={6} sx={{ borderRight: `1px solid ${gray200}`, backgroundColor: gray25, overflowY: 'auto' }}>
      <Box display="flex" justifyContent="space-between" sx={{ padding: "1.5rem", borderBottom: `1px solid ${gray200}`, background: "#fff", maxHeight: "4.75rem" }} width={1}>
        <Typography sx={styles.title}>{term?.label}</Typography>
        <Chip label={chipLabel} sx={styles.chip} />
      </Box>
      <Grid container p={3} spacing={5.5}>
        {Object.keys(term).sort((a, b) => orderedKeys.indexOf(a) - orderedKeys.indexOf(b)).map((property) => {
          const component = mapping[property]
          if (!component || term[property] === undefined || term[property] === null) return null;

          const value = term[property];
          const compareValue = other[property];
          const uniqueKey = `${property}-${status}-${JSON.stringify(value)}`;

          switch (component) {
            case "ChipSynonymChanges":
              return <Grid key={uniqueKey} item lg={12}>
                  <ChipChanges data={value} compareData={compareValue} status={status} type="dual-text-chip" title="Synonym" />
                </Grid>
            case "ChipExistingIDChanges":
              return <Grid key={uniqueKey} item lg={6} xs={12}>
                  <ChipChanges data={value} compareData={compareValue} status={status} type="chip-link" title="Existing IDs" />
                </Grid>
            case "LabelChanges":
                return <Grid key={uniqueKey} item lg={6} xs={2} sm={4} md={4}>
                  <LabelChanges title={getTitle(property)} data={value} compareData={compareValue} status={status} />
                </Grid>
            case "TextChanges":
                return <Grid key={uniqueKey} item lg={12}>
                  <TextChanges title={getTitle(property)} data={value} compareData={compareValue} status={status} />
                </Grid>
            case "TableChanges":
                return <Grid key={uniqueKey} item lg={12}>
                  <PredicateChanges title={getTitle(property)} data={value} compareData={compareValue} status={status} />
                </Grid>
            default:
                return <Grid key={uniqueKey} item lg={12} xs={6}>
                  <DefaultComponentChanges data={value} compareData={compareValue} title={getTitle(property)} status={status} />
                </Grid>
          }
        })}
      </Grid>
    </Grid>
  )
}

export default MergePanel;