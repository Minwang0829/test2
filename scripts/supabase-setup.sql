-- 在 Supabase → SQL Editor 中整段运行一次（不用 Google）
-- 之后主持页用普通表格展示答卷，并可导出 CSV（Excel 可打开）

create table if not exists public.survey_responses (
  id text primary key,
  submitted_at timestamptz not null default now(),
  answers jsonb not null default '{}'::jsonb
);

alter table public.survey_responses enable row level security;

-- 允许匿名填写（问卷公开提交）
drop policy if exists "survey_insert_anon" on public.survey_responses;
create policy "survey_insert_anon"
  on public.survey_responses
  for insert
  to anon, authenticated
  with check (true);

-- 允许匿名读取（主持页拉取）；链接勿随便外传
drop policy if exists "survey_select_anon" on public.survey_responses;
create policy "survey_select_anon"
  on public.survey_responses
  for select
  to anon, authenticated
  using (true);

-- 允许匿名清空（主持页「清空答卷」）
drop policy if exists "survey_delete_anon" on public.survey_responses;
create policy "survey_delete_anon"
  on public.survey_responses
  for delete
  to anon, authenticated
  using (true);
