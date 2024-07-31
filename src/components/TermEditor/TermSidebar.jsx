import React from 'react';
import { Box, Typography, IconButton, Tooltip, Stack, Divider, Grid, CircularProgress, Chip } from '@mui/material';
import CustomSingleSelect from '../common/CustomSingleSelect';
// import { StartIcon, JoinRightIcon } from '../../Icons';
import CopyLinkComponent from '../common/CopyLinkComponent';
import { ListIcon } from '../../Icons';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import { vars } from '../../theme/variables';
import Hierarchy from '../SingleTermView/OverView/Hierarchy';
import Predicates from '../SingleTermView/OverView/Predicates';

const { gray200, gray500, gray600, gray800 } = vars;


export default function TermSidebar({ open, loading, onToggle, results, data }) {
    const [numberOfVisiblePages, setNumberOfVisiblePages] = React.useState(20);

    const handleNumberOfPagesChange = (v) => {
        setNumberOfVisiblePages(v);
    };

    if (loading) {
        return <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
        </Box>
    }

    if (!data) {
        return <div>No data available</div>;
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                borderLeft: `1px solid ${gray200}`,
                transition: 'all 0.5s ease',
                p: 3,
                width: open ? '42rem' : '5.75rem',
                overflowY: 'auto',
                '::-webkit-scrollbar': {
                    display: 'none', // Hide scrollbar in Chrome, Safari
                },
                scrollbarWidth: 'none', // Hide scrollbar in Firefox
            }}
        >
            {open ? (
                <Box width={1} display="flex" alignItems="center" justifyContent="space-between" mb={5}>
                    <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: gray800 }}>Previous versions</Typography>
                    <Box display="flex" alignItems="center">
                        <Stack direction="row" alignItems="center" gap={1}>
                            <Typography variant="caption" sx={{ fontSize: '0.875rem', color: gray600 }}>Show on page:</Typography>
                            <CustomSingleSelect value={numberOfVisiblePages} onChange={handleNumberOfPagesChange} options={['10', '20', '30']} />
                        </Stack>
                        <Divider orientation='vertical' flexItem sx={{ ml: "10px", mr: "10px", borderColor: '#DADDDC' }} />
                        <Tooltip title="Collapse potential matches" placement='left'>
                            <IconButton onClick={onToggle} sx={{ border: `1px solid ${gray200}` }}>
                                <ListIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
            ) : (
                <Box>
                    <Tooltip title="Open potential matches" placement='left'>
                        <IconButton onClick={onToggle} sx={{ border: `1px solid ${gray200}` }}>
                            <ListIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            )}
            {open && (
                <Box width={1} height={1} display="flex" flexDirection="column" alignItems="center" gap={1}>
                    {Object.keys(data)?.length === 0 ? (
                        <Box width={1} height={1} display="flex" flexDirection="column" alignItems="center" justifyContent="center" gap={2}>
                            <IconButton sx={{ padding: '10px', color: '#313534', border: '1px solid #BDC2C1' }}>
                                <ErrorOutlineIcon />
                            </IconButton>
                            <Stack direction="column" gap={0.5} alignItems="center">
                                <Typography variant='body1' sx={{ fontWeight: 600, color: '#111212' }}>No match found</Typography>
                                <Typography variant='body2' sx={{ color: '#515252' }}>Add a label to your term to visualize potential matches.</Typography>
                            </Stack>
                        </Box>
                    ) : (
                        <>
                            <Grid container spacing={4}>
                                <Grid item>
                                    <Typography sx={{ color: '#1D201F', fontWeight: 500 }}>URI</Typography>
                                    <CopyLinkComponent url="http://uri.interlex.org/base/ilx_0101901" />
                                </Grid>
                                <Grid item xs={12} lg={12}>
                                    <Stack spacing=".75rem">
                                        <Typography color={gray800} fontWeight={500}>
                                            Synonyms
                                        </Typography>
                                        <Box display="flex" flexWrap="wrap" gap=".5rem">
                                            {data?.synonym?.map((synonym) => (
                                                <Chip
                                                    className="rounded synonyms"
                                                    variant="outlined"
                                                    key={synonym}
                                                    label={
                                                        <span>
                                                            {synonym} <span>{synonym}</span>
                                                        </span>
                                                    }
                                                />
                                            ))}
                                        </Box>
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} lg={6}>
                                    <Stack spacing=".75rem">
                                        <Typography color={gray800} fontWeight={500}>
                                            Preferred ID
                                        </Typography>
                                        <Typography fontSize=".875rem" color={gray500}>
                                            {data?.hasIlxPreferredId}
                                        </Typography>
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} lg={6}>
                                    <Stack spacing=".75rem">
                                        <Typography color={gray800} fontWeight={500}>
                                            Existing IDs
                                        </Typography>
                                        <Box display="flex" flexWrap="wrap" gap=".5rem">
                                            {data?.existingID?.map((id) => (
                                                <Chip className="rounded IDchip-outlined" variant="outlined" key={id} label={id} icon={<OpenInNewOutlinedIcon />} onClick={() => handleChipClick(id)} />
                                            ))}
                                        </Box>
                                    </Stack>
                                </Grid>
                                <Grid item xs={12}>
                                    <Stack spacing=".75rem">
                                        <Typography color={gray800} fontWeight={500}>
                                            Description
                                        </Typography>
                                        <Typography fontSize=".875rem" color={gray500}>
                                            {data?.description}
                                        </Typography>
                                    </Stack>
                                </Grid>
                            </Grid>
                            <Grid container mt="2rem">
                                <Grid item xs={12} lg={4} mb=".75rem">
                                    <Stack spacing=".75rem">
                                        <Typography color={gray800} fontWeight={500}>
                                            Type
                                        </Typography>
                                        <Typography fontSize=".875rem" color={gray500}>
                                            {data?.type}
                                        </Typography>
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} lg={4} mb=".75rem">
                                    <Stack spacing=".75rem">
                                        <Typography color={gray800} fontWeight={500}>
                                            Version
                                        </Typography>
                                        <Typography fontSize=".875rem" color={gray500}>
                                            {data?.versionInfo}
                                        </Typography>
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} lg={4} mb=".75rem">
                                    <Stack spacing=".75rem">
                                        <Typography color={gray800} fontWeight={500}>
                                            OWL equivalent
                                        </Typography>
                                        <Typography fontSize=".875rem" color={gray500}>
                                            {data?.owlEquivalent}
                                        </Typography>
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} lg={4} mb=".75rem">
                                    <Stack spacing=".75rem">
                                        <Typography color={gray800} fontWeight={500}>
                                            Originally submitted by
                                        </Typography>
                                        <Typography fontSize=".875rem" color={gray500}>
                                            {data?.submittedBy}
                                        </Typography>
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} lg={4} mb=".75rem">
                                    <Stack spacing=".75rem">
                                        <Typography color={gray800} fontWeight={500}>
                                            Last modified by
                                        </Typography>
                                        <Typography fontSize=".875rem" color={gray500}>
                                            {data?.lastModifiedBy}
                                        </Typography>
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} lg={4} mb=".75rem">
                                    <Stack spacing=".75rem">
                                        <Typography color={gray800} fontWeight={500}>
                                            Last modify timestamp
                                        </Typography>
                                        <Typography fontSize=".875rem" color={gray500}>
                                            {data?.lastModifyTimestamp}
                                        </Typography>
                                    </Stack>
                                </Grid>
                            </Grid>
                            <Box width={1} mt={4}>
                                <Hierarchy />
                            </Box>
                            <Box width={1} mt={4}>
                                <Predicates data={data} loading={loading} />
                            </Box>
                        </>
                    )}
                </Box>
            )}
        </Box >
    );
}