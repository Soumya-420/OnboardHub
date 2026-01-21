"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { TypewriterHero } from "../components/TypewriterHero";
import { BeginnerReadinessCard } from "../components/BeginnerReadinessCard";
import { Rocket, Link as LinkIcon, Search, Target, ChevronDown, Globe, Users, X, Loader2, Sparkles, ExternalLink, MessageSquare, BookOpen, Zap, Info, GitFork, AlertCircle, ShieldCheck, Layers, Cpu, Copy } from "lucide-react";
import { getPrSuggestions } from "../utils/prAssistant";
import { useState, useEffect } from "react";
import "./globals.css";


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
    const [expandedIssueId, setExpandedIssueId] = useState<number | null>(null);

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

    // Helper for Smart Suggestions (Rule-based Logic)
    // REPLACED by shared utility
    // const getSuggestions = ...

    const fetchGlobalIssues = async () => {
        if (userSkills.length === 0 && !keywordInput.trim()) return;
        setGlobalLoading(true);
        try {
            // SIMPLIFIED QUERY: Target high-yield beginner issues
            const baseQuery = ['is:issue', 'is:open', 'archived:false'];

            // 1. Beginner Labels Group (Comma separated for correct API OR logic)
            const labelsPool = ['"good first issue"', 'beginner', '"help wanted"', 'up-for-grabs'];
            baseQuery.push(`label:${labelsPool.join(',')}`);

            // 2. Skill/Language Filter
            if (userSkills.length > 0) {
                const skillQuery = userSkills.map(s => {
                    const lang = s.toLowerCase();
                    const commonLangs = ['javascript', 'typescript', 'python', 'java', 'cpp', 'css', 'html', 'go', 'rust'];
                    return commonLangs.includes(lang) ? `language:${lang}` : `"${s}"`;
                }).join(' OR ');
                baseQuery.push(`(${skillQuery})`);
            }

            // 3. User Keyword
            if (keywordInput.trim()) {
                baseQuery.push(`"${keywordInput.trim()}"`);
            }

            const query = baseQuery.join(' ');
            console.log("GitHub Final Query:", query);

            const res = await fetch(`https://api.github.com/search/issues?q=${encodeURIComponent(query)}&sort=updated&order=desc&per_page=30`, {
                cache: 'no-store'
            });

            if (!res.ok) {
                if (res.status === 403 || res.status === 429) {
                    alert("GitHub API usage limit reached. Please wait a moment.");
                    throw new Error("Rate limit");
                }
                throw new Error(`API error: ${res.status}`);
            }

            const data = await res.json();

            if (data && data.items) {
                const mappedIssues = data.items.map((item: any) => ({
                    id: item.id,
                    title: item.title,
                    number: item.number,
                    labels: item.labels,
                    user: item.user,
                    html_url: item.html_url,
                    repo_name: item.repository_url.split('/').slice(-2).join('/'),
                    url: item.html_url,
                    body: item.body
                }));
                setGlobalIssues(mappedIssues);
                setShowSkillModal(false);
                setShowGlobalModal(true);
            } else {
                setGlobalIssues([]);
            }

        } catch (error) {
            console.error("Fetch failed:", error);
            setGlobalIssues([]);
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
        <div className="flex min-h-screen flex-col bg-black text-white overflow-x-hidden relative selection:bg-blue-500/30">

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
            <div className="absolute inset-0 bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 pointer-events-none" style={{ backgroundImage: "url('/grid.svg')" }}></div>

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
                <section className="w-full max-w-6xl mb-32 relative">
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent hidden md:block -z-10"></div>

                    <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500">How OnboardHub Works</h2>
                    <p className="text-gray-500 text-center mb-16 max-w-2xl mx-auto">Our automated engine streamlines the entire contribution lifecycle, from discovery to merge.</p>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {[
                            {
                                icon: <LinkIcon className="w-6 h-6 text-blue-400" />,
                                title: "1. Drop a Link",
                                desc: "Paste any GitHub repository URL. Our engine immediately begins a deep traversal of the codebase architecture.",
                                color: "blue"
                            },
                            {
                                icon: <Search className="w-6 h-6 text-purple-400" />,
                                title: "2. We Scan It",
                                desc: "We analyze tech stacks, documentation completeness, and issue velocity to build a comprehensive health profile.",
                                color: "purple"
                            },
                            {
                                icon: <Target className="w-6 h-6 text-green-400" />,
                                title: "3. Get Matched",
                                desc: "Our matching algorithm correlates your unique skill profile with issue complexity and mentor availability.",
                                color: "green"
                            },
                            {
                                icon: <Rocket className="w-6 h-6 text-yellow-400" />,
                                title: "4. Ship Code",
                                desc: "Get a personalized roadmap with CLI commands, file contexts, and PR templates tailored to the specific task.",
                                color: "yellow"
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ y: -10 }}
                                className="relative bg-black/40 backdrop-blur-sm p-8 rounded-3xl border border-white/5 hover:border-white/20 hover:bg-white/[0.02] transition-all group"
                            >
                                <div className={`w-14 h-14 bg-${item.color}-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-${item.color}-500/20 shadow-lg shadow-${item.color}-500/5`}>
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors">{item.title}</h3>
                                <p className="text-gray-400 leading-relaxed text-sm group-hover:text-gray-300 transition-colors">{item.desc}</p>

                                {/* Connector Dot for Desktop */}
                                <div className="hidden md:block absolute top-1/2 -right-4 w-2 h-2 rounded-full bg-white/10 group-last:hidden"></div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Features Section */}
                <section className="w-full max-w-6xl mb-32">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h2 className="text-4xl font-bold text-white leading-tight">
                                Built for the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">Next Generation</span> of Contributors
                            </h2>
                            <p className="text-gray-400 text-lg">
                                We've removed the manual overhead of open source. Focus on writing code, not wrestling with documentation or environment setup.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { icon: <Zap className="w-5 h-5" />, text: "Instant Repo Analysis" },
                                    { icon: <ShieldCheck className="w-5 h-5" />, text: "Quality Scoring" },
                                    { icon: <Layers className="w-5 h-5" />, text: "Smart Skill Matching" },
                                    { icon: <Cpu className="w-5 h-5" />, text: "automated Roadmaps" }
                                ].map((feature, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                                        <div className="text-blue-400">{feature.icon}</div>
                                        <span className="text-sm text-gray-300 font-medium">{feature.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl rounded-full"></div>
                            <div className="relative bg-gradient-to-br from-white/10 to-white/5 border border-white/10 p-1 rounded-[2.5rem] overflow-hidden shadow-2xl">
                                <div className="bg-[#0a0a0a] rounded-[2.25rem] p-8 aspect-square flex flex-col justify-center items-center text-center">
                                    <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                        <Rocket className="w-10 h-10 text-blue-400" />
                                    </div>
                                    <h4 className="text-2xl font-bold text-white mb-2 text-balance">Ready to Start Your Journey?</h4>
                                    <p className="text-gray-500 mb-8">Join thousands of developers contributing to the world's most popular repositories.</p>
                                    <button
                                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                        className="px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform"
                                    >
                                        Analyze a Repo Now
                                    </button>
                                </div>
                            </div>
                        </div>
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
                                        <div key={issue.id} className="bg-white/5 border border-white/5 rounded-xl overflow-hidden hover:border-purple-500/30 transition-all group">
                                            <div
                                                className="p-5 cursor-pointer"
                                                onClick={() => setExpandedIssueId(expandedIssueId === issue.id ? null : issue.id)}
                                            >
                                                <div className="flex justify-between items-start gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="text-[10px] font-mono text-gray-500">{issue.repo_name}</span>
                                                            {getMatchScore(issue) > 0 && (
                                                                <span className="text-[9px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">{getMatchScore(issue)}% MATCH</span>
                                                            )}
                                                            <div className="flex gap-1">
                                                                {issue.labels.map((l: any) => (
                                                                    <span key={l.name} title={l.name} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `#${l.color}` }}></span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <h3 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors mb-2">
                                                            {issue.title}
                                                        </h3>
                                                        <p className="text-xs text-gray-400 line-clamp-2">{issue.body || "No description provided."}</p>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                                        <a
                                                            href={issue.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="px-3 py-1.5 bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded-lg text-[10px] font-bold hover:bg-purple-500 hover:text-white transition-all flex items-center gap-1.5"
                                                        >
                                                            View <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); generateProposal(issue); }}
                                                            className="px-3 py-1.5 bg-blue-500/10 text-blue-300 border border-blue-500/20 rounded-lg text-[10px] font-bold hover:bg-blue-500 hover:text-white transition-all flex items-center gap-1.5"
                                                        >
                                                            Draft <Sparkles className="w-3 h-3" />
                                                        </button>
                                                        <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${expandedIssueId === issue.id ? 'rotate-180' : ''}`} />
                                                    </div>
                                                </div>
                                            </div>

                                            <AnimatePresence>
                                                {expandedIssueId === issue.id && (
                                                    <div className="mt-6 border-t border-white/10 pt-6 space-y-8 animate-in fade-in slide-in-from-top-4 duration-300">
                                                        {(() => {
                                                            const suggestions = getPrSuggestions(issue, issue.html_url ? issue.html_url.split('/issues')[0] : undefined);

                                                            return (
                                                                <>
                                                                    {/* Header */}
                                                                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-4">
                                                                        <div className="p-2 bg-blue-500/20 rounded-lg">
                                                                            <Zap className="w-5 h-5 text-blue-400" />
                                                                        </div>
                                                                        <div>
                                                                            <h4 className="font-semibold text-blue-100 flex items-center gap-2">
                                                                                First PR Assistant Active
                                                                                <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">Beta</span>
                                                                            </h4>
                                                                            <p className="text-sm text-blue-200/80 mt-1">
                                                                                {suggestions.guidance.whyItMatters}
                                                                            </p>
                                                                        </div>
                                                                    </div>

                                                                    {/* 1. Environment Setup */}
                                                                    <div className="space-y-4">
                                                                        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                                                            <span className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-xs border border-gray-700">1</span>
                                                                            {suggestions.setup.title}
                                                                        </h4>
                                                                        <div className="grid gap-3">
                                                                            {suggestions.setup.steps.map((step: any, idx: number) => (
                                                                                <div key={idx} className="bg-gray-900/50 rounded-lg p-3 border border-gray-800 hover:border-gray-700 transition-colors group">
                                                                                    <div className="flex justify-between items-start mb-1">
                                                                                        <span className="text-sm font-medium text-gray-200">{step.label}</span>
                                                                                    </div>
                                                                                    <p className="text-xs text-gray-500 mb-2">{step.desc}</p>
                                                                                    {step.cmd && (
                                                                                        <div className="bg-black/50 rounded px-3 py-2 flex items-center justify-between group-hover:bg-black/70 transition-colors">
                                                                                            <code className="text-xs text-emerald-400 font-mono">{step.cmd}</code>
                                                                                            <button
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    navigator.clipboard.writeText(step.cmd);
                                                                                                }}
                                                                                                className="text-gray-600 hover:text-white transition-colors"
                                                                                                title="Copy command"
                                                                                            >
                                                                                                <Copy className="w-3.5 h-3.5" />
                                                                                            </button>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>

                                                                    {/* 2. Development Workflow */}
                                                                    <div className="space-y-4">
                                                                        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                                                            <span className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-xs border border-gray-700">2</span>
                                                                            {suggestions.workflow.title}
                                                                        </h4>
                                                                        <div className="space-y-3">
                                                                            {suggestions.workflow.steps.map((step: any, idx: number) => (
                                                                                <div key={idx} className="relative pl-6 border-l-2 border-gray-800 pb-1 last:pb-0">
                                                                                    <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full ${step.cmd ? 'bg-purple-500' : 'bg-gray-600'}`}></div>
                                                                                    <h5 className="text-sm font-medium text-gray-200">{step.label}</h5>
                                                                                    <p className="text-xs text-gray-500 mb-1">{step.desc}</p>
                                                                                    {step.cmd && (
                                                                                        <div className="bg-black/30 rounded px-2 py-1.5 flex items-center justify-between mt-1 border border-gray-800/50">
                                                                                            <code className="text-xs text-purple-300 font-mono">{step.cmd}</code>
                                                                                            <button
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    navigator.clipboard.writeText(step.cmd);
                                                                                                }}
                                                                                                className="text-gray-600 hover:text-white"
                                                                                            >
                                                                                                <Copy className="w-3 h-3" />
                                                                                            </button>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>

                                                                    {/* 3. Pro Tips & Troubleshooting */}
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                        {/* Troubleshooting */}
                                                                        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                                                                            <h4 className="flex items-center gap-2 font-medium text-amber-200 mb-3 text-sm">
                                                                                <AlertCircle className="w-4 h-4" />
                                                                                Troubleshooting
                                                                            </h4>
                                                                            <ul className="space-y-2">
                                                                                {suggestions.guidance.troubleshooting.map((item: any, idx: number) => (
                                                                                    <li key={idx} className="flex justify-between items-center text-xs">
                                                                                        <span className="text-amber-100/80">{item.problem}</span>
                                                                                        <code className="bg-black/40 px-1 py-0.5 rounded text-amber-200/70 font-mono">{item.solution}</code>
                                                                                    </li>
                                                                                ))}
                                                                                {/* New CI Checks Section */}
                                                                                {suggestions.guidance.ciChecks && (
                                                                                    <div className="pt-2 border-t border-amber-500/10 mt-2">
                                                                                        <span className="text-[10px] font-semibold text-amber-500/80 mb-1 block">CI Checks (Automated)</span>
                                                                                        {suggestions.guidance.ciChecks.map((check: any, i: number) => (
                                                                                            <div key={`ci-${i}`} className="flex justify-between text-[10px]">
                                                                                                <span className="text-gray-500">{check.name}</span>
                                                                                                <code className="text-gray-400">{check.command}</code>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                )}
                                                                            </ul>
                                                                        </div>

                                                                        {/* PR Details */}
                                                                        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
                                                                            <h4 className="flex items-center gap-2 font-medium text-emerald-200 mb-3 text-sm">
                                                                                <GitFork className="w-4 h-4" />
                                                                                PR Details
                                                                            </h4>
                                                                            <div className="space-y-3">
                                                                                <div className="flex flex-col gap-1">
                                                                                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">Branch Name</span>
                                                                                    <div className="flex items-center gap-2">
                                                                                        <code className="text-xs bg-black/40 px-2 py-1 rounded text-emerald-300 block flex-1 truncate font-mono">
                                                                                            {suggestions.prDetails.branchName}
                                                                                        </code>
                                                                                        <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(suggestions.prDetails.branchName) }} className="p-1 hover:bg-white/10 rounded text-emerald-500">
                                                                                            <Copy className="w-3.5 h-3.5" />
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex flex-col gap-1">
                                                                                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">PR Template</span>
                                                                                    <button
                                                                                        onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(suggestions.prDetails.prTemplate) }}
                                                                                        className="text-xs flex items-center justify-between gap-2 text-blue-300 hover:text-white bg-blue-500/10 hover:bg-blue-500/20 px-3 py-2 rounded border border-blue-500/20 transition-all w-full"
                                                                                    >
                                                                                        <span>Copy Markdown Template</span>
                                                                                        <Copy className="w-3.5 h-3.5" />
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    {/* Start "Why this works" Section */}
                                                                    <div className="bg-blue-500/5 rounded-lg p-3 border border-blue-500/10 text-[10px] text-blue-200/70 mt-3">
                                                                        <strong className="text-blue-400">Why this works:</strong> {suggestions.guidance.whyItMatters}
                                                                    </div>
                                                                    <div className="text-center mt-2">
                                                                        <a href="https://github.com/features/issues" target="_blank" className="text-[10px] text-gray-500 hover:text-white underline">See how GitHub Issues work (Demo)</a>
                                                                    </div>
                                                                    {/* End "Why this works" Section */}
                                                                </>
                                                            );
                                                        })()}
                                                    </div>
                                                )}</AnimatePresence>
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


