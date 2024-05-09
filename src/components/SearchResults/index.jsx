import React from 'react';
import { Box, Typography, Grid, ButtonGroup, Button, Stack, FormControl, Select, MenuItem, Divider } from '@mui/material';
import { TableChartIcon, ListIcon } from '../../Icons';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ListView from './ListView';
import { vars } from '../../theme/variables';

const { gray50, gray200, gray300, gray600, gray700 } = vars;

const mockSearchResults = [
    {
        title: 'Nervous system',
        description: 'The nervous system is an organ system containing predominantly neuron and glial cells. In bilaterally symmetrical organism, it is arranged in a network of tree-like structures connected to a central body.In all animals the nervous system probably differentiates from the embryonic ectodermal layer (Swanson, 2014).The main functions of the nervous system are to regulate and control body functions, and to receive sensory input, process this information, and generate behavior."The term was introduced by Monro in 1873.',
        preferredId: 'UBERON:0001016',
        id: 'ILX:0107422',
        type: 'term',
        score: '225.73792',
        organization: 'Interlex'
    },
    {
        title: 'Nervous system',
        description: 'The nervous system is an organ system containing predominantly neuron and glial cells. In bilaterally symmetrical organism, it is arranged in a network of tree-like structures connected to a central body.In all animals the nervous system probably differentiates from the embryonic ectodermal layer (Swanson, 2014).The main functions of the nervous system are to regulate and control body functions, and to receive sensory input, process this information, and generate behavior."The term was introduced by Monro in 1873.',
        preferredId: 'UBERON:0001016',
        id: 'ILX:0107422',
        type: 'term',
        score: '225.73792',
        organization: 'Interlex'
    },
    {
        title: 'Nervous system',
        description: 'The nervous system is an organ system containing predominantly neuron and glial cells. In bilaterally symmetrical organism, it is arranged in a network of tree-like structures connected to a central body.In all animals the nervous system probably differentiates from the embryonic ectodermal layer (Swanson, 2014).The main functions of the nervous system are to regulate and control body functions, and to receive sensory input, process this information, and generate behavior."The term was introduced by Monro in 1873.',
        preferredId: 'UBERON:0001016',
        id: 'ILX:0107422',
        type: 'term',
        score: '225.73792',
        organization: 'Interlex'
    },
    {
        title: 'Nervous system',
        description: 'The nervous system is an organ system containing predominantly neuron and glial cells. In bilaterally symmetrical organism, it is arranged in a network of tree-like structures connected to a central body.In all animals the nervous system probably differentiates from the embryonic ectodermal layer (Swanson, 2014).The main functions of the nervous system are to regulate and control body functions, and to receive sensory input, process this information, and generate behavior."The term was introduced by Monro in 1873.',
        preferredId: 'UBERON:0001016',
        id: 'ILX:0107422',
        type: 'term',
        score: '225.73792',
        organization: 'Interlex'
    },

]

const CustomButton = ({ view, listView, onClick, icon }) => (
    <Button
        sx={{
            background: listView === view ? gray50 : 'transparent',
            '& svg path': {
                fill: listView !== view ? gray300 : 'currentColor'
            }
        }}
        disabled={view === 'table' && true}
        // onClick={onClick}
    >
        {icon}
    </Button>
);

const SearchResultsBox = ({ searchTerm }) => {
    const [numberOfVisiblePages, setNumberOfVisiblePages] = React.useState(20);
    const [listView, setListView] = React.useState('list');

    const handleNumberOfPagesChange = (event) => {
        setNumberOfVisiblePages(event.target.value);
    };

    return (
        <Box width={1} height={1} flex={1} display="flex" flexDirection="column" px={4} py={3} gap={3} sx={{ overflowY: 'auto' }}>
            <Grid container justifyContent={{ lg: 'space-between', xs: 'flex-end', md: 'flex-end' }} alignItems="center">
                <Grid item xs={12} lg={8} sm={6}>
                    <Typography variant="h5">{mockSearchResults.length} results for "{searchTerm}" search</Typography>
                </Grid>
                <Grid item xs={12} lg={4} sm={6}>
                    <Box display="flex" alignItems="center" gap={2} justifyContent="end">
                        <Stack direction="row" alignItems="center" gap={1}>
                            <Typography variant="caption" sx={{ fontSize: '0.875rem', color: gray600 }}>Show on page:</Typography>
                            <FormControl sx={{ minWidth: 75 }}>
                                <Select
                                    value={numberOfVisiblePages}
                                    onChange={handleNumberOfPagesChange}
                                    displayEmpty
                                    IconComponent={KeyboardArrowDownIcon}
                                    sx={{
                                        color: gray700,
                                        borderRadius: '0.5rem',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        '& .MuiOutlinedInput-input': {
                                            padding: '0.625rem 0.875rem'
                                        },
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: gray300
                                        },
                                        '& .MuiSvgIcon-root': {
                                            color: gray700,
                                            fontSize: '1.25rem'
                                        }
                                    }}
                                >
                                    <MenuItem value={10}>10</MenuItem>
                                    <MenuItem value={20}>20</MenuItem>
                                    <MenuItem value={30}>30</MenuItem>
                                </Select>
                            </FormControl>
                        </Stack>
                        <Divider orientation="vertical" flexItem sx={{ borderColor: gray200 }} />
                        <ButtonGroup
                            variant="outlined"
                            aria-label="View mode"
                            sx={{
                                borderRadius: '0.5rem',
                                '& .MuiButton-root:focus': {
                                    boxShadow: 'none',
                                    background: gray50
                                }
                            }}
                        >
                            <CustomButton
                                view="list"
                                listView={listView}
                                onClick={() => setListView('list')}
                                icon={<ListIcon />}
                            />
                            <CustomButton
                                view="table"
                                listView={listView}
                                disabled
                                onClick={() => setListView('table')}
                                icon={<TableChartIcon />}
                            />
                        </ButtonGroup>
                    </Box>
                </Grid>
            </Grid>
            {listView === 'list' ? (
                <ListView searchResults={mockSearchResults} />
            ) : (
                <p>table</p>
            )}
        </Box>
    );
};

export default SearchResultsBox;