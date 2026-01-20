"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { TypewriterHero } from "../components/TypewriterHero";
import { BeginnerReadinessCard } from "../components/BeginnerReadinessCard";
import { Rocket, Link as LinkIcon, Search, Target, ChevronDown, Globe, Users, X, Loader2, Sparkles, ExternalLink, MessageSquare, BookOpen, Zap, Info, GitFork, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import "./globals.css";


export default function Home() {
    export default function Home() {
        // const { scrollY } = useScroll(); // Removed scroll-based transforms for simpler mobile performance
        const router = useRouter();
        // const y1 = useTransform(scrollY, [0, 500], [0, 200]); 
        // const y2 = useTransform(scrollY, [0, 500], [0, -150]);

        // Global Search State
        const [showGlobalModal, setShowGlobalModal] = useState(false);
        const [showSkillModal, setShowSkillModal] = useState(false);
        const [userSkills, setUserSkills] = useState<string[]>([]);
        const [skillInput, setSkillInput] = useState("");
        const [keywordInput, setKeywordInput] = useState(""); // New: Keyword Input
        const [globalIssues, setGlobalIssues] = useState<any[]>([]);
        const [globalLoading, setGlobalLoading] = useState(false);



        // Proposal State
        const [showProposal, setShowProposal] = useState(false);
        const [proposalContent, setProposalContent] = useState("");

        // Search & Filtering State
        const [searchQuery, setSearchQuery] = useState("");
        const [filterType, setFilterType] = useState("all");
        const [filterDifficulty, setFilterDifficulty] = useState("all");

        // Derived State: Filtered Issues
        const filteredIssues = globalIssues.filter(issue => {
            const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                issue.repo_name?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesType = filterType === "all" || issue.labels.some((l: any) => {
                const name = l.name.toLowerCase();
                if (filterType === "bug") return name.includes("bug") || name.includes("fix") || name.includes("error");
                if (filterType === "feature") return name.includes("feature") || name.includes("enhancement");
                if (filterType === "documentation") return name.includes("doc");
                return false;
            });

            const matchesDifficulty = filterDifficulty === "all" || issue.labels.some((l: any) => {
                const name = l.name.toLowerCase();
                if (filterDifficulty === "good first issue") return name.includes("good first") || name.includes("beginner");
                if (filterDifficulty === "help wanted") return name.includes("help wanted");
                return false;
            });

            return matchesSearch && matchesType && matchesDifficulty;
        });

        const addSkill = (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' && skillInput.trim()) {
                if (!userSkills.includes(skillInput.trim())) {
                    setUserSkills([...userSkills, skillInput.trim()]);
                }
                setSkillInput("");
            }
        };

        const removeSkill = (skill: string) => {
            setUserSkills(userSkills.filter(s => s !== skill));
        };

        const fetchGlobalIssues = async () => {
            if (userSkills.length === 0 && !keywordInput.trim()) return; // Allow ONE of them to exist
            setGlobalLoading(true);
            try {
                const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
                const res = await fetch(`${API_URL}/api/issues/global`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        skills: userSkills,
                        keyword: keywordInput // Send keyword to API
                    }),
                });
                const data = await res.json();
                if (Array.isArray(data)) {
                    setGlobalIssues(data);
                    setShowSkillModal(false);
                    setShowGlobalModal(true);
                } else {
                    console.error("Global issues fetch failed:", data);
                }
            } catch (error) {
                console.error("Error fetching global issues, using fallback:", error);
                // Fallback Mock Data for Demo/Offline Mode
                const mockGlobal = [
                    { id: 101, title: "Add Dark Mode Support", repo_name: "facebook/react", labels: [{ name: "good first issue", color: "7057ff" }], url: "https://github.com/facebook/react/issues/1", body: "We need dark mode." },
                    { id: 102, title: "Fix Typos in Docs", repo_name: "vercel/next.js", labels: [{ name: "documentation", color: "0075ca" }], url: "https://github.com/vercel/next.js/issues/1", body: "Typos found in README." }
                ];
                setGlobalIssues(mockGlobal);
                setShowSkillModal(false);
                setShowGlobalModal(true);
            } finally {
                setGlobalLoading(false);
            }
        };

        const getMatchScore = (issue: any) => {
            if (!issue || !userSkills.length) return 0;
            const text = (issue.title + " " + (issue.body || "")).toLowerCase();
            const matches = userSkills.filter(s => text.includes(s.toLowerCase()));
            return Math.min(Math.round((matches.length / userSkills.length) * 100), 100);
        };

        const generateProposal = (issue: any) => {
            const repoName = issue.repo_name || "Unknown Repo";
            const md = `# Proposal: ${issue.title} (WoC 5.0)

## 1. Project Overview
**Target Repository:** ${repoName}
**Issue:** #${issue.number} - ${issue.title}

## 2. Technical Approach
I plan to address this issue by focusing on the required skills: ${userSkills.join(', ')}.

### Proposed Steps:
1. Fork the repository ${repoName}.
2. Reproduce the issue locally.
3. Create a fix in a new branch.
4. Verify changes and submit PR.

## 3. Why me?
I am eager to contribute to ${repoName.split('/')[1] || repoName}. My skills in ${userSkills.join(', ')} make me a great fit.

---
### 👤 Candidate Profile (Match Score: ${getMatchScore(issue)}%)
- **Verified Skills:** ${userSkills.join(', ')}

*Drafted via OnboardHub for Winter of Code 5.0*`;

            setProposalContent(md);
            setShowProposal(true);
        };

        const CopyButton = ({ text }: { text: string }) => {
            const [copied, setCopied] = useState(false);
            const handleCopy = () => {
                navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            };
            return (
                <button
                    onClick={(e) => { e.stopPropagation(); handleCopy(); }}
                    className={`p-1.5 rounded-md transition-all ${copied ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                >
                    {copied ? <Sparkles className="w-3 h-3" /> : <LinkIcon className="w-3 h-3" />}
                </button>
            );
        };


        return (
            <div className="flex min-h-screen flex-col bg-black text-white overflow-hidden relative selection:bg-blue-500/30">

                {/* Smooth Navbar */}
                <nav className="fixed top-0 w-full z-50 px-6 py-4 flex flex-col md:flex-row justify-between items-center backdrop-blur-md bg-black/20 border-b border-white/5 gap-4 md:gap-0">
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                            <Rocket className="w-4 h-4 fill-current" />
                        </div>
                        OnboardHub
                    </div>
                </nav>

                {/* Dynamic Background */}
                {/* Dynamic Background */}
                <div className={`absolute inset-0 bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 pointer-events-none`} style={{ backgroundImage: `url('${process.env.NODE_ENV === 'production' ? '/OnboardHub' : ''}/grid.svg')` }}></div>

                <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-600/20 blur-[150px] rounded-full pointer-events-none mix-blend-screen opacity-50"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/20 blur-[150px] rounded-full pointer-events-none mix-blend-screen opacity-50"></div>

                <main className="flex-1 flex flex-col items-center justify-center relative z-10 px-6 pt-32 pb-32">

                    {/* Hero Section */}
                    <div className="text-center max-w-5xl mx-auto space-y-8 mb-24">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-blue-300 mb-6"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            Hackathon Ready v1.0
                        </motion.div>

                        <TypewriterHero />

                        <motion.p
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                            className="text-lg md:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed px-4"
                        >
                            Analysis paralysis kills open source contributions. We parse the repo, configure the environment, and find your first issue in <span className="text-white font-semibold">seconds</span>.
                        </motion.p>

                        <motion.div
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                            className="w-full max-w-2xl mx-auto"
                        >
                            <form
                                className="relative group z-20"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const input = e.currentTarget.querySelector('input') as HTMLInputElement;
                                    if (input.value) router.push(`/dashboard?repo=${encodeURIComponent(input.value)}`);
                                }}
                            >
                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                                <div className="relative flex flex-col md:flex-row p-2 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl gap-3 md:gap-0">
                                    <div className="flex-1 flex items-center pl-4 gap-3 py-3 md:py-0 border-b border-white/5 md:border-none">
                                        <Search className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                        <input
                                            type="text"
                                            placeholder="github.com/owner/repo"
                                            className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none min-w-0"
                                        />
                                    </div>
                                    <button type="submit" className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl hover:scale-105 hover:shadow-[0_0_30px_rgba(239,68,68,0.6)] transition-all flex items-center justify-center gap-2 shadow-lg group">
                                        <span className="md:hidden">Launch Analysis</span>
                                        <Rocket className="w-6 h-6 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-200" />
                                    </button>
                                </div>
                            </form>

                            <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-6 text-sm text-gray-500">
                                <Link
                                    href="/dashboard?demo=true"
                                    className="w-full md:w-auto px-5 py-3 bg-yellow-500/10 border border-yellow-500/50 rounded-full text-yellow-300 hover:bg-yellow-500 hover:text-black transition-all flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(234,179,8,0.3)] hover:shadow-[0_0_25px_rgba(234,179,8,0.6)] hover:scale-105 group"
                                >
                                    <span className="text-xl group-hover:animate-bounce">⚡</span>
                                    <span className="font-bold text-base">Try Live Demo</span>
                                </Link>
                                <span className="hidden md:inline">•</span>
                                <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> 450+ Repos Analyzed
                                </span>
                            </div>
                        </motion.div>

                        {/* Global Finder Button */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6, duration: 0.8 }}
                            className="w-full max-w-xl mx-auto mt-12"
                        >
                            <button
                                onClick={() => setShowSkillModal(true)}
                                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-lg font-bold text-white shadow-xl shadow-blue-500/20 hover:scale-105 hover:shadow-purple-500/40 transition-all group"
                            >
                                <Globe className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                                Global Opportunity Finder (No Repo Required)
                            </button>
                        </motion.div>

                    </div>

                    {/* Visual Hook - Beginner Readiness Card Parallax */}
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                        className="relative w-full max-w-4xl perspective-1000 mb-32"
                    >
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur-2xl opacity-20"></div>
                        <div className="relative bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 overflow-hidden shadow-2xl">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
                                <div className="space-y-6">
                                    <h3 className="text-3xl font-bold">Know before you clone.</h3>
                                    <p className="text-gray-400 text-lg">
                                        Our engine scans repositories for "Beginner Friendliness" markers—documentation quality, active mentorship, and issue complexity.
                                    </p>
                                    <div className="flex gap-8 border-t border-white/10 pt-6">
                                        <div>
                                            <div className="text-3xl font-bold text-white">5m</div>
                                            <div className="text-xs text-gray-500 uppercase tracking-widest">Time to Issue</div>
                                        </div>
                                        <div>
                                            <div className="text-3xl font-bold text-white">100%</div>
                                            <div className="text-xs text-gray-500 uppercase tracking-widest">Confidence</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="relative transform md:rotate-2 md:hover:rotate-0 transition-transform duration-500">
                                    <BeginnerReadinessCard score={92} stars={14500} issues={24} />
                                </div>
                            </div>
                        </div>
                    </motion.div>


                    {/* Workflow Section */}
                    <section className="w-full max-w-6xl">
                        <h2 className="text-4xl font-bold text-center mb-16 text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600">How OnboardHub Works</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {[
                                { icon: <LinkIcon className="w-6 h-6 text-blue-400" />, title: "Drop a Link", desc: "Paste any GitHub URL. We handle the rest." },
                                { icon: <Search className="w-6 h-6 text-purple-400" />, title: "We Scan It", desc: "Detects languages, frameworks, and doc quality." },
                                { icon: <Target className="w-6 h-6 text-green-400" />, title: "Get Matched", desc: "Find issues that actually match your skill level." },
                                { icon: <Rocket className="w-6 h-6 text-yellow-400" />, title: "Ship Code", desc: "Follow the step-by-step roadmap to merge." }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    whileHover={{ y: -5 }}
                                    className="bg-white/5 p-8 rounded-2xl border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all group"
                                >
                                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-white/5">
                                        {item.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                                    <p className="text-gray-400 leading-relaxed text-sm">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                </main>
                {/* Skill Modal */}
                <AnimatePresence>
                    {showSkillModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="w-full max-w-xl bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 shadow-2xl"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        <Users className="w-5 h-5 text-blue-400" /> Candidate Profile
                                    </h2>
                                    <button onClick={() => setShowSkillModal(false)} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <p className="text-gray-400 text-sm mb-4">Add your skills to find the perfect matched issues across GitHub.</p>

                                <div className="bg-white/5 border border-white/10 rounded-xl p-4 min-h-[100px] mb-4">
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {userSkills.map(skill => (
                                            <span key={skill} className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-xs text-blue-300 flex items-center gap-2">
                                                {skill}
                                                <button onClick={() => removeSkill(skill)} className="hover:text-white"><X className="w-3 h-3" /></button>
                                            </span>
                                        ))}
                                        <input
                                            type="text"
                                            placeholder="Add skill (e.g. React)..."
                                            value={skillInput}
                                            onChange={(e) => setSkillInput(e.target.value)}
                                            onKeyDown={addSkill}
                                            className="bg-transparent text-sm text-white focus:outline-none min-w-[150px] py-1"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="text-xs text-gray-500 mb-1 block uppercase tracking-wider">Also Search For (Optional)</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input
                                            type="text"
                                            placeholder="Issue title keywords (e.g. 'Form Validation')..."
                                            value={keywordInput}
                                            onChange={(e) => setKeywordInput(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={() => { fetchGlobalIssues(); }}
                                    disabled={globalLoading || (userSkills.length === 0 && !keywordInput)}
                                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold text-white shadow-lg hover:shadow-blue-500/20 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {globalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                                    Find Matching Issues
                                </button>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Global Issues Results Modal */}
                <AnimatePresence>
                    {showGlobalModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="w-full max-w-4xl bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden max-h-[85vh] flex flex-col shadow-2xl"
                            >
                                <div className="p-6 border-b border-white/10 flex flex-col gap-4 bg-white/5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                                <Globe className="w-5 h-5 text-purple-400" />
                                                Global Opportunity Finder
                                            </h2>
                                            <p className="text-xs text-gray-400 mt-1">Found {globalIssues.length} issues across GitHub matching your profile.</p>
                                        </div>
                                        <button onClick={() => setShowGlobalModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                            <X className="w-5 h-5 text-gray-400" />
                                        </button>
                                    </div>

                                    {/* Search & Filter Bar */}
                                    <div className="flex flex-col md:flex-row gap-3">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                            <input
                                                type="text"
                                                placeholder="Search by title or repository..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50 placeholder-gray-600"
                                            />
                                        </div>
                                        <select
                                            value={filterType}
                                            onChange={(e) => setFilterType(e.target.value)}
                                            className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-gray-300 focus:outline-none focus:border-purple-500/50 appearance-none cursor-pointer"
                                        >
                                            <option value="all">All Types</option>
                                            <option value="bug">🐛 Bugs</option>
                                            <option value="feature">✨ Features</option>
                                            <option value="documentation">📚 Docs</option>
                                        </select>
                                        <select
                                            value={filterDifficulty}
                                            onChange={(e) => setFilterDifficulty(e.target.value)}
                                            className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-gray-300 focus:outline-none focus:border-purple-500/50 appearance-none cursor-pointer"
                                        >
                                            <option value="all">All Difficulties</option>
                                            <option value="good first issue">🌱 Good First Issue</option>
                                            <option value="help wanted">🤝 Help Wanted</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                                    {filteredIssues.length === 0 ? (
                                        <div className="text-center py-12 text-gray-500">
                                            <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                            <p>No issues match your current filters.</p>
                                        </div>
                                    ) : (
                                        filteredIssues.map(issue => (
                                            <div key={issue.id} className="bg-white/5 border border-white/5 rounded-xl p-5 hover:border-purple-500/30 transition-all group">
                                                <div className="flex justify-between items-start gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="text-[10px] font-mono text-gray-500">{issue.repo_name}</span>
                                                            {getMatchScore(issue) > 0 && (
                                                                <span className="text-[9px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">{getMatchScore(issue)}% MATCH</span>
                                                            )}
                                                            {issue.labels.map((l: any) => (
                                                                <span key={l.name} className="flex items-center gap-1">
                                                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `#${l.color}` }}></span>
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <h3 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors mb-2">
                                                            {issue.title}
                                                        </h3>
                                                        <p className="text-xs text-gray-400 line-clamp-2 mb-3">{issue.body || "No description provided."}</p>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <a
                                                            href={issue.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="px-3 py-1.5 bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded-lg text-xs font-bold hover:bg-purple-500 hover:text-white transition-all flex items-center gap-1.5"
                                                        >
                                                            View Issue <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                        <button
                                                            onClick={() => generateProposal(issue)}
                                                            className="px-3 py-1.5 bg-blue-500/10 text-blue-300 border border-blue-500/20 rounded-lg text-xs font-bold hover:bg-blue-500 hover:text-white transition-all flex items-center gap-1.5"
                                                        >
                                                            <Sparkles className="w-3 h-3" /> Draft Application
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Proposal Modal */}
                <AnimatePresence>
                    {showProposal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 shadow-2xl max-h-[80vh] flex flex-col"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-yellow-400" /> Generated Proposal
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => navigator.clipboard.writeText(proposalContent)} className="text-xs text-blue-400 hover:underline">Copy All</button>
                                        <button onClick={() => setShowProposal(false)} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto bg-white/5 rounded-xl p-4 border border-white/5 font-mono text-xs text-gray-300 whitespace-pre-wrap custom-scrollbar">
                                    {proposalContent}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div >
        );
    }


