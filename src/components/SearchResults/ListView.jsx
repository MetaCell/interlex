import React from 'react';
import { Box, Typography, Grid, Stack, Chip } from '@mui/material';
import CustomButton from '../common/CustomButton';
import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { vars } from '../../theme/variables';
import { useNavigate } from "react-router-dom";

const { gray200, gray500, gray700, brand50, brand200, brand600, brand700, error50, error300, error700 } = vars;


const TitleSection = ({ searchResult }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate('/single-term');
  };

    return (
        <Box display="flex" justifyContent="space-between" alignItems="center">
            <Stack direction="row" alignItems="center" gap={1.5}>
                <Typography variant='h6' sx={{ color: gray700 }}>{searchResult.title}</Typography>
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
                        '&:hover': {background: error50}
                    }}
                    onClick={handleClick}
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
                    onClick={handleClick}
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
        { label: 'Preferred ID', value: searchResult.preferredId },
        { label: 'ID', value: searchResult.id },
        { label: 'Type', value: searchResult.type },
        { label: 'Score', value: searchResult.score },
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
                <Stack key={label} direction="column" gap={1} alignItems="start">
                    <Typography variant='body1' sx={{ color: gray700, fontWeight: 500 }}>{label}</Typography>
                    {label === 'ID' ?
                        <Chip label={value} className='rounded IDchip-outlined' /> : <Typography variant='body2' sx={{ color: gray500 }}>{value}</Typography>
                    }
                </Stack>
            ))}
        </Box>
    );
};


const ListView = ({ searchResults }) => {

    return (
        <Box>
            {searchResults.map((searchResult, index) => (
                <Box
                    key={`${searchResult.title}_${index}`}
                    sx={{
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

export default ListView;