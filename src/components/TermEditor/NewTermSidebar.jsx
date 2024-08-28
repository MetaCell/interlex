import React from 'react';
import { Box, Typography, IconButton, Tooltip, Stack, CircularProgress } from '@mui/material';
import { StartIcon, JoinRightIcon } from '../../Icons';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { vars } from '../../theme/variables';

const { gray200, gray800, brand600 } = vars;


export default function NewTermSidebar({ open, loading, onToggle, results, isResultsEmpty }) {

    if (loading) {
        return <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32rem' }}>
            <CircularProgress />
        </Box>
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                borderLeft: `1px solid ${gray200}`,
                transition: 'all 0.5s ease',
                p: 3,
                width: open ? '32rem' : '5.75rem',
                overflowY: 'auto',
                '::-webkit-scrollbar': {
                    display: 'none', // Hide scrollbar in Chrome, Safari
                },
                scrollbarWidth: 'none', // Hide scrollbar in Firefox
            }}
        >
            {open ? (
                <Box width={1} display="flex" alignItems="center" justifyContent="space-between" mb={5}>
                    <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: gray800 }}>Potential matches</Typography>
                    <Tooltip title="Collapse potential matches" placement='left'>
                        <IconButton onClick={onToggle} sx={{ border: `1px solid ${gray200}` }}>
                            <StartIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            ) : (
                <Box>
                    <Tooltip title="Open potential matches" placement='left'>
                        <IconButton onClick={onToggle} sx={{ border: `1px solid ${gray200}` }}>
                            <JoinRightIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            )}
            {open && (
                <Box width={1} height={1} display="flex" flexDirection="column" alignItems="center" gap={1}>
                    {isResultsEmpty ? (
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
                        <>{results.map((result) => (
                            <Box width={1} key={result.id} display="flex" flexDirection="column" px={1} py={1.5} gap={1}
                                sx={{
                                    borderBottom: '1px solid #DADDDC',
                                    position: 'relative',
                                    '&:hover': {
                                        '& .MuiTypography-body1': { color: '#1C5F54' },
                                        '&:before': {
                                            position: 'absolute',
                                            left: 0,
                                            content: '""',
                                            height: '1.5rem',
                                            borderRadius: '3px',
                                            width: '2px',
                                            background: brand600
                                        }
                                    }
                                }}
                            >
                                <Typography variant='body1' sx={{ color: '#313534', fontWeight: 500 }}>{result.label}</Typography>
                                <Typography variant='caption' sx={{
                                    color: '#707574',
                                    overflow: 'hidden',
                                    letterSpacing: 0,
                                    whiteSpace: 'nowrap',
                                    textOverflow: 'ellipsis'
                                }}
                                >
                                    {result.description}
                                </Typography>
                            </Box>
                        ))}</>
                    )}
                </Box>
            )}
        </Box >
    );
}
