import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Box,
  Chip, CircularProgress,
  Grid,
  Stack,
  Typography
} from "@mui/material";
import { vars } from "../../../theme/variables";

const { gray800, gray500 } = vars;

const URL = "https://raw.githubusercontent.com/MetaCell/interlex/feature/ILEX-11/src/static/Details.json"
const Details = ({ term }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setLoading(true)
    fetch(URL)
      .then((response) => response.json())
      .then((jsonData) => {
        setData(jsonData);
        setLoading(false)
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, [term]);
  
  const memoData = useMemo(() => data, [data]);
  
  if (loading) {
    return <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress />
    </Box>
  }
  
  if (!memoData) {
    return <div>No data available</div>;
  }
  return (
    <>
      <Grid container>
        <Grid item xs={12} lg={6}>
          <Stack spacing=".75rem">
            <Typography color={gray800} fontWeight={500}>
              Synonyms
            </Typography>
            <Box display="flex" flexWrap="wrap" gap=".5rem">
              {memoData?.synonyms?.map((synonym) => (
                <Chip
                  className="rounded synonyms"
                  variant="outlined"
                  key={synonym.title}
                  label={
                    <span>
                      {synonym.title} <span>{synonym.description}</span>
                    </span>
                  }
                />
              ))}
            </Box>
          </Stack>
        </Grid>
        <Grid item xs={12} lg={2}>
          <Stack spacing=".75rem">
            <Typography color={gray800} fontWeight={500}>
              Preferred ID
            </Typography>
            <Typography fontSize=".875rem" color={gray500}>
              {memoData?.preferredID}
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Stack spacing=".75rem">
            <Typography color={gray800} fontWeight={500}>
              Existing IDs
            </Typography>
            <Box display="flex" flexWrap="wrap" gap=".5rem">
              {memoData?.existingIDs?.map((id) => (
                <Chip className="rounded IDchip-outlined" variant="outlined" key={id} label={id} />
              ))}
            </Box>
          </Stack>
        </Grid>
      </Grid>
      <Grid container mt="2.5rem">
        <Grid item xs={12}>
          <Stack spacing=".75rem">
            <Typography color={gray800} fontWeight={500}>
              Description
            </Typography>
            <Typography fontSize=".875rem" color={gray500}>
              {memoData?.description}
            </Typography>
          </Stack>
        </Grid>
      </Grid>
      <Grid container mt="2.5rem">
        <Grid item xs={12} lg={4} mb=".75rem">
          <Stack spacing=".75rem">
            <Typography color={gray800} fontWeight={500}>
              Type
            </Typography>
            <Typography fontSize=".875rem" color={gray500}>
              {memoData?.type}
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} lg={4} mb=".75rem">
          <Stack spacing=".75rem">
            <Typography color={gray800} fontWeight={500}>
              Version
            </Typography>
            <Typography fontSize=".875rem" color={gray500}>
              {memoData?.version}
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} lg={4} mb=".75rem">
          <Stack spacing=".75rem">
            <Typography color={gray800} fontWeight={500}>
              OWL equivalent
            </Typography>
            <Typography fontSize=".875rem" color={gray500}>
              {memoData?.owlEquivalent}
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} lg={4} mb=".75rem">
          <Stack spacing=".75rem">
            <Typography color={gray800} fontWeight={500}>
              Originally submitted by
            </Typography>
            <Typography fontSize=".875rem" color={gray500}>
              {memoData?.submittedBy}
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} lg={4} mb=".75rem">
          <Stack spacing=".75rem">
            <Typography color={gray800} fontWeight={500}>
              Last modified by
            </Typography>
            <Typography fontSize=".875rem" color={gray500}>
              {memoData?.lastModifiedBy}
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} lg={4} mb=".75rem">
          <Stack spacing=".75rem">
            <Typography color={gray800} fontWeight={500}>
              Last modify timestamp
            </Typography>
            <Typography fontSize=".875rem" color={gray500}>
              {memoData?.lastModifyTimestamp}
            </Typography>
          </Stack>
        </Grid>
      </Grid>
    </>
  );
}

export default Details;
