import React from "react";
import PropTypes from 'prop-types';
import HistoryItem from "./HistoryItem";
import { Box, List } from "@mui/material";
import { getVersions } from "../../../api/endpoints/apiService";
import { vars } from "../../../theme/variables";

const { gray50 } = vars;

const HistoryPanel = ({ searchTerm, group = "base" }) => {
    const [versions, setVersions] = React.useState([]);

    React.useEffect(() => {
        getVersions(group, searchTerm).then(data => {
            const oldestEntries = data.versions.map(version => {
                const oldestAppearance = [...version.appears_in].sort((a, b) =>
                    new Date(a.first_seen.replace(',', '.')) - new Date(b.first_seen.replace(',', '.'))
                )[0];

                const uriParts = oldestAppearance.uri.split('http://uri.interlex.org/')[1].split('/');
                const forkName = uriParts[0];

                return {
                    date: oldestAppearance.first_seen,
                    fork: forkName,
                    identityGraph: version["identity-graph"]
                };
            }).sort((a, b) =>
                new Date(a.date.replace(',', '.')) - new Date(b.date.replace(',', '.'))
            );
            setVersions(oldestEntries);
        });
    }, [group, searchTerm]);

    return (
        <Box p="2.5rem 5rem" sx={{ overflow: 'auto' }}>
            <List disablePadding width={1} sx={{ maxWidth: '50rem' }}>
                {versions.map((entry, index) => (
                    <Box key={`${entry.identityGraph}_${index}`} sx={{
                        paddingLeft: '1rem',
                        borderRadius: '0.375rem',
                        '&:hover': {
                            backgroundColor: gray50,
                            '& .MuiIconButton-root': {
                                display: 'flex'
                            }
                        }
                    }}>
                        <HistoryItem entry={entry} />
                    </Box>
                ))}
            </List>
        </Box>
    );
};

HistoryPanel.propTypes = {
    searchTerm: PropTypes.string,
    group: PropTypes.string
}

export default HistoryPanel;
