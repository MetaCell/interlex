import {
  Box,
  Chip,
  Grid,
  Stack,
  Typography
} from "@mui/material";
import { vars } from "../../../theme/variables";
import React from "react";

const { gray800, gray500 } = vars;
const Details = () => {
  const synonyms = [
    { title: 'CNS', description: 'abbrev' },
    { title: 'Myencephalon', description: '' },
    { title: 'Cerebrospinal axis', description: 'fma:synonym' },
    { title: 'Cerebrospinal axis', description: 'fma:synonym' },
    { title: 'Central nervous system', description: 'fma:synonym' },
    { title: 'systema nervosum centrale', description: 'oboInOwl:hasExactSynonym' },
    { title: 'neuraxis', description: 'oboInOwl:hasRelatedSynonym' },
  ];
  
  const existingIDs = [
    'UBERON:0001017',
    'FMA:55675',
    'ILX:0101901',
    'BIRNLEX:1099',
  ];
  
  return (
    <>
      <Grid container>
        <Grid item xs={12} lg={6}>
          <Stack spacing=".75rem">
            <Typography color={gray800} fontWeight={500}>
              Synonyms
            </Typography>
            <Box display="flex" flexWrap="wrap" gap=".5rem">
              {synonyms.map((synonym) => (
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
              UBERON:0000955
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Stack spacing=".75rem">
            <Typography color={gray800} fontWeight={500}>
              Existing IDs
            </Typography>
            <Box display="flex" flexWrap="wrap" gap=".5rem">
              {existingIDs.map((id) => (
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
              The central nervous system (CNS) is the part of the nervous system which includes the brain, spinal cord,
              and nerve cell layer of the retina.
            </Typography>
            <Typography fontSize=".875rem" color={gray500}>
              In animals with bilateral symmetry, it is a topographic division that is a condensation of the nervous
              system in the longitudinal plane, lying on or near the median plane. For invertebrates the longitudinal
              division consists of one or more nerve cords, whereas for vertebrates it consists of a single, hollow,
              and dorsal cerebrospinal axis. In adult Echinoderms, which are radially symmetrical, a presumptive CNS
              is formed by a circular cord with associated radial cords.
            </Typography>
            <Typography fontSize=".875rem" color={gray500}>
              However, there is no ganglion that could be considered as brain in invertebrate When a CNS is present,
              its obligate companion topographic division is a peripheral nervous system.
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
              term
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} lg={4} mb=".75rem">
          <Stack spacing=".75rem">
            <Typography color={gray800} fontWeight={500}>
              Version
            </Typography>
            <Typography fontSize=".875rem" color={gray500}>
              17
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} lg={4} mb=".75rem">
          <Stack spacing=".75rem">
            <Typography color={gray800} fontWeight={500}>
              OWL equivalent
            </Typography>
            <Typography fontSize=".875rem" color={gray500}>
              owl:Class
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} lg={4} mb=".75rem">
          <Stack spacing=".75rem">
            <Typography color={gray800} fontWeight={500}>
              Originally submitted by
            </Typography>
            <Typography fontSize='.875rem' color={gray500}>NeuroLex</Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} lg={4} mb='.75rem'>
          <Stack spacing='.75rem'>
            <Typography color={gray800} fontWeight={500}>Last modified by</Typography>
            <Typography fontSize='.875rem' color={gray500}>NeuroLex</Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} lg={4} mb='.75rem'>
          <Stack spacing='.75rem'>
            <Typography color={gray800} fontWeight={500}>Last modify timestamp</Typography>
            <Typography fontSize='.875rem' color={gray500}>2020-06-23 21:46</Typography>
          </Stack>
        </Grid>
      </Grid>
    </>
  
  )}

export default Details