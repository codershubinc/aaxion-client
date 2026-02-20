"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useMotionTemplate } from "framer-motion";
import { Zap, Loader2, Lock, User, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { login, storeServerInfoWithAuth } from "@/services";
import { useAppState } from "@/context/AppContext";
import Link from "next/link";
import { useDiscovery } from "@/hooks/useDiscovery";

interface LoginCardProps {
    onSuccess?: () => void;
    appSubtitle?: string;
}

export default function LoginCard({ onSuccess, appSubtitle = "Drive" }: LoginCardProps) {
    const { login: authLogin } = useAppState();
    const { serverUrl, selectedServer } = useDiscovery();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isLogoMode, setIsLogoMode] = useState(true);
    const [focusedField, setFocusedField] = useState<"username" | "password" | null>(null);

    const cardMouseX = useMotionValue(0);
    const cardMouseY = useMotionValue(0);

    // Card Mouse Handler
    function handleCardMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        cardMouseX.set(clientX - left);
        cardMouseY.set(clientY - top);
    }

    // Logo Toggle Timer
    useEffect(() => {
        const interval = setInterval(() => {
            setIsLogoMode((prev) => !prev);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !password) {
            toast.error("Please enter both username and password");
            return;
        }

        if (!selectedServer) {
            toast.error("No server selected. Please scan for servers.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await login(username, password);
            authLogin(response.token);

            // Store server info with authentication
            storeServerInfoWithAuth(
                selectedServer,
                response.token,
                username,
                serverUrl || ''
            );

            toast.success("Login successful");
            if (onSuccess) {
                onSuccess();
            }
        } catch (error: any) {
            toast.error(error.message || "Login failed");
        } finally {
            setIsLoading(false);
        }
    };

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="w-full max-w-md relative z-10 group"
        >
            {/* Mouse Listener Wrapper */}
            <div
                className="relative"
                onMouseMove={handleCardMouseMove}
            >
                {/* Moving Gradient Border (Behind Content) */}
                <motion.div
                    className="absolute -inset-[2px] rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"
                    style={{
                        background: useMotionTemplate`
                                radial-gradient(
                                  650px circle at ${cardMouseX}px ${cardMouseY}px,
                                  rgba(59, 130, 246, 0.4),
                                  transparent 40%
                                )
                            `,
                    }}
                />

                {/* Sharp Border Line */}
                <motion.div
                    className="absolute -inset-[1px] rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                        background: useMotionTemplate`
                                radial-gradient(
                                  400px circle at ${cardMouseX}px ${cardMouseY}px,
                                  rgba(59, 130, 246, 0.8),
                                  transparent 40%
                                )
                            `,
                    }}
                />

                {/* Static Gray Border */}
                <div className="absolute inset-0 rounded-3xl border border-[#2D2D2D] group-hover:opacity-0 transition-opacity duration-500" />

                {/* Card Content */}
                <div className="relative bg-[#121212]/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl overflow-hidden h-full">

                    <motion.div variants={itemVariants} className="flex flex-col items-center mb-10">
                        <div className="h-24 flex items-center justify-center mb-2">
                            <AnimatePresence mode="wait">
                                {isLogoMode ? (
                                    <motion.div
                                        key="logo"
                                        initial={{ scale: 0, opacity: 0, rotate: -180 }}
                                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                        exit={{ scale: 0, opacity: 0, rotate: 180 }}
                                        transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
                                        className="w-20 h-20 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center border border-blue-500/10 shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]"
                                    >
                                        <Zap className="w-10 h-10 text-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="text"
                                        initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                        exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                                        transition={{ duration: 0.5 }}
                                        className="flex flex-col items-center"
                                    >
                                        <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-blue-500 to-purple-500 tracking-tighter drop-shadow-sm">
                                            Aaxion
                                        </h1>
                                        <span className="text-xs font-bold tracking-[0.3em] text-blue-500/60 uppercase mt-1">{appSubtitle}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="text-center space-y-1">
                            <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
                            <p className="text-gray-400 text-sm">Secure access to your personal cloud</p>
                        </div>
                    </motion.div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <motion.div variants={itemVariants} className="space-y-2">
                            <label className="text-xs font-semibold text-gray-400 ml-1 uppercase tracking-wider">Username</label>
                            <div className="relative group/input">
                                <motion.div animate={{ color: focusedField === "username" ? "#3b82f6" : "#6b7280" }} className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200"><User className="w-5 h-5" /></motion.div>
                                <input type="text" value={username} onFocus={() => setFocusedField("username")} onBlur={() => setFocusedField(null)} onChange={(e) => setUsername(e.target.value)} className="w-full bg-[#0a0a0a] border border-[#2D2D2D] rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 placeholder:text-gray-700" placeholder="Enter your username" disabled={isLoading} />
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="space-y-2">
                            <label className="text-xs font-semibold text-gray-400 ml-1 uppercase tracking-wider">Password</label>
                            <div className="relative group/input">
                                <motion.div animate={{ color: focusedField === "password" ? "#3b82f6" : "#6b7280" }} className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200"><Lock className="w-5 h-5" /></motion.div>
                                <input type="password" value={password} onFocus={() => setFocusedField("password")} onBlur={() => setFocusedField(null)} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#0a0a0a] border border-[#2D2D2D] rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 placeholder:text-gray-700" placeholder="Enter your password" disabled={isLoading} />
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="pt-2">
                            <motion.button
                                type="submit"
                                disabled={isLoading}
                                className="relative w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
                                layout
                            >
                                <AnimatePresence mode="wait" initial={false}>
                                    {isLoading ? (
                                        <motion.div
                                            key="loader"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="content"
                                            initial="initial"
                                            whileHover="hover"
                                            whileTap="tap"
                                            className="relative w-full flex items-center justify-center"
                                        >
                                            <motion.div
                                                className="flex items-center gap-2"
                                                variants={{
                                                    initial: { y: 0, opacity: 1 },
                                                    hover: { y: -30, opacity: 0 },
                                                    tap: { scale: 0.95 }
                                                }}
                                                transition={{ duration: 0.2, ease: "easeInOut" }}
                                            >
                                                Sign In <ArrowRight className="w-4 h-4" />
                                            </motion.div>

                                            <motion.div
                                                className="absolute inset-0 flex items-center justify-center"
                                                variants={{
                                                    initial: { y: 30, opacity: 0 },
                                                    hover: { y: 0, opacity: 1 },
                                                    tap: { scale: 0.95 }
                                                }}
                                                transition={{ duration: 0.2, ease: "easeInOut" }}
                                            >
                                                <ArrowRight className="w-6 h-6" />
                                            </motion.div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                        </motion.div>
                    </form>

                    <motion.div variants={itemVariants} className="mt-8 text-center border-t border-[#2D2D2D] pt-6">
                        <p className="text-xs text-gray-500">Don&apos;t have an account? <span className="text-blue-500 hover:text-blue-400 cursor-pointer transition-colors" ><Link href={"/login/info"} >more info!!</Link></span></p>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}