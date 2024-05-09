import React from 'react';
import { Box, Typography, Grid, Stack, Chip, IconButton } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CustomMenu from './CustomMenu';
import { vars } from '../../theme/variables';

const { gray50, gray200, gray300, gray500, gray600, gray700, brand50, brand200, brand600, brand700 } = vars;


const TitleSection = ({ searchResult }) => {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const open = Boolean(anchorEl);
    return (
        <Box display="flex" justifyContent="space-between" alignItems="center">
            <Stack direction="row" alignItems="center" gap={1.5}>
                <Typography variant='h6' sx={{ color: gray700 }}>{searchResult.title}</Typography>
                <Chip label="Curated" variant="outlined" />
            </Stack>
            <IconButton
                sx={{
                    opacity: open ? 1 : 0,
                    visibility: open ? 'visible' : 'hidden',
                    transition: 'opacity 0.3s ease-in-out',
                    border: `1px solid ${gray300}`,
                    '&:hover': { background: gray50 }
                }}
                onClick={handleClick}
            >
                <MoreVertIcon fontSize='small' sx={{ color: gray600 }} />
            </IconButton>
            <CustomMenu open={open} anchorEl={anchorEl} setAnchorEl={setAnchorEl} />
        </Box>
    );
};

const Description = ({ description }) => {
    return (
        <Typography variant='body2' sx={{ color: gray500 }}>
            {description}
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
                <Stack key={label} direction="column" gap={0.5} alignItems="start">
                    <Typography variant='body1' sx={{ color: gray700, fontWeight: 500 }}>{label}</Typography>
                    <Typography variant='body2' sx={{ color: gray500 }}>{value}</Typography>
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
                            '& .MuiChip-root': { background: brand50, borderColor: brand200, color: brand700 },
                            '& .MuiIconButton-root': { opacity: 1, visibility: 'visible' },
                        }
                    }}
                >
                    <Grid container spacing={3}>
                        <Grid item lg={12} xs={12}>
                            <TitleSection searchResult={searchResult}/>
                        </Grid>
                        <Grid item lg={12} xs={12}>
                            <Description description={searchResult.description} />
                        </Grid>
                        <Grid item lg={12} xs={12} sm={12}>
                            <InfoSection searchResult={searchResult} />
                        </Grid>
                    </Grid>
                </Box>
            ))}
        </Box>
    );
};

export default ListView;