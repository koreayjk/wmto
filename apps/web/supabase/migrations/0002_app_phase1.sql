-- WMTO Connect (회원 앱) 1단계: 로그인·프로필, 모임·출석, 멘토링 기록, 자립 리포트.
-- 기존 7개 테이블은 새로 만들지 않고 확장만 합니다. 모든 신규 테이블은 member_id 로 연결됩니다.

create type meeting_provider as enum ('zoom', 'bbb');
create type matching_status as enum ('active', 'ended');

-- ───────── 챕터 ─────────
create table chapters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  region text,
  created_at timestamptz not null default now()
);
alter table members add column chapter_id uuid references chapters(id) on delete set null;

-- ───────── 회의 링크를 Zoom 에 묶지 않기 (zoom_url → meeting_provider + meeting_url) ─────────
alter table events
  add column meeting_provider meeting_provider,
  add column meeting_url text,
  add column chapter_id uuid references chapters(id) on delete set null;
update events set meeting_provider = 'zoom', meeting_url = zoom_url where zoom_url is not null;
alter table events drop column zoom_url;

-- ───────── 헬퍼: 로그인한 활성 회원의 members.id ─────────
create or replace function current_member_id() returns uuid
language sql stable security definer set search_path = public as $$
  select id from members where auth_user_id = auth.uid() and status = 'active' limit 1;
$$;

-- ───────── 출석 ─────────
create table attendance (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  attended_at timestamptz not null default now(),
  unique (event_id, member_id)
);
create index attendance_member_idx on attendance (member_id);

-- ───────── 매칭 (사업가 ↔ 선교사) ─────────
create table matchings (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references members(id) on delete cascade,
  partner_id uuid not null references members(id) on delete cascade,
  contribution_type contribution_type not null,
  status matching_status not null default 'active',
  started_at date not null default current_date,
  ended_at date,
  created_at timestamptz not null default now(),
  check (mentor_id <> partner_id)
);
create unique index matchings_active_key on matchings (mentor_id, partner_id, contribution_type) where status = 'active';
create index matchings_partner_idx on matchings (partner_id);

-- ───────── 멘토링 기록 ─────────
create table mentoring_logs (
  id uuid primary key default gen_random_uuid(),
  matching_id uuid not null references matchings(id) on delete cascade,
  held_at timestamptz not null,
  duration_min integer not null check (duration_min > 0 and duration_min <= 600),
  content text not null,
  created_by uuid not null references members(id),
  created_at timestamptz not null default now()
);
create index mentoring_logs_matching_idx on mentoring_logs (matching_id, held_at desc);

-- ───────── 자립 리포트 (월 1회) ─────────
create table self_reports (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references members(id) on delete cascade,
  month date not null check (month = date_trunc('month', month)::date),
  revenue_amount numeric(14, 2) check (revenue_amount >= 0),
  currency text not null default 'KRW',
  self_reliance smallint check (self_reliance between 1 and 5),
  difficulties text,
  prayer_topics text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (partner_id, month)
);

-- ───────── RLS ─────────
alter table chapters enable row level security;
alter table attendance enable row level security;
alter table matchings enable row level security;
alter table mentoring_logs enable row level security;
alter table self_reports enable row level security;

create policy chapters_read on chapters for select using (true);
create policy chapters_admin on chapters for all using (is_admin()) with check (is_admin());

-- 출석: 본인 것만 조회, 일정 시작 30분 전부터 본인 출석 체크 가능
create policy attendance_self_read on attendance for select using (member_id = current_member_id());
create policy attendance_self_insert on attendance for insert with check (
  member_id = current_member_id()
  and exists (select 1 from events e where e.id = event_id and e.start_at <= now() + interval '30 minutes')
);
create policy attendance_admin on attendance for all using (is_admin()) with check (is_admin());

-- 매칭: 당사자만 조회, 배정은 관리자
create policy matchings_party_read on matchings for select
  using (mentor_id = current_member_id() or partner_id = current_member_id());
create policy matchings_admin on matchings for all using (is_admin()) with check (is_admin());

-- 매칭된 상대의 기본 정보·프로필 조회
create policy members_matched on members for select using (
  exists (
    select 1 from matchings m
    where (m.mentor_id = current_member_id() and m.partner_id = members.id)
       or (m.partner_id = current_member_id() and m.mentor_id = members.id)
  )
);
create policy mentor_profiles_self on mentor_profiles for select using (member_id = current_member_id());
create policy mentor_profiles_matched on mentor_profiles for select using (
  exists (select 1 from matchings m where m.partner_id = current_member_id() and m.mentor_id = mentor_profiles.member_id)
);
create policy partner_profiles_self on partner_profiles for select using (member_id = current_member_id());
create policy partner_profiles_matched on partner_profiles for select using (
  exists (select 1 from matchings m where m.mentor_id = current_member_id() and m.partner_id = partner_profiles.member_id)
);
create policy sponsor_profiles_self on sponsor_profiles for select using (member_id = current_member_id());

-- 본인 정보 수정: 허용 컬럼만 (role/status/stage/auth_user_id 는 수정 불가)
create policy members_self_update on members for update
  using (auth_user_id = auth.uid()) with check (auth_user_id = auth.uid());
create policy mentor_profiles_self_update on mentor_profiles for update
  using (member_id = current_member_id()) with check (member_id = current_member_id());
create policy partner_profiles_self_update on partner_profiles for update
  using (member_id = current_member_id()) with check (member_id = current_member_id());
create policy sponsor_profiles_self_update on sponsor_profiles for update
  using (member_id = current_member_id()) with check (member_id = current_member_id());

revoke update on members, mentor_profiles, partner_profiles, sponsor_profiles from anon, authenticated;
grant update (name, phone, country) on members to authenticated;
grant update (business_name, industry, contribution_types) on mentor_profiles to authenticated;
grant update (mission_field, sending_org, business_idea) on partner_profiles to authenticated;
grant update (sponsor_type, church_name) on sponsor_profiles to authenticated;

-- 멘토링 기록: 당사자 조회, 담당 멘토만 작성·수정
create policy mentoring_logs_party_read on mentoring_logs for select using (
  exists (select 1 from matchings m where m.id = matching_id
          and (m.mentor_id = current_member_id() or m.partner_id = current_member_id()))
);
create policy mentoring_logs_mentor_insert on mentoring_logs for insert with check (
  created_by = current_member_id()
  and exists (select 1 from matchings m where m.id = matching_id
              and m.mentor_id = current_member_id() and m.status = 'active')
);
create policy mentoring_logs_mentor_update on mentoring_logs for update
  using (created_by = current_member_id()) with check (created_by = current_member_id());
create policy mentoring_logs_admin on mentoring_logs for all using (is_admin()) with check (is_admin());

-- 자립 리포트: 본인·담당 멘토·관리자만
create policy self_reports_self_read on self_reports for select using (partner_id = current_member_id());
create policy self_reports_mentor_read on self_reports for select using (
  exists (select 1 from matchings m where m.partner_id = self_reports.partner_id and m.mentor_id = current_member_id())
);
create policy self_reports_self_insert on self_reports for insert with check (
  partner_id = current_member_id()
  and exists (select 1 from members x where x.id = partner_id and x.role = 'partner')
);
create policy self_reports_self_update on self_reports for update
  using (partner_id = current_member_id()) with check (partner_id = current_member_id());
create policy self_reports_admin on self_reports for all using (is_admin()) with check (is_admin());

create or replace function touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger self_reports_touch before update on self_reports
  for each row execute function touch_updated_at();

-- 회의 링크는 로그인한 회원에게만 공개 (익명 방문자는 일정 기본 정보만)
revoke select on events from anon;
grant select (id, type, title, start_at, end_at, location, chapter_id, created_at) on events to anon;
