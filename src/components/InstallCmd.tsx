"use client";

import { useState } from 'react';

export default function InstallCmd() {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText('curl -fsSL https://get.aaxion.tech | sh');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-[#1E1E1E]/80 backdrop-blur-sm border border-[#2D2D2D] rounded-xl p-4 flex items-center justify-between shadow-2xl">
            <code className="font-mono text-blue-400 text-sm sm:text-base">
                curl -fsSL https://get.aaxion.tech | sh
            </code>
            <button
                onClick={handleCopy}
                className="ml-4 p-2 hover:bg-[#2D2D2D] rounded-lg transition text-gray-400 hover:text-white relative"
                title="Copy to clipboard"
            >
                {copied ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><polyline points="20 6 9 17 4 12"></polyline></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                )}
            </button>
        </div>
    );
}
