-- 시험 계정의 역할을 바꿔서 사업가 / 선교사 / 후원자 화면을 번갈아 확인합니다.
-- 먼저 seed_demo.sql 을 실행해 두어야 합니다. 몇 번이고 다시 실행해서 역할을 바꿀 수 있습니다.
--
-- 사용법: 아래 두 줄(v_email, v_role)만 고치고 전체를 Run 한 뒤, 앱(/connect)에서 새로고침합니다.
--   v_role 은 'mentor'(사업가) | 'partner'(선교사) | 'sponsor'(후원자) 중 하나입니다.
-- 실제 운영 전에는 이 계정의 역할을 원래대로 돌려 두세요. (clear_demo.sql 은 역할을 되돌리지 않습니다.)
set search_path = wmto;

do $v$
declare
  v_email text := 'imamerica2414@gmail.com';   -- ← 시험 계정 이메일
  v_role  member_role := 'partner';             -- ← 'mentor' | 'partner' | 'sponsor'

  v_id uuid;
  mid uuid;
  r record;
  j int; k int;
  mt contribution_type;
  log_content text[] := array['판매 가격을 다시 계산하고 재료비 비율을 점검했습니다.','현지 손님이 어떤 메뉴를 좋아하는지 사진과 함께 공유하고 개선점을 이야기했습니다.','월별 매출과 지출을 기록하는 간단한 장부 양식을 함께 만들었습니다.','SNS에 올릴 첫 게시물의 사진과 문구를 같이 다듬었습니다.','다음 달 재료 구매 계획과 거래처 협상 방법을 정리했습니다.','어려웠던 한 달을 돌아보고 다시 시작할 작은 목표를 세웠습니다.'];
  log_next text[] := array['가격표를 새로 만들어 이번 주 안에 공유하기','지출 장부를 매일 5분씩 기록하기','단골 손님 3명에게 후기를 부탁하기','거래처 두 곳에 견적 요청하기'];
  log_pray text[] := array['사업이 어려운 달에도 낙심하지 않도록','현지 청년들과 좋은 관계를 맺도록','지혜로운 재정 판단'];
  thanks_body text[] := array['멘토님 덕분에 처음으로 월 매출을 기록해 보았습니다. 숫자가 보이니 마음이 한결 가벼워졌습니다. 감사합니다.','소개해 주신 거래처에서 첫 주문이 들어왔습니다. 하나님께 감사하고, 멘토님께도 감사드립니다.','혼자라고 느꼈던 시간에 멘토님의 한마디가 큰 힘이 되었습니다. 기도로 함께해 주셔서 감사합니다.'];
  clients text[] := array['동네 카페 사장님','이웃 교회 장로님','거래처 대표님','같은 상가 미용실 원장님','식자재 납품 업체'];
  diffs text[] := array['재료 가격이 올라 이익이 줄었습니다.','현지 직원 관리가 어렵습니다.','손님이 적은 비수기였습니다.'];
begin
  select id into v_id from members where lower(email) = lower(v_email) and auth_user_id is not null;
  if v_id is null then raise exception '% 로 로그인할 수 있는 회원을 찾지 못했습니다. 이메일을 확인하세요.', v_email; end if;
  if not exists (select 1 from members where email like '%@demo.wmto.invalid') then
    raise exception '데모 데이터가 없습니다. 먼저 seed_demo.sql 을 실행하세요.';
  end if;

  -- 1) 이전에 이 계정에 붙여 둔 데모 활동 정리 (상대가 데모 회원인 것만)
  delete from mentoring_logs where matching_id in (
    select id from matchings where (mentor_id = v_id and partner_id in (select id from members where email like '%@demo.wmto.invalid'))
                                or (partner_id = v_id and mentor_id in (select id from members where email like '%@demo.wmto.invalid')));
  delete from matchings where (mentor_id = v_id and partner_id in (select id from members where email like '%@demo.wmto.invalid'))
                           or (partner_id = v_id and mentor_id in (select id from members where email like '%@demo.wmto.invalid'));
  delete from referrals where (giver_id = v_id and receiver_id in (select id from members where email like '%@demo.wmto.invalid'))
                           or (receiver_id = v_id and giver_id in (select id from members where email like '%@demo.wmto.invalid'));
  delete from thanks_letters where (sender_id = v_id and recipient_id in (select id from members where email like '%@demo.wmto.invalid'))
                                or (recipient_id = v_id and sender_id in (select id from members where email like '%@demo.wmto.invalid'));
  delete from attendance where member_id = v_id and event_id in (select id from events where title like '[데모]%');
  delete from self_reports where partner_id = v_id and difficulties like '[데모]%';
  delete from matching_requests where partner_id = v_id and message like '[데모]%';
  delete from donations where sponsor_id = v_id and note like '[데모]%';

  -- 2) 역할 변경과 프로필 준비
  update members set role = v_role, status = 'active' where id = v_id;
  if v_role = 'mentor' then
    insert into mentor_profiles (member_id, business_name, industry, contribution_types, stage)
    values (v_id, '온유 카페', '카페', '{skill,coach}', 'sower') on conflict (member_id) do nothing;
    update mentor_profiles set contribution_types = '{skill,coach}' where member_id = v_id and coalesce(array_length(contribution_types, 1), 0) = 0;
  elsif v_role = 'partner' then
    insert into partner_profiles (member_id, mission_field, sending_org, business_idea, stage)
    values (v_id, '캄보디아 프놈펜', 'IM선교회', '작은 커피 로스팅 카페', 'launch') on conflict (member_id) do nothing;
  else
    insert into sponsor_profiles (member_id, sponsor_type, church_name)
    values (v_id, 'individual', null) on conflict (member_id) do nothing;
  end if;

  -- 3) 데모 활동 연결
  if v_role = 'mentor' then
    for r in select id from members where email in ('demo.partner08@demo.wmto.invalid','demo.partner10@demo.wmto.invalid','demo.partner15@demo.wmto.invalid') order by email loop
      mt := (select (contribution_types)[1] from mentor_profiles where member_id = v_id);
      insert into matchings (mentor_id, partner_id, contribution_type, started_at) values (v_id, r.id, mt, current_date - 50) on conflict do nothing;
    end loop;
    for k in 1..5 loop
      insert into referrals (giver_id, receiver_id, client_name, note, status, created_at)
      select m.id, v_id, clients[k], '꼭 한번 만나 보시길 권합니다.', (array['sent','sent','contacted','closed','sent'])[k]::referral_status, now() - k * interval '4 days'
      from members m where m.email = 'demo.mentor' || lpad((10 + k * 7)::text, 3, '0') || '@demo.wmto.invalid';
    end loop;
    for k in 1..3 loop
      insert into referrals (giver_id, receiver_id, client_name, note, status, created_at)
      select v_id, m.id, clients[k + 1], '도움이 필요하다고 하셔서 소개합니다.', (array['sent','contacted','closed'])[k]::referral_status, now() - k * interval '9 days'
      from members m where m.email = 'demo.mentor' || lpad((14 + k * 9)::text, 3, '0') || '@demo.wmto.invalid';
    end loop;
  elsif v_role = 'partner' then
    for r in select id, email from members where email in ('demo.mentor040@demo.wmto.invalid','demo.mentor025@demo.wmto.invalid') order by email desc loop
      mt := (select contribution_types[1] from mentor_profiles where member_id = r.id);
      insert into matchings (mentor_id, partner_id, contribution_type, started_at) values (r.id, v_id, mt, current_date - 70) on conflict do nothing;
    end loop;
    for k in 0..4 loop
      insert into self_reports (partner_id, month, revenue_amount, currency, self_reliance, difficulties, prayer_topics)
      values (v_id, date_trunc('month', now() - k * interval '1 month')::date, round((250000 + (4 - k) * 230000)::numeric, -3), 'KRW',
              least(5, 2 + (case when k <= 1 then 1 else 0 end)), '[데모] ' || diffs[1 + (k % 3)], log_pray[1 + (k % 3)])
      on conflict do nothing;
    end loop;
    insert into matching_requests (partner_id, contribution_type, message, status, created_at)
    values (v_id, 'channel', '[데모] 현지 생산품을 한국에서 판매할 거래처를 찾고 있습니다.', 'pending', now() - interval '2 days');
  end if;

  if v_role = 'sponsor' then
    -- 후원 내역: 정기 후원 6개월 + 선교사 1:1 후원 2건 + 캠프 장학금 + 순환 기금
    for k in 0..5 loop
      insert into donations (sponsor_id, kind, amount, donated_at, note) values (v_id, 'monthly', 30000, current_date - k * 30 - 3, '[데모]');
    end loop;
    insert into donations (sponsor_id, kind, partner_id, amount, donated_at, note)
    select v_id, 'one_to_one', m.id, a.amount, current_date - a.days, '[데모]'
    from (values ('demo.partner08@demo.wmto.invalid', 1800000, 45), ('demo.partner15@demo.wmto.invalid', 2000000, 25), ('demo.partner18@demo.wmto.invalid', 1500000, 12)) a(email, amount, days)
    join members m on m.email = a.email;
    insert into donations (sponsor_id, kind, amount, donated_at, note) values
      (v_id, 'camp', 500000, current_date - 30, '[데모]'), (v_id, 'fund', 1000000, current_date - 60, '[데모]');
  end if;

  if v_role in ('mentor', 'partner') then
    for mid in select id from matchings where mentor_id = v_id or partner_id = v_id loop
      for k in 1..4 loop
        insert into mentoring_logs (matching_id, held_at, duration_min, content, created_by, next_steps, prayer_topics)
        select mid, now() - (k * 11 - 6) * interval '1 day', (array[45,60,60,90])[k], log_content[1 + ((k + 1) % 6)], mentor_id, log_next[1 + (k % 4)], case when k % 2 = 0 then log_pray[1 + (k % 3)] end
        from matchings where id = mid;
      end loop;
      insert into thanks_letters (sender_id, recipient_id, body, read_at, created_at)
      select partner_id, mentor_id, thanks_body[1], null, now() - interval '1 day' from matchings where id = mid
      union all
      select partner_id, mentor_id, thanks_body[2], now(), now() - interval '18 days' from matchings where id = mid;
    end loop;
  end if;

  insert into attendance (event_id, member_id, attended_at)
  select id, v_id, start_at + interval '3 minutes' from events where title like '[데모]%' and start_at < now() and (extract(day from start_at)::int % 3) <> 0
  on conflict do nothing;
end
$v$;

select m.name, m.email, m.role, coalesce(mp.stage::text, pp.stage::text) as stage,
       (select count(*) from matchings x where x.mentor_id = m.id or x.partner_id = m.id) as matchings
from members m left join mentor_profiles mp on mp.member_id = m.id left join partner_profiles pp on pp.member_id = m.id
where m.auth_user_id is not null and m.email not like '%@demo.wmto.invalid';
