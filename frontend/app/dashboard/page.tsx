"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    ArrowLeft, Github, Terminal, BookOpen, AlertCircle,
    Loader2, Star, GitFork, Disc, Layers, ShieldCheck, Users, Sparkles,
    MessageSquare, Info, ExternalLink, ChevronDown, X, Zap, Globe, Search, Rocket
} from "lucide-react";
import { BeginnerReadinessCard } from '../../components/BeginnerReadinessCard';
import { MagnifiedHeading } from '../../components/MagnifiedHeading';
import { CopyButton } from "../../components/CopyButton";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import confetti from 'canvas-confetti';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];

export default function Dashboard() {
    const [repoUrl, setRepoUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);
    const [issues, setIssues] = useState<any[]>([]);
    const [level, setLevel] = useState("beginner"); // beginner, intermediate, pro
    const [fetchingIssues, setFetchingIssues] = useState(false);

    const [error, setError] = useState("");
    const [recentRepos, setRecentRepos] = useState<string[]>([]);
    const [showProposal, setShowProposal] = useState(false);
    const [proposalContent, setProposalContent] = useState("");
    const [copied, setCopied] = useState(false);

    // Skills Profiler State
    const [userSkills, setUserSkills] = useState<string[]>(["React", "TypeScript", "Tailwind"]);
    const [skillInput, setSkillInput] = useState("");

    const [showMatchesOnly, setShowMatchesOnly] = useState(false);
    const [isDemoMode, setIsDemoMode] = useState(false);

    // Auto-run for Demo Mode or Direct Link
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const demo = params.get("demo");
        const repo = params.get("repo");

        if (demo === "true") {
            setIsDemoMode(true);
            setRepoUrl("https://github.com/demo/starter-kit");
            setTimeout(() => {
                analyzeRepo("https://github.com/demo/starter-kit", true);
            }, 500);
        } else if (repo) {
            setRepoUrl(repo);
            setTimeout(() => {
                analyzeRepo(repo, false);
            }, 500);
        }

        // Load recent repos
        const saved = localStorage.getItem("onboard_history");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) setRecentRepos(parsed);
            } catch (e) {
                console.error("Failed to parse history", e);
            }
        }
    }, []);

    const saveToRecent = (url: string) => {
        const updated = [url, ...recentRepos.filter(r => r !== url)].slice(0, 5);
        setRecentRepos(updated);
        localStorage.setItem("onboard_history", JSON.stringify(updated));
    };

    const fetchIssues = async (repoData: any, selectedLevel: string) => {
        if (!repoData || !repoData.repo) return;
        setFetchingIssues(true);
        setIssues([]); // clear old
        try {
            const [owner, name] = repoData.repo.split('/');
            const res = await fetch(`http://localhost:5000/api/issues?owner=${owner}&repo=${name}&level=${selectedLevel}`);
            const json = await res.json();
            setIssues(json);
        } catch (e) {
            console.error("Issue fetch error", e);
        } finally {
            setFetchingIssues(false);
        }
    };

    // ULTIMATE SAFE MODE: Generate data client-side if backend fails
    const generateSafeModeData = (url: string) => {
        const [_, owner, repo] = url.match(/github\.com\/([^\/]+)\/([^\/]+)/) || ["", "unknown", "project"];
        return {
            repo: `${owner}/${repo}`,
            description: `(Safe Mode) Analysis of ${repo}. Backend unreachable, using simulated insights for reliability.`,
            stars: Math.floor(Math.random() * 500) + 50,
            forks: Math.floor(Math.random() * 100) + 10,
            openIssues: Math.floor(Math.random() * 50) + 5,
            primaryLanguage: "TypeScript",
            techStack: ["React", "Node.js", "Tailwind"],
            packageManager: "npm",
            setupCommands: ["git clone " + url, "npm install", "npm run dev"],
            languages: { "TypeScript": 50000, "JavaScript": 20000 },
            healthScore: 85,
            healthChecklist: {
                readme: true,
                contributing: true,
                license: true,
                issues: true,
                pullRequests: false
            },
            mentorReadiness: 95,
            socialLinks: [
                { type: 'discord', url: 'https://discord.gg/fallback-demo' },
                { type: 'slack', url: 'https://slack.com/fallback-demo' }
            ]
        };
    };

    const analyzeRepo = async (url: string, isDemo: boolean = false) => {
        if (!url) return;
        setLoading(true);
        setError(""); // Clear previous error
        setData(null);
        setIssues([]);

        try {
            // Attempt Real Analysis
            const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
            const res = await fetch(`${API_URL}/api/analyze`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ repoUrl: url, isDemo }),
            });
            const result = await res.json();
            if (result.error) throw new Error(result.error);
            setData(result);

            // Initial fetch for beginner issues
            await fetchIssues(result, "beginner");
            saveToRecent(url);

        } catch (error) {
            console.error("Backend failed, switching to Client-Side Safe Mode 🛡️:", error);
            // FALLBACK: Use Client-Side Mock Data
            const safeData = generateSafeModeData(url);
            setData(safeData);
            // Mock issues for Safe Mode
            setIssues([
                { id: 1, title: "Fix typo in README", number: 101, labels: [{ name: "good first issue" }], comments: 2, user: { login: "octocat", avatar_url: "https://github.com/octocat.png" }, html_url: "https://github.com" },
                { id: 2, title: "Update dependency versions", number: 102, labels: [{ name: "dependencies" }], comments: 5, user: { login: "dependabot", avatar_url: "https://avatars.githubusercontent.com/in/29110" }, html_url: "https://github.com" },
                { id: 3, title: "Add loading spinner to button", number: 103, labels: [{ name: "ui" }], comments: 0, user: { login: "user123", avatar_url: "https://github.com/ghost.png" }, html_url: "https://github.com" }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyze = () => analyzeRepo(repoUrl);

    // Re-fetch issues when Level changes
    useEffect(() => {
        if (data) {
            fetchIssues(data, level);
        }
    }, [level]);

    // Chart Data Preparation
    const techStackData = data ? data.techStack.map((tech: string) => ({ name: tech, value: 1 })) : [];

    // Helper for Smart Suggestions (Rule-based Logic)
    const getSuggestions = (issue: any, level: string) => {
        const title = issue?.title?.toLowerCase() || "";

        // Base structure for PR Assistant
        let base = {
            branch: `git checkout -b fix/issue-${issue.number}`,
            commit: `git commit -m "fix: ${issue.title} (#${issue.number})"`,
            template: `## What does this PR do?\nFixes #${issue.number}\n\n## Verification\n- [ ] Ran locally\n- [ ] Tests pass`
        };

        // PR Meeting Guidance
        let meeting = {
            talkingPoints: [
                "Summarize the goal of the PR in one sentence.",
                "Mention any technical hurdles encountered and how they were solved.",
                "Ask for feedback on specific lines of code (be precise)."
            ],
            questions: [
                "Does this align with the project's long-term vision?",
                "Are there existing tests I should run or update for this?",
                "Are there specific edge cases I should focus on during verification?"
            ]
        };

        // Context-aware logic
        let specific = {
            files: "src/...",
            skills: "General",
            steps: ["Reproduce the issue", "Create a new branch", "Submit PR"],
        };

        if (level === 'beginner') {
            if (title.includes('readme') || title.includes('docs')) {
                specific = {
                    files: "README.md, CONTRIBUTING.md",
                    skills: "Markdown, Writing",
                    steps: ["Fork the repo", "Edit file in GitHub or locally", "Commit changes"]
                };
                base.branch = `git checkout -b docs/update-readme`;
                base.commit = `git commit -m "docs: update README details"`;
                meeting.talkingPoints = [
                    "Discussed clarity of current documentation.",
                    "Proposed additions for better contributor onboarding.",
                    "Verified formatting across different platforms."
                ];
            } else {
                specific = {
                    files: "src/components/...",
                    skills: "React, CSS",
                    steps: ["Reproduce expected behavior", "Locate component file", "Apply fix"]
                };
                meeting.talkingPoints = [
                    "Explain the UI state changes implemented.",
                    "Show how the component handles different screen sizes.",
                    "Discuss any new dependencies added (if any)."
                ];
            }
        }

        return { ...base, ...specific, meeting, tip: "Don't forget to star the repo!" };
    };

    // Skills Matching Logic
    const getMatchScore = (issue: any) => {
        if (!issue || !userSkills.length) return 0;
        try {
            const suggestions = getSuggestions(issue, level);
            const title = issue.title || "";
            const body = issue.body || "";
            const issueContext = (title + " " + body + " " + suggestions.skills).toLowerCase();
            const matches = userSkills.filter(skill => issueContext.includes(skill.toLowerCase()));
            return Math.min(Math.round((matches.length / userSkills.length) * 100), 100);
        } catch (e) {
            return 0;
        }
    };

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

    const generateProposal = (issue: any) => {
        const suggestions = getSuggestions(issue, level);
        const repoName = issue.repo_name || data?.repo || "Unknown Repo";
        const primaryLang = data?.primaryLanguage || "Open Source";

        const md = `# Proposal: ${issue.title} (WoC 5.0)

## 1. Project Overview
**Target Repository:** ${repoName}
**Issue:** #${issue.number} - ${issue.title}

## 2. Technical Approach
I plan to address this issue by focusing on the following areas:
- **Scope:** ${suggestions.files}
- **Required Skills:** ${suggestions.skills}

### Proposed Steps:
${suggestions.steps.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}

## 3. Timeline
- **Phase 1 (Setup):** Reproduce issue and analyze existing codebase.
- **Phase 2 (Implementation):** Apply fixes in a dedicated branch.
- **Phase 3 (Verification):** Manual and automated testing.

## 4. Why me?
I am passionate about ${primaryLang} and eager to contribute to ${repoName.split('/')[1] || repoName}. ${data ? `I've analyzed the repo's health score (${data.healthScore}/100) and feel confident in my ability to follow the project's standards.` : "I have reviewed the repository details and am ready to start contributing immediately."}

---
### 👤 Candidate Profile (Match Score: ${getMatchScore(issue)}%)
- **Verified Skills:** ${userSkills.join(', ')}
- **Why I'm a Fit:** This issue aligns perfectly with my expertise in ${userSkills.filter(s => (issue.title + (issue.body || '')).toLowerCase().includes(s.toLowerCase())).join(', ') || "Fullstack Development"}.

*Drafted via OnboardHub for Winter of Code 5.0*`;

        setProposalContent(md);
        setShowProposal(true);
    };

    // State for expanded suggestion
    const [expandedIssue, setExpandedIssue] = useState<number | null>(null);
    const [activeComments, setActiveComments] = useState<any[]>([]);
    const [loadingComments, setLoadingComments] = useState(false);

    const fetchComments = async (issue: any) => {
        if (!data || !issue || issue.comments === 0) {
            setActiveComments([]);
            return;
        }

        setLoadingComments(true);
        try {
            // Check if mock issue (for Safe Mode) or Real
            const [owner, name] = data.repo ? data.repo.split('/') : ["unknown", "unknown"];
            const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

            // If we are in safe mode or missing repo, use mock logic if desired,
            // but the backend handles mocking now too.
            const res = await fetch(`${API_URL}/api/issues/${owner}/${name}/issues/${issue.number}/comments`);
            const json = await res.json();
            setActiveComments(json);
        } catch (e) {
            console.error("Failed to fetch comments", e);
            setActiveComments([]);
        } finally {
            setLoadingComments(false);
        }
    };

    const toggleSuggestion = (e: React.MouseEvent, issue: any) => {
        e.preventDefault();
        const isExpanding = expandedIssue !== issue.id;
        setExpandedIssue(isExpanding ? issue.id : null);

        if (isExpanding) {
            fetchComments(issue);
        }
    };

    // Global Search State
    const [showGlobalModal, setShowGlobalModal] = useState(false);
    const [showSkillModal, setShowSkillModal] = useState(false);
    const [globalIssues, setGlobalIssues] = useState<any[]>([]);
    const [globalLoading, setGlobalLoading] = useState(false);

    const fetchGlobalIssues = async () => {
        if (userSkills.length === 0) return;
        setGlobalLoading(true);
        try {
            const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
            const res = await fetch(`${API_URL}/api/issues/global`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ skills: userSkills }),
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setGlobalIssues(data);
                setShowGlobalModal(true);
            } else {
                console.error("Invalid response format", data);
            }
        } catch (err) {
            console.error("Global search failed", err);
        } finally {
            setGlobalLoading(false);
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(proposalContent);
        setCopied(true);
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#3b82f6', '#10b981', '#ffffff'] // Blue, Green, White (Brand Colors)
        });
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-[#050505] text-gray-100 font-sans selection:bg-purple-500/30 overflow-x-hidden">

            {/* Navbar */}
            <nav className="border-b border-gray-800/50 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href="/" className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                            OnboardHub
                        </span>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-12">

                {/* Search Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col items-center gap-6 mb-16"
                >
                    <MagnifiedHeading
                        text={isDemoMode ? "Repository Intelligence Engine – Demo" : "Repository Intelligence Engine"}
                        isDemo={isDemoMode}
                    />
                    <p className="text-gray-400 text-center max-w-lg text-lg">
                        Unlock open source contributions with Data-driven insights.
                    </p>

                    <div className="relative w-full max-w-2xl group shadow-2xl">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative flex gap-2 p-1.5 bg-black/80 backdrop-blur-md rounded-xl ring-1 ring-white/10">
                            <input
                                type="text"
                                placeholder="https://github.com/owner/repo"
                                value={repoUrl}
                                onChange={(e) => setRepoUrl(e.target.value)}
                                className="flex-1 bg-transparent px-4 py-3 text-white focus:outline-none placeholder-gray-600 text-lg"
                            />
                            <button
                                onClick={handleAnalyze}
                                disabled={loading}
                                className="bg-gradient-to-r from-orange-500 to-red-600 text-white hover:scale-110 hover:shadow-[0_0_30px_rgba(239,68,68,0.6)] font-bold px-6 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg group"
                            >
                                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Rocket className="w-6 h-6 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-200" />}
                            </button>
                        </div>


                        {/* Global Search Trigger Button */}
                        {!isDemoMode && (
                            <div className="w-full max-w-xl mx-auto mt-8 relative z-30">
                                <button
                                    onClick={() => setShowSkillModal(true)}
                                    className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-lg font-bold text-white shadow-xl shadow-blue-500/20 hover:scale-105 hover:shadow-purple-500/40 transition-all group"
                                >
                                    <Globe className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                                    Global Opportunity Finder (No Repo Required)
                                </button>
                            </div>
                        )}

                        {/* Recent History (Hackathon Polish) */}
                        {recentRepos.length > 0 && !loading && !data && (
                            <div className="mt-8 flex flex-wrap gap-3 justify-center">
                                <span className="text-gray-500 text-sm py-2">Recently Analyzed:</span>
                                {recentRepos.map((url) => (
                                    <button
                                        key={url}
                                        onClick={() => { setRepoUrl(url); analyzeRepo(url); }}
                                        className="px-3 py-1 bg-gray-900 border border-gray-800 rounded-full text-xs text-gray-400 hover:text-white hover:border-gray-500 transition-all"
                                    >
                                        {url.split('/').slice(-2).join('/')}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Skills Profiler (Phase 4) */}

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

                                <div className="bg-white/5 border border-white/10 rounded-xl p-4 min-h-[100px] mb-6">
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {userSkills.map(skill => (
                                            <span key={skill} className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-xs text-blue-300 flex items-center gap-2">
                                                {skill}
                                                <button onClick={() => removeSkill(skill)} className="hover:text-white"><X className="w-3 h-3" /></button>
                                            </span>
                                        ))}
                                        <input
                                            type="text"
                                            placeholder="Type skill & press Enter..."
                                            value={skillInput}
                                            onChange={(e) => setSkillInput(e.target.value)}
                                            onKeyDown={addSkill}
                                            className="bg-transparent text-sm text-white focus:outline-none min-w-[150px] py-1"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={() => { setShowSkillModal(false); fetchGlobalIssues(); }}
                                    disabled={globalLoading || userSkills.length === 0}
                                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold text-white shadow-lg hover:shadow-blue-500/20 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {globalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                                    Find Matching Issues
                                </button>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                { /* Global Issues Modal */}
                <AnimatePresence>
                    {showGlobalModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="w-full max-w-4xl bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden max-h-[85vh] flex flex-col shadow-2xl"
                            >
                                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
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

                                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                                    {globalIssues.map(issue => (
                                        <div key={issue.id} className="bg-white/5 border border-white/5 rounded-xl p-5 hover:border-purple-500/30 transition-all group">
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-[10px] font-mono text-gray-500">{issue.repo_name}</span>
                                                        <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                                                        <div className="flex gap-1">
                                                            {issue.labels.slice(0, 3).map((l: any, i: number) => (
                                                                <span key={i} className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-white/10 text-gray-300">
                                                                    {l.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <h3 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors mb-2">
                                                        {issue.title}
                                                    </h3>
                                                    <p className="text-xs text-gray-400 line-clamp-2 mb-3">{issue.body || "No description provided."}</p>

                                                    {/* Smart Match Bar */}
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-1 w-24 bg-white/5 rounded-full overflow-hidden">
                                                            <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500" style={{ width: `${getMatchScore(issue)}%` }}></div>
                                                        </div>
                                                        <span className="text-[9px] font-bold text-purple-400">{getMatchScore(issue)}% SKILL MATCH</span>
                                                    </div>
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
                                                    <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                                        <MessageSquare className="w-3 h-3" /> {issue.comments}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Error Banner */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="max-w-2xl mx-auto mb-8"
                        >
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-200">
                                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
                                <p>{error}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Dashboard Content */}
                <AnimatePresence>
                    {data && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="space-y-8"
                        >

                            {/* Top Stats Power Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                                {/* 1. Repo Health Card */}
                                <div className="col-span-1 md:col-span-6">
                                    <div className="h-full bg-gradient-to-br from-gray-900 to-black border border-white/5 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between relative overflow-hidden group">

                                        {/* Radial Glow */}
                                        <div className="absolute top-[-50%] left-[-20%] w-[500px] h-[500px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none"></div>

                                        <div className="flex items-center gap-8 z-10 w-full">
                                            <div className="relative w-32 h-32 flex-shrink-0">
                                                <svg className="w-full h-full transform -rotate-90">
                                                    <circle cx="64" cy="64" r="56" stroke="#1f2937" strokeWidth="8" fill="transparent" />
                                                    <motion.circle
                                                        initial={{ strokeDashoffset: 351 }}
                                                        animate={{ strokeDashoffset: 351 * (1 - data.healthScore / 100) }}
                                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                                        cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent"
                                                        className={`${data.healthScore > 80 ? "text-emerald-500" : data.healthScore > 60 ? "text-yellow-500" : "text-rose-500"}`}
                                                        strokeDasharray={351}
                                                        strokeLinecap="round"
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <span className="text-4xl font-extrabold text-white tracking-tighter">{data.healthScore}</span>
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h2 className="text-2xl font-bold text-white">Health</h2>
                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${data.healthScore > 85 ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"}`}>
                                                        {data.healthScore > 85 ? "Platinum" : "Solid"}
                                                    </span>
                                                </div>
                                                <p className="text-gray-400 text-sm mb-4">Documentation & structure health.</p>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {['readme', 'contributing', 'license'].map((key) => (
                                                        <div key={key} className={`flex items-center gap-2 px-2 py-1 rounded-lg text-[9px] font-medium border ${data.healthChecklist?.[key as keyof typeof data.healthChecklist] ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' : 'border-white/5 text-gray-500'}`}>
                                                            {data.healthChecklist?.[key as keyof typeof data.healthChecklist] ? <ShieldCheck className="w-3 h-3" /> : <AlertCircle className="w-3 h-3 opacity-50" />}
                                                            {key.toUpperCase()}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Mentor Readiness Card (The Hackathon Star) */}
                                <div className="col-span-1 md:col-span-3">
                                    <div className="h-full bg-gradient-to-br from-gray-900 to-black border border-purple-500/20 rounded-3xl p-6 flex flex-col items-center justify-center space-y-4 relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-purple-600/5 blur-3xl rounded-full translate-y-12"></div>
                                        <div className="text-gray-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2 z-10">
                                            <Users className="w-4 h-4 text-purple-400" />
                                            Mentor Active
                                        </div>
                                        <div className="relative w-24 h-24 z-10">
                                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                                <circle cx="18" cy="18" r="16" stroke="#1f2937" strokeWidth="2.5" fill="none" />
                                                <motion.circle
                                                    initial={{ strokeDashoffset: 100 }}
                                                    animate={{ strokeDashoffset: 100 - (data.mentorReadiness || 70) }}
                                                    transition={{ duration: 2, delay: 0.5 }}
                                                    cx="18" cy="18" r="16" stroke="#a855f7" strokeWidth="2.5" fill="none"
                                                    strokeDasharray="100"
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center font-black text-2xl text-white">
                                                {data.mentorReadiness || 70}%
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-gray-500 text-center z-10 font-medium">
                                            Probability of getting your <br /> first PR reviewed quickly.
                                        </p>
                                    </div>
                                </div>

                                {/* 3. Rapid Stats */}
                                <div className="col-span-1 md:col-span-3 grid grid-rows-2 gap-4">
                                    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col justify-between hover:border-blue-500/30 transition-all">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Stars</span>
                                            <Star className="w-4 h-4 text-yellow-500" />
                                        </div>
                                        <div className="text-xl font-bold text-white">{data.stars.toLocaleString()}</div>
                                    </div>
                                    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col justify-between hover:border-red-500/30 transition-all">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Open Issues</span>
                                            <AlertCircle className="w-4 h-4 text-red-500" />
                                        </div>
                                        <div className="text-xl font-bold text-white">{data.openIssues.toLocaleString()}</div>
                                    </div>
                                </div>
                            </div>


                            <div className="grid lg:grid-cols-3 gap-8">

                                { /* Left Sidebar */}
                                <div className="space-y-6">

                                    {/* Languages Bar */}
                                    {data.languages && Object.keys(data.languages).length > 0 && (
                                        <div className="bg-black/40 border border-white/5 rounded-2xl p-6">
                                            <h3 className="text-sm font-semibold text-gray-400 mb-4">Tech Composition</h3>
                                            <div className="flex h-2 rounded-full overflow-hidden mb-4">
                                                {Object.entries(data.languages).map(([lang, bytes]: [string, any], i) => {
                                                    const total = Object.values(data.languages).reduce((a: any, b: any) => a + b, 0) as number;
                                                    const percent = (bytes / total) * 100;
                                                    if (percent < 1) return null;
                                                    return <div key={i} style={{ width: `${percent}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                                                })}
                                            </div>
                                            <div className="flex flex-wrap gap-x-4 gap-y-2">
                                                {Object.entries(data.languages).slice(0, 4).map(([lang, bytes]: [string, any], i) => (
                                                    <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                                        {lang}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Card */}
                                    <div className="bg-gradient-to-b from-blue-900/40 to-purple-900/10 border border-blue-500/20 rounded-3xl p-6 relative overflow-hidden">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                                <Sparkles className="w-5 h-5 text-white" />
                                            </div>
                                            <h2 className="text-lg font-bold text-white">Start Here</h2>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex gap-4 group">
                                                <div className="flex-col items-center flex">
                                                    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400 ring-1 ring-blue-500/50">1</div>
                                                    <div className="w-px h-full bg-blue-500/20 my-1 group-last:hidden"></div>
                                                </div>
                                                <div className="pb-4">
                                                    <p className="text-sm font-medium text-gray-200 mb-1">Set up environment</p>
                                                    <div className="bg-black/50 rounded-lg p-2.5 flex items-center justify-between border border-white/5">
                                                        <code className="text-xs text-gray-400 font-mono truncate mr-2">
                                                            {data.setupCommands && data.setupCommands.length > 1 ? data.setupCommands.slice(1).join(" && ") : "npm install"}
                                                        </code>
                                                        <CopyButton text={data.setupCommands && data.setupCommands.length > 1 ? data.setupCommands.slice(1).join(" && ") : "npm install"} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-4 group">
                                                <div className="flex-col items-center flex">
                                                    <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs font-bold text-purple-400 ring-1 ring-purple-500/50">2</div>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-200 mb-1">Pick an issue below</p>
                                                    <p className="text-xs text-gray-500">We found {issues.length} {level} tasks.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Community Bonding (WoC 5.0 Special) */}
                                    {data.socialLinks && data.socialLinks.length > 0 && (
                                        <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-3xl p-6">
                                            <h3 className="text-sm font-bold text-emerald-400 mb-4 flex items-center gap-2">
                                                <Users className="w-4 h-4" /> Community Bonding
                                            </h3>
                                            <p className="text-xs text-gray-400 mb-4">Jump into the conversation and introduce yourself!</p>
                                            <div className="space-y-3">
                                                {data.socialLinks.map((link: any, i: number) => (
                                                    <a
                                                        key={i}
                                                        href={link.url}
                                                        target="_blank"
                                                        className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-emerald-500/10 hover:border-emerald-500/30 transition-all group"
                                                    >
                                                        <span className="text-sm font-medium text-gray-200 capitalize">{link.type}</span>
                                                        <ExternalLink className="w-4 h-4 text-emerald-500 group-hover:translate-x-1 transition-transform" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                </div>

                                {/* Issues List */}
                                <div className="lg:col-span-2 bg-black/20 border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col min-h-[600px]">
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                                            <Layers className="w-5 h-5 text-gray-400" />
                                            Issue Finder
                                        </h2>
                                        <div className="flex bg-black/50 p-1 rounded-xl border border-white/5 gap-1">
                                            <button
                                                onClick={() => setShowMatchesOnly(!showMatchesOnly)}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-1.5 ${showMatchesOnly ? 'bg-blue-500 text-white shadow shadow-blue-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                            >
                                                <Zap className="w-3.5 h-3.5" />
                                                <span>Matches</span>
                                                {userSkills.length > 0 && <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-[9px]">{issues.filter(i => getMatchScore(i) > 30).length}</span>}
                                            </button>
                                            <div className="w-px h-6 bg-white/10 my-auto mx-1"></div>
                                            {(['beginner', 'intermediate', 'pro'] as const).map((l) => (
                                                <button
                                                    key={l}
                                                    onClick={() => setLevel(l)}
                                                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${level === l ? 'bg-gray-800 text-white shadow' : 'text-gray-500 hover:text-white'} capitalize`}
                                                >
                                                    {l}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {fetchingIssues ? (
                                        <div className="flex-1 flex flex-col items-center justify-center gap-4">
                                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                            <p className="text-gray-500">Scanning repository...</p>
                                        </div>
                                    ) : issues.length === 0 ? (
                                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-800 rounded-2xl">
                                            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                                <ShieldCheck className="w-8 h-8 text-gray-600" />
                                            </div>
                                            <h3 className="text-lg font-bold text-white mb-2">All Clear!</h3>
                                            <p className="text-gray-500 max-w-xs">No open {level} issues found. Try switching difficulty levels.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {issues.filter(i => !showMatchesOnly || getMatchScore(i) > 30).map((issue) => (
                                                <div
                                                    key={issue.id}
                                                    className={`group rounded-2xl border transition-all duration-300 overflow-hidden ${expandedIssue === issue.id
                                                        ? 'bg-white/5 border-purple-500/30'
                                                        : 'bg-white/2 border-white/5 hover:border-white/10 hover:bg-white/3'
                                                        }`}
                                                >
                                                    <div
                                                        className="p-5 cursor-pointer"
                                                        onClick={(e) => toggleSuggestion(e, issue)}
                                                    >
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <span className="text-[10px] font-mono text-gray-500">#{issue.number}</span>
                                                                    <div className="flex flex-wrap gap-1.5">
                                                                        {issue.labels.slice(0, 2).map((label: any, i: number) => (
                                                                            <span
                                                                                key={i}
                                                                                className="px-2 py-0.5 rounded text-[9px] font-bold"
                                                                                style={{ backgroundColor: `#${label.color}20`, color: `#${label.color}` }}
                                                                            >
                                                                                {label.name}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                                <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                                                                    {issue.title}
                                                                </h3>
                                                                {/* Match Badge */}
                                                                {getMatchScore(issue) > 0 && (
                                                                    <div className="mt-2 flex items-center gap-2">
                                                                        <div className="flex h-1 w-24 bg-white/5 rounded-full overflow-hidden">
                                                                            <div
                                                                                className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                                                                                style={{ width: `${getMatchScore(issue)}%` }}
                                                                            />
                                                                        </div>
                                                                        <span className="text-[9px] font-black text-blue-400 uppercase tracking-tighter">
                                                                            {getMatchScore(issue)}% Match
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                {/* TL;DR Description */}
                                                                <p className="text-xs text-gray-500 mt-2 line-clamp-1 leading-relaxed">
                                                                    {issue.body || "No description provided."}
                                                                </p>
                                                            </div>
                                                            <div className="flex flex-col items-end gap-3">
                                                                <div className="flex items-center gap-3 text-gray-500">
                                                                    <div className="flex items-center gap-1">
                                                                        <MessageSquare className="w-3 h-3" />
                                                                        <span className="text-[10px]">{issue.comments}</span>
                                                                    </div>
                                                                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expandedIssue === issue.id ? 'rotate-180' : ''}`} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <AnimatePresence>
                                                        {expandedIssue === issue.id && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: "auto", opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="px-5 pb-6 space-y-6">

                                                                    {/* Issue Context */}
                                                                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                                                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                                            <Info className="w-3 h-3" /> Original Issue
                                                                        </h4>
                                                                        <div className="text-xs text-gray-300 leading-relaxed max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                                                                            {issue.body || "This issue has no manual description. Use the metadata above to guide your fix."}
                                                                        </div>
                                                                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[9px] text-gray-500">
                                                                            <div className="flex items-center gap-2">
                                                                                <div className="w-4 h-4 rounded-full bg-gray-700 overflow-hidden">
                                                                                    {issue.user.avatar_url && <img src={issue.user.avatar_url} alt="" className="w-full h-full object-cover" />}
                                                                                </div>
                                                                                <span>opened by <span className="text-gray-300">{issue.user.login}</span></span>
                                                                            </div>
                                                                            <a href={issue.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 flex items-center gap-1">
                                                                                View on GitHub <ExternalLink className="w-2.5 h-2.5" />
                                                                            </a>
                                                                        </div>
                                                                    </div>

                                                                    <div className="pt-2 border-t border-gray-700/50 space-y-8">

                                                                        {/* Assistant Header */}
                                                                        <div className="flex items-center gap-3 bg-purple-500/10 border border-purple-500/20 px-4 py-2 rounded-xl w-fit">
                                                                            <Sparkles className="w-4 h-4 text-purple-400" />
                                                                            <span className="text-xs font-bold text-purple-300 uppercase tracking-widest">First PR Assistant Active</span>
                                                                        </div>
                                                                        <button
                                                                            onClick={() => generateProposal(issue)}
                                                                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-purple-500/20 transition-all flex items-center gap-2"
                                                                        >
                                                                            <Zap className="w-4 h-4" /> Draft Application
                                                                        </button>


                                                                        {/* Roadmap Steps */}
                                                                        <div className="space-y-6">
                                                                            <div className="flex gap-4">
                                                                                <div className="flex flex-col items-center">
                                                                                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-blue-500/20">1</div>
                                                                                    <div className="w-px h-full bg-gray-800 my-2"></div>
                                                                                </div>
                                                                                <div className="flex-1 pb-4">
                                                                                    <h4 className="text-sm font-bold text-white mb-2">Fork & Setup</h4>
                                                                                    <p className="text-xs text-gray-500 mb-3">Fork the repository on GitHub, then clone and install dependencies.</p>
                                                                                    <div className="bg-black p-3 rounded-lg border border-white/5 font-mono text-xs text-gray-400 flex items-center justify-between">
                                                                                        <span>git clone [your-fork-url] && {data.packageManager} install</span>
                                                                                        <CopyButton text={`git clone [your-fork-url] && ${data.packageManager} install`} />
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            <div className="flex gap-4">
                                                                                <div className="flex flex-col items-center">
                                                                                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-purple-500/20">2</div>
                                                                                    <div className="w-px h-full bg-gray-800 my-2"></div>
                                                                                </div>
                                                                                <div className="flex-1 pb-4">
                                                                                    <h4 className="text-sm font-bold text-white mb-2">Create Branch</h4>
                                                                                    <div className="bg-black/50 rounded-lg p-3 flex items-center justify-between border border-white/5">
                                                                                        <code className="text-xs text-blue-300 font-mono truncate mr-2">
                                                                                            {getSuggestions(issue, level).branch}
                                                                                        </code>
                                                                                        <CopyButton text={getSuggestions(issue, level).branch || ""} />
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            <div className="flex gap-4">
                                                                                <div className="flex flex-col items-center">
                                                                                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-green-500/20">3</div>
                                                                                    <div className="w-px h-full bg-gray-800 my-2"></div>
                                                                                </div>
                                                                                <div className="flex-1 pb-4">
                                                                                    <h4 className="text-sm font-bold text-white mb-2">Apply Fix & Commit</h4>
                                                                                    <p className="text-xs text-gray-500 mb-3">Target files: <span className="text-gray-300 font-mono italic">{getSuggestions(issue, level).files}</span></p>
                                                                                    <div className="bg-black/50 rounded-lg p-3 flex items-center justify-between border border-white/5">
                                                                                        <code className="text-xs text-green-300 font-mono truncate mr-2">
                                                                                            {getSuggestions(issue, level).commit}
                                                                                        </code>
                                                                                        <CopyButton text={getSuggestions(issue, level).commit || ""} />
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            <div className="flex gap-4">
                                                                                <div className="flex flex-col items-center">
                                                                                    <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-yellow-500/20">4</div>
                                                                                    <div className="w-px h-full bg-gray-800 my-2"></div>
                                                                                </div>
                                                                                <div className="flex-1 pb-4">
                                                                                    <h4 className="text-sm font-bold text-white mb-2">PR Submission</h4>
                                                                                    <span className="text-xs uppercase tracking-wider text-gray-500 font-bold flex items-center gap-2 mb-2">Suggested Template:</span>
                                                                                    <div className="bg-black/50 rounded-lg p-3 border border-white/5 relative group/template">
                                                                                        <pre className="text-[10px] text-gray-400 font-mono overflow-x-auto whitespace-pre-wrap">
                                                                                            {getSuggestions(issue, level).template}
                                                                                        </pre>
                                                                                        <div className="absolute top-2 right-2 opacity-0 group-hover/template:opacity-100 transition-opacity">
                                                                                            <CopyButton text={getSuggestions(issue, level).template || ""} />
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            <div className="flex gap-4">
                                                                                <div className="flex flex-col items-center">
                                                                                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-orange-500/20 text-balance">5</div>
                                                                                </div>
                                                                                <div className="flex-1">
                                                                                    <h4 className="text-sm font-bold text-white mb-2">Maintainer Sync</h4>
                                                                                    <div className="bg-blue-500/5 rounded-lg p-4 border border-blue-500/20">
                                                                                        <div className="grid md:grid-cols-2 gap-6">
                                                                                            <div>
                                                                                                <h4 className="text-[10px] font-bold text-blue-400 mb-2 uppercase flex items-center gap-2">
                                                                                                    <Sparkles className="w-3 h-3" /> Talking Points
                                                                                                </h4>
                                                                                                <ul className="space-y-1">
                                                                                                    {getSuggestions(issue, level).meeting.talkingPoints.map((point: string, idx: number) => (
                                                                                                        <li key={idx} className="text-[10px] text-gray-300 flex gap-2">
                                                                                                            <span className="text-blue-500">•</span> {point}
                                                                                                        </li>
                                                                                                    ))}
                                                                                                </ul>
                                                                                            </div>
                                                                                            <div>
                                                                                                <h4 className="text-[10px] font-bold text-purple-400 mb-2 uppercase flex items-center gap-2">
                                                                                                    <BookOpen className="w-3 h-3" /> Questions
                                                                                                </h4>
                                                                                                <ul className="space-y-1">
                                                                                                    {getSuggestions(issue, level).meeting.questions.map((q: string, idx: number) => (
                                                                                                        <li key={idx} className="text-[10px] text-gray-300 flex gap-2">
                                                                                                            <span className="text-purple-500">?</span> {q}
                                                                                                        </li>
                                                                                                    ))}
                                                                                                </ul>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Community Discussion Section - REAL DATA */}
                                                                    {issue.comments > 0 && (
                                                                        <div className="pt-6 border-t border-gray-800">
                                                                            <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                                                                <MessageSquare className="w-4 h-4 text-blue-400" />
                                                                                Community Discussion ({issue.comments})
                                                                            </h4>

                                                                            {loadingComments ? (
                                                                                <div className="flex items-center gap-2 text-xs text-gray-500 py-4">
                                                                                    <Loader2 className="w-4 h-4 animate-spin" /> Loading discussion...
                                                                                </div>
                                                                            ) : (
                                                                                <div className="space-y-3">
                                                                                    {activeComments.slice(0, 3).map((comment) => (
                                                                                        <div key={comment.id} className="bg-white/5 rounded-xl p-4 border border-white/5 flex gap-3">
                                                                                            <div className="flex-shrink-0">
                                                                                                <img
                                                                                                    src={comment.user.avatar_url || "https://github.com/ghost.png"}
                                                                                                    alt={comment.user.login}
                                                                                                    className="w-8 h-8 rounded-full border border-gray-700"
                                                                                                />
                                                                                            </div>
                                                                                            <div className="flex-1 min-w-0">
                                                                                                <div className="flex items-center justify-between mb-1">
                                                                                                    <span className="text-xs font-bold text-gray-200">{comment.user.login}</span>
                                                                                                    <span className="text-[10px] text-gray-500">{new Date(comment.created_at).toLocaleDateString()}</span>
                                                                                                </div>
                                                                                                <p className="text-xs text-gray-400 leading-relaxed truncate">
                                                                                                    {comment.body}
                                                                                                </p>
                                                                                            </div>
                                                                                            <a href={comment.html_url} target="_blank" rel="noopener noreferrer" className="self-start text-gray-500 hover:text-white">
                                                                                                <ExternalLink className="w-3 h-3" />
                                                                                            </a>
                                                                                        </div>
                                                                                    ))}
                                                                                    {issue.comments > 3 && (
                                                                                        <button onClick={() => window.open(issue.html_url, '_blank')} className="w-full py-2 text-xs text-center text-blue-400 hover:text-blue-300 font-medium bg-blue-500/5 rounded-lg border border-blue-500/10">
                                                                                            View {issue.comments - 3} more comments on GitHub
                                                                                        </button>
                                                                                    )}
                                                                                    {activeComments.length === 0 && !loadingComments && (
                                                                                        <p className="text-xs text-gray-500 italic">No comments to display.</p>
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )}

                                                                    <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-800">
                                                                        <a
                                                                            href={issue.html_url}
                                                                            target="_blank"
                                                                            className="flex items-center gap-2 px-6 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors text-sm font-semibold"
                                                                        >
                                                                            <ExternalLink className="w-4 h-4" /> View on GitHub
                                                                        </a>
                                                                        <button
                                                                            onClick={() => generateProposal(issue)}
                                                                            className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all text-sm font-bold shadow-[0_0_15px_rgba(147,51,234,0.3)]"
                                                                        >
                                                                            <Zap className="w-4 h-4" /> Draft Application
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Modern Empty State */}
                {!data && !loading && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mt-20 flex flex-col items-center justify-center text-center"
                    >
                        <div className="relative w-64 h-64 mb-8 flex items-center justify-center">
                            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
                            <img src="/grid.svg" className="absolute inset-0 w-full h-full opacity-30 animate-spin-slow mix-blend-overlay" alt="" />
                            <div className="relative z-10 bg-black/50 p-6 rounded-2xl border border-white/10 backdrop-blur-sm shadow-2xl">
                                <GitFork className="w-16 h-16 text-gray-200" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-3">Ready to contribute?</h2>
                        <p className="text-gray-400 max-w-md mb-8 text-lg">
                            Enter a GitHub URL above to analyze complexity, find beginner issues, and generate a setup guide.
                        </p>

                        <div className="flex gap-4">
                            <button
                                onClick={() => {
                                    setRepoUrl("https://github.com/facebook/react");
                                    analyzeRepo("https://github.com/facebook/react");
                                }}
                                className="px-6 py-3 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-white hover:bg-gray-800 transition-all flex items-center gap-2"
                            >
                                <Github className="w-4 h-4" /> Try with React
                            </button>
                        </div>
                    </motion.div>
                )}
            </main>

            {/* Proposal Modal (Hackathon Winner Feature) */}
            {
                showProposal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-gray-900 border border-gray-800 w-full max-w-2xl rounded-2xl shadow-2xl relative overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <span className="bg-purple-500/20 p-2 rounded-lg"><Zap className="w-5 h-5 text-purple-400" /></span>
                                    Winter of Code 5.0 Proposal Draft
                                </h3>
                                <button onClick={() => setShowProposal(false)} className="text-gray-500 hover:text-white transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="p-6 max-h-[60vh] overflow-y-auto font-mono text-sm text-gray-300 bg-black/40">
                                <pre className="whitespace-pre-wrap">{proposalContent}</pre>
                            </div>
                            <div className="p-6 border-t border-gray-800 flex justify-end gap-4">
                                <button
                                    onClick={() => handleCopy(proposalContent)}
                                    className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    {copied ? "Copied!" : "Copy to Clipboard"}
                                </button>
                                <button
                                    onClick={() => setShowProposal(false)}
                                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-bold"
                                >
                                    Done
                                </button>
                            </div>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 blur-[100px] pointer-events-none" />
                        </motion.div>
                    </div>
                )
            }
        </div >
    );
}
