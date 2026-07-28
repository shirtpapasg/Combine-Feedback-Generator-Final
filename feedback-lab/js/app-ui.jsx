/* Science Feedback Lab — React UI shell. */
(function () {
  const e = React.createElement;
  const { useState, useRef, useEffect } = React;
  // ---- session persistence: keeps imported questions / answer key / class list /
  // responses + generated feedback across reloads (extracted data, not raw PDFs). ----
  const SFL_SAVE_KEY = "sfl-session-v2";
  const SFL_TWEAKS_KEY = "sfl-tweaks-v1";
  function loadSession() { try { return JSON.parse(localStorage.getItem(SFL_SAVE_KEY)); } catch (e) { return null; } }
  function loadTweaks() { try { return Object.assign({ eyeMinutes: 40, mistakeThreshold: 0, showSnippets: true }, JSON.parse(localStorage.getItem(SFL_TWEAKS_KEY)) || {}); } catch (e) { return { eyeMinutes: 40, mistakeThreshold: 0, showSnippets: true }; } }
  const DS = window.ScienceClawDesignSystem_0049d4;
  const { Panel, Button, SegmentedControl, Badge } = DS;
  const A = window.FeedbackApp;
  const key = (s) => s.name + "|" + s.className;

  // Repair sessions where MCQ answers were misfiled as "open" answers under bare-numeric
  // keys (an earlier import misclassified those columns). Moves them back into the MCQ map
  // and drops the bare-numeric pseudo-SAQ defs, so pupils never see "not answered" for
  // questions they answered.
  function reconcileMcq(studentsArr, mcqKeyObj, defsArr) {
    const mcqIds = new Set(Object.keys(mcqKeyObj || {}));
    const isBareMcq = (id) => /^\d+$/.test(String(id)) && mcqIds.has(String(id));
    const students2 = (studentsArr || []).map(s => {
      const openKeys = Object.keys(s.open || {});
      if (!openKeys.some(isBareMcq)) return s;
      const mcq = Object.assign({}, s.mcq), open = {};
      openKeys.forEach(k => {
        const v = String(s.open[k] == null ? "" : s.open[k]).trim();
        if (isBareMcq(k)) { if (v && !(mcq[k] || "").trim()) mcq[k] = v; return; }
        open[k] = s.open[k];
      });
      return Object.assign({}, s, { mcq, open });
    });
    const defs2 = (defsArr || []).filter(d => !isBareMcq(d.id));
    return { students: students2, defs: defs2 };
  }

  // baked feedback for the first sample student so layouts render on load
  const SAMPLE_FB = {
    name: "Kumar", className: "03",
    mcq: [{ q: "19", error: "It looks like the wrong force effect was chosen here.", hint: "Take another look — which force acts to slow down or stop a moving object?" }],
    open: [
      { q: "1(a)", type: "short", stem: "Name the force that pulls the apple towards the ground.", studentAnswer: "Gravitational force", status: "correct", praise: "Spot on — you correctly named the gravitational force." },
      { q: "1(b)", type: "explain", stem: "The same apple weighs less on the Moon than on Earth. Explain why.", studentAnswer: "Because the moon is smaller so it has less gravity pulling the apple down, so the apple is lighter there.", status: "correct", praise: "Great — you linked the weaker gravitational pull on the Moon to the smaller weight." },
      { q: "2", type: "explain", stem: "A box does not move when Ben pushes it. Explain, in terms of forces, why the box stays still.", studentAnswer: "The box is too heavy for Ben.", status: "incorrect", error: "Saying the box is 'too heavy' does not explain the forces. The box stays still because another force is acting against Ben's push.", ponder: "(Choice) Push or friction — which force acts on the box in the opposite direction to Ben's push? (Evidence) The box does not move at all. (Concept) Frictional force acts between two surfaces in contact and opposes motion. (Link) If Ben's push and the frictional force are equal, what is the overall force on the box?" },
      { q: "3(a)", type: "short", stem: "State one effect of a force acting on a moving trolley.", studentAnswer: "It can make it go faster.", status: "correct", praise: "Correct — speeding up a moving object is one effect of a force." },
      { q: "3(b)", type: "explain", stem: "Mei adds a rough mat under the trolley's wheels. Explain how this changes the trolley's motion.", studentAnswer: "The rough mat gives more friction so the trolley slows down because friction is bigger and pushes against it.", status: "correct", praise: "Excellent — you connected the rougher surface to a larger frictional force that slows the trolley." },
      { q: "4", type: "explain", stem: "A spring stretches when a 100 g mass is hung on it. Explain why the spring returns to its original length when the mass is removed.", studentAnswer: "The spring is elastic so it goes back. The elastic spring force pulls it back to the start when you take the mass off.", status: "correct", praise: "Well done — you used the elastic spring force to explain the spring returning to shape." },
      { q: "5(a)", type: "short", stem: "Name the type of force that acts between the two magnets shown.", studentAnswer: "Magnetic force", status: "correct", praise: "Correct — that is the magnetic force." },
      { q: "5(b)", type: "explain", stem: "The two magnets push apart when brought near each other. Explain why.", studentAnswer: "The like poles are facing so they repel and push apart.", status: "correct", praise: "Great use of poles — like poles repel, so the magnets push apart." },
      { q: "6(a)", type: "short", stem: "On the diagram, the parachute is falling at a steady speed. Name the force acting upwards on the parachute.", studentAnswer: "Air resistance", status: "incorrect", error: "In our syllabus we name this the frictional force from the air, rather than 'air resistance'.", hint: "Which force from the syllabus list acts between the parachute and the air it is moving through?" },
      { q: "6(b)", type: "explain", stem: "Explain why a parachutist falls more slowly with an open parachute than with a closed one.", studentAnswer: "The open parachute catches more air so there is more upward force from the air which slows him down.", status: "correct", praise: "Excellent — larger surface in the air means a larger upward frictional force, so he slows down." },
      { q: "6(c)", type: "explain", stem: "Suggest why heavier objects are sometimes harder to start moving across a floor. Explain in terms of forces.", studentAnswer: "Heavier objects have more friction with the floor so you need a bigger push to move them.", status: "correct", praise: "Well reasoned — more weight means more friction, so a bigger push is needed." }
    ]
  };

  function App() {
    const S = window.SAMPLE;
    const saved = loadSession();
    const initial = reconcileMcq(saved ? saved.students : S.students, saved ? saved.mcqKey : S.mcqKey, saved ? saved.openDefs : S.open);
    const [mcqKey, setKey] = useState(saved ? saved.mcqKey : S.mcqKey);
    const [openDefs, setDefs] = useState(initial.defs);
    const [students, setStudents] = useState(initial.students);
    const [meta, setMeta] = useState(saved && saved.meta ? saved.meta : { school: "Nan Hua Primary School", topic: "Forces" });
    const [sel, setSel] = useState(0);
    const [layout, setLayout] = useState(saved && saved.layout ? saved.layout : "forces");
    const [results, setResults] = useState(saved ? (saved.results || {}) : { [key(S.students[0])]: SAMPLE_FB });
    const [busy, setBusy] = useState(null);        // status string for current op
    const [busyName, setBusyName] = useState(null);
    const [showMissing, setShowMissing] = useState(false);
    const [hasRoster, setHasRoster] = useState(saved ? !!saved.hasRoster : false);
    const [setupOpen, setSetupOpen] = useState(false);
    const [exportOpen, setExportOpen] = useState(false);
    const [mistakesOpen, setMistakesOpen] = useState(false);
    const [sideOpen, setSideOpen] = useState(() => (typeof window !== "undefined" ? window.innerWidth > 780 : true));
    const [allView, setAllView] = useState(false);
    const [paperImages, setPaperImages] = useState(saved ? saved.paperImages || null : null);
    const [qPages, setQPages] = useState(saved ? saved.qPages || null : null);
    const [tweaks, setTweaks] = useState(loadTweaks());
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [snippet, setSnippet] = useState(null); // { src, label } for the lightbox

    useEffect(() => {
      try { localStorage.setItem(SFL_TWEAKS_KEY, JSON.stringify(tweaks)); } catch (e) {}
      try { window.dispatchEvent(new CustomEvent("sfl-tweaks-changed", { detail: tweaks })); } catch (e) {}
    }, [tweaks]);

    // Persist the whole working session whenever the imported data or feedback changes.
    useEffect(() => {
      try {
        localStorage.setItem(SFL_SAVE_KEY, JSON.stringify({ v: 2, mcqKey, openDefs, students, meta, results, hasRoster, layout, savedAt: Date.now() }));
      } catch (e) { /* storage quota exceeded — session too large to cache, ignore */ }
    }, [mcqKey, openDefs, students, meta, results, hasRoster, layout]);
    // Worksheet page snippets persist separately — they're the most likely thing to
    // blow the storage quota, so a failure here must never lose the main session above.
    useEffect(() => {
      try {
        const cur = JSON.parse(localStorage.getItem(SFL_SAVE_KEY) || "{}");
        localStorage.setItem(SFL_SAVE_KEY, JSON.stringify(Object.assign({}, cur, { paperImages, qPages })));
      } catch (e) { /* worksheet images too large to cache — snippets still work this session */ }
    }, [paperImages, qPages]);

    const student = students[sel];
    // Missing = loaded students with no answers at all (blank placeholder rows from the roster match)
    const submittedOf = (s) => Object.values(s.mcq || {}).some(v => v && String(v).trim()) || Object.values(s.open || {}).some(v => v && String(v).trim());
    const missing = students.filter(s => !submittedOf(s)).map(s => ({ name: s.name, reg: s.className || "—" }));
    const fb = student ? results[key(student)] : null;
    const haveClaude = typeof window.claude !== "undefined" && window.claude && window.claude.complete;

    async function gen(s) {
      if (!s) return;
      if (!haveClaude) { alert("Claude isn't available in this view. Open the page in the app preview to generate live feedback. (A worked sample is shown for the first student.)"); return; }
      setBusyName(key(s));
      try {
        const out = await A.generateStudent(s, mcqKey, openDefs, (m) => setBusy(m));
        setResults(r => Object.assign({}, r, { [key(s)]: out }));
      } catch (err) { alert("Generation hit a snag: " + err.message); }
      setBusyName(null); setBusy(null);
    }
    async function genAll(force) {
      if (force === true && !window.confirm("Regenerate feedback for ALL students? This replaces existing feedback, including any manual edits you made.")) return;
      for (let i = 0; i < students.length; i++) { const s = students[i]; if (force === true || !results[key(s)]) { setSel(i); await gen(s); } }
      setAllView(true);
    }

    // Manual teacher edits to generated feedback (flows into every export).
    function editField(sKey, patch) {
      setResults(r => {
        const cur = r[sKey]; if (!cur) return r;
        const c = JSON.parse(JSON.stringify(cur));
        if (patch.kind === "note") { c.note = patch.value; }
        else if (patch.kind === "mcq") { const m = (c.mcq || []).find(x => String(x.q) === String(patch.id)); if (m) m[patch.field] = patch.value; }
        else if (patch.kind === "open") { const o = (c.open || []).find(x => String(x.q) === String(patch.id)); if (o) o[patch.field] = patch.value; }
        return Object.assign({}, r, { [sKey]: c });
      });
    }

    const coveredCount = students.filter(s => results[key(s)]).length;
    const submittedCount = students.filter(s => Object.values(s.mcq || {}).some(v => v && String(v).trim()) || Object.values(s.open || {}).some(v => v && String(v).trim())).length;
    // A real structured question has a numeric-leading label (1, 1(a), 2(b)…).
    // Table-fragment artifacts ("Object", "Object A", stems of bare "Yes"/"No")
    // from older/broken imports are dropped so they never reach feedback or export.
    const isRealQ = (o) => {
      if (!o) return false;
      const id = String(o.id || o.q || "").trim();
      const stem = String(o.stem || "").trim();
      if (!/^\d/.test(id)) return false;                 // real SAQ ids start with a digit
      if (/^\d+$/.test(id) && mcqKey[id] != null) return false;  // bare MCQ id misfiled as SAQ
      if (!stem || /^(yes|no|true|false)$/i.test(stem)) return false;
      return true;
    };
    // Backfill each MCQ feedback row with the pupil's chosen answer + the correct answer
    // from live data, so it shows even for feedback generated before this was captured.
    const enrichFb = (f, s) => {
      if (!f) return f;
      const byStu = s || students.find(st => key(st) === key(f));
      const mcqRaw = (f.mcq || []).map(m => Object.assign({}, m, {
        chosen: m.chosen || (byStu && byStu.mcq ? (byStu.mcq[m.q] || "").trim() : ""),
        correct: m.correct || (mcqKey[m.q] || "").trim()
      }));
      // Drop false positives: entries whose chosen answer actually matches the key
      // (e.g. "(2) …" vs key "B") that older raw-string scoring wrongly flagged.
      const sameC = (window.FeedbackApp && window.FeedbackApp.sameChoice) || (() => false);
      const mcq = mcqRaw.filter(m => !(m.chosen && m.correct && sameC(m.chosen, m.correct)));
      const open = (f.open || []).filter(isRealQ);
      // Backfill the complete MCQ picture (correct / unanswered lists) from live data
      // so even feedback generated before this feature shows every question's status.
      const same = (window.FeedbackApp && window.FeedbackApp.sameChoice) || (() => false);
      const stuMcq = (byStu && byStu.mcq) || {};
      const mcqCorrect = (f.mcqCorrect || Object.keys(mcqKey).filter(q => (stuMcq[q] || "") !== "" && same(stuMcq[q], mcqKey[q])).sort((a, b) => +a - +b)).slice();
      const mcqBlank = (f.mcqBlank || Object.keys(mcqKey).filter(q => !(stuMcq[q] || "").trim()).sort((a, b) => +a - +b)).slice();
      // Completeness audit: EVERY question in the key must appear in exactly one list.
      // Stored lists can be stale (generated by an older scorer) or an answer may not be
      // choice-like (misclassified column) — such a question must never vanish silently.
      const seen = new Set([].concat(mcq.map(m => String(m.q)), mcqCorrect.map(String), mcqBlank.map(String)));
      const byNum = (a, b) => +a - +b || String(a).localeCompare(String(b));
      Object.keys(mcqKey).forEach(q => {
        if (seen.has(String(q))) return;
        const ans = (stuMcq[q] || "").trim();
        if (!ans) mcqBlank.push(String(q));
        else if (same(ans, mcqKey[q])) mcqCorrect.push(String(q));
        else mcq.push({ q: String(q), chosen: ans, correct: (mcqKey[q] || "").trim(),
          text: "Your answer for this question needs another look — revisit the concept and try the correction below." });
      });
      // Unanswered MCQs also receive feedback (treated like an incorrect answer) while
      // still being listed under "MCQ not answered".
      mcqBlank.forEach(q => {
        if (mcq.some(m => String(m.q) === String(q))) { mcq.forEach(m => { if (String(m.q) === String(q)) m.unanswered = true; }); return; }
        mcq.push({ q: String(q), chosen: "", unanswered: true, correct: (mcqKey[q] || "").trim(),
          text: "This question was left unanswered — read it again and complete the correction below." });
      });
      mcq.forEach(m => { if (!(m.chosen || "").trim() && mcqBlank.indexOf(String(m.q)) >= 0) m.unanswered = true; });
      mcqCorrect.sort(byNum); mcqBlank.sort(byNum); mcq.sort((a, b) => byNum(a.q, b.q));
      return Object.assign({}, f, { mcq, open, mcqCorrect, mcqBlank });
    };
    const Layout = window.FeedbackLayouts[layout];
    const ForcesLayout = window.FeedbackLayouts.forces;

    return e("div", { className: "lab" },
      // ---- top bar ----
      e("header", { className: "lab-top" },
        e("div", { className: "brand" }, e("span", { className: "brand-claw" }, "🦾"),
          e("div", null, e("div", { className: "brand-name" }, "Science Feedback Lab"),
            e("div", { className: "brand-sub" }, `${meta.school} · ${meta.topic}`))),
        e("div", { className: "top-actions" },
          e("a", { className: "app-link", href: window.__sflBridge ? "../index.html" : "../../Form Creator.dc.html", title: "Go to the Google Form Creator" }, "📋 Form Creator"),
          e("div", { style: { width: 130 } }, e(Button, { variant: "neutral", size: "sm", onClick: () => setSideOpen(o => !o) }, sideOpen ? "Hide roster" : "Show roster")),
          e("div", { className: "seg-wrap" },
            e(SegmentedControl, {
              options: [{ value: "forces", label: "Doc" }, { value: "focus", label: "Focus" }],
              value: layout, onChange: setLayout
            })),
          coveredCount > 0 ? e("div", { className: "seg-wrap" },
            e(SegmentedControl, {
              options: [{ value: "one", label: "One" }, { value: "all", label: "All students" }],
              value: allView ? "all" : "one", onChange: (v) => setAllView(v === "all")
            })) : null,
          e("div", { style: { width: 110 } }, e(Button, { variant: "neutral", size: "sm", onClick: () => setSetupOpen(true) }, "Setup")),
          e("div", { style: { width: 150 } }, e(Button, { variant: "neutral", size: "sm", onClick: () => setMistakesOpen(true) }, "Common mistakes")),
          e("div", { style: { width: 44 } }, e(Button, { variant: "neutral", size: "sm", onClick: () => setSettingsOpen(true), title: "Settings" }, "⚙️")),
          e("div", { style: { width: 130 } }, e(Button, { variant: "primary", size: "sm", onClick: () => { setExportOpen(true); } }, "Export Doc"))
        )
      ),
      // ---- body ----
      e("div", { className: "lab-body" + (sideOpen ? "" : " noside") },
        // sidebar
        e("aside", { className: "lab-side" },
          e(Panel, { title: "Class Roster", accent: "yellow" },
            e("div", { className: "cov" }, `${coveredCount} / ${students.length} feedback ready`),
            e("div", { className: "cov-sub" }, `${hasRoster ? submittedCount + " submitted · " + students.length + " in class" : submittedCount + " submissions"} · ${Object.keys(mcqKey).length} MCQ + ${openDefs.length} structured`),
            e("div", { className: "roster" }, students.length ? students.map((s, i) => {
              const done = !!results[key(s)];
              const submitted = Object.values(s.mcq || {}).some(v => v && String(v).trim()) || Object.values(s.open || {}).some(v => v && String(v).trim());
              return e("button", { key: i, className: "rost" + (i === sel ? " on" : "") + (submitted ? "" : " nosub"), onClick: () => setSel(i) },
                e("span", { className: "rost-dot " + (done ? "done" : "todo") }),
                e("span", { className: "rost-name" }, s.name),
                e("span", { className: "rost-class" }, submitted ? (s.className ? "No. " + s.className : "") : "no submission"));
            }) : e("div", { className: "cov-sub" }, "No students loaded — open Setup to import.")),
            e("div", { style: { marginTop: 12, display: "flex", flexDirection: "column", gap: 8 } },
              e(Button, { variant: "primary", onClick: () => genAll(), disabled: !!busyName }, busyName ? "Working…" : "Generate all"),
              coveredCount ? e(Button, { variant: "neutral", size: "sm", onClick: () => genAll(true), disabled: !!busyName }, "↻ Regenerate all") : null)
          ),
          e(Panel, { title: "How it works", accent: "blue", style: { marginTop: 14 } },
            e("ol", { className: "how" },
              e("li", null, "Import your question paper + answer-key PDFs and the Google Form responses in Setup."),
              e("li", null, "Claude reads each answer and writes feedback — no scores, ticks or crosses."),
              e("li", null, "Pick a layout, then Export to a Google Doc."))
          ),
          (missing && missing.length) ? e(Panel, { title: "Missing Submissions", accent: "red", style: { marginTop: 14 } },
            e("div", { className: "miss-count" }, missing.length + " not submitted (of " + students.length + " on roster)"),
            e("div", { className: "miss-panel-list" },
              missing.map((s, i) => e("div", { className: "miss-panel-item", key: i },
                e("span", { className: "miss-panel-name" }, s.name),
                e("span", { className: "miss-panel-reg" }, s.reg && s.reg !== "—" ? "Reg No. " + s.reg : ""))))
          ) : e(Panel, { title: "Missing Submissions", accent: hasRoster ? "green" : "blue", style: { marginTop: 14 } },
            hasRoster
              ? e("div", { className: "miss-empty" }, "✓ Everyone on the class list submitted.")
              : e("div", { className: "miss-empty" }, "Add a class list in Setup (paste Surname | Register, or upload it) to track who hasn't submitted."))
        ),
        // main
        e("main", { className: "lab-main" },
          allView
            ? e("div", { className: "main-head" },
                e("div", { className: "mh-name" }, "All students",
                  e("span", { className: "mh-class" }, "  ·  " + coveredCount + " of " + students.length + " generated" + (hasRoster ? " · " + submittedCount + " submitted" : ""))),
                e("div", { style: { display: "flex", gap: 8 } },
                  e("div", { style: { width: 160 } }, e(Button, { variant: "primary", size: "sm", onClick: () => genAll(), disabled: !!busyName }, busyName ? (busy || "Working…") : "Generate all")),
                  e("div", { style: { width: 160 } }, e(Button, { variant: "neutral", size: "sm", onClick: () => genAll(true), disabled: !!busyName }, "↻ Regenerate all"))))
            : e("div", { className: "main-head" },
                e("div", { className: "mh-name" }, student ? student.name : "—",
                  e("span", { className: "mh-class" }, student && student.className ? "  ·  Reg No. " + student.className : "")),
                e("div", { style: { width: 150 } }, e(Button, { variant: fb ? "neutral" : "primary", size: "sm", onClick: () => gen(student), disabled: !student || busyName === (student ? key(student) : "") },
                  busyName === (student ? key(student) : "") ? (busy || "Working…") : (fb ? "Regenerate" : "Generate feedback")))),
          allView
            ? e("div", { className: "sheet-wrap allview" },
                students.length === 0
                  ? e("div", { className: "empty" }, e("div", { className: "empty-glyph" }, "📝"), e("div", { className: "empty-title" }, "No students loaded"))
                  : e("div", { className: "alldoc" },
                      students.map((s, i) => {
                        const f = results[key(s)];
                        const sk = key(s);
                        return e("div", { className: "sheet-page", key: sk },
                          busyName === sk
                            ? e("div", { className: "lay lay-forces placeholder" }, e("div", { className: "spinner dark" }), e("div", { className: "ph-note" }, busy || "Generating…"))
                            : f
                              ? e(ForcesLayout, { fb: Object.assign({}, enrichFb(f, s), { school: meta.school, topic: meta.topic }), index: i + 1, editable: true, onEdit: (p) => editField(sk, p) })
                              : e("div", { className: "lay lay-forces placeholder" },
                                  e("div", { className: "lf-name" }, (i + 1) + ". " + (s.name || "").toUpperCase()),
                                  e("div", { className: "ph-note" }, "Not generated yet — click Generate all.")));
                      })))
            : e("div", { className: "sheet-wrap" },
                student && busyName === key(student)
                  ? e("div", { className: "empty" }, e("div", { className: "spinner" }), e("div", null, busy || "Claude is reading the answers…"))
                  : fb
                    ? e("div", { className: "sheet" }, layout === "forces"
                        ? e(Layout, { fb: Object.assign({}, enrichFb(fb, student), { school: meta.school, topic: meta.topic }), index: sel + 1, editable: true, onEdit: (p) => editField(key(student), p) })
                        : e(Layout, { fb: Object.assign({}, enrichFb(fb, student), { school: meta.school, topic: meta.topic }), index: sel + 1 }))
                    : student
                      ? e("div", { className: "subm-wrap" }, e(SubmissionView, { student, mcqKey, openDefs, onGenerate: () => gen(student) }))
                      : e("div", { className: "empty" },
                          e("div", { className: "empty-glyph" }, "📝"),
                          e("div", { className: "empty-title" }, "No students loaded"),
                          e("div", { className: "empty-text" }, "Open Setup to import your worksheet and Google Form responses.")))
        )
      ),
      setupOpen ? e(SetupModal, { mcqKey, openDefs, students, meta, onClose: () => setSetupOpen(false),
        onApply: (d) => { const r = reconcileMcq(d.students, d.mcqKey, d.openDefs); setKey(d.mcqKey); setDefs(r.defs); setStudents(r.students); setMeta(d.meta); setHasRoster(!!d.hasRoster); setResults({}); setSel(0); setSetupOpen(false); if (d.paperImages) setPaperImages(d.paperImages); if (d.qPages) setQPages(d.qPages); } }) : null,
      exportOpen ? e(ExportModal, { results: Object.fromEntries(students.map(s => [key(s), enrichFb(results[key(s)], s)]).filter(p => p[1])), students, meta, onClose: () => setExportOpen(false) }) : null,
      mistakesOpen ? e(MistakesModal, { students, mcqKey, openDefs, results, paperImages, qPages, showSnippets: tweaks.showSnippets, mistakeThreshold: tweaks.mistakeThreshold, onClose: () => setMistakesOpen(false), onPick: (i) => { setSel(i); setMistakesOpen(false); }, onSnippet: (src, label) => setSnippet({ src, label }) }) : null,
      settingsOpen ? e(SettingsModal, { tweaks, onChange: (p) => setTweaks(t => Object.assign({}, t, p)), onClose: () => setSettingsOpen(false) }) : null,
      snippet ? e(SnippetLightbox, { snippet, onClose: () => setSnippet(null) }) : null
    );
  }

  // ---- Setup modal ----
  function FilePick({ label, accept, file, onPick }) {
    const ref = useRef(null);
    return e("div", { className: "file-pick" },
      e("div", { className: "fp-label" }, label),
      e("button", { className: "fp-btn", onClick: () => ref.current && ref.current.click() }, file ? "Change" : "Choose file"),
      e("span", { className: "fp-name" }, file ? file.name : "No file selected"),
      e("input", { ref, type: "file", accept, style: { display: "none" }, onChange: ev => onPick(ev.target.files[0] || null) })
    );
  }

  function SetupModal({ mcqKey, openDefs, students, meta, onClose, onApply }) {
    const FI = window.FeedbackImport;
    const [k, setK] = useState(A.serKey(mcqKey));
    const [od, setOd] = useState(A.serOpen(openDefs));
    const [st, setSt] = useState(A.serStudents(students, mcqKey, openDefs));
    const [m, setM] = useState(meta);
    const [files, setFiles] = useState({ paper: null, key: null, resp: null, classlist: null });
    const [clNames, setClNames] = useState("");   // pasted class list: Name | Register | Class
    const [showMissing, setShowMissing] = useState(false);
    const [missing, setMissing] = useState([]);
    const [scanCols, setScanCols] = useState([]);        // [{id, kind, header, stem}] from the last responses scan
    const [unmatchedCols, setUnmatchedCols] = useState([]); // headers the scan could not place
    const [kindOverrides, setKindOverrides] = useState({}); // header -> "mcq"|"saq" teacher decisions
    const [respRows, setRespRows] = useState(null);       // parsed responses grid, kept for re-scans
    const [lastRoster, setLastRoster] = useState(null);
    const [rosterApplied, setRosterApplied] = useState(false);
    const [imp, setImp] = useState("");
    const [importing, setImporting] = useState(false);
    const [paperShots, setPaperShots] = useState(null); // { images:[dataUrl…], texts:[string…] } from the worksheet PDF

    async function runImport() {
      setImporting(true);
      try {
        let kText = "", pText = "";
        if (files.key) { setImp("Reading answer-key PDF…"); kText = await FI.pdfText(files.key); }
        if (files.paper) {
          setImp("Reading question-paper PDF…"); pText = await FI.pdfText(files.paper);
          try { setImp("Rendering worksheet pages for question snippets…"); setPaperShots(await FI.paperPages(files.paper, 40)); }
          catch (shotErr) { setPaperShots(null); /* snippets are a bonus — never block import on this */ }
        }
        if (kText || pText) {
          setImp("Detecting topic…");
          const dm = await FI.detectMeta(kText || pText);
          if (dm && (dm.topic || dm.school)) setM(x => Object.assign({}, x, { topic: dm.topic || x.topic, school: dm.school || x.school }));
        }
        // MCQ answers from the key PDF (if any)
        if (kText) { setImp("Structuring MCQ answer key…"); const nk = await FI.structureMcq(kText); if (nk) setK(nk); }
        // Class list (optional) -> authoritative roster that filters out junk / off-list rows.
        // Non-fatal: if OCR/PDF reading fails we keep going (the responses file is what matters).
        let roster = null, rosterWarn = "", missing = [];
        const pasted = clNames.split(/\n+/).map(l => l.trim()).filter(Boolean).map(l => {
          const p = l.split(/[|\t,]/).map(s => s.trim());
          return { name: p[0], reg: p[1] || "", className: p[2] || "" };
        }).filter(s => s.name);
        if (pasted.length) { roster = pasted; }
        else if (files.classlist) {
          const clName = (files.classlist.name || "").toLowerCase();
          const isImg = /\.(png|jpe?g|webp|gif|bmp|heic|heif)$/.test(clName) || (files.classlist.type || "").startsWith("image/");
          try {
            if (isImg) {
              // Images: ONE Claude vision pass straight to structured students (no OCR text hop).
              const vs = await FI.classlistFromImage(files.classlist, setImp);
              if (vs.length) { roster = vs.map(s => ({ name: s.name, reg: s.reg || "", className: "" })); }
              else { rosterWarn = " ⚠ Claude couldn't read any names from the class-list image — check it's clear and upright, or paste the names below. "; }
            } else {
              setImp("Reading class list…");
              const clText = await FI.rosterText(files.classlist, setImp);
              const cl = await FI.extractClasslist(clText);
              if (cl.students.length) { roster = cl.students; }
              else if (cl.rawChars < 15) { rosterWarn = " ⚠ Couldn't read text from the class-list file — paste the names in the box below instead. "; }
              else { rosterWarn = " ⚠ Read the file but couldn't pick out names — paste them in the box below instead. "; }
            }
          } catch (clErr) { roster = null; rosterWarn = " ⚠ Class list could not be read (" + (clErr.message || "error") + ") — paste the names in the box below instead. "; }
        }
        setRosterApplied(!!(roster && roster.length));
        if (roster && roster.length) setImp("Class list read: " + roster.length + " pupils ✓");
        // Responses file is the source of truth for the question list (keeps 1(a),1(b)… labels)
        let scan = null;
        if (files.resp) { setImp("Scanning responses…"); const rows = await FI.parseTable(files.resp); setRespRows(rows); setLastRoster(roster); scan = FI.scanResponses(rows, roster, kindOverrides); if (scan.tsv) setSt(scan.tsv); }
        else if (roster && roster.length) { setImp("Building roster…"); scan = FI.scanResponses([["Name", "Register"]], roster); if (scan.tsv) setSt(scan.tsv); }
        else { setSt(""); }   // no responses & no class list -> clear any sample students
        setScanCols((scan && scan.cols) || []);
        setUnmatchedCols((scan && scan.unmatchedCols) || []);
        // Missing = roster students with no submission (scan computes this against the register/surname match)
        if (scan && scan.missing) {
          setMissing(scan.missing.map(str => {
            const m = str.match(/^(.*?)\s*\((.*)\)\s*$/);
            return m ? { name: m[1], reg: m[2] } : { name: str, reg: "—" };
          }));
        } else { setMissing([]); }
        if (scan && scan.saqDefs.length) {
          let defs = scan.saqDefs;
          if (kText) { setImp("Matching answer key…"); defs = await FI.structureMarking(kText, pText, defs, setImp); }
          setOd(A.serOpen(defs));
          setImp("Imported ✓  " + scan.note + rosterWarn + "  Review below, then Apply.");
        } else if (pText || kText) {
          setImp("Reading open-ended questions…");
          const openTxt = await FI.structureOpen(pText, kText, setImp); if (openTxt) setOd(openTxt);
          setImp("Imported ✓  " + (scan ? scan.note + "  " : "") + rosterWarn + "Review everything below, then Apply.");
        } else {
          setImp("Imported ✓  " + (scan ? scan.note + "  " : "") + rosterWarn + "Review below, then Apply.");
        }
      } catch (err) { setImp("Import error: " + err.message); }
      setImporting(false);
    }

    // Teacher flipped a column's type — re-run the deterministic scan with the override applied.
    function setColKind(header, kind) {
      if (!respRows) { setImp("Re-import the responses file first — column types can only be changed against the original file."); return; }
      const ov = Object.assign({}, kindOverrides, { [header]: kind });
      setKindOverrides(ov);
      const scan = FI.scanResponses(respRows, lastRoster, ov);
      if (scan.tsv) setSt(scan.tsv);
      setScanCols(scan.cols || []);
      setUnmatchedCols(scan.unmatchedCols || []);
      if (scan.saqDefs.length) setOd(A.serOpen(scan.saqDefs));
      setImp("Column types updated — " + scan.note);
    }

    function apply() {
      const defs = A.parseOpen(od);
      const prev = (meta && meta.sources) || {};
      const sources = {
        paper: files.paper ? files.paper.name : (prev.paper || ""),
        key: files.key ? files.key.name : (prev.key || ""),
        resp: files.resp ? files.resp.name : (prev.resp || ""),
        classlist: files.classlist ? files.classlist.name : (prev.classlist || "")
      };
      const parsedKey = A.parseKey(k);
      let paperImages = null, qPages = null;
      if (paperShots && paperShots.images && paperShots.images.length) {
        paperImages = paperShots.images;
        qPages = {};
        Object.keys(parsedKey).forEach(q => { const p = FI.findQuestionPage(paperShots.texts, q); if (p) qPages["mcq:" + q] = p; });
        defs.forEach(d => { const p = FI.findQuestionPage(paperShots.texts, d.id); if (p) qPages["saq:" + d.id] = p; });
      }
      onApply({ mcqKey: parsedKey, openDefs: defs, students: A.parseStudents(st, defs), meta: Object.assign({}, m, { sources }), hasRoster: rosterApplied, paperImages, qPages });
    }
    function reset() { const S = window.SAMPLE; setK(A.serKey(S.mcqKey)); setOd(A.serOpen(S.open)); setSt(A.serStudents(S.students, S.mcqKey, S.open)); setM({ school: "Nan Hua Primary School", topic: "Forces" }); setFiles({ paper: null, key: null, resp: null, classlist: null }); setClNames(""); setMissing([]); setImp(""); }
    function clearAll() { setK(""); setOd(""); setSt(""); setM({ school: "", topic: "" }); setFiles({ paper: null, key: null, resp: null, classlist: null }); setClNames(""); setMissing([]); setImp("Cleared. Import your files above or paste below."); }
    return e(Overlay, { onClose },
      e(Panel, { title: "Setup — Import or Paste Your Worksheet", accent: "green", solid: true, style: { width: "min(900px, 94vw)", maxHeight: "88vh", overflow: "auto" } },
        e("div", { className: "imp-block" },
          e("div", { className: "imp-head" }, "1 · Import files"),
          e("div", { className: "imp-hint" }, "Drop in your PDFs and the Google Form responses — the lab extracts and structures them below for you to check."),
          (m.sources && (m.sources.paper || m.sources.key || m.sources.resp || m.sources.classlist))
            ? e("div", { className: "imp-hint", style: { color: "var(--sc-green-bright)" } },
                "📎 Remembered from last time: " + [
                  m.sources.paper && ("paper (" + m.sources.paper + ")"),
                  m.sources.key && ("key (" + m.sources.key + ")"),
                  m.sources.resp && ("responses (" + m.sources.resp + ")"),
                  m.sources.classlist && ("class list (" + m.sources.classlist + ")")
                ].filter(Boolean).join("  ·  ") + ". These are file names only — the data shown below is from the LAST scan. To re-scan with current logic you must re-upload the file itself.")
            : null,
          e(FilePick, { label: "Question paper (PDF)", accept: ".pdf", file: files.paper, onPick: f => { setFiles(x => Object.assign({}, x, { paper: f })); if (f) { const t = FI.deriveTopic(f.name); if (t) setM(x => Object.assign({}, x, { topic: t })); } } }),
          e(FilePick, { label: "Answer key (PDF)", accept: ".pdf", file: files.key, onPick: f => { setFiles(x => Object.assign({}, x, { key: f })); if (f) { const t = FI.deriveTopic(f.name); if (t) setM(x => Object.assign({}, x, { topic: t })); } } }),
          e(FilePick, { label: "Student responses (Google Form: CSV / XLSX)", accept: ".csv,.tsv,.txt,.xlsx,.xls", file: files.resp, onPick: f => setFiles(x => Object.assign({}, x, { resp: f })) }),
          e(FilePick, { label: "Class list (PDF or image) — optional, sets the official roster", accept: ".pdf,.png,.jpg,.jpeg,.webp,.gif,.bmp,image/*", file: files.classlist, onPick: f => setFiles(x => Object.assign({}, x, { classlist: f })) }),
          e("label", { className: "fld cl-paste" }, "Paste the class list — one per line: Surname | Register number (for privacy). E.g:",
            e("code", null, "Tan | 12"),
            e("textarea", { className: "ta", rows: 3, value: clNames, placeholder: "Tan | 12\nLim | 7\nWong | 23", onChange: ev => setClNames(ev.target.value) })),
          e("div", { className: "imp-actions" },
            e("div", { style: { width: 220 } }, e(Button, { variant: "active", onClick: runImport, disabled: importing || (!files.paper && !files.key && !files.resp && !files.classlist && !clNames.trim()) }, importing ? "Extracting…" : "Extract with Claude")),
            imp ? e("span", { className: "imp-status" + (importing ? " busy" : "") }, imp) : null)
        ),
        unmatchedCols.length ? e("div", { className: "col-warn" },
          e("div", { className: "col-warn-head" }, "⚠ " + unmatchedCols.length + " column" + (unmatchedCols.length > 1 ? "s" : "") + " could not be placed"),
          e("div", { className: "col-warn-body" },
            "These response columns hold answers but their headers don't start with a question number, so the app cannot match them to questions. They are NOT included in feedback. Rename the question in your Google Form (e.g. start it with \u201C3.\u201D) and re-download the CSV, or ignore if they aren't questions:"),
          e("ul", { className: "col-warn-list" }, unmatchedCols.map((h, i) => e("li", { key: i }, "\u201C" + (h.length > 90 ? h.slice(0, 90) + "\u2026" : h) + "\u201D")))) : null,
        scanCols.length ? e("div", { className: "imp-block" },
          e("div", { className: "imp-head" }, "1b · Column check — confirm question types"),
          e("div", { className: "imp-hint" }, "The app guessed each column's type from the shape of the answers. One wrong guess silently moves a question to the wrong section — flip any that are wrong; the data re-imports instantly."),
          e("div", { className: "col-check-list" }, scanCols.map((c, i) =>
            e("div", { className: "col-check-row", key: i },
              e("span", { className: "col-check-id" }, c.id),
              e("span", { className: "col-check-stem", title: c.header }, c.stem ? (c.stem.length > 60 ? c.stem.slice(0, 60) + "…" : c.stem) : c.header),
              e("div", { className: "col-check-kind" },
                e("button", { className: "col-kind-btn" + (c.kind === "mcq" ? " on" : ""), onClick: () => setColKind(c.header, "mcq") }, "MCQ"),
                e("button", { className: "col-kind-btn" + (c.kind === "saq" ? " on" : ""), onClick: () => setColKind(c.header, "saq") }, "Written")))))) : null,
        e("div", { className: "imp-head" }, "2 · Review & edit"),
        e("div", { className: "mrow" },
          e("label", null, "School", e("input", { className: "inp", value: m.school, onChange: ev => setM(Object.assign({}, m, { school: ev.target.value })) })),
          e("label", null, "Topic", e("input", { className: "inp", value: m.topic, onChange: ev => setM(Object.assign({}, m, { topic: ev.target.value })) }))),
        e("label", { className: "fld" }, "Answer key — MCQ (one per line: ", e("code", null, "1: B"), ")",
          e("textarea", { className: "ta", rows: 4, value: k, onChange: ev => setK(ev.target.value) })),
        e("label", { className: "fld" }, "Open-ended key (", e("code", null, "id | explain/short | question stem | marking point"), ")",
          e("textarea", { className: "ta", rows: 6, value: od, onChange: ev => setOd(ev.target.value) })),
        e("label", { className: "fld" }, "Student responses — paste from Google Sheet (tab or comma separated; header row ", e("code", null, "Name  Class  MCQ1…  1(a)  1(b)…"), ")",
          e("textarea", { className: "ta mono", rows: 6, value: st, onChange: ev => setSt(ev.target.value) })),
        e("div", { className: "modal-actions" },
          e("div", { style: { width: 110 } }, e(Button, { variant: "danger", onClick: clearAll }, "Clear all")),
          e("div", { style: { width: 160 } }, e(Button, { variant: "neutral", onClick: reset }, "Reset to sample")),
          e("div", { style: { flex: 1 } }),
          e("div", { style: { width: 110 } }, e(Button, { variant: "neutral", onClick: onClose }, "Cancel")),
          e("div", { style: { width: 140 } }, e(Button, { variant: "primary", onClick: apply }, "Apply")))
      )
    );
  }

  // ---- Export modal ----
  function ExportModal({ results, students, meta, onClose }) {
    const ordered = students.map(s => results[s.name + "|" + s.className]).filter(Boolean);
    const skipped = students.filter(s => !results[s.name + "|" + s.className]).map(s => s.name);
    const script = A.buildAppsScript(ordered, meta);
    const taRef = useRef(null);
    const [copied, setCopied] = useState(false);
    function copy() { const t = taRef.current; t.select(); try { document.execCommand("copy"); } catch (e2) {} setCopied(true); setTimeout(() => setCopied(false), 1600); }
    function downloadWord() {
      const html = A.buildWordDoc(ordered, meta);
      const blob = new Blob(["\ufeff" + html], { type: "application/msword" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = (meta.school + " - " + meta.topic + " Feedback").replace(/[^\w \-]/g, "").trim() + ".doc";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    }
    return e(Overlay, { onClose },
      e(Panel, { title: "Export to Google Doc", accent: "green", solid: true, style: { width: "min(860px, 94vw)", maxHeight: "88vh", overflow: "auto" } },
        ordered.length === 0
          ? e("div", { className: "export-empty" }, "Generate feedback for at least one student first.")
          : e("div", null,
              e("p", { className: "export-note" }, `Ready for ${ordered.length} student${ordered.length > 1 ? "s" : ""} — each starts on a new page, with your manual edits included. `,
                e("strong", null, "Word (.doc)"), " downloads instantly and opens in Microsoft Word or Google Docs. Or copy the ",
                e("strong", null, "Apps Script"), " into ", e("code", null, "script.google.com"), " → run ", e("code", null, "createFeedbackDoc()"), " to build it straight in Drive."),
              skipped.length
                ? e("div", { className: "export-warn" },
                    e("strong", null, "⚠ " + skipped.length + " student" + (skipped.length > 1 ? "s" : "") + " not yet generated — they’ll be left out: "),
                    skipped.join(", "), ". Go back and use ", e("strong", null, "Generate all"), " first to include everyone.")
                : null,
              e("textarea", { ref: taRef, className: "ta mono", rows: 12, readOnly: true, value: script }),
              e("div", { className: "modal-actions" },
                e("div", { style: { width: 220 } }, e(Button, { variant: "primary", onClick: downloadWord }, "⬇ Download Word (.doc)")),
                e("div", { style: { flex: 1 } }),
                e("div", { style: { width: 130 } }, e(Button, { variant: "neutral", onClick: onClose }, "Close")),
                e("div", { style: { width: 200 } }, e(Button, { variant: "neutral", onClick: copy }, copied ? "Copied!" : "Copy Apps Script")))
            )
      )
    );
  }

  function Overlay({ onClose, children }) {
    return e("div", { className: "overlay", onMouseDown: (ev) => { if (ev.target === ev.currentTarget) onClose(); } }, children);
  }

  // ---- Submission view (shown when a student is selected but not yet generated) ----
  function SubmissionView({ student, mcqKey, openDefs, onGenerate }) {
    const mcqIds = Object.keys(mcqKey);
    return e("div", { className: "subm" },
      e("div", { className: "subm-head" },
        e("div", null,
          e("div", { className: "subm-title" }, "Submission"),
          e("div", { className: "subm-sub" }, "What this pupil typed — use Generate feedback (top right) to add guidance."))),
      mcqIds.length
        ? e("div", { className: "subm-block" },
            e("div", { className: "subm-bh" }, "Multiple choice"),
            e("div", { className: "subm-mcq" }, mcqIds.map(q => e("div", { className: "subm-chip", key: q },
              e("span", { className: "subm-chip-q" }, "Q" + q), e("span", null, student.mcq[q] || "—")))))
        : null,
      e("div", { className: "subm-block" },
        e("div", { className: "subm-bh" }, "Structured questions"),
        openDefs.map((d, i) => {
          const a = (student.open[d.id] || "").trim();
          return e("div", { className: "subm-q", key: i },
            e("div", { className: "subm-qid" }, d.id),
            e("div", { className: "subm-stem" }, d.stem),
            a ? e("div", { className: "subm-ans" }, a) : e("div", { className: "subm-ans subm-empty" }, "No answer submitted"));
        }))
    );
  }

  // ---- Most common mistakes ----
  // Denominator = students who actually attempted each question (non-blank answer /
  // graded feedback). This excludes blank "did not submit" placeholder rows, so the
  // count reflects the real class rather than an inflated row total.
  function computeMistakes(students, mcqKey, openDefs, results) {
    const items = [];
    Object.keys(mcqKey).forEach(q => {
      let wrong = 0, attempted = 0; const names = [];
      students.forEach(s => {
        const a = (s.mcq[q] || "").trim();
        if (!a) return;               // didn't answer this MCQ — not part of the base
        attempted++;
        // Same normalised comparison as the feedback scorer ("(2) The air…" == key "B"),
        // so Common Mistakes can never disagree with a pupil's own feedback.
        if (!A.sameChoice(a, mcqKey[q])) { wrong++; names.push(s.name); }
      });
      if (wrong) items.push({ id: "Q" + q, rawId: q, kind: "mcq", stem: "Multiple-choice question " + q, wrong, denom: attempted, names });
    });
    openDefs.forEach(d => {
      let wrong = 0, graded = 0; const names = [];
      students.forEach(s => {
        const submitted = Object.values(s.mcq || {}).some(v => v && String(v).trim()) || Object.values(s.open || {}).some(v => v && String(v).trim());
        if (!submitted) return;       // blank placeholder / non-submitter — exclude from the base
        const fb = results[s.name + "|" + s.className]; if (!fb) return;
        const o = (fb.open || []).find(x => x.q === d.id); if (!o) return; graded++;
        if (o.status === "incorrect" || o.status === "blank" || o.status === "partial") { wrong++; names.push(s.name); }
      });
      if (wrong) items.push({ id: d.id, rawId: d.id, kind: "saq", stem: d.stem, wrong, denom: graded, names });
    });
    return items.sort((a, b) => b.wrong - a.wrong);
  }

  function MistakesModal({ students, mcqKey, openDefs, results, paperImages, qPages, showSnippets, mistakeThreshold, onClose, onPick, onSnippet }) {
    const allItems = computeMistakes(students, mcqKey, openDefs, results);
    const items = allItems.filter(it => (it.denom ? (it.wrong / it.denom * 100) : 0) >= (mistakeThreshold || 0));
    const canSnip = showSnippets && paperImages && paperImages.length && qPages;
    const submitters = students.filter(s => Object.values(s.mcq || {}).some(v => v && String(v).trim()) || Object.values(s.open || {}).some(v => v && String(v).trim()));
    const gradedCount = submitters.filter(s => results[s.name + "|" + s.className]).length;
    return e(Overlay, { onClose },
      e(Panel, { title: "Common Mistakes", accent: "red", solid: true, style: { width: "min(820px, 94vw)", maxHeight: "88vh", overflow: "auto" } },
        e("p", { className: "export-note" }, "Ranked by how many pupils missed each question, out of those who attempted it. MCQ use the answer key; structured questions use graded feedback",
          gradedCount < submitters.length ? ` (${gradedCount}/${submitters.length} submitters graded so far — generate more for fuller data).` : ".",
          canSnip ? " Click a question to bring up its worksheet snippet for class discussion." : ""),
        items.length === 0
          ? e("div", { className: "export-empty" }, allItems.length ? "No mistakes meet the current threshold — lower it in ⚙ Settings." : "No mistakes detected yet — generate feedback to populate structured questions.")
          : e("div", { className: "mis-list" }, items.map((it, i) => {
              const pct = it.denom ? Math.round(it.wrong / it.denom * 100) : 0;
              const page = canSnip ? qPages[(it.kind === "mcq" ? "mcq:" : "saq:") + it.rawId] : null;
              return e("div", { className: "mis-row", key: i },
                e("div", {
                  className: "mis-top" + (page ? " mis-top-clickable" : ""),
                  onClick: page ? () => onSnippet(paperImages[page - 1], it.id) : undefined,
                  title: page ? "Bring up this question's worksheet snippet" : undefined
                },
                  e("span", { className: "mis-id " + it.kind }, it.id),
                  page ? e("span", { className: "mis-snip-btn" }, "🖼 Show question") : null,
                  e("span", { className: "mis-count" }, `${it.wrong} of ${it.denom} missed`)),
                it.kind === "saq" ? e("div", { className: "mis-stem" }, it.stem) : null,
                e("div", { className: "mis-bar" }, e("div", { className: "mis-fill", style: { width: pct + "%" } })),
                e("div", { className: "mis-names" }, it.names.slice(0, 8).map((nm, j) =>
                  e("button", { key: j, className: "mis-name", onClick: () => onPick(students.findIndex(s => s.name === nm)) }, nm)),
                  it.names.length > 8 ? e("span", { className: "mis-more" }, `+${it.names.length - 8} more`) : null)
              );
            }))
      )
    );
  }

  function SnippetLightbox({ snippet, onClose }) {
    return e(Overlay, { onClose },
      e("div", { className: "snip-pop" },
        e(Panel, { title: "Question " + snippet.label + " — worksheet snippet", accent: "blue", solid: true, style: { width: "min(1100px, 96vw)", maxHeight: "92vh", overflow: "auto" } },
          e("img", { src: snippet.src, className: "snip-img", style: { width: "100%", borderRadius: 8, display: "block" } }),
          e("p", { className: "export-note" }, "Full worksheet page shown for context — the highlighted question may be anywhere on it."),
          e("div", { className: "modal-actions" }, e("div", { style: { flex: 1 } }), e("div", { style: { width: 110 } }, e(Button, { variant: "neutral", onClick: onClose }, "Close"))))));
  }

  function SettingsModal({ tweaks, onChange, onClose }) {
    return e(Overlay, { onClose },
      e(Panel, { title: "Settings", accent: "yellow", solid: true, style: { width: "min(480px, 94vw)" } },
        e("div", { className: "set-row" },
          e("label", { className: "set-label" }, `Eye-rest reminder every ${tweaks.eyeMinutes} min`),
          e("input", { type: "range", min: 20, max: 60, step: 5, value: tweaks.eyeMinutes, onChange: ev => onChange({ eyeMinutes: +ev.target.value }), className: "set-slider" })),
        e("div", { className: "set-row" },
          e("label", { className: "set-label" }, `Common Mistakes: only show questions missed by \u2265 ${tweaks.mistakeThreshold}% of pupils`),
          e("input", { type: "range", min: 0, max: 90, step: 10, value: tweaks.mistakeThreshold, onChange: ev => onChange({ mistakeThreshold: +ev.target.value }), className: "set-slider" })),
        e("div", { className: "set-row set-toggle-row" },
          e("label", { className: "set-label" }, "Show worksheet snippets in Common Mistakes"),
          e("button", { className: "set-toggle" + (tweaks.showSnippets ? " on" : ""), onClick: () => onChange({ showSnippets: !tweaks.showSnippets }) }, tweaks.showSnippets ? "On" : "Off")),
        e("p", { className: "export-note" }, "Snippets need a Question Paper PDF uploaded in Setup (re-Apply after uploading it)."),
        e("div", { className: "modal-actions" }, e("div", { style: { flex: 1 } }), e("div", { style: { width: 110 } }, e(Button, { variant: "primary", onClick: onClose }, "Done")))));
  }

  ReactDOM.createRoot(document.getElementById("root")).render(e(App));
})();
