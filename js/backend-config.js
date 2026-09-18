/**
 * 云端答卷后端（不用 Google）
 *
 * 推荐：Supabase 免费库 → 主持页普通表格看结果 → 导出 CSV 用 Excel 打开
 * 备选：Formspree（邮箱/控制台看结果）
 *
 * 配置步骤见 PUBLISH.md
 */
window.SURVEY_BACKEND = {
  /**
   * "supabase" | "formspree" | "local" | "none"
   */
  mode: "supabase",

  /**
   * Supabase：Project URL，形如 https://xxxxx.supabase.co
   * Formspree：https://formspree.io/f/xxxx
   */
  endpoint: "https://xayycftjxhvpmcuwaano.supabase.co",

  /**
   * Supabase → Project Settings → API → anon / publishable key
   */
  anonKey: "sb_publishable_vs-LlwfjfolSjDF3Cp3Zcg_bjrzTWyZ",

  /** 数据表名（与 scripts/supabase-setup.sql 一致） */
  table: "survey_responses",

  /**
   * GitHub Pages 根地址（二维码用）
   */
  publicBaseUrl: "https://minwang0829.github.io/test1",
};
