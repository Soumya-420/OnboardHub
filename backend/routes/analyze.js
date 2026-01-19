const express = require('express');
const router = express.Router();
const axios = require('axios');

// In-memory cache for repo data
const repoCache = new Map();

// Helper to get headers (with Token if available)
const getGithubHeaders = () => {
    const headers = { 'Accept': 'application/vnd.github.v3+json' };
    if (process.env.GITHUB_TOKEN) {
        console.log("Using GitHub Token for API call 🔑");
        headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }
    return headers;
};

router.post('/', async (req, res) => {
    const { repoUrl, isDemo } = req.body;

    // Explicit Demo Mode (Requested by User)
    if (isDemo) {
        console.log("Serving Demo Data ⚡");
        return res.json({
            repo: "demo/starter-kit",
            description: "✨ Demo Mode: A perfect starter kit for beginners.",
            stars: 12450,
            forks: 3420,
            openIssues: 42,
            primaryLanguage: "TypeScript",
            techStack: ["Next.js", "React", "Tailwind CSS"],
            packageManager: "npm",
            setupCommands: [
                "git clone https://github.com/demo/starter-kit",
                "npm install",
                "npm run dev"
            ],
            languages: { "TypeScript": 85000, "JavaScript": 23000, "CSS": 12000 },
            healthScore: 98,
            healthChecklist: { readme: true, contributing: true, license: true, issues: true, pullRequests: true },
            mentorReadiness: 95,
            socialLinks: [
                { type: 'discord', url: 'https://discord.gg/onboardhub-demo' },
                { type: 'slack', url: 'https://slack.com/demo-community' }
            ]
        });
    }

    if (!repoUrl) return res.status(400).json({ error: 'Repository URL is required' });

    // Check cache
    if (repoCache.has(repoUrl)) {
        return res.json(repoCache.get(repoUrl));
    }

    try {
        // Extract owner/repo
        const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (!match) throw new Error('Invalid GitHub URL');
        const [_, owner, repo] = match;

        console.log(`Analyzing ${owner}/${repo}...`);

        // Fetch repo metadata
        const repoRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
            headers: getGithubHeaders()
        });
        const repoData = repoRes.data;

        // Fetch languages
        const langRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}/languages`, { headers: getGithubHeaders() });
        const languages = langRes.data; // Return full object: { "JavaScript": 12000, "CSS": 5000 }
        const primaryLang = Object.keys(languages).length > 0 ? Object.keys(languages)[0] : 'Unknown';

        // Derive stack and setup
        const techStack = Object.keys(languages).slice(0, 5);
        let packageManager = "Unknown";
        let setupCommands = [`git clone ${repoUrl}`];

        // Infer setup based on languages
        if (languages['JavaScript'] || languages['TypeScript']) {
            packageManager = 'npm';
            setupCommands.push('npm install', 'npm run dev');
        } else if (languages['Python']) {
            packageManager = 'pip';
            setupCommands.push('pip install -r requirements.txt');
        } else if (languages['Go']) {
            packageManager = 'go';
            setupCommands.push('go mod tidy', 'go run .');
        } else if (languages['Rust']) {
            packageManager = 'cargo';
            setupCommands.push('cargo build', 'cargo run');
        } else if (languages['Java']) {
            packageManager = 'maven/gradle';
            setupCommands.push('./mvnw clean install');
        }

        // 4. Fetch Community Profile for real health data
        let healthChecklist = { readme: true, contributing: false, license: false, issues: false, pullRequests: false };
        try {
            const communityRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}/community/profile`, {
                headers: getGithubHeaders()
            });
            const communityData = communityRes.data;
            healthChecklist = {
                readme: !!communityData.files.readme,
                contributing: !!communityData.files.contributing,
                license: !!communityData.files.license,
                issues: !!communityData.files.issue_template,
                pullRequests: !!communityData.files.pull_request_template
            };
        } catch (e) {
            console.warn("Community profile fetch failed, using heuristics");
        }

        // 5. Refined Health Score Calculation
        let healthScore = 50; // Base score
        if (healthChecklist.readme) healthScore += 10;
        if (healthChecklist.contributing) healthScore += 15;
        if (healthChecklist.license) healthScore += 10;
        if (healthChecklist.issues) healthScore += 5;
        if (healthChecklist.pullRequests) healthScore += 5;
        if (repoData.stargazers_count > 100) healthScore += 5;

        // Bonus for "Good First Issues" (Quick heuristic)
        if (repoData.open_issues_count > 0) healthScore += 5;

        healthScore = Math.min(healthScore, 100);

        // 6. Community & Social Detection (Discord, Slack, etc.)
        const socialLinks = [];
        const combinedText = (repoData.description + " " + (repoData.homepage || "")).toLowerCase();

        if (combinedText.includes('discord.gg')) {
            const match = repoData.description.match(/discord\.gg\/[a-zA-Z0-9]+/);
            if (match) socialLinks.push({ type: 'discord', url: `https://${match[0]}` });
        }
        if (combinedText.includes('slack.com')) socialLinks.push({ type: 'slack', url: repoData.homepage || '#' });

        // 7. Mentor Readiness Calculation (Real Data Driven)
        let mentorReadiness = 0;

        // A. Activity Recency
        const daysSincePush = Math.floor((new Date() - new Date(repoData.pushed_at)) / (1000 * 60 * 60 * 24));
        if (daysSincePush < 7) mentorReadiness += 40;      // Very active
        else if (daysSincePush < 30) mentorReadiness += 25; // Active
        else if (daysSincePush < 90) mentorReadiness += 10; // Moderate
        // No points if > 90 days (inactive)

        // B. Documentation for Onboarding
        if (healthChecklist.contributing) mentorReadiness += 20; // Critical for mentors
        if (healthChecklist.pullRequests) mentorReadiness += 10; // Shows process
        if (healthChecklist.codeOfConduct) mentorReadiness += 5; // Safe space

        // C. Community Features
        if (repoData.has_discussions) mentorReadiness += 15; // Active forum implies mentors

        // D. Maintenance Signals
        const issueToStarRatio = repoData.open_issues_count / (repoData.stargazers_count || 1);
        if (issueToStarRatio < 0.1) mentorReadiness += 10; // Well triaged

        mentorReadiness = Math.min(Math.max(mentorReadiness, 0), 100);

        res.json({
            repo: `${owner}/${repo}`,
            description: repoData.description,
            stars: repoData.stargazers_count,
            forks: repoData.forks_count,
            openIssues: repoData.open_issues_count,
            primaryLanguage: primaryLang,
            techStack,
            packageManager,
            setupCommands,
            languages,
            healthScore,
            healthChecklist,
            mentorReadiness,
            socialLinks
        });

    } catch (error) {
        console.error('Analysis API failed, switching to Safe Mode Fallback 🛡️:', error.message);

        // SAFE MODE: Generate realistic mock data based on the requested repo
        const [_, owner, repo] = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/) || ["", "unknown", "project"];

        return res.json({
            repo: `${owner}/${repo}`,
            description: `(Safe Mode) Analysis of ${repo}. Real API unavailable, using simulated insights.`,
            stars: Math.floor(Math.random() * 500) + 50,
            forks: Math.floor(Math.random() * 100) + 10,
            openIssues: Math.floor(Math.random() * 50) + 5,
            primaryLanguage: "TypeScript",
            techStack: ["React", "Node.js", "Tailwind"],
            packageManager: "npm",
            setupCommands: ["git clone " + repoUrl, "npm install", "npm run dev"],
            languages: { "TypeScript": 50000, "JavaScript": 20000 },
            healthScore: 85,
            healthChecklist: {
                readme: true,
                contributing: true,
                license: true,
                issues: true,
                pullRequests: false
            },
            mentorReadiness: 88,
            socialLinks: [{ type: 'discord', url: 'https://discord.gg/demo' }]
        });
    }
});

module.exports = router;
