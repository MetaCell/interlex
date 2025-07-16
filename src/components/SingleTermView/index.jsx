import { useState, useEffect, useRef, useContext, useMemo, useCallback } from "react";
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
  MenuItem,
  CircularProgress
} from "@mui/material";
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import { useParams, useNavigate } from "react-router-dom";
import CustomBreadcrumbs from "../common/CustomBreadcrumbs";
import ForkRightIcon from '@mui/icons-material/ForkRight';
import { vars } from "../../theme/variables";
import OntologySearch from "./OntologySearch";
import ModeEditOutlineOutlinedIcon from '@mui/icons-material/ModeEditOutlineOutlined';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import CopyLinkComponent from "../common/CopyLinkComponent";
import BasicTabs from "../common/CustomTabs";
import CustomButton from "../common/CustomButton";
import CustomMenu from "./CustomMenu";
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
import CustomSingleSelect from "../common/CustomSingleSelect";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import CreateForkDialog from "./CreateForkDialog";
import TermDialog from "../TermEditor/TermDialog";
import { getSelectedTermLabel } from "../../api/endpoints/apiService";
import { GlobalDataContext } from "../../contexts/DataContext";
import { getRawData } from "../../api/endpoints";

const { gray200, gray600 } = vars;

const dataFormats = ['JSON-LD', 'Turtle', 'N3', 'OWL', 'CSV'];
const formatExtensions = {
  'JSON-LD': 'jsonld',
  'Turtle': 'ttl',
  'N3': 'n3',
  'OWL': 'owl',
  'CSV': 'csv'
};

const SingleTermView = () => {
  const { group, term, tab } = useParams();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const actionRef = useRef(null);
  const anchorRef = useRef(null);
  const [dataFormatAnchorEl, setDataFormatAnchorEl] = useState(null);
  const [isCodeViewVisible, setIsCodeViewVisible] = useState(false);
  const [toggleButtonValue, setToggleButtonValue] = useState('defaultView');
  const [selectedDataFormat, setSelectedDataFormat] = useState('JSON-LD');
  const [openRequestMergeDialog, setOpenRequestMergeDialog] = useState(false);
  const [editTermDialogOpen, setEditTermDialogOpen] = useState(false);
  const [openForkDialog, setOpenForkDialog] = useState(false);
  const [termData, setTermData] = useState(null);
  const [isLoadingTerm, setIsLoadingTerm] = useState(false);
  const [actualGroup, setActualGroup] = useState(group); // Track the actual group the data comes from
  const [isUsingFallback, setIsUsingFallback] = useState(false); // Track if we're using fallback data
  
  // Remove redundant query logic - use term from URL params directly
  const searchTerm = term;
  const openDataFormatMenu = Boolean(dataFormatAnchorEl);
  const { storedSearchTerm, updateStoredSearchTerm } = useContext(GlobalDataContext);

  // Tab mapping
  const tabMapping = useMemo(() => ({
    'overview': 0,
    'variants': 1,
    'history': 2,
    'discussions': 3
  }), []);

  const tabNames = useMemo(() => ['overview', 'variants', 'history', 'discussions'], []);
  const tabLabels = useMemo(() => ["Overview", "Variants", "Version history", "Discussions"], []);

  // Set initial tab value based on URL
  const [tabValue, setTabValue] = useState(() => {
    return tabMapping[tab] !== undefined ? tabMapping[tab] : 0;
  });

  // Memoize the displayed term label to prevent unnecessary re-renders
  const displayedTermLabel = useMemo(() => {
    return termData || storedSearchTerm || searchTerm.toUpperCase().replace("_", ":");
  }, [termData, storedSearchTerm, searchTerm]);

  // Memoize breadcrumb items to prevent unnecessary re-renders
  const breadcrumbItems = useMemo(() => [
    { label: '', href: '/', icon: HomeOutlinedIcon },
    { label: 'Term search', href: `/${group}/search?searchTerm=${storedSearchTerm}` },
    { label: group, href: '#' },
    { label: displayedTermLabel },
  ], [group, displayedTermLabel, storedSearchTerm]);

  // Optimize handlers with useCallback
  const handleChangeTabs = useCallback((event, newValue) => {
    setTabValue(newValue);
    const newTab = tabNames[newValue];
    navigate(`/${group}/${term}/${newTab}`, { replace: true });
  }, [navigate, group, term, tabNames]);

  const handleForkDialogClose = useCallback(() => {
    setOpenForkDialog(false);
  }, []);

  const handleOpenForkDialog = useCallback(() => {
    setOpenForkDialog(true);
  }, []);

  const handleClickDataFormatMenu = useCallback((event) => {
    setDataFormatAnchorEl(event.currentTarget);
  }, []);

  const handleOpenEditTermDialog = useCallback(() => {
    setEditTermDialogOpen(true);
  }, []);

  const handleCloseEditTermDialog = useCallback(() => {
    setEditTermDialogOpen(false);
  }, []);

  const handleCloseDataFormatMenu = useCallback(() => {
    setDataFormatAnchorEl(null);
  }, []);

  const handleOpenRequestMergeDialog = useCallback(() => {
    setOpenRequestMergeDialog(true);
  }, []);

  const handleCloseRequestMergeDialog = useCallback(() => {
    setOpenRequestMergeDialog(false);
  }, []);

  const onToggleButtonChange = useCallback((event, newValue) => {
    if (newValue) {
      setToggleButtonValue(newValue);
      setIsCodeViewVisible(newValue === 'codeView');
    }
  }, []);

  const downloadFormattedData = useCallback((dataFormat) => {
    getRawData(actualGroup, searchTerm, formatExtensions[dataFormat]).then(rawResponse => {
      const formattedData = JSON.stringify(rawResponse, null, 2);
      const blob = new Blob([formattedData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `data.${formatExtensions[dataFormat]}`;
      a.click();
      URL.revokeObjectURL(url);
    }).catch(error => {
      console.error('Error downloading data:', error);
    });
  }, [actualGroup, searchTerm]);

  const handleDataFormatMenuItemClick = useCallback((value) => {
    setSelectedDataFormat(value);
    setDataFormatAnchorEl(null);
    downloadFormattedData(value);
  }, [downloadFormattedData]);

  // Optimize data fetching with caching and prevent duplicate calls
  useEffect(() => {
    let isMounted = true;

    const fetchTermData = async () => {
      if (!searchTerm || !group) return;

      setIsLoadingTerm(true);
      try {
        const result = await getSelectedTermLabel(searchTerm, group);
        if (isMounted) {
          setTermData(result.label);
          setActualGroup(result.actualGroup);
          setIsUsingFallback(result.actualGroup !== group);
          if (result.label) {
            updateStoredSearchTerm(result.label);
          }
        }
      } catch (error) {
        console.error('Error fetching term data:', error);
      } finally {
        if (isMounted) {
          setIsLoadingTerm(false);
        }
      }
    };

    fetchTermData();

    return () => {
      isMounted = false;
    };
  }, [searchTerm, group, updateStoredSearchTerm]); // Added group to dependencies

  // Optimize tab URL synchronization
  useEffect(() => {
    const newTabValue = tabMapping[tab] !== undefined ? tabMapping[tab] : 0;
    
    if (newTabValue !== tabValue) {
      setTabValue(newTabValue);
    }
    
    // If no tab is specified in URL, redirect to overview
    if (!tab && group && term) {
      navigate(`/${group}/${term}/overview`, { replace: true });
    }
  }, [tab, tabMapping, navigate, group, term, tabValue]);

  const isItFork = actualGroup === 'base' ? false : true; // Use actualGroup instead of group

  // Memoize tab content to prevent unnecessary re-renders
  const tabContent = useMemo(() => {
    switch (tabValue) {
      case 0:
        return <OverView searchTerm={searchTerm} isCodeViewVisible={isCodeViewVisible} selectedDataFormat={selectedDataFormat} group={actualGroup} />;
      case 1:
        return <VariantsPanel />;
      case 2:
        return <HistoryPanel searchTerm={searchTerm} group={group} />;
      case 3:
        return <Discussion term={searchTerm} />;
      default:
        return <OverView searchTerm={searchTerm} isCodeViewVisible={isCodeViewVisible} selectedDataFormat={selectedDataFormat} group={actualGroup} />;
    }
  }, [tabValue, searchTerm, isCodeViewVisible, selectedDataFormat, actualGroup]);

  // Memoize the toggle button group for overview tab
  const toggleButtonGroup = useMemo(() => {
    if (tabValue !== 0) return null;
    
    return (
      <Box display="flex">
        {isCodeViewVisible && (
          <>
            <Stack direction="row" spacing=".5rem" alignItems="center">
              <Typography color={gray600} fontSize=".875rem" lineHeight="1.25rem">
                Format to visualize:
              </Typography>
              <CustomSingleSelect 
                value={selectedDataFormat} 
                onChange={(v) => setSelectedDataFormat(v)} 
                options={dataFormats} 
              />
            </Stack>
            <Divider sx={{ ml: '0.625rem', mr: '0.625rem', border: `1px solid ${gray200}` }} />
          </>
        )}
        <ToggleButtonGroup
          value={toggleButtonValue}
          exclusive
          onChange={onToggleButtonChange}
        >
          <ToggleButton value={'defaultView'}>
            <List />
          </ToggleButton>
          <ToggleButton value={'codeView'}>
            {isCodeViewVisible ? <CodeIcon /> : <AccountTreeOutlined />}
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
    );
  }, [tabValue, isCodeViewVisible, selectedDataFormat, toggleButtonValue, onToggleButtonChange]);

  return (
    <>
      <Box display="flex" flexDirection="column" sx={{ minWidth: "100%" }}>
        <Box p="1.5rem 5rem 0rem 5rem">
          <Grid container>
            <Grid container xs={12} lg={12} direction="row" alignItems="center" justifyContent="space-between">
              <CustomBreadcrumbs breadcrumbItems={breadcrumbItems} />
              <Stack direction="row" alignItems="center" gap={1}>
                <Typography variant="caption" sx={{ fontSize: '0.875rem', color: gray600 }}>Active Ontology:</Typography>
                <OntologySearch />
              </Stack>
            </Grid>
            <Grid container mt="1.75rem">
              <Grid item xs={12} lg={2}>
                <Stack direction="row" spacing=".75rem" alignItems="center">
                  <Typography color={gray600} fontSize="1.875rem" fontWeight={600}>
                    {isLoadingTerm ? (
                      <CircularProgress size={20} />
                    ) : (
                      displayedTermLabel
                    )}
                  </Typography>
                  {isItFork ? <Chip label="Fork" variant="outlined" /> : null}
                </Stack>
                {isUsingFallback && (
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'warning.main', 
                      fontSize: '0.875rem', 
                      fontStyle: 'italic',
                      mt: '0.5rem'
                    }}
                  >
                    Note: This term is not available in &quot;{group}&quot; group. Showing data from &quot;base&quot; group instead.
                  </Typography>
                )}
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
                <CopyLinkComponent url={`http://uri.interlex.org/${actualGroup}/${searchTerm}`} />
              </Grid>
              <Grid item xs={12} mt="2rem" display='flex' alignItems='center' justifyContent='space-between'>
                <BasicTabs tabValue={tabValue} handleChange={handleChangeTabs} tabs={tabLabels} />
                {toggleButtonGroup}
              </Grid>
            </Grid>
          </Grid>
        </Box>
        {tabContent}
      </Box>
      <RequestMergeChanges searchTerm={searchTerm} open={openRequestMergeDialog} handleClose={handleCloseRequestMergeDialog} />
      <TermDialog open={editTermDialogOpen} handleClose={handleCloseEditTermDialog} searchTerm={searchTerm} />
      <CreateForkDialog
        open={openForkDialog}
        handleClose={handleForkDialogClose}
      />
    </>
  )
}

export default SingleTermView
