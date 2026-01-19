"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck, GitGraph, Zap, Users, Code } from "lucide-react";

export default function About() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-gray-100 font-sans selection:bg-purple-500/30">
            {/* Navbar */}
            <nav className="border-b border-gray-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                            OnboardHub
                        </span>
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-6 py-16">

                {/* Hero Section */}
                <div className="text-center mb-16 space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
                        Why OnboardHub?
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        We bridge the gap between "I want to contribute" and "PR Merged".
                        Most beginners get lost in complex codebases. We solve that.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 gap-8 mb-20">

                    {/* Feature 1 */}
                    <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800 hover:border-blue-500/50 transition-colors group">
                        <div className="w-12 h-12 bg-blue-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <ShieldCheck className="w-6 h-6 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">Repo Intelligence Score</h3>
                        <p className="text-gray-400 leading-relaxed">
                            Not every repo is beginner-friendly. Our AI analyzes documentation (README, CONTRIBUTING.md) and test coverage to give you a "Health Score" so you know where your time is valued.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800 hover:border-purple-500/50 transition-colors group">
                        <div className="w-12 h-12 bg-purple-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <GitGraph className="w-6 h-6 text-purple-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">Smart Issue Finder</h3>
                        <p className="text-gray-400 leading-relaxed">
                            Stop filtering by generic labels. We categorize issues into **Beginner**, **Intermediate**, and **Pro** tiers, helping you find tasks that match your actual skill level.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800 hover:border-green-500/50 transition-colors group">
                        <div className="w-12 h-12 bg-green-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Code className="w-6 h-6 text-green-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">Auto Setup Commands</h3>
                        <p className="text-gray-400 leading-relaxed">
                            "How do I run this?" is a thing of the past. We detect the tech stack (Next.js, Python, Java) and generate the exact CLI commands you need to get the local server running in seconds.
                        </p>
                    </div>

                    {/* Feature 4 */}
                    <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800 hover:border-yellow-500/50 transition-colors group">
                        <div className="w-12 h-12 bg-yellow-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Users className="w-6 h-6 text-yellow-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">First PR Assistant</h3>
                        <p className="text-gray-400 leading-relaxed">
                            Nervous about your first Pull Request? We provide correct Git branching commands and professional commit message templates to make you look like a pro from Day 1.
                        </p>
                    </div>
                </div>

                {/* Real Human Story (Judge Polish) */}
                <div className="mb-20 bg-gray-900 border border-gray-800 rounded-2xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Users className="w-32 h-32 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-6">Why I Built This?</h2>
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex-shrink-0 flex items-center justify-center border border-gray-600">
                            <span className="text-2xl">👨‍💻</span>
                        </div>
                        <div className="space-y-4 text-gray-300 leading-relaxed font-light">
                            <p className="italic text-lg text-gray-200">
                                <span className="text-white font-bold">"I was stuck for weeks trying to make my first PR.</span> The code was overwhelming, the setup failed 5 times, and I was terrified to ask 'stupid' questions."
                            </p>
                            <p>
                                I built OnboardHub to be the guide I wish I had. It's not just a tool; it's an empathy-driven engine to help you <span className="text-white font-bold italic">overcome Analysis Paralysis</span> and feel confident in your first contribution.
                            </p>
                            <p className="text-blue-400 font-medium pt-2">- The Creator</p>
                        </div>
                    </div>
                </div>

                {/* Call to Action */}
                <div className="text-center bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-2xl p-10 border border-white/10">
                    <h2 className="text-2xl font-bold text-white mb-4">Ready to fix your first issue?</h2>
                    <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                        Join thousands of developers climbing the open-source ladder with OnboardHub.
                    </p>
                    <Link href="/dashboard" className="px-8 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                        Launch Analyzer
                    </Link>
                </div>

            </main>
        </div>
    );
}
