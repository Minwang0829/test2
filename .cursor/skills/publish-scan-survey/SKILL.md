---
name: publish-scan-survey
description: >-
  Project-only skill for this survey repo. Publish a blank scan-to-fill
  questionnaire to GitHub Pages with Supabase (admin table + CSV, no Google).
  Colleagues start with no GitHub repo URL and no Supabase project.
  Use in this workspace when the user asks to 发布问卷, 扫码问卷, GitHub Pages 问卷,
  Supabase 答卷, 主持页收不到, 帮我推上去, 分享给同事, or 我还没有 GitHub 仓库.
---

# 扫码问卷发布（GitHub Pages + Supabase）

把「已有问卷文件夹」发到公网：手机扫码填写，主持页实时收卷并导出 CSV。  
**不依赖 Google。** GitHub Pages 只托管静态页；答卷必须进 **Supabase**。

## 默认前提（同事从零开始）

接到本文件夹的人通常：

- **没有**现成的 GitHub 仓库地址，也 **没有** Pages 网址
- **没有** Supabase 项目 / 密钥
- `js/backend-config.js` 里是 `PASTE_YOUR_...`
- 本机可能没有 `gh`；**在 GitHub 网站上**新建仓库，不要假设能命令行建库
- 本地 `origin` 可能不存在，或仍指向别人已删的仓库 → **不要沿用**，必须改成用户自己新建的地址

不要 Fork 某个现成问卷站，也不要填别人的 `publicBaseUrl` / Supabase。

发布后（用用户自己的用户名和仓库名替换）：

- 填写：`https://<user>.github.io/<repo>/`
- 主持：`https://<user>.github.io/<repo>/admin.html`

本地文件：

- 建表 SQL：`scripts/supabase-setup.sql`
- 云端配置：`js/backend-config.js`
- 题目：`js/survey-config.js`

## Agent 操作原则

1. **网页端**（GitHub 新建仓库 / Pages；Supabase 注册 / SQL Run / 复制密钥）：引导用户点，Agent 不能代登。
2. **本地 git remote + 配置 + commit/push**：用户给出新仓库 URL、并说「帮我推上去」后再执行。
3. **禁止**把 `sb_secret_...` / `service_role` 写入仓库；只用 **publishable / anon**。
4. 每人/每套问卷用**自己的** GitHub 仓库 + **自己的** Supabase；共用会串站、混库。
5. 推送后提醒等 Pages **1–2 分钟**，强制刷新主持页验证。
6. **禁止**把当前用户的 GitHub 用户名、仓库 URL、Pages 地址、Supabase Project URL / anon key 写入 `SKILL.md`、`share-template.md` 或其它通用说明。Skill 只保留 `<user>` / `<repo>` / `PASTE_YOUR_...` 占位。个人配置只写进这位用户自己的 `js/backend-config.js`（以及本次对话里的 git remote）。

## 完整流程（复用清单）

```
- [ ] A. 用户在 GitHub 网站新建仓库（保持默认：不初始化 README），把仓库 URL 发给 Agent
- [ ] B. 本地 origin 指到该 URL；用户开启 Pages（main / root）
- [ ] C. 用户新建自己的 Supabase 项目
- [ ] D. SQL 建表 + RLS 已 Run
- [ ] E. 填好 backend-config.js（无 PASTE_YOUR_）
- [ ] F. 改好题目 survey-config.js（如需）
- [ ] G. commit + push（仅用户明确要求时）
- [ ] H. 主持页非「离线备用」；试填一份有新行
```

### A. 在 GitHub 网站新建仓库（没有现成地址时必做）

1. 打开 https://github.com/new（需已登录 GitHub 账号；没有账号先 https://github.com/signup）。
2. Repository name 自定（如 `survey-publish`）。
3. Public 即可（Private 也行，但 Pages 可能要额外设置）。
4. 保持页面**默认**：Add a README、.gitignore、license **默认都是没勾的**，不要去勾上（本地已有代码）。
5. Create repository。
6. 用户把 HTTPS 地址发给 Agent，形如 `https://github.com/<user>/<repo>.git`。
7. Agent 在项目根目录把 remote 换成这个地址（Windows PowerShell，分行；勿用 bash `&&`）：

```powershell
git remote -v
git remote remove origin
git remote add origin https://github.com/<user>/<repo>.git
git remote -v
```

若 `remove origin` 报没有 origin，跳过那一行，只 `git remote add origin ...`。

此时还不要 push，等用户配好 Supabase 并说「帮我推上去」。若用户只想先把空模板推上去，须用户明确同意。

### B. 开启 GitHub Pages

代码至少 push 过一次 `main` 之后：

1. 仓库 **Settings → Pages** → Deploy from a branch → `main` + `/ (root)` → Save。
2. 记下公网根地址：`https://<user>.github.io/<repo>`（不要末尾斜杠，写入 `publicBaseUrl` 时统一）。

### C–D. Supabase（用户在浏览器，必须自己的新项目）

1. 打开 https://supabase.com（未登录先登录）。首页点绿色 **Start your project** → 再点 **New project**（已验证路径；不要只写「打开官网就 New project」）。
2. 填项目名、数据库密码（自己记住，前端不用）、Region → Create → 等到 **Ready**。
3. **SQL Editor** → 粘贴下方 SQL（或仓库 `scripts/supabase-setup.sql`）→ **Run** → Success。
4. 两项都在左侧 **Settings** 里取（不要去 CONFIGURATION → Integrations / Data API 找 URL）：
   - **Settings → General → Project ID**：让用户把 **Project ID** 发给 Agent（用户不必自己拼 URL）。Agent 写入 `endpoint` = `https://<Project ID>.supabase.co`。
   - **Settings → API Keys → Publishable key**：点复制后发给 Agent（`sb_publishable_...`）。不要用 secret / service_role。旧界面也可在 **Legacy anon, service_role API keys** 里复制 **anon**（`eyJ...`）。
   - 若用户误贴 `sb_secret_...`：拒绝写入前端，要求换 publishable，并建议轮换已泄露的 secret。

**建表 SQL（整段一次）：**

```sql
create table if not exists public.survey_responses (
  id text primary key,
  submitted_at timestamptz not null default now(),
  answers jsonb not null default '{}'::jsonb
);

alter table public.survey_responses enable row level security;

drop policy if exists "survey_insert_anon" on public.survey_responses;
create policy "survey_insert_anon"
  on public.survey_responses for insert to anon, authenticated with check (true);

drop policy if exists "survey_select_anon" on public.survey_responses;
create policy "survey_select_anon"
  on public.survey_responses for select to anon, authenticated using (true);

drop policy if exists "survey_delete_anon" on public.survey_responses;
create policy "survey_delete_anon"
  on public.survey_responses for delete to anon, authenticated using (true);
```

### E. 写 `js/backend-config.js`

用户发来 **Project ID** 和 **Publishable key** 后，Agent 把三个 `PASTE_YOUR_...` 换成这位用户自己的值（**不要**把这些值写回 skill）：

- `endpoint`：由 Project ID 拼成 `https://<Project ID>.supabase.co`
- `anonKey`：Publishable key
- `publicBaseUrl`：由该用户 GitHub 用户名和仓库名拼成 `https://<user>.github.io/<repo>`（无末尾斜杠）

```js
window.SURVEY_BACKEND = {
  mode: "supabase",
  endpoint: "https://xxxx.supabase.co",
  anonKey: "sb_publishable_...或 eyJ...",
  table: "survey_responses",
  publicBaseUrl: "https://<user>.github.io/<repo>",
};
```

`publicBaseUrl` 决定主持页二维码指向的填写链接，必须是用户自己的 Pages 根地址。

### F. 改题目（可选）

编辑 `js/survey-config.js`：`title` / `questions`（`single` | `multi` | `scale` | `text`）。

### G. 推送到 GitHub

PowerShell（项目根目录）：

```powershell
git status
git add .
git commit -m "Configure Supabase and publish survey"
git push -u origin main
```

仅在用户明确要求提交/推送时执行。Windows 勿用 bash `&&` 链；用 `;` 或分行。  
若 GitHub 要登录，引导用户在浏览器完成认证，Agent 不代替输入密码。

### H. 验收

| 检查 | 期望 |
| --- | --- |
| 填写页 | 手机流量能打开、能提交 |
| 主持页 | 非「离线备用」；试填后表格有新行 |
| 导出 | 「导出 CSV」可用 Excel/WPS 打开 |

## 给同事这一套文件夹

把整个问卷项目文件夹拷给他（含 `.cursor/skills/publish-scan-survey/`）。同事：

1. 用 Cursor 打开该文件夹
2. 说：「按 publish-scan-survey 帮我发布问卷」（从零：还没有 GitHub 仓库）
3. 按上面 A→H：网站新建仓库 → 自己的 Supabase → 填配置 → 推送

分享话术见 [share-template.md](share-template.md)。

## 故障速查

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| origin 还是别人的仓库 / 仓库已删 | 未改 remote | 用户在网站新建空库，按 A 重绑 origin |
| 能填、主持 0 份 / 离线备用 | 未配云端或未 push | 查 `PASTE_YOUR_`；配好后 push |
| 已配仍失败 | SQL 未 Run / RLS | 再跑建表 SQL |
| 二维码仍是旧站或别人的站 | `publicBaseUrl` 错 | 改成自己的 Pages 根地址后 push |
| 误用 secret key | 密钥类型错 | 改用 publishable/anon |
| Pages 404 | 未 push、Pages 未开或路径错 | 先 push `main`；Settings → Pages；等部署 |
| 没有 gh 命令 | 正常 | 用 https://github.com/new，不要依赖 CLI 建库 |

## 架构（勿混淆）

```
手机填 index.html ──POST──► Supabase REST (survey_responses)
主持 admin.html ──GET───► 同上，表格展示 / 导出 CSV
GitHub Pages ──只提供静态 HTML/JS，不存答卷──
```

## 附加材料

- 同事可转发文案：[share-template.md](share-template.md)
- 逐步说明也可看仓库 `PUBLISH.md`
