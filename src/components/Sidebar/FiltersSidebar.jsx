import React from 'react';
import PropTypes from 'prop-types';
import Checkbox from '../common/CustomCheckbox';
import { CollapseIcon, HelpOutlinedIcon, ExpandIcon } from '../../Icons';
import { Box, Typography, IconButton, Tooltip, FormGroup, FormLabel, FormControl, Button } from '@mui/material';

import { vars } from '../../theme/variables';
const { gray200, gray600, gray800, brand700, brand800 } = vars;

export default function FiltersSidebar({ filters, checkedLabels, handleCheckboxChange }) {
    const [open, setOpen] = React.useState(true);
    const [expandedFilters, setExpandedFilters] = React.useState({});

    const handleToggleExpand = (category) => {
        setExpandedFilters((prev) => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    const nonEmptyFilters = Object.keys(filters).filter(category => Object.keys(filters[category]).length > 0);
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                borderRight: `1px solid ${gray200}`,
                transition: 'all 0.5s ease',
                p: 3,
                pl: open ? 3 : 4,
                width: open ? '18.75rem' : '5.75rem',
                overflowY: 'auto',
                '::-webkit-scrollbar': {
                    display: 'none', // Hide scrollbar in Chrome, Safari
                },
                scrollbarWidth: 'none', // Hide scrollbar in Firefox
            }}
        >
            {open ? (
                <Box width={1} display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                    <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: gray800 }}>Filters</Typography>
                    <IconButton onClick={() => setOpen(!open)} sx={{ border: `1px solid ${gray200}` }}>
                        <CollapseIcon />
                    </IconButton>
                </Box>
            ) : (
                <Box>
                    <IconButton onClick={() => setOpen(!open)} sx={{ border: `1px solid ${gray200}` }}>
                        <ExpandIcon />
                    </IconButton>
                </Box>
            )}
            {open && (
                <Box width={1} display="flex" flexDirection="column" alignItems="center" gap={3}>
                    {nonEmptyFilters.map((category) => {
                        const isExpanded = expandedFilters[category] || false;
                        const displayedValues = isExpanded ? Object.entries(filters[category]) : Object.entries(filters[category]).slice(0, 10);

                        return (
                            <FormControl key={category} sx={{ width: '100%' }} component="fieldset" variant="standard">
                                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
                                    <FormLabel component="legend">{category}</FormLabel>
                                    {category === "Superclass" && (
                                        <Tooltip title={category}>
                                            <IconButton sx={{ p: 0, color: '#979B9A' }}>
                                                <HelpOutlinedIcon />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </Box>
                                <FormGroup sx={{ gap: 1.5 }}>
                                    {// eslint-disable-next-line no-unused-vars
                                    displayedValues.map(([subCategory, details]) => {
                                        return (
                                            <Box key={details.label} display="flex" alignItems="center" justifyContent="space-between">
                                                <Checkbox
                                                    label={details.label}
                                                    checked={checkedLabels[category]?.[details.label] || false}
                                                    onChange={() => handleCheckboxChange(category, details.label)}
                                                />
                                                <Typography variant="body2" sx={{ color: gray600, lineHeight: '1.25rem' }}>
                                                    {details.ids.length}
                                                </Typography>
                                            </Box>
                                        );
                                    })}
                                    {Object.keys(filters[category]).length > 10 && (
                                        <Button
                                            variant="text"
                                            sx={{ width: '5rem', height: '1.25rem', p: 0, color: brand700, '&:hover': { color: brand800, background: 'transparent' } }}
                                            onClick={() => handleToggleExpand(category)}
                                        >
                                            {isExpanded ? 'Show less' : 'Show more '}
                                        </Button>
                                    )}
                                </FormGroup>
                            </FormControl>
                        );
                    })}
                </Box>
            )}
        </Box>
    );
}

FiltersSidebar.propTypes = {
    filters: PropTypes.object.isRequired,
    checkedLabels: PropTypes.object.isRequired,
    handleCheckboxChange: PropTypes.func.isRequired,
};
