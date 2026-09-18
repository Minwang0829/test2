# AI 调研问卷（GitHub Pages + 普通表格）

外网扫码填写；主持页用**网页表格**看结果；导出 CSV 可用 **Excel / WPS** 打开。  
**不依赖 Google。** 发布前本仓库不含现成的 Pages 地址或 Supabase 密钥。

完整发布步骤见 **[PUBLISH.md](PUBLISH.md)**。也可在 Cursor 说：「按 publish-scan-survey 帮我发布问卷」。

## 地址

配好 `js/backend-config.js` 并开启 GitHub Pages 后：

- 填写：`https://<用户名>.github.io/<仓库>/`
- 主持：`https://<用户名>.github.io/<仓库>/admin.html`

（仓库 Settings → Pages：`main` / root。）

## 配置

编辑 [`js/backend-config.js`](js/backend-config.js)：把 `PASTE_YOUR_...` 换成自己的 Supabase Project URL、anon/publishable key，以及 Pages 根地址。  
建表 SQL：[`scripts/supabase-setup.sql`](scripts/supabase-setup.sql)
