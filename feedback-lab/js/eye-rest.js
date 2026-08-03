/* Eye-rest reminder — a small session timer chip; after 40 minutes it shows
   a warm reminder to rest your eyes (20-20-20 rule), then restarts. Vanilla JS,
   no dependencies, safe to include on any page. */
(function () {
  function readMinutes() { try { const t = JSON.parse(localStorage.getItem("sfl-tweaks-v1")); return (t && t.eyeMinutes) || 40; } catch (e) { return 40; } }
  var LIMIT_MIN = readMinutes();
  window.addEventListener("sfl-tweaks-changed", function (ev) { if (ev.detail && ev.detail.eyeMinutes) LIMIT_MIN = ev.detail.eyeMinutes; });
  var start = Date.now();
  var overlayShown = false;

  // ---- timer chip ----
  var chip = document.createElement("div");
  chip.id = "eye-rest-chip";
  chip.title = "Time since you started (or last eye break). At " + LIMIT_MIN + " min you'll get a gentle reminder to rest your eyes.";
  chip.style.cssText = "position:fixed;bottom:14px;right:14px;z-index:9000;display:flex;align-items:center;gap:6px;" +
    "font-family:'Nunito',system-ui,sans-serif;font-weight:800;font-size:12.5px;color:#9fb2c8;" +
    "background:rgba(7,13,21,.85);border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:6px 12px;" +
    "backdrop-filter:blur(6px);box-shadow:0 4px 14px rgba(0,0,0,.4);pointer-events:auto;user-select:none;";
  function fmt(ms) {
    var s = Math.floor(ms / 1000), m = Math.floor(s / 60);
    return m + ":" + ("0" + (s % 60)).slice(-2);
  }
  function tick() {
    var el = Date.now() - start;
    chip.textContent = "👀 " + fmt(el);
    var warm = el >= (LIMIT_MIN - 5) * 60000;
    chip.style.color = warm ? "#ffb627" : "#9fb2c8";
    chip.style.borderColor = warm ? "rgba(255,182,39,.5)" : "rgba(255,255,255,.14)";
    if (el >= LIMIT_MIN * 60000 && !overlayShown) showOverlay();
  }

  // ---- warm reminder overlay ----
  function showOverlay() {
    overlayShown = true;
    var wrap = document.createElement("div");
    wrap.id = "eye-rest-overlay";
    wrap.style.cssText = "position:fixed;inset:0;z-index:9500;display:flex;align-items:center;justify-content:center;" +
      "background:rgba(4,7,12,.75);backdrop-filter:blur(4px);padding:20px;";
    var card = document.createElement("div");
    card.style.cssText = "max-width:430px;width:100%;background:#0a1320;border:2px solid #3fc35f;border-radius:20px;" +
      "padding:30px 26px;text-align:center;box-shadow:0 0 28px rgba(63,195,95,.28),0 20px 50px rgba(0,0,0,.6);" +
      "font-family:'Nunito',system-ui,sans-serif;color:#e8eef6;";
    card.innerHTML =
      '<div style="font-size:40px;margin-bottom:10px;">🌿</div>' +
      '<div style="font-weight:900;font-size:20px;letter-spacing:.04em;text-transform:uppercase;color:#58e066;margin-bottom:10px;">Time for an eye break!</div>' +
      '<div style="font-size:15px;line-height:1.55;color:#c2cede;margin-bottom:8px;">You\u2019ve been working hard for ' + LIMIT_MIN + ' minutes \u2014 wonderful effort! \u2728</div>' +
      '<div style="font-size:14px;line-height:1.55;color:#9fb2c8;margin-bottom:20px;">Look at something far away (about 6 metres) for 20 seconds, blink slowly, and maybe stretch or sip some water. Your eyes will thank you!</div>' +
      '<button id="eye-rest-done" style="min-height:44px;padding:10px 26px;border:none;border-radius:12px;cursor:pointer;' +
      'font-family:inherit;font-weight:800;font-size:15px;color:#06230f;background:linear-gradient(180deg,#58e066,#3fc35f);' +
      'box-shadow:0 0 16px rgba(63,195,95,.45),0 2px 0 rgba(0,0,0,.35);">I\u2019ve rested my eyes 💚</button>';
    wrap.appendChild(card);
    document.body.appendChild(wrap);
    document.getElementById("eye-rest-done").addEventListener("click", function () {
      wrap.remove();
      start = Date.now();       // restart the cycle
      overlayShown = false;
      tick();
    });
  }

  function mount() {
    document.body.appendChild(chip);
    tick();
    setInterval(tick, 1000);
  }
  if (document.body) mount(); else document.addEventListener("DOMContentLoaded", mount);
})();
