-- WMTO 는 SVM 등 다른 서비스와 같은 Supabase 프로젝트를 쓸 수 있도록 별도 스키마(wmto)에 만듭니다.
-- 설정 후 Dashboard > Project Settings > API > Exposed schemas 에 wmto 를 추가해야 앱이 접근합니다.
create schema if not exists wmto;
grant usage on schema wmto to anon, authenticated, service_role;
alter default privileges in schema wmto grant all on tables to anon, authenticated, service_role;
alter default privileges in schema wmto grant all on sequences to anon, authenticated, service_role;
set search_path = wmto;

-- WMTO 1단계 스키마 (홈페이지). 회원 앱이 같은 DB를 그대로 사용합니다.
-- 코드 값은 docs의 00-wmto-overview.md 와 동일합니다.

create extension if not exists "pgcrypto";

-- ───────── enums ─────────
create type member_role as enum ('mentor', 'partner', 'sponsor');
create type member_status as enum ('applicant', 'active', 'inactive');
create type mentor_stage as enum ('seed', 'sower', 'harvester', 'elder');
create type partner_stage as enum ('ready', 'launch', 'growing', 'self_sustaining');
create type contribution_type as enum ('skill', 'coach', 'channel', 'advisor');
create type sponsor_type as enum ('individual', 'church');
create type sponsorship_kind as enum ('one_to_one', 'camp', 'fund', 'monthly');
create type application_type as enum (
  'observe', 'mentor_join', 'partner_consult', 'camp_apply',
  'camp_instructor', 'sponsor_inquiry', 'contact'
);
create type application_status as enum ('new', 'contacted', 'done');
create type event_type as enum ('online', 'offline', 'camp', 'conference');

-- ───────── 관리자 ─────────
create table admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = wmto as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$;

-- ───────── 회원 ─────────
create table members (
  id uuid primary key default gen_random_uuid(),
  -- 문의(contact)만 접수한 경우 역할이 아직 없을 수 있음
  role member_role,
  name text not null,
  email text not null,
  phone text,
  country text,
  chapter text,
  status member_status not null default 'applicant',
  auth_user_id uuid unique references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create unique index members_email_key on members (lower(email));

create table mentor_profiles (
  member_id uuid primary key references members(id) on delete cascade,
  business_name text,
  industry text,
  contribution_types contribution_type[] not null default '{}',
  stage mentor_stage not null default 'seed'
);

create table partner_profiles (
  member_id uuid primary key references members(id) on delete cascade,
  mission_field text,
  sending_org text,
  business_idea text,
  stage partner_stage not null default 'ready'
);

create table sponsor_profiles (
  member_id uuid primary key references members(id) on delete cascade,
  sponsor_type sponsor_type,
  church_name text
);

-- ───────── 신청 ─────────
create table applications (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  type application_type not null,
  message text,
  -- 유형별 추가 입력(희망 일정, 트랙, 가능 기간, 관심 후원 방식 등)
  details jsonb not null default '{}'::jsonb,
  status application_status not null default 'new',
  created_at timestamptz not null default now()
);
create index applications_member_idx on applications (member_id);
create index applications_status_idx on applications (status, created_at desc);

-- ───────── 일정·스토리 ─────────
create table events (
  id uuid primary key default gen_random_uuid(),
  type event_type not null,
  title text not null,
  start_at timestamptz not null,
  end_at timestamptz,
  location text,
  zoom_url text,
  created_at timestamptz not null default now()
);
create index events_start_idx on events (start_at);

create table stories (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  image_url text,
  is_example boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

-- ───────── RLS ─────────
alter table admins enable row level security;
alter table members enable row level security;
alter table mentor_profiles enable row level security;
alter table partner_profiles enable row level security;
alter table sponsor_profiles enable row level security;
alter table applications enable row level security;
alter table events enable row level security;
alter table stories enable row level security;

-- 관리자: 개인정보 테이블 전체 접근
create policy admins_self on admins for select using (user_id = auth.uid());
create policy members_admin on members for all using (is_admin()) with check (is_admin());
create policy mentor_profiles_admin on mentor_profiles for all using (is_admin()) with check (is_admin());
create policy partner_profiles_admin on partner_profiles for all using (is_admin()) with check (is_admin());
create policy sponsor_profiles_admin on sponsor_profiles for all using (is_admin()) with check (is_admin());
create policy applications_admin on applications for all using (is_admin()) with check (is_admin());

-- 앱 단계: 로그인한 본인은 자기 회원 정보만 조회
create policy members_self on members for select using (auth_user_id = auth.uid());

-- 공개 콘텐츠: 누구나 읽기, 쓰기는 관리자만
create policy events_read on events for select using (true);
create policy events_admin on events for all using (is_admin()) with check (is_admin());
create policy stories_read on stories for select using (published_at is not null and published_at <= now());
create policy stories_admin on stories for all using (is_admin()) with check (is_admin());

-- 신청 폼은 서버(service role)에서만 저장합니다. 익명 insert 정책은 두지 않습니다.
