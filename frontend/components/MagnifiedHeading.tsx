"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";

interface MagnifiedHeadingProps {
    text: string;
    isDemo: boolean;
}

export const MagnifiedHeading = ({ text, isDemo }: MagnifiedHeadingProps) => {
    // Animation Variants
    const transition = {
        duration: 50,
        repeat: Infinity,
        repeatType: "mirror" as const,
        ease: "linear"
    };

    if (isDemo) {
        return (
            <motion.h1
                className="text-3xl md:text-6xl font-bold text-center tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-orange-500 to-rose-600 drop-shadow-[0_0_25px_rgba(245,158,11,0.8)]"
                animate={{ opacity: [1, 0.6, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
                {text}
            </motion.h1>
        );
    }

    return (
        <div className="relative inline-block py-2 px-8 select-none group">
            {/* Base Layer (Standard Text) */}
            <h1 className="text-3xl md:text-6xl font-bold text-center tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 opacity-30 blur-[1px]">
                {text}
            </h1>



            {/* Scanning Glass Icon */}
            <motion.div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none z-20 text-fuchsia-400 drop-shadow-[0_0_20px_rgba(232,121,249,1)]"
                initial={{ left: "-20%" }}
                animate={{ left: ["-20%", "120%", "-20%"] }}
                transition={transition}
            >
                {/* The Lens Glass Itself (Background Blur/Tint) - Optional Visual Flourish */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-2 border-white/20 bg-white/5 backdrop-blur-[2px] shadow-2xl"></div>

                {/* The Icon */}
                <Search className="w-16 h-16 relative z-10 -ml-1 -mt-1" strokeWidth={2.5} />
            </motion.div>

            {/* Dynamic Mask Implementation Fix */}
            {/* The simple clipPath above might desync. A more robust way is scanning a mask div. */}
            {/* However, for this visual effect, the keyframes above are our best bet for "first or 2nd image type" vibe. */}
            <MaskedOverlay text={text} isDemo={isDemo} transition={transition} />
        </div>
    );
};

// Separated for cleaner Mask Logic
const MaskedOverlay = ({ text, isDemo, transition }: any) => {
    return (
        <motion.div
            className="absolute inset-0 z-10"
            initial={{
                WebkitMaskImage: "radial-gradient(circle 100px at -20% 50%, black 100%, transparent 100%)",
                maskImage: "radial-gradient(circle 100px at -20% 50%, black 100%, transparent 100%)"
            }}
            animate={{
                WebkitMaskImage: ["radial-gradient(circle 100px at -20% 50%, black 100%, transparent 100%)", "radial-gradient(circle 100px at 120% 50%, black 100%, transparent 100%)", "radial-gradient(circle 100px at -20% 50%, black 100%, transparent 100%)"],
                maskImage: ["radial-gradient(circle 100px at -20% 50%, black 100%, transparent 100%)", "radial-gradient(circle 100px at 120% 50%, black 100%, transparent 100%)", "radial-gradient(circle 100px at -20% 50%, black 100%, transparent 100%)"]
            }}
            transition={transition}
        >
            <h1 className="text-3xl md:text-6xl font-bold text-center tracking-tight scale-110 origin-center bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 via-purple-500 to-indigo-500 drop-shadow-[0_0_25px_rgba(217,70,239,0.8)]">
                {text}
            </h1>
        </motion.div>
    )
}
