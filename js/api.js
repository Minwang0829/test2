/** 云端提交 / 拉取（Apps Script / Formspree / 本机） */
window.SurveyAPI = (function () {
  function cfg() {
    return window.SURVEY_BACKEND || { mode: "none" };
  }

  function endpoint() {
    return String(cfg().endpoint || "").trim();
  }

  function isConfigured() {
    const mode = cfg().mode;
    if (mode === "local" || mode === "none") return true;
    const ep = endpoint();
    return ep && !ep.includes("PASTE_YOUR_");
  }

  function publicSurveyUrl() {
    const base = String(cfg().publicBaseUrl || "").replace(/\/$/, "");
    if (base) return base + "/index.html";
    return new URL("index.html", window.location.href).href;
  }

  function publicAdminUrl() {
    const base = String(cfg().publicBaseUrl || "").replace(/\/$/, "");
    if (base) return base + "/admin.html";
    return new URL("admin.html", window.location.href).href;
  }

  function jsonp(url) {
    return new Promise((resolve, reject) => {
      const cb = "_survey_cb_" + Date.now() + "_" + Math.floor(Math.random() * 1e6);
      const timer = setTimeout(() => {
        cleanup();
        reject(new Error("timeout"));
      }, 20000);

      function cleanup() {
        clearTimeout(timer);
        delete window[cb];
        if (script && script.parentNode) script.parentNode.removeChild(script);
      }

      window[cb] = function (data) {
        cleanup();
        resolve(data);
      };

      const script = document.createElement("script");
      const join = url.indexOf("?") >= 0 ? "&" : "?";
      script.src = url + join + "callback=" + encodeURIComponent(cb);
      script.onerror = function () {
        cleanup();
        reject(new Error("script_error"));
      };
      document.body.appendChild(script);
    });
  }

  function postViaHiddenForm(url, record) {
    return new Promise((resolve) => {
      const name = "gas_iframe_" + Date.now();
      const iframe = document.createElement("iframe");
      iframe.name = name;
      iframe.style.display = "none";
      document.body.appendChild(iframe);

      const form = document.createElement("form");
      form.method = "POST";
      form.action = url;
      form.target = name;
      form.style.display = "none";

      const input = document.createElement("input");
      input.type = "hidden";
      input.name = "payload";
      input.value = JSON.stringify(record);
      form.appendChild(input);
      document.body.appendChild(form);
      form.submit();

      setTimeout(() => {
        try {
          form.remove();
          iframe.remove();
        } catch (_) {}
        resolve(true);
      }, 1800);
    });
  }

  async function submit(record) {
    const mode = cfg().mode || "none";

    if (mode === "local") {
      try {
        const res = await fetch("/api/responses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(record),
        });
        if (!res.ok) return false;
        const data = await res.json();
        return Boolean(data && data.ok);
      } catch {
        return false;
      }
    }

    if (mode === "formspree") {
      if (!isConfigured()) return false;
      try {
        const res = await fetch(endpoint(), {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            ...record.answers,
            _surveyId: record.id,
            _submittedAt: record.submittedAt,
            _raw: JSON.stringify(record),
          }),
        });
        return res.ok;
      } catch {
        return false;
      }
    }

    if (mode === "appscript") {
      if (!isConfigured()) return false;
      try {
        await postViaHiddenForm(endpoint(), record);
        return true;
      } catch {
        return false;
      }
    }

    return false;
  }

  async function listResponses() {
    const mode = cfg().mode || "none";

    if (mode === "local") {
      const res = await fetch("/api/responses", { cache: "no-store" });
      if (!res.ok) throw new Error("local_fail");
      const data = await res.json();
      return Array.isArray(data.responses) ? data.responses : [];
    }

    if (mode === "appscript") {
      if (!isConfigured()) throw new Error("not_configured");
      const token = encodeURIComponent(cfg().adminToken || "");
      const url =
        endpoint() +
        (endpoint().indexOf("?") >= 0 ? "&" : "?") +
        "action=list&token=" +
        token;
      const data = await jsonp(url);
      if (data && data.error) throw new Error(data.error);
      return Array.isArray(data.responses) ? data.responses : [];
    }

    throw new Error("unsupported_list");
  }

  async function clearResponses() {
    const mode = cfg().mode || "none";

    if (mode === "local") {
      const res = await fetch("/api/responses", { method: "DELETE" });
      return res.ok;
    }

    if (mode === "appscript") {
      if (!isConfigured()) throw new Error("not_configured");
      const token = encodeURIComponent(cfg().adminToken || "");
      const url =
        endpoint() +
        (endpoint().indexOf("?") >= 0 ? "&" : "?") +
        "action=clear&token=" +
        token;
      const data = await jsonp(url);
      return Boolean(data && data.ok);
    }

    return false;
  }

  return {
    cfg,
    isConfigured,
    publicSurveyUrl,
    publicAdminUrl,
    submit,
    listResponses,
    clearResponses,
  };
})();
