import * as React from 'react';
import PropTypes from 'prop-types';
import { Box, CircularProgress } from '@mui/material';
import VariantsTable from './VariantsTable';
import { getVariants } from '../../../api/endpoints/apiService';

const headCells = [
    { id: 'organization', label: 'Organization' },
    { id: 'description', label: 'Description' },
    { id: 'timestamp', label: 'Timestamp' },
    { id: 'status', label: 'Status' },
    { id: 'originated_user', label: 'Originating User' },
    { id: 'editing_user', label: 'Editing User' },
    { id: 'action_buttons', label: '' }
];

const VariantsPanel = ({ searchTerm, group = "base" }) => {
    const [variants, setVariants] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        getVariants(group, searchTerm).then(data => {
            setVariants(data);
            setLoading(false);
        })
    }, [group, searchTerm]);

    if (loading) {
        return <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
        </Box>
    }
    if (!variants.length) return <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        No variants found
    </Box>

    return (
        <Box flexGrow={1} p="2.5rem 5rem" overflow='auto'>
            <VariantsTable rows={variants} headCells={headCells} />
        </Box>
    )
}

VariantsPanel.propTypes = {
    searchTerm: PropTypes.string,
    group: PropTypes.string
}

export default VariantsPanel;
