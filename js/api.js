/** 云端提交 / 拉取（Supabase / Formspree / 本机）—— 不依赖 Google */
window.SurveyAPI = (function () {
  function cfg() {
    return window.SURVEY_BACKEND || { mode: "none" };
  }

  function endpoint() {
    return String(cfg().endpoint || "").trim().replace(/\/$/, "");
  }

  function tableName() {
    return String(cfg().table || "survey_responses").trim() || "survey_responses";
  }

  function anonKey() {
    return String(cfg().anonKey || "").trim();
  }

  function isConfigured() {
    const mode = cfg().mode;
    if (mode === "local" || mode === "none") return true;
    const ep = endpoint();
    if (!ep || ep.includes("PASTE_YOUR_")) return false;
    if (mode === "supabase") {
      const key = anonKey();
      return key && !key.includes("PASTE_YOUR_");
    }
    return true;
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

  function supabaseHeaders(extra) {
    const key = anonKey();
    return Object.assign(
      {
        apikey: key,
        Authorization: "Bearer " + key,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      extra || {}
    );
  }

  function rowToRecord(row) {
    return {
      id: row.id,
      submittedAt: row.submitted_at || row.submittedAt,
      answers: row.answers || {},
    };
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

    if (mode === "supabase") {
      if (!isConfigured()) return false;
      try {
        const url = endpoint() + "/rest/v1/" + encodeURIComponent(tableName());
        const res = await fetch(url, {
          method: "POST",
          headers: supabaseHeaders({
            Prefer: "resolution=ignore-duplicates,return=minimal",
          }),
          body: JSON.stringify({
            id: record.id,
            submitted_at: record.submittedAt,
            answers: record.answers,
          }),
        });
        // 201 created, 200 ok, 409 duplicate treated as success
        return res.ok || res.status === 409;
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

    if (mode === "supabase") {
      if (!isConfigured()) throw new Error("not_configured");
      const url =
        endpoint() +
        "/rest/v1/" +
        encodeURIComponent(tableName()) +
        "?select=id,submitted_at,answers&order=submitted_at.asc";
      const res = await fetch(url, {
        headers: supabaseHeaders({ Accept: "application/json" }),
        cache: "no-store",
      });
      if (!res.ok) throw new Error("supabase_list_fail");
      const rows = await res.json();
      return Array.isArray(rows) ? rows.map(rowToRecord) : [];
    }

    throw new Error("unsupported_list");
  }

  async function clearResponses() {
    const mode = cfg().mode || "none";

    if (mode === "local") {
      const res = await fetch("/api/responses", { method: "DELETE" });
      return res.ok;
    }

    if (mode === "supabase") {
      if (!isConfigured()) throw new Error("not_configured");
      // PostgREST: DELETE with a filter that matches all rows
      const url =
        endpoint() +
        "/rest/v1/" +
        encodeURIComponent(tableName()) +
        "?id=neq.";
      const res = await fetch(url, {
        method: "DELETE",
        headers: supabaseHeaders(),
      });
      return res.ok;
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
