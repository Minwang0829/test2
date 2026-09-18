(function () {
  const STORAGE_KEY = window.SURVEY.storageKey;
  const countEl = document.getElementById("response-count");
  const modeEl = document.getElementById("live-mode");
  const tableBody = document.getElementById("table-body");
  const importBox = document.getElementById("import-box");
  const urlEl = document.getElementById("survey-url");
  const qrHost = document.getElementById("qrcode");

  let liveMode = false;
  let cache = [];

  function loadLocal() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveLocal(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function currentList() {
    return liveMode ? cache : loadLocal();
  }

  function showToast(msg) {
    let toast = document.querySelector(".toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add("is-visible");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove("is-visible"), 2200);
  }

  function surveyUrl() {
    if (window.SurveyAPI) return window.SurveyAPI.publicSurveyUrl();
    return new URL("index.html", window.location.href).href;
  }

  function decodePayload(line) {
    const trimmed = line.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith("AISV1:")) {
      const b64 = trimmed.slice(6);
      const json = decodeURIComponent(escape(atob(b64)));
      return JSON.parse(json);
    }
    if (trimmed.startsWith("{")) return JSON.parse(trimmed);
    return null;
  }

  function answerDisplay(value) {
    if (Array.isArray(value)) return value.join("；");
    if (value == null || value === "") return "";
    return String(value);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderTable(list) {
    countEl.textContent = String(list.length);

    if (!list.length) {
      tableBody.innerHTML =
        '<tr><td colspan="99" style="white-space:normal;color:#4a5c62;">还没有答卷。配置好云端后端并发布后，这里会自动更新。</td></tr>';
      return;
    }

    const headers = window.SURVEY.questions.map((q) => q.label);
    document.getElementById("table-head").innerHTML =
      "<tr><th>#</th><th>提交时间</th>" +
      headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("") +
      "</tr>";

    tableBody.innerHTML = list
      .map((rec, i) => {
        const cells = window.SURVEY.questions
          .map((q) => {
            const v = answerDisplay(rec.answers?.[q.id]);
            return `<td title="${escapeHtml(v)}">${escapeHtml(v)}</td>`;
          })
          .join("");
        const time = rec.submittedAt
          ? new Date(rec.submittedAt).toLocaleString()
          : "";
        return `<tr><td>${i + 1}</td><td>${escapeHtml(time)}</td>${cells}</tr>`;
      })
      .join("");
  }

  function setMode(isLive, label) {
    liveMode = isLive;
    if (modeEl) {
      modeEl.textContent = label || (isLive ? "云端已连接" : "离线备用");
      modeEl.classList.toggle("is-live", isLive);
    }
  }

  function csvEscape(val) {
    const s = String(val ?? "");
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  }

  function exportCsv(list) {
    const cols = ["id", "submittedAt", ...window.SURVEY.questions.map((q) => q.id)];
    const headerLabels = [
      "id",
      "submittedAt",
      ...window.SURVEY.questions.map((q) => q.label),
    ];
    const lines = [headerLabels.map(csvEscape).join(",")];
    for (const rec of list) {
      const row = cols.map((key) => {
        if (key === "id") return csvEscape(rec.id || "");
        if (key === "submittedAt") return csvEscape(rec.submittedAt || "");
        const v = rec.answers?.[key];
        if (Array.isArray(v)) return csvEscape(v.join("；"));
        return csvEscape(v ?? "");
      });
      lines.push(row.join(","));
    }
    const blob = new Blob(["\uFEFF" + lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `ai-survey-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function renderQr() {
    const url = surveyUrl();
    urlEl.textContent = url;
    qrHost.innerHTML = "";
    if (typeof QRCode === "undefined") {
      qrHost.textContent = "二维码加载失败，刷新一下或检查网络。";
      return;
    }
    new QRCode(qrHost, {
      text: url,
      width: 260,
      height: 260,
      colorDark: "#0c1a1f",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M,
    });
  }

  async function refreshFromServer() {
    const mode = window.SurveyAPI?.cfg()?.mode;
    if (mode === "formspree") {
      setMode(false, "Formspree");
      renderTable(loadLocal());
      return false;
    }
    try {
      const list = await window.SurveyAPI.listResponses();
      cache = list;
      setMode(true, mode === "supabase" ? "云端表格已连接" : "实时汇总中");
      renderTable(cache);
      return true;
    } catch {
      setMode(false, "离线备用");
      renderTable(loadLocal());
      return false;
    }
  }

  document.getElementById("btn-export").addEventListener("click", () => {
    const list = currentList();
    if (!list.length) {
      showToast("还没有数据可导出");
      return;
    }
    exportCsv(list);
    showToast("CSV 已下载");
  });

  document.getElementById("btn-clear").addEventListener("click", async () => {
    if (!confirm("确定清空已汇总的全部答卷？此操作不可恢复。")) return;
    if (liveMode && window.SurveyAPI) {
      try {
        await window.SurveyAPI.clearResponses();
        cache = [];
      } catch {
        showToast("清空失败，请检查后端配置");
        return;
      }
    } else {
      saveLocal([]);
    }
    renderTable(currentList());
    showToast("已清空");
  });

  document.getElementById("btn-import").addEventListener("click", async () => {
    const text = importBox.value || "";
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (!lines.length) {
      showToast("请先粘贴答卷文本");
      return;
    }

    const existing = currentList();
    const byId = new Map(existing.map((r) => [r.id, r]));
    let added = 0;
    let skipped = 0;
    let errors = 0;
    const toUpload = [];

    for (const line of lines) {
      try {
        const rec = decodePayload(line);
        if (!rec || !rec.answers) {
          errors += 1;
          continue;
        }
        if (!rec.id) rec.id = String(Date.now()) + Math.random();
        if (!rec.submittedAt) rec.submittedAt = new Date().toISOString();
        if (byId.has(rec.id)) {
          skipped += 1;
          continue;
        }
        byId.set(rec.id, rec);
        toUpload.push(rec);
        added += 1;
      } catch {
        errors += 1;
      }
    }

    const merged = [...byId.values()];
    if (liveMode && window.SurveyAPI) {
      for (const rec of toUpload) {
        await window.SurveyAPI.submit(rec);
      }
      await refreshFromServer();
    } else {
      saveLocal(merged);
      renderTable(merged);
    }

    importBox.value = "";
    let msg = `导入 ${added} 条`;
    if (skipped) msg += `，跳过重复 ${skipped}`;
    if (errors) msg += `，失败 ${errors}`;
    showToast(msg);
  });

  document.getElementById("btn-copy-url").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(surveyUrl());
      showToast("链接已复制");
    } catch {
      showToast("复制失败，请手动选择链接");
    }
  });

  document.getElementById("brand-title").textContent = window.SURVEY.title;
  document.getElementById("brand-sub").textContent =
    "外网扫码填写；答卷进云端后，右侧可刷新查看并导出 CSV。";

  const hint = document.getElementById("config-hint");
  if (hint && window.SurveyAPI && !window.SurveyAPI.isConfigured()) {
    hint.hidden = false;
  }
  if (hint && window.SurveyAPI?.cfg()?.mode === "formspree") {
    hint.hidden = false;
    hint.textContent =
      "当前为 Formspree 模式：答卷请到 Formspree 控制台查看；本页表格仅显示本机导入数据。";
  }

  renderQr();
  refreshFromServer().then((ok) => {
    if (ok) setInterval(refreshFromServer, 4000);
  });
})();
