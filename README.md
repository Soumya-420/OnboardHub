<div id="top"></div>

## 👇 Click to watch the OnboardHub Demo video

[![OnboardHub Demo](https://img.youtube.com/vi/Q6q_tNk5r50/maxresdefault.jpg)](https://youtu.be/Q6q_tNk5r50?si=CajtFIU0cP6dx-6_)

<div align="center">

# 🚀 OnboardHub

<p>
  <em>
    A guided contribution platform that turns confusing GitHub repositories into step-by-step contribution journeys.
  </em>
</p>

<p>
  <em>
    🧩 Built to help beginners go from confused to first open source Pull Request.
  </em>
</p>

</div>

---

## 🌐 Live & Explore

<p>
  <em>
    🚀 Try the app:  
    🔗 <a href="https://onboardhub-55861920-512be.web.app/"><b>Live OnboardHub Demo</b></a><br>
    📌 Devfolio Project:  
    🔗 <a href="https://devfolio.co/projects/onboardhub-5311"><b>OnboardHub on Devfolio</b></a>
  </em>
</p>

---

## 📖 Overview

<p>
  <em>
    <b>OnboardHub</b> is a beginner-first contribution assistant that converts a GitHub repository into a clear, actionable onboarding journey.
  </em>
</p>

<p>
  <em>
    Instead of leaving contributors to decipher documentation, manually pick issues, and setup environments, OnboardHub guides users step-by-step — from evaluating repositories to making their first Pull Request.
  </em>
</p>

<p>
  <em>
    OnboardHub bridges the gap between intention and action by combining repository analysis, issue categorization, setup automation, and guided PR workflows — all in one unified experience.
  </em>
</p>

---

## ✨ Core Features

<p><em>📘 <b>Repository Evaluation</b> — Get insight into how beginner-friendly a project is with a readiness score.</em></p>
<p><em>🔍 <b>Issue Skill Mapping</b> — Classifies issues into Beginner, Intermediate, and Pro levels.</em></p>
<p><em>🚀 <b>Suggested First Actions</b> — Know exactly where to start without guesswork.</em></p>
<p><em>⚙️ <b>Setup Support</b> — Auto-detect setup commands across tech stacks.</em></p>
<p><em>🛠️ <b>First PR Assistant</b> — Step-by-step guidance on branching, commits, and PR creation.</em></p>
<p><em>📊 <b>Progressive UI Flow</b> — Journey-based interface from evaluation to execution.</em></p>

---

## 📐 System Architecture

<p>
  <em>
    The architecture is designed around **analysis, guidance, and execution** with an emphasis on simplicity and reliability.
  </em>
</p>

- **Frontend** → React + TypeScript (interactive UI, state management)
- **Repository Analysis** → GitHub API (issue metadata, README parsing)
- **Difficulty Estimation** → Heuristics and signal-based scoring
- **Setup Detector** → File scanning for package managers and run commands
- **Guided Workflow Logic** → Suggestion engine for first actions & PR steps
- **Hosting** → Firebase Hosting / Static deployment

<p>
  <em>
    OnboardHub never automates contributions — it only provides contextual, safe guidance to help users learn while doing.
  </em>
</p>

---

## 🧰 Tech Stack

<p align="center"> 
    <img src="https://img.icons8.com/color/70/react-native.png" alt="React" /> 
    <img src="https://img.icons8.com/color/70/typescript.png" alt="TypeScript" /> 
    <img src="https://img.icons8.com/color/70/firebase.png" alt="Firebase" /> 
    <img src="https://img.icons8.com/color/70/github.png" alt="GitHub API" /> 
</p>

**Frontend**
- React (Component UI)
- TypeScript (Type safety)
- Vite (Development tooling)

**Services / APIs**
- GitHub REST API (Repository info, issues, labels)
- Firebase Hosting (Deployment)
- Client-side heuristic engine

---

## 🧠 Why OnboardHub Matters

### 🎯 Reduces Contribution Barriers
Beginners often give up due to setup frustration or confusion — OnboardHub gives them a path forward.

---

### 🔓 Encourages Learning Through Doing
Instead of auto-solving issues, contributors are guided on *how* to approach tasks.

---

### 💡 Provides Context-Aware Guidance
Analysis isn’t generic — it’s tailored to each repo’s structure and metadata.

---

## ⚠️ Challenges I Ran Into

### 1️⃣ No Reliable Issue Difficulty Labels
GitHub labels are inconsistent or missing.  
✅ Solved with a multi-signal rule-based difficulty estimator.

---

### 2️⃣ Determining Beginner-Friendly Repos
Star count doesn’t equal approachability.  
✅ Solved by crafting a composite **Beginner Readiness Score**.

---

### 3️⃣ Setup Commands Across Stacks
Different repos use different tools.  
✅ Built a detection system that infers tools from files and offers fallback suggestions.

---

### 4️⃣ Guidance Without Auto-Solving
The risk of reducing learning value loomed large.  
✅ Ensured guidance points contributors, not code.

---

### 5️⃣ Feature Depth vs UI Simplicity
Lots of features can clutter UX.  
✅ Adopted a journey-based progressive interface.

---

### 6️⃣ GitHub API Limits & Networking
Rate limits and delays impacted analysis strings.  
✅ Implemented batching and graceful state fallbacks.

---

## 🔍 Real-World Use Cases

### 🏁 First-Time OSS Contributions
Beginners can finally make *their first PR without fear*.

---

### 📁 Repository Evaluation Tool
Open source maintainers can assess how approachable their project is.

---

### 🛠 Educational Platform
Learners new to OSS get contextual guidance built into a tool — not a generic tutorial.

---

## 🔮 Future Scope

- AI-powered issue summaries
- Personalized experience based on contributor skill
- Browser extension integration
- Multi-repo onboarding journeys
- GitHub App integration

---

## ⭐ Support

<p>
  <em>
    If you find <b>OnboardHub</b> helpful or impactful,  
    please give this repository a ⭐ — it motivates and supports further development!
  </em>
</p>

---

<div align="center">
  <a href="#top">
    <img src="https://img.shields.io/badge/Back%20to%20Top-000000?style=for-the-badge&logo=github&logoColor=white" />
  </a>
</div>
