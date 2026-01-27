"use client";

import { useState, useEffect } from 'react';
import { Github, Star } from 'lucide-react';

export default function GitHubButton() {
    const [stars, setStars] = useState<number | null>(null);

    useEffect(() => {
        const fetchStars = async () => {
            try {
                const res = await fetch('https://api.github.com/repos/codershubinc/aaxion');
                const data = await res.json();
                setStars(data.stargazers_count);
            } catch (e) {
                console.error('Failed to fetch stars', e);
            }
        };
        fetchStars();
    }, []);

    return (
        <a
            href="https://github.com/codershubinc/aaxion"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg hover:border-gray-700 transition-colors text-sm font-medium text-gray-300 hover:text-white"
        >
            <Github size={16} />
            <span>GitHub</span>
            {stars !== null && (
                <span className="flex items-center gap-1 ml-1 text-gray-400 border-l border-gray-700 pl-2">
                    <span className="text-xs">{stars}</span>
                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                </span>
            )}
        </a>
    );
}
