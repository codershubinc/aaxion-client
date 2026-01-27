/*
    Aaxion - Your own local Google Drive
    Copyright (C) 2026 Swapnil Ingle

    This file is part of Aaxion.

    Aaxion is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Aaxion is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with Aaxion.  If not, see <https://www.gnu.org/licenses/>.
*/
import Link from 'next/link';
import InstallCmd from '@/components/InstallCmd';
import GitHubButton from '@/components/GitHubButton';

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col bg-[#121212] text-[#E5E7EB] font-sans">
            {/* Navbar */}
            <nav className="border-b border-[#2D2D2D] bg-[#121212]/80 backdrop-blur-md fixed w-full z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center">
                            <span className="text-2xl font-bold text-blue-500">⚡️ Aaxion Drive</span>
                        </div>
                        <div className="hidden md:flex space-x-8 items-center">
                            <Link href="#" className="text-gray-300 hover:text-white transition">Home</Link>
                            <Link href="/docs" className="text-gray-300 hover:text-white transition">Docs</Link>
                        </div>
                        <div className="flex items-center gap-4">
                            <GitHubButton />
                            <a
                                href="https://github.com/codershubinc/aaxion/releases"
                                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md font-medium transition"
                            >
                                Download
                            </a>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="flex-grow pt-24">
                <div className="py-20 lg:py-32" style={{ background: 'radial-gradient(circle at center, #1E1E1E 0%, #121212 70%)' }}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="flex justify-center mb-8">
                            <a
                                href="https://github.com/codershubinc/aaxion"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm font-semibold transition hover:bg-blue-500/20"
                            >
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                </span>
                                v0.1 Public Beta • Open Source (AGPLv3)
                            </a>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6">
                            Repurpose Old Hardware into <br />
                            <span className="text-blue-500">Efficient Storage Nodes</span>
                        </h1>
                        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-400">
                            A lightweight, high-performance file server written in Go. Zero-buffer streaming, chunked uploads, and secure sharing.
                        </p>
                        <div className="mt-10 flex justify-center gap-4">
                            <Link
                                href="/d"
                                className="px-8 py-3 rounded-lg bg-white text-[#121212] font-bold hover:bg-gray-200 transition"
                            >
                                Get Started
                            </Link>
                            <Link
                                href="/docs"
                                className="px-8 py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 transition"
                            >
                                View Docs
                            </Link>
                            {/* REQUIRED BY AGPL: Source Link */}
                            <a
                                href="https://github.com/codershubinc/aaxion"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-8 py-3 rounded-lg border border-[#3D3D3D] text-gray-300 font-bold hover:border-gray-400 hover:text-white transition"
                            >
                                View Source
                            </a>
                        </div>
                    </div>
                </div>
                <div className="max-w-3xl mx-auto px-4 -mt-10 mb-20 relative z-10">
                    <InstallCmd />
                    <p className="text-center text-xs text-gray-500 mt-3">
                        Or download manually from <Link href="/docs" className="text-gray-400 hover:text-white underline">Releases</Link>
                    </p>
                </div>

                {/* Features Section */}
                <div className="py-20 bg-[#121212]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-white">Why Aaxion Drive?</h2>
                            <p className="mt-4 text-gray-400">Engineered for extreme efficiency on limited resources.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {/* Feature 1 */}
                            <div className="p-6 bg-[#1E1E1E] rounded-xl border border-[#2D2D2D] hover:border-blue-500 transition duration-300">
                                <div className="w-12 h-12 bg-blue-900/30 rounded-lg flex items-center justify-center mb-4 text-2xl">
                                    🚀
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">Zero-Buffer Streaming</h3>
                                <p className="text-gray-400">Uploads and downloads stream directly to disk. A 10GB transfer uses only ~32KB of RAM.</p>
                            </div>
                            {/* Feature 2 */}
                            <div className="p-6 bg-[#1E1E1E] rounded-xl border border-[#2D2D2D] hover:border-blue-500 transition duration-300">
                                <div className="w-12 h-12 bg-blue-900/30 rounded-lg flex items-center justify-center mb-4 text-2xl">
                                    🔄
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">Chunked Uploads</h3>
                                <p className="text-gray-400">Supports split-file uploading to bypass network limits and manage large transfers efficiently.</p>
                            </div>
                            {/* Feature 3 */}
                            <div className="p-6 bg-[#1E1E1E] rounded-xl border border-[#2D2D2D] hover:border-blue-500 transition duration-300">
                                <div className="w-12 h-12 bg-blue-900/30 rounded-lg flex items-center justify-center mb-4 text-2xl">
                                    🔗
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">Secure Sharing</h3>
                                <p className="text-gray-400">Generate one-time secure links for external file sharing with built-in expiration.</p>
                            </div>
                            {/* Feature 4 */}
                            <div className="p-6 bg-[#1E1E1E] rounded-xl border border-[#2D2D2D] hover:border-blue-500 transition duration-300">
                                <div className="w-12 h-12 bg-blue-900/30 rounded-lg flex items-center justify-center mb-4 text-2xl">
                                    🖥️
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">Cross-Platform</h3>
                                <p className="text-gray-400">Written in Go, running efficiently on Linux (primary) and Windows systems.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Resource Stats Section */}
                <div className="py-20 bg-[#1E1E1E]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="lg:flex lg:items-center lg:justify-between">
                            <div className="lg:w-1/2">
                                <h2 className="text-3xl font-bold text-white mb-6">Minimal Resource Footprint</h2>
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-lg font-semibold text-blue-400">Idle State</h4>
                                        <ul className="mt-2 text-gray-300 space-y-1">
                                            <li>• CPU: ~0.0% - 0.1%</li>
                                            <li>• RAM: ~10 MB</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold text-blue-400">Under Load (10GB Transfer)</h4>
                                        <ul className="mt-2 text-gray-300 space-y-1">
                                            <li>• CPU: ~0.8% - 1.0% (I/O Wait)</li>
                                            <li>• RAM: ~20 MB (Peak)</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="lg:w-1/2 mt-10 lg:mt-0 flex justify-center">
                                <div className="bg-[#121212] p-8 rounded-2xl border border-[#2D2D2D] shadow-2xl max-w-sm w-full">
                                    <div className="flex justify-between items-end mb-4">
                                        <span className="text-gray-400">Memory Usage</span>
                                        <span className="text-2xl font-mono text-green-400">20 MB</span>
                                    </div>
                                    <div className="w-full bg-[#2D2D2D] h-2 rounded-full overflow-hidden">
                                        <div className="bg-green-500 h-full w-[5%]"></div>
                                    </div>
                                    <div className="mt-6 flex justify-between items-end mb-4">
                                        <span className="text-gray-400">CPU Load</span>
                                        <span className="text-2xl font-mono text-blue-400">1.0%</span>
                                    </div>
                                    <div className="w-full bg-[#2D2D2D] h-2 rounded-full overflow-hidden">
                                        <div className="bg-blue-500 h-full w-[1%]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-[#121212] border-t border-[#1E1E1E] py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0">
                        <span className="text-xl font-bold text-gray-500">Aaxion Drive</span>
                        {/* LICENSE NOTICE IN FOOTER */}
                        <p className="text-sm text-gray-600 mt-1">
                            © {new Date().getFullYear()} CodersHub Inc. Licensed under GNU AGPLv3.
                        </p>
                    </div>
                    <div className="flex space-x-6">
                        <div className="flex space-x-6 text-sm font-medium">
                            {/* Replaces "Privacy" with a trust signal */}
                            <span className="text-gray-600 cursor-default">No Telemetry</span>
                            <a
                                href="https://github.com/codershubinc/aaxion/blob/main/LICENSE"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-500 hover:text-white transition"
                            >
                                License
                            </a>
                            <a
                                href="https://github.com/codershubinc/aaxion"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-500 hover:text-white transition"
                            >
                                GitHub
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}