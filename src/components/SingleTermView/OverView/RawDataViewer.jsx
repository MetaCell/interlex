import React, { useState, useEffect } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { a11yLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import axios from 'axios';
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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const responseType = ['JSON-LD', 'CSV'].includes(dataFormat) ? 'json' : 'text';
                const response = await axios.get(`http://uri.interlex.org/base/${dataId}.${formatExtensions[dataFormat]}`);

                setFormattedData(responseType === 'json' ? JSON.stringify(response.data, null, 2) : convertToTurtle(response.data));
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [dataId, dataFormat]);

    const convertToTurtle = (json) => {
        const prefixes = json.prefixes ? Object.entries(json.prefixes).map(([key, value]) => `@prefix ${key}: <${value}> .`).join('\n') : '';

        const triples = json.triples ? json.triples.map(triple => {
            const subject = triple[0].startsWith('http') ? `<${triple[0]}>` : triple[0];
            const predicate = triple[1].startsWith('http') ? `<${triple[1]}>` : triple[1];
            const object = triple[2].startsWith('http') ? `<${triple[2]}>` : `"${triple[2]}"`;
            return `${subject} ${predicate} ${object} .`;
        }).join('\n') : '';

        return `${prefixes}\n\n${triples}`;
    };

    // const language = dataFormat === 'Turtle' ? 'python' : dataFormat.toLowerCase();

    return (
        <div style={{ maxWidth: '81.25rem' }}>
            {formattedData ? (
                <SyntaxHighlighter
                    // language={language}
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

export default RawDataViewer;
