/**
 * First PR Assistant Logic
 * Centralizes the logic for generating beginner-friendly contribution guides.
 * Requirements:
 * 1. Environment setup (Node LTS, nvm, clone, install, dev, test)
 * 2. Development workflow (branch, lint, commit, push, PR)
 * 3. Conventional commits & branch naming
 * 4. Git push & PR instructions
 * 5. Troubleshooting tips
 * 6. PR template
 * 7. "Why this works" explanation
 */

interface SuggestionData {
    setup: {
        title: string;
        steps: { label: string; cmd?: string; desc: string }[];
    };
    workflow: {
        title: string;
        steps: { label: string; cmd?: string; desc: string }[];
    };
    prDetails: {
        title: string;
        branchName: string;
        commitMessage: string;
        prTemplate: string;
    };
    guidance: {
        title: string;
        troubleshooting: { problem: string; solution: string }[];
        whyItMatters: string;
        tips: string[];
        ciChecks?: { name: string; command: string; fix: string }[];
    };
}

export const getPrSuggestions = (issue: any, repoUrl: string = 'https://github.com/owner/repo', packageManager: string = 'npm'): SuggestionData => {
    const title = issue?.title?.toLowerCase() || "fix-bug";
    const cleanTitle = title.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 30);
    const branchName = `first-pr/${cleanTitle}-issue-${issue.number || '000'}`;
    const commitMessage = `fix: ${title} (#${issue.number || '000'})`;

    const data: SuggestionData = {
        setup: {
            title: "1. Environment Setup",
            steps: [
                {
                    label: "Install Node.js (LTS)",
                    cmd: "nvm install --lts && nvm use --lts",
                    desc: "Use Version Manager (nvm) to ensure you're on a stable Node.js version."
                },
                {
                    label: "Clone Repository",
                    cmd: `git clone ${repoUrl}.git`,
                    desc: "Download the codebase to your local machine."
                },
                {
                    label: "Enter Directory",
                    cmd: `cd ${repoUrl.split('/').pop()}`,
                    desc: "Move into the project folder."
                },
                {
                    label: "Install Dependencies",
                    cmd: `${packageManager} install`,
                    desc: "Install all required libraries."
                },
                {
                    label: "Start Dev Server",
                    cmd: `${packageManager} run dev`,
                    desc: "Start the project locally to see it running."
                }
            ]
        },
        workflow: {
            title: "2. Development Workflow",
            steps: [
                {
                    label: "Create Branch",
                    cmd: `git checkout -b ${branchName}`,
                    desc: "Isolate your changes. Never work incorrectly on main."
                },
                {
                    label: "Make Changes",
                    desc: "Fix the bug in your editor. Save files."
                },
                {
                    label: "Verify Changes",
                    cmd: `${packageManager} run test`,
                    desc: "Run tests to ensure you haven't broken anything."
                },
                {
                    label: "Commit",
                    cmd: `git commit -am "${commitMessage}"`,
                    desc: "Save changes with a standard conventional commit message."
                },
                {
                    label: "Push",
                    cmd: `git push origin ${branchName}`,
                    desc: "Upload your branch to your fork."
                },
                {
                    label: "Create PR",
                    desc: "Go to GitHub and click 'Compare & Pull Request'."
                }
            ]
        },
        prDetails: {
            title: "3. Ready to Ship",
            branchName,
            commitMessage,
            prTemplate: `## Summary
I have fixed issue #${issue.number || '000'} by [briefly describe what you did].

## details
- [ ] Tested locally
- [ ] Followed style guidelines

## Related Issue
Fixes #${issue.number || '000'}`
        },
        guidance: {
            title: "Troubleshooting & Tips",
            troubleshooting: [
                { problem: "Port 3000 Busy?", solution: "npx kill-port 3000" },
                { problem: "Weird Errors?", solution: "rm -rf node_modules package-lock.json && npm install" },
                { problem: "Lint Failed?", solution: "npm run lint -- --fix" }
            ],
            whyItMatters: "Standard workflows help maintainers review code faster. Conventions keep history clean.",
            tips: [
                "Keep PRs small and focused.",
                "Be polite in comments.",
                "Ask questions if stuck!"
            ],
            ciChecks: [
                { name: "Lint", command: "npm run lint", fix: "Fix stylistic errors automatically." },
                { name: "Build", command: "npm run build", fix: "Ensure the project compiles without error." }
            ]
        }
    };

    // Dynamic Compare Link Enhancement
    return data;
};
