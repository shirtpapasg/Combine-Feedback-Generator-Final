# CLAUDE.md — Science Teaching Tools

Instructions for Claude (and any developer) working on this project. Two linked
apps for a Singapore primary science teacher (P3–P6), built on the Science Claw
design system (dark arcade, glassmorphic panels, neon accents, Nunito).

## The two apps

### 1. Google Form Creator (`Form Creator.dc.html` / package `index.html`)
Turns a worksheet into a Google Form.
- **Transcribe with Claude**: teacher uploads worksheet PDF/photo (+ optional
  answer key). Claude vision transcribes every question EXACTLY (text, units,
  symbols), tags the type (mc / checkbox / short / dropdown / scale), and marks
  correct answers from the key. Never invent questions or answers.
- **Edit / Fill / Responses** modes; images cropped per question exportable as a
  ZIP named `MCQ5.jpg`, `SAQ7.jpg`… inside a folder named after the worksheet.
- **Export**: Google Apps Script (`createForm()` — paste at script.google.com;
  quiz-scored when answers are marked) — because the app cannot reach Google
  Drive directly.

### 2. Science Feedback Lab (`uploads/Science feedback generator/`)
Turns Google Form responses into per-pupil feedback (never shows marks/scores).

**Data flow — the accuracy contract:**
1. **Responses CSV/XLSX = source of truth.** Read deterministically (no AI, no
   vision). One row = one student; column headers = question ids (`1`, `1(a)`…);
   blanks preserved. A column is MCQ when its answers look like options
   (answer shape is the primary signal — Google Form headers carry the full
   stem, so long headers are normal). No two columns may share an MCQ id.
2. **PDFs (paper + answer key) fill in stems, marking points, MCQ key** via
   Claude. AI extractions are loose by nature — every value that must MATCH
   something else goes through deterministic normalisation in code:
   - `normChoice` / `sameChoice` (app-core.js): "(2) The air trapped…" ⇔ "2" ⇔
     "B". ALL MCQ comparisons (feedback, Common Mistakes, exports) MUST use
     this — never raw string compare.
   - Never turn a results TABLE into per-cell questions; a table is ONE question.
   - SAQ defs must have a numeric-leading id and a real stem (`isRealQ`).
3. **Class list (image/PDF) = the roster denominator.** Images go through ONE
   Claude-vision pass straight to structured JSON (`classlistFromImage`) — read
   every row, no OCR round-trip. Class size ≠ submissions; report both.
4. **`reconcileMcq`** (app-ui.jsx) self-heals sessions where MCQ answers were
   misfiled under SAQ keys. Keep it: it runs at load and on Apply.
5. **Every question must have a visible status** for the pupil: Incorrect MCQ
   list + Correct MCQ list + MCQ-not-answered list; every SAQ appears with stem,
   the pupil's transcribed answer, scientific error, question to ponder, and a
   ruled Correction space. No MCQ correct answers shown — pupils derive them
   from the feedback (learning by correction).

**Files:** `Science Feedback Lab.html` (styles + script includes; `index.html`
is a copy — keep in sync), `js/app-ui.jsx` (React UI: App, Setup, Mistakes,
Settings, snippets), `js/app-core.js` (scoring, generation, Word/Apps Script
exports), `js/import.js` (CSV/XLSX/PDF parsing, Claude extraction, page
screenshots), `js/layouts.jsx` (Doc + Focus layouts; Doc is click-to-edit),
`js/claude-bridge.js` (API-key bridge for GitHub Pages/Vercel deploys),
`js/eye-rest.js` (40-min eye-break reminder, interval tweakable).

**Persistence:** session in localStorage `sfl-session-v2` (questions, key,
students, results, worksheet page images); tweaks in `sfl-tweaks-v1`
(eyeMinutes, mistakeThreshold, showSnippets). Never clear these.

## Deployment
`form-creator-package/` is the deployable bundle (Form Creator at root,
Feedback Lab in `feedback-lab/`). After ANY edit to the Lab's source, copy the
changed files into `uploads/Science feedback generator/index.html`,
`…/repo-package/`, and `form-creator-package/feedback-lab/` — three sync
targets. GitHub Pages needs a `.nojekyll` file (the `_ds` folder starts with an
underscore). Outside Claude Design, `claude-bridge.js` prompts for an Anthropic
API key (stored only in the browser's localStorage).

## Hard rules learned in this project
- AI for reading, CODE for matching. Any exact-match value (MCQ letters,
  question ids, register numbers) must be normalised deterministically.
- Feedback shows NO marks and NO MCQ answers.
- Individual feedback, Common Mistakes, and exports must share one scoring
  path so they can never disagree.
- Word export: one page per student (`page-break-before: always`), teacher's
  manual edits included.
- Roster (class list) is the denominator; submissions counted separately.
- Design system is binding: Science Claw tokens/components only, emoji
  iconography, no hand-drawn SVG icons.

## Roadmap context
Part of a larger pipeline: Capture worksheet → Extract/Classify (Form Creator)
→ Students respond (Google Form) → Feedback (Feedback Lab) → future stages:
generate original practice games → play → report → question bank.
