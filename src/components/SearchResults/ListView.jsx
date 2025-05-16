import PropTypes from "prop-types";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import CustomButton from '../common/CustomButton';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined';
import { Box, Typography, Grid, Stack, Chip, CircularProgress } from '@mui/material';
import { GlobalDataContext } from "../../contexts/DataContext";

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
                <Chip label={searchResult.type} variant="outlined" />
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
        { label: 'ID', value: searchResult.ilx},
        { label: 'Preferred ID', value: searchResult.existing_ids},
        { label: 'Synonyms', value: searchResult.synonyms },
        { label: 'Score', value: searchResult.score },
    ];

    const getText = (value) => {
        return (<Typography variant='body2' sx={{ color: gray500 }}>{value}</Typography>)
    }

    const getChip = (value) => {
        return (<Chip label={value} className='rounded IDchip-outlined' />)
    }

    const getChips = (value) => {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1, // Add spacing between chips
                    width: '100%',
                }}
            >
                {value.map((val, index) => (
                    <Chip key={`result${index}`} label={val} className='rounded IDchip-outlined' />
                ))}
            </Box>
        );
    };

    const getValue = (label, value) => {
        if (label === 'ID') {
            return getText(value.replace('_', ':').toUpperCase());
        } else if (label === 'Preferred ID') {
            const id = value.find((id) => id.preferred === "1");
            return getChip(id.curie);
        } else if (label === 'Synonyms') {
            return getChips(value.map((synonym) => synonym.literal));
        } else if (label === 'Score') {
            return getText(value);
        }
    }

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
                <Stack key={label} direction="column" gap={1} alignItems="start" sx={{width: '100%', paddingLeft: "1rem"}}>
                    <Typography variant='body1' sx={{ color: gray700, fontWeight: 500 }}>{label}</Typography>
                    {getValue(label, value)}
                </Stack>
            ))}
        </Box>
    );
};


const ListView = ({ searchResults, loading }) => {
    const navigate = useNavigate();
    const { updateStoredSearchTerm } = useContext(GlobalDataContext);

    const handleClick = (searchResult) => {
        updateStoredSearchTerm(searchResult?.label)
        navigate(`/view?searchTerm=${searchResult?.ilx}`);
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
