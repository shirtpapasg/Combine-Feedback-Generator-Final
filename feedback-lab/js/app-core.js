/* Science Feedback Lab — main app.
   Teacher pastes an answer key + Google-Sheet responses (or uses the seeded
   P6 Forces sample), Claude generates feedback per student (feedback only —
   no scores/ticks), shown in one of three layouts, exportable to a Google Doc
   via Apps Script. */
(function () {
  const e = React.createElement;
  const { useState, useEffect, useRef } = React;
  const DS = window.ScienceClawDesignSystem_0049d4;
  const { Panel, Button, SegmentedControl, Badge, ProgressBar } = DS;

  // ---------- serialize / parse (Setup editing) ----------
  const serKey = (k) => Object.keys(k).map(q => `${q}: ${k[q]}`).join("\n");
  const parseKey = (t) => { const o = {}; t.split(/\n+/).forEach(l => { const m = l.match(/^\s*(\d+)\s*[:,\t ]\s*([A-Da-d1-4])/); if (m) o[m[1]] = m[2].toUpperCase(); }); return o; };
  const serOpen = (defs) => defs.map(d => `${d.id} | ${d.type} | ${d.stem} | ${d.marking}`).join("\n");
  const parseOpen = (t) => t.split(/\n+/).map(l => { const p = l.split("|").map(s => s.trim()); if (p.length < 4 || !p[0]) return null; return { id: p[0], type: /expl/i.test(p[1]) ? "explain" : "short", stem: p[2], marking: p.slice(3).join(" | ") }; }).filter(Boolean).filter(d => /^\d/.test(d.id) && d.stem && !/^(yes|no|true|false)$/i.test(d.stem));
  function splitRowCore(line, sep) {
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
  function serStudents(students, mcqKey, defs) {
    const mcqIds = Object.keys(mcqKey || {});
    const cols = ["Name", "Register"].concat(mcqIds.map(id => "MCQ" + id)).concat(defs.map(d => d.id));
    const rows = students.map(s => [s.name, s.className]
      .concat(mcqIds.map(id => s.mcq[id] || ""))
      .concat(defs.map(d => (s.open[d.id] || "").replace(/\t|\n/g, " "))));
    return [cols.join("\t")].concat(rows.map(r => r.join("\t"))).join("\n");
  }
  function parseStudents(t, defs) {
    const lines = t.replace(/\r/g, "").split("\n").filter(l => l.trim());
    if (!lines.length) return [];
    const sep = lines[0].includes("\t") ? "\t" : ",";
    const head = splitRowCore(lines[0], sep).map(h => h.trim());
    const lower = head.map(h => h.toLowerCase());
    const find = (re) => lower.findIndex(h => re.test(h));
    let nameI = find(/^name$/); if (nameI < 0) nameI = find(/\bname\b/); if (nameI < 0) nameI = 0;
    let classI = find(/^register$/); if (classI < 0) classI = find(/^class$/); if (classI < 0) classI = find(/\bregister\b|\bclass\b|\bindex\b/); if (classI < 0) classI = 1;
    const defIds = defs.map(d => d.id), defLower = defIds.map(s => s.toLowerCase());
    const roles = head.map((h, i) => {
      if (i === nameI || i === classI) return null;
      const hl = lower[i];
      const dm = hl.match(/^mcq\s*(.+)$/); if (dm) return { kind: "mcq", id: dm[1].trim() };
      const di = defLower.indexOf(hl); if (di >= 0) return { kind: "open", id: defIds[di] };
      if (/^\d+$/.test(hl)) return { kind: "mcq", id: hl };
      return null;
    });
    return lines.slice(1).map(line => {
      const c = splitRowCore(line, sep);
      const mcq = {}, open = {};
      roles.forEach((r, i) => {
        if (!r) return;
        const v = (c[i] == null ? "" : String(c[i])).trim();
        // never let a blank duplicate column wipe out a real answer under the same id
        if (r.kind === "mcq") { if (v || !(mcq[r.id] || "").trim()) mcq[r.id] = v.toUpperCase(); }
        else { if (v || !(open[r.id] || "").trim()) open[r.id] = v; }
      });
      return { name: (c[nameI] || "").trim(), className: (c[classI] || "").trim(), mcq, open };
    }).filter(s => s.name);
  }

  // ---------- Claude generation ----------
  function extractJSON(txt) {
    if (!txt) return null;
    let s = txt.replace(/```json/gi, "```").split("```").filter(x => x.trim());
    let cand = txt.indexOf("{") >= 0 ? txt : (s[0] || "");
    if (txt.indexOf("```") >= 0) { const blk = s.find(x => x.trim().startsWith("{")); if (blk) cand = blk; }
    const a = cand.indexOf("{"), b = cand.lastIndexOf("}");
    if (a < 0 || b < 0) return null;
    try { return JSON.parse(cand.slice(a, b + 1)); } catch (err) { return null; }
  }
  function chunk(arr, n) { const out = []; for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n)); return out; }

  // Normalize an MCQ choice to a canonical letter A–D so a key ("B") matches a
  // response stored as "(2) …", "2", "b", "Option 2", etc. Returns "" if unknown.
  const L2N = { A: "1", B: "2", C: "3", D: "4" };
  function normChoice(v) {
    if (v == null) return "";
    let s = String(v).trim();
    if (!s) return "";
    let m = s.match(/^\(?\s*([A-Da-d1-4])\s*\)?[\.\)\:\s]/) || s.match(/^\(?\s*([A-Da-d1-4])\s*\)?$/);
    if (!m) m = s.match(/option\s*\(?\s*([A-Da-d1-4])/i);
    if (!m) return s.toUpperCase();            // no leading marker — compare full text
    let c = m[1].toUpperCase();
    if (/[1-4]/.test(c)) { const inv = { "1": "A", "2": "B", "3": "C", "4": "D" }; return inv[c]; }
    return c;
  }
  const sameChoice = (a, b) => { const x = normChoice(a), y = normChoice(b); if (!x || !y) return false; if (x === y) return true; return (L2N[x] || x) === (L2N[y] || y); };

  async function generateStudent(student, mcqKey, openDefs, onProgress) {
    const wrongMcq = Object.keys(mcqKey).filter(q => !sameChoice(student.mcq[q], mcqKey[q]));  // includes unanswered — they get feedback too
    // also count truly blank MCQ as wrong-to-revisit? keep to chosen-but-wrong to match samples
    const groups = chunk(openDefs, 5);
    let mcq = [], open = [];
    for (let gi = 0; gi < groups.length; gi++) {
      const { system, user } = window.buildPrompt(student, mcqKey, groups[gi], gi === 0 ? wrongMcq : []);
      onProgress && onProgress(`Writing feedback… (${gi + 1}/${groups.length})`);
      let parsed = null, tries = 0;
      while (!parsed && tries < 2) {
        tries++;
        try {
          const txt = await window.claude.complete(system + "\n\n" + user + "\n\nRespond with ONLY the JSON object. Keep each field to one or two short sentences.");
          parsed = extractJSON(txt);
        } catch (err) { parsed = null; }
      }
      if (parsed) { if (gi === 0 && Array.isArray(parsed.mcq)) mcq = parsed.mcq; if (Array.isArray(parsed.open)) open = open.concat(parsed.open); }
    }
    // A reply that omits "mcq" used to fall back to one canned line repeated for every
    // question — ask again for just the MCQs rather than printing filler.
    if (wrongMcq.length && !mcq.length) {
      const stems = window.__mcqStems || {};
      const list = wrongMcq.map(q => `- Q${q}: pupil chose ${student.mcq[q] || "(blank)"}` +
        (stems[String(q)] ? `\n  QUESTION: ${String(stems[String(q)]).slice(0, 420)}` : "")).join("\n");
      for (let t = 0; t < 2 && !mcq.length; t++) {
        onProgress && onProgress("Writing MCQ feedback…");
        try {
          const txt = await window.claude.complete(
            "You are a warm Primary 6 Science teacher in Singapore. For EACH wrong multiple-choice question below, write feedback about THAT question's science — never a guessed topic, and never reveal the correct option.\n" +
            "Return STRICT JSON only: {\"mcq\":[{\"q\":\"3\",\"error\":\"what idea was likely confused\",\"hint\":\"a question that nudges their thinking\"}]}\n\n" + list);
          const p2 = extractJSON(txt);
          if (p2 && Array.isArray(p2.mcq)) mcq = p2.mcq;
        } catch (e) {}
      }
    }
    // normalize: authoritative stem/answer/type from our data; status/text from Claude
    const byId = {}; open.forEach(o => { byId[o.q] = o; });
    const normOpen = openDefs.map(d => {
      const c = byId[d.id] || {};
      const ans = (student.open[d.id] || "").trim();
      let status = c.status;
      if (!status) status = ans ? "incorrect" : "blank";
      if (!ans) status = "blank";
      return {
        q: d.id, type: d.type, stem: d.stem, studentAnswer: ans,
        status,
        praise: c.praise || (status === "correct" ? "Well done — correct." : ""),
        error: c.error || "", hint: c.hint || "",
        ponder: c.ponder || (status === "blank"
          ? "Re-read the question and note the key science idea it is testing, then write what you know about it — you can do this!"
          : "")
      };
    });
    const mcqNorm = wrongMcq.map(q => { const f = mcq.find(m => String(m.q) === String(q)) || {}; const chosen = (student.mcq[q] || "").trim(); return { q: String(q), chosen, unanswered: !chosen, correct: (mcqKey[q] || "").trim(), error: f.error || "", hint: f.hint || (chosen ? "Re-read this question and check which science idea it is really testing." : "This question was left unanswered — read it again and complete the correction below.") }; });
    const mcqCorrect = Object.keys(mcqKey).filter(q => (student.mcq[q] || "").trim() !== "" && sameChoice(student.mcq[q], mcqKey[q])).sort((a, b) => +a - +b);
    const mcqBlank = Object.keys(mcqKey).filter(q => !(student.mcq[q] || "").trim()).sort((a, b) => +a - +b);
    return { name: student.name, className: student.className, mcq: mcqNorm, mcqCorrect, mcqBlank, open: normOpen };
  }

  // ---------- Export helpers ----------
  const escHtml = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const mcqText = (m) => m.text != null ? m.text : [m.error, m.hint].filter(Boolean).join(" ");
  const qlab = (id) => /^\d/.test(String(id)) ? "Q" + id : String(id);

  // ---------- Export: Microsoft Word (.doc, opens in Word & Google Docs) ----------
  // Reliable Word pagination: a dedicated break paragraph BEFORE each student
  // (except the first). Class-based `page-break-before` on <div> is ignored by
  // Word in places, which caused stray mid-student breaks — this fixes it.
  const WORD_BREAK = "<p class=\"pgbreak\" style=\"page-break-before:always;mso-special-character:line-break;\">&nbsp;</p>";
  function buildWordDoc(results, meta) {
    const body = results.map(function (fb, n) {
      const p = [];
      if (n > 0) p.push(WORD_BREAK);
      p.push("<div class=\"student\">");
      p.push('<p class="school">' + escHtml(meta.school) + "</p>");
      p.push('<p class="sub">Primary Six &nbsp; Topic: ' + escHtml(meta.topic) + " &nbsp; Feedback Form</p>");
      p.push("<h1>" + (n + 1) + ". " + escHtml((fb.name || "").toUpperCase()) + (fb.className ? " (Reg No. " + escHtml(fb.className) + ")" : "") + "</h1>");
      const mcqArr = fb.mcq || [], openArr = fb.open || [];
      const answeredWrong = mcqArr.filter(function (m) { return !m.unanswered; });
      p.push("<p><b>Incorrect MCQ List: </b>" + (answeredWrong.length ? escHtml(answeredWrong.map(function (m) { return m.q; }).join(", ")) : "None &mdash; well done!") + "</p>");
      if (fb.mcqCorrect && fb.mcqCorrect.length) p.push("<p><b>Correct MCQ: </b>Q" + escHtml(fb.mcqCorrect.join(", Q")) + " ✓</p>");
      if (fb.mcqBlank && fb.mcqBlank.length) p.push("<p><b>MCQ not answered: </b>Q" + escHtml(fb.mcqBlank.join(", Q")) + "</p>");
      if (mcqArr.length) {
        p.push('<p class="bh">MCQ Feedback (questions to relook at):</p>');
        mcqArr.forEach(function (m) {
          var ans = m.chosen ? "<b>Your answer:</b> &ldquo;" + escHtml(m.chosen) + "&rdquo; &mdash; " : (m.unanswered ? "<b>Not answered</b> &mdash; " : "");
          p.push('<p class="li"><b>' + escHtml(qlab(m.q)) + ":</b> " + ans + escHtml(mcqText(m) || "Take another look at this one.") + "</p>");
        });
      }
      var wrongOpen = openArr.filter(function (o) { return o.status !== "correct"; });
      if (wrongOpen.length) {
        p.push('<p class="bh">SAQ Feedback (structured questions answered incorrectly):</p>');
        wrongOpen.forEach(function (o) {
          p.push('<p class="flag">' + escHtml(qlab(o.q)) + " &mdash; " + (o.status === "blank" ? "Not attempted" : o.status === "partial" ? "Almost there! — partially correct" : "Incorrect") + "</p>");
          p.push("<p><b>Question Stem: </b>" + escHtml(o.stem) + "</p>");
          p.push("<p><b>Your answer: </b>" + (o.studentAnswer ? ("&ldquo;" + escHtml(o.studentAnswer) + "&rdquo;") : "<i>No answer submitted</i>") + "</p>");
          if (o.error) p.push("<p><b>Scientific Error: </b>" + escHtml(o.error) + "</p>");
          if (o.ponder) p.push("<p><b>Question to ponder: </b>" + escHtml(o.ponder) + "</p>");
          p.push("<p><b>Correction:</b></p><p>&nbsp;</p><p>&nbsp;</p>");
        });
      }
      var correctOpen = openArr.filter(function (o) { return o.status === "correct"; });
      if (correctOpen.length) {
        p.push('<p class="bh">Detailed Feedback for Correct Questions:</p>');
        correctOpen.forEach(function (o) { p.push('<p class="li">' + escHtml(o.q) + ": " + escHtml(o.praise || "Well done — correct.") + "</p>"); });
      }
      if (fb.note) p.push('<p class="note"><b>Teacher\u2019s note: </b>' + escHtml(fb.note) + "</p>");
      p.push("</div>");
      return p.join("");
    }).join("");
    return '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">' +
      '<head><meta charset="utf-8"><title>' + escHtml(meta.school + " — " + meta.topic + " Feedback") + "</title>" +
      "<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->" +
      "<style>@page{size:A4;margin:2cm;} " +
      "body{font-family:Calibri,Arial,sans-serif;font-size:11pt;color:#1c2430;line-height:1.5;} " +
      ".pgbreak{margin:0;font-size:1pt;line-height:1pt;} " +
      "h1{font-size:15pt;margin:8pt 0 4pt;} .school{font-size:14pt;font-weight:bold;margin:0;} " +
      ".sub{margin:0 0 6pt;color:#444;} .bh{font-weight:bold;margin:10pt 0 2pt;} " +
      ".li{margin:2pt 0 2pt 18pt;} .flag{font-weight:bold;margin:8pt 0 2pt;} " +
      ".note{margin-top:10pt;border-top:1px solid #999;padding-top:6pt;} p{margin:3pt 0;}</style>" +
      "</head><body>" + body + "</body></html>";
  }

  // ---------- Export: Google Apps Script ----------
  function buildAppsScript(results, meta) {
    const data = JSON.stringify(results);
    return `/**
 * ${meta.school} — ${meta.topic} feedback.
 * Paste into Google Apps Script (script.google.com), run createFeedbackDoc().
 * One Google Doc, one page per student (feedback only — no marks), including your manual edits.
 */
function createFeedbackDoc() {
  var results = ${data};
  var H = DocumentApp.ParagraphHeading;
  var doc = DocumentApp.create(${JSON.stringify(meta.school + " — " + meta.topic + " Feedback")});
  var body = doc.getBody();
  results.forEach(function (fb, n) {
    if (n > 0) body.appendPageBreak();
    body.appendParagraph(${JSON.stringify(meta.school)}).setHeading(H.TITLE);
    body.appendParagraph(${JSON.stringify("Primary Six   Topic: " + meta.topic + "   Feedback Form")});
    body.appendParagraph((n + 1) + ". " + fb.name.toUpperCase() + (fb.className ? " (Reg No. " + fb.className + ")" : "")).setHeading(H.HEADING1);
    body.appendParagraph("Incorrect MCQ List: " + (fb.mcq.filter(function (m) { return !m.unanswered; }).map(function (m) { return m.q; }).join(", ") || "None"));
    if (fb.mcqCorrect && fb.mcqCorrect.length) body.appendParagraph("Correct MCQ: Q" + fb.mcqCorrect.join(", Q"));
    if (fb.mcqBlank && fb.mcqBlank.length) body.appendParagraph("MCQ not answered: Q" + fb.mcqBlank.join(", Q"));
    if (fb.mcq.length) {
      body.appendParagraph("MCQ Feedback (questions to relook at):").setHeading(H.HEADING2);
      fb.mcq.forEach(function (m) { var ans = m.chosen ? "Your answer: \u201C" + m.chosen + "\u201D \u2014 " : (m.unanswered ? "Not answered \u2014 " : ""); body.appendListItem(qlab(m.q) + ": " + ans + (m.text || [m.error, m.hint].filter(String).join(" "))); });
    }
    var wrongOpen = fb.open.filter(function (o) { return o.status !== "correct"; });
    if (wrongOpen.length) {
      body.appendParagraph("SAQ Feedback (answered incorrectly)").setHeading(H.HEADING2);
      wrongOpen.forEach(function (o) {
        body.appendParagraph(qlab(o.q) + " \u2014 " + (o.status === "blank" ? "Not attempted" : o.status === "partial" ? "Almost there! \u2014 partially correct" : "Incorrect")).setHeading(H.HEADING3);
        body.appendParagraph("Question Stem: " + o.stem);
        body.appendParagraph("Your answer: " + (o.studentAnswer ? ("\u201C" + o.studentAnswer + "\u201D") : "No answer submitted"));
        if (o.error) body.appendParagraph("Scientific Error: " + o.error);
        if (o.ponder) body.appendParagraph("Question to ponder: " + o.ponder);
        body.appendParagraph("Correction:"); body.appendParagraph(""); body.appendParagraph("");
      });
    }
    var correctOpen = fb.open.filter(function (o) { return o.status === "correct"; });
    if (correctOpen.length) {
      body.appendParagraph("Detailed Feedback for Correct Questions").setHeading(H.HEADING2);
      correctOpen.forEach(function (o) { body.appendListItem(o.q + ": " + o.praise); });
    }
    if (fb.note) body.appendParagraph("Teacher's note: " + fb.note);
  });
  doc.saveAndClose();
  Logger.log("Created: " + doc.getUrl());
}`;
  }

  // MCQ stems, kept so feedback can talk about the actual question rather than a
  // guessed topic. Survives reload because the scan only runs on import.
  function rememberMcqStems(cols) {
    const map = {};
    (cols || []).forEach(c => { if (c && c.kind === "mcq" && c.stem) map[String(c.id)] = c.stem; });
    window.__mcqStems = map;
    try { localStorage.setItem("sfl-mcq-stems", JSON.stringify(map)); } catch (e) {}
  }
  try { window.__mcqStems = JSON.parse(localStorage.getItem("sfl-mcq-stems")) || {}; } catch (e) { window.__mcqStems = {}; }

  window.FeedbackApp = { generateStudent, buildAppsScript, buildWordDoc, serKey, parseKey, serOpen, parseOpen, serStudents, parseStudents, sameChoice, normChoice, rememberMcqStems };
})();
