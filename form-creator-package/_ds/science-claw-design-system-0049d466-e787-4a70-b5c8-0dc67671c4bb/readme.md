# Science Claw — Design System

A dark-arcade design system for **Science Claw**, an educational claw-machine game
that teaches Singapore primary-school science (P3–P6). Students answer science
questions to earn credits, spend credits to play a 3D claw machine, and grab
prizes to build a "science collection" (Battery, Atom, Plant, Magnet, Crystal).

The look: a near-black navy cabinet world with **glassmorphic HUD panels** floating
over a 3D scene, each gameplay stat owning its own **neon accent hue**. Friendly,
rounded, kid-readable — an arcade cabinet that happens to teach science.

## Sources
- **Codebase:** `Science-Claw-New--main/` (vanilla JS + three.js r128). Files:
  `index.html`, `game.js` (3D machine + claw), `quiz.js`, `questions.js`
  (P3–P6 question bank), `backend.js` (player state, localStorage), `analytics.js`
  (achievements, dashboard), `ui.js`, `admin.js`, `style.css`.
- **Target visual:** `assets/reference-prototype.png` — the polished arcade look
  the user wants the final game to match. This system formalizes that screenshot
  (the codebase is the source of truth for structure & content; the screenshot is
  the source of truth for visual polish).

---

## Content Fundamentals
**Voice:** encouraging, playful, kid-facing — second person, short imperatives.
- Casing: **Title Case** on panel headers shown as ALL-CAPS via CSS (`Controls`,
  `View`, `Science Collection`, `How to Play`). Body is sentence case.
- Tone examples (verbatim from the game): "Build your science collection!",
  "Earn credits by answering science questions", "Correct! +3 credits",
  "🏆 Scientist Collection Completed! Mr Soh is IMPRESSED! +50 Credits Bonus".
- Numbers lead: stats are terse `Label: value` pairs ("Credits: 12", "Accuracy: 100%").
- Rewards are explicit and positive ("+3", "+10", "+50 Credits Bonus"). Misses are
  softened ("So close!", "Not quite — try again next time"), never punishing.
- Science questions are MCQ, one topic tag each (Heat, Magnets, Forces, Cells,
  Electricity…), four options, one correct.
- Emoji are part of the voice (see Iconography) — used as item glyphs and for
  celebration (🏆 🎉), sparingly, never decoratively in body copy.

---

## Visual Foundations
**Background / world.** Very dark navy-to-black. App `#070d15`, 3D scene `#08131f`,
deepest `#04070c`. The play area uses a radial glow (cyan neon light from the
cabinet) fading to black at the edges. No flat fills — always a subtle vignette.

**Panels (the signature motif).** Translucent dark glass: `rgba(7,13,21,.82)` +
`backdrop-filter: blur(6px)`, a 2px **accent-colored** border + matching neon glow,
20px radius, soft drop shadow plus a 1px inner top highlight. Each titled panel
carries a **filled accent header bar** (pill-shaped, accent fill, dark ink) so every
panel reads in its own color — bright and legible for ages 10–13. Modals use an
opaque near-black fill (`#0a1320`) so they read over a busy scene.

**Sound.** The game is audibly alive — every meaningful action has an arcade SFX,
synthesized at runtime with the Web Audio API (no audio files, works offline). See
`ui_kits/game/sound.js`: `click`, `select`, `move`, `drop`, `grab`, `miss`,
`coin`, `correct`, `wrong`, `win`, `enter`. Cues are short and major-key for wins
(rising arpeggios), soft and low for misses (never harsh). A mute toggle (🔊/🔇)
sits in the HUD. Always gate audio behind a user gesture (the AudioContext unlocks
on first interaction).

**Color = meaning.** One hue per concept, used as neon accents on the dark field:
- Yellow `#ffb627` — panel headers, player name, gold/credits-source.
- Green `#3fc35f` — credits, collection, success, the primary action button.
- Blue `#4a90e2` — accuracy, the active/selected state (view switcher).
- Purple `#b557e6` — prizes.
- Red `#e8493f` — danger, a missed grab, the cabinet joystick button.
- Cyan `#66ccff` — info highlights, the Atom item.
Item identity colors (also the 3D mesh colors): Battery `#ffd400`, Atom `#66ccff`,
Plant `#58e066`, Magnet `#ff5a5a`, Crystal `#f06fff`.

**Type.** Display/headers and big numbers in **Nunito** (rounded, friendly, 700–900
weights) — substituted via Google Fonts (see Caveats). Body in the system sans
stack. Headers are uppercased with `0.06em` tracking. Minimum overlay text 14–15px;
HUD body 16px. Numerals are heavy (800–900) and tinted by their stat hue.

**Spacing & shape.** 8px rhythm. Panel padding 20px (15px compact, 30px modal).
Radii: 8 / 12 (buttons) / 20 (panels, modals) / pill / round. Touch targets ≥44px.

**Buttons.** Filled, rounded (12px), bold display font. Primary = green vertical
gradient with a green glow; neutral = flat gray `#2b3340` with a hairline; active =
blue fill with a 2px bright-blue ring and blue glow; danger = red with red glow.
2px bottom shadow gives a slight "key" feel.

**Borders, shadows, glow.** Hairline white-alpha borders separate glass from scene.
Selected/active elements and primary actions carry a **neon glow** (a colored
`box-shadow` matching their hue). Bright numerals may carry a subtle text-glow.

**Motion.** Snappy and arcade-y. Controls transition `120ms` ease-out; the claw
slides `150ms`; progress fills `280ms`; an `ease-pop` (overshoot) bounce is reserved
for celebratory pops (grab success, achievement). Avoid long or looping decorative
animation.

**Imagery / texture.** No photography. The "imagery" is the 3D claw machine itself
(three.js) — glossy plastic prizes in saturated item colors on a black felt bed,
behind blue-tinted glass. Cool, neon-lit, high-contrast. Flat 2D surfaces stay dark
and matte so the glowing accents and the 3D scene pop.

---

## Iconography
The game's icon language is **emoji**, used deliberately and sparingly:
- Science items: 🔋 Battery · ⚛️ Atom · 🌱 Plant · 🧲 Magnet · 💎 Crystal
- Status / celebration: 🏆 (achievement), 🎉 (grab success), ✅ / ⬜ (collection
  checkbox in the original; this system upgrades the checkbox to a styled green
  tick — see `CollectionItem`).
- The brand mark uses 🦾 (mechanical claw) as a placeholder glyph.

There is **no icon font, sprite sheet, or SVG icon set** in the codebase, and no
raster icon assets (the referenced `favicon.png` is absent). Unicode arrows
(← → ↑ ↓) label the movement controls. If a richer icon set is later needed, add
**Lucide** (matches the clean, rounded feel) via CDN and document it here — but the
native game leans on emoji + Unicode by design. Do **not** hand-draw SVG icons.

---

## Index / Manifest
**Root**
- `styles.css` — global entry point (consumers link this; `@import`s only).
- `tokens/` — `colors.css`, `typography.css`, `spacing.css`, `effects.css`.
- `readme.md` — this guide. `SKILL.md` — Agent-Skills wrapper.
- `assets/reference-prototype.png` — target visual.

**Components** (`components/core/`, namespace `window.ScienceClawDesignSystem_0049d4`)
`Panel`, `Button`, `StatRow`, `SegmentedControl`, `CollectionItem`, `ProgressBar`,
`Badge`, `QuizOption`. Each has `.jsx` + `.d.ts` + `.prompt.md`; the directory card
is `core.card.html`.

**UI Kits**
- `ui_kits/game/` — interactive Game HUD (login → play → earn credits). See its README.

**Foundation cards** (Design System tab) live in `guidelines/` — Colors (Surfaces,
Neon Accents, Science Items), Type (Display, Body & Scale), Spacing (Scale,
Radii & Glow), Brand (Wordmark & Glass Panel).

---

## Caveats
- **Font substitution:** the original game uses **Arial**. This system upgrades
  display/headers to **Nunito** (friendly rounded, better for a kids' arcade) loaded
  from Google Fonts CDN. If you want to stay literal to Arial, or ship a licensed
  webfont, swap `--font-display` in `tokens/typography.css` and replace the
  `@import`. Body text already falls back to the system sans stack.
- **3D scene:** the claw machine is rendered with three.js in the real game. The UI
  kit uses a CSS stand-in (`ClawScene.jsx`) purely to preview the HUD.
