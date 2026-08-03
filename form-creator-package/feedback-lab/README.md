# Science Feedback Generator

A teacher-facing tool that turns Google Form science submissions into personalised,
scores-free feedback for Singapore Primary students (P3–P6). Built on the
**Science Claw** design system and wired to Claude for reading answers and writing
guided feedback.

> **Privacy:** students are identified by **Surname + Register number** only — never full names.

---

## What it does

1. **Import** a question paper PDF, an answer-key PDF, and the Google Form responses
   (CSV / XLSX) in the Setup panel. Optionally add a **class list** (paste
   `Surname | Register`, or upload a PDF/image) to set the official roster.
2. **Claude reads each student's typed answer** against the answer key and writes
   feedback — **no scores, ticks or crosses**, only guidance:
   - Question Stem · Your answer · Scientific Error · Question to Ponder (CECL) · a
     blank Correction box.
   - MCQs get feedback only when wrong.
3. **Review layouts** — *Doc* (printable feedback letter) or *Focus* (one question
   at a time). Plus **Common Mistakes** (ranked by how many pupils missed each
   question) and a **Missing Submissions** panel (roster vs. who submitted).
4. **Export to Google Docs** via a generated Apps Script.

Answers come straight from the Google Sheet as text — no OCR on answers, so
transcription is exact. OCR is only used to read a class-list *image*.

---

## Running it

This is a static, self-contained web app — no build step, no server.

```
# just open the file in a browser
Science Feedback Lab.html
```

Or serve the folder with any static server:

```
npx serve .
```

> **Note:** AI feedback works anywhere. Inside the Claude design app it uses the
> built-in `window.claude`. On GitHub Pages / Vercel / any static host,
> `js/claude-bridge.js` asks each user for an Anthropic API key on first use
> (get one at console.anthropic.com) and stores it only in that browser.

---

## Project structure

```
index.html                    # app shell + all styling
js/
  claude-bridge.js            # makes AI work on static hosts (API-key dialog)
  app-core.js                 # serialize/parse, feedback generation, Apps Script export
  app-ui.jsx                  # React UI (roster, setup, layouts host, panels)
  layouts.jsx                 # Doc + Focus feedback layouts
  import.js                   # CSV/XLSX/PDF/image parsing, roster matching, Claude calls
  prompt.js                   # the feedback prompt (teacher's exact spec)
  sample-data.js              # seeded P6 Forces demo data
reference/
  syllabus-scope.js           # condensed Singapore P3–P6 science syllabus scope
_ds/                          # Science Claw design system bundle + tokens
```

---

## Tech

- React 18 + Babel standalone (inline JSX, no bundler)
- SheetJS (XLSX), pdf-parse (PDF text), Tesseract.js (class-list image OCR) — all via CDN
- Science Claw design system (dark-arcade glassmorphic UI)
