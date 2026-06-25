# DiffStudio — Lesson Differentiation Studio

> A polished AI-powered tool for K-12 math teachers to instantly generate differentiated lesson materials, scaffold student support, and analyze formative responses — built as a portfolio demo for Coteach.

## What it does

DiffStudio puts the power of AI differentiation into a calm, teacher-friendly interface. A teacher selects their grade level and math topic, describes what their students are struggling with, and chooses a differentiation mode — then hits Generate. Claude streams back a structured, immediately usable artifact: scaffolding supports, small group mini-lessons, practice problem sets, exit tickets, or lesson internalization guides. A second tab analyzes up to five student responses to a problem and produces a targeted mini-lesson addressing the specific misconception pattern.

The app stores a session history of up to 20 artifacts with search, filter by mode, tagging, and pinning. A Prompt Library of 20 real classroom prompts (drawn from Illustrative Mathematics teacher use cases) can auto-fill the context field. A Teacher Profile captures class size, ELL %, IEP %, and scaffolding style to personalize every generation. Artifacts can be copied to clipboard, downloaded as `.txt`, or opened directly in Google Docs.

## Tech stack

- **React 18** with Vite
- **Tailwind CSS** via CDN (no build step for styles)
- **Google Fonts** — DM Sans (headings), Inter (UI), JetBrains Mono (prompt examples)
- **Anthropic API** — `claude-haiku-4-5-20251001` (demo) / `claude-sonnet-4-6` (user key), streamed via manual SSE parsing
- **Vercel Edge Function** (`api/chat.js`) — secure server-side proxy; API key never exposed in the browser bundle

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The Settings modal opens automatically — paste your Anthropic API key to begin. (The proxy only works on Vercel; locally the app uses your key directly.)

## Deploy to Vercel

1. Push this repo to GitHub
2. Import into [vercel.com](https://vercel.com) — framework preset: **Vite**
3. In Vercel's **Environment Variables** settings, add **both**:
   ```
   ANTHROPIC_API_KEY=sk-ant-...   ← server-side only, never in the bundle
   VITE_USE_PROXY=true            ← tells the frontend to route through /api/chat
   ```
4. Redeploy — visitors use the app immediately with no key setup

The proxy (`api/chat.js`) uses **Claude Haiku** for demo visitors (~$0.0004/generation). Visitors who add their own key in Settings bypass the proxy and get **Claude Sonnet**. Set a monthly spend cap in the Anthropic console — $5–10/month covers typical portfolio traffic.

## File structure

```
index.html                    ← Google Fonts, Tailwind CDN, global CSS + animations
src/
  main.jsx
  App.jsx                     ← Root state, useStream + useHistory hooks, layout
  components/
    Nav.jsx                   ← Fixed top nav, tab switcher, settings + profile icons
    SettingsModal.jsx         ← API key input with masked display
    TeacherProfile.jsx        ← Slide-in right drawer, classroom profile form
    InputPanel.jsx            ← Grade selector, topic, context, mode selector, generate
    GradeSelector.jsx         ← K–8 pill buttons (aria-pressed)
    ModeSelector.jsx          ← 5 mode cards, role=listbox
    PromptLibrary.jsx         ← Slide-in panel, 20 prompts with category filters
    ArtifactPanel.jsx         ← EmptyState or ArtifactCard
    ArtifactCard.jsx          ← Streaming output, growing amber border animation, export
    MarkdownRenderer.jsx      ← Typed content renderer (bullets, numbered, bold)
    Sidebar.jsx               ← History list, search, mode filters, pin/tag/delete
    HistoryItem.jsx           ← Individual history entry with options menu
    StudentAnalyzer.jsx       ← Response Analyzer tab
    EmptyState.jsx            ← Right panel placeholder with step indicators
    Toast.jsx                 ← Fixed bottom-right notifications, slide-in/out
  data/
    modes.js                  ← 5 differentiation mode definitions
    promptLibrary.js          ← 20 real classroom prompts with categories
  hooks/
    useStream.js              ← Anthropic SSE streaming hook
    useHistory.js             ← Session history: search, pin, tag, max-20 cap
  utils/
    markdownParser.js         ← Parses ## sections into typed content lines
    exportUtils.js            ← copyToClipboard, exportAsTxt, openInGoogleDocs
```

## Screenshots

<!-- Add screenshots after running with a real API key -->
<!-- Suggested:
  1. Full 3-column layout with artifact streaming in (amber border animation mid-grow)
  2. Prompt Library panel open, "ELL Support" filter active
  3. Teacher Profile drawer, sliders filled
  4. Response Analyzer tab with analysis output
  5. 375px mobile layout
-->

## Notes

- Requires an [Anthropic API key](https://console.anthropic.com/) with access to `claude-sonnet-4-6`
- Session history is in-memory — clears on page refresh by design
- No data ever leaves the browser except in streamed API requests
