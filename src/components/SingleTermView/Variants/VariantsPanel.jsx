import * as React from 'react';
import PropTypes from 'prop-types';
import { Box, CircularProgress } from '@mui/material';
import VariantsTable from './VariantsTable';
import ErrorModal from '../../common/ErrorModal';
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
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        let active = true;
        setLoading(true);
        setError(null);
        getVariants(group, searchTerm)
            .then(data => {
                if (active) setVariants(Array.isArray(data) ? data : (data ?? []));
            })
            .catch(err => {
                if (active) {
                    setError(err);
                    setVariants([]);
                }
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => { active = false; };
    }, [group, searchTerm]);

    if (loading) {
        return <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
            <CircularProgress />
        </Box>
    }

    if (error) {
        return <ErrorModal
            open
            onClose={() => setError(null)}
            title="Failed to load variants"
            error={error}
        />
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
