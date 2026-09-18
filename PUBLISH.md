# 发布到 GitHub（外网扫码 + 普通表格看结果）

**不使用 Google。** 答卷存在 Supabase，主持页用网页表格展示，导出 CSV 后可用 Excel / WPS 打开。

全程不需要电脑管理员权限。

---

## 一、接好答卷库（Supabase，约 5 分钟）

1. 打开 [https://supabase.com](https://supabase.com) 注册/登录（可用 GitHub 账号）
2. **New project** → 记住数据库密码 → 等项目创建好
3. 左侧 **SQL → New query**，粘贴本仓库 [`scripts/supabase-setup.sql`](scripts/supabase-setup.sql) 全部内容 → **Run**
4. 左侧 **Project Settings → API**，复制：
   - **Project URL**
   - **anon public** key
5. 打开本仓库 [`js/backend-config.js`](js/backend-config.js)，改成：

```js
mode: "supabase",
endpoint: "https://xxxxx.supabase.co",   // Project URL
anonKey: "eyJhbGciOi....",              // anon public key
table: "survey_responses",
publicBaseUrl: "https://minwang0829.github.io/test1",
```

6. 保存后 `git add` / `commit` / `push`

> 备选：若只用邮箱收结果，可把 `mode` 改成 `"formspree"`，`endpoint` 填 Formspree 地址（主持页网页表格不会自动汇总）。

---

## 二、打开 GitHub Pages

仓库已推送到 [Minwang0829/test1](https://github.com/Minwang0829/test1)。

1. 打开 https://github.com/Minwang0829/test1/settings/pages  
2. Source：**Deploy from a branch**  
3. Branch：`main` ，文件夹：`/ (root)` → **Save**  
4. 一两分钟后访问：
   - 填写：https://minwang0829.github.io/test1/  
   - 主持：https://minwang0829.github.io/test1/admin.html  

---

## 三、开会怎么用

| 角色 | 打开 |
| --- | --- |
| 主持投影二维码 | https://minwang0829.github.io/test1/admin.html |
| 手机扫码填写 | https://minwang0829.github.io/test1/ |
| 看结果 | 主持页右侧**普通表格**（自动刷新） |
| 导出 | 点「导出 CSV」，用 Excel / WPS 打开 |

---

## 四、自检清单

- [ ] Supabase SQL 已成功执行
- [ ] `endpoint` / `anonKey` 已填，不是 `PASTE_YOUR_...`
- [ ] Pages 用手机流量能打开
- [ ] 自己先填一份，主持页表格能看到新行
- [ ] 导出 CSV 能用 Excel 打开
