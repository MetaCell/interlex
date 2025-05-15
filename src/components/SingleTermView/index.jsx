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
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import CustomBreadcrumbs from "../common/CustomBreadcrumbs";
import ForkRightIcon from '@mui/icons-material/ForkRight';
import { vars } from "../../theme/variables";
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import OntologySearch from "./OntologySearch";
import ModeEditOutlineOutlinedIcon from '@mui/icons-material/ModeEditOutlineOutlined';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import CopyLinkComponent from "../common/CopyLinkComponent";
import BasicTabs from "../common/CustomTabs";
import CustomButton from "../common/CustomButton";
import CustomMenu from "./CustomMenu";
import React, { useState, useContext } from "react";
import OverView from "./OverView/OverView";
import HistoryPanel from "./History/HistoryPanel";
import VariantsPanel from "./Variants/VariantsPanel";
import RequestMergeChanges from "./RequestMergeChanges";
import {
  CreateNewFolderOutlined,
  DownloadOutlined,
  KeyboardArrowUp,
  KeyboardArrowDown,
  List,
  AccountTreeOutlined
} from "@mui/icons-material";
import Discussion from "./Discussion";
import { CodeIcon } from "../../Icons";
import { useQuery } from "../../helpers";
import CustomSingleSelect from "../common/CustomSingleSelect";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import CreateForkDialog from "./CreateForkDialog";
import TermDialog from "../TermEditor/TermDialog";
import { GlobalDataContext } from "../../contexts/DataContext";

const { gray200, brand700, gray600 } = vars;

const dataFormats = ['JSON-LD', 'Turtle', 'N3', 'OWL', 'CSV']

const SingleTermView = () => {
  const [open, setOpen] = React.useState(false);
  const actionRef = React.useRef(null);
  const anchorRef = React.useRef(null);
  const [dataFormatAnchorEl, setDataFormatAnchorEl] = React.useState(null);
  const [tabValue, setTabValue] = React.useState(0);
  const [isCodeViewVisible, setIsCodeViewVisible] = React.useState(false);
  const [toggleButtonValue, setToggleButtonValue] = useState('defaultView');
  const [selectedDataFormat, setSelectedDataFormat] = React.useState('JSON-LD');
  const [openRequestMergeDialog, setOpenRequestMergeDialog] = React.useState(false);
  const [editTermDialogOpen, setEditTermDialogOpen] = React.useState(false);
  const query = useQuery();
  const searchTerm = query.get('searchTerm');
  const openDataFormatMenu = Boolean(dataFormatAnchorEl);
	const [openForkDialog, setOpenForkDialog] = React.useState(false);
  const { storedSearchTerm } = useContext(GlobalDataContext);

    const handleForkDialogClose = () => {
      setOpenForkDialog(false);
    }

    const handleOpenForkDialog = () => {
      setOpenForkDialog(true);
    }
  const handleClickDataFormatMenu = (event) => {
    setDataFormatAnchorEl(event.currentTarget);
  };

  const handleOpenEditTermDialog = () => {
    setEditTermDialogOpen(true);
  };

  const handleCloseEditTermDialog = () => {
    setEditTermDialogOpen(false);
  }

  const handleCloseDataFormatMenu = () => {
    setDataFormatAnchorEl(null);
  };

  const handleDataFormatMenuItemClick = (value) => {
    setSelectedDataFormat(value);
    setDataFormatAnchorEl(null);
  };

  const handleOpenRequestMergeDialog = () => {
    setOpenRequestMergeDialog(true)
  };

  const handleCloseRequestMergeDialog = () => {
    setOpenRequestMergeDialog(false)
  }

  const onToggleButtonChange = (event, newValue) => {
    if (newValue) {
      setToggleButtonValue(newValue)
      if (newValue === 'codeView') {
        setIsCodeViewVisible(true)
      } else {
        setIsCodeViewVisible(false)
      }
    }
  }

  const handleChangeTabs = (event, newValue) => {
    setTabValue(newValue);
  };

  const CodeOrTreeIcon = () => {
    return isCodeViewVisible ? <CodeIcon /> : <AccountTreeOutlined />
  }

  const breadcrumbItems = [
    { label: '', href: '/', icon: HomeOutlinedIcon },
    { label: 'Term search', href: `/search?searchTerm=${searchTerm}` },
    { label: 'My organization 1', href: '#' },
    { label: 'ILX:0101901' },
  ];

  const isItFork = true;

  return (
    <>
      <Box display="flex" flexDirection="column">
        <Box p="1.5rem 5rem 0rem 5rem">
          <Grid container>
            <Grid container xs={12} lg={12} direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" spacing=".75rem">
                <CustomBreadcrumbs breadcrumbItems={breadcrumbItems} />
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
              <Stack direction="row" alignItems="center" gap={1}>
                <Typography variant="caption" sx={{ fontSize: '0.875rem', color: gray600 }}>Active Ontology:</Typography>
                <OntologySearch />
              </Stack>
            </Grid>
            <Grid container mt="1.75rem">
              <Grid item xs={12} lg={2}>
                <Stack direction="row" spacing=".75rem" alignItems="center">
                  <Typography color={gray600} fontSize="1.875rem" fontWeight={600}>
                    {storedSearchTerm.label}
                  </Typography>
                  <Chip label="Fork" variant="outlined" />
                </Stack>
              </Grid>
              <Grid display="flex" justifyContent='end' mt=".56rem" item xs={12} lg={10}>
                <Stack direction="row" spacing="1rem" alignItems="center">
                  <Button type="string" color="secondary" startIcon={<ModeEditOutlineOutlinedIcon />} onClick={handleOpenEditTermDialog}>
                    Suggest changes
                  </Button>
                  <Divider orientation="vertical" flexItem />
                  {isItFork ? (
                    <Button type="string" color="secondary" startIcon={<RateReviewOutlinedIcon />} onClick={handleOpenRequestMergeDialog}>
                      Request to merge changes to curated
                    </Button>
                  ) : (
                    <Button type="string" color="secondary" startIcon={<ForkRightIcon />} onClick={handleOpenForkDialog}>
                      Create fork
                    </Button>
                  )}
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
                <CopyLinkComponent url={`http://uri.interlex.org/base/${searchTerm}`} />
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
                        <CustomSingleSelect value={selectedDataFormat} onChange={(v) => setSelectedDataFormat(v)} options={dataFormats} />
                      </Stack>
                      <Divider sx={{ ml: '0.625rem', mr: '0.625rem', border: `1px solid ${gray200}` }} /></>)
                    }
                    <ToggleButtonGroup
                      value={toggleButtonValue}
                      exclusive
                      onChange={onToggleButtonChange}
                    >
                      <ToggleButton value={'defaultView'}>
                        <List />
                      </ToggleButton>
                      <ToggleButton value={'codeView'}>
                        <CodeOrTreeIcon />
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Box>
        {
          tabValue === 0 && <OverView searchTerm={searchTerm} isCodeViewVisible={isCodeViewVisible} selectedDataFormat={selectedDataFormat} />
        }
        {
          tabValue === 1 && <VariantsPanel />
        }
        {
          tabValue === 2 && <HistoryPanel />
        }
        {
          tabValue === 3 && <Discussion term={searchTerm} />
        }
      </Box>
      <RequestMergeChanges searchTerm={searchTerm} open={openRequestMergeDialog} handleClose={handleCloseRequestMergeDialog} />
      <TermDialog open={editTermDialogOpen} handleClose={handleCloseEditTermDialog} searchTerm={storedSearchTerm.label} />
			<CreateForkDialog
				open={openForkDialog}
				handleClose={handleForkDialogClose}
			/>
    </>
  )
}

export default SingleTermView