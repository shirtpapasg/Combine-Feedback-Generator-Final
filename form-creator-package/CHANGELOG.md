# What's New — Science Teaching Tools

_31 July 2026_

## Form Creator

- **Google Form settings applied automatically** — every exported script now
  sets up the form the way you want it: a **Short Name** paragraph question at
  the top, multiple attempts allowed, answer editing on, and the progress bar
  showing. Verified-user and email-collection settings apply when your Google
  account supports them and are skipped safely when it doesn't — so the script
  can never fail halfway and leave you an empty form.
- **Written-answer feedback now reaches pupils** — model answers from the answer
  key are attached to each SAQ as real Google Form feedback ("Suggested
  answer: …"), shown after submitting. Previously they were only a hidden note
  in the script and never appeared in the form.
- **Form title follows the worksheet you just uploaded** — the heading read from
  the current PDF wins, so an old topic (e.g. "Matter") no longer sticks to a new
  form. You can still type over it.
- **Generous crops, easier trimming** — auto-crops now include more of the page
  around each question, so nothing gets cut off; trim it down yourself with the
  crop tools.
- **Focus music** — a 🌧 / 🎧 ambience button in the header. Lo-fi mode plays a
  mellow original study beat (jazzy chords, soft bass, gentle kick and hats).
  Rain and vinyl crackle removed on request; levels rebalanced so there's no
  crackling or distortion.
- **Layout fixed on iPad and narrow screens** — the sidebar can no longer be
  overlapped by the header at any window width.

## Before your next export

- Re-export the Apps Script and run `createForm` again to pick up the new form
  settings and the SAQ answer feedback.
- After running it, switch on **Settings → Responses → Send responders a copy →
  Always** in the form — Google doesn't allow scripts to set that one.

---

_28 July 2026_

## Form Creator

- **Question numbers match your worksheet** — `1.`–`8.` for MCQ, `1(a)`,
  `2(bii)`, `3(c)` for written answers. Response columns come back correctly
  labelled, so the Feedback Generator needs no manual fixing.
- **MCQ answers marked correctly** — options are written as `(1)…(4)` and the
  answer key is matched by number, so long options (e.g. "P: butterfly, Q: frog")
  now score properly.
- **Duplicate questions caught** — warning plus one-click **Remove duplicate
  questions**; re-transcribing asks replace-or-keep instead of doubling.
- **Transcription survives hiccups** — pages retry automatically; an unreadable
  page is skipped and named, the rest is kept.
- **Full image editing** — crop from all four sides, rotate, adjust contrast, or
  upload your own picture. Images embed into the Google Form automatically.
- **Clearer workspace** — sticky sidebar with question navigator and live counts,
  collapsible colour-coded question rows, calmer panels.
- **New ☀️/🌙 daylight theme** — remembered between sessions.

## Both apps

- Eye-rest reminder after 40 minutes, with a timer in the header.
- One-click switching between Form Creator and Feedback Generator.
