import {Box, Button, Chip, Divider, Grid, Stack, Typography} from "@mui/material";
import CustomBreadcrumbs from "./CustomBreadcrumbs";
import ForkRightIcon from '@mui/icons-material/ForkRight';
import {vars} from "../../theme/variables";
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import OntologySearch from "./OntologySearch";
import ModeEditOutlineOutlinedIcon from '@mui/icons-material/ModeEditOutlineOutlined';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import CopyLinkComponent from "./CopyLinkComponent";
import BasicTabs from "./CustomTabs";

const {brand700, gray600} = vars

const SingleTermView = () => {
  
  return <Box>
    <Stack p='1.5rem 5rem 0rem 5rem'>
      <Grid container>
        <Grid item xs={12} lg={6}>
          <Stack direction='row' spacing='.75rem'>
            <CustomBreadcrumbs />
            <ForkRightIcon fontSize='medium' htmlColor={brand700} />
            <Typography color={brand700} fontSize='0.875rem' fontWeight={600}>fork1</Typography>
            <Chip icon={<FiberManualRecordIcon />} label="Not merged" variant='outlined' className='status not-merged' />
          </Stack>
        </Grid>
        <Grid item xs={12} lg={6} display='flex' justifyContent='end'>
          <Stack direction='row' spacing='.5rem' alignItems='center'>
            <Typography color={gray600} fontSize='.875rem' lineHeight='1.25rem'>Active Ontology:</Typography>
            <OntologySearch />
          </Stack>
        </Grid>
      </Grid>
      <Grid container mt='1.75rem'>
        <Grid item xs={12} lg={6}>
          <Stack direction='row' spacing='.75rem' alignItems='center'>
            <Typography color={gray600} fontSize='1.875rem' fontWeight={600}>Central nervous system</Typography>
            <Chip label="Fork" variant='outlined' />
          </Stack>
        </Grid>
        <Grid item xs={12} lg={6} display='flex' justifyContent='end'>
          <Stack direction='row' spacing='1rem' alignItems='center'>
            <Button type='string' color='secondary' startIcon={<ModeEditOutlineOutlinedIcon />}>Edit term</Button>
            <Button type='string' color='secondary' startIcon={<RateReviewOutlinedIcon />}>Request to merge changes to curated</Button>
            <Divider orientation="vertical" flexItem />
            <Button type='string' color='secondary' startIcon={<ForkRightIcon />}>Create fork</Button>
          </Stack>
        </Grid>
        <Grid item xs={12} mt='.56rem'>
          <CopyLinkComponent url='http://uri.interlex.org/base/ilx_0101901' />
        </Grid>
        <Grid item xs={12} mt='2rem'>
          <BasicTabs />
        </Grid>
      </Grid>
    </Stack>
    <Stack sx={{
      overflow:'scroll',
      height: '62vh'
    }}>
      <Box p='2.5rem 5rem'>
        Synonyms
      </Box>
    </Stack>
  </Box>
}

export default SingleTermView