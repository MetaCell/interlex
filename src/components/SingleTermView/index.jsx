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
  Link,
  Skeleton,
  Snackbar
} from "@mui/material";
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import { useParams, useNavigate, useLocation } from "react-router-dom";
import CustomBreadcrumbs from "../common/CustomBreadcrumbs";
import CommunityHubLink from "../common/CommunityHubLink";
import GridViewLink from "../common/GridViewLink";
import ForkRightIcon from '@mui/icons-material/ForkRight';
import { vars } from "../../theme/variables";
import OntologySearch from "./OntologySearch";
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import CopyLinkComponent from "../common/CopyLinkComponent";
import BasicTabs from "../common/CustomTabs";
import CustomButton from "../common/CustomButton";
import OverView from "./OverView/OverView";
import HistoryPanel from "./History/HistoryPanel";
import VariantsPanel from "./Variants/VariantsPanel";
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
import {
  ONTOLOGY_CATALOG,
  isIlxTermSlug,
  ontologyForTermSlug,
  ontologyPath,
  termPath,
} from "../CellCards/config/gridConfig";
import { useContextTerm } from "../../hooks/useContextOntology";
import { CodeIcon } from "../../Icons";
import CustomSingleSelect from "../common/CustomSingleSelect";
import CustomButtonGroup from "../common/CustomButtonGroup";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import CreateForkDialog from "./CreateForkDialog";
import TermEditActions from "./TermEditActions";
import FeatureNotAvailableDialog from "../common/FeatureNotAvailableDialog";
import { GlobalDataContext } from "../../contexts/DataContext";
import { EditSessionProvider } from "../../contexts/EditSessionContext";
import { getRawData } from "../../api/endpoints";
import { getVersions, addEntityToOntology, getOntologyTerms } from "../../api/endpoints/apiService";
import { reportApiError } from "../../api/apiErrorBus";
import ApiErrorDialog from "../common/ApiErrorDialog";
import { useTermData } from "../../hooks/useTermData";
import { useTermRecordAvailability } from "../../hooks/useTermRecordAvailability";

const { gray200, gray500, gray600, error700 } = vars;

// Groups that own a curated ontology (per ONTOLOGY_CATALOG) are first-class sources in their own
// right, same as base — not a fork of it. Only a group outside this set is actually a fork.
const CURATED_GROUPS = new Set(["base", ...Object.values(ONTOLOGY_CATALOG).map((entry) => entry.org)]);

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

// Can the URL select this tab? Disabled means "applies here, but has nothing to serve yet";
// hidden means "does not apply to this term at all". Neither can be navigated to.
const isTabSelectable = (tab) => Boolean(tab) && !tab.disabled && !tab.hidden;

const SingleTermView = () => {
  const { group, term, tab, versionHash, ontologySlug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [dataFormatAnchorEl, setDataFormatAnchorEl] = useState(null);
  const [isCodeViewVisible, setIsCodeViewVisible] = useState(false);
  const [toggleButtonValue, setToggleButtonValue] = useState('defaultView');
  const [selectedDataFormat, setSelectedDataFormat] = useState('JSON-LD');
  const [openRequestMergeDialog, setOpenRequestMergeDialog] = useState(false);
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

  // The term as the context ontology describes it. The term API can supply neither label nor IRI
  // for a precision cell (npokb ids 404), so without this the H1 would read "NPOKB:1067".
  const {
    cell: contextCell,
    ontology: contextOntologyData,
    loading: contextLoading,
  } = useContextTerm(term);

  // Whether the term currently in view is a member of the active ontology.
  const hasActiveOntology = !!activeOntology;
  const isTermInActiveOntology = useMemo(() => {
    const termId = extractIlxId(term);
    const ontologyTerms = activeOntology?.terms || [];
    return !!termId && ontologyTerms.some((id) => extractIlxId(id) === termId);
  }, [term, activeOntology]);

  // The ontology this term is being read inside: the one the path names
  // (`/{org}/ontology/{slug}/{term}`, written by the grid), or — for a term reached from search —
  // the catalogued ontology claiming the slug's prefix. Answered from the URL alone because it
  // decides whether the Cell Card tab applies, and so the default tab, which cannot wait on a
  // ~16MB load. Deliberately not the resolved `contextCell`: that lands later and would move the
  // default tab under a user already reading one.
  const contextEntry = useMemo(
    () => ONTOLOGY_CATALOG[ontologySlug] || ONTOLOGY_CATALOG[ontologyForTermSlug(term)] || null,
    [ontologySlug, term]
  );

  const resolvedCellLabel = contextCell?.label || null;

  const isCellTerm = Boolean(contextEntry);

  // The URL that names this term, which depends on what kind of term it is:
  //   - an `ilx_*` / `tmp_*` slug is an InterLex record, addressed by group
  //     (`uri.interlex.org/{group}/ilx_0101431`);
  //   - a cell is named by its own IRI, which only the context ontology can give: the CURIE prefix
  //     expanded through that file's @context. Until it arrives there is no link, rather than a
  //     group path that names nothing — an unmapped external id 404s under every group.
  const termIdentityUrl = useMemo(() => {
    const groupUrl = `http://uri.interlex.org/${actualGroup}/${searchTerm}`;
    if (isIlxTermSlug(searchTerm)) return groupUrl;
    if (contextCell) return contextCell.iri || groupUrl;
    return isCellTerm ? "" : groupUrl;
  }, [searchTerm, actualGroup, contextCell, isCellTerm]);

  // Whether the InterLex term API can address this term at all. For a cell arriving as an
  // external id (`npokb_991`) that is not a property of the slug but of the data: the id is
  // addressable once curation maps it to a record, and the backend is the only one who knows.
  // `undefined` until it answers — see useTermRecordAvailability. Only cell terms are asked;
  // every other term keeps the tabs it has today, probe or no probe.
  const termRecordAvailable = useTermRecordAvailability(term, group, isCellTerm);
  const isTermRecordPending = isCellTerm && termRecordAvailable === undefined;
  // Same condition OverView applies to pick its source, so the page cannot say "read-only, from the
  // ontology" over an Overview that has gone back to the (editable) InterLex record.
  const servedByOntology = Boolean(contextCell) && termRecordAvailable !== true;
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
      // Hidden, not disabled: a term that is not a cell type has no Cell Card to offer and never
      // will, so the bar should read as a plain term page rather than advertise a dead tab. The
      // term tabs above are the other case — they apply, they just have no data yet.
      { label: "Cell Card", hidden: !isCellTerm },
      // Overview is the one term tab with a second source: the context ontology's own record. Its
      // pending state counts as *not* disabled, unlike the probe above — the ontology takes seconds
      // to load, and the sync effect below would spend them redirecting a deep link to /overview
      // away. The other three read endpoints that answer only for an InterLex record.
      { label: "Overview", disabled: termTabsDisabled && !contextCell && !contextLoading },
      { label: "Variants", disabled: termTabsDisabled },
      { label: "Version history", disabled: termTabsDisabled },
      { label: "Discussions", disabled: termTabsDisabled },
    ];
  }, [isCellTerm, termRecordAvailable, contextCell, contextLoading]);

  // Set initial tab value based on URL
  const [tabValue, setTabValue] = useState(() => {
    const requested = tabMapping[tab];
    // `/cell-card` on a term that is not a cell type: that tab is not rendered at all, and a
    // value with no Tab behind it leaves the bar with nothing selected — plus an invalid-value
    // warning from MUI — until the effect below rewrites the URL. The disabled cases are fine to
    // select: they still exist in the bar.
    if (requested === undefined || (requested === CELL_CARD_TAB && !isCellTerm)) return DEFAULT_TAB_INDEX;
    return requested;
  });

  // Memoize the displayed term label to prevent unnecessary re-renders
  const displayedTermLabel = useMemo(() => {
    return termData || resolvedCellLabel || storedSearchTerm || searchTerm.toUpperCase().replace("_", ":");
  }, [termData, resolvedCellLabel, storedSearchTerm, searchTerm]);

  // Memoize breadcrumb items to prevent unnecessary re-renders
  const breadcrumbItems = useMemo(() => {
    // Read inside an ontology: retrace the trail the user arrived by, which is the chain the
    // ontology's own pages show (OntologyHeader) with this term appended. The ontology crumb is
    // built from the catalog entry, not from `group`, so a cell opened under another group still
    // points at the one page that ontology has.
    const trail = contextEntry
      ? [
        { label: '', href: '/', icon: HomeOutlinedIcon },
        { label: contextEntry.community, href: `/${contextEntry.org}` },
        {
          label: contextOntologyData?.meta?.title || contextEntry.label,
          href: ontologyPath(contextEntry),
        },
        { label: displayedTermLabel },
      ]
      : [
        { label: '', href: '/', icon: HomeOutlinedIcon },
        { label: 'Term search', href: `/${group}/search?searchTerm=${storedSearchTerm}` },
        { label: group, href: '#' },
        { label: displayedTermLabel },
      ];

    // A variant is a snapshot *of* the term, reached through its Variants tab, so the trail
    // continues past the term rather than ending on it: the term crumb becomes the way back to the
    // term, then the tab it was opened from, then the variant itself.
    if (!versionHash) return trail;
    const termCrumb = trail[trail.length - 1];
    return [
      ...trail.slice(0, -1),
      { ...termCrumb, href: termPath(group, contextEntry?.slug, term, tabNames[OVERVIEW_TAB]) },
      { label: 'Variants', href: termPath(group, contextEntry?.slug, term, 'variants') },
      { label: versionHash },
    ];
  }, [group, term, displayedTermLabel, storedSearchTerm, contextEntry, contextOntologyData, versionHash, tabNames]);

  // Optimize handlers with useCallback
  const handleChangeTabs = useCallback((event, newValue) => {
    setTabValue(newValue);
    const newTab = tabNames[newValue];
    // A term read inside an ontology stays under that ontology's path, which is where the Cell Card
    // reads its context from. Built from the resolved context rather than from the current path, so
    // a term that arrived from search (context claimed by its prefix) names its ontology from here
    // on and the link a user copies off the page carries it.
    navigate(`${termPath(group, contextEntry?.slug, term, newTab)}${location.search}`, { replace: true });
  }, [navigate, group, contextEntry, term, tabNames, location.search]);

  const handleForkDialogClose = useCallback(() => {
    setOpenForkDialog(false);
  }, []);

  const handleOpenForkDialog = useCallback(() => {
    setOpenForkDialog(true);
  }, []);

  const handleClickDataFormatMenu = useCallback((event) => {
    setDataFormatAnchorEl(event.currentTarget);
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
    // type, or a term tab on a precision cell. The bar hides the former and disables the latter,
    // so honouring the URL would mount a panel that can only render an empty state (and, for the
    // Cell Card, pay a ~16MB fetch to find that out) while the Tabs bar shows nothing selected.
    // Fall back to the default tab, which is always selectable: Cell Card for a cell type,
    // Overview otherwise.
    //
    // Not while the record probe is in flight, though: the disabled set is not known yet, and the
    // fallback rewrites the URL with `replace: true`. Judging /overview now would send a deep
    // link to a mapped cell back to /cell-card with no way back.
    if (isTermRecordPending) return;

    const requested = tabMapping[tab];
    const newTabValue = isTabSelectable(tabLabels[requested]) ? requested : DEFAULT_TAB_INDEX;

    if (newTabValue !== tabValue) {
      setTabValue(newTabValue);
    }

    // Rewrite the URL when it does not name the tab in view: no tab at all, or one that resolved
    // elsewhere. Skipped on the version route, which has no `tab` segment to write into.
    // Keeps the ontology path and the query string for the same reason handleChangeTabs does.
    if (!versionHash && group && term && tab !== tabNames[newTabValue]) {
      navigate(`${termPath(group, contextEntry?.slug, term, tabNames[newTabValue])}${location.search}`, { replace: true });
    }
  }, [tab, tabMapping, tabLabels, navigate, group, contextEntry, term, tabValue, versionHash, tabNames, DEFAULT_TAB_INDEX, location.search, isTermRecordPending]);

  const isItFork = !CURATED_GROUPS.has(actualGroup);

  // A fork shares its term id with the record it forked from, so the curated original is the same
  // slug read under a curated group: the ontology's own org when the slug belongs to a catalogued
  // ontology, otherwise base — the group that owns every other InterLex record.
  const curatedGroup = contextEntry?.org || "base";
  const curatedTermUrl = `http://uri.interlex.org/${curatedGroup}/${searchTerm}`;
  const curatedTermPath = `${termPath(curatedGroup, contextEntry?.slug, searchTerm, tabNames[tabValue])}${location.search}`;

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
        return <CellCardPanel term={searchTerm} group={group} />;
      case OVERVIEW_TAB:
        return <OverView searchTerm={searchTerm} isCodeViewVisible={isCodeViewVisible && !servedByOntology} selectedDataFormat={selectedDataFormat} group={actualGroup} versionHash={versionHash} />;
      case 2:
        return <VariantsPanel searchTerm={searchTerm} group={actualGroup} versionsData={versionsData} versionsLoading={versionsLoading} versionsError={versionsError} onDismissError={clearVersionsError} />;
      case 3:
        return <HistoryPanel searchTerm={searchTerm} group={actualGroup} versionsData={versionsData} versionsLoading={versionsLoading} />;
      case 4:
        return <Discussion term={searchTerm} />;
      default:
        return <OverView searchTerm={searchTerm} isCodeViewVisible={isCodeViewVisible && !servedByOntology} selectedDataFormat={selectedDataFormat} group={actualGroup} versionHash={versionHash} />;
    }
  }, [tabValue, searchTerm, group, servedByOntology, isCodeViewVisible, selectedDataFormat, actualGroup, versionHash, versionsData, versionsLoading, versionsError, clearVersionsError, isTermRecordPending]);

  // Memoize the toggle button group for overview tab
  const toggleButtonGroup = useMemo(() => {
    // Overview owns the raw-data view; before Cell Card took index 0 this read `!== 0`, which
    // would now follow the Cell Card instead.
    //
    // Nothing to offer for a term read from the context ontology: the raw view downloads that one
    // term's document, and its source is a node inside the ontology file, not a document.
    if (tabValue !== OVERVIEW_TAB || servedByOntology) return null;

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
  }, [tabValue, servedByOntology, isCodeViewVisible, selectedDataFormat, toggleButtonValue, onToggleButtonChange]);

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
    <EditSessionProvider group={actualGroup} searchTerm={searchTerm} disabled={!!versionHash}>
      <Box display="flex" flexDirection="column" sx={{ minWidth: "100%" }}>
        <Box p="1.5rem 5rem 0rem 5rem">
          <Grid container>
            <Grid container xs={12} lg={12} direction="row" alignItems="center" justifyContent="space-between">
              <CustomBreadcrumbs breadcrumbItems={breadcrumbItems} />
              <Stack direction="row" alignItems="center" gap={1}>
                {/* The context ontology's two ways out, in the design's order: back to its grid,
                    then off to its community. Grouped on `contextEntry` because §4.2 omits both
                    entirely without a context — and the divider with them, since it is what
                    separates them from the active-ontology selector. */}
                {contextEntry && (
                  <>
                    <GridViewLink to={ontologyPath(contextEntry)} />
                    <CommunityHubLink href={contextOntologyData?.meta?.communityLink} />
                    <Divider orientation="vertical" flexItem />
                  </>
                )}
                <Typography variant="caption" sx={{ fontSize: '0.875rem', color: gray600 }}>Active Ontology:</Typography>
                <OntologySearch userGroupname={user?.groupname} />
              </Stack>
            </Grid>
            <Grid container mt="1.75rem">
              <Grid item xs={12} lg="auto">
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
                <Stack direction="row" spacing="1rem" alignItems="center" mt=".5rem">
                  {termIdentityUrl ? (
                    <CopyLinkComponent url={termIdentityUrl} />
                  ) : (
                    // Waiting on the ontology for a cell's IRI (see termIdentityUrl). The
                    // placeholder holds the row's height so the tab bar below does not jump when
                    // the link arrives.
                    <Skeleton variant="text" width="20rem" height="2.5rem" />
                  )}
                  {graphId && (
                    <Typography fontSize=".875rem" color={gray500}>
                      Graph ID: {graphId}
                    </Typography>
                  )}
                {/* A fork is a copy of a curated record: name the original and offer the way back
                    to it, so the reader can tell which of the two they are looking at. */}
                {isItFork && (
                  <>
                    <Divider orientation="vertical" flexItem />
                    <Link
                      component="button"
                      variant="body2"
                      onClick={() => navigate(curatedTermPath)}
                    >
                      View curated term
                    </Link>
                  </>
                )}
                </Stack>
              </Grid>
              <Grid display="flex" justifyContent='end' alignItems='flex-start' mt=".56rem" item xs={12} lg>
                <Stack direction="row" spacing="1rem" alignItems="center">
                  {/* Editing applies to the Overview tab, which is where every
                      field backed by a triple on this term lives. */}
                  <TermEditActions visible={tabValue === OVERVIEW_TAB && !versionHash} />
                  <Divider orientation="vertical" flexItem />
                  {/* Only a variant has something to propose: the base group *is* curated.
                      Opening the request writes to the fork's group, so it needs a session. */}
                  {isItFork && user ? (
                    <Button type="string" color="secondary" startIcon={<RateReviewOutlinedIcon />} onClick={handleOpenRequestMergeDialog}>
                      Request to merge changes to curated
                    </Button>
                  ) : user && !isItFork ? (
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
              <Grid item xs={12} mt="2rem" display='flex' alignItems='center' justifyContent='space-between'>
                <BasicTabs tabValue={tabValue} handleChange={handleChangeTabs} tabs={tabLabels} />
                {toggleButtonGroup}
              </Grid>
            </Grid>
          </Grid>
        </Box>
        {versionHash && (
          <Box px="5rem" pt="1.5rem">
            <Alert
              severity="info"
              onClose={() => navigate(`/${group}/${term}/overview`)}
              closeText="Back to current term"
            >
              Viewing a historical version of this term (identity graph <code>{versionHash}</code>). This snapshot is read-only.
            </Alert>
          </Box>
        )}
        {/* Why nothing on the Overview is editable: the record shown is the ontology's, not InterLex's. */}
        {!versionHash && servedByOntology && tabValue === OVERVIEW_TAB && (
          <Box px="5rem" pt="1.5rem">
            <Alert severity="info">
              This term has no InterLex record yet, so its Overview is read from{" "}
              {contextOntologyData?.meta?.title || "the context ontology"} and is read-only. Curate
              it by editing that ontology.
            </Alert>
          </Box>
        )}
        {tabContent}
      </Box>
      {isItFork && (
        <RequestMergeChanges
          term={searchTerm}
          group={actualGroup}
          open={openRequestMergeDialog}
          handleClose={handleCloseRequestMergeDialog}
        />
      )}
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
    </EditSessionProvider>
  )
}

export default SingleTermView
