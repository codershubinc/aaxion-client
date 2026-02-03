'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ScanEye } from 'lucide-react';

export default function Drone() {
    // Drone Eye Rotation Logic
    const droneRef = useRef<HTMLDivElement>(null);
    const [droneRotation, setDroneRotation] = useState(0);

    useEffect(() => {
        const handleGlobalMouseMove = (e: MouseEvent) => {
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

    return (
        <>
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
                transition={{ type: "spring" as const, stiffness: 120, damping: 12, delay: 0.5 }}
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
                            transition={{ type: "spring" as const, stiffness: 200, damping: 30 }} // Smooth looking
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
        </>
    );
}
