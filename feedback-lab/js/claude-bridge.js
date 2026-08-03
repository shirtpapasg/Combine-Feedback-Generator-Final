/* Claude bridge — makes window.claude.complete work outside the design app.
   Inside the app environment window.claude already exists, so this does nothing.
   Outside (Vercel / GitHub Pages / local file), it calls the Anthropic API
   directly from the browser using an API key the user pastes once.
   The key is stored ONLY in this browser's localStorage — never in the code. */
(function () {
  if (window.claude && window.claude.complete) return; // real one exists — do nothing
  window.__sflBridge = true; // flag: running outside the design app (Vercel / GitHub Pages / local)

  var KEY_STORE = "sfl_anthropic_api_key";
  var MODEL = "claude-sonnet-4-5";

  function getKey() {
    try { return localStorage.getItem(KEY_STORE) || ""; } catch (e) { return ""; }
  }
  function setKey(k) {
    try { localStorage.setItem(KEY_STORE, k); } catch (e) {}
  }
  function clearKey() {
    try { localStorage.removeItem(KEY_STORE); } catch (e) {}
  }

  // ---- key entry dialog (vanilla, matches dark theme) ----
  function askForKey(message) {
    return new Promise(function (resolve, reject) {
      var old = document.getElementById("sfl-key-modal");
      if (old) old.remove();

      var wrap = document.createElement("div");
      wrap.id = "sfl-key-modal";
      wrap.style.cssText = "position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.7);backdrop-filter:blur(4px);font-family:system-ui,sans-serif;";
      wrap.innerHTML =
        '<div style="width:min(440px,92vw);background:#101826;border:1px solid #2a3a55;border-radius:14px;padding:24px;color:#dce6f5;box-shadow:0 20px 60px rgba(0,0,0,.6);">' +
          '<div style="font-size:17px;font-weight:800;margin-bottom:6px;">Connect Claude</div>' +
          '<div style="font-size:13px;color:#8fa3c0;line-height:1.5;margin-bottom:14px;">' +
            (message || "To generate AI feedback on this site, paste an Anthropic API key. It is saved only in this browser.") +
            ' Get one at <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener" style="color:#66ccff;">console.anthropic.com</a>.' +
          "</div>" +
          '<input id="sfl-key-input" type="password" placeholder="sk-ant-..." style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid #2a3a55;background:#0a111d;color:#dce6f5;font-size:14px;outline:none;box-sizing:border-box;" />' +
          '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px;">' +
            '<button id="sfl-key-cancel" style="padding:9px 16px;border-radius:8px;border:1px solid #2a3a55;background:transparent;color:#8fa3c0;font-size:14px;cursor:pointer;">Cancel</button>' +
            '<button id="sfl-key-save" style="padding:9px 18px;border-radius:8px;border:none;background:#2f80ed;color:#fff;font-size:14px;font-weight:700;cursor:pointer;">Save &amp; continue</button>' +
          "</div>" +
        "</div>";
      document.body.appendChild(wrap);

      var input = wrap.querySelector("#sfl-key-input");
      input.focus();

      function done(val) { wrap.remove(); resolve(val); }
      function cancel() { wrap.remove(); reject(new Error("No API key provided.")); }

      wrap.querySelector("#sfl-key-save").addEventListener("click", function () {
        var v = input.value.trim();
        if (!v) { input.style.borderColor = "#e05d5d"; return; }
        setKey(v);
        done(v);
      });
      wrap.querySelector("#sfl-key-cancel").addEventListener("click", cancel);
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") wrap.querySelector("#sfl-key-save").click();
        if (e.key === "Escape") cancel();
      });
    });
  }

  async function callAnthropic(prompt, key) {
    // prompt may be a plain string, or an object { messages, model, max_tokens, system }
    // (the object form carries vision content blocks — e.g. class-list images).
    var body;
    if (prompt && typeof prompt === "object" && !Array.isArray(prompt)) {
      body = {
        model: prompt.model || MODEL,
        max_tokens: prompt.max_tokens || 4096,
        messages: prompt.messages || [{ role: "user", content: prompt.content || "" }]
      };
      if (prompt.system) body.system = prompt.system;
    } else {
      body = { model: MODEL, max_tokens: 4096, messages: [{ role: "user", content: prompt }] };
    }
    var res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify(body)
    });
    if (res.status === 401 || res.status === 403) {
      var err = new Error("bad-key");
      err.badKey = true;
      throw err;
    }
    if (!res.ok) {
      var body = "";
      try { body = await res.text(); } catch (e) {}
      throw new Error("Anthropic API error " + res.status + (body ? ": " + body.slice(0, 200) : ""));
    }
    var data = await res.json();
    var text = "";
    (data.content || []).forEach(function (block) {
      if (block.type === "text") text += block.text;
    });
    return text;
  }

  window.claude = {
    complete: async function (prompt) {
      var key = getKey();
      if (!key) key = await askForKey();
      try {
        return await callAnthropic(prompt, key);
      } catch (e) {
        if (e && e.badKey) {
          clearKey();
          var newKey = await askForKey("That key was rejected. Please paste a valid Anthropic API key.");
          return await callAnthropic(prompt, newKey);
        }
        throw e;
      }
    }
  };
})();
