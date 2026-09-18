# AI 调研问卷（GitHub Pages + 普通表格）

外网扫码填写；主持页用**网页表格**看结果；导出 CSV 可用 **Excel / WPS** 打开。  
**不依赖 Google。**

完整发布步骤见 **[PUBLISH.md](PUBLISH.md)**。

## 地址（本仓库）

- 填写：https://minwang0829.github.io/test1/  
- 主持：https://minwang0829.github.io/test1/admin.html  

（需先在仓库 Settings → Pages 开启 `main` / root。）

## 配置

编辑 [`js/backend-config.js`](js/backend-config.js)：填入 Supabase Project URL 与 anon key。  
建表 SQL：[`scripts/supabase-setup.sql`](scripts/supabase-setup.sql)
