/**
 * 静态页面 + 可选答卷汇总（零依赖，普通用户权限即可，不要用管理员运行）
 *
 * 默认只监听本机 127.0.0.1，不弹 Windows 防火墙、不需要管理员。
 * 若现场确需手机扫局域网码：set SURVEY_LAN=1 后再启动（防火墙若要管理员，请点取消）。
 *
 * 用法：node server.js
 */
const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { URL } = require("url");

const PORT = Number(process.env.PORT) || 3000;
const LAN = process.env.SURVEY_LAN === "1" || process.argv.includes("--lan");
const HOST = LAN ? "0.0.0.0" : "127.0.0.1";
const ROOT = __dirname;
// 写到用户目录，避免 OneDrive/权限问题；无需管理员
const DATA_DIR = path.join(
  process.env.LOCALAPPDATA || os.tmpdir(),
  "ai-survey-qr"
);
const DATA_FILE = path.join(DATA_DIR, "responses.json");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]", "utf8");
}

function readResponses() {
  ensureDataFile();
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    return [];
  }
}

function writeResponses(list) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), "utf8");
}

function lanIPs() {
  const nets = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === "IPv4" && !net.internal) ips.push(net.address);
    }
  }
  return ips;
}

function sendJson(res, status, body) {
  const data = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store",
  });
  res.end(data);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function safePath(urlPath) {
  let p = decodeURIComponent(urlPath.split("?")[0]);
  if (p === "/") p = "/index.html";
  p = path.normalize(p).replace(/^(\.\.[/\\])+/, "");
  const full = path.join(ROOT, p);
  if (!full.startsWith(ROOT)) return null;
  return full;
}

async function handleApi(req, res, pathname) {
  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return true;
  }

  if (pathname === "/api/health" && req.method === "GET") {
    sendJson(res, 200, { ok: true, mode: "live" });
    return true;
  }

  if (pathname === "/api/responses" && req.method === "GET") {
    sendJson(res, 200, { responses: readResponses() });
    return true;
  }

  if (pathname === "/api/responses" && req.method === "POST") {
    const raw = await readBody(req);
    let record;
    try {
      record = JSON.parse(raw);
    } catch {
      sendJson(res, 400, { error: "invalid_json" });
      return true;
    }
    if (!record || typeof record !== "object" || !record.answers) {
      sendJson(res, 400, { error: "invalid_record" });
      return true;
    }
    if (!record.id) record.id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    if (!record.submittedAt) record.submittedAt = new Date().toISOString();

    const list = readResponses();
    if (list.some((r) => r.id === record.id)) {
      sendJson(res, 200, { ok: true, duplicate: true, id: record.id });
      return true;
    }
    list.push(record);
    writeResponses(list);
    sendJson(res, 201, { ok: true, id: record.id, count: list.length });
    return true;
  }

  if (pathname === "/api/responses" && req.method === "DELETE") {
    writeResponses([]);
    sendJson(res, 200, { ok: true, count: 0 });
    return true;
  }

  return false;
}

function serveStatic(req, res, pathname) {
  const full = safePath(pathname);
  if (!full || !fs.existsSync(full) || fs.statSync(full).isDirectory()) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }
  const ext = path.extname(full).toLowerCase();
  res.writeHead(200, {
    "Content-Type": MIME[ext] || "application/octet-stream",
    "Cache-Control": ext === ".html" ? "no-store" : "public, max-age=300",
  });
  fs.createReadStream(full).pipe(res);
}

const server = http.createServer(async (req, res) => {
  try {
    const u = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    if (await handleApi(req, res, u.pathname)) return;
    serveStatic(req, res, u.pathname);
  } catch (err) {
    console.error(err);
    sendJson(res, 500, { error: "server_error" });
  }
});

ensureDataFile();

server.on("error", (err) => {
  console.error("");
  if (err && err.code === "EADDRINUSE") {
    console.error(`  端口 ${PORT} 已被占用。可换端口：set PORT=3001 && node server.js`);
  } else if (err && (err.code === "EACCES" || err.code === "EPERM")) {
    console.error("  权限不足。请勿用管理员运行；换一个大于 1024 的端口即可。");
  } else {
    console.error("  启动失败：", err.message || err);
  }
  console.error("");
  process.exit(1);
});

server.listen(PORT, HOST, () => {
  const ips = lanIPs();
  console.log("");
  console.log("  AI 调研问卷已启动（普通用户权限，无需管理员）");
  console.log(`  本机预览： http://127.0.0.1:${PORT}/admin.html`);
  console.log(`  答卷文件： ${DATA_FILE}`);
  if (LAN) {
    if (ips.length) {
      for (const ip of ips) {
        console.log(`  现场扫码： http://${ip}:${PORT}/admin.html`);
      }
    } else {
      console.log("  （未检测到局域网 IP，请确认 Wi-Fi / 热点已连接）");
    }
    console.log("  若弹出防火墙且需要管理员：请点「取消」，改用复制答卷方式。");
  } else {
    console.log("  当前仅本机可访问（不会触发防火墙）。");
    console.log("  现场要手机扫码时，请双击「启动问卷-局域网.bat」。");
  }
  console.log("");
});
