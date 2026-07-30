import { useState, useEffect, useContext, useMemo, useCallback } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
  Menu,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar
} from "@mui/material";
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import { useParams, useNavigate, useLocation } from "react-router-dom";
import CustomBreadcrumbs from "../common/CustomBreadcrumbs";
import ForkRightIcon from '@mui/icons-material/ForkRight';
import { vars } from "../../theme/variables";
import OntologySearch from "./OntologySearch";
import ModeEditOutlineOutlinedIcon from '@mui/icons-material/ModeEditOutlineOutlined';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import CopyLinkComponent from "../common/CopyLinkComponent";
import BasicTabs from "../common/CustomTabs";
import CustomButton from "../common/CustomButton";
import OverView from "./OverView/OverView";
import HistoryPanel from "./History/HistoryPanel";
import VariantsPanel from "./Variants/VariantsPanel";
// TODO: Re-enable when merge request feature is implemented
import RequestMergeChanges from "./RequestMergeChanges";
import {
  DownloadOutlined,
  List,
  AccountTreeOutlined
} from "@mui/icons-material";
import ForkRightOutlinedIcon from '@mui/icons-material/ForkRightOutlined';
import FolderCopyOutlinedIcon from '@mui/icons-material/FolderCopyOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined';
import Discussion from "./Discussion";
import CellCardPanel from "../CellCards/CellCard/CellCardPanel";
import { ONTOLOGY_PARAM } from "../CellCards/config/gridConfig";
import { CodeIcon } from "../../Icons";
import CustomSingleSelect from "../common/CustomSingleSelect";
import CustomButtonGroup from "../common/CustomButtonGroup";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import CreateForkDialog from "./CreateForkDialog";
import TermDialog from "../TermEditor/TermDialog";
import FeatureNotAvailableDialog from "../common/FeatureNotAvailableDialog";
import { GlobalDataContext } from "../../contexts/DataContext";
import { getRawData } from "../../api/endpoints";
import { getVersions, addEntityToOntology, getOntologyTerms } from "../../api/endpoints/apiService";
import { reportApiError } from "../../api/apiErrorBus";
import ApiErrorDialog from "../common/ApiErrorDialog";
import { useTermData } from "../../hooks/useTermData";
import { useTermRecordAvailability } from "../../hooks/useTermRecordAvailability";

const { gray200, gray500, gray600, error700 } = vars;

// Pull the InterLex id (ilx_/tmp_) out of an arbitrary IRI/string for membership checks.
const extractIlxId = (value) => {
  const match = String(value || "").match(/(?:ilx|tmp)_\d+/i);
  return match ? match[0] : null;
};

const dataFormats = ['JSON-LD', 'Turtle', 'N3', 'OWL', 'CSV'];
const formatExtensions = {
  'JSON-LD': 'jsonld',
  'Turtle': 'ttl',
  'N3': 'n3',
  'OWL': 'owl',
  'CSV': 'csv'
};

// MIME type per export format so the downloaded file opens correctly.
const formatMimeTypes = {
  jsonld: 'application/ld+json',
  ttl: 'text/turtle',
  n3: 'text/n3',
  owl: 'application/rdf+xml',
  csv: 'text/csv'
};

// Build an informative download filename, e.g. "ilx_0101431-Brain.csv".
const buildDownloadFilename = (termId, label, ext) => {
  const slugify = (value) => String(value || '')
    .trim()
    .replace(/[^\w-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 60);
  const id = slugify(termId);
  const slug = slugify(label);
  const base = id && slug && slug.toLowerCase() !== id.toLowerCase()
    ? `${id}-${slug}`
    : (id || slug || 'term');
  return `${base}.${ext}`;
};

// Tab indices. Cell Card leads, per the design (Figma 9533:72028), which shifts every other
// tab by one — these are named so the shift is stated once rather than as bare numbers.
const CELL_CARD_TAB = 0;
const OVERVIEW_TAB = 1;

const SingleTermView = () => {
  const { group, term, tab, versionHash } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [dataFormatAnchorEl, setDataFormatAnchorEl] = useState(null);
  const [isCodeViewVisible, setIsCodeViewVisible] = useState(false);
  const [toggleButtonValue, setToggleButtonValue] = useState('defaultView');
  const [selectedDataFormat, setSelectedDataFormat] = useState('JSON-LD');
  const [openRequestMergeDialog, setOpenRequestMergeDialog] = useState(false);
  const [editTermDialogOpen, setEditTermDialogOpen] = useState(false);
  const [openForkDialog, setOpenForkDialog] = useState(false);
  const [featureNotAvailableDialog, setFeatureNotAvailableDialog] = useState(false);

  // Use the optimized term data hook instead of manual fetching
  const { termData, actualGroup, graphId, isUsingFallback, isLoadingTerm } = useTermData(term, group);

  const [versionsData, setVersionsData] = useState(null);
  const [versionsLoading, setVersionsLoading] = useState(true);
  const [versionsError, setVersionsError] = useState(null);
  const clearVersionsError = useCallback(() => setVersionsError(null), []);

  // Remove redundant query logic - use term from URL params directly
  const searchTerm = term;
  const openDataFormatMenu = Boolean(dataFormatAnchorEl);
  const { storedSearchTerm, updateStoredSearchTerm, user, activeOntology, setOntologyData } = useContext(GlobalDataContext);
  const [ontologySnackbar, setOntologySnackbar] = useState(null); // { severity, message }
  // Label resolved by the Cell Card from the ontology graph. The term API cannot supply it for a
  // precision cell (npokb ids 404), so without this the H1 would read "NPOKB:1067".
  //
  // Kept as { term, label } and read only when the term still matches, rather than being cleared
  // by an effect on `term`: navigating between cells resolves the new cell synchronously (see
  // useCellTerm), so the card reports its label in the *same* commit that a clearing effect would
  // run in — and effects run child-before-parent, so the clear would land last and win.
  const [cellLabel, setCellLabel] = useState(null);

  // Whether the term currently in view is a member of the active ontology.
  const hasActiveOntology = !!activeOntology;
  const isTermInActiveOntology = useMemo(() => {
    const termId = extractIlxId(term);
    const ontologyTerms = activeOntology?.terms || [];
    return !!termId && ontologyTerms.some((id) => extractIlxId(id) === termId);
  }, [term, activeOntology]);

  // Is this term a cell type, and therefore does the Cell Card tab apply?
  //
  // This has to be answered *synchronously*, because it decides the default tab in the mount
  // effect below — waiting on the ontology load (a ~16MB fetch) would block every term page.
  // Two cheap signals, both available from the URL alone:
  //   - the term slug is an `npokb_*` id: all 161 Precision cells are npokb-only today;
  //   - an `?ontology=` param is present: the user arrived from an ontology grid.
  // Revisit once Precision cells are ingested with ILX ids — at that point the slug shape stops
  // being a reliable signal and the term's own @type should decide.
  const contextOntology = new URLSearchParams(location.search).get(ONTOLOGY_PARAM);

  const handleCellLabel = useCallback((label) => setCellLabel({ term, label }), [term]);
  const resolvedCellLabel = cellLabel?.term === term ? cellLabel.label : null;

  const isCellTerm = useMemo(
    () => /^npokb[_:]/i.test(term || "") || Boolean(contextOntology),
    [term, contextOntology]
  );
  // Whether the InterLex term API can address this term at all. For a cell arriving as an
  // external id (`npokb_991`) that is not a property of the slug but of the data: the id is
  // addressable once curation maps it to a record, and the backend is the only one who knows.
  // `undefined` until it answers — see useTermRecordAvailability. Only cell terms are asked;
  // every other term keeps the tabs it has today, probe or no probe.
  const termRecordAvailable = useTermRecordAvailability(term, group, isCellTerm);
  const isTermRecordPending = isCellTerm && termRecordAvailable === undefined;
  const DEFAULT_TAB_INDEX = isCellTerm ? CELL_CARD_TAB : OVERVIEW_TAB;

  // Cell Card is the first tab, per the design, so `overview` is index 1 and every
  // hardcoded index below shifts with it. OVERVIEW_TAB names that so the code says which
  // tab it means rather than repeating a bare 1.
  const tabMapping = useMemo(() => ({
    'cell-card': 0,
    'overview': 1,
    'variants': 2,
    'history': 3,
    'discussions': 4
  }), []);

  const tabNames = useMemo(() => ['cell-card', 'overview', 'variants', 'history', 'discussions'], []);
  const tabLabels = useMemo(() => {
    // A precision cell's id is not mapped to an InterLex record yet, so the term API — and
    // therefore every tab that reads it — has nothing to serve for it. Disable those rather than
    // offer dead tabs; they light up on their own once the mapping exists. Pending counts as
    // disabled, which is what the bar already shows, so the common case never flickers.
    const termTabsDisabled = isCellTerm && termRecordAvailable !== true;
    return [
      { label: "Cell Card", disabled: !isCellTerm },
      { label: "Overview", disabled: termTabsDisabled },
      { label: "Variants", disabled: termTabsDisabled },
      { label: "Version history", disabled: termTabsDisabled },
      { label: "Discussions", disabled: termTabsDisabled },
    ];
  }, [isCellTerm, termRecordAvailable]);

  // Set initial tab value based on URL
  const [tabValue, setTabValue] = useState(() => {
    return tabMapping[tab] !== undefined ? tabMapping[tab] : DEFAULT_TAB_INDEX;
  });

  // Memoize the displayed term label to prevent unnecessary re-renders
  const displayedTermLabel = useMemo(() => {
    return termData || resolvedCellLabel || storedSearchTerm || searchTerm.toUpperCase().replace("_", ":");
  }, [termData, resolvedCellLabel, storedSearchTerm, searchTerm]);

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
    // Carry the query string across: the Cell Card's context ontology lives in `?ontology=`,
    // and dropping it here would blank the card whenever the user came back to this tab.
    navigate(`/${group}/${term}/${newTab}${location.search}`, { replace: true });
  }, [navigate, group, term, tabNames, location.search]);

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

  // TODO: Re-enable when merge request feature is implemented
  // const handleOpenRequestMergeDialog = useCallback(() => {
  //   setOpenRequestMergeDialog(true);
  // }, []);

  // TODO: Re-enable when merge request feature is implemented
  const handleCloseRequestMergeDialog = useCallback(() => {
    setOpenRequestMergeDialog(false);
  }, []);

  const handleOpenFeatureNotAvailableDialog = useCallback(() => {
    setFeatureNotAvailableDialog(true);
  }, []);

  const handleCloseFeatureNotAvailableDialog = useCallback(() => {
    setFeatureNotAvailableDialog(false);
  }, []);

  const onToggleButtonChange = useCallback((event, newValue) => {
    if (newValue) {
      setToggleButtonValue(newValue);
      setIsCodeViewVisible(newValue === 'codeView');
    }
  }, []);

  const downloadFormattedData = useCallback((dataFormat) => {
    const ext = formatExtensions[dataFormat];
    getRawData(actualGroup, searchTerm, ext).then(rawResponse => {
      if (rawResponse === undefined || rawResponse === null) {
        console.error(`No ${dataFormat} data returned for ${searchTerm}`);
        return;
      }
      // Text formats (CSV/Turtle/N3/OWL) come back as strings and must be
      // written verbatim; only object responses (JSON-LD) are stringified.
      const formattedData = typeof rawResponse === 'string'
        ? rawResponse
        : JSON.stringify(rawResponse, null, 2);
      // Guard against the backend returning the SPA shell instead of data
      // (e.g. ids it doesn't serve in the requested format).
      if (typeof formattedData === 'string' && /^\s*<(?:!doctype|html)\b/i.test(formattedData)) {
        console.error(`No ${dataFormat} representation available for ${searchTerm}`);
        return;
      }
      const mime = formatMimeTypes[ext] || 'text/plain';
      const blob = new Blob([formattedData], { type: `${mime};charset=utf-8` });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = buildDownloadFilename(searchTerm, displayedTermLabel, ext);
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }).catch(error => {
      console.error('Error downloading data:', error);
    });
  }, [actualGroup, searchTerm, displayedTermLabel]);

  const handleDataFormatMenuItemClick = useCallback((value) => {
    setSelectedDataFormat(value);
    setDataFormatAnchorEl(null);
    downloadFormattedData(value);
  }, [downloadFormattedData]);

  // Update stored search term when term data is available
  useEffect(() => {
    if (termData) {
      updateStoredSearchTerm(termData);
    }
  }, [termData, updateStoredSearchTerm]);

  useEffect(() => {
    if (!actualGroup || !searchTerm) return;
    let active = true;
    setVersionsLoading(true);
    setVersionsError(null);
    getVersions(actualGroup, searchTerm)
      .then(data => { if (active) { setVersionsData(data); setVersionsLoading(false); } })
      .catch(err => { if (active) { setVersionsError(err); setVersionsLoading(false); } });
    return () => { active = false; };
  }, [actualGroup, searchTerm]);

  // Optimize tab URL synchronization
  useEffect(() => {
    // A URL can name a tab this term has no data for — `/cell-card` on a term that is not a cell
    // type, or a term tab on a precision cell. Those tabs are disabled in the bar, so honouring
    // the URL would mount a panel that can only render an empty state (and, for the Cell Card,
    // pay a ~16MB fetch to find that out) while the Tabs bar shows nothing selected. Fall back to
    // the default tab, which is always enabled: Cell Card for a cell type, Overview otherwise.
    //
    // Not while the record probe is in flight, though: the disabled set is not known yet, and the
    // fallback rewrites the URL with `replace: true`. Judging /overview now would send a deep
    // link to a mapped cell back to /cell-card with no way back.
    if (isTermRecordPending) return;

    const requested = tabMapping[tab];
    const newTabValue =
      requested !== undefined && !tabLabels[requested]?.disabled ? requested : DEFAULT_TAB_INDEX;

    if (newTabValue !== tabValue) {
      setTabValue(newTabValue);
    }

    // Rewrite the URL when it does not name the tab in view: no tab at all, or one that resolved
    // elsewhere. Skipped on the version route, which has no `tab` segment to write into.
    // Preserves the query string for the same reason handleChangeTabs does.
    if (!versionHash && group && term && tab !== tabNames[newTabValue]) {
      navigate(`/${group}/${term}/${tabNames[newTabValue]}${location.search}`, { replace: true });
    }
  }, [tab, tabMapping, tabLabels, navigate, group, term, tabValue, versionHash, tabNames, DEFAULT_TAB_INDEX, location.search, isTermRecordPending]);

  const isItFork = actualGroup === 'base' ? false : true; // Use actualGroup instead of group

  // Memoize tab content to prevent unnecessary re-renders
  const tabContent = useMemo(() => {
    // Every tab but the Cell Card reads the InterLex term API, and whether it can answer for this
    // cell is still being probed. Mounting one now would fire a request that 404s — raising the
    // shared error dialog over a tab we are a moment away from redirecting off. The Cell Card
    // reads the ontology graph instead, so it starts its (much heavier) load straight away.
    if (isTermRecordPending && tabValue !== CELL_CARD_TAB) {
      return (
        <Box display="flex" justifyContent="center" p="3rem">
          <CircularProgress size={24} />
        </Box>
      );
    }

    switch (tabValue) {
      case CELL_CARD_TAB:
        return <CellCardPanel term={searchTerm} group={group} onTermLabel={handleCellLabel} />;
      case OVERVIEW_TAB:
        return <OverView searchTerm={searchTerm} isCodeViewVisible={isCodeViewVisible} selectedDataFormat={selectedDataFormat} group={actualGroup} versionHash={versionHash} />;
      case 2:
        return <VariantsPanel searchTerm={searchTerm} group={actualGroup} versionsData={versionsData} versionsLoading={versionsLoading} versionsError={versionsError} onDismissError={clearVersionsError} />;
      case 3:
        return <HistoryPanel searchTerm={searchTerm} group={actualGroup} versionsData={versionsData} versionsLoading={versionsLoading} />;
      case 4:
        return <Discussion term={searchTerm} />;
      default:
        return <OverView searchTerm={searchTerm} isCodeViewVisible={isCodeViewVisible} selectedDataFormat={selectedDataFormat} group={actualGroup} versionHash={versionHash} />;
    }
  }, [tabValue, searchTerm, group, handleCellLabel, isCodeViewVisible, selectedDataFormat, actualGroup, versionHash, versionsData, versionsLoading, versionsError, clearVersionsError, isTermRecordPending]);

  // Memoize the toggle button group for overview tab
  const toggleButtonGroup = useMemo(() => {
    // Overview owns the raw-data view; before Cell Card took index 0 this read `!== 0`, which
    // would now follow the Cell Card instead.
    if (tabValue !== OVERVIEW_TAB) return null;

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

  const handleAddToActiveOntology = useCallback(async () => {
    if (!activeOntology || !actualGroup || !searchTerm) return;
    const ontologyUri = activeOntology.description || activeOntology.url;
    const result = await addEntityToOntology({ group: actualGroup, ontologyUri, termId: searchTerm });
    if (result.success) {
      setOntologySnackbar({ severity: 'success', message: `Term added to "${activeOntology.label}".` });
      getOntologyTerms(ontologyUri)
        .then(terms => setOntologyData({ ...activeOntology, terms }))
        .catch(() => {});
    } else {
      reportApiError({
        context: `Add term to ontology "${activeOntology.label}"`,
        url: result.url || ontologyUri,
        status: result.status,
        message: result.body || result.error || 'Request failed with no body.',
      });
    }
  }, [activeOntology, actualGroup, searchTerm, setOntologyData]);

  const handleCreateFork = () => {
    handleOpenFeatureNotAvailableDialog();
  };

  const handleAddToAnotherOntology = () => {
    handleOpenFeatureNotAvailableDialog();
  };

  const handleRemoveFromActiveOntology = () => {
    handleOpenFeatureNotAvailableDialog();
  };

  const menuOptions = [
    {
      icon: <CreateNewFolderOutlinedIcon fontSize="small" />,
      label: "Add term to active ontology",
      action: handleAddToActiveOntology,
      // Can only add when an ontology is active and the term isn't already in it.
      disabled: !hasActiveOntology || isTermInActiveOntology
    },
    ...(user ? [{
      icon: <ForkRightOutlinedIcon fontSize="small" />,
      label: "Create fork",
      action: handleCreateFork
    }] : []),
    {
      icon: <FolderCopyOutlinedIcon fontSize="small" />,
      label: "Add term to another ontology",
      action: handleAddToAnotherOntology
    },
    {
      icon: <DeleteOutlineOutlinedIcon fontSize="small" sx={{ color: error700 }} />,
      label: "Remove from active ontology",
      action: handleRemoveFromActiveOntology,
      // Can only remove when an ontology is active and the term is in it.
      disabled: !hasActiveOntology || !isTermInActiveOntology
    }
  ]

  return (
    <>
      <Box display="flex" flexDirection="column" sx={{ minWidth: "100%" }}>
        <Box p="1.5rem 5rem 0rem 5rem">
          <Grid container>
            <Grid container xs={12} lg={12} direction="row" alignItems="center" justifyContent="space-between">
              <CustomBreadcrumbs breadcrumbItems={breadcrumbItems} />
              <Stack direction="row" alignItems="center" gap={1}>
                <Typography variant="caption" sx={{ fontSize: '0.875rem', color: gray600 }}>Active Ontology:</Typography>
                <OntologySearch userGroupname={user?.groupname} />
              </Stack>
            </Grid>
            <Grid container mt="1.75rem">
              <Grid item xs={12} lg={2}>
                <Stack direction="row" spacing=".75rem" alignItems="center">
                  <Typography color={gray600} fontSize="1.875rem" fontWeight={600}>
                    {/* The label is already known from the search (storedSearchTerm),
                        so show it immediately and only fall back to a spinner on a
                        cold direct load where we have nothing to display yet. */}
                    {isLoadingTerm && !termData && !storedSearchTerm ? (
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
                    <Button type="string" color="secondary" startIcon={<RateReviewOutlinedIcon />} onClick={handleOpenFeatureNotAvailableDialog}>
                      Request to merge changes to curated
                    </Button>
                  ) : user ? (
                    <Button type="string" color="secondary" startIcon={<ForkRightIcon />} onClick={handleOpenForkDialog}>
                      Create fork
                    </Button>
                  ) : null}

                  <CustomButtonGroup
                    variant="outlined"
                    options={menuOptions}
                    sx={{ 
                      minWidth: "18.75rem",
                      "& .MuiList-root > :last-child": {
                        borderTop: `1px solid ${gray200}`,
                        color: error700
                      }
                    }}
                  />

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
                <Stack direction="row" spacing="1rem" alignItems="center">
                  <CopyLinkComponent url={`http://uri.interlex.org/${actualGroup}/${searchTerm}`} />
                  {graphId && (
                    <Typography fontSize=".875rem" color={gray500}>
                      Graph ID: {graphId}
                    </Typography>
                  )}
                </Stack>
              </Grid>
              <Grid item xs={12} mt="2rem" display='flex' alignItems='center' justifyContent='space-between'>
                <BasicTabs tabValue={tabValue} handleChange={handleChangeTabs} tabs={tabLabels} />
                {toggleButtonGroup}
              </Grid>
            </Grid>
          </Grid>
        </Box>
        {versionHash && (
          <Box px="5rem" pt="1.5rem">
            <Alert severity="info">
              Viewing a historical version of this term (identity graph <code>{versionHash}</code>). This snapshot is read-only.
            </Alert>
          </Box>
        )}
        {tabContent}
      </Box>
      {/* TODO: Re-enable when merge request feature is implemented */}
      <RequestMergeChanges searchTerm={searchTerm} open={openRequestMergeDialog} handleClose={handleCloseRequestMergeDialog} />
      <TermDialog open={editTermDialogOpen} handleClose={handleCloseEditTermDialog} searchTerm={searchTerm} group={actualGroup} />
      <CreateForkDialog
        open={openForkDialog}
        handleClose={handleForkDialogClose}
        user={user}
        searchTerm={searchTerm}
        termLabel={displayedTermLabel}
        group={actualGroup}
      />
      
      {/* Feature Not Available Dialog */}
      <FeatureNotAvailableDialog
        open={featureNotAvailableDialog}
        onClose={handleCloseFeatureNotAvailableDialog}
      />
      <ApiErrorDialog />
      <Snackbar
        open={!!ontologySnackbar}
        autoHideDuration={4000}
        onClose={() => setOntologySnackbar(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setOntologySnackbar(null)} severity={ontologySnackbar?.severity} sx={{ width: '100%' }}>
          {ontologySnackbar?.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default SingleTermView
