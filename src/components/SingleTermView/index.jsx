import {Box, Button, Chip, Divider, FormControl, Grid, MenuItem, Select, Stack, Typography, ButtonGroup} from "@mui/material";
import CustomBreadcrumbs from "./CustomBreadcrumbs";
import ForkRightIcon from '@mui/icons-material/ForkRight';
import { vars } from "../../theme/variables";
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import OntologySearch from "./OntologySearch";
import ModeEditOutlineOutlinedIcon from '@mui/icons-material/ModeEditOutlineOutlined';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import CopyLinkComponent from "./CopyLinkComponent";
import BasicTabs from "./CustomTabs";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CustomButton from "../common/CustomButton";
import CustomMenu from "./CustomMenu";
import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import React from "react";
import {RestartAlt, TargetCross} from "../../Icons";
const {brand700, gray600, gray800, gray500, gray700, gray300} = vars

const SingleTermView = () => {
  const [type, setType] = React.useState('Children');
  const [open, setOpen] = React.useState(false);
  const actionRef = React.useRef(null);
  const anchorRef = React.useRef(null);
  
  const synonyms = [
    {title: 'CNS', description: 'abbrev'},
    {title: 'Myencephalon', description: ''},
    {title: 'Cerebrospinal axis', description: 'fma:synonym'},
    {title: 'Cerebrospinal axis', description: 'fma:synonym'},
    {title: 'Central nervous system', description: 'fma:synonym'},
    {title: 'systema nervosum centrale', description: 'oboInOwl:hasExactSynonym'},
    {title: 'neuraxis', description: 'oboInOwl:hasRelatedSynonym'},
  ]
  
  const existingIDs = [
    'UBERON:0001017',
    'FMA:55675',
    'ILX:0101901',
    'BIRNLEX:1099',
  ]
  
  return <Box>
    <Stack p='1.5rem 5rem 0rem 5rem'>
      <Grid container>
        <Grid item xs={12} lg={6}>
          <Stack direction='row' spacing='.75rem'>
            <CustomBreadcrumbs />
            <ForkRightIcon fontSize='medium' htmlColor={brand700} />
            <Typography color={brand700} fontSize='0.875rem' fontWeight={600}>fork1</Typography>
            <Chip icon={<FiberManualRecordIcon />} label="Not merged" variant='outlined' className='rounded not-merged' />
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
      <Grid container p='2.5rem 5rem'>
        <Grid item xs={12} lg={6}>
          <Stack spacing='.75rem'>
            <Typography color={gray800} fontWeight={500}>Synonyms</Typography>
            <Box display='flex' flexWrap='wrap' gap='.5rem'>
              {
                synonyms.map(synonym =>
                  <Chip
                    className='rounded synonyms'
                    variant='outlined'
                    key={synonym.title}
                    label={<span>{synonym.title} <span>{synonym.description}</span></span>} />
                )
              }
            </Box>
          </Stack>
        </Grid>
        <Grid item xs={12} lg={2}>
          <Stack spacing='.75rem'>
            <Typography color={gray800} fontWeight={500}>Preferred ID</Typography>
            <Typography fontSize='.875rem' color={gray500}>UBERON:0000955</Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Stack spacing='.75rem'>
            <Typography color={gray800} fontWeight={500}>Existing IDs</Typography>
            <Box display='flex' flexWrap='wrap' gap='.5rem'>
              {
                existingIDs.map(id =>
                  <Chip
                    className='rounded IDchip-outlined'
                    variant='outlined'
                    key={id}
                    label={id}
                  />
                )
              }
            </Box>
          </Stack>
        </Grid>
      </Grid>
      <Grid container p='2.5rem 5rem'>
        <Grid item xs={12}>
          <Stack spacing='.75rem'>
            <Typography color={gray800} fontWeight={500}>Description</Typography>
            <Typography  fontSize='.875rem' color={gray500}>The central nervous system (CNS) is the part of the nervous system which includes the brain, spinal cord, and nerve cell layer of the retina. </Typography>
            <Typography  fontSize='.875rem' color={gray500}>In animals with bilateral symmetry, it is a topographic division that is a condensation of the nervous system in the longitudinal plane, lying on or near the median plane. For invertebrates the longitudinal division consists of one or more nerve cords, whereas for vertebrates it consists of a single, hollow, and dorsal cerebrospinal axis.In adult Echinoderms, which are radially symmetrical, a presumptive CNS is formed by a circular cord with associated radial cords.  </Typography>
            <Typography  fontSize='.875rem' color={gray500}>However, there is no ganglion that could be considered as brain in invertebrate When a CNS is present, its obligate companion topographic division is a peripheral nervous system. </Typography>
          </Stack>
        </Grid>
      </Grid>
      <Grid container p='2.5rem 5rem'>
        <Grid item xs={12} lg={4} mb='.75rem'>
          <Stack spacing='.75rem'>
            <Typography color={gray800} fontWeight={500}>Type</Typography>
            <Typography fontSize='.875rem' color={gray500}>term</Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} lg={4} mb='.75rem'>
          <Stack spacing='.75rem'>
            <Typography color={gray800} fontWeight={500}>Version</Typography>
            <Typography fontSize='.875rem' color={gray500}>17</Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} lg={4} mb='.75rem'>
          <Stack spacing='.75rem'>
            <Typography color={gray800} fontWeight={500}>OWL equivalent</Typography>
            <Typography fontSize='.875rem' color={gray500}>owl:Class</Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} lg={4} mb='.75rem'>
          <Stack spacing='.75rem'>
            <Typography color={gray800} fontWeight={500}>Originally submitted by</Typography>
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
      <Box p='5rem 5rem 2.5rem 5rem'>
        <Divider />
        <Grid container pt='2.75rem'>
          <Grid item sx={12} lg={4}>
            <Stack>
              <Box display='flex' alignItems='center' justifyContent='space-between'>
                <Typography color={gray800} fontWeight={500}>Hierarchy</Typography>
                <Stack direction="row" alignItems="center" spacing={'.75rem'}>
                  <Typography variant="caption" sx={{ fontSize: '0.875rem', color: gray600 }}>Type:</Typography>
                  <FormControl sx={{ minWidth: 75 }}>
                    <Select
                      value={type}
                      onChange={(v) => setType(v)}
                      displayEmpty
                      IconComponent={KeyboardArrowDownIcon}
                      sx={{
                        color: gray700,
                        borderRadius: '0.5rem !important',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        '& .MuiOutlinedInput-input': {
                          padding: '0.625rem 0.875rem'
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: gray300
                        },
                        '& .MuiSvgIcon-root': {
                          color: gray700,
                          fontSize: '1.25rem',
                          right: '0.875rem !important'
                        }
                      }}
                    >
                      <MenuItem value={'Children'}>Children</MenuItem>
                      <MenuItem value={'Superclasses'}>Superclasses</MenuItem>
                    </Select>
                  </FormControl>
                  <Divider orientation="vertical" flexItem />
                  <Button sx={{ p: '0.625rem 0.5625rem', minWidth: '0.0625rem' }} variant='outlined'>
                    <RestartAlt />
                  </Button>
                  <Button sx={{ p: '0.625rem 0.5625rem', minWidth: '0.0625rem' }} variant='outlined'>
                    <TargetCross />
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Stack>
  </Box>
}

export default SingleTermView
