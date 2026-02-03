"use client";
import { useEffect, useState, useRef, MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import InstallCmd from '@/components/InstallCmd';
import GitHubButton from '@/components/GitHubButton';
import toast from 'react-hot-toast';
import { motion, useMotionTemplate, useMotionValue, animate, AnimatePresence } from 'framer-motion';
import {
    HardDrive, Tv, Share2, Terminal,
    Cpu, Zap, ChevronRight, Activity,
    Server, ShieldCheck, Download,
    Database, Lock, Globe
} from 'lucide-react';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- Utility ---
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// --- Components ---

// 1. Mouse-tracking Spotlight Card
function SpotlightCard({ children, className = "" }: { children: React.ReactNode, className?: string }) {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <div
            className={cn(
                "group relative border border-white/10 bg-gray-900/50 overflow-hidden rounded-xl",
                className
            )}
            onMouseMove={handleMouseMove}
        >
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                    background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(59, 130, 246, 0.15),
              transparent 80%
            )
          `,
                }}
            />
            <div className="relative h-full">{children}</div>
        </div>
    );
}

// 2. Animated Grid Background
const BackgroundGrid = () => (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-10"></div>
        <div className="absolute top-[-50%] left-[-50%] right-[-50%] bottom-[-50%] bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] animate-grid-flow transform-gpu" />
    </div>
);

// 3. Stats Component
const HUDStat = ({ label, value, color }: { label: string, value: string, color: string }) => (
    <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-widest text-gray-500 font-mono mb-1">{label}</span>
        <div className="flex items-baseline gap-2">
            <span className={cn("text-xl font-bold font-mono", color)}>{value}</span>
            <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", color.replace('text-', 'bg-'))} />
        </div>
    </div>
);

// --- Main Page ---

export default function Home() {
    const router = useRouter();
    const [isReady, setIsReady] = useState(false);

    const [activeFeature, setActiveFeature] = useState(0);
    const features = ["Media Center", "Private Cloud", "Backup Node", "Streaming Hub"];

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveFeature((prev) => (prev + 1) % features.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const [hoveredFeature, setHoveredFeature] = useState(0);

    const featureList = [
        {
            title: "Media Hub",
            description: "Auto-scans, metadata fetch & VLC remote.",
            icon: Tv,
            color: "blue",
            content: (
                <div className="h-full flex flex-col">
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold text-white mb-2">Media Streaming Hub</h3>
                        <p className="text-gray-400">Your personal Netflix. Auto-scans for movies, fetches posters & subtitles. Stream in-browser or control your local VLC player remotely.</p>
                    </div>
                    <div className="mt-auto grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                            <span className="block text-blue-400 font-mono text-xs mb-1">REMOTE</span>
                            <span className="text-white font-bold">VLC Control</span>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                            <span className="block text-purple-400 font-mono text-xs mb-1">METADATA</span>
                            <span className="text-white font-bold">Auto-Fetch</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Smart Drive",
            description: "File explorer with image previews & uploads.",
            icon: HardDrive,
            color: "purple",
            content: (
                <div className="h-full flex flex-col">
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold text-white mb-2">Smart Drive</h3>
                        <p className="text-gray-400">Full-featured file manager. Drag-and-drop uploads, instant image thumbnails, and easy folder navigation.</p>
                    </div>
                    <div className="mt-auto space-y-2 opacity-80 pointer-events-none select-none">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5" >
                            <div className="w-10 h-10 rounded bg-blue-500/20 flex items-center justify-center shrink-0">
                                <span className="text-xs font-bold text-blue-400">JPG</span>
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="h-2 w-24 bg-white/10 rounded" />
                                <div className="h-2 w-16 bg-white/5 rounded" />
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5 ml-4" >
                            <div className="w-10 h-10 rounded bg-purple-500/20 flex items-center justify-center shrink-0">
                                <HardDrive size={16} className="text-purple-400" />
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="h-2 w-32 bg-white/10 rounded" />
                                <div className="h-2 w-20 bg-white/5 rounded" />
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Secure Share",
            description: "Instant encrypted sharing links.",
            icon: Share2,
            color: "emerald",
            content: (
                <div className="h-full flex flex-col">
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold text-white mb-2">Secure Share</h3>
                        <p className="text-gray-400">One-click sharing from your file browser. Generate temporary, encrypted links for external access.</p>
                    </div>
                    <div className="mt-auto p-4 rounded-xl bg-[#0F0F0F] border border-white/10 font-mono text-xs text-gray-400 overflow-hidden relative">
                        <span className="text-emerald-500">https://aaxion.cloud/s/</span>
                        <span className="text-gray-600">x8d9-f9k2-m4...</span>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-white/10 text-white text-[10px]">COPIED</div>
                    </div>
                </div>
            )
        },
        {
            title: "Self Hosted",
            description: "100% On-Premise & Private.",
            icon: ShieldCheck,
            color: "orange",
            content: (
                <div className="h-full flex flex-col">
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold text-white mb-2">Your Data, Your Rules</h3>
                        <p className="text-gray-400">Aaxion runs entirely on your hardware. No telemetry, no external servers, no subscription fees.</p>
                    </div>
                    <div className="mt-auto flex items-center justify-center h-32 bg-white/5 rounded-xl border border-white/5 relative overflow-hidden">
                        <div className="absolute inset-0 bg-blue-500/10 animate-pulse" />
                        <ShieldCheck size={48} className="text-green-500 relative z-10" />
                    </div>
                </div>
            )
        },
        {
            title: "Performance",
            description: "Written in Go. Zero-copy I/O.",
            icon: Cpu,
            color: "blue",
            content: (
                <div className="h-full flex flex-col">
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold text-white mb-2">Hyper-Efficient Engine</h3>
                        <p className="text-gray-400">Optimized for zero-copy I/O. Runs on Raspberry Pi 4 with <strong className="text-white">under 50MB RAM</strong>.</p>
                    </div>
                    <div className="mt-auto bg-black/80 backdrop-blur-md p-4 rounded-xl border border-white/10 w-full shadow-lg">
                        <div className="space-y-4">
                            <HUDStat label="Memory" value="24 MB" color="text-emerald-400" />
                            <HUDStat label="CPU Load" value="0.5 %" color="text-blue-400" />
                        </div>
                    </div>
                </div>
            )
        }
    ];


    // Auth Check
    useEffect(() => {
        const isTauri = typeof window !== 'undefined' && (
            (window as any).__TAURI__ || (window as any).__TAURI_INTERNALS__
        );
        if (isTauri) {
            toast.success("Transfering to /login");
            router.replace('/login');
        } else {
            setIsReady(true);
        }
    }, [router]);

    if (!isReady) return <div className="min-h-screen bg-[#050505]" />;

    return (
        <div className="min-h-screen bg-[#050505] text-gray-100 font-sans selection:bg-blue-500/30 overflow-x-hidden">

            {/* Navbar */}
            <nav className="fixed w-full z-50 top-0 border-b border-white/5 bg-[#050505]/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.5)]">
                            <Zap className="text-white w-5 h-5 fill-white" />
                        </div>
                        <span className="text-lg font-bold tracking-tight">Aaxion<span className="text-blue-500">Drive</span></span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:block">
                            <GitHubButton />
                        </div>
                        <a href="https://github.com/codershubinc/aaxion/releases" className="bg-white text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 transition">
                            Download
                        </a>
                    </div>
                </div>
            </nav>

            <main className="relative pt-32 pb-20">
                <BackgroundGrid />

                {/* Hero Section */}
                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">

                    {/* Version Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-mono mb-8 backdrop-blur-sm"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        v0.1 Public Beta
                    </motion.div>

                    {/* Headline */}
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white mb-6 leading-[0.9]">
                        Your Personal <br />
                        <span className="relative inline-block mt-2">
                            <span className="absolute -inset-8 bg-blue-600/30 blur-2xl rounded-full opacity-0 animate-pulse"></span>
                            <span key={activeFeature} className="relative text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 block animate-fade-in-up">
                                {features[activeFeature]}
                            </span>
                        </span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-lg text-gray-400 mb-10 leading-relaxed">
                        Turn any hardware into a high-performance cloud. <br className="hidden md:block" />
                        Stream media, sync files, and backup data with a <strong className="text-white">single binary</strong>.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                        <Link href="/d" className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition shadow-[0_0_30px_rgba(37,99,235,0.3)] flex items-center justify-center gap-2 group">
                            Get Started
                            <ChevronRight className="group-hover:translate-x-1 transition-transform" size={18} />
                        </Link>
                        <Link href="/docs" className="w-full sm:w-auto px-8 py-4 bg-[#1a1a1a] hover:bg-[#252525] border border-white/10 text-gray-300 rounded-xl font-bold transition flex items-center justify-center gap-2">
                            <Terminal size={18} /> Documentation
                        </Link>
                    </div>

                    {/* Command Bar */}
                    <div className="max-w-3xl mx-auto -mt-8 mb-24">
                        <div className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition duration-700" />
                            <InstallCmd />
                        </div>
                    </div>
                </div>

                {/* INTERACTIVE FEATURE SHOWCASE */}
                <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
                    <div className="mb-16">
                        <h2 className="text-3xl font-bold text-white mb-4">Everything you need. <span className="text-gray-500">Nothing you don&apos;t.</span></h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                        {/* Sidebar List */}
                        <div className="lg:col-span-4 flex flex-col justify-center space-y-2">
                            {featureList.map((feature, index) => (
                                <button
                                    key={index}
                                    onMouseEnter={() => setHoveredFeature(index)}
                                    // Make it clickable for mobile users where hover isn't reliable
                                    onClick={() => setHoveredFeature(index)}
                                    className={cn(
                                        "group flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-300 border border-transparent",
                                        hoveredFeature === index
                                            ? "bg-white/10 border-white/10 shadow-lg"
                                            : "hover:bg-white/5 hover:border-white/5"
                                    )}
                                >
                                    <div className={cn(
                                        "w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-300",
                                        hoveredFeature === index
                                            ? `bg-${feature.color}-500/20 text-${feature.color}-400`
                                            : "bg-white/5 text-gray-400 group-hover:text-white"
                                    )}>
                                        <feature.icon size={20} />
                                    </div>
                                    <div>
                                        <h3 className={cn(
                                            "font-bold text-base transition-colors",
                                            hoveredFeature === index ? "text-white" : "text-gray-400 group-hover:text-gray-200"
                                        )}>
                                            {feature.title}
                                        </h3>
                                        <p className="text-xs text-gray-500 line-clamp-1">{feature.description}</p>
                                    </div>
                                    {hoveredFeature === index && (
                                        <ChevronRight size={16} className="ml-auto text-white/50" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Display Card */}
                        <div className="lg:col-span-8 min-h-[400px] h-full ">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={hoveredFeature}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                    className="h-full"
                                >
                                    <SpotlightCard className="h-full p-8 md:p-12 bg-gradient-to-br from-gray-900 via-black to-black border-white/10 shadow-2xl">
                                        {featureList[hoveredFeature].content}
                                    </SpotlightCard>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Technical Footer */}
                <div className="w-full bg-[#050505] border-t border-white/10 pt-16 pb-24 mt-20">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                            {/* Column 1 */}
                            <div>
                                <h4 className="font-bold text-white mb-6">Project</h4>
                                <ul className="space-y-3 text-sm text-gray-400">
                                    <li>
                                        <a href="#" className="hover:text-blue-400 transition-colors duration-200 flex items-center gap-2">
                                            About
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="hover:text-blue-400 transition-colors duration-200">
                                            Changelog
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="hover:text-blue-400 transition-colors duration-200">
                                            License (AGPLv3)
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            {/* Column 2 */}
                            <div>
                                <h4 className="font-bold text-white mb-6">Resources</h4>
                                <ul className="space-y-3 text-sm text-gray-400">
                                    <li>
                                        <a href="#" className="hover:text-blue-400 transition-colors duration-200">
                                            Documentation
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="hover:text-blue-400 transition-colors duration-200">
                                            API Reference
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="hover:text-blue-400 transition-colors duration-200">
                                            Community
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            {/* Column 3 & 4: Open Source Box */}
                            <div className="col-span-2 md:col-span-2 bg-white/5 rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-colors group">
                                <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                                    <Database size={18} className="text-blue-500 group-hover:scale-110 transition-transform" />
                                    Open Source
                                </h4>
                                <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                                    Aaxion is free software. You can redistribute it and/or modify it under the terms of the GNU Affero General Public License.
                                </p>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-xs font-mono text-gray-500 border-t border-white/5 pt-4">
                                    <span className="text-gray-300">© 2026 Swapnil Ingle</span>
                                    <span className="hidden sm:block text-gray-700">•</span>
                                    <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded">v0.1.0-beta</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}