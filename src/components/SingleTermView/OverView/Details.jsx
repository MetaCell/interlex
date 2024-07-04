import {
  Box,
  Chip, CircularProgress,
  Grid,
  Stack,
  Typography
} from "@mui/material";
import { vars } from "../../../theme/variables";
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
const { gray800, gray500 } = vars;

const Details = ({loading,  data }) => {
  
  const handleChipClick = (url) => {
    window.open(url, '_blank');
  };
  
  if (loading) {
    return <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress />
    </Box>
  }
  
  if (!data) {
    return <div>No data available</div>;
  }
  return (
    <>
      <Grid container>
        <Grid item xs={12} lg={5}>
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
        <Grid item xs={12} lg={3}>
          <Stack spacing=".75rem">
            <Typography color={gray800} fontWeight={500}>
              Preferred ID
            </Typography>
            <Typography fontSize=".875rem" color={gray500}>
              {data?.hasIlxPreferredId}
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} lg={4}>
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
        </Grid>
      </Grid>
      <Grid container mt="2.5rem">
        <Grid item xs={12}>
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
      <Grid container mt="2.5rem">
        <Grid item xs={12} lg={4} mb=".75rem">
          <Stack spacing=".75rem">
            <Typography color={gray800} fontWeight={500}>
              Type
            </Typography>
            <Typography fontSize=".875rem" color={gray500}>
              {data?.type}
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} lg={4} mb=".75rem">
          <Stack spacing=".75rem">
            <Typography color={gray800} fontWeight={500}>
              Version
            </Typography>
            <Typography fontSize=".875rem" color={gray500}>
              {data?.versionInfo}
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} lg={4} mb=".75rem">
          <Stack spacing=".75rem">
            <Typography color={gray800} fontWeight={500}>
              OWL equivalent
            </Typography>
            <Typography fontSize=".875rem" color={gray500}>
              {data?.owlEquivalent}
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} lg={4} mb=".75rem">
          <Stack spacing=".75rem">
            <Typography color={gray800} fontWeight={500}>
              Originally submitted by
            </Typography>
            <Typography fontSize=".875rem" color={gray500}>
              {data?.submittedBy}
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} lg={4} mb=".75rem">
          <Stack spacing=".75rem">
            <Typography color={gray800} fontWeight={500}>
              Last modified by
            </Typography>
            <Typography fontSize=".875rem" color={gray500}>
              {data?.lastModifiedBy}
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} lg={4} mb=".75rem">
          <Stack spacing=".75rem">
            <Typography color={gray800} fontWeight={500}>
              Last modify timestamp
            </Typography>
            <Typography fontSize=".875rem" color={gray500}>
              {data?.lastModifyTimestamp}
            </Typography>
          </Stack>
        </Grid>
      </Grid>
    </>
  );
}

export default Details;
