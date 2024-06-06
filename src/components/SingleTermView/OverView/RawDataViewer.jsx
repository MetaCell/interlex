import React from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark, atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';

function identifyFormat(text) {
    try {
        JSON.parse(text);
        return 'json';
    } catch (e) {
        if (/(@prefix|PREFIX)/i.test(text)) {
            return 'turtle';
        }
    }
    return 'unknown';
}

const RawDataViewer = ({ data }) => {
    const format = identifyFormat(data);

    return (
        <div>
            {format === 'json' && (
                <SyntaxHighlighter language="json" >
                    {data}
                </SyntaxHighlighter>
            )}
            {format === 'turtle' && (
                <SyntaxHighlighter language="turtle">
                    {data}
                </SyntaxHighlighter>
            )}
            {format === 'unknown' && (
                <SyntaxHighlighter language="turtle">
                    {data}
                </SyntaxHighlighter>
            )}
        </div>
    );
};

export default RawDataViewer;
