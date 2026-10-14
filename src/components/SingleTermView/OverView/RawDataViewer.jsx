import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { a11yLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { getRawData, getTermVersion } from '../../../api/endpoints/apiService';
import { useReportLoading } from '../../../contexts/pageLoading';

import { vars } from '../../../theme/variables';
const { gray25, gray200, gray500 } = vars;

const customStyle = {
    fontSize: '1rem',
    backgroundColor: '#fff',
    fontWeight: 500,
    borderRadius: '0.75rem',
    border: `1px solid ${gray200}`,
    padding: 0
};

const formatExtensions = {
    'JSON-LD': 'jsonld',
    'Turtle': 'ttl',
    'N3': 'n3',
    'OWL': 'owl',
    'CSV': 'csv'
};

const RawDataViewer = ({ dataId, dataFormat, group = "base", versionHash }) => {
    const [formattedData, setFormattedData] = useState(null);
    const [loading, setLoading] = useState(true);
    useReportLoading(loading);

    useEffect(() => {
        setFormattedData(null);
        setLoading(true);
        // A version snapshot is only available as the raw triples payload, not
        // in the selectable RDF serializations.
        const request = versionHash
            ? getTermVersion(group, dataId, versionHash)
            : getRawData(group, dataId, formatExtensions[dataFormat]);
        let active = true;
        request
            .then(rawResponse => {
                if (active) setFormattedData(JSON.stringify(rawResponse, null, 2));
            })
            .catch(error => console.error('Error loading raw data:', error))
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => { active = false; };
    }, [dataId, dataFormat, group, versionHash]);

    return (
        <div style={{ maxWidth: '81.25rem' }}>
            {formattedData ? (
                <SyntaxHighlighter
                    language={dataFormat}
                    style={a11yLight}
                    showLineNumbers
                    customStyle={customStyle}
                    lineNumberStyle={{
                        fontWeight: 700,
                        textAlign: 'left',
                        color: gray500,
                        borderRight: `1px solid ${gray200}`,
                        background: gray25,
                        width: '4.875rem',
                        paddingBottom: '0.125rem',
                        paddingRight: '1.5rem',
                        paddingLeft: '1.5rem',
                        marginRight: '1.5rem'
                    }}
                >
                    {formattedData}
                </SyntaxHighlighter>
            ) : !loading && (
                <div>No data available</div>
            )}
        </div>
    );
};

RawDataViewer.propTypes = {
    dataId: PropTypes.string.isRequired,
    dataFormat: PropTypes.string.isRequired,
    group: PropTypes.string,
    versionHash: PropTypes.string
};

export default RawDataViewer;
