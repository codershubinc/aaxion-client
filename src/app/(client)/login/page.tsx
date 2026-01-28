"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useMotionTemplate, useSpring, useTransform } from "framer-motion";
import { Zap, Loader2, Lock, User, ArrowRight, ScanEye, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { login } from "@/services";
import { useAppState } from "@/context/AppContext";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const { login: authLogin } = useAppState();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isLogoMode, setIsLogoMode] = useState(true);
    const [focusedField, setFocusedField] = useState<"username" | "password" | null>(null);

    // --- 🖱️ MOUSE TRACKING (Global for Drone) ---
    // We track window mouse position for the "Drone Eye"
    const [windowMouse, setWindowMouse] = useState({ x: 0, y: 0 });

    // We track relative mouse position for the "Card Glow"
    const cardMouseX = useMotionValue(0);
    const cardMouseY = useMotionValue(0);

    // Drone Eye Rotation Logic
    const droneRef = useRef<HTMLDivElement>(null);
    const [droneRotation, setDroneRotation] = useState(0);

    useEffect(() => {
        const handleGlobalMouseMove = (e: MouseEvent) => {
            setWindowMouse({ x: e.clientX, y: e.clientY });

            // Calculate angle for the drone to look at the mouse
            if (droneRef.current) {
                const rect = droneRef.current.getBoundingClientRect();
                const droneCenterX = rect.left + rect.width / 2;
                const droneCenterY = rect.top + rect.height / 2;

                // Math to get angle in degrees
                const angle = Math.atan2(e.clientY - droneCenterY, e.clientX - droneCenterX) * (180 / Math.PI);
                setDroneRotation(angle + 90);
            }
        };

        window.addEventListener("mousemove", handleGlobalMouseMove);
        return () => window.removeEventListener("mousemove", handleGlobalMouseMove);
    }, []);

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
        setIsLoading(true);
        try {
            const response = await login(username, password);
            authLogin(response.token);
            toast.success("Login successful");
            router.push("/d");
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
        show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
    };

    return (
        <div className="relative min-h-screen bg-[#050505] flex items-center justify-center p-4 overflow-hidden">

            {/* --- 🤖 PEEKING DRONE (Top Right Corner) --- */}
            {/* The Wire */}
            <motion.div
                initial={{ height: 0 }}
                animate={{ height: 96 }} // 96px wire length
                transition={{ duration: 1, delay: 0.5, ease: "circOut" }}
                className="fixed top-0 right-12 w-[1px] bg-gradient-to-b from-transparent via-blue-500/50 to-blue-500 z-50 pointer-events-none"
            />

            {/* The Drone Body */}
            <motion.div
                ref={droneRef}
                initial={{ y: -150 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 120, damping: 12, delay: 0.5 }}
                className="fixed top-24 right-[calc(3rem-14px)] z-50 pointer-events-none"
            >
                <div className="relative group">
                    {/* Glowing Aura */}
                    <div className="absolute inset-0 bg-blue-500/20 blur-md rounded-full animate-pulse" />

                    {/* Drone Chassis */}
                    <div className="relative w-8 h-8 bg-[#0a0a0a] border border-blue-500/50 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.4)]">
                        {/* The Rotating Eye */}
                        <motion.div
                            animate={{ rotate: droneRotation }}
                            transition={{ type: "spring", stiffness: 200, damping: 30 }} // Smooth looking
                        >
                            <ScanEye className="w-5 h-5 text-blue-400" />
                        </motion.div>
                    </div>

                    {/* Scanning Beam Effect */}
                    <motion.div
                        animate={{ opacity: [0, 0.5, 0], height: [0, 100] }}
                        transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 w-0.5 bg-gradient-to-b from-blue-400/50 to-transparent blur-[1px]"
                    />
                </div>
            </motion.div>

            {/* --- 🏷️ PEEKING LABEL (Top Left Corner) --- */}
            <motion.div
                initial={{ x: -100, rotate: -45, opacity: 0 }}
                animate={{ x: 0, rotate: -45, opacity: 1 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="fixed top-6 -left-10 z-40 bg-blue-950/30 border border-blue-500/20 px-10 py-1 backdrop-blur-sm"
            >
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3 h-3 text-blue-400" />
                    <span className="text-[10px] font-mono font-bold text-blue-300/70 tracking-[0.2em] uppercase">
                        SECURE::NODE
                    </span>
                </div>
            </motion.div>


            {/* --- Background Ambient Effects --- */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.2, 0.3], x: [0, 100, 0], y: [0, -50, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 left-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"
                />
                <motion.div
                    animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.3, 0.2], x: [0, -100, 0], y: [0, 50, 0] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3"
                />
            </div>

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
                                            <span className="text-xs font-bold tracking-[0.3em] text-blue-500/60 uppercase mt-1">Drive</span>
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
                            {/* Inputs ... */}
                            {/* (Same inputs as before, kept concise here for brevity) */}
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
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group/btn">
                                    {isLoading ? (<Loader2 className="w-5 h-5 animate-spin" />) : (<>Sign In<ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" /></>)}
                                </motion.button>
                            </motion.div>
                        </form>

                        <motion.div variants={itemVariants} className="mt-8 text-center border-t border-[#2D2D2D] pt-6">
                            <p className="text-xs text-gray-500">Don&apos;t have an account? <span className="text-blue-500 hover:text-blue-400 cursor-pointer transition-colors" ><Link href={"/login/info"} >more info!!</Link></span></p>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}