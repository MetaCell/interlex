import React from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import javascript from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

SyntaxHighlighter.registerLanguage('javascript', javascript);
const customStyle = {
    fontSize: '1rem',
    borderRadius: '0.75rem',
    backgroundColor: '#fff',
    padding: 0,
    border: `1px solid #DADDDC`
};


const CodeSnippet = ({ code }) => {
    return (
        <div>
            <SyntaxHighlighter
                language="javascript"
                style={docco}
                showLineNumbers
                customStyle={customStyle}
                lineProps={{ style: { wordBreak: 'break-all', whiteSpace: 'pre-wrap' } }}
                // wrapLines={true}
            >
                {code}
            </SyntaxHighlighter>
        </div>
    );
};

export default CodeSnippet;
