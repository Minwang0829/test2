/**
 * 云端答卷后端 —— 发布到 GitHub Pages 前请按 PUBLISH.md 配好 endpoint
 *
 * 推荐：Google 表格 + Apps Script（主持页可实时看结果、导出 CSV）
 * 备选：Formspree（结果在 Formspree 控制台 / 邮箱）
 */
window.SURVEY_BACKEND = {
  /**
   * "appscript" | "formspree" | "local" | "none"
   * - appscript：外网提交 + admin 实时汇总（推荐）
   * - formspree：外网提交，结果在 Formspree 网站查看
   * - local：仅本机 node server.js（不开外网）
   * - none：只保存在填写者手机浏览器
   */
  mode: "appscript",

  /**
   * Apps Script「网页应用」URL，或 Formspree 的 https://formspree.io/f/xxxx
   * 发布前务必改成你自己的地址！
   */
  endpoint: "PASTE_YOUR_APPS_SCRIPT_OR_FORMSPREE_URL_HERE",

  /**
   * 与 scripts/google-apps-script.js 里 ADMIN_TOKEN 保持一致
   * 用于主持页拉取/清空答卷（不要发到公开群里）
   */
  adminToken: "change-this-admin-token",

  /**
   * 发布到 GitHub Pages 后的网站根地址（用于二维码）
   * 例：https://你的用户名.github.io/ai-survey/
   * 留空则用当前浏览器地址
   */
  publicBaseUrl: "",
};
