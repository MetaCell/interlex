import React, { useState, useEffect, useCallback } from "react";
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
import { useNavigate } from "react-router-dom";
import CustomBreadcrumbs from "../common/CustomBreadcrumbs";
import CustomSingleSelect from "../common/CustomSingleSelect";
import CustomPagination from "../common/CustomPagination";
import CustomViewButton from "../common/CustomViewButton";
import CustomButton from "../common/CustomButton";
import OrganizationCard from "./OrganizationCard";
import EditBulkTermsDialog from "../Dashboard/EditBulkTerms/EditBulkTermsDialog";
import AddNewOntologyDialog from "./AddNewOntologyDialog";
import CreateForkDialog from "./CreateForkDialog";
import LeaveModal from "./LeaveModal";
import {
    CreateNewFolderOutlined,
} from "@mui/icons-material";
import { useQuery } from "../../helpers";
import { ListIcon, TableChartIcon, EditNoteIcon } from "../../Icons";
import ForkRightIcon from '@mui/icons-material/ForkRight';
import ModeEditOutlineOutlinedIcon from '@mui/icons-material/ModeEditOutlineOutlined';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import AddIcon from '@mui/icons-material/Add';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import { getOrganization, getOrganizationCuries, getOrganizationTerms, getOrganizationOntologies } from "../../api/endpoints";
import { vars } from "../../theme/variables";

const { gray25, gray200, gray500, gray600 } = vars;

const terms = [
    { id: '1', label: 'Sparc', description: 'just a simple description', status: 'Curated' },
    { id: '2', label: 'Aiag', description: 'just a simple description', status: 'Curated' },
    { id: '3', label: 'Metacell', description: 'just a simple description', status: 'Curated' },
    { id: '4', label: 'Bakai', description: 'just a simple description', status: 'Curated' },
]

const ontologies = [
    { id: '1', label: 'Sparc', description: 'just a simple description', status: 'Curated' },
    { id: '2', label: 'Aiag', description: 'just a simple description', status: 'Curated' },
    { id: '3', label: 'Metacell', description: 'just a simple description', status: 'Curated' },
    { id: '4', label: 'Bakai', description: 'just a simple description', status: 'Curated' },
]

const SingleOrganization = () => {
    const [loading, setLoading] = useState(false);
    const [organization, setOrganization] = useState(null);
    const [organizationCuries, setOrganizationCuries] = React.useState([]);
    const [organizationTerms, setOrganizationTerms] = useState([]);
    const [organizationOntologies, setOrganizationOntologies] = useState([]);
    const [numberOfVisiblePages, setNumberOfVisiblePages] = useState(8);
    const [listView, setListView] = useState('list');
    const [page, setPage] = useState(1);
    const [activeStep, setActiveStep] = useState(0);
    const [openEditBulkTerms, setOpenEditBulkTerms] = useState(false);
    const [openAddOntology, setOpenAddOntology] = useState(false);
    const [openFork, setOpenFork] = useState(false);
    const [openLeaveModal, setOpenLeaveModal] = useState(false);
    const query = useQuery();
    const navigate = useNavigate();
    const searchTerm = query.get('searchTerm');

    const handleNumberOfPagesChange = (v) => {
        setNumberOfVisiblePages(v);
        setPage(1);
    };

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const handleViewOrganizationsClick = () => {
        navigate('/curie-editor');
    };

    const handleCloseEditBulkTerms = () => {
        setOpenEditBulkTerms(false);
        setActiveStep(0);
    };
    const handleOpenEditBulkTerms = () => {
        setOpenEditBulkTerms(true);
    };

    const handleCloseOntologyDialog = () => {
        setOpenAddOntology(false);
    };
    const handleOpenOntologyDialog = () => {
        setOpenAddOntology(true);
    };

    const handleCloseForkDialog = () => {
        setOpenFork(false);
    };
    const handleOpenForkDialog = () => {
        setOpenFork(true);
    };

    const handleOpenLeaveModal = () => {
        setOpenLeaveModal(true);
    };

    const handleCloseLeaveModal = () => {
        setOpenLeaveModal(false);
    };

    const getOrganizationRequest = useCallback(async (id) => {
        await getOrganization(id).then((response) => {
            console.log("Get Organization response ", response)
            setOrganization(response)
        })
            .catch((error) => {
                console.log("Error ", error)
            });

        await getOrganizationTerms(id).then((response) => {
            console.log("Get Organization terms response ", response)
            setOrganizationTerms(response.results)
        })
            .catch((error) => {
                console.log("Error ", error)
            });

        await getOrganizationCuries(id).then((response) => {
            console.log("Get Organization curies response ", response)
            setOrganizationCuries(response)
        })
            .catch((error) => {
                console.log("Error ", error)
            });

        await getOrganizationOntologies(id).then((response) => {
            console.log("Get Organization ontologies response ", response)
            setOrganizationOntologies(response)
        })
            .catch((error) => {
                console.log("Error ", error)
            });
    }, [getOrganization, getOrganizationTerms, getOrganizationCuries, getOrganizationOntologies]);

    useEffect(() => {
        getOrganizationRequest("1");
    }, [getOrganizationRequest]);

    //change href
    const breadcrumbItems = [
        { label: '', href: '/', icon: HomeOutlinedIcon },
        { label: 'Open Data Commons for Traumatic Brain Injury', href: `/search?searchTerm=${searchTerm}` },
    ];

    return (
        <>
            <Box flex={1} display='flex' flexDirection='column'>
                <Box sx={{
                    p: "2.25rem 5rem",
                    backgroundColor: gray25,
                    width: '100%',
                    gap: '1.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                    <CustomBreadcrumbs breadcrumbItems={breadcrumbItems} />
                    <Box display='flex' alignItems='center' justifyContent='space-between'>
                        <Box
                            component="img"
                            src={organization?.icon}
                            alt="organization logo"
                            sx={{
                                objectFit: 'contain',
                                width: 'auto',
                                height: 'auto',
                            }}
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
                    <Box p='2.5rem 5rem' sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.75rem',
                    }}>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <Typography fontSize='1.5rem' color={gray600} fontWeight={600}>
                                Organization terms
                            </Typography>
                            <Box display="flex" alignItems="center" gap={2} justifyContent="end">
                                <Stack direction="row" alignItems="center" gap={1}>
                                    <Typography variant="caption" sx={{ fontSize: '0.875rem', color: gray600 }}>Show on page:</Typography>
                                    <CustomSingleSelect value={numberOfVisiblePages} onChange={handleNumberOfPagesChange} options={['8', '12', '24']} />
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
                        {loading ? <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CircularProgress />
                        </Box> : <Grid container spacing='2.75rem'>
                            {
                                organizationTerms?.map((data, index) => (
                                    <OrganizationCard data={data} key={index} />
                                ))
                            }
                        </Grid>}
                        <CustomPagination rowCount={terms?.length} rowsPerPage={numberOfVisiblePages} page={page} onPageChange={handlePageChange} />
                    </Box>
                    <Box p='2.5rem 5rem' sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.75rem',
                        backgroundColor: gray25
                    }}>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <Typography fontSize='1.5rem' color={gray600} fontWeight={600}>
                                Organization Ontology
                            </Typography>
                            <Box display="flex" alignItems="center" gap={2} justifyContent="end">
                                <Stack direction="row" alignItems="center" gap={1}>
                                    <Typography variant="caption" sx={{ fontSize: '0.875rem', color: gray600 }}>Show on page:</Typography>
                                    <CustomSingleSelect value={numberOfVisiblePages} onChange={handleNumberOfPagesChange} options={['8', '12', '24']} />
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
                        {loading ? <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CircularProgress />
                        </Box> : <Grid container spacing='2.75rem'>
                            {
                                organizationOntologies?.map((data, index) => (
                                    <OrganizationCard data={data} key={index} isOntology={true} />
                                ))
                            }
                        </Grid>}
                        <CustomPagination rowCount={terms?.length} rowsPerPage={numberOfVisiblePages} page={page} onPageChange={handlePageChange} />
                    </Box>
                </Box>
            </Box>
            <EditBulkTermsDialog handleClose={handleCloseEditBulkTerms} open={openEditBulkTerms} activeStep={activeStep} setActiveStep={setActiveStep} />
            <AddNewOntologyDialog open={openAddOntology} handleClose={handleCloseOntologyDialog} onSubmit={() => console.log("Add new ontology")} />
            <CreateForkDialog open={openFork} handleClose={handleCloseForkDialog} onSubmit={() => console.log("Create a new fork!")} />
            <LeaveModal open={openLeaveModal} handleClose={handleCloseLeaveModal} />
        </>
    )
}

export default SingleOrganization;