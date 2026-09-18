# 发布到 GitHub（外网扫码 + 普通表格看结果）

**不使用 Google。** 答卷存在 Supabase，主持页用网页表格展示，导出 CSV 后可用 Excel / WPS 打开。

全程不需要电脑管理员权限。

---

## 一、接好答卷库（Supabase，约 5 分钟）

1. 打开 [https://supabase.com](https://supabase.com) 注册/登录（可用 GitHub 账号）
2. 首页点 **Start your project** → **New project** → 记住数据库密码 → 等项目 Ready
3. 左侧 **SQL → New query**，粘贴本仓库 [`scripts/supabase-setup.sql`](scripts/supabase-setup.sql) 全部内容 → **Run**
4. 都在 **Settings** 里复制两项发给 Agent（用户不必自己拼 URL）：
   - **Settings → General → Project ID**（Agent 会写成 `https://<Project ID>.supabase.co`）
   - **Settings → API Keys → Publishable key**（点复制；不要用 secret）
5. 打开本仓库 [`js/backend-config.js`](js/backend-config.js)，改成：

```js
mode: "supabase",
endpoint: "PASTE_YOUR_SUPABASE_URL",   // Project URL，形如 https://xxxxx.supabase.co
anonKey: "PASTE_YOUR_ANON_KEY",        // anon / publishable key
table: "survey_responses",
publicBaseUrl: "PASTE_YOUR_PAGES_URL", // 形如 https://<用户名>.github.io/<仓库>
```

6. 保存后 `git add` / `commit` / `push`

> 备选：若只用邮箱收结果，可把 `mode` 改成 `"formspree"`，`endpoint` 填 Formspree 地址（主持页网页表格不会自动汇总）。

---

## 二、自己的 GitHub 仓库 + Pages

若还没有任何仓库地址：打开 [https://github.com/new](https://github.com/new)，按页面**默认**创建（README / gitignore / license 默认没勾，保持即可），把 `https://github.com/<用户名>/<仓库>.git` 设为本地 `origin` 后再 push。

代码已在自己的 `main` 上之后：

1. 打开 `https://github.com/<用户名>/<仓库>/settings/pages`  
2. Source：**Deploy from a branch**  
3. Branch：`main` ，文件夹：`/ (root)` → **Save**  
4. 一两分钟后访问：
   - 填写：`https://<用户名>.github.io/<仓库>/`  
   - 主持：`https://<用户名>.github.io/<仓库>/admin.html`  

---

## 三、开会怎么用

| 角色 | 打开 |
| --- | --- |
| 主持投影二维码 | `https://<用户名>.github.io/<仓库>/admin.html` |
| 手机扫码填写 | `https://<用户名>.github.io/<仓库>/` |
| 看结果 | 主持页右侧**普通表格**（自动刷新） |
| 导出 | 点「导出 CSV」，用 Excel / WPS 打开 |

---

## 四、改完如何再推到 GitHub

在项目根目录（PowerShell）：

```powershell
git status
git add .
git commit -m "更新问卷"
git push
```

推完等 1–2 分钟，刷新 Pages。也可在 Cursor 说：「帮我推上去」。

密钥只用 **anon / publishable**（`eyJ...` 或 `sb_publishable_...`），不要把 `sb_secret_...` 写进仓库。

---

## 五、自检清单

- [ ] Supabase SQL 已成功执行
- [ ] `endpoint` / `anonKey` 已填，不是 `PASTE_YOUR_...`
- [ ] Pages 用手机流量能打开
- [ ] 自己先填一份，主持页表格能看到新行（非「离线备用」）
- [ ] 导出 CSV 能用 Excel 打开

---

## 六、同事要自己的问卷（复用本模板）

每人一套：**自己的 Fork + 自己的 Supabase + 自己的 Pages**（不要共用答卷库）。

1. Fork 本仓库 → 开自己的 GitHub Pages（`main` / root）
2. 新建 Supabase 项目 → Run [`scripts/supabase-setup.sql`](scripts/supabase-setup.sql)
3. 改 [`js/backend-config.js`](js/backend-config.js)：自己的 URL、publishable/anon、`publicBaseUrl`
4. 改 [`js/survey-config.js`](js/survey-config.js) 题目 → `git push`
5. 分享：`https://<用户名>.github.io/<仓库>/` 与 `.../admin.html`

本仓库含项目 Skill：`.cursor/skills/publish-scan-survey/`（仅在本项目生效）。在 Cursor 打开本仓库时可说：「按 publish-scan-survey 帮我发布问卷」。
