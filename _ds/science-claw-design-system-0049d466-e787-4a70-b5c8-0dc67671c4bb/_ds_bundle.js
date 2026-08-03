/* @ds-bundle: {"format":3,"namespace":"ScienceClawDesignSystem_0049d4","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"CollectionItem","sourcePath":"components/core/CollectionItem.jsx"},{"name":"Panel","sourcePath":"components/core/Panel.jsx"},{"name":"ProgressBar","sourcePath":"components/core/ProgressBar.jsx"},{"name":"QuizOption","sourcePath":"components/core/QuizOption.jsx"},{"name":"SegmentedControl","sourcePath":"components/core/SegmentedControl.jsx"},{"name":"StatRow","sourcePath":"components/core/StatRow.jsx"}],"sourceHashes":{"components/core/Badge.jsx":"cee46e10815d","components/core/Button.jsx":"731f6a928030","components/core/CollectionItem.jsx":"556c7a082211","components/core/Panel.jsx":"a6600ab83d25","components/core/ProgressBar.jsx":"75f10d8294db","components/core/QuizOption.jsx":"c1278f5c7331","components/core/SegmentedControl.jsx":"d8b4870c00c5","components/core/StatRow.jsx":"c501fb53932f","ui_kits/game/App.jsx":"98de088e72eb","ui_kits/game/ClawScene.jsx":"49496c6905ae","ui_kits/game/GameScreen.jsx":"4141fae5be51","ui_kits/game/LoginScreen.jsx":"befa1f8e026b","ui_kits/game/QuizModal.jsx":"79b395e8134a","ui_kits/game/sound.js":"d6776dc6ff62"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.ScienceClawDesignSystem_0049d4 = window.ScienceClawDesignSystem_0049d4 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Badge.jsx
try { (() => {
/**
 * Badge — small status pill. Used for credit rewards (+3), achievement
 * tags, and item-type labels. Tinted by tone; `solid` fills the chip.
 */
function Badge({
  tone = "green",
  solid = false,
  children,
  style = {}
}) {
  const hues = {
    green: "var(--sc-green-bright)",
    blue: "var(--sc-blue-bright)",
    yellow: "var(--sc-yellow)",
    purple: "var(--sc-purple-bright)",
    red: "var(--sc-red-bright)",
    cyan: "var(--sc-cyan)"
  };
  const c = hues[tone] || hues.green;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--sp-1)",
      height: 24,
      padding: "0 10px",
      borderRadius: "var(--r-pill)",
      fontFamily: "var(--font-display)",
      fontWeight: "var(--fw-bold)",
      fontSize: "var(--fs-small)",
      lineHeight: 1,
      color: solid ? "var(--sc-text-on-accent)" : c,
      background: solid ? c : "rgba(255,255,255,0.06)",
      border: solid ? "none" : `var(--bw) solid ${c}`,
      boxShadow: solid ? "var(--glow-soft)" : "none",
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Button — arcade action button. Variants map to the game's color language:
 * primary (green "Earn Credits"), neutral (gray menu actions),
 * active (blue selected view), danger (red), ghost.
 * Full-width by default inside HUD panels.
 */
function Button({
  variant = "neutral",
  size = "md",
  active = false,
  block = true,
  disabled = false,
  children,
  style = {},
  ...rest
}) {
  const variants = {
    primary: {
      background: "linear-gradient(180deg, var(--sc-green-btn-hi), var(--sc-green-btn))",
      color: "#fff",
      border: "none",
      boxShadow: "var(--shadow-btn), var(--glow-green)"
    },
    neutral: {
      background: "var(--sc-btn-neutral)",
      color: "var(--text-body)",
      border: "var(--bw) solid var(--sc-line)",
      boxShadow: "var(--shadow-btn)"
    },
    active: {
      background: "var(--sc-blue-deep)",
      color: "#fff",
      border: "var(--bw-active) solid var(--sc-blue-bright)",
      boxShadow: "var(--shadow-btn), var(--glow-blue)"
    },
    danger: {
      background: "var(--sc-red)",
      color: "#fff",
      border: "none",
      boxShadow: "var(--shadow-btn), var(--glow-red)"
    },
    ghost: {
      background: "transparent",
      color: "var(--text-secondary)",
      border: "var(--bw) solid var(--sc-line)",
      boxShadow: "none"
    }
  };
  const sizes = {
    sm: {
      height: "var(--btn-h-sm)",
      padding: "0 14px",
      fontSize: "var(--fs-label)"
    },
    md: {
      height: "var(--btn-h)",
      padding: "0 18px",
      fontSize: "var(--fs-body)"
    },
    lg: {
      height: "56px",
      padding: "0 24px",
      fontSize: "var(--fs-h3)"
    }
  };
  const v = active ? variants.active : variants[variant] || variants.neutral;
  return /*#__PURE__*/React.createElement("button", _extends({
    disabled: disabled,
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "var(--sp-2)",
      width: block ? "100%" : "auto",
      ...sizes[size],
      ...v,
      borderRadius: "var(--radius-button)",
      fontFamily: "var(--font-display)",
      fontWeight: "var(--fw-bold)",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.45 : 1,
      transition: "var(--transition-control)",
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/CollectionItem.jsx
try { (() => {
/**
 * CollectionItem — one science prize in the collection checklist.
 * Shows a checkbox (filled green when collected), the item name,
 * and an optional count. Mirrors the SCIENCE COLLECTION panel.
 */
function CollectionItem({
  name,
  collected = false,
  count,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--sp-3)",
      padding: "var(--sp-2) 0",
      fontFamily: "var(--font-body)",
      fontSize: "var(--fs-body)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 20,
      height: 20,
      flex: "0 0 20px",
      borderRadius: "var(--r-sm)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      background: collected ? "var(--sc-green-btn)" : "transparent",
      border: collected ? "var(--bw) solid var(--sc-green-bright)" : "var(--bw-active) solid var(--sc-line-strong)",
      boxShadow: collected ? "var(--glow-green)" : "none",
      color: "#fff",
      fontWeight: "var(--fw-black)",
      fontSize: 13,
      lineHeight: 1
    }
  }, collected ? "✓" : ""), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      color: collected ? "var(--text-body)" : "var(--text-secondary)"
    }
  }, name), count != null && /*#__PURE__*/React.createElement("span", {
    style: {
      color: collected ? "var(--sc-green-bright)" : "var(--text-faint)",
      fontFamily: "var(--font-display)",
      fontWeight: "var(--fw-bold)"
    }
  }, "\xD7", count));
}
Object.assign(__ds_scope, { CollectionItem });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/CollectionItem.jsx", error: String((e && e.message) || e) }); }

// components/core/Panel.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Panel — the glassmorphic HUD container used across the game overlay.
 * Translucent dark fill + blur, rounded corners, floats over the 3D scene.
 * When titled, shows a FILLED accent header bar and an accent-tinted border +
 * glow, so each panel reads in its own color (bright & engaging for kids).
 */
function Panel({
  title,
  accent = "yellow",
  width,
  solid = false,
  glow = true,
  children,
  style = {},
  ...rest
}) {
  const A = {
    yellow: {
      c: "var(--sc-yellow)",
      glow: "var(--glow-yellow)",
      ink: "#3a2a00"
    },
    green: {
      c: "var(--sc-green)",
      glow: "var(--glow-green)",
      ink: "#06240f"
    },
    blue: {
      c: "var(--sc-blue)",
      glow: "var(--glow-blue)",
      ink: "#04162e"
    },
    purple: {
      c: "var(--sc-purple)",
      glow: "var(--glow-purple)",
      ink: "#250a33"
    },
    red: {
      c: "var(--sc-red)",
      glow: "var(--glow-red)",
      ink: "#2e0805"
    },
    cyan: {
      c: "var(--sc-cyan)",
      glow: "0 0 16px rgba(102,204,255,.5)",
      ink: "#042130"
    }
  }[accent] || {
    c: "var(--sc-yellow)",
    glow: "var(--glow-yellow)",
    ink: "#3a2a00"
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      width: width || "auto",
      background: solid ? "var(--surface-panel-solid)" : `linear-gradient(180deg, ${hexA(A.c, 0.07)}, rgba(7,13,21,0)), var(--surface-panel)`,
      backdropFilter: solid ? "none" : "var(--blur-panel)",
      WebkitBackdropFilter: solid ? "none" : "var(--blur-panel)",
      border: `var(--bw-active) solid ${title ? hexA(A.c, 0.55) : "var(--border-panel)"}`,
      borderRadius: "var(--radius-panel)",
      boxShadow: title && glow ? `var(--shadow-panel), ${A.glow}, var(--inset-glass)` : "var(--shadow-panel), var(--inset-glass)",
      padding: "var(--pad-panel)",
      color: "var(--text-body)",
      fontFamily: "var(--font-body)",
      boxSizing: "border-box",
      ...style
    }
  }, rest), title && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-block",
      background: A.c,
      color: A.ink,
      font: `var(--fw-black) var(--fs-h3)/1 var(--font-display)`,
      letterSpacing: "var(--ls-header)",
      textTransform: "uppercase",
      padding: "7px 14px",
      borderRadius: "var(--r-pill)",
      boxShadow: A.glow,
      marginBottom: "var(--sp-4)"
    }
  }, title), children);
}

// hex/var color → rgba string at given alpha (accepts CSS var() too)
function hexA(c, a) {
  if (c.startsWith("var(")) {
    // resolve common accents to literal rgba for tint/border math
    const map = {
      "var(--sc-yellow)": "255,182,39",
      "var(--sc-green)": "63,195,95",
      "var(--sc-blue)": "74,144,226",
      "var(--sc-purple)": "181,87,230",
      "var(--sc-red)": "232,73,63",
      "var(--sc-cyan)": "102,204,255"
    };
    return `rgba(${map[c] || "255,255,255"}, ${a})`;
  }
  return c;
}
Object.assign(__ds_scope, { Panel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Panel.jsx", error: String((e && e.message) || e) }); }

// components/core/ProgressBar.jsx
try { (() => {
/**
 * ProgressBar — collection / quiz progress. Neon green fill on a dark track,
 * with an optional inline label ("0% Complete").
 */
function ProgressBar({
  value = 0,
  max = 100,
  tone = "green",
  label,
  style = {}
}) {
  const pct = Math.max(0, Math.min(100, value / max * 100));
  const fill = {
    green: "linear-gradient(90deg, var(--sc-green-btn), var(--sc-green-bright))",
    blue: "linear-gradient(90deg, var(--sc-blue-deep), var(--sc-blue-bright))",
    yellow: "linear-gradient(90deg, var(--sc-yellow), var(--sc-yellow-soft))"
  }[tone];
  const glow = {
    green: "var(--glow-green)",
    blue: "var(--glow-blue)",
    yellow: "var(--glow-yellow)"
  }[tone];
  return /*#__PURE__*/React.createElement("div", {
    style: style
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 10,
      borderRadius: "var(--r-pill)",
      background: "rgba(255,255,255,0.08)",
      border: "var(--bw) solid var(--sc-line)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: `${pct}%`,
      height: "100%",
      background: fill,
      boxShadow: glow,
      borderRadius: "var(--r-pill)",
      transition: "width var(--dur-slow) var(--ease-out)"
    }
  })), label && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--sp-2)",
      fontFamily: "var(--font-body)",
      fontSize: "var(--fs-small)",
      color: "var(--text-muted)"
    }
  }, label));
}
Object.assign(__ds_scope, { ProgressBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/ProgressBar.jsx", error: String((e && e.message) || e) }); }

// components/core/QuizOption.jsx
try { (() => {
/**
 * QuizOption — a selectable answer button in the science quiz.
 * Neutral by default; turns green when selected (the game's "lime" pick).
 * Set `state` to "correct" / "wrong" to show post-submit feedback.
 */
function QuizOption({
  children,
  selected = false,
  state,
  onClick,
  style = {}
}) {
  let bg = "var(--sc-input-bg)";
  let border = "var(--bw) solid var(--sc-line)";
  let glow = "none";
  let color = "var(--text-body)";
  if (selected) {
    bg = "rgba(63,195,95,0.18)";
    border = "var(--bw-active) solid var(--sc-green-bright)";
    glow = "var(--glow-green)";
  }
  if (state === "correct") {
    bg = "rgba(63,195,95,0.22)";
    border = "var(--bw-active) solid var(--sc-green-bright)";
    glow = "var(--glow-green)";
  }
  if (state === "wrong") {
    bg = "rgba(232,73,63,0.18)";
    border = "var(--bw-active) solid var(--sc-red-bright)";
    glow = "var(--glow-red)";
    color = "var(--text-secondary)";
  }
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      display: "block",
      width: "100%",
      textAlign: "left",
      minHeight: "var(--control-h)",
      padding: "12px 16px",
      margin: "8px 0",
      borderRadius: "var(--r-md)",
      background: bg,
      border,
      boxShadow: glow,
      color,
      fontFamily: "var(--font-body)",
      fontSize: "var(--fs-body)",
      fontWeight: "var(--fw-semibold)",
      cursor: "pointer",
      transition: "var(--transition-control)",
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { QuizOption });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/QuizOption.jsx", error: String((e && e.message) || e) }); }

// components/core/SegmentedControl.jsx
try { (() => {
/**
 * SegmentedControl — the camera "VIEW" switcher (Front / Top / Side).
 * One option is active (blue ring + glow); the rest are neutral.
 */
function SegmentedControl({
  options = [],
  value,
  onChange,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--gap-row)",
      ...style
    }
  }, options.map(opt => {
    const val = typeof opt === "string" ? opt : opt.value;
    const label = typeof opt === "string" ? opt : opt.label;
    const isActive = val === value;
    return /*#__PURE__*/React.createElement("button", {
      key: val,
      onClick: () => onChange && onChange(val),
      style: {
        flex: 1,
        height: "var(--control-h)",
        padding: "0 16px",
        borderRadius: "var(--r-md)",
        fontFamily: "var(--font-display)",
        fontWeight: "var(--fw-bold)",
        fontSize: "var(--fs-body)",
        cursor: "pointer",
        transition: "var(--transition-control)",
        color: "#fff",
        background: isActive ? "var(--sc-blue-deep)" : "var(--sc-btn-neutral)",
        border: isActive ? "var(--bw-active) solid var(--sc-blue-bright)" : "var(--bw) solid var(--sc-line)",
        boxShadow: isActive ? "var(--glow-blue)" : "none"
      }
    }, label);
  }));
}
Object.assign(__ds_scope, { SegmentedControl });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/SegmentedControl.jsx", error: String((e && e.message) || e) }); }

// components/core/StatRow.jsx
try { (() => {
/**
 * StatRow — a labelled HUD readout ("Credits: 0"). The value is tinted
 * by the stat's own hue (credits=green, prizes=purple, accuracy=blue...).
 * Pass `tone` to pick the hue, or a raw `valueColor`.
 */
function StatRow({
  label,
  value,
  tone = "default",
  valueColor,
  style = {}
}) {
  const tones = {
    default: "var(--text-body)",
    player: "var(--stat-player)",
    credits: "var(--stat-credits)",
    streak: "var(--stat-streak)",
    prizes: "var(--stat-prizes)",
    accuracy: "var(--stat-accuracy)"
  };
  const color = valueColor || tones[tone] || tones.default;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      justifyContent: "space-between",
      gap: "var(--sp-3)",
      fontFamily: "var(--font-body)",
      fontSize: "var(--fs-body)",
      padding: "var(--sp-1) 0",
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-secondary)"
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      color,
      fontFamily: "var(--font-display)",
      fontWeight: "var(--fw-extra)"
    }
  }, value));
}
Object.assign(__ds_scope, { StatRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/StatRow.jsx", error: String((e && e.message) || e) }); }

// ui_kits/game/App.jsx
try { (() => {
/* global React, LoginScreen, GameScreen, QuizModal */
// App — flow orchestration: login → play. Fake claw grab on Space.

const ITEMS = ["Battery", "Atom", "Plant", "Magnet", "Crystal"];
function App() {
  const [screen, setScreen] = React.useState("login"); // login | game
  const [quiz, setQuiz] = React.useState(false);
  const [view, setView] = React.useState("Front View");
  const [clawX, setClawX] = React.useState(0);
  const [message, setMessage] = React.useState(null);
  const [muted, setMuted] = React.useState(false);
  const sfx = window.sfx;
  const [player, setPlayer] = React.useState({
    name: "Guest",
    studentClass: "P5",
    credits: 3,
    streak: 0,
    prizes: 0,
    correct: 0,
    attempted: 0,
    collection: {}
  });
  const toast = m => {
    setMessage(m);
    setTimeout(() => setMessage(null), 1800);
  };
  const enter = (name, cls) => {
    sfx && sfx.enter();
    setPlayer(p => ({
      ...p,
      name,
      studentClass: cls,
      credits: 3
    }));
    setScreen("game");
  };
  const dropClaw = React.useCallback(() => {
    sfx && sfx.drop();
    setPlayer(p => {
      if (p.credits <= 0) {
        sfx && sfx.miss();
        toast("Out of credits — earn more!");
        return p;
      }
      const win = Math.random() < 0.7;
      setTimeout(() => {
        sfx && (win ? sfx.grab() : sfx.miss());
      }, 380);
      if (!win) {
        toast("So close! Missed it");
        return {
          ...p,
          credits: p.credits - 1,
          streak: 0
        };
      }
      const item = ITEMS[Math.floor(Math.random() * ITEMS.length)];
      const nextCollection = {
        ...p.collection,
        [item]: (p.collection[item] || 0) + 1
      };
      const complete = ITEMS.every(i => (nextCollection[i] || 0) > 0);
      if (complete) {
        setTimeout(() => {
          sfx && sfx.win();
          toast("🏆 Science Collection Complete!");
        }, 600);
      } else toast(`🎉 Grabbed a ${item}!`);
      return {
        ...p,
        credits: p.credits - 1,
        prizes: p.prizes + 1,
        streak: p.streak + 1,
        collection: nextCollection
      };
    });
  }, [sfx]);
  React.useEffect(() => {
    if (screen !== "game" || quiz) return;
    const onKey = e => {
      if (["a", "ArrowLeft"].includes(e.key)) {
        sfx && sfx.move();
        setClawX(x => Math.max(-180, x - 24));
      }
      if (["d", "ArrowRight"].includes(e.key)) {
        sfx && sfx.move();
        setClawX(x => Math.min(180, x + 24));
      }
      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        dropClaw();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screen, quiz, dropClaw, sfx]);
  const toggleMute = () => {
    const m = !muted;
    setMuted(m);
    sfx && sfx.mute(m);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: "var(--sc-black)"
    }
  }, screen === "login" && /*#__PURE__*/React.createElement(LoginScreen, {
    onEnter: enter
  }), screen === "game" && /*#__PURE__*/React.createElement(GameScreen, {
    player: player,
    view: view,
    setView: setView,
    clawX: clawX,
    message: message,
    muted: muted,
    onToggleMute: toggleMute,
    onEarn: () => setQuiz(true),
    onSwitch: () => {
      setScreen("login");
      setPlayer(p => ({
        ...p,
        collection: {},
        credits: 3,
        prizes: 0,
        streak: 0
      }));
    }
  }), quiz && /*#__PURE__*/React.createElement(QuizModal, {
    studentClass: player.studentClass,
    onClose: () => setQuiz(false),
    onReward: r => setPlayer(p => ({
      ...p,
      credits: p.credits + r,
      correct: p.correct + 1,
      attempted: p.attempted + 1
    }))
  }));
}
window.App = App;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/game/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/game/ClawScene.jsx
try { (() => {
/* global React */
// ClawScene — stylized CSS representation of the 3D claw-machine play area.
// (The production game renders this with three.js; this is a cosmetic stand-in
//  so the HUD overlay can be previewed.) Colored prizes map to item identity colors.

function ClawScene({
  clawX = 0
}) {
  const prizes = [{
    c: "var(--sc-item-atom)",
    shape: "sphere",
    x: 30,
    y: 70
  }, {
    c: "var(--sc-item-battery)",
    shape: "cube",
    x: 60,
    y: 58
  }, {
    c: "var(--sc-item-battery)",
    shape: "cube",
    x: 70,
    y: 64
  }, {
    c: "var(--sc-item-crystal)",
    shape: "diamond",
    x: 22,
    y: 64
  }, {
    c: "var(--sc-item-crystal)",
    shape: "diamond",
    x: 44,
    y: 60
  }, {
    c: "var(--sc-item-crystal)",
    shape: "diamond",
    x: 78,
    y: 70
  }, {
    c: "var(--sc-item-magnet)",
    shape: "cylinder",
    x: 18,
    y: 74
  }, {
    c: "var(--sc-item-magnet)",
    shape: "cylinder",
    x: 58,
    y: 78
  }, {
    c: "var(--sc-item-atom)",
    shape: "sphere",
    x: 38,
    y: 74
  }, {
    c: "var(--sc-item-atom)",
    shape: "sphere",
    x: 62,
    y: 70
  }, {
    c: "var(--sc-item-battery)",
    shape: "cube",
    x: 48,
    y: 80
  }, {
    c: "var(--sc-item-plant)",
    shape: "cone",
    x: 84,
    y: 60
  }];
  const shapeStyle = p => {
    const base = {
      position: "absolute",
      left: `${p.x}%`,
      top: `${p.y}%`,
      width: 30,
      height: 30,
      background: p.c,
      boxShadow: `0 6px 14px rgba(0,0,0,.5), inset -4px -6px 10px rgba(0,0,0,.35), inset 4px 4px 8px rgba(255,255,255,.35)`,
      transform: "translate(-50%,-50%)"
    };
    if (p.shape === "sphere") return {
      ...base,
      borderRadius: "50%"
    };
    if (p.shape === "cube") return {
      ...base,
      borderRadius: 5
    };
    if (p.shape === "diamond") return {
      ...base,
      borderRadius: 6,
      transform: "translate(-50%,-50%) rotate(45deg)"
    };
    if (p.shape === "cylinder") return {
      ...base,
      width: 22,
      height: 34,
      borderRadius: 8
    };
    if (p.shape === "cone") return {
      ...base,
      width: 0,
      height: 0,
      background: "transparent",
      borderLeft: "16px solid transparent",
      borderRight: "16px solid transparent",
      borderBottom: `30px solid ${p.c}`,
      boxShadow: "none"
    };
    return base;
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      overflow: "hidden",
      background: "radial-gradient(60% 50% at 50% 28%, #1a3b58 0%, #0c1f33 42%, var(--sc-black) 100%)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: "38%",
      top: "26%",
      width: 360,
      height: 280,
      transform: "translate(-50%,-50%)",
      background: "radial-gradient(circle, rgba(0,255,255,.14), transparent 70%)",
      pointerEvents: "none"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: "64%",
      top: "34%",
      width: 340,
      height: 300,
      transform: "translate(-50%,-50%)",
      background: "radial-gradient(circle, rgba(240,111,255,.12), transparent 70%)",
      pointerEvents: "none"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: "50%",
      top: "60%",
      width: 460,
      height: 220,
      transform: "translate(-50%,-50%)",
      background: "radial-gradient(circle, rgba(74,144,226,.12), transparent 72%)",
      pointerEvents: "none"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: "50%",
      top: "50%",
      transform: "translate(-50%,-50%)",
      width: 460,
      height: 380,
      borderRadius: 14,
      background: "linear-gradient(160deg, rgba(136,204,255,.12), rgba(240,111,255,.04))",
      border: "1px solid rgba(136,204,255,.3)",
      boxShadow: "inset 0 0 60px rgba(136,204,255,.08), 0 30px 60px rgba(0,0,0,.5)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 6,
      left: 10,
      width: 120,
      height: 360,
      borderRadius: 60,
      background: "linear-gradient(180deg, rgba(255,255,255,.10), transparent 60%)",
      transform: "skewX(-8deg)",
      pointerEvents: "none"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 5,
      background: "linear-gradient(90deg, var(--sc-cyan), #fff, var(--sc-item-crystal))",
      opacity: .5
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 0,
      left: `calc(50% + ${clawX}px)`,
      transform: "translateX(-50%)",
      transition: "left .15s var(--ease-out)",
      animation: "scBob 2.4s var(--ease-out) infinite"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 3,
      height: 90,
      margin: "0 auto",
      background: "linear-gradient(#fff,#9fb3c4)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40,
      height: 26,
      margin: "0 auto",
      borderRadius: 6,
      background: "linear-gradient(180deg,#fff,#b8c4d0)",
      boxShadow: "0 4px 10px rgba(0,0,0,.5)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      width: 60,
      height: 36,
      margin: "-4px auto 0"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 6,
      top: 0,
      width: 5,
      height: 34,
      background: "#d8e0e8",
      borderRadius: 3,
      transform: "rotate(18deg)",
      transformOrigin: "top"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      right: 6,
      top: 0,
      width: 5,
      height: 34,
      background: "#d8e0e8",
      borderRadius: 3,
      transform: "rotate(-18deg)",
      transformOrigin: "top"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: "50%",
      top: 0,
      width: 5,
      height: 34,
      marginLeft: -2.5,
      background: "#c4ccd4",
      borderRadius: 3
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 12,
      right: 12,
      bottom: 12,
      top: 200,
      borderRadius: 8,
      background: "linear-gradient(180deg,#0c1118,#05080d)",
      boxShadow: "inset 0 8px 24px rgba(0,0,0,.6)"
    }
  }, prizes.map((p, i) => {
    const st = shapeStyle(p);
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        ...st,
        "--rot": p.shape === "diamond" ? "45deg" : "0deg",
        animation: `scFloat ${2.6 + i % 5 * 0.3}s var(--ease-out) ${i * 0.15}s infinite`
      }
    });
  }))));
}
window.ClawScene = ClawScene;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/game/ClawScene.jsx", error: String((e && e.message) || e) }); }

// ui_kits/game/GameScreen.jsx
try { (() => {
/* global React, ClawScene */
// GameScreen — the full HUD overlay (recreates the reference prototype, brightened).

function GameScreen({
  player,
  view,
  setView,
  clawX,
  onEarn,
  onSwitch,
  message,
  muted,
  onToggleMute
}) {
  const NS = window.ScienceClawDesignSystem_0049d4;
  const {
    Panel,
    Button,
    StatRow,
    SegmentedControl,
    CollectionItem,
    ProgressBar
  } = NS;
  const sfx = window.sfx;
  const items = ["Battery", "Atom", "Plant", "Magnet", "Crystal"];
  const collected = items.filter(i => (player.collection[i] || 0) > 0).length;
  const accuracy = player.attempted ? Math.round(player.correct / player.attempted * 100) : 0;
  const wrap = {
    position: "absolute",
    color: "#fff",
    zIndex: 20
  };
  const click = fn => () => {
    sfx && sfx.click();
    fn && fn();
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      fontFamily: "var(--font-body)"
    }
  }, /*#__PURE__*/React.createElement(ClawScene, {
    clawX: clawX
  }), /*#__PURE__*/React.createElement("button", {
    onClick: onToggleMute,
    title: muted ? "Unmute" : "Mute",
    style: {
      position: "absolute",
      top: 20,
      left: "50%",
      transform: "translateX(150px)",
      zIndex: 30,
      width: 40,
      height: 40,
      borderRadius: "var(--r-round)",
      cursor: "pointer",
      background: "var(--sc-glass)",
      border: "2px solid var(--sc-glass-line)",
      color: "#fff",
      fontSize: 18,
      backdropFilter: "var(--blur-panel)"
    }
  }, muted ? "🔇" : "🔊"), /*#__PURE__*/React.createElement("div", {
    className: "sc-pop",
    style: {
      ...wrap,
      top: 20,
      left: 20,
      width: 234
    }
  }, /*#__PURE__*/React.createElement(Panel, {
    title: "Controls",
    accent: "blue"
  }, [["A / ←", "Move Left"], ["D / →", "Move Right"], ["W / ↑", "Move Forward"], ["S / ↓", "Move Back"], ["Space", "Drop Claw"]].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "5px 0",
      fontSize: 15
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 800,
      background: "rgba(255,255,255,.08)",
      border: "1px solid var(--sc-line)",
      borderRadius: 6,
      padding: "2px 8px",
      minWidth: 52,
      textAlign: "center"
    }
  }, k), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-secondary)"
    }
  }, v))))), /*#__PURE__*/React.createElement("div", {
    className: "sc-pop",
    style: {
      ...wrap,
      top: 20,
      left: "50%",
      transform: "translateX(-50%)",
      width: 360
    }
  }, /*#__PURE__*/React.createElement(Panel, {
    title: "View",
    accent: "yellow"
  }, /*#__PURE__*/React.createElement(SegmentedControl, {
    options: ["Front View", "Top View", "Side View"],
    value: view,
    onChange: v => {
      sfx && sfx.select();
      setView(v);
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      marginTop: 12,
      fontSize: 14,
      color: "var(--text-muted)"
    }
  }, "Use ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: "#fff"
    }
  }, "W A S D"), " or arrow keys to move the claw"))), /*#__PURE__*/React.createElement("div", {
    className: "sc-pop",
    style: {
      ...wrap,
      top: 20,
      right: 20,
      width: 264
    }
  }, /*#__PURE__*/React.createElement(Panel, {
    title: "Science Collection",
    accent: "green"
  }, items.map(i => /*#__PURE__*/React.createElement(CollectionItem, {
    key: i,
    name: i,
    collected: (player.collection[i] || 0) > 0,
    count: player.collection[i]
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 12
    }
  }), /*#__PURE__*/React.createElement(ProgressBar, {
    value: collected,
    max: items.length,
    label: `Progress ${collected}/${items.length} · ${Math.round(collected / items.length * 100)}% Complete`
  }))), /*#__PURE__*/React.createElement("div", {
    className: "sc-pop",
    style: {
      ...wrap,
      top: "50%",
      left: 20,
      transform: "translateY(-50%)",
      width: 234
    }
  }, /*#__PURE__*/React.createElement(Panel, {
    title: "Player",
    accent: "purple"
  }, /*#__PURE__*/React.createElement(StatRow, {
    label: "Name",
    value: player.name,
    tone: "player"
  }), /*#__PURE__*/React.createElement(StatRow, {
    label: "Credits",
    value: player.credits,
    tone: "credits"
  }), /*#__PURE__*/React.createElement(StatRow, {
    label: "Streak",
    value: player.streak,
    tone: "streak"
  }), /*#__PURE__*/React.createElement(StatRow, {
    label: "Prizes",
    value: player.prizes,
    tone: "prizes"
  }), /*#__PURE__*/React.createElement(StatRow, {
    label: "Accuracy",
    value: accuracy + "%",
    tone: "accuracy"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: "var(--sc-line)",
      margin: "14px 0"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    onClick: () => {
      sfx && sfx.coin();
      onEarn();
    }
  }, "\u2B50 Earn Credits"), /*#__PURE__*/React.createElement(Button, {
    variant: "neutral",
    onClick: click()
  }, "Dashboard"), /*#__PURE__*/React.createElement(Button, {
    variant: "neutral",
    onClick: click()
  }, "Save Report"), /*#__PURE__*/React.createElement(Button, {
    variant: "neutral",
    onClick: () => {
      sfx && sfx.click();
      onSwitch();
    }
  }, "Switch Player")))), /*#__PURE__*/React.createElement("div", {
    className: "sc-pop",
    style: {
      ...wrap,
      bottom: 20,
      left: "50%",
      transform: "translateX(-50%)",
      width: 430
    }
  }, /*#__PURE__*/React.createElement(Panel, {
    title: "How to Play",
    accent: "red"
  }, /*#__PURE__*/React.createElement("ol", {
    style: {
      margin: 0,
      paddingLeft: 22,
      color: "var(--text-secondary)",
      fontSize: 15,
      lineHeight: 1.7
    }
  }, /*#__PURE__*/React.createElement("li", null, "Earn credits by answering science questions"), /*#__PURE__*/React.createElement("li", null, "Spend credits to play the claw machine"), /*#__PURE__*/React.createElement("li", null, "Move the claw and grab prizes"), /*#__PURE__*/React.createElement("li", null, "Build your science collection!")))), message && /*#__PURE__*/React.createElement("div", {
    className: "sc-toast",
    style: {
      position: "absolute",
      top: 130,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 60,
      background: "var(--sc-glass-strong)",
      border: "2px solid var(--sc-green-bright)",
      boxShadow: "var(--glow-green)",
      borderRadius: "var(--r-pill)",
      padding: "12px 24px",
      color: "#fff",
      font: "800 17px/1 var(--font-display)"
    }
  }, message));
}
window.GameScreen = GameScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/game/GameScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/game/LoginScreen.jsx
try { (() => {
/* global React */
// LoginScreen — student registration ("Enter Machine").

function LoginScreen({
  onEnter
}) {
  const NS = window.ScienceClawDesignSystem_0049d4;
  const {
    Panel,
    Button
  } = NS;
  const [name, setName] = React.useState("");
  const [cls, setCls] = React.useState("P5");
  const field = {
    width: "100%",
    height: "var(--input-h)",
    boxSizing: "border-box",
    padding: "0 14px",
    marginTop: 8,
    borderRadius: "var(--r-md)",
    background: "var(--surface-input)",
    border: "1px solid var(--sc-input-line)",
    color: "#fff",
    fontFamily: "var(--font-body)",
    fontSize: "var(--fs-body)"
  };
  const label = {
    font: "700 13px/1 var(--font-display)",
    letterSpacing: ".05em",
    textTransform: "uppercase",
    color: "var(--text-muted)",
    marginTop: 14,
    display: "block"
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "radial-gradient(80% 70% at 50% 30%, #11293b 0%, var(--sc-scene) 55%, var(--sc-black) 100%)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 360
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 44
    }
  }, "\uD83E\uDDBE"), /*#__PURE__*/React.createElement("div", {
    style: {
      font: "900 34px/1 var(--font-display)",
      color: "#fff",
      marginTop: 6
    }
  }, "Science", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--sc-yellow)"
    }
  }, "Claw")), /*#__PURE__*/React.createElement("div", {
    style: {
      color: "var(--text-muted)",
      fontSize: 14,
      marginTop: 6
    }
  }, "Earn it. Grab it. Collect it.")), /*#__PURE__*/React.createElement(Panel, null, /*#__PURE__*/React.createElement("label", {
    style: {
      ...label,
      marginTop: 0
    }
  }, "Student Name"), /*#__PURE__*/React.createElement("input", {
    style: field,
    placeholder: "Type your name",
    value: name,
    onChange: e => setName(e.target.value)
  }), /*#__PURE__*/React.createElement("label", {
    style: label
  }, "Class"), /*#__PURE__*/React.createElement("select", {
    style: field,
    value: cls,
    onChange: e => setCls(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: "P3"
  }, "Primary 3"), /*#__PURE__*/React.createElement("option", {
    value: "P4"
  }, "Primary 4"), /*#__PURE__*/React.createElement("option", {
    value: "P5"
  }, "Primary 5"), /*#__PURE__*/React.createElement("option", {
    value: "P6"
  }, "Primary 6")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 18
    }
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    disabled: !name.trim(),
    onClick: () => onEnter(name.trim() || "Guest", cls)
  }, "Enter Machine"))));
}
window.LoginScreen = LoginScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/game/LoginScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/game/QuizModal.jsx
try { (() => {
/* global React */
// QuizModal — the "Earn Credits" science quiz flow (top-up menu → question).

const QUESTION_BANK = {
  P3: [{
    topic: "Heat",
    q: "Which material conducts heat best?",
    options: ["Wood", "Plastic", "Metal", "Paper"],
    correct: "Metal"
  }],
  P4: [{
    topic: "Magnets",
    q: "Magnets attract materials containing?",
    options: ["Iron", "Paper", "Plastic", "Wood"],
    correct: "Iron"
  }],
  P5: [{
    topic: "Human Body",
    q: "Which system carries blood?",
    options: ["Digestive", "Respiratory", "Circulatory", "Skeletal"],
    correct: "Circulatory"
  }],
  P6: [{
    topic: "Light",
    q: "Light travels in?",
    options: ["Curves", "Circles", "Straight lines", "Zig zags"],
    correct: "Straight lines"
  }]
};
function QuizModal({
  studentClass,
  onClose,
  onReward
}) {
  const NS = window.ScienceClawDesignSystem_0049d4;
  const {
    Panel,
    Button,
    QuizOption,
    Badge
  } = NS;
  const [step, setStep] = React.useState("menu"); // menu | question | result
  const [reward, setReward] = React.useState(0);
  const [picked, setPicked] = React.useState(null);
  const [submitted, setSubmitted] = React.useState(false);
  const pool = QUESTION_BANK[studentClass] || QUESTION_BANK.P5;
  const question = pool[0];
  const correct = submitted && picked === question.correct;
  const sfx = window.sfx;
  const start = r => {
    sfx && sfx.coin();
    setReward(r);
    setStep("question");
    setPicked(null);
    setSubmitted(false);
  };
  const submit = () => {
    if (!picked) return;
    setSubmitted(true);
    setStep("result");
    if (picked === question.correct) {
      sfx && sfx.correct();
      onReward(reward);
    } else {
      sfx && sfx.wrong();
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(2,5,9,.55)",
      backdropFilter: "blur(3px)",
      zIndex: 200
    }
  }, /*#__PURE__*/React.createElement(Panel, {
    solid: true,
    width: 400,
    style: {
      boxShadow: "var(--shadow-modal)"
    }
  }, step === "menu" && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      font: "800 22px/1 var(--font-display)",
      color: "var(--sc-yellow)",
      marginBottom: 4
    }
  }, "Earn Credits"), /*#__PURE__*/React.createElement("div", {
    style: {
      color: "var(--text-muted)",
      fontSize: 14,
      marginBottom: 16
    }
  }, "Answer science questions to play the claw."), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    style: {
      marginBottom: 10,
      justifyContent: "space-between"
    },
    onClick: () => start(3)
  }, /*#__PURE__*/React.createElement("span", null, "1 Question"), /*#__PURE__*/React.createElement(Badge, {
    tone: "green",
    solid: true
  }, "+3")), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    style: {
      marginBottom: 16,
      justifyContent: "space-between"
    },
    onClick: () => start(10)
  }, /*#__PURE__*/React.createElement("span", null, "3 Questions"), /*#__PURE__*/React.createElement(Badge, {
    tone: "green",
    solid: true
  }, "+10")), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    onClick: onClose
  }, "Close")), step !== "menu" && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "cyan"
  }, question.topic), /*#__PURE__*/React.createElement(Badge, {
    tone: "green",
    solid: true
  }, "+", reward)), /*#__PURE__*/React.createElement("div", {
    style: {
      font: "700 19px/1.3 var(--font-display)",
      color: "#fff",
      marginBottom: 14
    }
  }, question.q), question.options.map(opt => /*#__PURE__*/React.createElement(QuizOption, {
    key: opt,
    selected: !submitted && picked === opt,
    state: submitted ? opt === question.correct ? "correct" : opt === picked ? "wrong" : undefined : undefined,
    onClick: () => {
      if (!submitted) {
        sfx && sfx.select();
        setPicked(opt);
      }
    }
  }, opt)), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 8
    }
  }), !submitted ? /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    disabled: !picked,
    onClick: submit
  }, "Submit Answer") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "8px 0 14px",
      font: "800 17px/1 var(--font-display)",
      color: correct ? "var(--sc-green-bright)" : "var(--sc-red-bright)"
    }
  }, correct ? `Correct!  +${reward} credits` : "Not quite — try again next time"), /*#__PURE__*/React.createElement(Button, {
    variant: "neutral",
    onClick: onClose
  }, "Back to Machine")))));
}
window.QuizModal = QuizModal;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/game/QuizModal.jsx", error: String((e && e.message) || e) }); }

// ui_kits/game/sound.js
try { (() => {
// sound.js — tiny Web Audio synth for Science Claw arcade SFX.
// No assets/network — all sounds are synthesized so they work offline.
// Exposes window.sfx with named effects. AudioContext unlocks on first gesture.

(function () {
  let ctx = null;
  let master = null;
  let muted = false;
  function ensure() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = 0.32;
      master.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  // one oscillator "blip"
  function tone(freq, t0, dur, type, peak) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type || "square";
    o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak || 0.5, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g);
    g.connect(master);
    o.start(t0);
    o.stop(t0 + dur + 0.02);
  }

  // frequency sweep
  function sweep(f1, f2, t0, dur, type, peak) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type || "sawtooth";
    o.frequency.setValueAtTime(f1, t0);
    o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak || 0.4, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g);
    g.connect(master);
    o.start(t0);
    o.stop(t0 + dur + 0.02);
  }

  // noise burst (for "miss" thud)
  function noise(t0, dur, peak) {
    const n = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const g = ctx.createGain();
    g.gain.value = peak || 0.3;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 900;
    src.connect(lp);
    lp.connect(g);
    g.connect(master);
    src.start(t0);
  }
  const C = n => 261.63 * Math.pow(2, n / 12); // semitone helper from middle C

  const lib = {
    click() {
      const t = ensure().currentTime;
      tone(520, t, 0.06, "square", 0.35);
    },
    move() {
      const t = ensure().currentTime;
      tone(300, t, 0.04, "triangle", 0.18);
    },
    select() {
      const t = ensure().currentTime;
      tone(C(4), t, 0.07, "square", 0.3);
      tone(C(9), t + 0.05, 0.08, "square", 0.3);
    },
    drop() {
      const t = ensure().currentTime;
      sweep(700, 120, t, 0.35, "sawtooth", 0.4);
    },
    grab() {
      const t = ensure().currentTime;
      [0, 4, 7, 12].forEach((s, i) => tone(C(s + 7), t + i * 0.07, 0.12, "square", 0.4));
    },
    miss() {
      const t = ensure().currentTime;
      sweep(220, 90, t, 0.3, "triangle", 0.35);
      noise(t, 0.2, 0.22);
    },
    correct() {
      const t = ensure().currentTime;
      [0, 4, 7].forEach((s, i) => tone(C(s + 7), t + i * 0.08, 0.14, "triangle", 0.42));
    },
    wrong() {
      const t = ensure().currentTime;
      tone(C(1), t, 0.18, "sawtooth", 0.3);
      tone(C(0), t + 0.12, 0.22, "sawtooth", 0.3);
    },
    coin() {
      const t = ensure().currentTime;
      tone(C(16), t, 0.06, "square", 0.4);
      tone(C(21), t + 0.05, 0.14, "square", 0.4);
    },
    win() {
      const t = ensure().currentTime;
      [0, 4, 7, 12, 16, 19].forEach((s, i) => tone(C(s + 7), t + i * 0.09, 0.18, "square", 0.42));
    },
    enter() {
      const t = ensure().currentTime;
      sweep(180, 520, t, 0.4, "sawtooth", 0.32);
      tone(C(12), t + 0.4, 0.16, "square", 0.4);
    }
  };
  window.sfx = new Proxy(lib, {
    get(target, prop) {
      if (prop === "mute") return v => {
        muted = v;
        if (master) master.gain.value = v ? 0 : 0.32;
      };
      if (prop === "muted") return muted;
      const fn = target[prop];
      if (typeof fn !== "function") return undefined;
      return function () {
        if (muted) return;
        try {
          ensure();
          fn();
        } catch (e) {}
      };
    }
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/game/sound.js", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.CollectionItem = __ds_scope.CollectionItem;

__ds_ns.Panel = __ds_scope.Panel;

__ds_ns.ProgressBar = __ds_scope.ProgressBar;

__ds_ns.QuizOption = __ds_scope.QuizOption;

__ds_ns.SegmentedControl = __ds_scope.SegmentedControl;

__ds_ns.StatRow = __ds_scope.StatRow;

})();
