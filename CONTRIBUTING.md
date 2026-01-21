# Contributing to OnboardHub

Welcome! We love contributions from the community. Here’s how you can help.

## 🛠 Tech Stack
- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: React Context / Hooks

## 🚀 Getting Started

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/OnboardHub.git
   cd OnboardHub
   ```

2. **Setup Environment**
   ```bash
   nvm install --lts && nvm use --lts
   npm install
   ```

3. **Run Locally**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## 📝 Workflow

1. **Create a Branch**
   Use `kebab-case` with the issue number:
   ```bash
   git checkout -b fix/issue-123-description
   ```

2. **Commit Conventions**
   We follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `fix: ...` for bugs
   - `feat: ...` for new features
   - `docs: ...` for documentation

3. **Verify**
   Before pushing, run:
   ```bash
   npm run lint
   npm run build
   ```

## 📬 Pull Request
- Use the provided PR template.
- Link the issue you fixed.
- Attach screenshots for UI changes.
