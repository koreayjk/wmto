-- WMTO 는 SVM 등 다른 서비스와 같은 Supabase 프로젝트를 쓸 수 있도록 별도 스키마(wmto)에 만듭니다.
-- 설정 후 Dashboard > Project Settings > API > Exposed schemas 에 wmto 를 추가해야 앱이 접근합니다.
create schema if not exists wmto;
grant usage on schema wmto to anon, authenticated, service_role;
alter default privileges in schema wmto grant all on tables to anon, authenticated, service_role;
alter default privileges in schema wmto grant all on sequences to anon, authenticated, service_role;
set search_path = wmto;

-- 후원자 화면: 후원 내역, 후원한 선교사의 소식, 순환 기금 흐름.
-- 후원자는 자신의 후원 내역과 "자신이 후원한 선교사"의 소식만 볼 수 있습니다(RPC 로만 조회).

-- ───────── 후원 내역 ─────────
create table donations (
  id uuid primary key default gen_random_uuid(),
  sponsor_id uuid not null references members(id) on delete cascade,
  kind sponsorship_kind not null,
  partner_id uuid references members(id) on delete set null,   -- 선교사 1:1 후원 등 특정 대상
  amount numeric(14, 2) not null check (amount > 0),
  currency text not null default 'KRW',
  donated_at date not null default current_date,
  note text,
  created_at timestamptz not null default now()
);
create index donations_sponsor_idx on donations (sponsor_id, donated_at desc);
create index donations_partner_idx on donations (partner_id);

-- ───────── 순환 기금 대여 ─────────
create table fund_loans (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references members(id) on delete cascade,
  amount numeric(14, 2) not null check (amount > 0),
  repaid numeric(14, 2) not null default 0 check (repaid >= 0),
  funded_by_repayment boolean not null default false,   -- 앞 선교사가 갚은 기금으로 시작했는지
  status text not null default 'active' check (status in ('active', 'repaid')),
  issued_at date not null default current_date,
  created_at timestamptz not null default now()
);
create index fund_loans_partner_idx on fund_loans (partner_id);

alter table donations enable row level security;
alter table fund_loans enable row level security;

create policy donations_self_read on donations for select using (sponsor_id = current_member_id());
create policy donations_admin on donations for all using (is_admin()) with check (is_admin());
-- 대여 원장은 관리자만. 후원자는 합계(fund_overview)만 봅니다.
create policy fund_loans_admin on fund_loans for all using (is_admin()) with check (is_admin());

-- ───────── RPC (후원자가 볼 수 있는 범위만 계산해서 돌려줍니다) ─────────

-- 내 후원 요약
create or replace function sponsor_overview() returns table (
  total_given numeric, given_this_year numeric, gifts integer, partners_supported integer, first_gift date
) language sql stable security definer set search_path = wmto as $$
  select coalesce(sum(amount), 0),
         coalesce(sum(amount) filter (where donated_at >= date_trunc('year', current_date)), 0),
         count(*)::integer,
         count(distinct partner_id)::integer,
         min(donated_at)
  from donations
  where sponsor_id = current_member_id() and current_member_role() = 'sponsor';
$$;

-- 내 후원 내역 (후원 대상 선교사의 이름 포함. 후원자는 선교사 정보를 직접 조회할 수 없으므로 RPC 로 제공)
create or replace function sponsor_gifts() returns table (
  id uuid, kind sponsorship_kind, partner_name text, amount numeric, currency text, donated_at date, note text
) language sql stable security definer set search_path = wmto as $$
  select d.id, d.kind, p.name, d.amount, d.currency, d.donated_at, d.note
  from donations d left join members p on p.id = d.partner_id
  where d.sponsor_id = current_member_id() and current_member_role() = 'sponsor'
  order by d.donated_at desc, d.created_at desc
  limit 200;
$$;

-- 내가 후원한 선교사의 최근 소식 (이름, 선교지, 단계, 최근 자립 리포트의 자립도·기도제목). 매출 금액은 보여 주지 않습니다.
create or replace function sponsor_partner_feed() returns table (
  partner_name text, mission_field text, stage text, stage_changed_at timestamptz,
  report_month date, self_reliance smallint, prayer_topics text, given numeric, last_gift date
) language sql stable security definer set search_path = wmto as $$
  select p.name, pp.mission_field, pp.stage::text,
         (select max(h.created_at) from stage_history h where h.member_id = p.id),
         r.month, r.self_reliance, r.prayer_topics, d.given, d.last_gift
  from (select partner_id, sum(amount) as given, max(donated_at) as last_gift
        from donations
        where sponsor_id = current_member_id() and partner_id is not null
        group by partner_id) d
  join members p on p.id = d.partner_id
  left join partner_profiles pp on pp.member_id = p.id
  left join lateral (
    select s.month, s.self_reliance, s.prayer_topics from self_reports s
    where s.partner_id = p.id order by s.month desc limit 1) r on true
  where current_member_role() = 'sponsor'
  order by r.month desc nulls last, p.name;
$$;

-- 순환 기금 전체 흐름 (이름 없이 합계만)
create or replace function fund_overview() returns table (
  total_lent numeric, total_repaid numeric, loans integer, active_loans integer, partners_started integer, reflowed numeric
) language sql stable security definer set search_path = wmto as $$
  select coalesce(sum(amount), 0), coalesce(sum(repaid), 0), count(*)::integer,
         count(*) filter (where status = 'active')::integer, count(distinct partner_id)::integer,
         coalesce(sum(amount) filter (where funded_by_repayment), 0)
  from fund_loans
  where current_member_role() in ('sponsor', 'mentor');
$$;

revoke all on function sponsor_overview() from public, anon;
revoke all on function sponsor_gifts() from public, anon;
revoke all on function sponsor_partner_feed() from public, anon;
revoke all on function fund_overview() from public, anon;
grant execute on function sponsor_overview() to authenticated;
grant execute on function sponsor_gifts() to authenticated;
grant execute on function sponsor_partner_feed() to authenticated;
grant execute on function fund_overview() to authenticated;
