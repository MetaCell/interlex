import * as React from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import VariantsTable from './VariantsTable';
import { getVariants } from '../../../api/endpoints/apiService';

const headCells = [
    { id: 'organization', label: 'Organization' },
    { id: 'description', label: 'Description' },
    { id: 'timestamp', label: 'Timestamp' },
    { id: 'status', label: 'Status' },
    { id: 'originated_user', label: 'Originated User' },
    { id: 'editing_user', label: 'Editing User' },
    { id: 'action_buttons', label: '' }
];

const VariantsPanel = () => {
    const [variants, setVariants] = React.useState([]);
    
    React.useEffect(() => {
        getVariants("base","ILX_").then( data => {
            setVariants(data);
        })
    }, []);

    return (
        <Box flexGrow={1} p="2.5rem 5rem" overflow='auto'>
            <VariantsTable rows={variants} headCells={headCells} />
        </Box>
    )
}

VariantsPanel.propTypes = {
    variants: PropTypes.array
}

export default VariantsPanel;
