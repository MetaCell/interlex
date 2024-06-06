import React from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism, vs, darcula } from 'react-syntax-highlighter/dist/esm/styles/prism'; // Import additional styles
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import turtle from 'react-syntax-highlighter/dist/esm/languages/prism/turtle';
import markup from 'react-syntax-highlighter/dist/esm/languages/prism/markup'; // General language support, e.g., XML
import { solarizedlight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { vars } from '../../../theme/variables';

const { gray25, gray200, gray500, gray600 } = vars;

// Register the languages
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('turtle', turtle);
SyntaxHighlighter.registerLanguage('markup', markup);

const customStyle = {
    fontSize: '1rem',
    backgroundColor: '#fff',
    fontWeight: 500,
    borderRadius: '0.75rem',
    border: `1px solid ${gray200}`,
    padding: 0
};

// Define different styles for each language
const styles = {
    json: vs,
    turtle: solarizedlight,
    xml: prism, // Use prism for xml and owl
    owl: prism,
    default: prism
};

const CodeSnippet = ({ code, language }) => {
    return (
        <div>
            <SyntaxHighlighter
                language={language}
                customStyle={customStyle}
                style={styles[language] || styles.default}
                showLineNumbers
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
                {code}
            </SyntaxHighlighter>
        </div>
    );
};

export default CodeSnippet;
