# Science Teaching Tools — Form Creator + Feedback Lab

Two linked teacher tools for Singapore primary science (P3–P6), built on the
Science Claw design system. Part of the **Worksheet → Game → National Question
Bank** venture roadmap: this package covers the *Capture → Extract → Classify*
front of the pipeline (worksheet → structured questions → Google Form) and the
feedback loop on student responses.

## The two apps

- **`index.html` — Google Form Creator.** Upload a worksheet PDF/photo (+
  optional answer key); Claude vision transcribes every question, tags types,
  matches correct answers, and crops question figures. Edit, fill, and view
  responses; export a Google Apps Script that creates the real (quiz-scored)
  Google Form, a Word document, and a ZIP of question images named `MCQ5.jpg`,
  `SAQ7.jpg`, etc.
- **`feedback-lab/index.html` — Science Feedback Lab.** Import the question
  paper, answer key, and the Google Form responses (CSV/XLSX); Claude writes
  personalised, scores-free feedback per pupil, with printable Doc/Focus
  layouts, common-mistakes ranking, and Google Doc export.

The two apps link to each other from their headers (the animated rainbow
buttons). Both include the 40-minute eye-rest reminder.

## Deploying

Static site — no build step, no server.

1. Push this folder's **contents** to a GitHub repository.
2. In Vercel: **Add New → Project → import the repo**. Framework preset:
   **Other**. No build command, output directory = root. Deploy.
   (GitHub Pages works too: Settings → Pages → deploy from branch.)

## Claude API key

Outside the Claude Design app there is no built-in Claude, so both apps use
`feedback-lab/js/claude-bridge.js`: on first AI action the app asks for your
Anthropic API key and stores it **only in that browser's localStorage** —
never in the code or the repo. Get a key at https://console.anthropic.com.

## Roadmap notes (v1 → venture)

- Extraction already stores **structured questions you generated**, not scans —
  aligned with the pivot (concepts + your own questions, no copyright trap).
- Next pipeline stages (Generate original practice games → Play → Report →
  Bank) can build on the same extraction JSON these apps produce.
