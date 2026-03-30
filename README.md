<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

<h1 align="center">Synapse</h1>
<p align="center"><strong>Study Smarter with AI Power</strong></p>

<p align="center">
  <a href="https://github.com/adityaacharya7/synapse/stargazers"><img src="https://img.shields.io/github/stars/adityaacharya7/synapse?style=for-the-badge&color=6C63FF" alt="Stars" /></a>
  <a href="https://github.com/adityaacharya7/synapse/network/members"><img src="https://img.shields.io/github/forks/adityaacharya7/synapse?style=for-the-badge&color=A78BFA" alt="Forks" /></a>
  <a href="https://github.com/adityaacharya7/synapse/issues"><img src="https://img.shields.io/github/issues/adityaacharya7/synapse?style=for-the-badge&color=F472B6" alt="Issues" /></a>
  <a href="https://github.com/adityaacharya7/synapse/blob/main/LICENSE"><img src="https://img.shields.io/github/license/adityaacharya7/synapse?style=for-the-badge&color=34D399" alt="License" /></a>
</p>

---

Synapse is an intelligent, AI-driven study platform designed to eliminate the struggles of modern learning. It seamlessly generates quizzes, summarizes complex notes, tracks your academic performance, and builds personalized study plans — all powered by the **Google Gemini AI**.

---

## 📑 Table of Contents

- [✨ Features](#-features)
- [🚀 Tech Stack](#-tech-stack)
- [📂 Project Structure](#-project-structure)
- [💻 Getting Started](#-getting-started)
- [⚙️ Environment Variables](#%EF%B8%8F-environment-variables)
- [🤝 Contributing](#-contributing)
- [📜 License](#-license)

---

## ✨ Features

| Feature | Description |
|---|---|
| **📝 AI Quiz Maker** | Generate interactive quizzes instantly from your notes via advanced AI analysis. |
| **📒 Notes Summarizer** | Paste your notes and let Synapse extract the key concepts, definitions, and high-yield summaries you actually need. |
| **📅 Exam Prep Planner** | Stop cramming. Synapse intelligently creates personalized and adaptive study schedules to keep you on track. |
| **📊 Performance Analyzer** | Track your scores across subjects, visualize strengths and weaknesses, and get AI-powered improvement plans. |
| **🎙️ Transcript Generator** | Convert lecture content into structured transcripts with key concepts, summaries, and action items. |
| **💬 AI Study Advisor** | Chat with an AI study buddy that understands your academic context and provides tailored guidance. |
| **📄 Resume Builder** | Build ATS-friendly resumes with real-time AI scoring and bullet-point improvement suggestions. |
| **🗺️ Career Roadmap** | Get a personalized learning roadmap based on your target role, current skills, and experience level. |
| **💼 Internship Portal** | Discover relevant internships and co-ops matched to your profile, skills, and graduation year. |
| **🎤 Interview Prep** | Practice mock interviews with AI-generated questions tailored to your target role and difficulty level. |
| **🎓 Student Dashboard** | Stay organized with built-in tools — GPA Calculator, Timetable Builder (with Image-to-Schedule AI), Pomodoro Timer, and Study Streak tracking. |

---

## 🚀 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Framer Motion, Three.js |
| **Backend / Auth** | Firebase (Authentication, Firestore Database) |
| **AI Integration** | Google Gemini API (`@google/genai`) |
| **Data Visualization** | Recharts, Lucide React |
| **Routing** | React Router DOM v7 |
| **Markdown** | react-markdown |

---

## 📂 Project Structure

```
synapse/
├── index.html              # HTML entry point
├── index.tsx               # React app bootstrap
├── index.css               # Global styles (Tailwind)
├── App.tsx                 # Main app with routing & sidebar
├── types.ts                # Shared TypeScript interfaces
├── vite.config.ts          # Vite configuration
├── package.json            # Dependencies & scripts
├── vercel.json             # Vercel deployment config
├── .env.local              # Environment variables (not committed)
│
├── pages/                  # All page-level components
│   ├── Landing.tsx
│   ├── Login.tsx
│   ├── ProfileSetup.tsx
│   ├── StudentDashboard.tsx
│   ├── QuizMaker.tsx
│   ├── NotesManager.tsx
│   ├── PrepPlanner.tsx
│   ├── PerformanceAnalyzer.tsx
│   ├── TranscriptGenerator.tsx
│   ├── AdvisorChat.tsx
│   ├── ResumeBuilder.tsx
│   ├── Roadmap.tsx
│   ├── InternshipPortal.tsx
│   ├── InterviewPrep.tsx
│   ├── GPACalculator.tsx
│   ├── PomodoroTimer.tsx
│   ├── Timetable.tsx
│   └── AdminPanel.tsx
│
└── src/
    ├── components/         # Reusable UI components
    ├── config/             # App configuration (admin emails, etc.)
    └── services/           # Backend services
        ├── firebase.ts         # Firebase init & auth helpers
        ├── geminiService.ts    # Gemini AI API integration
        ├── jobService.ts       # Internship data service
        └── adminService.ts     # Admin functionality
```

---

## 💻 Getting Started

Follow these instructions to get Synapse running locally on your machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Git](https://git-scm.com/)
- A **Google Gemini API Key** — [Get one here](https://aistudio.google.com/app/apikey)

### Installation

**1. Clone the repository:**

```bash
git clone https://github.com/adityaacharya7/synapse.git
```

**2. Navigate into the project directory:**

```bash
cd synapse
```

**3. Install dependencies:**

```bash
npm install
```

**4. Set up environment variables:**

Create a `.env.local` file in the root of the project (see the [Environment Variables](#%EF%B8%8F-environment-variables) section below for details):

```bash
# On Linux / macOS
touch .env.local

# On Windows (PowerShell)
New-Item .env.local
```

Add your API key to the file:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

**5. Start the development server:**

```bash
npm run dev
```

**6. Open your browser:**

Navigate to the localhost link provided by Vite (typically [http://localhost:5173](http://localhost:5173)) to view the application.

---

## ⚙️ Environment Variables

Synapse requires certain environment variables to function. Create a `.env.local` file in the project root with the following:

| Variable | Required | Description |
|---|---|---|
| `VITE_GEMINI_API_KEY` | ✅ Yes | Your Google Gemini API key (used by the frontend via Vite) |
| `GEMINI_API_KEY` | ✅ Yes | Your Google Gemini API key (used by services) |

> **Note:** The `.env.local` file is listed in `.gitignore` and will **not** be committed to the repository. Never share your API keys publicly.

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**!

### Step 1 — Fork & Clone

1. **Fork** this repository by clicking the **Fork** button at the top-right of the repo page.

2. **Clone** your forked copy to your local machine:
   ```bash
   git clone https://github.com/<your-username>/synapse.git
   cd synapse
   ```

3. **Add the upstream remote** (the original repo) so you can stay in sync:
   ```bash
   git remote add upstream https://github.com/adityaacharya7/synapse.git
   ```

### Step 2 — Create a Branch

Always create a new branch for your work. **Never commit directly to `main`.**

```bash
# Make sure you're on the main branch
git checkout main

# Pull the latest changes from the original repo
git pull upstream main

# Create and switch to a new feature branch
git checkout -b feature/your-feature-name
```

**Branch naming conventions:**

| Type | Example |
|---|---|
| New feature | `feature/quiz-timer` |
| Bug fix | `fix/login-redirect` |
| UI/UX improvement | `ui/sidebar-redesign` |
| Documentation | `docs/update-readme` |

### Step 3 — Make Your Changes

Make your code changes, then verify everything works:

```bash
# Start the dev server and test your changes
npm run dev

# (Optional) Build to check for any compilation errors
npm run build
```

### Step 4 — Stage, Commit & Push

```bash
# Check which files have been changed
git status

# Stage all your changes
git add .

# Or stage specific files only
git add pages/MyNewPage.tsx src/services/myService.ts

# Commit with a descriptive message
git commit -m "feat: add quiz timer functionality"

# Push your branch to your fork
git push origin feature/your-feature-name
```

**Commit message guidelines:**

| Prefix | Usage |
|---|---|
| `feat:` | A new feature |
| `fix:` | A bug fix |
| `docs:` | Documentation changes |
| `style:` | Formatting, styling (no logic change) |
| `refactor:` | Code restructure (no feature change) |
| `chore:` | Maintenance tasks |

### Step 5 — Open a Pull Request

1. Go to your forked repo on GitHub.
2. Click **"Compare & pull request"**.
3. Fill in a clear title and description of your changes.
4. Submit the Pull Request for review!

### Keeping Your Fork Up to Date

Before starting new work, always sync your fork with the latest changes:

```bash
# Switch to your main branch
git checkout main

# Fetch and merge changes from the original repo
git pull upstream main

# Push the updated main to your fork
git push origin main
```

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <strong>Built with ❤️ by <a href="https://github.com/adityaacharya7">Aditya Acharya</a></strong>
  <br />
  <sub>If you found this helpful, consider giving the repo a ⭐!</sub>
</div>
