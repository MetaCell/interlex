import React from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import { StartIcon, JoinRightIcon } from '../../Icons';
import { vars } from '../../theme/variables';

const { gray200, gray800, brand600 } = vars;


export default function NewTermSidebar({ open, onToggle }) {

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
                <Box width={1} display="flex" flexDirection="column" alignItems="center" gap={1}>
                    <Box width={1} display="flex" flexDirection="column" px={1} py={1.5} gap={1}
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
                        <Typography variant='body1' sx={{ color: '#313534', fontWeight: 500 }}>Nervous system</Typography>
                        <Typography variant='caption' sx={{
                            color: '#707574',
                            overflow: 'hidden',
                            letterSpacing: 0,
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis'
                        }}
                        >
                            The nervous system is an organ system containing predominantly neuron and glial cells. In bilaterally symmetrical organism, it is arranged in a network of tree-like structures connected to a central body.In all animals the nervous system probably differentiates from the embryonic ectodermal layer (Swanson, 2014).The main functions of the nervous system are to regulate and control body functions, and to receive sensory input, process this information, and generate behavior."The term was introduced by Monro in 1873.
                        </Typography>
                    </Box>
                </Box>
            )
            }
        </Box >
    );
}
