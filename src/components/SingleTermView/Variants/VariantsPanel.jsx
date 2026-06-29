import * as React from 'react';
import PropTypes from 'prop-types';
import { Box, CircularProgress } from '@mui/material';
import VariantsTable from './VariantsTable';
import ErrorModal from '../../common/ErrorModal';

const headCells = [
    { id: 'fork', label: 'Fork' },
    { id: 'title', label: 'Title' },
    { id: 'firstSeen', label: 'First seen' },
    { id: 'tripleCount', label: 'Triples' },
    { id: 'identityRecord', label: 'Identity record' },
    { id: 'action_buttons', label: '', sortable: false, width: '3.5rem' }
];

// "2025-07-14T07:51:30,032321Z" -> Date (backend uses comma as decimal separator)
const parseBackendDate = (value) => new Date(String(value).replace(',', '.'));

// "http://uri.interlex.org/base/ontologies/sync" -> "base"
const forkFromUri = (uri) => {
    const tail = String(uri ?? '').split('http://uri.interlex.org/')[1];
    return tail ? tail.split('/')[0] : '';
};

// Map a /versions vervar-record into rows for the variants table.
const mapVersionsToRows = (data) => {
    const versions = Array.isArray(data?.versions) ? data.versions : [];
    return versions.map(version => {
        const appearances = Array.isArray(version.appears_in) ? version.appears_in : [];
        const oldest = [...appearances].sort(
            (a, b) => parseBackendDate(a.first_seen) - parseBackendDate(b.first_seen)
        )[0];

        const identityRecord = version['identity-record'];
        return {
            id: identityRecord,
            fork: forkFromUri(oldest?.uri),
            title: oldest?.title ?? '',
            firstSeen: oldest?.first_seen
                ? parseBackendDate(oldest.first_seen).toLocaleString()
                : '',
            tripleCount: version.triple_count ?? 0,
            identityRecord: identityRecord ? `${identityRecord.slice(0, 12)}…` : '',
            viri: oldest?.viri ?? ''
        };
    });
};

const VariantsPanel = ({ searchTerm, group = "base", versionsData, versionsLoading, versionsError, onDismissError }) => {
    const variants = React.useMemo(() => mapVersionsToRows(versionsData), [versionsData]);

    if (versionsLoading) {
        return <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
            <CircularProgress />
        </Box>
    }

    if (versionsError) {
        return <ErrorModal
            open
            onClose={onDismissError || (() => {})}
            title="Failed to load variants"
            error={versionsError}
        />
    }

    if (!variants.length) return <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        No variants found
    </Box>

    return (
        <Box flexGrow={1} p="2.5rem 5rem" overflow='auto'>
            <VariantsTable rows={variants} headCells={headCells} group={group} term={searchTerm} />
        </Box>
    )
}

VariantsPanel.propTypes = {
    searchTerm: PropTypes.string,
    group: PropTypes.string,
    versionsData: PropTypes.object,
    versionsLoading: PropTypes.bool,
    versionsError: PropTypes.any,
    onDismissError: PropTypes.func,
}

export default VariantsPanel;
