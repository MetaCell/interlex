import React from 'react';
import { Box, Typography, Grid, ButtonGroup, Button, Stack, Chip, FormControl, Select, MenuItem } from '@mui/material';

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

const SearchResultsBox = ({searchTerm}) => {
    const [age, setAge] = React.useState(20);

    const handleChange = (event) => {
        setAge(event.target.value);
    };
    return (
        <Box width={1} height={1} display="flex" flexDirection="column" px={4} py={3} gap={3}>
            <Box>
                <Grid container alignItems='center' sx={{ justifyContent: { lg: "space-between", xs: "flex-end" } }}>
                    <Grid item xs={12} lg={8} sm={6}>
                        <Typography variant='h5' fontWeight={600} sx={{color: '#515252'}}>{mockSearchResults.length} results for "{searchTerm}" search</Typography>
                    </Grid>
                    <Grid item xs={12} lg={4} sm={6}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Stack direction="row" alignItems="center">
                                <Typography>Show on page:</Typography>
                                <FormControl sx={{ minWidth: 75 }}>
                                    <Select
                                        value={age}
                                        onChange={handleChange}
                                        displayEmpty
                                        inputProps={{ 'aria-label': 'Without label' }}
                                    >
                                        <MenuItem value={10}>10</MenuItem>
                                        <MenuItem value={20}>20</MenuItem>
                                        <MenuItem value={30}>30</MenuItem>
                                    </Select>
                                </FormControl>
                            </Stack>
                            <ButtonGroup variant="contained" aria-label="Basic button group">
                                <Button>One</Button>
                                <Button>Two</Button>
                            </ButtonGroup>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
            <Box>
                {mockSearchResults.map((searchResult, index) => {
                    return (
                        <Box key={searchResult.title + index} sx={{ borderBottom: '1px solid #DADDDC', p: 3 }}>
                            <Grid container spacing={3}>
                                <Grid item lg={12} xs={12}>
                                    <Stack direction="row" alignItems="center" gap={1.5}>
                                        <Typography>{searchResult.title}</Typography>
                                        <Chip label="Curated" variant="outlined" />
                                    </Stack>
                                </Grid>
                                <Grid item lg={12} xs={12}>
                                    <Typography>{searchResult.description}</Typography>
                                </Grid>
                                <Grid item lg={12} xs={12} sm={12}>
                                    <Box
                                        sx={{
                                            width: '100%',
                                            display: 'flex',
                                            flexDirection: { xs: 'column', lg: 'row', sm: 'row' },
                                            justifyContent: 'space-between'
                                        }}
                                    >
                                        <Stack direction="column" gap={0.5} alignItems="start">
                                            <Typography>Preferred ID</Typography>
                                            <Typography>{searchResult.preferredId}</Typography>
                                        </Stack>
                                        <Stack direction="column" gap={0.5} alignItems="start">
                                            <Typography>ID</Typography>
                                            <Typography>{searchResult.id}</Typography>
                                        </Stack>
                                        <Stack direction="column" gap={0.5} alignItems="start">
                                            <Typography>Type</Typography>
                                            <Typography>{searchResult.type}</Typography>
                                        </Stack>
                                        <Stack direction="column" gap={0.5} alignItems="start">
                                            <Typography>Score</Typography>
                                            <Typography>{searchResult.score}</Typography>
                                        </Stack>
                                        <Stack direction="column" gap={0.5} alignItems="start">
                                            <Typography>Organization</Typography>
                                            <Typography>{searchResult.organization}</Typography>
                                        </Stack>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>
                    )
                })}
            </Box>
        </Box>
    )
};
export default SearchResultsBox;