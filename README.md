# AI 调研问卷（GitHub Pages + 云端答卷）

外网扫码填写，主持页实时看结果并导出 CSV。

## 快速开始（发布）

完整步骤见 **[PUBLISH.md](PUBLISH.md)**（必读）：

1. 配置 Google 表格 + Apps Script，填入 [`js/backend-config.js`](js/backend-config.js)
2. 推送到 GitHub，开启 Pages
3. 填写 `publicBaseUrl`，打开 `admin.html` 投影二维码

## 本地预览（可选）

- 直接用浏览器打开 `index.html` / `admin.html`
- 或普通用户运行 `启动问卷.bat`（本机预览，无需管理员）

## 主要文件

| 文件 | 说明 |
| --- | --- |
| `index.html` | 手机填写页 |
| `admin.html` | 主持页（二维码 + 结果） |
| `js/backend-config.js` | **发布前必改**：云端地址与公网 URL |
| `scripts/google-apps-script.js` | 粘贴到 Google Apps Script |
| `PUBLISH.md` | 外网发布教程 |
