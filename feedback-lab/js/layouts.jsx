/* Three feedback layouts. Each takes { fb } where fb is the normalized
   per-student feedback the app builds from Claude's JSON + the question defs:
   fb = { name, className, paper, school, incorrectList:[ "3","31b",... ],
          mcq:[{q,error,hint}],
          open:[{q,status,type,stem,studentAnswer,praise,error,ponder,hint,startingPoint}] } */
(function () {
  const e = React.createElement;

  // Inline-editable text: teacher clicks any feedback field and types; saved on blur.
  function EditableText({ value, onSave, placeholder }) {
    return e("span", {
      className: "ed",
      contentEditable: true,
      suppressContentEditableWarning: true,
      "data-ph": placeholder || "Click to edit…",
      onInput: () => {},
      onBlur: (ev) => {
        const t = ev.currentTarget.innerText.replace(/\u00a0/g, " ").replace(/\s+$/,"").trim();
        if (t !== (value || "")) onSave(t);
      }
    }, value || "");
  }

  // shared bits ---------------------------------------------------------
  function CorrectionBox() {
    return e("div", { className: "fb-correction" },
      e("span", { className: "fb-correction-label" }, "Correction:"),
      e("div", { className: "fb-correction-space" })
    );
  }
  function Ponder({ text }) {
    if (!text) return null;
    return e("div", { className: "fb-ponder" },
      e("span", { className: "fb-ponder-tag" }, "Question to ponder"),
      e("span", { className: "fb-ponder-text" }, " " + text)
    );
  }
  const blanks = (o) => o.filter(x => x.status === "blank");
  const wrong = (o) => o.filter(x => x.status === "incorrect");
  const right = (o) => o.filter(x => x.status === "correct");
  const openRange = (o) => o.length ? `${o[0].q} to ${o[o.length - 1].q}` : "";

  // === LAYOUT A — Nan Hua / Forces document =========================
  function LayoutForces({ fb, index, editable, onEdit }) {
    onEdit = onEdit || function () {};
    const T = (val, spec, ph) => editable
      ? e(EditableText, { value: val, placeholder: ph, onSave: (v) => onEdit(Object.assign({}, spec, { value: v })) })
      : (val || "");
    const mtext = (m) => m.text != null ? m.text : [m.error, m.hint].filter(Boolean).join(" ");
    const qlabel = (id) => /^\d/.test(String(id)) ? "Q" + id : String(id);
    return e("div", { className: "lay lay-forces" },
      e("div", { className: "lf-head" },
        e("div", { className: "lf-school" }, fb.school || "School Name"),
        e("div", { className: "lf-sub" }, `Primary Six   Topic: ${fb.topic || "Science"}`),
        e("div", { className: "lf-sub" }, "Feedback Form")
      ),
      e("div", { className: "lf-name" }, `${index != null ? index + ". " : ""}${fb.name.toUpperCase()}${fb.className ? " (Reg No. " + fb.className + ")" : ""}`),
      e("div", { className: "lf-incorrect" },
        e("strong", null, "Incorrect MCQ List: "),
        fb.mcq.filter(m => !m.unanswered).length ? fb.mcq.filter(m => !m.unanswered).map(m => m.q).join(", ") : "None — well done!"),
      fb.mcqCorrect && fb.mcqCorrect.length ? e("div", { className: "lf-incorrect" },
        e("strong", null, "Correct MCQ: "),
        "Q" + fb.mcqCorrect.join(", Q") + " ✓") : null,
      fb.mcqBlank && fb.mcqBlank.length ? e("div", { className: "lf-incorrect" },
        e("strong", null, "MCQ not answered: "),
        "Q" + fb.mcqBlank.join(", Q")) : null,

      fb.mcq.length ? e("div", { className: "lf-block" },
        e("div", { className: "lf-bullet-head" }, "● MCQ Feedback (questions to relook at):"),
        fb.mcq.map((m, i) => e("div", { className: "lf-sub-bullet", key: m.q + "#" + i },
          e("span", { className: "lf-q" }, `${qlabel(m.q)}${m.unanswered ? " (not answered)" : ""}: `),
          m.chosen ? e("span", { className: "fb-quote" }, `Your answer: “${m.chosen}” — `) : null,
          e("span", null, T(mtext(m), { kind: "mcq", id: m.q, field: "text" }, "Add feedback for this MCQ…")))
        )
      ) : null,

      fb.open.some(o => o.status !== "correct") ? e("div", { className: "lf-block" },
        e("div", { className: "lf-bullet-head" }, "● SAQ Feedback (structured questions answered incorrectly):"),
        fb.open.filter(o => o.status !== "correct").map((o, i) =>
          e("div", { className: "lf-detail", key: o.q + "#" + i },
            e("div", { className: "lf-sub-bullet" },
              e("span", { className: "lf-q" }, `${qlabel(o.q)}: `),
              e("span", { className: "lf-flag" + (o.status === "partial" ? " lf-flag-partial" : "") }, o.status === "blank" ? "Not attempted" : o.status === "partial" ? "Almost there! — partially correct" : "Incorrect")),
            e("div", { className: "lf-rows" },
              e("div", null, e("strong", null, "Question Stem: "), T(o.stem, { kind: "open", id: o.q, field: "stem" }, "Question stem…")),
              e("div", null, e("strong", null, "Your answer: "),
                o.studentAnswer
                  ? e("span", { className: "fb-quote" }, `“${o.studentAnswer}”`)
                  : e("span", { className: "fb-blank" }, "No answer submitted")),
              e("div", null, e("strong", null, "Scientific Error: "), T(o.error, { kind: "open", id: o.q, field: "error" }, "Explain the science error…")),
              editable
                ? (o.ponder
                    ? e("div", { className: "fb-ponder" }, e("span", { className: "fb-ponder-tag" }, "Question to ponder"),
                        e("span", { className: "fb-ponder-text" }, " ", T(o.ponder, { kind: "open", id: o.q, field: "ponder" }, "Add a question to ponder…")))
                    // an empty "Question to ponder" label reads as a missing answer, so
                    // offer it as an opt-in instead of printing a blank heading
                    : e("div", { className: "fb-ponder fb-ponder-add" },
                        e("span", { className: "fb-ponder-text" }, T("", { kind: "open", id: o.q, field: "ponder" }, "+ Add a question to ponder")))) 
                : (o.ponder ? e(Ponder, { text: o.ponder }) : null),
              e(CorrectionBox)
            )))
      ) : null,

      fb.open.some(o => o.status === "correct") ? e("div", { className: "lf-block" },
        e("div", { className: "lf-bullet-head" }, "● Detailed Feedback for Correct Questions:"),
        fb.open.filter(o => o.status === "correct").map((o, i) =>
          e("div", { className: "lf-sub-bullet", key: o.q + "#" + i },
            e("span", { className: "lf-q" }, `${qlabel(o.q)}: `),
            e("span", { className: "lf-praise" }, T(o.praise, { kind: "open", id: o.q, field: "praise" }, "Add praise…"))))
      ) : null,
      (editable || fb.note)
        ? e("div", { className: "lf-note" }, e("strong", null, "Teacher’s note: "), T(fb.note, { kind: "note" }, "Add a personal note to this pupil…"))
        : null
    );
  }

  // === LAYOUT B — Focus (white page; pick from dropdown, others fly away) =====
  function LayoutFocus({ fb }) {
    const { useState } = React;
    const items = []
      .concat(fb.mcq.map(m => ({ id: "MCQ" + m.q, kind: "mcq", data: m, label: "Q" + m.q + " — multiple choice" + (m.unanswered ? " (not answered)" : "") })))
      .concat(fb.open.map(o => ({ id: o.q, kind: "open", data: o,
        label: o.q + ". " + (o.stem.length > 52 ? o.stem.slice(0, 52) + "…" : o.stem) })))
      .map((it, i) => Object.assign(it, { uid: it.id + "#" + i }));  // unique even if ids repeat
    const [focusId, setFocusId] = useState("");

    function block(it) {
      if (it.kind === "mcq") {
        const m = it.data;
        return e("div", { className: "fd-rows" },
          e("div", { className: "fd-qstem" }, "Question " + m.q + " · multiple choice" + (m.unanswered ? " · not answered" : "")),
          e("div", null, e("strong", null, "Feedback: "), m.text != null ? m.text : [m.error, m.hint].filter(Boolean).join(" ")));
      }
      const o = it.data;
      if (o.status === "correct")
        return e("div", { className: "fd-rows" },
          e("div", { className: "fd-qstem" }, o.q + ". " + o.stem),
          o.studentAnswer ? e("div", null, e("strong", null, "Your answer: "), e("span", { className: "fb-quote" }, "“" + o.studentAnswer + "”")) : null,
          e("div", { className: "fd-praise" }, o.praise));
      return e("div", { className: "fd-rows" },
        e("div", { className: "fd-qstem" }, o.q + ". " + o.stem + (o.status === "partial" ? "  ·  Almost there!" : "")),
        e("div", null, e("strong", null, "Your answer: "),
          o.studentAnswer ? e("span", { className: "fb-quote" }, "“" + o.studentAnswer + "”") : e("span", { className: "fb-blank" }, "No answer submitted")),
        o.status !== "blank" && o.error ? e("div", null, e("strong", null, "Scientific Error: "), o.error) : null,
        o.ponder ? e(Ponder, { text: o.ponder }) : null,
        o.hint && !o.ponder ? e("div", null, e("strong", null, "Hint: "), o.hint) : null,
        e(CorrectionBox)
      );
    }

    return e("div", { className: "lay lay-focusdoc" },
      e("div", { className: "fd-bar" },
        e("span", { className: "fd-hint" }, focusId
          ? "Double-click to bring all questions back"
          : "Double-click any question to focus on it")),
      e("div", { className: "fd-paper" },
        e("div", { className: "fd-head" },
          e("div", { className: "fd-name" }, fb.name + (fb.className ? "  ·  Reg No. " + fb.className : "")),
          e("div", { className: "fd-sub" }, (fb.topic || "Science") + " — Feedback")),
        e("div", { className: "fd-list" + (focusId ? " focusing" : "") },
          items.map((it, i) => {
            const out = focusId && it.uid !== focusId;
            const solo = focusId && it.uid === focusId;
            return e("div", {
              key: it.uid,
              className: "fd-block" + (out ? " out" : "") + (solo ? " solo" : ""),
              style: { "--fly": i % 2 ? "130%" : "-130%" },
              onDoubleClick: () => setFocusId(focusId === it.uid ? "" : it.uid)
            }, block(it));
          }))
      )
    );
  }

  window.FeedbackLayouts = { forces: LayoutForces, focus: LayoutFocus };
})();
