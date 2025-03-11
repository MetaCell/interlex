import { useState, useEffect } from "react";
import {
    Box,
    Button,
    ButtonGroup,
    Divider,
    Grid,
    Stack,
    Typography,
    CircularProgress,
} from "@mui/material";
import {
    CreateNewFolderOutlined,
} from "@mui/icons-material";
import LeaveModal from "./LeaveModal";
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from "react-router-dom";
import CustomButton from "../common/CustomButton";
import OrganizationCard from "./OrganizationCard";
import CreateForkDialog from "./CreateForkDialog";
import ForkRightIcon from '@mui/icons-material/ForkRight';
import CustomPagination from "../common/CustomPagination";
import CustomViewButton from "../common/CustomViewButton";
import AddNewOntologyDialog from "./AddNewOntologyDialog";
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import CustomSingleSelect from "../common/CustomSingleSelect";
import EditBulkTermsDialog from "../Dashboard/EditBulkTerms/EditBulkTermsDialog";
import { ListIcon, TableChartIcon, EditNoteIcon } from "../../Icons";
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import ModeEditOutlineOutlinedIcon from '@mui/icons-material/ModeEditOutlineOutlined';
import { getOrganization, getOrganizationCuries, getOrganizationTerms, getOrganizationOntologies } from "../../api/endpoints";

import { vars } from "../../theme/variables";
const { gray25, gray200, gray500, gray600 } = vars;

const generatePageOptions = (totalItems) => {
    const options = new Set([5, 10].filter(n => n < totalItems));

    for (let i = 20; i <= totalItems; i += 10) {
        options.add(i);
    }

    options.add(totalItems);
    return Array.from(options).sort((a, b) => a - b);
};

const useOrganizationData = (id) => {
    const [organization, setOrganization] = useState(null);
    const [organizationCuries, setOrganizationCuries] = useState([]);
    const [organizationTerms, setOrganizationTerms] = useState([]);
    const [organizationOntologies, setOrganizationOntologies] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [orgRes, termsRes, curiesRes, ontologiesRes] = await Promise.all([
                    getOrganization(id),
                    getOrganizationTerms(id),
                    getOrganizationCuries(id),
                    getOrganizationOntologies(id),
                ]);
                setOrganization(orgRes);
                setOrganizationTerms(termsRes.results);
                setOrganizationCuries(curiesRes);
                setOrganizationOntologies(ontologiesRes);
            } catch (error) {
                console.error("Error fetching organization data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    return { organization, organizationCuries, organizationTerms, organizationOntologies, loading };
};

const SingleOrganization = () => {
    const [numberOfTermsVisiblePages, setNumberOfTermsVisiblePages] = useState("");
    const [numberOfOntologiesVisiblePages, setNumberOfOntologiesVisiblePages] = useState("");
    const [listView, setListView] = useState('list');
    const [termsPage, setTermsPage] = useState(1);
    const [ontologiesPage, setOntologiesPage] = useState(1);
    const [activeStep, setActiveStep] = useState(0);
    const [openEditBulkTerms, setOpenEditBulkTerms] = useState(false);
    const [openAddOntology, setOpenAddOntology] = useState(false);
    const [openFork, setOpenFork] = useState(false);
    const [openLeaveModal, setOpenLeaveModal] = useState(false);
    const [termsPageOptions, setTermPageOptions] = useState([]);
    const [ontologiesPageOptions, setOntologiesPageOptions] = useState([]);

    const navigate = useNavigate();
    const id = "1"; // Hardcoded for now

    const { organization, organizationTerms, organizationOntologies, loading } = useOrganizationData(id);

    useEffect(() => {
        if (organizationTerms.length > 0) {
            const options = generatePageOptions(organizationTerms.length);
            setTermPageOptions(options);
            setNumberOfTermsVisiblePages(options[0]);
        }
    }, [organizationTerms]);

    useEffect(() => {
        if (organizationOntologies.length > 0) {
            const options = generatePageOptions(organizationOntologies.length);
            setOntologiesPageOptions(options);
            setNumberOfOntologiesVisiblePages(options[0]);
        }
    }, [organizationOntologies]);

    const handlePageTermsOptionsChange = (v) => {
        setNumberOfTermsVisiblePages(v);
        setTermsPage(1);
    };

    const handlePageOntologiesOptionsChange = (v) => {
        setNumberOfOntologiesVisiblePages(v);
        setOntologiesPage(1);
    };

    const handleTermsPageChange = (event, value) => setTermsPage(value);
    const handleOntologiesPageChange = (event, value) => setOntologiesPage(value);
    const handleViewOrganizationsClick = () => navigate(`/organizations/${organization?.name}/curie-editor`);
    const handleOpenEditBulkTerms = () => setOpenEditBulkTerms(true);
    const handleCloseEditBulkTerms = () => {
        setOpenEditBulkTerms(false);
        setActiveStep(0);
    };

    const handleOpenOntologyDialog = () => setOpenAddOntology(true);
    const handleCloseOntologyDialog = () => setOpenAddOntology(false);
    const handleOpenForkDialog = () => setOpenFork(true);
    const handleCloseForkDialog = () => setOpenFork(false);
    const handleOpenLeaveModal = () => setOpenLeaveModal(true);
    const handleCloseLeaveModal = () => setOpenLeaveModal(false);
    return (
        <>
            <Box flex={1} display='flex' flexDirection='column'>
                <Box sx={{ p: "2.25rem 5rem", backgroundColor: gray25, width: '100%', gap: '1.75rem', display: 'flex', flexDirection: 'column' }}>
                    <Box display='flex' alignItems='center' justifyContent='space-between'>
                        <Box
                            component="img"
                            src={organization?.icon}
                            alt="organization logo"
                            sx={{ objectFit: 'contain', width: 'auto', height: 'auto' }}
                        />
                        <Stack direction="row" spacing="1rem" alignItems="center">
                            <Button type="string" color="secondary" startIcon={<EditNoteIcon />} onClick={handleViewOrganizationsClick}>
                                View organization curies
                            </Button>
                            <Divider orientation="vertical" flexItem sx={{ borderColor: gray200 }} />
                            <Button
                                type="string"
                                color="error"
                                startIcon={<ExitToAppIcon />}
                                sx={{ padding: 0, '&:hover': { background: 'transparent' } }}
                                onClick={handleOpenLeaveModal}
                            >
                                Leave
                            </Button>
                            <CustomButton variant="outlined" display="flex" alignItems="center">
                                <SettingsOutlinedIcon />
                                Manage organization
                            </CustomButton>
                        </Stack>
                    </Box>
                    <Grid container spacing={4.5}>
                        <Grid item xs={12} lg={12}>
                            <Typography color={gray600} fontSize="1.875rem" fontWeight={600}>
                                {organization?.name}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} lg={10}>
                            <Typography color={gray500} fontSize="0.875rem">
                                {organization?.description}
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>
                <Box flexGrow={1} overflow='auto'>
                    <Box p='2.5rem 5rem' sx={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography fontSize='1.5rem' color={gray600} fontWeight={600}>
                                Organization terms
                            </Typography>
                            <Box display="flex" alignItems="center" gap={2} justifyContent="end">
                                <Stack direction="row" alignItems="center" gap={1}>
                                    <Typography variant="caption" sx={{ fontSize: '0.875rem', color: gray600 }}>Show on page:</Typography>
                                    <CustomSingleSelect value={numberOfTermsVisiblePages} onChange={handlePageTermsOptionsChange} options={termsPageOptions} />
                                </Stack>
                                <ButtonGroup variant="outlined" aria-label="View mode">
                                    <CustomViewButton
                                        view="list"
                                        listView={listView}
                                        onClick={() => setListView('list')}
                                        icon={<ListIcon />}
                                    />
                                    <CustomViewButton
                                        view="table"
                                        listView={listView}
                                        disabled
                                        onClick={() => setListView('table')}
                                        icon={<TableChartIcon />}
                                    />
                                </ButtonGroup>
                                <Divider orientation="vertical" flexItem sx={{ borderColor: gray200 }} />
                                <Button type="string" color="secondary" startIcon={<ModeEditOutlineOutlinedIcon />} onClick={handleOpenEditBulkTerms}>
                                    Edit bulk terms
                                </Button>
                                <CustomButton onClick={handleOpenForkDialog}>
                                    <ForkRightIcon />
                                    Fork curated term to organization
                                </CustomButton>
                            </Box>
                        </Box>
                        {loading ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <Grid container spacing='2.75rem'>
                                {organizationTerms?.slice(0, numberOfTermsVisiblePages).map((data, index) => (
                                    <OrganizationCard data={data} key={index} />
                                ))}
                            </Grid>
                        )}
                        <CustomPagination rowCount={organizationTerms?.length} rowsPerPage={numberOfTermsVisiblePages || 10} page={termsPage} onPageChange={handleTermsPageChange} />
                    </Box>
                    <Box p='2.5rem 5rem' sx={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', backgroundColor: gray25 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography fontSize='1.5rem' color={gray600} fontWeight={600}>
                                Organization Ontology
                            </Typography>
                            <Box display="flex" alignItems="center" gap={2} justifyContent="end">
                                <Stack direction="row" alignItems="center" gap={1}>
                                    <Typography variant="caption" sx={{ fontSize: '0.875rem', color: gray600 }}>Show on page:</Typography>
                                    <CustomSingleSelect value={numberOfOntologiesVisiblePages} onChange={handlePageOntologiesOptionsChange} options={ontologiesPageOptions} />
                                </Stack>
                                <ButtonGroup variant="outlined" aria-label="View mode">
                                    <CustomViewButton
                                        view="list"
                                        listView={listView}
                                        onClick={() => setListView('list')}
                                        icon={<ListIcon />}
                                    />
                                    <CustomViewButton
                                        view="table"
                                        listView={listView}
                                        disabled
                                        onClick={() => setListView('table')}
                                        icon={<TableChartIcon />}
                                    />
                                </ButtonGroup>
                                <Divider orientation="vertical" flexItem sx={{ borderColor: gray200 }} />
                                <Button type="string" color="secondary" startIcon={<CreateNewFolderOutlined />}>
                                    Add term to ontology
                                </Button>
                                <CustomButton onClick={handleOpenOntologyDialog}>
                                    <AddIcon />
                                    Add a new ontology
                                </CustomButton>
                            </Box>
                        </Box>
                        {loading ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <Grid container spacing='2.75rem'>
                                {organizationOntologies?.slice(0, numberOfOntologiesVisiblePages).map((data, index) => (
                                    <OrganizationCard data={data} key={index} isOntology={true} />
                                ))}
                            </Grid>
                        )}
                        <CustomPagination rowCount={organizationOntologies?.length} rowsPerPage={numberOfOntologiesVisiblePages || 10} page={ontologiesPage} onPageChange={handleOntologiesPageChange} />
                    </Box>
                </Box>
            </Box>
            <EditBulkTermsDialog handleClose={handleCloseEditBulkTerms} open={openEditBulkTerms} activeStep={activeStep} setActiveStep={setActiveStep} />
            <AddNewOntologyDialog open={openAddOntology} handleClose={handleCloseOntologyDialog} />
            <CreateForkDialog open={openFork} handleClose={handleCloseForkDialog} onSubmit={() => console.log("Create a new fork!")} />
            <LeaveModal open={openLeaveModal} handleClose={handleCloseLeaveModal} />
        </>
    );
};

export default SingleOrganization;
