(function () {
  const STORAGE_KEY = window.SURVEY.storageKey;
  const formEl = document.getElementById("survey-form");
  const formView = document.getElementById("form-view");
  const doneView = document.getElementById("done-view");
  const errorEl = document.getElementById("form-error");
  const progressFill = document.getElementById("progress-fill");
  const progressText = document.getElementById("progress-text");
  const payloadEl = document.getElementById("payload-text");
  const copyBtn = document.getElementById("copy-payload");
  const fallbackBox = document.getElementById("fallback-box");
  const doneMsg = document.getElementById("done-msg");
  const submitBtn = document.getElementById("submit-btn");
  const questionsRoot = document.getElementById("questions");

  function loadResponses() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveResponses(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderQuestions() {
    const html = window.SURVEY.questions
      .map((q, index) => {
        const n = index + 1;
        const req = q.required
          ? '<span class="req" aria-hidden="true">*</span>'
          : "";
        let body = "";

        if (q.type === "single") {
          body = `<div class="options" role="radiogroup" aria-labelledby="q-${q.id}">${q.options
            .map(
              (opt) => `
            <label class="opt">
              <input type="radio" name="${q.id}" value="${escapeHtml(opt)}" ${q.required ? "required" : ""} />
              <span>${escapeHtml(opt)}</span>
            </label>`
            )
            .join("")}</div>`;
        } else if (q.type === "multi") {
          body = `<div class="options" role="group" aria-labelledby="q-${q.id}">${q.options
            .map(
              (opt) => `
            <label class="opt">
              <input type="checkbox" name="${q.id}" value="${escapeHtml(opt)}" />
              <span>${escapeHtml(opt)}</span>
            </label>`
            )
            .join("")}</div>`;
        } else if (q.type === "scale") {
          const cells = [];
          for (let i = q.min; i <= q.max; i += 1) {
            cells.push(`
              <label class="scale-opt">
                <input type="radio" name="${q.id}" value="${i}" ${q.required ? "required" : ""} />
                <strong>${i}</strong>
              </label>`);
          }
          body = `
            <div class="scale" role="radiogroup" aria-labelledby="q-${q.id}">${cells.join("")}</div>
            <div class="scale-labels"><span>${escapeHtml(q.minLabel || "")}</span><span>${escapeHtml(q.maxLabel || "")}</span></div>`;
        } else if (q.type === "text") {
          body = `<textarea name="${q.id}" rows="3" placeholder="${escapeHtml(q.placeholder || "")}" ${q.required ? "required" : ""}></textarea>`;
        }

        return `
          <section class="q" data-qid="${q.id}">
            <h3 class="q-label" id="q-${q.id}">
              <span class="q-num">${n}.</span>
              <span>${escapeHtml(q.label)} ${req}</span>
            </h3>
            ${body}
          </section>`;
      })
      .join("");

    questionsRoot.innerHTML = html;
  }

  function collectAnswers() {
    const answers = {};
    const missing = [];

    for (const q of window.SURVEY.questions) {
      if (q.type === "multi") {
        const checked = [
          ...formEl.querySelectorAll(`input[name="${q.id}"]:checked`),
        ].map((el) => el.value);
        answers[q.id] = checked;
        if (q.required && checked.length === 0) missing.push(q.label);
      } else if (q.type === "text") {
        const val = (formEl.elements[q.id]?.value || "").trim();
        answers[q.id] = val;
        if (q.required && !val) missing.push(q.label);
      } else {
        const val = formEl.elements[q.id]?.value || "";
        answers[q.id] = val;
        if (q.required && !val) missing.push(q.label);
      }
    }

    return { answers, missing };
  }

  function updateProgress() {
    const total = window.SURVEY.questions.filter((q) => q.required).length;
    let done = 0;

    for (const q of window.SURVEY.questions) {
      if (!q.required) continue;
      if (q.type === "multi") {
        if (formEl.querySelector(`input[name="${q.id}"]:checked`)) done += 1;
      } else if (q.type === "text") {
        if ((formEl.elements[q.id]?.value || "").trim()) done += 1;
      } else if (formEl.elements[q.id]?.value) {
        done += 1;
      }
    }

    const pct = total ? Math.round((done / total) * 100) : 0;
    progressFill.style.width = `${pct}%`;
    progressText.textContent = `已完成 ${done} / ${total}`;
  }

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.classList.add("is-visible");
  }

  function clearError() {
    errorEl.textContent = "";
    errorEl.classList.remove("is-visible");
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

  function encodePayload(record) {
    return "AISV1:" + btoa(unescape(encodeURIComponent(JSON.stringify(record))));
  }

  async function trySubmitToServer(record) {
    if (!window.SurveyAPI) return false;
    try {
      return await window.SurveyAPI.submit(record);
    } catch {
      return false;
    }
  }

  function showDone(record, synced) {
    const payload = encodePayload(record);
    payloadEl.textContent = payload;

    if (synced) {
      doneMsg.textContent = "已经收到啦，谢谢你抽空分享。可以直接合上手机～";
      fallbackBox.hidden = true;
    } else {
      doneMsg.textContent =
        "本机已保存。若主持端没有自动收到，点下面复制，发给主持就行。";
      fallbackBox.hidden = false;
    }

    formView.hidden = true;
    doneView.classList.add("is-visible");
    doneView.hidden = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  formEl.addEventListener("change", updateProgress);
  formEl.addEventListener("input", updateProgress);

  formEl.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearError();

    const { answers, missing } = collectAnswers();
    if (missing.length) {
      showError("还有几题没填完，标了 * 的都点一下就好～");
      for (const q of window.SURVEY.questions) {
        if (missing.includes(q.label)) {
          document.querySelector(`[data-qid="${q.id}"]`)?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          break;
        }
      }
      return;
    }

    const record = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      submittedAt: new Date().toISOString(),
      answers,
    };

    const list = loadResponses();
    list.push(record);
    saveResponses(list);

    submitBtn.disabled = true;
    submitBtn.textContent = "正在提交…";
    const synced = await trySubmitToServer(record);
    submitBtn.disabled = false;
    submitBtn.textContent = "提交，谢谢！";
    showDone(record, synced);
  });

  copyBtn.addEventListener("click", async () => {
    const text = payloadEl.textContent || "";
    try {
      await navigator.clipboard.writeText(text);
      showToast("已复制，发给主持就好");
    } catch {
      const range = document.createRange();
      range.selectNodeContents(payloadEl);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      showToast("请长按选中后手动复制");
    }
  });

  document.getElementById("brand-title").textContent = window.SURVEY.title;
  document.getElementById("brand-sub").textContent = window.SURVEY.subtitle;
  renderQuestions();
  updateProgress();
})();
