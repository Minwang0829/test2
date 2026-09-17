# 发布到 GitHub（外网扫码 + 主持看结果）

目标：

- 手机用**外网**扫二维码打开问卷
- 你在主持页 / Google 表格里**看到答卷**并导出 CSV

全程**不需要管理员权限**。

---

## 一、接好云端答卷库（必做，约 5 分钟）

GitHub Pages 只能托管网页，不能存答卷，所以用 **Google 表格 + Apps Script**。

1. 新建一个 [Google 表格](https://sheets.google.com)
2. 菜单：**扩展程序 → Apps Script**
3. 删除编辑器里的默认代码，粘贴本仓库 [`scripts/google-apps-script.js`](scripts/google-apps-script.js) 全部内容
4. 把脚本里的 `ADMIN_TOKEN` 改成一串只有你知道的口令（例如 `BayerMeet2026`）
5. 保存 → **部署 → 新建部署 → 类型选「网页应用」**
   - 执行身份：**我**
   - 谁可以访问：**任何人**
6. 授权后，复制「网页应用」URL（形如 `https://script.google.com/macros/s/xxxx/exec`）

7. 打开本仓库 [`js/backend-config.js`](js/backend-config.js)，改成：

```js
mode: "appscript",
endpoint: "粘贴你的网页应用URL",
adminToken: "与脚本里相同的口令",
publicBaseUrl: "", // 下一步 Pages 开通后再填
```

> 备选：若更习惯邮箱收答卷，可把 `mode` 改成 `"formspree"`，`endpoint` 填 Formspree 表单地址；结果在 Formspree 网站查看。

---

## 二、推到 GitHub 并打开 Pages

1. 在 GitHub 新建空仓库（例如 `ai-survey`），不要勾选自动加 README
2. 本机执行：

```bash
git init
git add .
git commit -m "Add AI survey with GitHub Pages and cloud responses"
git branch -M main
git remote add origin https://github.com/你的用户名/ai-survey.git
git push -u origin main
```

3. 打开仓库 **Settings → Pages**
   - Source：Deploy from a branch
   - Branch：`main` / `/ (root)`
   - Save

4. 几分钟后得到公网地址，例如：

`https://你的用户名.github.io/ai-survey/`

5. 回到 `js/backend-config.js`，填写：

```js
publicBaseUrl: "https://你的用户名.github.io/ai-survey"
```

再 `git add` / `commit` / `push` 一次。

---

## 三、开会怎么用

| 角色 | 打开 |
| --- | --- |
| 主持投影二维码 | `https://你的用户名.github.io/ai-survey/admin.html` |
| 手机扫码填写 | 二维码指向的 `index.html`（外网可开） |
| 看结果 | 主持页右侧表格（约每 4 秒刷新）或 Google 表格 |
| 导出 | 主持页「导出 CSV」 |

---

## 四、自检清单

- [ ] `endpoint` 已不是 `PASTE_YOUR_...`
- [ ] `adminToken` 与 Apps Script 一致
- [ ] Pages 网站用手机流量能打开
- [ ] 自己先填一份，主持页 / 表格能看到
- [ ] `publicBaseUrl` 已填，二维码不是 localhost
