import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import CustomButton from '../common/CustomButton';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined';
import { Box, Typography, Grid, Stack, Chip, CircularProgress } from '@mui/material';

import { vars } from '../../theme/variables';
const { gray200, gray500, gray700, brand50, brand200, brand600, brand700, error50, error300, error700 } = vars;


const TitleSection = ({ searchResult }) => {
    const navigate = useNavigate();

    const handleClick = (e, term) => {
        navigate(`/view?searchTerm=${term}`);
    };

    return (
        <Box display="flex" justifyContent="space-between" alignItems="center">
            <Stack direction="row" alignItems="center" gap={1.5}>
                <Typography variant='h6' sx={{ color: gray700 }}>{searchResult.label || searchResult.name}</Typography>
                <Chip label="Curated" variant="outlined" />
            </Stack>
            {searchResult.ontologyIsActive ? (
                <CustomButton
                    sx={{
                        opacity: 0,
                        visibility: 'hidden',
                        transition: 'opacity 0.3s ease-in-out',
                        border: `1px solid ${error300}`,
                        color: error700,
                        '&:hover': { background: error50 }
                    }}
                >
                    <DeleteOutlinedIcon fontSize="medium" />
                    Remove from active ontology
                </CustomButton>
            ) : (
                <CustomButton
                    sx={{
                        opacity: 0,
                        visibility: 'hidden',
                        transition: 'opacity 0.3s ease-in-out'
                    }}
                    onClick={(e) => handleClick(e, searchResult.label)}
                >
                    <CreateNewFolderOutlinedIcon fontSize="medium" />
                    Add term to active ontology
                </CustomButton>
            )}
        </Box>
    );
};

const Description = ({ description }) => {
    return (
        <Typography variant='body2' sx={{ color: gray500 }}>
            {description === '' ? '-' : description}
        </Typography>
    );
};

const InfoSection = ({ searchResult }) => {
    const infoItems = [
        { label: 'Preferred ID', value: searchResult.ilx.replace('_', ':').toUpperCase() },
        { label: 'IDs', value: searchResult.existing_ids.flatMap(item => item.curie) },
        { label: 'Type', value: searchResult.type },
        { label: 'Score', value: searchResult.status },
        { label: 'Organization', value: searchResult.organization },
    ];

    return (
        <Box
            sx={{
                width: '100%',
                display: 'flex',
                flexDirection: { xs: 'column', lg: 'row', md: 'row', sm: 'column' },
                justifyContent: 'space-between',
            }}
        >
            {infoItems.map(({ label, value }) => (
                <Stack key={label} direction="column" gap={1} alignItems="start" sx={{width: '100%'}}>
                    <Typography variant='body1' sx={{ color: gray700, fontWeight: 500 }}>{label}</Typography>
                    {label === 'IDs'
                        ? (value.map((val, index) => ( <Chip key={`result${index}`} label={val} className='rounded IDchip-outlined' />)))
                        : <Typography variant='body2' sx={{ color: gray500 }}>{value}</Typography>
                    }
                </Stack>
            ))}
        </Box>
    );
};


const ListView = ({ searchResults, loading }) => {
    const navigate = useNavigate();

    const handleClick = (searchResult) => {
        navigate(`/view?searchTerm=${searchResult?.label}`);
    };


    if (loading) {
        return <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <CircularProgress />
        </Box>
    }
    return (
        <Box>
            {searchResults?.map((searchResult, index) => (
                <Box
                    key={`${searchResult.label}_${index}`}
                    onClick={() => handleClick(searchResult)}
                    sx={{
                        cursor: 'pointer',
                        borderBottom: `1px solid ${gray200}`,
                        p: 3,
                        position: 'relative',
                        '&:hover': {
                            '& .MuiTypography-h6': { color: brand600 },
                            '& .MuiChip-outlined': { background: brand50, borderColor: brand200, color: brand700 },
                            '& .MuiIconButton-root': { opacity: 1, visibility: 'visible' }
                        }
                    }}
                >
                    <Grid container
                        sx={{
                            position: 'relative',
                            '&:hover': {
                                '&:before': {
                                    position: 'absolute',
                                    top: 8,
                                    left: -22,
                                    content: '""',
                                    height: '1.5rem',
                                    borderRadius: '3px',
                                    width: '2px',
                                    background: brand600
                                }
                            }
                        }}
                    >
                        <Grid item lg={12} xs={12}>
                            <TitleSection searchResult={searchResult} />
                        </Grid>
                        <Grid item lg={12} xs={12} mt={2}>
                            <Description description={searchResult.description} />
                        </Grid>
                        <Grid item lg={12} xs={12} sm={12} mt={3}>
                            <InfoSection searchResult={searchResult} />
                        </Grid>
                    </Grid>
                </Box>
            ))}
        </Box>
    );
};

Description.propTypes = {
    description: PropTypes.string
};

TitleSection.propTypes = {
    searchResult: PropTypes.object
};

InfoSection.propTypes = {
    searchResult: PropTypes.object
};

ListView.propTypes = {
    searchResults: PropTypes.array,
    loading: PropTypes.bool
};

export default ListView;
