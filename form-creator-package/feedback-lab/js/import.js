/* File import for Science Feedback Lab.
   The Google Form / Sheet responses file is the SOURCE OF TRUTH for the
   question list: each column header is a question label like "1(a). <stem>",
   and each row is a student's answers. We read IDs + stems straight from the
   headers (so SAQ keep their real labels 1(a),1(b),1(c)…) and map every
   answer by column — no renumbering, no false "not attempted".
   PDFs (paper + answer key) are used only to fill MCQ answers + marking points. */
(function () {
  // ---------- PDF ----------
  let pdfLib = null;
  async function getPdf() {
    if (pdfLib) return pdfLib;
    const mod = await import("https://cdn.jsdelivr.net/npm/pdf-parse@2.4.5/dist/pdf-parse/web/pdf-parse.es.js");
    mod.PDFParse.setWorker("https://cdn.jsdelivr.net/npm/pdf-parse@2.4.5/dist/pdf-parse/web/pdf.worker.min.mjs");
    pdfLib = mod.PDFParse;
    return pdfLib;
  }
  async function pdfText(file) {
    const PDFParse = await getPdf();
    const parser = new PDFParse({ data: new Uint8Array(await file.arrayBuffer()) });
    const r = await parser.getText();
    return r.text || "";
  }

  // Render every page of the worksheet PDF as an image (for "show me this question"
  // snippets in Common Mistakes) + get each page's own text (to deterministically find
  // which page a question is on — no guessing, no AI call needed for this part).
  async function paperPages(file, maxPages) {
    const PDFParse = await getPdf();
    const parser = new PDFParse({ data: new Uint8Array(await file.arrayBuffer()) });
    try {
      const info = await parser.getInfo();
      const total = Math.min(info.total || 1, maxPages || 40);
      const shots = await parser.getScreenshot({ desiredWidth: 1000, first: total });
      const toDataUrl = (p) => {
        if (typeof p.dataUrl === "string") return p.dataUrl;
        if (typeof p.data === "string") return p.data.indexOf("data:") === 0 ? p.data : "data:image/png;base64," + p.data;
        const bytes = p.data instanceof Uint8Array ? p.data : new Uint8Array(p.data);
        let bin = ""; for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
        return "data:image/png;base64," + btoa(bin);
      };
      const images = (shots.pages || []).map(toDataUrl);
      const texts = [];
      for (let i = 1; i <= total; i++) { const r = await parser.getText({ partial: [i] }); texts.push(r.text || ""); }
      return { images, texts };
    } finally { await parser.destroy(); }
  }

  // Find the first worksheet page whose text contains this question id — used to
  // point "view snippet" at the right page. Returns a 1-indexed page number or null.
  function findQuestionPage(texts, id) {
    const norm = String(id || "").trim();
    if (!norm) return null;
    for (let p = 0; p < texts.length; p++) { if (texts[p].indexOf(norm) >= 0) return p + 1; }
    if (/^\d+$/.test(norm)) {
      const re = new RegExp("(^|\\n)\\s*" + norm + "\\s*[\\.\\)]", "m");
      for (let p = 0; p < texts.length; p++) { if (re.test(texts[p])) return p + 1; }
    }
    return null;
  }

  // ---------- responses file -> text ----------
  async function responsesText(file) {
    const name = (file.name || "").toLowerCase();
    if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
      const XLSX = await import("https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs");
      const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      return XLSX.utils.sheet_to_csv(ws, { FS: "\t" });
    }
    return await file.text();
  }

  // ---------- delimited parsing ----------
  function splitRow(line, sep) {
    if (sep === "\t") return line.split("\t");
    const out = []; let cur = "", q = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { if (q && line[i + 1] === '"') { cur += '"'; i++; } else q = !q; }
      else if (ch === "," && !q) { out.push(cur); cur = ""; }
      else cur += ch;
    }
    out.push(cur); return out;
  }
  function inferType(stem) {
    return /\b(explain|why|account for|suggest|reason|how (?:does|do|can|is|are|will)|state .*reason|with reference)\b/i.test(stem || "") ? "explain" : "short";
  }

  // Robust delimited tokenizer: respects quoted fields that span newlines / contain
  // commas / escaped quotes — this is what fixes multi-line Google Form answers
  // being mis-split into fake "students".
  function tokenizeDelimited(text) {
    const nl = text.indexOf("\n");
    const firstLine = nl < 0 ? text : text.slice(0, nl);
    const sep = firstLine.includes("\t") ? "\t" : ",";
    const rows = []; let row = [], cur = "", q = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (q) { if (ch === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += ch; }
      else if (ch === '"') q = true;
      else if (ch === sep) { row.push(cur); cur = ""; }
      else if (ch === "\r") { /* skip */ }
      else if (ch === "\n") { row.push(cur); rows.push(row); row = []; cur = ""; }
      else cur += ch;
    }
    if (cur !== "" || row.length) { row.push(cur); rows.push(row); }
    return rows;
  }
  // File -> grid of rows (XLSX read natively so embedded newlines stay inside cells)
  async function parseTable(file) {
    const name = (file.name || "").toLowerCase();
    if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
      const XLSX = await import("https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs");
      const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      return XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: "" });
    }
    return tokenizeDelimited(await file.text());
  }

  // ---------- the core scan: grid (or raw text) -> questions + students ----------
  function scanResponses(input, roster, kindOverrides) {
    const grid = typeof input === "string" ? tokenizeDelimited(input) : (input || []);
    const all = grid.filter(r => r && r.some(x => String(x == null ? "" : x).trim().length));
    if (!all.length) return { tsv: "", mcqIds: [], saqDefs: [], note: "Empty file." };
    const headers = all[0].map(h => String(h == null ? "" : h).trim());
    const rows = all.slice(1);
    const lower = headers.map(h => h.toLowerCase());

    let nameCol = -1, classCol = -1, emailCol = -1, surnameCol = -1, regCol = -1;
    const ignore = new Set();
    headers.forEach((h, i) => {
      const t = lower[i];
      if (/timestamp|^date\b|points|^score\b|^total\b|username/.test(t)) ignore.add(i);
      if (/email/.test(t)) { emailCol = i; ignore.add(i); }
      if (surnameCol < 0 && /surname|family\s*name|last\s*name/.test(t)) surnameCol = i;
      if (regCol < 0 && /register|index\s*(no|number|num)?|reg\s*no|admin\s*no|\bregister\s*number\b/.test(t)) regCol = i;
      if (nameCol < 0 && /\bname\b/.test(t)) nameCol = i;
      if (classCol < 0 && /\bclass\b|\blevel\b/.test(t)) classCol = i;
    });
    // register/index column must not double as the "class" column
    if (regCol >= 0 && classCol === regCol) classCol = -1;
    if (surnameCol >= 0) ignore.add(surnameCol);
    if (regCol >= 0) ignore.add(regCol);
    if (nameCol >= 0) ignore.add(nameCol);
    if (classCol >= 0) ignore.add(classCol);

    // label patterns: "1(a)" / "1 (a)" / "Q1a" / "30(b)(i)" -> SAQ ; "1." / "Q1" / "1" -> numbered
    // The roman tail MUST be captured: without it 30(b)(i) and 30(b)(ii) collapse
    // into one id and two different questions get marked as the same answer.
    const subRe = /^\s*(?:q(?:uestion)?\s*)?(\d+)\s*[\(\[]?\s*([a-z])\s*[\)\]]?\s*(?:[\(\[]\s*([ivx]{1,4})\s*[\)\]])?(?=[\.\):\s]|$)/i;
    const numRe = /^\s*(?:q(?:uestion)?\s*)?(\d+)\s*[\.\):]?/i;
    // "Option-like" answers may start with a bracketed marker — Google Forms exports
    // choices as "(2) B", "(4) Air does not have a definite volume.", "2", "B", "Option 2".
    const optLike = (v) => { v = (v || "").trim(); return !!v && (v.length <= 3 || /^[\(\[]?\s*(option\s*)?[a-d1-4]\s*[\)\]\.\:]?(\s|$)/i.test(v)); };

    const cols = [];
    const unmatchedCols = [];   // question-like headers the app could NOT place — surfaced loudly, never dropped silently
    headers.forEach((h, i) => {
      if (ignore.has(i)) return;
      let m = h.match(subRe);
      if (m) {
        const stem = h.replace(subRe, "").replace(/^[\.\):\-\s]+/, "").trim();
        cols.push({ i, id: `${m[1]}(${m[2].toLowerCase()})${m[3] ? "(" + m[3].toLowerCase() + ")" : ""}`, kind: "saq", stem, header: h });
        return;
      }
      m = h.match(numRe);
      if (m && /^\s*(?:q(?:uestion)?\s*)?\d/i.test(h)) {
        const stem = h.replace(numRe, "").replace(/^[\.\):\-\s]+/, "").trim();
        const samples = rows.map(r => r[i]).filter(v => v != null && String(v).trim()).slice(0, 10);
        const shortRatio = samples.length ? samples.filter(optLike).length / samples.length : 1;
        // A column is MCQ when its answers look like options — answer shape is the primary
        // signal (Google Form headers carry the full stem, so long headers are normal for MCQ).
        cols.push({ i, id: m[1], kind: shortRatio >= 0.6 ? "mcq" : "saq", stem, header: h });
        return;
      }
      // Header with no leading number but holding real answer data: the app cannot place it.
      if (rows.some(r => r[i] != null && String(r[i]).trim())) unmatchedCols.push(h);
    });
    // Teacher's explicit column-type decisions (Column check UI) override the heuristic.
    if (kindOverrides) cols.forEach(c => { if (kindOverrides[c.header] === "mcq" || kindOverrides[c.header] === "saq") c.kind = kindOverrides[c.header]; });
    // Never let two columns share one MCQ id — a duplicated numeric id means the second
    // column is really a written question (it would otherwise overwrite the first's answers).
    const seenMcqIds = new Set();
    cols.forEach(c => { if (c.kind === "mcq") { if (seenMcqIds.has(c.id)) c.kind = "saq"; else seenMcqIds.add(c.id); } });

    const mcqCols = cols.filter(c => c.kind === "mcq");
    const saqCols = cols.filter(c => c.kind === "saq");
    const head = ["Name", "Register"].concat(mcqCols.map(c => "MCQ" + c.id)).concat(saqCols.map(c => c.id));

    const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z\s]/g, "").replace(/\s+/g, " ").trim();
    const digits = (s) => String(s || "").replace(/\D/g, "");
    // roster entries: { name (surname), reg, className }
    const rosterArr = (roster || []).map(s => ({ name: s.name || "", reg: s.reg || "", className: s.className || "" }));
    const useRoster = rosterArr.length > 0;
    const byReg = {};                       // register digits -> entry
    const bySurname = {};                    // norm surname -> entry (fallback)
    rosterArr.forEach((s, idx) => { s._idx = idx; const d = digits(s.reg); if (d) byReg[d] = s; const nk = norm(s.name); if (nk) bySurname[nk] = s; });
    const surnameKeys = Object.keys(bySurname);
    const matched = new Set();               // matched roster _idx

    function lev(a, b) {
      const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
      let prev = Array.from({ length: n + 1 }, (_, i) => i), cur = new Array(n + 1);
      for (let i = 1; i <= m; i++) { cur[0] = i; for (let j = 1; j <= n; j++) { const c = a[i - 1] === b[j - 1] ? 0 : 1; cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + c); } const t = prev; prev = cur; cur = t; }
      return prev[n];
    }
    function fuzzySurname(k) {
      if (!k) return null; if (bySurname[k]) return bySurname[k];
      let best = null, bestScore = Infinity;
      for (const rk of surnameKeys) { const d = lev(k, rk); if (d < bestScore) { bestScore = d; best = bySurname[rk]; } }
      const tol = k.length <= 4 ? 0 : 1;         // short surnames must match exactly; only tiny OCR slack otherwise
      return best && bestScore <= tol ? best : null;
    }
    const rosterHasReg = Object.keys(byReg).length > 0;
    // match a response row (surname, reg) -> roster entry.
    // Register number is checked first (fast, exact), but a mismatch or typo no
    // longer drops the row outright — we fall back to surname matching so a
    // mistyped/OCR'd register number never silently loses a real submission.
    function matchRoster(surname, reg) {
      const d = digits(reg);
      if (d && byReg[d]) return byReg[d];
      const nk = norm(surname);
      if (bySurname[nk]) return bySurname[nk];
      // token match: the Form may hold a FULL name ("tan rongzhen") while the
      // roster stores one name ("rongzhen") — or vice versa. Match if any word
      // of one side equals a whole roster key, or the roster key is a subset
      // of the response name's words. Only accept an unambiguous (single) hit.
      if (nk) {
        const words = nk.split(" ");
        const hits = new Set();
        for (const rk of surnameKeys) {
          const rWords = rk.split(" ");
          const rowHasRoster = rWords.every(w => words.indexOf(w) >= 0);
          const rosterHasRow = words.every(w => rWords.indexOf(w) >= 0);
          if (rowHasRoster || rosterHasRow) hits.add(bySurname[rk]);
        }
        if (hits.size === 1) return hits.values().next().value;
        if (hits.size > 1) return null; // ambiguous (two Tans) — keep row unmatched rather than guess
      }
      return fuzzySurname(nk);
    }

    const out = [head.join("\t")];
    let fallbackN = 0, unmatchedN = 0;
    const unmatchedRows = [];  // rows kept but not matched to a roster entry — surfaced so the teacher can fix the roster
    rows.forEach(r => {
      if (!r.some(x => String(x || "").trim())) return;
      let surname = surnameCol >= 0 ? (r[surnameCol] || "").trim() : "";
      let full = nameCol >= 0 ? (r[nameCol] || "").trim() : "";
      if (!full && emailCol >= 0) full = (r[emailCol] || "").split("@")[0].trim();
      if (!surname) surname = full;               // no dedicated surname column -> use the name field
      let reg = regCol >= 0 ? (r[regCol] || "").trim() : "";
      if (useRoster) {
        // Row-by-row transcription: EVERY response row becomes a student.
        // The roster only enriches (canonical name / register) — it never filters.
        const hit = matchRoster(surname, reg);
        if (hit) {
          if (hit.name) surname = hit.name;        // canonical surname from roster
          if (hit.reg) reg = hit.reg;
          matched.add(hit._idx);
        } else {
          unmatchedN++;
          if (!surname) surname = "Student " + (++fallbackN);
          unmatchedRows.push({ surname, reg });
        }
      } else if (!surname) { surname = "Student " + (++fallbackN); }
      const line = [surname, reg]
        .concat(mcqCols.map(c => String(r[c.i] == null ? "" : r[c.i]).replace(/[\t\r\n]+/g, " ").trim()))
        .concat(saqCols.map(c => String(r[c.i] == null ? "" : r[c.i]).replace(/[\t\r\n]+/g, " ").trim()));
      out.push(line.join("\t"));
    });

    const submittedCount = out.length - 1;
    const missingEntries = useRoster ? rosterArr.filter(s => !matched.has(s._idx)) : [];
    const missing = missingEntries.map(s => s.name + (s.reg ? " (" + s.reg + ")" : ""));
    // Populate the FULL class: add class-list students who didn't submit, as blank rows
    if (useRoster) {
      missingEntries.forEach(s => {
        const line = [s.name, s.reg].concat(mcqCols.map(() => "")).concat(saqCols.map(() => ""));
        out.push(line.join("\t"));
      });
    }
    const n = out.length - 1;
    const saqDefs = saqCols.map(c => ({ id: c.id, type: inferType(c.stem), stem: c.stem, marking: "" }));
    let note = `Found ${mcqCols.length} MCQ + ${saqCols.length} structured (${saqCols.map(c => c.id).join(", ") || "none"}).`;
    if (useRoster) note += ` Roster: ${rosterArr.length} students, ${submittedCount} submitted` +
      (unmatchedN ? `. ⚠ ${unmatchedN} submission${unmatchedN === 1 ? "" : "s"} kept but not on the class list (` +
        unmatchedRows.map(d => d.surname + (d.reg ? " [reg " + d.reg + "]" : "")).join(", ") + ") — check the roster spelling/register" : "") +
      (missing.length ? `. Did not submit: ${missing.join(", ")}` : ".");
    else note += ` ${n} student${n === 1 ? "" : "s"} from responses.`;
    return { tsv: out.join("\n"), mcqIds: mcqCols.map(c => c.id), saqDefs, note, missing, unmatchedRows, unmatchedCols, cols: cols.map(c => ({ id: c.id, kind: c.kind, header: c.header, stem: c.stem })) };
  }

  // ---------- Claude helpers ----------
  async function ask(prompt) {
    if (!(window.claude && window.claude.complete)) throw new Error("Claude isn't available in this view — open the page in the app preview to import.");
    return await window.claude.complete(prompt);
  }
  // Vision-capable ask: sends image blocks alongside a text instruction.
  async function askVision(instruction, imageBlocks) {
    if (!(window.claude && window.claude.complete)) throw new Error("Claude isn't available in this view — open the page in the app preview to import.");
    const content = [{ type: "text", text: instruction }].concat(imageBlocks);
    const out = await window.claude.complete({
      model: "claude-sonnet-4-5",
      max_tokens: 4096,
      messages: [{ role: "user", content: content }]
    });
    return typeof out === "string" ? out : String(out || "");
  }
  function fileToImageBlock(file) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => {
        const b64 = String(r.result).split(",")[1];
        let mt = file.type || "image/png";
        if (!/^image\/(png|jpeg|webp|gif)$/.test(mt)) mt = "image/png";
        res({ type: "image", source: { type: "base64", media_type: mt, data: b64 } });
      };
      r.onerror = () => rej(new Error("Could not read the image file"));
      r.readAsDataURL(file);
    });
  }
  function jsonFrom(txt) {
    if (!txt) return null;
    const a = txt.indexOf("{"), b = txt.lastIndexOf("}");
    if (a < 0 || b < 0) return null;
    try { return JSON.parse(txt.slice(a, b + 1)); } catch (e) { return null; }
  }
  function chunk(a, n) { const o = []; for (let i = 0; i < a.length; i += n) o.push(a.slice(i, i + n)); return o; }

  // MCQ answers from key PDF -> "1: B" lines (only if the paper has MCQ)
  async function structureMcq(keyText) {
    const txt = await ask(
      "From this Primary Science ANSWER KEY text, extract the MULTIPLE-CHOICE answers as JSON mapping question number (string) to the answer EXACTLY as printed in the key — keep the key's own format: if it says 2, write \"2\"; if it says B, write \"B\". Do NOT convert between numbers and letters. " +
      "If the paper has no multiple-choice section, return {}. Output ONLY JSON, e.g. {\"1\":\"2\"}.\n\nTEXT:\n" + keyText.slice(0, 9000));
    const obj = jsonFrom(txt) || {};
    return Object.keys(obj).sort((x, y) => +x - +y).map(q => `${q}: ${String(obj[q]).toUpperCase()}`).join("\n");
  }

  // Fill marking points for known SAQ ids from the answer key PDF
  async function structureMarking(keyText, paperText, saqDefs, onStatus) {
    const groups = chunk(saqDefs, 8), out = {};
    for (let i = 0; i < groups.length; i++) {
      onStatus && onStatus(`Matching answer key… (${i + 1}/${groups.length})`);
      const list = groups[i].map(d => `${d.id} :: ${d.stem}`).join("\n");
      const txt = await ask(
        "Below are structured-question IDs and their stems. From the ANSWER KEY text, give the correct / acceptable answer (marking point) for EACH id. " +
        "Return ONLY JSON mapping the exact id to a concise marking-point string, e.g. {\"1(a)\":\"A and C; B and D\"}. If an id isn't found, use \"\".\n\n" +
        "QUESTIONS:\n" + list + "\n\nANSWER KEY:\n" + keyText.slice(0, 8000) + (paperText ? "\n\nPAPER (context):\n" + paperText.slice(0, 2500) : ""));
      Object.assign(out, jsonFrom(txt) || {});
    }
    saqDefs.forEach(d => { if (out[d.id]) d.marking = out[d.id]; });
    return saqDefs;
  }

  // Fallback: extract open-ended questions from PDFs when no responses file is given
  async function structureOpen(paperText, keyText, onStatus) {
    const base =
      "You extract open-ended sub-questions for a Primary Science feedback tool. Using the QUESTION PAPER (for exact stems) and ANSWER KEY (for marking), output ONE line per sub-question in EXACTLY:\n" +
      "ID | explain OR short | exact question stem | marking point\n" +
      "Keep the paper's own labels (e.g. 1(a), 1(b), 2(a)) — every ID MUST begin with the question number. 'explain' if it asks to explain/why/suggest a reason; else 'short'. " +
      "DO NOT include multiple-choice questions. DO NOT turn a results TABLE into questions: if the paper has a table (e.g. objects listed against 'floats?/sinks?', or a tick-the-box grid), treat the whole table as ONE question using its instruction sentence as the stem — never emit a row/column/cell (like 'Object', 'Object A', a bare 'Yes'/'No', or a column header) as its own question. Skip anything that is not a genuine question a pupil writes an answer to. " +
      "Output as many as fit; if more remain add a final line: MORE: <next-id>. Nothing else.";
    const ctx = "\n\nQUESTION PAPER:\n" + paperText.slice(0, 9000) + "\n\nANSWER KEY:\n" + keyText.slice(0, 7000);
    let lines = [], cursor = "the first sub-question", guard = 0, seen = new Set();
    while (guard++ < 6) {
      onStatus && onStatus(`Reading open-ended questions… (${lines.length} so far)`);
      const txt = await ask(base + "\n\nStart from: " + cursor + "." + ctx);
      let more = null;
      txt.split(/\n+/).forEach(l => {
        l = l.trim();
        const mm = l.match(/^MORE:\s*(.+)$/i);
        if (mm) { more = mm[1].trim(); return; }
        if (l.split("|").length >= 4) { const id = l.split("|")[0].trim(); if (id && !seen.has(id)) { seen.add(id); lines.push(l); } }
      });
      if (!more || seen.has(more)) break;
      cursor = more;
    }
    return lines.join("\n");
  }

  function deriveTopic(filename) {
    if (!filename) return "";
    let s = filename.replace(/\.[a-z0-9]+$/i, "");
    s = s.replace(/\.(docx?|xlsx?|pptx?|pdf)\b/gi, " ");
    s = s.replace(/[_]+/g, " ").replace(/\s+/g, " ");
    s = s.replace(/\b(answer\s*key|answers?|marking\s*scheme|marking|scheme|worksheet|feedback|question\s*paper|paper|exam|test|quiz|revision|practice|responses?|form|sheet|booklet)\b/gi, " ");
    s = s.replace(/\b(p[3-6]|primary\s*[3-6]?|primary|sec(?:tion)?\s*[ab]|sa[12]|ca[12]|mye|eoy|wa[123]|term\s*[1-4]|t[1-4]|20\d{2}|v\d+|final|draft)\b/gi, " ");
    s = s.replace(/\b6[a-z]?\d*\b/gi, " ");
    s = s.replace(/[-–—]+/g, " ").replace(/\s+/g, " ").trim();
    if (!s) return "";
    return s.split(" ").filter(Boolean).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
  }

  async function detectMeta(text) {
    try {
      const txt = await ask(
        "From this Primary Science worksheet/answer-key text, identify the science TOPIC (e.g. Forces, Heat, Adaptations, Cells, Electricity) and the SCHOOL name if present. " +
        "Return ONLY JSON like {\"topic\":\"Adaptations\",\"school\":\"\"}. Use \"\" if unknown.\n\nTEXT:\n" + (text || "").slice(0, 3000));
      return jsonFrom(txt) || {};
    } catch (e) { return {}; }
  }

  // Upscale + grayscale + contrast-stretch an image so Tesseract reads it far better.
  async function preprocessImage(file) {
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = url; });
      const maxW = 2200;                                   // upscale small photos, cap huge ones
      const scale = Math.min(3, Math.max(1, maxW / img.naturalWidth));
      const w = Math.round(img.naturalWidth * scale), h = Math.round(img.naturalHeight * scale);
      const c = document.createElement("canvas"); c.width = w; c.height = h;
      const ctx = c.getContext("2d"); ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, w, h);
      const id = ctx.getImageData(0, 0, w, h), d = id.data;
      // grayscale + find min/max for contrast stretch
      let mn = 255, mx = 0;
      for (let i = 0; i < d.length; i += 4) { const g = (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114) | 0; d[i] = d[i + 1] = d[i + 2] = g; if (g < mn) mn = g; if (g > mx) mx = g; }
      const range = Math.max(1, mx - mn);
      for (let i = 0; i < d.length; i += 4) { let v = (d[i] - mn) * 255 / range; v = v < 0 ? 0 : v > 255 ? 255 : v; const o = v < 128 ? v * 0.6 : 255 - (255 - v) * 0.6; d[i] = d[i + 1] = d[i + 2] = o; }
      ctx.putImageData(id, 0, 0);
      return await new Promise(res => c.toBlob(b => res(b), "image/png"));
    } finally { URL.revokeObjectURL(url); }
  }

  // Image class list -> STRUCTURED students in ONE Claude vision pass (no OCR engine,
  // no lossy text round-trip). Returns [{name, reg}] read directly from the picture.
  async function classlistFromImage(file, onStatus) {
    onStatus && onStatus("Reading class list with Claude vision…");
    const block = await fileToImageBlock(file);
    const raw = await askVision(
      "You are reading a primary-school CLASS LIST from this image with your vision. It is normally a table with a running-number column (headed 'No', 'S/N', 'Index' or 'Register') and a name column (headed 'Name'). " +
      "Return a JSON array with ONE object per pupil, in the order shown: {\"reg\":\"<the running/index number, digits only>\",\"name\":\"<the pupil's name EXACTLY as printed>\"}. " +
      "Read EVERY row to the very end — if the list numbers up to 26, return all 26 objects. Do not stop early, skip, merge, deduplicate, or summarise. Preserve spacing and multi-word names (e.g. \"BAO QUAN\", \"JUN HAO\"). " +
      "Ignore the header row and any title/date/totals. Return ONLY the JSON array, nothing else.",
      [block]
    );
    let txt = String(raw || "").trim();
    if (txt.indexOf("```") >= 0) { const parts = txt.replace(/```json/gi, "```").split("```").filter(x => x.trim()); const blk = parts.find(x => x.trim().startsWith("[")); if (blk) txt = blk; }
    const a = txt.indexOf("["), b = txt.lastIndexOf("]");
    if (a < 0 || b < 0) return [];
    let arr;
    try { arr = JSON.parse(txt.slice(a, b + 1)); } catch (e) { return []; }
    return (Array.isArray(arr) ? arr : [])
      .map(o => ({ name: String((o && (o.name || o.surname)) || "").trim(), reg: String((o && (o.reg || o.register)) || "").replace(/\D/g, "") }))
      .filter(o => o.name);
  }
  // Back-compat text path (PDF class lists still go text -> extractClasslist).
  async function imageText(file, onStatus) {
    const students = await classlistFromImage(file, onStatus);
    return students.map(s => s.name + (s.reg ? " | " + s.reg : "")).join("\n");
  }
  // PDF or image -> plain text (used for the class list)
  async function rosterText(file, onStatus) {
    const name = (file.name || "").toLowerCase();
    if (/\.(png|jpe?g|webp|gif|bmp|heic|heif)$/.test(name) || (file.type || "").startsWith("image/")) {
      return await imageText(file, onStatus);
    }
    return await pdfText(file);
  }

  // Class list PDF/IMAGE text -> { students:[{name,className}], lines, rawChars }
  async function extractClasslist(pdfTextStr) {
    const text = pdfTextStr || "";
    const liveLines = text.split(/\n/).map(l => l.trim()).filter(Boolean);
    const groups = chunk(liveLines, 50);
    const all = [];
    for (let i = 0; i < groups.length && i < 8; i++) {
      let txt;
      try {
        txt = await ask(
          "This is text from a primary-school CLASS LIST (it may be messy OCR from a photo). Extract EVERY student as a JSON array of objects {\"surname\":\"\",\"register\":\"\"}. " +
          "The register/index number is the number beside each pupil (e.g. '12'). The surname is the pupil's family name. If only a full name is shown, use the family name as the surname. " +
          "Fix obvious OCR spacing but do not invent entries. Ignore headers, dates, totals and column titles. Return ONLY the JSON array, nothing else.\n\nTEXT:\n" + groups[i].join("\n"));
      } catch (e) { continue; }
      // tolerate code fences / stray prose around the array
      let body = txt.replace(/```json/gi, "```").split("```").filter(x => x.trim());
      let cand = txt.indexOf("[") >= 0 ? txt : (body[0] || "");
      if (txt.indexOf("```") >= 0) { const blk = body.find(x => x.trim().startsWith("[")); if (blk) cand = blk; }
      const a = cand.indexOf("["), b = cand.lastIndexOf("]");
      if (a >= 0 && b >= 0) {
        try {
          const arr = JSON.parse(cand.slice(a, b + 1));
          arr.forEach(o => { const sn = o && (o.surname || o.name || o.Name); if (sn) all.push({ name: String(sn).trim(), reg: String(o.register || o.reg || o.index || o.no || "").trim() }); });
        } catch (e) {}
      }
    }
    const seen = new Set(), out = [];
    all.forEach(s => { const k = s.name.toLowerCase().replace(/[^a-z\s]/g, "").replace(/\s+/g, " ").trim() + "#" + (s.reg || ""); if (s.name && !seen.has(k)) { seen.add(k); out.push(s); } });
    return { students: out, lines: liveLines.length, rawChars: text.trim().length };
  }

  window.FeedbackImport = { pdfText, paperPages, findQuestionPage, responsesText, parseTable, scanResponses, structureMcq, structureMarking, structureOpen, extractClasslist, classlistFromImage, rosterText, imageText, deriveTopic, detectMeta };
})();
