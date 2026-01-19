
"use client";

import { Check, AlertCircle, Circle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
    score?: number;
    readme?: boolean;
    contributing?: boolean;
    stars?: number;
    forks?: number;
    issues?: number;
    primaryLanguage?: string;
}

export function BeginnerReadinessCard({
    score = 85,
    readme = true,
    contributing = true,
    stars = 120,
    forks = 45,
    issues = 12,
    primaryLanguage = "TypeScript"
}: Props) {

    const getGrade = (s: number) => {
        if (s >= 90) return { label: 'A+', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' };
        if (s >= 80) return { label: 'A', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' };
        if (s >= 70) return { label: 'B', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' };
        return { label: 'C', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' };
    };

    const grade = getGrade(score);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-6 shadow-2xl"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none"></div>

            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-100 flex items-center gap-2">
                        Beginner Readiness
                        <div className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                            Deep Analysis
                        </div>
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">Based on docs, activity & complexity</p>
                </div>

                <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl border ${grade.border} ${grade.bg}`}>
                    <span className={`text-2xl font-black ${grade.color}`}>{grade.label}</span>
                    <span className="text-[10px] text-gray-400 font-mono">{score}/100</span>
                </div>
            </div>

            <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-md ${readme ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {readme ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        </div>
                        <span className="text-sm text-gray-300">README.md</span>
                    </div>
                    <span className="text-xs text-gray-500 font-mono">Essential</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-md ${contributing ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                            {contributing ? <Check className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                        </div>
                        <span className="text-sm text-gray-300">CONTRIBUTING.md</span>
                    </div>
                    <span className="text-xs text-gray-500 font-mono">Recommended</span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 py-4 border-t border-white/10">
                <div className="text-center">
                    <div className="text-lg font-bold text-white">{stars}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">Stars</div>
                </div>
                <div className="text-center border-l border-white/10">
                    <div className="text-lg font-bold text-white">{issues}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">Issues</div>
                </div>
                <div className="text-center border-l border-white/10">
                    <div className="text-lg font-bold text-blue-400">{primaryLanguage}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">Lang</div>
                </div>
            </div>

        </motion.div>
    );
}
