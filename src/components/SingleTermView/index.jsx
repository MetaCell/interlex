import {
  Box,
  Button,
  ButtonGroup,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
  Menu,
  MenuItem
} from "@mui/material";
import CustomBreadcrumbs from "../common/CustomBreadcrumbs";
import ForkRightIcon from '@mui/icons-material/ForkRight';
import { vars } from "../../theme/variables";
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import OntologySearch from "./OntologySearch";
import ModeEditOutlineOutlinedIcon from '@mui/icons-material/ModeEditOutlineOutlined';
import CopyLinkComponent from "../common/CopyLinkComponent";
import BasicTabs from "../common/CustomTabs";
import CustomButton from "../common/CustomButton";
import CustomMenu from "./CustomMenu";
import React from "react";
import OverView from "./OverView/OverView";
import HistoryPanel from "./History/HistoryPanel";
import VariantsPanel from "./Variants/VariantsPanel";
import {
  CreateNewFolderOutlined,
  DownloadOutlined,
  KeyboardArrowUp,
  KeyboardArrowDown,
  List,
  AccountTreeOutlined
} from "@mui/icons-material";
import CustomIconTabs from "../common/CustomIconTabs";
import DataVisualizerDropdown from "./DataVisualizerDropdown";
import Discussion from "./Discussion";
import { CodeIcon } from "../../Icons";
import {useQuery} from "../../helpers";
import ExpandIcon from "@mui/icons-material/Expand";
import RemoveIcon from "@mui/icons-material/Remove";

const { gray200, brand700, gray600 } = vars;

const dataFormats = ['JSON-LD', 'Turtle', 'N3', 'OWL', 'CSV']

const SingleTermView = () => {
  const [open, setOpen] = React.useState(false);
  const actionRef = React.useRef(null);
  const anchorRef = React.useRef(null);
  const [dataFormatAnchorEl, setDataFormatAnchorEl] = React.useState(null);
  const [tabValue, setTabValue] = React.useState(0);
  const [isCodeViewVisible, setIsCodeViewVisible] = React.useState(false);
  const [iconTabValue, setIconTabValue] = React.useState(0);
  const [selectedDataFormat, setSelectedDataFormat] = React.useState('Turtle');
  const query = useQuery();
  const searchTerm = query.get('searchTerm');
  const openDataFormatMenu = Boolean(dataFormatAnchorEl);
  const handleClickDataFormatMenu = (event) => {
    setDataFormatAnchorEl(event.currentTarget);
  };

  const handleCloseDataFormatMenu = () => {
    setDataFormatAnchorEl(null);
  };

  const handleDataFormatMenuItemClick = (value) => {
    setSelectedDataFormat(value);
    setDataFormatAnchorEl(null);
  };

  const handleIconTabValueChange = (event, newValue) => {
    setIconTabValue(newValue);
    if (newValue === 1) {
      setIsCodeViewVisible(true)
    } else {
      setIsCodeViewVisible(false)
    }
  };

  const handleChangeTabs = (event, newValue) => {
    setTabValue(newValue);
  };

  const CodeOrTreeIcon = () => {
    return isCodeViewVisible ? <CodeIcon /> : <AccountTreeOutlined />
  }

  return (
    <Box display="flex" flexDirection="column">
      <Box p="1.5rem 5rem 0rem 5rem">
        <Grid container>
          <Grid item xs={12} lg={6}>
            <Stack direction="row" spacing=".75rem">
              <CustomBreadcrumbs />
              <ForkRightIcon fontSize="medium" htmlColor={brand700} />
              <Typography color={brand700} fontSize="0.875rem" fontWeight={600}>
                fork1
              </Typography>
              <Chip
                icon={<FiberManualRecordIcon />}
                label="Not merged"
                variant="outlined"
                className="rounded not-merged"
              />
            </Stack>
          </Grid>
          <Grid item xs={12} lg={6} display="flex" justifyContent="end">
            <Stack direction="row" spacing=".5rem" alignItems="center">
              <Typography color={gray600} fontSize=".875rem" lineHeight="1.25rem">
                Active Ontology:
              </Typography>
              <OntologySearch />
            </Stack>
          </Grid>
        </Grid>
        <Grid container mt="1.75rem">
          <Grid item xs={12} lg={4}>
            <Stack direction="row" spacing=".75rem" alignItems="center">
              <Typography color={gray600} fontSize="1.875rem" fontWeight={600}>
                {searchTerm}
              </Typography>
              <Chip label="Fork" variant="outlined" />
            </Stack>
          </Grid>
          <Grid display="flex" justifyContent='end' mt=".56rem" item xs={12} lg={8}>
            <Stack direction="row" spacing="1rem" alignItems="center">
              <Button type="string" color="secondary" startIcon={<ModeEditOutlineOutlinedIcon />}>
                Edit term
              </Button>
              <Divider orientation="vertical" flexItem />
              <Button type="string" color="secondary" startIcon={<ForkRightIcon />}>
                Create fork
              </Button>
              <ButtonGroup
                variant="outlined"
                ref={anchorRef}
                sx={{
                  boxShadow: open && "0px 0px 0px 4px rgba(50, 129, 115, 0.24)"
                }}
              >
                <Button display="flex" alignItems="center">
                  <CreateNewFolderOutlined fontSize="medium" />
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
                  {open ? <KeyboardArrowUp fontSize="medium" /> : <KeyboardArrowDown fontSize="medium" />}
                </Button>
              </ButtonGroup>
              <CustomMenu open={open} anchorRef={anchorRef} setOpen={setOpen} />
              <CustomButton onClick={handleClickDataFormatMenu}><DownloadOutlined fontSize="medium" />Download as</CustomButton>
              <Menu
                anchorEl={dataFormatAnchorEl}
                open={openDataFormatMenu}
                onClose={handleCloseDataFormatMenu}
              >
                {dataFormats.map(dataFormat => (
                  <MenuItem key={dataFormat} onClick={() => handleDataFormatMenuItemClick(dataFormat)}>{dataFormat}</MenuItem>
                ))}
              </Menu>
            </Stack>
          </Grid>
          <Grid item xs={6}>
            <CopyLinkComponent url="http://uri.interlex.org/base/ilx_0101901" />
          </Grid>
          <Grid item xs={12} mt="2rem" display='flex' alignItems='center' justifyContent='space-between'>
            <BasicTabs tabValue={tabValue} handleChange={handleChangeTabs} tabs={["Overview", "Variants", "Version history", "Discussions"]} />
            {tabValue === 0 && (
              <Box display="flex">
                {isCodeViewVisible && (<>
                  <Stack direction="row" spacing=".5rem" alignItems="center">
                    <Typography color={gray600} fontSize=".875rem" lineHeight="1.25rem">
                      Format to visualize:
                    </Typography>
                    <DataVisualizerDropdown selectedValue={selectedDataFormat} setSelectedValue={setSelectedDataFormat} menuItems={dataFormats}/>
                  </Stack>
                  <Divider sx={{ ml: '0.625rem', mr: '0.625rem', border: `1px solid ${gray200}` }} /></>)
                }
                <CustomIconTabs
                  tabs={[{
                    icon: <List />,
                    value: 0
                  },{
                    icon: <CodeOrTreeIcon />,
                    value: 1
                  }]}
                  value={iconTabValue}
                  handleChange={handleIconTabValueChange}>
                </CustomIconTabs>
              </Box>
            )}
          </Grid>
        </Grid>
      </Box>
      {
        tabValue === 0 &&  <OverView isCodeViewVisible={isCodeViewVisible} selectedDataFormat={selectedDataFormat}/>
      }
      {
        tabValue === 1 &&  <VariantsPanel/>
      }
      {
        tabValue === 2 &&  <HistoryPanel/>
      }
      {
        tabValue === 3 &&  <Discussion />
      }
    </Box>
  )
}

export default SingleTermView