import React from 'react';
import { Box, Typography, IconButton, Tooltip, FormGroup, FormLabel, FormControl, Button } from '@mui/material';
import Checkbox from '../common/CustomCheckbox';
import { useContext } from "react";
import { GlobalDataContext } from "./../../contexts/DataContext";
import { CollapseIcon, HelpOutlinedIcon, ExpandIcon } from '../../Icons';
import { vars } from '../../theme/variables';

const { gray200, gray600, gray800, brand700, brand800 } = vars;

export default function FiltersSidebar({filterOptions}) {
    const [open, setOpen] = React.useState(true);
    // Filters stored in context
    const { searchTypeFilter, setTypeFiltersData } = useContext(GlobalDataContext);
    const [expandedFilters, setExpandedFilters] = React.useState({});
    const [filterValues, setFilterValues] = React.useState(
        filterOptions.reduce((acc, option) => {
            acc[option.category] = option.values.map(value => ({
                title: value.title,
                count: value.count,
                isChecked: value.isChecked
            }));
            return acc;
        }, {})
    );


    // Store filters changes in context
    const handleSaveFilters = (values) => {
        setTypeFiltersData(values);
    };

    const handleToggleExpand = (category) => {
        setExpandedFilters((prev) => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    const handleCheckboxChange = (category, index) => {
        setFilterValues(prev => {
            const updatedCategory = [...prev[category]];
            updatedCategory[index].isChecked = !updatedCategory[index].isChecked;

            return {
                ...prev,
                [category]: updatedCategory
            };
        });
    };

    // Respond to filters changes in context
    React.useEffect( () => {
        console.log("Filters stored ", searchTypeFilter)
    }, [searchTypeFilter])

    // Save filters in context when they change
    React.useEffect( () => {
        handleSaveFilters(filterValues)
    }, filterValues)

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
                    {filterOptions.map((filterOption) => {
                        const isExpanded = expandedFilters[filterOption.category] || false;
                        const displayedValues = isExpanded ? filterValues[filterOption.category] : filterValues[filterOption.category].slice(0, 10);

                        return (
                            <FormControl key={filterOption.category} sx={{ width: '100%' }} component="fieldset" variant="standard">
                                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
                                    <FormLabel component="legend">{filterOption.category}</FormLabel>
                                    {filterOption?.categoryInfo && (
                                        <Tooltip title={filterOption?.categoryInfo}>
                                            <IconButton sx={{ p: 0, color: '#979B9A' }}>
                                                <HelpOutlinedIcon />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </Box>
                                <FormGroup sx={{ gap: 1.5 }}>
                                    {displayedValues.map((filterValue, index) => (
                                        <Box key={filterValue.title + index} display="flex" alignItems="center" justifyContent="space-between">
                                            <Checkbox
                                                label={filterValue.title}
                                                checked={filterValue.isChecked}
                                                onChange={() => handleCheckboxChange(filterOption.category, index)}
                                            />
                                            <Typography variant="body2" sx={{ color: gray600, lineHeight: '1.25rem' }}>
                                                {filterValue.count}
                                            </Typography>
                                        </Box>
                                    ))}
                                    {filterOption.values.length > 10 && (
                                        <Button
                                            variant="text"
                                            sx={{ width: '5rem', height: '1.25rem', p: 0, color: brand700, '&:hover': { color: brand800, background: 'transparent' } }}
                                            onClick={() => handleToggleExpand(filterOption.category)}
                                        >
                                            {isExpanded ? 'Show less' : 'Show more'}
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
