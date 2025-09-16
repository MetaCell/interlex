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
import { useNavigate, useParams } from "react-router-dom";
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
// TODO: These API endpoints are currently returning 501 (Not Implemented) errors
// They have been updated to use real API service instead of mock data
// Error handling is in place to gracefully handle 501 responses
import { getOrganizationsCuries, getOrganizationsTerms, getOrganizationsOntologies } from "../../api/endpoints/apiService";

import { vars } from "../../theme/variables";
const { gray25, gray200, gray500, gray600 } = vars;

const generatePageOptions = (totalItems) => {
    // Generate options that work well with 2-items-per-row layout
    // Using multiples of 2 for even rows: 6, 12, 18, 24, etc.
    const options = new Set([6, 12].filter(n => n < totalItems));

    for (let i = 18; i <= totalItems; i += 6) {
        options.add(i);
    }

    // Always include the total if it's reasonable
    if (totalItems <= 50) {
        options.add(totalItems);
    }
    
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
                // TODO: Replace with real backend endpoints when they are implemented
                // Currently handling 501 errors gracefully for unimplemented endpoints
                const apiCalls = [
                    getOrganizationsTerms(id).catch(error => {
                        if (error?.response?.status === 501) {
                            console.warn('Terms endpoint not implemented yet (501), using empty array');
                            return { results: [] };
                        }
                        throw error;
                    }),
                    getOrganizationsCuries(id).catch(error => {
                        if (error?.response?.status === 501) {
                            console.warn('Curies endpoint not implemented yet (501), using empty array');
                            return [{}]; // Return array with empty object to match expected structure
                        }
                        throw error;
                    }),
                    getOrganizationsOntologies(id).catch(error => {
                        if (error?.response?.status === 501) {
                            console.warn('Ontologies endpoint not implemented yet (501), using empty array');
                            return [];
                        }
                        throw error;
                    }),
                ];

                const [termsRes, curiesRes, ontologiesRes] = await Promise.all(apiCalls);
                
                // For organization data, we'll create a simple object with the name
                setOrganization({ name: id });
                setOrganizationTerms(termsRes?.results || []);
                
                // Transform curies data: handle both array and object response formats
                let curiesObject;
                if (Array.isArray(curiesRes) && curiesRes.length > 0) {
                    // If response is an array, take the first item
                    curiesObject = curiesRes[0];
                } else if (curiesRes && typeof curiesRes === 'object') {
                    // If response is a direct object, use it directly
                    curiesObject = curiesRes;
                }

                if (curiesObject && Object.keys(curiesObject).length > 0) {
                    // Convert object to array of {prefix, namespace} objects
                    const curiesArray = Object.entries(curiesObject).map(([prefix, namespace]) => ({
                        prefix,
                        namespace
                    }));
                    setOrganizationCuries(curiesArray);
                } else {
                    setOrganizationCuries([]);
                }
                
                setOrganizationOntologies(ontologiesRes || []);
            } catch (error) {
                console.error("Error fetching organization data", error);
                // Set empty data on error to prevent UI issues
                setOrganization({ name: id });
                setOrganizationTerms([]);
                setOrganizationCuries([]);
                setOrganizationOntologies([]);
            } finally {
                setLoading(false);
            }
        };
        if ( id ) {
            console.log('useOrganizationData: Fetching data for organization:', id);
            fetchData();
        }
    }, [id]);

    // Function to refresh only ontologies
    const refreshOntologies = async () => {
        try {
            const ontologiesRes = await getOrganizationsOntologies(id).catch(error => {
                if (error?.response?.status === 501) {
                    console.warn('Ontologies endpoint not implemented yet (501), using empty array');
                    return [];
                }
                throw error;
            });
            setOrganizationOntologies(ontologiesRes || []);
            return ontologiesRes || [];
        } catch (error) {
            console.error("Error refreshing ontologies", error);
            return [];
        }
    };

    return { organization, organizationCuries, organizationTerms, organizationOntologies, loading, refreshOntologies };
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
    const { title } = useParams(); // Get organization name from URL params

    const { organization, organizationTerms, organizationOntologies, loading, refreshOntologies } = useOrganizationData(title);

    useEffect(() => {
        if (Array.isArray(organizationTerms) && organizationTerms.length > 0) {
            const options = generatePageOptions(organizationTerms.length);
            setTermPageOptions(options);
            if (!numberOfTermsVisiblePages) {
                setNumberOfTermsVisiblePages(options[0]);
            }
            
            // Ensure current page is valid for the new pagination
            const itemsPerPage = numberOfTermsVisiblePages || options[0];
            const maxPage = Math.ceil(organizationTerms.length / itemsPerPage);
            if (termsPage > maxPage && maxPage > 0) {
                setTermsPage(maxPage);
            }
        }
    }, [organizationTerms, numberOfTermsVisiblePages, termsPage]);

    useEffect(() => {
        if (Array.isArray(organizationOntologies) && organizationOntologies.length > 0) {
            const options = generatePageOptions(organizationOntologies.length);
            setOntologiesPageOptions(options);
            if (!numberOfOntologiesVisiblePages) {
                setNumberOfOntologiesVisiblePages(options[0]);
            }
            
            // Ensure current page is valid for the new pagination
            const itemsPerPage = numberOfOntologiesVisiblePages || options[0];
            const maxPage = Math.ceil(organizationOntologies.length / itemsPerPage);
            if (ontologiesPage > maxPage && maxPage > 0) {
                setOntologiesPage(maxPage);
            }
        }
    }, [organizationOntologies, numberOfOntologiesVisiblePages, ontologiesPage]);

    const handlePageTermsOptionsChange = (v) => {
        setNumberOfTermsVisiblePages(v);
        setTermsPage(1); // Reset to first page when changing items per page
    };

    const handlePageOntologiesOptionsChange = (v) => {
        setNumberOfOntologiesVisiblePages(v);
        setOntologiesPage(1); // Reset to first page when changing items per page
    };

    const handleTermsPageChange = (event, value) => {
        setTermsPage(value);
    };
    
    const handleOntologiesPageChange = (event, value) => {
        setOntologiesPage(value);
    };

    // Calculate pagination values safely
    const termsPerPage = numberOfTermsVisiblePages || 6;
    const ontologiesPerPage = numberOfOntologiesVisiblePages || 6;
    const handleViewOrganizationsClick = () => navigate(`/organizations/${title}/curie-editor`);
    const handleOpenEditBulkTerms = () => setOpenEditBulkTerms(true);
    const handleCloseEditBulkTerms = () => {
        setOpenEditBulkTerms(false);
        setActiveStep(0);
    };

    const handleOpenOntologyDialog = () => setOpenAddOntology(true);
    const handleCloseOntologyDialog = () => setOpenAddOntology(false);
    
    const handleOntologyAdded = async () => {
        // Refresh the ontologies list and get the updated data
        const updatedOntologies = await refreshOntologies();
        
        // Use a small delay to ensure the state is updated, then navigate to last page
        setTimeout(() => {
            const totalOntologies = updatedOntologies.length;
            const itemsPerPage = ontologiesPerPage;
            const lastPage = Math.ceil(totalOntologies / itemsPerPage);
            
            // Navigate to the last page to show the newly added ontology
            if (lastPage > 0) {
                setOntologiesPage(lastPage);
            }
        }, 100); // Small delay to ensure state propagation
    };
    const handleOpenForkDialog = () => setOpenFork(true);
    const handleCloseForkDialog = () => setOpenFork(false);
    const handleOpenLeaveModal = () => setOpenLeaveModal(true);
    const handleCloseLeaveModal = () => setOpenLeaveModal(false);
    return (
        <>
            <Box flex={1} display='flex' flexDirection='column'>
                <Box sx={{ p: "2.25rem 5rem", backgroundColor: gray25, width: '100%', gap: '1.75rem', display: 'flex', flexDirection: 'column' }}>
                    <Box display='flex' alignItems='center' justifyContent='space-between'>
                        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: gray600 }}>
                            {organization?.name || title}
                        </Typography>
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
                        <Grid item xs={12} lg={10}>
                            {organization?.description && (
                                <Typography color={gray500} fontSize="0.875rem">
                                    {organization.description}
                                </Typography>
                            )}
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
                                {Array.isArray(organizationTerms) && organizationTerms.length > 0 ? (
                                    organizationTerms
                                        .slice(
                                            (termsPage - 1) * termsPerPage, 
                                            termsPage * termsPerPage
                                        )
                                        .map((data, index) => (
                                            <OrganizationCard data={data} key={index} />
                                        ))
                                ) : (
                                    <Typography 
                                        sx={{ 
                                            textAlign: 'center', 
                                            width: '100%', 
                                            my: '5rem',
                                            color: gray500,
                                            fontSize: '1rem'
                                        }}
                                    >
                                        No terms found for this organization.
                                    </Typography>
                                )}
                            </Grid>
                        )}
                        {Array.isArray(organizationTerms) && organizationTerms.length > 0 && (
                            <CustomPagination 
                                rowCount={organizationTerms.length} 
                                rowsPerPage={termsPerPage} 
                                page={termsPage} 
                                onPageChange={handleTermsPageChange} 
                            />
                        )}
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
                                {Array.isArray(organizationOntologies) && organizationOntologies.length > 0 ? (
                                    organizationOntologies
                                        .slice(
                                            (ontologiesPage - 1) * ontologiesPerPage, 
                                            ontologiesPage * ontologiesPerPage
                                        )
                                        .map((data, index) => (
                                            <OrganizationCard data={data} key={index} isOntology={true} />
                                        ))
                                ) : (
                                    <Typography 
                                        sx={{ 
                                            textAlign: 'center', 
                                            width: '100%', 
                                            my: '5rem',
                                            color: gray500,
                                            fontSize: '1rem'
                                        }}
                                    >
                                        No ontologies found for this organization.
                                    </Typography>
                                )}
                            </Grid>
                        )}
                        {Array.isArray(organizationOntologies) && organizationOntologies.length > 0 && (
                            <CustomPagination 
                                rowCount={organizationOntologies.length} 
                                rowsPerPage={ontologiesPerPage} 
                                page={ontologiesPage} 
                                onPageChange={handleOntologiesPageChange} 
                            />
                        )}
                    </Box>
                </Box>
            </Box>
            <EditBulkTermsDialog handleClose={handleCloseEditBulkTerms} open={openEditBulkTerms} activeStep={activeStep} setActiveStep={setActiveStep} />
            <AddNewOntologyDialog 
                open={openAddOntology} 
                handleClose={handleCloseOntologyDialog} 
                onOntologyAdded={handleOntologyAdded}
            />
            <CreateForkDialog open={openFork} handleClose={handleCloseForkDialog} onSubmit={() => console.log("Create a new fork!")} />
            <LeaveModal open={openLeaveModal} handleClose={handleCloseLeaveModal} />
        </>
    );
};

export default SingleOrganization;
