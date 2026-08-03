# Science Teaching Tools — skeleton

Apps only: no worksheet PDFs or Word files. Deploys in seconds.

## What is here
- `Worksheet Compiler.dc.html` · `Form Creator.dc.html` · `support.js`
- `_ds/` — Science Claw design system
- `worksheets/manifest.json` — the library index (file names, topics, levels, answer-key links)
- `worksheets/answer-keys.json` — every transcribed answer key (permanent, shared by all apps)
- `.nojekyll` — required by GitHub Pages so the `_ds` folder is served

## Adding the papers back
Copy your PDFs / Word files into `worksheets/`. Names must match `manifest.json`
exactly. The apps fetch `worksheets/<filename>` at runtime.

Alternatively drop them in through the Compiler's Upload screen (a whole ZIP works)
— they are stored in the browser and never need committing.

## Deploying
Push this folder to GitHub, then enable Pages, or point Vercel at it. No build step.
