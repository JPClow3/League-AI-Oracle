import React from 'react';
import { KeywordHighlighter } from '../Academy/KeywordHighlighter';

// A safer, more robust component to render basic markdown features.
// It parses the text into React elements instead of using dangerouslySetInnerHTML.
// Supports paragraphs, bold (**text**), and unordered lists (* item or - item).

const renderLine = (line: string) => {
    // Bold: **text**
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return (
        <>
            {parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={i}>{part.slice(2, -2)}</strong>;
                }
                // Wrap plain text segments with the keyword highlighter
                return <React.Fragment key={i}><KeywordHighlighter text={part} /></React.Fragment>;
            })}
        </>
    );
};

export const MarkdownRenderer = ({ text }: { text: string }) => {
    if (!text) return null;
    // Split by one or more newlines to handle paragraphs and lists more robustly.
    const blocks = text.split(/\n\s*\n/).filter(block => block.trim() !== '');

    return (
        <div className="space-y-4 leading-relaxed">
            {blocks.map((block, i) => {
                const lines = block.split('\n').filter(line => line.trim() !== '');
                const isList = lines.every(line => line.trim().startsWith('* ') || line.trim().startsWith('- '));

                if (isList) {
                    return (
                        <ul key={i} className="list-disc pl-5 space-y-2">
                            {lines.map((item, j) => (
                                <li key={j}>
                                    {renderLine(item.replace(/^[\s]*[\*\-]\s/, ''))}
                                </li>
                            ))}
                        </ul>
                    );
                }

                // Render as a paragraph block.
                return (
                    <p key={i}>
                        {lines.map((line, j) => (
                            <React.Fragment key={j}>
                                {renderLine(line)}
                                {j < lines.length - 1 && <br />}
                            </React.Fragment>
                        ))}
                    </p>
                );
            })}
        </div>
    );
};