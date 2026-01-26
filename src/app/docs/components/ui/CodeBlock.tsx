"use client";

import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy } from 'lucide-react';

export const CodeBlock = ({ language, code }: { language: string, code: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group my-4 rounded-xl overflow-hidden border border-gray-800 bg-[#1e1e1e]">
            <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-gray-800">
                <div className="flex items-center space-x-2">
                    <div className="flex space-x-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/20 md:bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 md:bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/20 md:bg-green-500"></div>
                    </div>
                    <span className="text-xs text-gray-400 font-mono ml-2">{language}</span>
                </div>
                <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-md hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
                    title="Copy code"
                >
                    {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                </button>
            </div>
            <div className="text-sm">
                <SyntaxHighlighter
                    language={language}
                    style={vscDarkPlus}
                    customStyle={{ margin: 0, padding: '1.5rem', background: 'transparent' }}
                    showLineNumbers={true}
                    lineNumberStyle={{ minWidth: '2.5em', paddingRight: '1em', color: '#555', textAlign: 'right' }}
                >
                    {code}
                </SyntaxHighlighter>
            </div>
        </div>
    );
};
