'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, HelpCircle, Shield, UserX, KeyRound, Server } from 'lucide-react';
import { useState } from 'react';

export default function LoginInfoPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-gray-300 font-sans p-6 md:p-12">
            <div className="max-w-3xl mx-auto">
                <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 group"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Login
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                            <HelpCircle className="w-8 h-8 text-blue-500" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white">Login Help & FAQ</h1>
                    </div>

                    <p className="text-lg text-gray-400 mb-12 leading-relaxed">
                        Common questions and troubleshooting guide for accessing your Aaxion Drive instance.
                    </p>

                    <div className="space-y-6">
                        <FaqItem
                            icon={KeyRound}
                            question="I forgot my password. How can I reset it?"
                            answer="Aaxion Drive is a self-hosted solution. Currently, checking password reset functionality depends on your administrator's configuration. In most default setups, you must contact your system administrator directly to request a password reset."
                        />

                        <FaqItem
                            icon={UserX}
                            question="I don't have an account yet."
                            answer="Aaxion Drive is a private file system. Accounts are created manually by the server administrator. Please reach out to the person hosting this instance to request access."
                        />

                        <FaqItem
                            icon={Shield}
                            question="Is my login secure?"
                            answer="Yes. We use industry-standard token-based authentication. Your credentials are exchanged for a secure session token that authenticates your requests. Ensure this site is served over HTTPS for maximum security."
                        />

                        <FaqItem
                            icon={Server}
                            question="Why can't I connect to the server?"
                            answer="If you see network errors, ensure you are connected to the internet and that the Aaxion Drive server is online. If you are accessing a local instance, ensure you are on the same network."
                        />
                    </div>

                    <div className="mt-16 pt-8 border-t border-gray-800 text-center">
                        <p className="text-sm text-gray-500">
                            Still having trouble? <a href="https://github.com/codershubinc/aaxion/issues" target="_blank" className="text-blue-400 hover:text-blue-300 underline underline-offset-4">Report an issue</a> on GitHub if you believe this is a bug.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function FaqItem({ icon: Icon, question, answer }: { icon: any, question: string, answer: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-[#121212] border border-[#2D2D2D] rounded-xl overflow-hidden hover:border-blue-500/30 transition-colors">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-6 text-left"
            >
                <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg transition-colors ${isOpen ? 'bg-blue-500/20 text-blue-400' : 'bg-[#1A1A1A] text-gray-500'}`}>
                        <Icon size={20} />
                    </div>
                    <span className="font-semibold text-white">{question}</span>
                </div>
                <span className={`text-2xl text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}>+</span>
            </button>
            <motion.div
                initial={false}
                animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
            >
                <div className="p-6 pt-0 text-gray-400 leading-relaxed border-t border-[#2D2D2D]/50 text-sm md:text-base">
                    {answer}
                </div>
            </motion.div>
        </div>
    );
}
