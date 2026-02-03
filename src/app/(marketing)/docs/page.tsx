"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Home,
    Menu,
    Zap,
    ChevronRight,
    Github,
    Book,
    Terminal,
    Smartphone,
    Code2,
    UploadCloud,
    Star
} from 'lucide-react';
import { Introduction } from './components/sections/Introduction';
import { Installation } from './components/sections/Installation';
import { Usage } from './components/sections/Usage';
import { HowItWorks } from './components/sections/HowItWorks';
import { ApiReference } from './components/sections/ApiReference';

export default function Docs() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('');
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

    useEffect(() => {
        const handleScroll = () => {
            const sections = document.querySelectorAll('section[id], div[id^="api-"]');
            let current = '';
            sections.forEach(section => {
                const sectionTop = (section as HTMLElement).offsetTop;
                if (window.scrollY >= sectionTop - 100) {
                    current = section.getAttribute('id') || '';
                }
            });
            setActiveSection(current);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 80;
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            setActiveSection(id);
            if (window.innerWidth < 1024) setIsSidebarOpen(false);
        }
    };

    const navItems = [
        { id: 'introduction', label: 'Introduction', icon: Book },
        { id: 'installation', label: 'Installation', icon: Terminal },
        { id: 'usage', label: 'Usage Guide', icon: Smartphone },
        { id: 'how-it-works', label: 'How It Works', icon: Zap },
        {
            id: 'api-reference',
            label: 'API Reference',
            icon: Code2,
            children: [
                { id: 'api-auth', label: 'Authentication & Setup' },
                { id: 'api-user', label: 'User Management' },
                { id: 'api-view', label: 'Files & Folders' },
                { id: 'api-upload', label: 'Upload System' },
                { id: 'api-share', label: 'File Sharing' },
                { id: 'api-images', label: 'Images & Thumbnails' },
                { id: 'api-system', label: 'System Info' },
            ]
        },
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-gray-300 font-sans selection:bg-blue-500/30">

            {/* Top Navigation */}
            <header className="fixed top-0 w-full h-16 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-gray-800 z-50">
                <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <Menu size={20} />
                        </button>
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="bg-blue-600/20 p-1.5 rounded-lg group-hover:bg-blue-600/30 transition-colors">
                                <Zap className="text-blue-500 w-5 h-5" fill="currentColor" />
                            </div>
                            <span className={`text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500`}>
                                Aaxion <span className="font-cursive text-2xl mx-1">Drive</span> Docs
                            </span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <a
                            href="https://github.com/codershubinc/aaxion"
                            target="_blank"
                            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg hover:border-gray-700 transition-colors text-sm font-medium"
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
                        <Link
                            href="/"
                            className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
                            title="Back to Home"
                        >
                            <Home size={20} />
                        </Link>
                    </div>
                </div>
            </header>

            <div className="pt-16 flex max-w-8xl mx-auto">

                {/* Sidebar */}
                <aside className={`
                    fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-72 bg-[#0a0a0a] border-r border-gray-800 overflow-y-auto transform transition-transform duration-300 z-40
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}>
                    <nav className="p-6 space-y-1">
                        <div className="mb-6 px-3">
                            <h5 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Documentation</h5>
                        </div>
                        {navItems.map((item) => (
                            <div key={item.id} className="space-y-1">
                                <button
                                    onClick={() => scrollToSection(item.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${activeSection === item.id || (item.children && item.children.some(child => activeSection === child.id))
                                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-900'
                                        }`}
                                >
                                    <item.icon size={16} className={activeSection === item.id || (item.children && item.children.some(child => activeSection === child.id)) ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'} />
                                    {item.label}
                                    {activeSection === item.id && (
                                        <ChevronRight size={14} className="ml-auto opacity-50" />
                                    )}
                                </button>
                                {item.children && (activeSection === item.id || item.children.some(child => activeSection === child.id)) && (
                                    <div className="ml-4 pl-4 border-l border-gray-800 space-y-1 mt-1">
                                        {item.children.map((child) => (
                                            <button
                                                key={child.id}
                                                onClick={() => scrollToSection(child.id)}
                                                className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${activeSection === child.id
                                                    ? 'text-blue-400 font-medium'
                                                    : 'text-gray-500 hover:text-gray-300'
                                                    }`}
                                            >
                                                {child.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        <div className="mt-8 mb-4 px-3">
                            <h5 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Resources</h5>
                        </div>
                        <a href="https://github.com/codershubinc/aaxion/releases" target="_blank" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-900 transition-colors">
                            <UploadCloud size={16} />
                            Releases
                        </a>
                    </nav>
                </aside>

                {/* Overlay for mobile sidebar */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-12 py-10 lg:py-12">

                        {/* Hero */}
                        <div className="mb-16">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20 mb-6">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                    </span>
                                    v1.0.0 Stable
                                </span>
                                <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-6">
                                    Aaxion <span className="font-cursive text-blue-400 mx-2 text-6xl">Drive</span> Documentation
                                </h1>
                                <p className="text-xl text-gray-400 leading-relaxed max-w-2xl">
                                    Turn your legacy hardware into a high-performance, secure file cloud. Stream files efficiently with zero-buffer technology.
                                </p>
                            </motion.div>
                        </div>

                        <Introduction />
                        <Installation />
                        <Usage />
                        <HowItWorks />
                        <ApiReference />

                    </div>

                    {/* Footer */}
                    <footer className="border-t border-gray-800 bg-[#0a0a0a] mt-20">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                <div className="mb-4 md:mb-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Zap className="text-blue-500 w-6 h-6" />
                                        <span className="text-xl font-bold text-gray-200">
                                            Aaxion <span className="font-cursive text-blue-500 ml-1 text-2xl">Drive</span>
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        &copy; {new Date().getFullYear()} CodersHub Inc. Licensed under GNU AGPLv3.
                                    </p>
                                </div>
                                <div className="flex gap-6 text-sm font-medium">
                                    <span className="text-gray-600 cursor-default">No Telemetry</span>
                                    <a
                                        href="https://github.com/codershubinc/aaxion/blob/main/LICENSE"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-500 hover:text-white transition-colors"
                                    >
                                        License
                                    </a>
                                    <a
                                        href="https://github.com/codershubinc/aaxion"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-500 hover:text-white transition-colors"
                                    >
                                        GitHub
                                    </a>
                                </div>
                            </div>
                        </div>
                    </footer>
                </main>
            </div>
        </div>
    );
}
