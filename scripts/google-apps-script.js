/**
 * 粘贴到：Google 表格 → 扩展程序 → Apps Script
 *
 * 部署：部署 → 新建部署 → 类型选「网页应用」
 *   - 执行身份：我
 *   - 谁可以访问：任何人
 * 把「网页应用」URL 填进 js/backend-config.js 的 endpoint
 * ADMIN_TOKEN 必须与 backend-config.js 里一致
 */
var ADMIN_TOKEN = "change-this-admin-token";
var SHEET_NAME = "responses";

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      "id",
      "submittedAt",
      "role",
      "frequency",
      "usage",
      "satisfaction",
      "painpoints",
      "interest",
      "concerns",
      "wish",
      "rawJson",
    ]);
  }
  return sheet;
}

function doGet(e) {
  e = e || { parameter: {} };
  var p = e.parameter || {};
  var action = p.action || "list";
  var token = p.token || "";
  var callback = p.callback || "";

  if (token !== ADMIN_TOKEN) {
    return respond_( { error: "unauthorized" }, callback);
  }

  if (action === "clear") {
    var sheet = getSheet_();
    var last = sheet.getLastRow();
    if (last > 1) sheet.deleteRows(2, last - 1);
    return respond_({ ok: true, count: 0 }, callback);
  }

  return respond_({ responses: readResponses_() }, callback);
}

function doPost(e) {
  try {
    var body = {};
    if (e.postData && e.postData.contents) {
      try {
        body = JSON.parse(e.postData.contents);
      } catch (ignore1) {
        body = {};
      }
    }
    if ((!body || !body.answers) && e.parameter && e.parameter.payload) {
      body = JSON.parse(e.parameter.payload);
    }
    if (!body || !body.answers) {
      return respond_({ error: "invalid_record" });
    }
    if (!body.id) body.id = Utilities.getUuid();
    if (!body.submittedAt) body.submittedAt = new Date().toISOString();

    var sheet = getSheet_();
    var existing = sheet.getDataRange().getValues();
    for (var i = 1; i < existing.length; i++) {
      if (String(existing[i][0]) === String(body.id)) {
        return respond_({ ok: true, duplicate: true, id: body.id });
      }
    }

    var a = body.answers || {};
    sheet.appendRow([
      body.id,
      body.submittedAt,
      flat_(a.role),
      flat_(a.frequency),
      flat_(a.usage),
      flat_(a.satisfaction),
      flat_(a.painpoints),
      flat_(a.interest),
      flat_(a.concerns),
      flat_(a.wish),
      JSON.stringify(body),
    ]);

    return respond_({ ok: true, id: body.id });
  } catch (err) {
    return respond_({ error: String(err) });
  }
}

function readResponses_() {
  var sheet = getSheet_();
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  var out = [];
  for (var i = 1; i < values.length; i++) {
    var raw = values[i][10];
    if (raw) {
      try {
        out.push(JSON.parse(raw));
        continue;
      } catch (ignore2) {}
    }
    out.push({
      id: values[i][0],
      submittedAt: values[i][1],
      answers: {
        role: values[i][2],
        frequency: values[i][3],
        usage: String(values[i][4] || "")
          .split("；")
          .filter(Boolean),
        satisfaction: values[i][5],
        painpoints: String(values[i][6] || "")
          .split("；")
          .filter(Boolean),
        interest: values[i][7],
        concerns: String(values[i][8] || "")
          .split("；")
          .filter(Boolean),
        wish: values[i][9],
      },
    });
  }
  return out;
}

function flat_(v) {
  if (Object.prototype.toString.call(v) === "[object Array]") return v.join("；");
  if (v == null) return "";
  return String(v);
}

/** JSON 或 JSONP（供 GitHub Pages 跨域读取） */
function respond_(obj, callback) {
  var text = JSON.stringify(obj);
  if (callback) {
    return ContentService.createTextOutput(callback + "(" + text + ")").setMimeType(
      ContentService.MimeType.JAVASCRIPT
    );
  }
  return ContentService.createTextOutput(text).setMimeType(
    ContentService.MimeType.JSON
  );
}
