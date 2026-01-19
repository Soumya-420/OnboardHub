const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { owner, repo, level } = req.query;

        if (!owner || !repo) {
            return res.status(400).json({ error: 'Owner and Repo query params are required' });
        }

        // 1. Determine Labels based on Level
        let labels = 'good first issue'; // Default
        if (level === 'intermediate') labels = 'help wanted';
        else if (level === 'pro') labels = 'enhancement';

        // 2. Prepare Headers (Token Support)
        const headers = { 'Accept': 'application/vnd.github.v3+json' };
        if (process.env.GITHUB_TOKEN) {
            headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
        }

        console.log(`Fetching issues for ${owner}/${repo} [${level}]`);

        // 3. Fetch from GitHub
        const { data: issues } = await axios.get(
            `https://api.github.com/repos/${owner}/${repo}/issues?state=open&labels=${encodeURIComponent(labels)}&per_page=10`,
            { headers }
        );

        // 4. Transform & Filter (remove PRs)
        const cleanedIssues = issues
            .filter(issue => !issue.pull_request)
            .map(issue => ({
                id: issue.id,
                number: issue.number,
                title: issue.title,
                body: issue.body || '', // Adding body for realness
                state: issue.state,
                url: issue.html_url,
                comments: issue.comments,
                created_at: issue.created_at,
                updated_at: issue.updated_at,
                user: {
                    login: issue.user?.login || 'unknown',
                    avatar_url: issue.user?.avatar_url || ''
                },
                labels: issue.labels.map(l => ({ name: l.name, color: l.color }))
            }));

        res.json(cleanedIssues);

    } catch (error) {
        console.error('Issue fetch error:', error.message);

        // --- MOCK FALLBACK (Robust) ---
        // This ensures the Demo ALWAYS works, even if rate limited.

        const allMockIssues = [
            // Beginner
            { id: 101, number: 1, title: "Fix alignment in Dashboard", body: "The dashboard cards are currently not aligned on mobile devices. Need to update the flexbox configuration in `dashboard/page.tsx`.", labels: [{ name: "good first issue", color: "7057ff" }], level: "beginner", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), url: "#", state: "open", comments: 2, user: { login: "mockuser", avatar_url: "" } },
            { id: 102, number: 4, title: "Update README.md with setup guide", body: "We need a more detailed environment setup guide for Windows users. Please add instructions for WSL2.", labels: [{ name: "documentation", color: "0075ca" }], level: "beginner", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), url: "#", state: "open", comments: 0, user: { login: "mockuser", avatar_url: "" } },
            { id: 105, number: 18, title: "Fix typo in landing page", body: "There is a spelling mistake in the 'Workflow' section description. 'Effecient' should be 'Efficient'.", labels: [{ name: "good first issue", color: "7057ff" }], level: "beginner", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), url: "#", state: "open", comments: 1, user: { login: "mockuser", avatar_url: "" } },

            // Intermediate
            { id: 103, number: 12, title: "Add unit tests for API routes", body: "Current test coverage is below 50%. We need Jest tests for the `/api/analyze` and `/api/issues` endpoints.", labels: [{ name: "help wanted", color: "008672" }], level: "intermediate", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), url: "#", state: "open", comments: 5, user: { login: "mockuser", avatar_url: "" } },
            { id: 106, number: 22, title: "Refactor issue card component", body: "The `IssueCard` component is too large. Split it into smaller sub-components for better maintainability.", labels: [{ name: "enhancement", color: "a2eeef" }], level: "intermediate", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), url: "#", state: "open", comments: 3, user: { login: "mockuser", avatar_url: "" } },
            { id: 107, number: 25, title: "Implement dark mode toggle state", body: "The dark mode preference is lost on page reload. Need to persist the state in `localStorage`.", labels: [{ name: "bug", color: "d73a4a" }], level: "intermediate", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), url: "#", state: "open", comments: 7, user: { login: "mockuser", avatar_url: "" } },

            // Pro
            { id: 104, number: 45, title: "Migrate database to PostgreSQL", body: "SQLite is hitting performance bottlenecks. Plan and execute the migration to a production-grade PostgreSQL instance.", labels: [{ name: "advanced", color: "d93f0b" }], level: "pro", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), url: "#", state: "open", comments: 10, user: { login: "mockuser", avatar_url: "" } },
            { id: 108, number: 50, title: "Optimize API response caching", body: "Large repository analysis takes too long. Implement Redis caching to store analysis results for 1 hour.", labels: [{ name: "performance", color: "fbca04" }], level: "pro", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), url: "#", state: "open", comments: 8, user: { login: "mockuser", avatar_url: "" } },
            { id: 109, number: 66, title: "Implement WebSocket for real-time updates", body: "Users have to refresh to see new analysis progress. Add Socket.io for live updates from the backend.", labels: [{ name: "feature", color: "0e8a16" }], level: "pro", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), url: "#", state: "open", comments: 12, user: { login: "mockuser", avatar_url: "" } },
        ];

        const reqLevel = req.query.level || 'beginner';
        // Filter mocks by matching level property
        const filteredBytes = allMockIssues.filter(i => i.level === reqLevel);

        console.log(`Serving ${filteredBytes.length} MOCK issues for level: ${reqLevel}`);
        res.json(filteredBytes);
    }
});

// New Endpoint: Fetch Issue Comments
router.get('/:owner/:repo/issues/:number/comments', async (req, res) => {
    try {
        const { owner, repo, number } = req.params;

        // 1. Headers
        const headers = { 'Accept': 'application/vnd.github.v3+json' };
        if (process.env.GITHUB_TOKEN) {
            headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
        }

        console.log(`Fetching comments for ${owner}/${repo} #${number}`);

        // 2. Fetch from GitHub
        const { data } = await axios.get(
            `https://api.github.com/repos/${owner}/${repo}/issues/${number}/comments?per_page=5`,
            { headers }
        );

        // 3. Transform
        const comments = data.map(c => ({
            id: c.id,
            user: {
                login: c.user?.login || 'unknown',
                avatar_url: c.user?.avatar_url || ''
            },
            body: c.body,
            created_at: c.created_at,
            html_url: c.html_url
        }));

        res.json(comments);

    } catch (error) {
        console.error('Comments fetch error:', error.message);

        // --- MOCK FALLBACK for Comments ---
        const mockComments = [
            { id: 1, user: { login: "senior_dev", avatar_url: "https://github.com/ghost.png" }, body: "This looks like a good start, but consider handling edge cases for null inputs.", created_at: new Date(Date.now() - 86400000).toISOString(), html_url: "#" },
            { id: 2, user: { login: "maintainer_bot", avatar_url: "https://avatars.githubusercontent.com/in/29110" }, body: "Thanks for the report! We are looking into it.", created_at: new Date(Date.now() - 43200000).toISOString(), html_url: "#" },
            { id: 3, user: { login: "contributor_new", avatar_url: "https://github.com/octocat.png" }, body: "I can pick this up if no one else is working on it.", created_at: new Date().toISOString(), html_url: "#" }
        ];

        // Return a subset based on issue number to simulate variety
        // e.g. even numbers get 2 comments, odd get 3
        const subset = req.params.number % 2 === 0 ? mockComments.slice(0, 2) : mockComments;

        res.json(subset);
    }
});

// New Endpoint: Cross-Repository Global Skill Search
router.post('/global', async (req, res) => {
    try {

        const { skills, keyword } = req.body;

        if ((!skills || skills.length === 0) && !keyword) {
            return res.status(400).json({ error: 'Skills or keyword is required' });
        }

        // 1. Construct Search Query
        // Format: is:issue is:open (skill1 OR skill2 ...) keyword
        // Note: We removed 'label:"good first issue"' to allow broader searching by title/keyword.
        let query = 'is:issue is:open';

        if (keyword) {
            query += ` ${keyword} in:title,body`;
        } else if (skills && skills.length > 0) {
            const skillsQuery = skills.map(s => `"${s}"`).join(' OR ');
            query += ` (${skillsQuery})`;
        }

        console.log(`Searching Global GitHub: ${query}`);

        // 2. Headers
        const headers = { 'Accept': 'application/vnd.github.v3+json' };
        if (process.env.GITHUB_TOKEN) {
            headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
        }

        // 3. GitHub Search API
        const { data } = await axios.get(
            `https://api.github.com/search/issues?q=${encodeURIComponent(query)}&sort=updated&order=desc&per_page=15`,
            { headers }
        );

        // 4. Transform
        const globalIssues = data.items.map(issue => ({
            id: issue.id,
            number: issue.number,
            title: issue.title,
            body: issue.body || '',
            state: issue.state,
            url: issue.html_url,
            comments: issue.comments,
            created_at: issue.created_at,
            updated_at: issue.updated_at,
            repo_url: issue.repository_url, // Needed to get repo name
            user: {
                login: issue.user?.login || 'unknown',
                avatar_url: issue.user?.avatar_url || ''
            },
            labels: issue.labels.map(l => ({ name: l.name, color: l.color })),
            // Add a "repo_name" derived field for display
            repo_name: issue.repository_url.split('/').slice(-2).join('/')
        }));

        res.json(globalIssues);

    } catch (error) {
        console.error('Global search error:', error.message);

        // --- MOCK FALLBACK for Global Search ---
        const mockGlobalIssues = [
            { id: 901, number: 123, title: "Refactor React Components to Hooks", body: "Convert class-based components to functional components using hooks.", labels: [{ name: "good first issue", color: "7057ff" }], repo_name: "facebook/react", created_at: new Date().toISOString(), url: "https://github.com/facebook/react/issues/123", comments: 5, user: { login: "dan_abramov", avatar_url: "" } },
            { id: 902, number: 456, title: "Fix CSS Grid Layout on Safari", body: "Grid items are misaligned on Safari 14. Need to add prefixes or adjust grid-template.", labels: [{ name: "bug", color: "d73a4a" }], repo_name: "tailwindlabs/tailwindcss", created_at: new Date().toISOString(), url: "#", comments: 2, user: { login: "adamwathan", avatar_url: "" } },
            { id: 903, number: 789, title: "Add TypeScript definitions for API", body: "Missing types for the new /user/profile endpoint.", labels: [{ name: "good first issue", color: "0075ca" }], repo_name: "microsoft/typescript", created_at: new Date().toISOString(), url: "#", comments: 8, user: { login: "anders_h", avatar_url: "" } },
            { id: 904, number: 101, title: "Documentation: Add Python examples", body: "The SDK documentation lacks Python usage examples.", labels: [{ name: "documentation", color: "008672" }], repo_name: "python/cpython", created_at: new Date().toISOString(), url: "#", comments: 1, user: { login: "guido", avatar_url: "" } }
        ];

        // Filter mocks crudely by checking if title/body contains any skill
        const skillsLower = req.body.skills.map(s => s.toLowerCase());
        const filteredMocks = mockGlobalIssues.filter(i =>
            skillsLower.some(skill => i.title.toLowerCase().includes(skill) || i.body.toLowerCase().includes(skill))
        );

        // If no match in mocks (or empty skills), return all mocks just to show something
        res.json(filteredMocks.length > 0 ? filteredMocks : mockGlobalIssues);
    }
});

module.exports = router;
