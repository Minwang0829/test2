# 分享文案模板

## 把「发布能力」交给同事（他没有 GitHub 仓库地址）

先把整个问卷文件夹拷给他（含 `.cursor/skills/`），不要只发一个别人的 github.io 链接。

```
请用这份问卷文件夹自己发布一套（不要用我的 GitHub / Supabase）：

1. 用 Cursor 打开这个文件夹
2. 说：按 publish-scan-survey 帮我发布问卷。我还没有 GitHub 仓库。
3. 浏览器打开 https://github.com/new
   建仓库即可；README / gitignore / license **默认没勾，保持默认**
4. 把仓库 HTTPS 地址发给 Cursor（形如 https://github.com/你的用户名/仓库名.git）
5. 打开 supabase.com → Start your project → New project
   → SQL 运行 scripts/supabase-setup.sql
   → Settings → General 把 Project ID 发给 Cursor（不用自己拼网址）
   → Settings → API Keys 复制 Publishable key 发给 Cursor（不要发 sb_secret）
6. Cursor 写好 js/backend-config.js 后，说「帮我推上去」
7. GitHub 仓库 Settings → Pages → main / root
8. 等 1–2 分钟，打开自己的填写页和 admin.html 自测

每人必须自己的仓库 + 自己的 Supabase，否则答卷会混在一起。
```

## 开会用（填卷的人 + 主持）

只在**自己的** Pages 发布成功后填写真实链接。

```
【聊聊你和 AI】扫码问卷

填写：https://<用户名>.github.io/<仓库>/
主持（投影二维码 / 看结果 / 导出 CSV）：https://<用户名>.github.io/<仓库>/admin.html

手机用流量即可。提交后主持页右侧表格会更新。
```

## 已推送后自检（一句话）

强制刷新 admin → 不是「离线备用」→ 自己填一份 → 表格出现新行 → 可导出 CSV。
