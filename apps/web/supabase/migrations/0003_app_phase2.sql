-- WMTO 는 SVM 등 다른 서비스와 같은 Supabase 프로젝트를 쓸 수 있도록 별도 스키마(wmto)에 만듭니다.
-- 설정 후 Dashboard > Project Settings > API > Exposed schemas 에 wmto 를 추가해야 앱이 접근합니다.
create schema if not exists wmto;
grant usage on schema wmto to anon, authenticated, service_role;
alter default privileges in schema wmto grant all on tables to anon, authenticated, service_role;
alter default privileges in schema wmto grant all on sequences to anon, authenticated, service_role;
set search_path = wmto;

-- WMTO Connect 2단계: 매칭 요청, 리퍼럴, 감사 편지, 성장 단계(승급), 아카데미.
-- 기존 테이블에 member_id 로 연결하며, 코드 값은 docs/00-wmto-overview.md 기준입니다.

create type request_status as enum ('pending', 'accepted', 'cancelled');
create type referral_status as enum ('sent', 'contacted', 'closed');

-- ───────── 헬퍼 (RLS 재귀를 피하려고 security definer) ─────────
create or replace function current_member_role() returns member_role
language sql stable security definer set search_path = wmto as $$
  select role from members where auth_user_id = auth.uid() and status = 'active' limit 1;
$$;

create or replace function is_active_member_with_role(p_member uuid, p_role member_role) returns boolean
language sql stable security definer set search_path = wmto as $$
  select exists (select 1 from members where id = p_member and role = p_role and status = 'active');
$$;

-- ───────── 매칭 요청 (선교사 → 사업가) ─────────
create table matching_requests (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references members(id) on delete cascade,
  mentor_id uuid references members(id) on delete set null,  -- 수락한 사업가
  contribution_type contribution_type not null,
  message text,
  status request_status not null default 'pending',
  created_at timestamptz not null default now(),
  responded_at timestamptz
);
-- 같은 분야의 진행 중 요청은 선교사당 하나
create unique index matching_requests_pending_key on matching_requests (partner_id, contribution_type) where status = 'pending';

-- ───────── 리퍼럴 (사업가 ↔ 사업가 고객 소개) ─────────
create table referrals (
  id uuid primary key default gen_random_uuid(),
  giver_id uuid not null references members(id) on delete cascade,
  receiver_id uuid not null references members(id) on delete cascade,
  client_name text not null,
  client_contact text,
  note text,
  status referral_status not null default 'sent',
  created_at timestamptz not null default now(),
  check (giver_id <> receiver_id)
);
create index referrals_receiver_idx on referrals (receiver_id, created_at desc);

-- ───────── 감사 편지 (선교사 → 담당 멘토) ─────────
create table thanks_letters (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references members(id) on delete cascade,
  recipient_id uuid not null references members(id) on delete cascade,
  body text not null check (length(body) between 1 and 5000),
  read_at timestamptz,
  created_at timestamptz not null default now(),
  check (sender_id <> recipient_id)
);
create index thanks_recipient_idx on thanks_letters (recipient_id, created_at desc);

-- ───────── 성장 단계 이력 ─────────
create table stage_history (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  role member_role not null,
  from_stage text,
  to_stage text not null,
  note text,
  approved_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index stage_history_member_idx on stage_history (member_id, created_at desc);

-- ───────── 아카데미 ─────────
create table academy_videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  video_url text not null,
  provider text not null default 'other' check (provider in ('youtube', 'vimeo', 'zoom', 'bbb', 'other')),
  category text,
  for_roles member_role[] not null default '{mentor,partner,sponsor}',
  event_id uuid references events(id) on delete set null,  -- 녹화본이 속한 모임
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index academy_videos_pub_idx on academy_videos (published_at desc);

-- ───────── RLS ─────────
alter table matching_requests enable row level security;
alter table referrals enable row level security;
alter table thanks_letters enable row level security;
alter table stage_history enable row level security;
alter table academy_videos enable row level security;

-- 매칭 요청: 본인 요청 조회·작성·취소. 사업가는 RPC(open_matching_requests)로만 열린 요청을 봅니다.
create policy mreq_self_read on matching_requests for select using (partner_id = current_member_id());
create policy mreq_self_insert on matching_requests for insert with check (
  partner_id = current_member_id() and status = 'pending' and mentor_id is null
  and current_member_role() = 'partner'
);
create policy mreq_self_cancel on matching_requests for update
  using (partner_id = current_member_id() and status = 'pending')
  with check (partner_id = current_member_id() and status = 'cancelled');
create policy mreq_mentor_read on matching_requests for select using (mentor_id = current_member_id());
create policy mreq_admin on matching_requests for all using (is_admin()) with check (is_admin());
revoke update on matching_requests from anon, authenticated;
grant update (status) on matching_requests to authenticated;

-- 리퍼럴: 주고받은 사업가만. 받은 사람은 진행 상태만 변경.
create policy referrals_party_read on referrals for select
  using (giver_id = current_member_id() or receiver_id = current_member_id());
create policy referrals_giver_insert on referrals for insert with check (
  giver_id = current_member_id()
  and current_member_role() = 'mentor'
  and is_active_member_with_role(receiver_id, 'mentor')
);
create policy referrals_receiver_update on referrals for update
  using (receiver_id = current_member_id()) with check (receiver_id = current_member_id());
create policy referrals_admin on referrals for all using (is_admin()) with check (is_admin());
revoke update on referrals from anon, authenticated;
grant update (status) on referrals to authenticated;

-- 감사 편지: 선교사가 자신의 멘토에게만 작성. 받은 사람은 읽음 처리만.
create policy thanks_party_read on thanks_letters for select
  using (sender_id = current_member_id() or recipient_id = current_member_id());
create policy thanks_sender_insert on thanks_letters for insert with check (
  sender_id = current_member_id()
  and current_member_role() = 'partner'
  and exists (select 1 from matchings m where m.partner_id = sender_id and m.mentor_id = recipient_id)
);
create policy thanks_recipient_update on thanks_letters for update
  using (recipient_id = current_member_id()) with check (recipient_id = current_member_id());
create policy thanks_admin on thanks_letters for all using (is_admin()) with check (is_admin());
revoke update on thanks_letters from anon, authenticated;
grant update (read_at) on thanks_letters to authenticated;

-- 성장 단계 이력: 본인 조회, 변경은 admin_set_stage 로만
create policy stage_history_self on stage_history for select using (member_id = current_member_id());
create policy stage_history_admin on stage_history for all using (is_admin()) with check (is_admin());

-- 아카데미: 역할에 맞는 영상만, 로그인한 활성 회원에게
create policy academy_read on academy_videos for select
  using (current_member_role() is not null and current_member_role() = any (for_roles));
create policy academy_admin on academy_videos for all using (is_admin()) with check (is_admin());

-- ───────── RPC ─────────

-- 사업가용: 내 기여 분야와 맞는 열린 요청 (연락처 등 불필요한 개인정보는 제외)
create or replace function open_matching_requests() returns table (
  id uuid, partner_name text, mission_field text, contribution_type contribution_type,
  message text, created_at timestamptz
) language sql stable security definer set search_path = wmto as $$
  select r.id, p.name, pp.mission_field, r.contribution_type, r.message, r.created_at
  from matching_requests r
  join members p on p.id = r.partner_id
  left join partner_profiles pp on pp.member_id = r.partner_id
  where r.status = 'pending'
    and current_member_role() = 'mentor'
    and r.contribution_type = any (
      coalesce((select contribution_types from mentor_profiles where member_id = current_member_id()), '{}'))
  order by r.created_at;
$$;

create or replace function accept_matching_request(p_request uuid) returns uuid
language plpgsql security definer set search_path = wmto as $$
declare
  me uuid := current_member_id();
  req matching_requests;
  new_id uuid;
begin
  if me is null or current_member_role() <> 'mentor' then raise exception 'forbidden'; end if;
  select * into req from matching_requests where id = p_request and status = 'pending' for update;
  if not found then raise exception 'request not available'; end if;
  if not (req.contribution_type = any (
        coalesce((select contribution_types from mentor_profiles where member_id = me), '{}'))) then
    raise exception 'contribution type mismatch';
  end if;
  insert into matchings (mentor_id, partner_id, contribution_type)
    values (me, req.partner_id, req.contribution_type) returning id into new_id;
  update matching_requests set status = 'accepted', mentor_id = me, responded_at = now() where id = req.id;
  return new_id;
end $$;

-- 리퍼럴 받을 사업가 선택용 디렉토리 (이름·업종만)
create or replace function mentor_directory() returns table (
  id uuid, name text, industry text, business_name text
) language sql stable security definer set search_path = wmto as $$
  select m.id, m.name, mp.industry, mp.business_name
  from members m join mentor_profiles mp on mp.member_id = m.id
  where m.role = 'mentor' and m.status = 'active'
    and current_member_role() = 'mentor' and m.id <> current_member_id()
  order by m.name;
$$;

-- 관리자 승인 승급 (단계 변경 + 이력)
create or replace function admin_set_stage(p_member uuid, p_to text, p_note text default null) returns void
language plpgsql security definer set search_path = wmto as $$
declare r member_role; cur text;
begin
  if not is_admin() then raise exception 'forbidden'; end if;
  select role into r from members where id = p_member;
  if r = 'mentor' then
    select stage::text into cur from mentor_profiles where member_id = p_member;
    update mentor_profiles set stage = p_to::mentor_stage where member_id = p_member;
  elsif r = 'partner' then
    select stage::text into cur from partner_profiles where member_id = p_member;
    update partner_profiles set stage = p_to::partner_stage where member_id = p_member;
  else
    raise exception 'role has no stage';
  end if;
  if not found then raise exception 'profile not found'; end if;
  insert into stage_history (member_id, role, from_stage, to_stage, note, approved_by)
    values (p_member, r, cur, p_to, p_note, auth.uid());
end $$;

revoke all on function admin_set_stage(uuid, text, text) from public, anon;
revoke all on function accept_matching_request(uuid) from public, anon;
revoke all on function open_matching_requests() from public, anon;
revoke all on function mentor_directory() from public, anon;
grant execute on function admin_set_stage(uuid, text, text) to authenticated;
grant execute on function accept_matching_request(uuid) to authenticated;
grant execute on function open_matching_requests() to authenticated;
grant execute on function mentor_directory() to authenticated;

-- ───────── 승급 제안 (자동 계산 → 관리자 승인) ─────────
-- 점수가 아니라 단계 기준(docs/00 6장)으로 계산합니다. security_invoker 라 관리자만 전체를 볼 수 있습니다.
create view promotion_suggestions with (security_invoker = true) as
  select mp.member_id, 'mentor'::member_role as role, 'seed' as from_stage, 'sower' as to_stage,
         '선교사 1명 이상 멘토링 활동' as reason
  from mentor_profiles mp
  where mp.stage = 'seed' and exists (select 1 from matchings m where m.mentor_id = mp.member_id)
  union all
  select mp.member_id, 'mentor', 'sower', 'harvester', '멘토링한 선교사가 자립 단계에 도달'
  from mentor_profiles mp
  where mp.stage = 'sower' and exists (
    select 1 from matchings m join partner_profiles pp on pp.member_id = m.partner_id
    where m.mentor_id = mp.member_id and pp.stage = 'self_sustaining')
  union all
  select pp.member_id, 'partner', 'launch', 'growing', '첫 매출 발생'
  from partner_profiles pp
  where pp.stage = 'launch' and exists (
    select 1 from self_reports r where r.partner_id = pp.member_id and r.revenue_amount > 0)
  union all
  select pp.member_id, 'partner', 'growing', 'self_sustaining', '최근 3개월 자립도 4 이상'
  from partner_profiles pp
  where pp.stage = 'growing' and (
    select count(*) from (
      select r.self_reliance from self_reports r where r.partner_id = pp.member_id order by r.month desc limit 3
    ) x where x.self_reliance >= 4) = 3;
grant select on promotion_suggestions to authenticated;
