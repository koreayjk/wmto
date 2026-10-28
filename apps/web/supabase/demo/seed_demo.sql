-- WMTO 데모 데이터: 사업가 50명, 선교사 20명, 후원자 8명, 신청자 8명과
-- 매칭, 멘토링 기록, 자립 리포트, 리퍼럴, 감사 편지, 모임·출석, 성장 단계, 스토리, 아카데미 영상.
-- 앱이 활발하게 돌아가는 모습을 시연하기 위한 가상 데이터입니다.
--
-- 사용법
--   1) Supabase > SQL Editor 에서 이 파일 전체를 붙여 넣고 Run 합니다. (한 번만 실행)
--   2) 이미 로그인할 수 있는 실제 회원(사업가/선교사)이 있으면, 그분의 화면에도 데모 활동이 채워집니다.
--   3) 시연이 끝나면 clear_demo.sql 을 실행하면 가상 데이터가 모두 지워집니다.
--
-- 표시: 데모 회원 이메일은 @demo.wmto.invalid (로그인 불가), 데모 일정·스토리·영상 제목은 [데모] 로 시작합니다.
set search_path = wmto;

create or replace function pg_temp.pick(a text[]) returns text language sql volatile as
$$ select a[1 + floor(random() * array_length(a, 1))::int] $$;

do $demo$
declare
  surnames text[] := array['김','이','박','최','정','강','조','윤','장','임','한','오','서','신','권','황','안','송','류','홍'];
  givens text[] := array['민준','서연','지훈','하은','도윤','수빈','예준','지우','현우','채원','주원','소영','태양','은지','성민','유진','동현','미래','재현','나연','승우','혜진','준서','다은','시우','가영','건우','보람','영호','지은','상훈','민서','진우','세린','태호','은서','용준','하린','기범','소희'];
  industries text[] := array['카페','제과제빵','미용실','사진·영상 스튜디오','홈페이지·앱 제작','회계사무소','인쇄·디자인','한식당','무역회사','법률·세무 자문','의류 제조','경영 컨설팅','IT 컨설팅','농산물 유통','교육 서비스'];
  prefixes text[] := array['온유','새벽','소망','감람','다윗','은혜','푸른','나눔','믿음','샘물'];
  fields text[] := array['캄보디아 프놈펜','필리핀 민다나오','태국 치앙마이','케냐 나이로비','우간다 캄팔라','인도네시아 족자','네팔 카트만두','몽골 울란바토르','페루 쿠스코','베트남 하노이','라오스 비엔티안','미얀마 양곤','탄자니아 아루샤','인도 푸네','키르기스스탄 비슈케크','카자흐스탄 알마티','에티오피아 아디스아바바','모잠비크 마푸투','튀르키예 이스탄불','볼리비아 라파스'];
  orgs text[] := array['IM선교회','열방선교회','소망선교회','푸른초장선교회','새벽이슬선교회','바나바선교회'];
  ideas text[] := array['작은 커피 로스팅 카페','현지 청년을 위한 제빵 교실','한국식 미용 서비스와 교육','현지 농산물 가공과 판매','재봉과 의류 소품 제작','홈페이지·디자인 외주 팀','소규모 게스트하우스','한국어 학원','공방과 수공예 판매','중고 컴퓨터 수리점'];
  clients text[] := array['동네 카페 사장님','이웃 교회 장로님','거래처 대표님','같은 상가 미용실 원장님','지인의 온라인 쇼핑몰','학부모 모임 대표','식자재 납품 업체','신규 개업 한식당','사진 촬영이 필요한 스타트업','홈페이지가 필요한 병원'];
  log_content text[] := array['판매 가격을 다시 계산하고 재료비 비율을 점검했습니다.','현지 손님이 어떤 메뉴를 좋아하는지 사진과 함께 공유하고 개선점을 이야기했습니다.','월별 매출과 지출을 기록하는 간단한 장부 양식을 함께 만들었습니다.','SNS에 올릴 첫 게시물의 사진과 문구를 같이 다듬었습니다.','가게 위치와 영업 시간을 정하고 이웃 상점과 협력할 방법을 의논했습니다.','다음 달 재료 구매 계획과 거래처 협상 방법을 정리했습니다.','직원을 처음 채용할 때 알아야 할 것과 급여 기준을 나눴습니다.','어려웠던 한 달을 돌아보고 다시 시작할 작은 목표를 세웠습니다.','할인 행사의 효과를 숫자로 확인하고 다음 행사를 계획했습니다.','현지 법과 세금 문제를 알아보고 필요한 서류를 정리했습니다.'];
  log_next text[] := array['가격표를 새로 만들어 이번 주 안에 공유하기','지출 장부를 매일 5분씩 기록하기','단골 손님 3명에게 후기를 부탁하기','SNS 게시물 두 개 올리고 반응 확인하기','거래처 두 곳에 견적 요청하기','다음 만남 전까지 메뉴 하나를 시험 판매하기','영업 시간을 일주일간 바꿔 보고 비교하기','현지 직원과 역할을 나눠 적어 보기'];
  log_pray text[] := array['사업이 어려운 달에도 낙심하지 않도록','현지 청년들과 좋은 관계를 맺도록','가족의 건강과 안정','지혜로운 재정 판단','동역할 현지 직원을 만나도록','비자와 서류 문제가 잘 풀리도록','지치지 않고 꾸준히 걸을 수 있도록'];
  thanks_body text[] := array['멘토님 덕분에 처음으로 월 매출을 기록해 보았습니다. 숫자가 보이니 마음이 한결 가벼워졌습니다. 감사합니다.','지난 만남에서 알려 주신 가격 계산법으로 메뉴를 다시 정리했더니 손님이 늘었습니다. 늘 곁에 계셔 주셔서 감사합니다.','혼자라고 느꼈던 시간에 멘토님의 한마디가 큰 힘이 되었습니다. 기도로 함께해 주셔서 감사합니다.','소개해 주신 거래처에서 첫 주문이 들어왔습니다. 하나님께 감사하고, 멘토님께도 감사드립니다.','어려운 달이었지만 끝까지 들어 주시고 방법을 같이 찾아 주셔서 감사합니다.','처음 만든 홈페이지가 열렸습니다. 현지 청년들이 함께 기뻐했습니다. 가르쳐 주셔서 감사합니다.'];
  difficulties text[] := array['재료 가격이 올라 이익이 줄었습니다.','현지 직원 관리가 어렵습니다.','손님이 적은 비수기였습니다.','결제와 장부 정리가 번거롭습니다.','거래처 확보가 필요합니다.','건강이 좋지 않아 일정을 줄였습니다.'];
  pray_r text[] := array['사업이 안정되도록','지혜로운 결정을 내리도록','현지 이웃과 좋은 관계를 맺도록','가족의 건강','다음 단계로 나아갈 용기'];
  mentor_chain text[] := array['seed','sower','harvester','elder'];
  partner_chain text[] := array['ready','launch','growing','self_sustaining'];

  ch uuid[] := '{}';
  mentor_ids uuid[] := '{}';
  partner_ids uuid[] := '{}';
  v_id uuid;
  i int; j int; k int; n int;
  ind_idx int;
  v_types contribution_type[];
  v_stage text;
  v_country text;
  m1 int; m2 int;
  r record;
  mt contribution_type;
  ev_id uuid;
  mid uuid;
begin
  if exists (select 1 from members where email like '%@demo.wmto.invalid') then
    raise exception '데모 데이터가 이미 있습니다. 먼저 clear_demo.sql 을 실행하세요.';
  end if;
  perform setseed(0.37);

  -- ───────── 챕터 ─────────
  for r in select * from (values ('[데모] 서울 챕터','한국'),('[데모] 미주 챕터','미주'),('[데모] 아시아 챕터','아시아')) t(name, region) loop
    insert into chapters (name, region) values (r.name, r.region) returning id into v_id;
    ch := ch || v_id;
  end loop;

  -- ───────── 사업가 50명 (단계: Seed 20 · Sower 18 · Harvester 8 · Elder 4) ─────────
  for i in 1..50 loop
    ind_idx := 1 + ((i * 3) % 15);
    v_types := case
      when ind_idx in (6,10,12,13) then '{coach,advisor}'::contribution_type[]
      when ind_idx in (9,14)       then '{channel,coach}'::contribution_type[]
      when i % 3 = 0               then '{skill,coach}'::contribution_type[]
      else '{skill}'::contribution_type[] end;
    v_stage := case when i <= 20 then 'seed' when i <= 38 then 'sower' when i <= 46 then 'harvester' else 'elder' end;
    v_country := case when i % 3 = 2 then '미국' else '대한민국' end;
    insert into members (role, name, email, phone, country, status, created_at)
    values ('mentor', surnames[1 + ((i * 7) % 20)] || givens[1 + ((i * 11) % 40)],
            'demo.mentor' || lpad(i::text, 2, '0') || '@demo.wmto.invalid',
            '010-' || lpad((1000 + i * 37)::text, 4, '0') || '-' || lpad((2000 + i * 53)::text, 4, '0'),
            v_country, 'active', now() - (60 + random() * 200) * interval '1 day')
    returning id into v_id;
    update members set chapter = (select name from chapters where id = ch[1 + (i % 3)]), chapter_id = ch[1 + (i % 3)] where id = v_id;
    insert into mentor_profiles (member_id, business_name, industry, contribution_types, stage)
    values (v_id, prefixes[1 + (i % 10)] || ' ' || industries[ind_idx], industries[ind_idx], v_types, v_stage::mentor_stage);
    mentor_ids := mentor_ids || v_id;
  end loop;

  -- ───────── 선교사 20명 (Ready 6 · Launch 7 · Growing 5 · Self-Sustaining 2) ─────────
  for i in 1..20 loop
    v_stage := case when i <= 6 then 'ready' when i <= 13 then 'launch' when i <= 18 then 'growing' else 'self_sustaining' end;
    insert into members (role, name, email, phone, country, status, created_at)
    values ('partner', surnames[1 + ((i * 9) % 20)] || givens[1 + ((i * 13 + 5) % 40)],
            'demo.partner' || lpad(i::text, 2, '0') || '@demo.wmto.invalid',
            '+' || (800 + i) || '-' || lpad((100000 + i * 731)::text, 6, '0'),
            split_part(fields[i], ' ', 1), 'active', now() - (40 + random() * 160) * interval '1 day')
    returning id into v_id;
    update members set chapter = (select name from chapters where id = ch[1 + (i % 3)]), chapter_id = ch[1 + (i % 3)] where id = v_id;
    insert into partner_profiles (member_id, mission_field, sending_org, business_idea, stage)
    values (v_id, fields[i], orgs[1 + (i % 6)], ideas[1 + (i % 10)], v_stage::partner_stage);
    partner_ids := partner_ids || v_id;
  end loop;

  -- ───────── 후원자 8명 ─────────
  for i in 1..8 loop
    insert into members (role, name, email, phone, country, status, created_at)
    values ('sponsor', case when i % 2 = 0 then surnames[1 + (i * 3 % 20)] || givens[1 + (i * 17 % 40)] else surnames[1 + (i * 5 % 20)] || givens[1 + (i * 19 % 40)] end,
            'demo.sponsor' || lpad(i::text, 2, '0') || '@demo.wmto.invalid', null, case when i % 2 = 0 then '대한민국' else '미국' end,
            'active', now() - (20 + random() * 120) * interval '1 day')
    returning id into v_id;
    insert into sponsor_profiles (member_id, sponsor_type, church_name)
    values (v_id, case when i % 2 = 0 then 'individual' else 'church' end::sponsor_type,
            case when i % 2 = 0 then null else (array['사랑의교회','푸른숲교회','은혜한인교회','소망교회'])[1 + (i % 4)] end);
  end loop;

  -- ───────── 신청자 8명과 신청서 (관리자 신청 목록 시연용) ─────────
  for i in 1..8 loop
    insert into members (role, name, email, phone, country, status, created_at)
    values ((array['mentor','partner','sponsor',null,'mentor','partner','sponsor','mentor'])[i]::member_role,
            surnames[1 + ((i * 4 + 1) % 20)] || givens[1 + ((i * 7 + 3) % 40)],
            'demo.apply' || lpad(i::text, 2, '0') || '@demo.wmto.invalid', '010-9000-00' || lpad(i::text, 2, '0'),
            case when i % 2 = 0 then '미국' else '대한민국' end, 'applicant', now() - i * interval '2 days')
    returning id into v_id;
    insert into applications (member_id, type, message, details, status, created_at)
    values (v_id,
            (array['observe','mentor_join','partner_consult','camp_apply','sponsor_inquiry','observe','camp_instructor','contact'])[i]::application_type,
            (array['온라인 모임을 한번 참관해 보고 싶습니다.','카페를 운영하고 있습니다. 선교사님께 도움이 되고 싶습니다.','자립 사업을 시작하고 싶은데 어디서부터 해야 할지 모르겠습니다.','다음 필리핀 캠프에 참가하고 싶습니다.','한 선교사님을 1:1로 후원하고 싶습니다.','지인의 소개로 알게 되었습니다. 어떤 모임인지 궁금합니다.','제과제빵 기술을 가르칠 수 있습니다.','후원 영수증 발급이 가능한지 문의드립니다.'])[i],
            jsonb_build_object('demo', true), (array['new','new','contacted','new','done','new','contacted','done'])[i]::application_status, now() - i * interval '2 days');
  end loop;

  -- ───────── 성장 단계 이력 (등급이 서로 다르게 보이도록) ─────────
  for r in select m.id, m.role, coalesce(mp.stage::text, pp.stage::text) as stage
           from members m left join mentor_profiles mp on mp.member_id = m.id left join partner_profiles pp on pp.member_id = m.id
           where m.email like '%@demo.wmto.invalid' and m.status = 'active' and m.role in ('mentor', 'partner') loop
    n := array_position(case when r.role = 'mentor' then mentor_chain else partner_chain end, r.stage);
    for k in 2..n loop
      insert into stage_history (member_id, role, from_stage, to_stage, note, created_at)
      values (r.id, r.role, (case when r.role = 'mentor' then mentor_chain else partner_chain end)[k - 1],
              (case when r.role = 'mentor' then mentor_chain else partner_chain end)[k],
              '운영위원회 승인', now() - ((n - k + 1) * 50 + random() * 20) * interval '1 day');
    end loop;
  end loop;

  -- ───────── 매칭 (Launch 이상 선교사는 담당 멘토가 있음. Growing 이상은 2명) ─────────
  for j in 7..20 loop
    m1 := 21 + ((j * 5) % 30);
    mt := (select contribution_types[1] from mentor_profiles where member_id = mentor_ids[m1]);
    insert into matchings (mentor_id, partner_id, contribution_type, started_at)
    values (mentor_ids[m1], partner_ids[j], mt, current_date - (40 + (random() * 150)::int));
    if j >= 14 then
      m2 := 21 + ((j * 7 + 3) % 30);
      if m2 <> m1 then
        mt := (select contribution_types[1] from mentor_profiles where member_id = mentor_ids[m2]);
        insert into matchings (mentor_id, partner_id, contribution_type, started_at)
        values (mentor_ids[m2], partner_ids[j], mt, current_date - (20 + (random() * 100)::int));
      end if;
    end if;
    -- 수락 기록이 남은 요청
    insert into matching_requests (partner_id, mentor_id, contribution_type, message, status, created_at, responded_at)
    select partner_id, mentor_id, contribution_type, '꼭 필요한 분야에서 도움을 받고 싶습니다.', 'accepted', started_at::timestamptz - interval '3 days', started_at::timestamptz
    from matchings where partner_id = partner_ids[j] order by started_at limit 1;
  end loop;

  -- 아직 매칭을 기다리는 요청 (Ready 선교사)
  for j in 1..6 loop
    insert into matching_requests (partner_id, contribution_type, message, status, created_at)
    values (partner_ids[j], (array['skill','coach','channel','advisor','skill','coach'])[j]::contribution_type,
            (array['커피 로스팅 기술을 배우고 싶습니다.','사업 계획서와 가격 책정을 도와주실 분을 찾습니다.','현지 생산품을 한국에서 판매할 거래처가 필요합니다.','현지 법인 설립과 세무에 대해 상담이 필요합니다.','제빵 기술을 가르쳐 주실 분을 찾습니다.','회계 장부를 처음 쓰는 방법을 알고 싶습니다.'])[j],
            'pending', now() - (j * 1.5) * interval '1 day');
  end loop;
  insert into matching_requests (partner_id, contribution_type, message, status, created_at)
  values (partner_ids[3], 'advisor', '비자 문제로 법률 자문을 구합니다.', 'pending', now() - interval '1 day'),
         (partner_ids[5], 'channel', '이전 요청은 다른 길을 찾아 취소했습니다.', 'cancelled', now() - interval '20 days');

  -- ───────── 일정: 지난 모임 11개 + 다가오는 모임 9개 ─────────
  for k in 1..8 loop
    insert into events (type, title, start_at, end_at, location, meeting_provider, meeting_url)
    values ('online', '[데모] 격주 온라인 모임 #' || (9 - k), (current_date - k * 14)::timestamptz + interval '11 hours', (current_date - k * 14)::timestamptz + interval '12 hours',
            '온라인', 'zoom', 'https://zoom.us/j/demo' || k);
  end loop;
  for k in 1..3 loop
    insert into events (type, title, start_at, end_at, location)
    values ('offline', '[데모] 오프라인 모임 (' || (array['서울','부산','대전'])[k] || ')', (current_date - k * 30 - 5)::timestamptz + interval '10 hours', (current_date - k * 30 - 5)::timestamptz + interval '13 hours',
            (array['서울 강남 모임 장소','부산 해운대 모임 장소','대전 유성 모임 장소'])[k]);
  end loop;
  for k in 0..4 loop
    insert into events (type, title, start_at, end_at, location, meeting_provider, meeting_url)
    values ('online', '[데모] 격주 온라인 모임 #' || (9 + k), (current_date + (k * 14 + 3))::timestamptz + interval '11 hours', (current_date + (k * 14 + 3))::timestamptz + interval '12 hours',
            '온라인', 'zoom', 'https://zoom.us/j/demo' || (20 + k));
  end loop;
  insert into events (type, title, start_at, end_at, location) values
    ('offline', '[데모] 서울 오프라인 모임', (current_date + 12)::timestamptz + interval '10 hours', (current_date + 12)::timestamptz + interval '13 hours', '서울 강남 모임 장소'),
    ('offline', '[데모] 미주 오프라인 모임', (current_date + 26)::timestamptz + interval '18 hours', (current_date + 26)::timestamptz + interval '21 hours', '달라스 모임 장소'),
    ('camp', '[데모] 1기 필리핀 훈련 캠프 (3주)', (current_date + 60)::timestamptz, (current_date + 80)::timestamptz, '필리핀 선교본부'),
    ('conference', '[데모] 글로벌 컨퍼런스', (current_date + 150)::timestamptz + interval '9 hours', (current_date + 151)::timestamptz + interval '17 hours', '서울');

  -- ───────── 출석 (지난 모임마다 회원의 일부가 참석) ─────────
  insert into attendance (event_id, member_id, attended_at)
  select e.id, m.id, e.start_at + interval '4 minutes'
  from events e join members m on m.email like '%@demo.wmto.invalid' and m.status = 'active' and m.role in ('mentor','partner')
  where e.title like '[데모]%' and e.start_at < now()
    and random() < case when m.role = 'partner' then 0.78 else 0.55 end;

  -- ───────── 멘토링 기록 ─────────
  for r in select id, mentor_id from matchings where mentor_id = any (mentor_ids) and partner_id = any (partner_ids) loop
    n := 3 + floor(random() * 4)::int;
    for k in 1..n loop
      insert into mentoring_logs (matching_id, held_at, duration_min, content, created_by, next_steps, prayer_topics, created_at)
      values (r.id, now() - (case when k = 1 then random() * 18 else random() * 115 end) * interval '1 day',
              (array[30,45,60,60,90])[1 + floor(random() * 5)::int], pg_temp.pick(log_content), r.mentor_id,
              case when random() < 0.65 then pg_temp.pick(log_next) end, case when random() < 0.5 then pg_temp.pick(log_pray) end, now());
    end loop;
    -- 감사 편지 1~2통
    for k in 1..(1 + floor(random() * 2)::int) loop
      insert into thanks_letters (sender_id, recipient_id, body, read_at, created_at)
      select partner_id, mentor_id, pg_temp.pick(thanks_body), case when random() < 0.7 then now() - random() * interval '10 days' end, now() - random() * 70 * interval '1 day'
      from matchings where id = r.id;
    end loop;
  end loop;

  -- ───────── 자립 리포트 (Launch 이상 선교사, 최근 5개월) ─────────
  for j in 7..20 loop
    for k in 0..4 loop
      insert into self_reports (partner_id, month, revenue_amount, currency, self_reliance, difficulties, prayer_topics)
      values (partner_ids[j], date_trunc('month', now() - k * interval '1 month')::date,
              round((case when j <= 13 then random() * 300000 when j <= 18 then 600000 + random() * 2400000 else 3000000 + random() * 3000000 end)::numeric * (1.0 - k * 0.12), -3),
              'KRW', greatest(1, least(5, (case when j <= 13 then 2 when j <= 18 then 3 else 5 end) + (case when k >= 3 then -1 else 0 end) + (case when random() < 0.3 then 1 else 0 end))),
              pg_temp.pick(difficulties), pg_temp.pick(pray_r));
    end loop;
  end loop;

  -- ───────── 리퍼럴 60건 (사업가끼리 고객 소개) ─────────
  for k in 1..60 loop
    i := 1 + floor(random() * 50)::int;
    j := ((i - 1 + 1 + floor(random() * 49)::int) % 50) + 1;
    insert into referrals (giver_id, receiver_id, client_name, client_contact, note, status, created_at)
    values (mentor_ids[i], mentor_ids[j], pg_temp.pick(clients), '010-' || lpad((3000 + k * 17)::text, 4, '0') || '-' || lpad((5000 + k * 29)::text, 4, '0'),
            pg_temp.pick(array['도움이 필요하다고 하셔서 소개합니다.','가격 협의가 가능하다고 전해 두었습니다.','먼저 전화 드려 보시면 좋겠습니다.','꼭 한번 만나 보시길 권합니다.']),
            (array['sent','sent','contacted','closed'])[1 + floor(random() * 4)::int]::referral_status, now() - random() * 90 * interval '1 day');
  end loop;

  -- ───────── 스토리와 아카데미 영상 ─────────
  insert into stories (title, body, image_url, is_example, published_at) values
    ('[데모] 캄보디아의 작은 카페가 청년들의 모임터가 되었습니다', '20년째 카페를 운영하는 사업가가 필리핀 캠프에서 커피 사업을 가르쳤고, 선교사는 순환 기금으로 작은 카페를 열었습니다. 1년 뒤 그 카페는 현지 청년들이 모여 성경을 읽는 자리가 되었습니다.', null, true, now() - interval '12 days'),
    ('[데모] 제빵 교실에서 시작된 자립', '한 사업가가 3주 동안 제빵 기술을 가르쳤습니다. 이제 선교사님은 빵 판매 수입으로 사역비의 절반을 충당하고, 현지 자매들에게 기술을 나누고 있습니다.', null, true, now() - interval '30 days'),
    ('[데모] 갚은 기금이 다음 선교사의 시작이 되었습니다', '첫 번째 선교사가 순환 기금을 갚았고, 그 돈은 곧바로 다음 선교사의 창업 자금이 되었습니다. 받은 은혜가 흘러가는 것을 직접 볼 수 있었습니다.', null, true, now() - interval '55 days'),
    ('[데모] 사업가의 한마디가 선교사의 길을 바꾸었습니다', '가격을 다시 계산해 보라는 한마디로 시작된 멘토링이 반년 뒤 흑자 전환으로 이어졌습니다.', null, true, now() - interval '80 days');

  insert into academy_videos (title, description, video_url, provider, category, for_roles, published_at) values
    ('[데모] 사업 계획서 첫걸음', '아이템을 정하고 한 장짜리 계획서를 만드는 방법', 'https://example.com/demo-video-1', 'other', '사업 기초', '{mentor,partner,sponsor}', now() - interval '60 days'),
    ('[데모] 가격은 어떻게 정할까', '재료비와 인건비, 이익을 나누어 가격을 계산합니다', 'https://example.com/demo-video-2', 'other', '사업 기초', '{partner,mentor}', now() - interval '50 days'),
    ('[데모] 장부 쓰기 5분 습관', '매일 5분으로 월말 정산이 쉬워지는 방법', 'https://example.com/demo-video-3', 'other', '사업 기초', '{partner}', now() - interval '45 days'),
    ('[데모] SNS 홍보 처음 시작하기', '사진 한 장과 문구 세 줄로 시작하는 홍보', 'https://example.com/demo-video-4', 'other', '마케팅', '{partner,mentor}', now() - interval '35 days'),
    ('[데모] 커피 로스팅 기초 실습', '캠프 실습 영상: 생두 고르기와 로스팅 단계', 'https://example.com/demo-video-5', 'other', '기술 실습', '{partner,mentor}', now() - interval '25 days'),
    ('[데모] 좋은 멘토가 되는 법', '질문하고 듣고 끝까지 동행하는 멘토링 안내', 'https://example.com/demo-video-6', 'other', '멘토 교육', '{mentor}', now() - interval '18 days'),
    ('[데모] 선교지 사례 나눔: 제빵 교실', '현장 선교사가 직접 들려주는 1년의 이야기', 'https://example.com/demo-video-7', 'other', '선교 사례', '{mentor,partner,sponsor}', now() - interval '9 days'),
    ('[데모] 후원은 어떻게 열매가 되는가', '순환 기금이 다음 사람에게 흘러가는 과정', 'https://example.com/demo-video-8', 'other', '선교 사례', '{sponsor,mentor}', now() - interval '3 days');

  -- ───────── 실제로 로그인할 수 있는 회원의 화면도 채우기 ─────────
  for r in select m.id, m.role from members m
           where m.auth_user_id is not null and m.status = 'active' and m.email not like '%@demo.wmto.invalid' and m.role in ('mentor','partner') loop
    if r.role = 'mentor' then
      update mentor_profiles set contribution_types = '{skill,coach}' where member_id = r.id and coalesce(array_length(contribution_types, 1), 0) = 0;
      -- 담당 선교사 3명
      for j in select * from unnest(array[8, 10, 15]) loop
        mt := (select (contribution_types)[1 + (j % array_length(contribution_types, 1))] from mentor_profiles where member_id = r.id);
        insert into matchings (mentor_id, partner_id, contribution_type, started_at) values (r.id, partner_ids[j], mt, current_date - (30 + j * 3))
        on conflict do nothing;
      end loop;
      -- 리퍼럴 받기·보내기
      for k in 1..5 loop
        insert into referrals (giver_id, receiver_id, client_name, note, status, created_at)
        values (mentor_ids[3 + k * 7], r.id, pg_temp.pick(clients), '꼭 한번 만나 보시길 권합니다.', (array['sent','sent','contacted','closed','sent'])[k]::referral_status, now() - k * interval '4 days');
      end loop;
      for k in 1..3 loop
        insert into referrals (giver_id, receiver_id, client_name, note, status, created_at)
        values (r.id, mentor_ids[5 + k * 9], pg_temp.pick(clients), '도움이 필요하다고 하셔서 소개합니다.', (array['sent','contacted','closed'])[k]::referral_status, now() - k * interval '9 days');
      end loop;
    else
      for j in select * from unnest(array[40, 25]) loop
        mt := (select contribution_types[1] from mentor_profiles where member_id = mentor_ids[j]);
        insert into matchings (mentor_id, partner_id, contribution_type, started_at) values (mentor_ids[j], r.id, mt, current_date - (60 + j))
        on conflict do nothing;
      end loop;
      for k in 0..2 loop
        insert into self_reports (partner_id, month, revenue_amount, currency, self_reliance, difficulties, prayer_topics)
        values (r.id, date_trunc('month', now() - k * interval '1 month')::date, round((300000 + (3 - k) * 250000)::numeric, -3), 'KRW', 2 + (case when k = 0 then 1 else 0 end), '[데모] ' || pg_temp.pick(difficulties), pg_temp.pick(pray_r))
        on conflict do nothing;
      end loop;
    end if;
    -- 그 회원과 연결된 모든 매칭에 기록과 편지
    for mid in select id from matchings where mentor_id = r.id or partner_id = r.id loop
      for n in 1..4 loop
        insert into mentoring_logs (matching_id, held_at, duration_min, content, created_by, next_steps, prayer_topics)
        select mid, now() - (n * 11 - 6) * interval '1 day', (array[45,60,60,90])[n], pg_temp.pick(log_content), mentor_id, pg_temp.pick(log_next), case when n % 2 = 0 then pg_temp.pick(log_pray) end
        from matchings where id = mid;
      end loop;
      insert into thanks_letters (sender_id, recipient_id, body, read_at, created_at)
      select partner_id, mentor_id, pg_temp.pick(thanks_body), case when random() < 0.4 then now() end, now() - random() * 5 * interval '1 day' from matchings where id = mid
      union all
      select partner_id, mentor_id, pg_temp.pick(thanks_body), now(), now() - interval '20 days' from matchings where id = mid;
    end loop;
    insert into attendance (event_id, member_id, attended_at)
    select id, r.id, start_at + interval '3 minutes' from events where title like '[데모]%' and start_at < now() and random() < 0.7
    on conflict do nothing;
  end loop;
end
$demo$;

-- 결과 확인
select
  (select count(*) from members where email like '%@demo.wmto.invalid' and role = 'mentor' and status = 'active')  as mentors,
  (select count(*) from members where email like '%@demo.wmto.invalid' and role = 'partner' and status = 'active') as partners,
  (select count(*) from matchings)        as matchings,
  (select count(*) from mentoring_logs)   as mentoring_logs,
  (select count(*) from referrals)        as referrals,
  (select count(*) from thanks_letters)   as thanks_letters,
  (select count(*) from events where title like '[데모]%') as events,
  (select count(*) from attendance)       as attendance;
