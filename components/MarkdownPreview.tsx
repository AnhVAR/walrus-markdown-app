import React, { useEffect, useRef } from 'react';
import { marked } from 'marked';
import { suiConnectExtension, walruscanExtension, suiscanExtension, walrusImageExtension } from './markedExtensions';

interface MarkdownPreviewProps {
    markdown: string;
    theme?: 'light' | 'dark' | 'github';
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ markdown, theme = 'light' }) => {
    const ref = useRef<HTMLDivElement>(null);

    const getMarkdownText = () => {
        marked.use({
            extensions: [suiConnectExtension, walruscanExtension, suiscanExtension, walrusImageExtension]
        });
        const rawMarkup = marked(markdown);
        return { __html: rawMarkup };
    };

    return (
        <div className={`markdown-preview markdown-preview--${theme}`} ref={ref}>
            <div dangerouslySetInnerHTML={getMarkdownText()} />
        </div>
    );
};

export default MarkdownPreview;