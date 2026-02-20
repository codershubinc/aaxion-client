"use client";

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

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
                    <Check size={16} className="text-green-500" />
                ) : (
                    <Copy size={16} />
                )}
            </button>
        </div>
    );
}
