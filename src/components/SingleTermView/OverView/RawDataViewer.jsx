import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { a11yLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { getRawData } from '../../../api/endpoints/apiService';

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

const RawDataViewer = ({ dataId, dataFormat }) => {
    const [formattedData, setFormattedData] = useState(null);
    // eslint-disable-next-line no-unused-vars
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getRawData("base",dataId, formatExtensions[dataFormat]).then( rawResponse => {
        setFormattedData(JSON.stringify(rawResponse, null, 2));
        setLoading(false)
      })
    }, [dataId, dataFormat]);

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
            ) : (
                <div>Loading...</div>
            )}
        </div>
    );
};

RawDataViewer.propTypes = {
    dataId: PropTypes.string.isRequired,
    dataFormat: PropTypes.string.isRequired
};

export default RawDataViewer;
