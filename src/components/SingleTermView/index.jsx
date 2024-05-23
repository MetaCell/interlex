import React from "react";
import { Box, Button, Chip, Divider, Grid, Stack, Typography, ButtonGroup } from "@mui/material";
import CustomBreadcrumbs from "./CustomBreadcrumbs";
import ForkRightIcon from '@mui/icons-material/ForkRight';
import { vars } from "../../theme/variables";
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import OntologySearch from "./OntologySearch";
import ModeEditOutlineOutlinedIcon from '@mui/icons-material/ModeEditOutlineOutlined';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import CopyLinkComponent from "./CopyLinkComponent";
import CustomButton from "../common/CustomButton";
import CustomMenu from "./CustomMenu";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const { brand700, gray600 } = vars

const SingleTermView = () => {
  const [open, setOpen] = React.useState(false);
  const actionRef = React.useRef(null);
  const anchorRef = React.useRef(null);

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
        <Grid item xs={12} lg={4}>
          <Stack direction='row' spacing='.75rem' alignItems='center'>
            <Typography color={gray600} fontSize='1.875rem' fontWeight={600}>Central nervous system</Typography>
            <Chip label="Fork" variant='outlined' />
          </Stack>
        </Grid>
        <Grid item xs={12} lg={8} display='flex' justifyContent='end'>
          <Stack direction='row' spacing='1rem' alignItems='center'>
            <Button type='string' color='secondary' startIcon={<ModeEditOutlineOutlinedIcon />}>Edit term</Button>
            <Button type='string' color='secondary' startIcon={<RateReviewOutlinedIcon />}>Request to merge changes to curated</Button>
            <Divider orientation="vertical" flexItem />
            <Button type='string' color='secondary' startIcon={<ForkRightIcon />}>Create fork</Button>
            <ButtonGroup
              variant="outlined"
              ref={anchorRef}
              sx={{
                boxShadow: open && "0px 0px 0px 4px rgba(50, 129, 115, 0.24)"
              }}
            >
              <Button display="flex" alignItems="center">
                <CreateNewFolderOutlinedIcon fontSize="medium" />
                Add term to active ontology
              </Button>
              <Button
                aria-controls={open ? 'split-button-ontology-menu' : undefined}
                aria-expanded={open ? 'true' : undefined}
                aria-label="select ontology action"
                aria-haspopup="ontology-menu"
                onMouseDown={() => {
                  actionRef.current = () => setOpen(!open);
                }}
                onKeyDown={() => {
                  actionRef.current = () => setOpen(!open);
                }}
                onClick={() => {
                  actionRef.current?.();
                }}
              >
                {open ? <KeyboardArrowUpIcon fontSize="medium" /> : <KeyboardArrowDownIcon fontSize="medium" />}
              </Button>
            </ButtonGroup>
            <CustomMenu open={open} anchorRef={anchorRef} setOpen={setOpen} />
            <CustomButton onClick={() => console.log("Download button clicked!")}><DownloadOutlinedIcon fontSize="medium" />Download as</CustomButton>
          </Stack>
        </Grid>
        <CopyLinkComponent url='http://uri.interlex.org/base/ilx_0101901' />
      </Grid>
    </Stack>
  </Box>
}

export default SingleTermView