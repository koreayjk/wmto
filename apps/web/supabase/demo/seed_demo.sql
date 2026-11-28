-- WMTO 데모 데이터: 사업가 100명, 선교사 50명(전 세계 선교지), 후원자 30명, 신청자 8명과
-- 매칭, 멘토링 기록, 자립 리포트, 리퍼럴, 감사 편지, 모임·출석, 성장 단계, 스토리, 아카데미 영상.
-- 앱이 활발하게 돌아가는 모습을 시연하기 위한 가상 데이터입니다.
--
-- 사용법
--   1) Supabase > SQL Editor 에서 이 파일 전체를 붙여 넣고 Run 합니다. (한 번만 실행)
--   2) 이미 로그인할 수 있는 실제 회원(사업가/선교사)이 있으면, 그분의 화면에도 데모 활동이 채워집니다.
--   3) 시연이 끝나면 clear_demo.sql 을 실행하면 가상 데이터가 모두 지워집니다.
--
-- CBC 사업가 화면용 보강(서울 1텐트 40명, 소그룹, 추천사 등)이 맨 끝에 들어 있습니다. 마이그레이션 0036 까지 적용된 DB 에서 실행하세요.
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
  fields text[] := array['캄보디아 프놈펜','필리핀 민다나오','태국 치앙마이','케냐 나이로비','우간다 캄팔라','인도네시아 족자','네팔 카트만두','몽골 울란바토르','페루 쿠스코','베트남 하노이','라오스 비엔티안','미얀마 양곤','탄자니아 아루샤','인도 푸네','키르기스스탄 비슈케크','카자흐스탄 알마티','에티오피아 아디스아바바','모잠비크 마푸투','튀르키예 이스탄불','볼리비아 라파스','방글라데시 다카','스리랑카 콜롬보','파키스탄 라호르','일본 오사카','말레이시아 쿠알라룸푸르','동티모르 딜리','파푸아뉴기니 포트모르즈비','가나 아크라','나이지리아 라고스','콩고민주공화국 고마','말라위 릴롱궤','잠비아 루사카','짐바브웨 불라와요','마다가스카르 안타나나리보','세네갈 다카르','모로코 카사블랑카','이집트 카이로','요르단 암만','우즈베키스탄 타슈켄트','러시아 블라디보스토크','우크라이나 리비우','불가리아 소피아','과테말라 과테말라시티','에콰도르 키토','콜롬비아 메데인','브라질 상파울루','아이티 포르토프랭스','도미니카공화국 산토도밍고','피지 수바','중국 쿤밍'];
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
  sponsor_ids uuid[] := '{}';
  v_id uuid;
  i int; j int; k int; n int;
  ind_idx int;
  v_types contribution_type[];
  v_stage text;
  v_country text;
  v_combo text;
  combos text[] := array['대한민국|서울|강남구','대한민국|서울|서초구','대한민국|서울|마포구','대한민국|서울|송파구','대한민국|서울|강서구','대한민국|서울|성북구','대한민국|서울|강동구','대한민국|서울|영등포구','대한민국|경기도|성남시','대한민국|경기도|수원시','대한민국|경기도|용인시','대한민국|경기도|고양시','대한민국|경기도|부천시','대한민국|경기도|안양시','대한민국|부산|해운대구','대한민국|부산|수영구','대한민국|대구|수성구','대한민국|인천|연수구','대한민국|대전|유성구','대한민국|광주|북구','대한민국|충청남도|천안시','대한민국|전라북도|전주시','대한민국|경상남도|창원시','대한민국|제주도|제주시','대한민국|강원도|춘천시','미국||달라스','미국||LA','캐나다||토론토','필리핀||마닐라'];
  sp_combos text[] := array['대한민국|서울|서초구','대한민국|경기도|성남시','미국||달라스','대한민국|부산|해운대구','대한민국|서울|강남구','미국||LA','대한민국|경기도|수원시','대한민국|대구|수성구','대한민국|서울|마포구','대한민국|경기도|용인시','대한민국|인천|연수구','캐나다||토론토','대한민국|대전|유성구','대한민국|서울|송파구','미국||시애틀','호주||시드니'];
  m1 int; m2 int;
  r record;
  mt contribution_type;
  ev_id uuid;
  mid uuid;
  sc_mentor uuid; sc_partner uuid; sc_sponsor uuid;
begin
  if exists (select 1 from members where email like '%@demo.wmto.invalid') then
    raise exception '데모 데이터가 이미 있습니다. 먼저 clear_demo.sql 을 실행하세요.';
  end if;
  perform setseed(0.37);

  -- 텐트는 지역 정보를 가진 사업가·후원자가 들어올 때 자동으로 만들어집니다(12명이 넘으면 둘로 나뉩니다).

  -- ───────── 사업가 100명 (단계: Seed 40 · Sower 36 · Harvester 16 · Elder 8) ─────────
  for i in 1..100 loop
    ind_idx := 1 + ((i * 3) % 15);
    v_types := case
      when ind_idx in (6,10,12,13) then '{coach,advisor}'::contribution_type[]
      when ind_idx in (9,14)       then '{channel,coach}'::contribution_type[]
      when i % 3 = 0               then '{skill,coach}'::contribution_type[]
      else '{skill}'::contribution_type[] end;
    v_stage := case when i <= 40 then 'seed' when i <= 76 then 'sower' when i <= 92 then 'harvester' else 'elder' end;
    v_combo := combos[1 + ((i - 1) % 29)];
    insert into members (role, name, email, phone, country, region, district, status, created_at)
    values ('mentor', surnames[1 + ((i * 7 + i / 20) % 20)] || givens[1 + ((i * 11 + i / 10) % 40)],
            'demo.mentor' || lpad(i::text, 3, '0') || '@demo.wmto.invalid',
            '010-' || lpad((1000 + i * 37)::text, 4, '0') || '-' || lpad((2000 + i * 53)::text, 4, '0'),
            split_part(v_combo, '|', 1), nullif(split_part(v_combo, '|', 2), ''), split_part(v_combo, '|', 3), 'active', now() - (60 + random() * 200) * interval '1 day')
    returning id into v_id;
    insert into mentor_profiles (member_id, business_name, industry, contribution_types, stage)
    values (v_id, prefixes[1 + (i % 10)] || ' ' || industries[ind_idx], industries[ind_idx], v_types, v_stage::mentor_stage);
    mentor_ids := mentor_ids || v_id;
  end loop;

  -- ───────── 선교사 50명, 전 세계 선교지 (Ready 15 · Launch 17 · Growing 13 · Self-Sustaining 5) ─────────
  for i in 1..50 loop
    v_stage := case when i <= 15 then 'ready' when i <= 32 then 'launch' when i <= 45 then 'growing' else 'self_sustaining' end;
    insert into members (role, name, email, phone, country, status, created_at)
    values ('partner', surnames[1 + ((i * 9 + i / 20) % 20)] || givens[1 + ((i * 13 + 5 + i / 7) % 40)],
            'demo.partner' || lpad(i::text, 2, '0') || '@demo.wmto.invalid',
            '+' || (800 + i) || '-' || lpad((100000 + i * 731)::text, 6, '0'),
            split_part(fields[i], ' ', 1), 'active', now() - (40 + random() * 160) * interval '1 day')
    returning id into v_id;
    -- 선교사는 따로 텐트를 정하지 않습니다. 멘토가 픽업하면 그 멘토의 텐트에 함께합니다.
    insert into partner_profiles (member_id, mission_field, sending_org, business_idea, stage)
    values (v_id, fields[i], orgs[1 + (i % 6)], ideas[1 + (i % 10)], v_stage::partner_stage);
    partner_ids := partner_ids || v_id;
  end loop;

  -- ───────── 후원자 30명 ─────────
  for i in 1..30 loop
    insert into members (role, name, email, phone, country, region, district, status, created_at)
    values ('sponsor', surnames[1 + ((i * 3 + i / 4) % 20)] || givens[1 + ((i * 17 + i / 3) % 40)],
            'demo.sponsor' || lpad(i::text, 2, '0') || '@demo.wmto.invalid', null,
            split_part(sp_combos[1 + ((i - 1) % 16)], '|', 1), nullif(split_part(sp_combos[1 + ((i - 1) % 16)], '|', 2), ''), split_part(sp_combos[1 + ((i - 1) % 16)], '|', 3),
            'active', now() - (20 + random() * 120) * interval '1 day')
    returning id into v_id;
    insert into sponsor_profiles (member_id, sponsor_type, church_name)
    values (v_id, case when i % 2 = 0 then 'individual' else 'church' end::sponsor_type,
            case when i % 2 = 0 then null else (array['사랑의교회','푸른숲교회','은혜한인교회','소망교회'])[1 + (i % 4)] end);
    sponsor_ids := sponsor_ids || v_id;
  end loop;


  -- ───────── 후원 내역 (정기 후원, 선교사 1:1 후원, 캠프 장학금, 순환 기금) ─────────
  for i in 1..30 loop
    for k in 0..(3 + (i % 5)) loop
      insert into donations (sponsor_id, kind, amount, donated_at)
      values (sponsor_ids[i], 'monthly', (array[10000, 30000, 50000, 100000])[1 + (i % 4)], current_date - k * 30 - (i % 9));
    end loop;
    if i <= 24 then
      insert into donations (sponsor_id, kind, partner_id, amount, donated_at)
      values (sponsor_ids[i], 'one_to_one', partner_ids[15 + i], (array[1500000, 1800000, 2000000, 2500000, 1500000, 2000000])[1 + (i % 6)], current_date - (5 + i * 6));
    end if;
    if i % 2 = 1 then
      insert into donations (sponsor_id, kind, amount, donated_at) values (sponsor_ids[i], 'camp', 300000 + i * 100000, current_date - (15 + i * 6));
    end if;
    if i % 3 = 0 then
      insert into donations (sponsor_id, kind, amount, donated_at) values (sponsor_ids[i], 'fund', 1000000 + i * 200000, current_date - (40 + i * 5));
    end if;
  end loop;

  -- ───────── 순환 기금 대여 (캠프를 마친 Launch 이상 선교사) ─────────
  for j in 16..50 loop
    insert into fund_loans (partner_id, amount, repaid, funded_by_repayment, status, issued_at)
    values (partner_ids[j], (array[1000000, 1500000, 2000000, 3000000, 2500000])[1 + (j % 5)],
            case when j >= 46 then (array[1000000, 1500000, 2000000, 3000000, 2500000])[1 + (j % 5)]
                 when j >= 33 then round(((array[1000000, 1500000, 2000000, 3000000, 2500000])[1 + (j % 5)] * 0.45)::numeric, -3) else 0 end,
            j % 4 = 0, case when j >= 46 then 'repaid' else 'active' end, current_date - (30 + (j - 15) * 7));
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
  for j in 16..50 loop
    m1 := 41 + ((j * 5) % 60);
    mt := (select contribution_types[1] from mentor_profiles where member_id = mentor_ids[m1]);
    insert into matchings (mentor_id, partner_id, contribution_type, started_at)
    values (mentor_ids[m1], partner_ids[j], mt, current_date - (40 + (random() * 150)::int));
    if j >= 33 then
      m2 := 41 + ((j * 7 + 3) % 60);
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
  for j in 1..15 loop
    insert into matching_requests (partner_id, contribution_type, message, status, created_at)
    values (partner_ids[j], (array['skill','coach','channel','advisor','skill','coach'])[1 + ((j - 1) % 6)]::contribution_type,
            (array['커피 로스팅 기술을 배우고 싶습니다.','사업 계획서와 가격 책정을 도와주실 분을 찾습니다.','현지 생산품을 한국에서 판매할 거래처가 필요합니다.','현지 법인 설립과 세무에 대해 상담이 필요합니다.','제빵 기술을 가르쳐 주실 분을 찾습니다.','회계 장부를 처음 쓰는 방법을 알고 싶습니다.'])[1 + ((j - 1) % 6)],
            'pending', now() - (j * 0.7) * interval '1 day');
  end loop;
    insert into matching_requests (partner_id, contribution_type, message, status, created_at)
  values (partner_ids[3], 'advisor', '비자 문제로 법률 자문을 구합니다.', 'pending', now() - interval '1 day'),
         (partner_ids[5], 'channel', '이전 요청은 다른 길을 찾아 취소했습니다.', 'cancelled', now() - interval '20 days');

  -- ───────── 일정: 지난 모임 11개 + 다가오는 모임 9개 ─────────
  for k in 1..12 loop
    insert into events (type, title, start_at, end_at, location, meeting_provider, meeting_url)
    values ('online', '[데모] 격주 온라인 모임 #' || (13 - k), (current_date - k * 14)::timestamptz + interval '11 hours', (current_date - k * 14)::timestamptz + interval '12 hours',
            '온라인', 'zoom', 'https://zoom.us/j/demo' || k);
  end loop;
  for k in 1..3 loop
    insert into events (type, title, start_at, end_at, location)
    values ('offline', '[데모] 오프라인 모임 (' || (array['서울','부산','대전'])[k] || ')', (current_date - k * 30 - 5)::timestamptz + interval '10 hours', (current_date - k * 30 - 5)::timestamptz + interval '13 hours',
            (array['서울 강남 모임 장소','부산 해운대 모임 장소','대전 유성 모임 장소'])[k]);
  end loop;
  for k in 1..3 loop
    insert into events (type, title, start_at, end_at, location)
    values ('offline', '[데모] 오프라인 모임 (' || (array['인천','광주','대구'])[k] || ')', (current_date - (110 + k * 22))::timestamptz + interval '10 hours', (current_date - (110 + k * 22))::timestamptz + interval '13 hours',
            (array['인천 모임 장소','광주 모임 장소','대구 모임 장소'])[k]);
  end loop;
  for k in 0..4 loop
    insert into events (type, title, start_at, end_at, location, meeting_provider, meeting_url)
    values ('online', '[데모] 격주 온라인 모임 #' || (13 + k), (current_date + (k * 14 + 3))::timestamptz + interval '11 hours', (current_date + (k * 14 + 3))::timestamptz + interval '12 hours',
            '온라인', 'zoom', 'https://zoom.us/j/demo' || (20 + k));
  end loop;
  insert into events (type, title, start_at, end_at, location, meeting_provider, meeting_url) values
    ('online', '[데모] 오늘 저녁 온라인 모임', now() + interval '2 hours', now() + interval '3 hours', '온라인', 'zoom', 'https://zoom.us/j/demo-today'),
    ('online', '[데모] 선교사 기도 모임', current_date::timestamptz + interval '1 day 20 hours', current_date::timestamptz + interval '1 day 21 hours', '온라인', 'zoom', 'https://zoom.us/j/demo-prayer');
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
    n := 6 + floor(random() * 7)::int;
    for k in 1..n loop
      insert into mentoring_logs (matching_id, held_at, duration_min, content, created_by, next_steps, prayer_topics, created_at, shared)
      values (r.id, now() - (case when k = 1 then random() * 3 when k <= 3 then random() * 14 else random() * 150 end) * interval '1 day',
              (array[30,45,60,60,90])[1 + floor(random() * 5)::int], pg_temp.pick(log_content), r.mentor_id,
              case when random() < 0.65 then pg_temp.pick(log_next) end, case when random() < 0.5 then pg_temp.pick(log_pray) end, now(), random() > 0.18);
    end loop;
    -- 감사 편지 1~2통
    for k in 1..(2 + floor(random() * 3)::int) loop
      insert into thanks_letters (sender_id, recipient_id, body, read_at, created_at)
      select partner_id, mentor_id, pg_temp.pick(thanks_body), case when random() < 0.7 then now() - random() * interval '10 days' end, now() - random() * 70 * interval '1 day'
      from matchings where id = r.id;
    end loop;
  end loop;

  -- ───────── 자립 리포트 (Launch 이상 선교사, 최근 5개월) ─────────
  for j in 16..50 loop
    for k in 0..5 loop
      insert into self_reports (partner_id, month, revenue_amount, currency, self_reliance, difficulties, prayer_topics)
      values (partner_ids[j], date_trunc('month', now() - k * interval '1 month')::date,
              round((case when j <= 32 then random() * 300000 when j <= 45 then 600000 + random() * 2400000 else 3000000 + random() * 3000000 end)::numeric * (1.0 - k * 0.12), -3),
              'KRW', greatest(1, least(5, (case when j <= 32 then 2 when j <= 45 then 3 else 5 end) + (case when k >= 3 then -1 else 0 end) + (case when random() < 0.3 then 1 else 0 end))),
              pg_temp.pick(difficulties), pg_temp.pick(pray_r));
    end loop;
  end loop;

  -- ───────── 리퍼럴 400건 (사업가끼리 고객 소개) ─────────
  for k in 1..400 loop
    i := 1 + floor(random() * 100)::int;
    j := ((i - 1 + 1 + floor(random() * 99)::int) % 100) + 1;
    insert into referrals (giver_id, receiver_id, client_name, client_contact, note, status, created_at)
    values (mentor_ids[i], mentor_ids[j], pg_temp.pick(clients), '010-' || lpad((3000 + k * 17)::text, 4, '0') || '-' || lpad((5000 + k * 29)::text, 4, '0'),
            pg_temp.pick(array['도움이 필요하다고 하셔서 소개합니다.','가격 협의가 가능하다고 전해 두었습니다.','먼저 전화 드려 보시면 좋겠습니다.','꼭 한번 만나 보시길 권합니다.']),
            (array['sent','sent','contacted','closed'])[1 + floor(random() * 4)::int]::referral_status, now() - (case when random() < 0.3 then random() * 10 else random() * 150 end) * interval '1 day');
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


  -- ───────── 체험 모드의 주인공 3명 (모든 기능이 가득 채워진 대표 회원) ─────────
  insert into members (role, name, email, phone, country, region, district, status, created_at)
  values ('mentor', '김은혜', 'demo.showcase.mentor@demo.wmto.invalid', '010-1000-0001', '대한민국', '서울', '강남구', 'active', now() - interval '240 days')
  returning id into sc_mentor;
  insert into mentor_profiles (member_id, business_name, industry, contribution_types, stage)
  values (sc_mentor, '온유 카페', '카페', '{skill,coach}', 'harvester');
  insert into members (role, name, email, phone, country, status, created_at)
  values ('partner', '이소망', 'demo.showcase.partner@demo.wmto.invalid', '+855-10-000-001', '캄보디아', 'active', now() - interval '200 days')
  returning id into sc_partner;
  insert into partner_profiles (member_id, mission_field, sending_org, business_idea, stage)
  values (sc_partner, '캄보디아 프놈펜', 'IM선교회', '작은 커피 로스팅 카페와 현지 청년 바리스타 교육', 'growing');
  insert into members (role, name, email, country, district, status, created_at)
  values ('sponsor', '최은성', 'demo.showcase.sponsor@demo.wmto.invalid', '미국', '달라스', 'active', now() - interval '180 days')
  returning id into sc_sponsor;
  insert into sponsor_profiles (member_id, sponsor_type) values (sc_sponsor, 'individual');

  -- 텐트에 모셔진 선교사(멘토를 기다림): 대표 사업가의 텐트와 경기도 텐트
  update members set chapter_id = x.cid, chapter = x.cname
    from (select c.id as cid, c.name as cname from chapters c join members mm on mm.chapter_id = c.id where mm.id = sc_mentor) x
   where members.id in (partner_ids[1], partner_ids[2], partner_ids[4], partner_ids[6], partner_ids[8], partner_ids[10], partner_ids[12]);
  update members set chapter_id = x.cid, chapter = x.cname
    from (select c.id as cid, c.name as cname from chapters c join members mm on mm.chapter_id = c.id where mm.id = mentor_ids[11]) x
   where members.id in (partner_ids[5], partner_ids[11], partner_ids[13]);

  insert into stage_history (member_id, role, from_stage, to_stage, note, created_at) values
    (sc_mentor, 'mentor', 'seed', 'sower', '운영위원회 승인', now() - interval '200 days'),
    (sc_mentor, 'mentor', 'sower', 'harvester', '운영위원회 승인', now() - interval '45 days'),
    (sc_partner, 'partner', 'ready', 'launch', '운영위원회 승인', now() - interval '150 days'),
    (sc_partner, 'partner', 'launch', 'growing', '운영위원회 승인', now() - interval '25 days');

  -- 매칭: 대표 사업가는 선교사 4명과, 대표 선교사는 멘토 2명과 동행
  insert into matchings (mentor_id, partner_id, contribution_type, started_at) values
    (sc_mentor, sc_partner, 'skill', current_date - 150),
    (sc_mentor, partner_ids[20], 'coach', current_date - 120),
    (sc_mentor, partner_ids[24], 'skill', current_date - 95),
    (sc_mentor, partner_ids[28], 'coach', current_date - 70),
    (mentor_ids[61], sc_partner, (select contribution_types[1] from mentor_profiles where member_id = mentor_ids[61]), current_date - 100);
  insert into matching_requests (partner_id, mentor_id, contribution_type, message, status, created_at, responded_at)
  values (sc_partner, sc_mentor, 'skill', '로스팅 기술을 가르쳐 주실 분을 찾고 있습니다.', 'accepted', now() - interval '153 days', now() - interval '150 days');
  insert into matching_requests (partner_id, contribution_type, message, status, created_at)
  values (sc_partner, 'channel', '[데모] 로스팅한 원두를 한국에서 판매할 거래처를 찾고 있습니다.', 'pending', now() - interval '2 days');

  -- 멘토링 기록: 6개월에 걸쳐 8건씩
  for r in select id, mentor_id from matchings where mentor_id = sc_mentor or partner_id = sc_partner loop
    for k in 1..8 loop
      insert into mentoring_logs (matching_id, held_at, duration_min, content, created_by, next_steps, prayer_topics, shared)
      values (r.id, now() - ((k - 1) * 21 + 3 + random() * 6) * interval '1 day', (array[45,60,60,90,60])[1 + (k % 5)],
              log_content[1 + ((k + 2) % 10)], r.mentor_id, log_next[1 + (k % 8)], case when k % 3 <> 0 then log_pray[1 + (k % 7)] end, k % 4 <> 0);
    end loop;
  end loop;

  -- 대표 선교사의 자립 리포트 6개월 (매출과 자립도가 오르는 모습)
  for k in 0..5 loop
    insert into self_reports (partner_id, month, revenue_amount, currency, self_reliance, difficulties, prayer_topics)
    values (sc_partner, date_trunc('month', now() - k * interval '1 month')::date, round((2400000 - k * 330000)::numeric, -3), 'KRW',
            (array[4,4,3,3,2,2])[k + 1], difficulties[1 + (k % 6)], log_pray[1 + (k % 7)]);
  end loop;

  -- 감사 편지: 대표 선교사 → 대표 사업가 5통, 다른 선교사들 → 대표 사업가 3통 (일부는 안 읽음)
  for k in 1..5 loop
    insert into thanks_letters (sender_id, recipient_id, body, read_at, created_at)
    values (sc_partner, sc_mentor, thanks_body[1 + (k % 6)], case when k <= 2 then null else now() - k * interval '3 days' end, now() - (array[3, 12, 40, 75, 120])[k] * interval '1 day');
  end loop;
  for k in 1..3 loop
    insert into thanks_letters (sender_id, recipient_id, body, read_at, created_at)
    values (partner_ids[(array[20, 24, 28])[k]], sc_mentor, thanks_body[1 + ((k + 2) % 6)], case when k = 1 then null else now() - interval '5 days' end, now() - (k * 9) * interval '1 day');
  end loop;

  -- 리퍼럴: 대표 사업가가 6건 받고 5건 보냄
  for k in 1..6 loop
    insert into referrals (giver_id, receiver_id, client_name, client_contact, note, status, created_at)
    values (mentor_ids[(array[3, 9, 14, 20, 26, 33])[k]], sc_mentor, clients[1 + (k % 10)], '010-' || lpad((4100 + k * 13)::text, 4, '0') || '-' || lpad((6100 + k * 31)::text, 4, '0'),
            '꼭 한번 만나 보시길 권합니다.', (array['sent','sent','contacted','contacted','closed','closed'])[k]::referral_status, now() - (k * 26) * interval '1 day');
  end loop;
  for k in 1..5 loop
    insert into referrals (giver_id, receiver_id, client_name, note, status, created_at)
    values (sc_mentor, mentor_ids[(array[5, 11, 17, 23, 30])[k]], clients[1 + ((k + 4) % 10)], '도움이 필요하다고 하셔서 소개합니다.', (array['sent','contacted','closed','closed','sent'])[k]::referral_status, now() - (k * 31) * interval '1 day');
  end loop;

  -- 출석: 대표 3명은 지난 모임의 대부분에 참석
  insert into attendance (event_id, member_id, attended_at)
  select e.id, m.id, e.start_at + interval '2 minutes'
  from events e join members m on m.email in ('demo.showcase.mentor@demo.wmto.invalid','demo.showcase.partner@demo.wmto.invalid','demo.showcase.sponsor@demo.wmto.invalid')
  where e.title like '[데모]%' and e.start_at < now() and random() < 0.85
  on conflict do nothing;

  -- 대표 후원자: 정기 후원 6개월, 선교사 1:1 후원 3명, 캠프 장학금, 순환 기금
  for k in 0..5 loop
    insert into donations (sponsor_id, kind, amount, donated_at) values (sc_sponsor, 'monthly', 50000, current_date - (k * 30 + 2));
  end loop;
  insert into donations (sponsor_id, kind, partner_id, amount, donated_at) values
    (sc_sponsor, 'one_to_one', sc_partner, 2000000, current_date - 60),
    (sc_sponsor, 'one_to_one', partner_ids[25], 1800000, current_date - 40),
    (sc_sponsor, 'one_to_one', partner_ids[30], 1500000, current_date - 25);
  insert into donations (sponsor_id, kind, amount, donated_at) values
    (sc_sponsor, 'camp', 500000, current_date - 30), (sc_sponsor, 'fund', 1000000, current_date - 80);

  -- ───────── 텐트별 정기 모임과 공지·후기 ─────────
  for r in select id, name, region_key from chapters where name like '[데모]%' order by name loop
    for k in 1..4 loop
      insert into events (type, title, start_at, end_at, location, chapter_id, meeting_provider, meeting_url)
      values ('offline', r.name || ' 정기 모임 #' || (5 - k),
              (current_date - k * 28 + (k % 5))::timestamptz + interval '19 hours', (current_date - k * 28 + (k % 5))::timestamptz + interval '21 hours',
              case when r.region_key like 'DEMO:KR:%' then replace(r.name, '[데모] ', '') || ' 모임 장소' else '온라인' end, r.id,
              case when r.region_key like 'DEMO:KR:%' then null else 'zoom'::meeting_provider end,
              case when r.region_key like 'DEMO:KR:%' then null else 'https://zoom.us/j/demo-tent-' || substr(r.id::text, 1, 6) || k end);
    end loop;
    for k in 0..1 loop
      insert into events (type, title, start_at, end_at, location, chapter_id, meeting_provider, meeting_url)
      values ('offline', r.name || ' 정기 모임 #' || (5 + k),
              (current_date + k * 28 + 6 + (k % 3))::timestamptz + interval '19 hours', (current_date + k * 28 + 6 + (k % 3))::timestamptz + interval '21 hours',
              case when r.region_key like 'DEMO:KR:%' then replace(r.name, '[데모] ', '') || ' 모임 장소' else '온라인' end, r.id,
              case when r.region_key like 'DEMO:KR:%' then null else 'zoom'::meeting_provider end,
              case when r.region_key like 'DEMO:KR:%' then null else 'https://zoom.us/j/demo-tent-next-' || substr(r.id::text, 1, 6) || k end);
    end loop;
    insert into tent_posts (chapter_id, author_id, kind, title, body, created_at)
    select r.id, a.id, p.kind, p.title, p.body, now() - p.ago
    from (select id from members where role = 'mentor' and chapter_id = r.id order by created_at limit 1) a,
         (values ('notice', '이번 달 모임 안내', '이번 달 모임에서는 선교사 두 분의 자립 리포트를 함께 보고, 필요한 도움을 나누겠습니다. 간단한 저녁을 준비합니다. 편하게 오세요.', interval '6 days'),
                 ('recap', '지난 모임 후기', '로스팅 카페를 준비하는 선교사님의 이야기를 들었습니다. 사업가 세 분이 가격 계산과 거래처 소개를 돕겠다고 손을 들어 주셨습니다. 이번 달에 각자 한 가지씩 실천하기로 했습니다.', interval '24 days'),
                 ('notice', '새로 오신 분들을 환영합니다', '이번 달에 새 사업가와 선교사가 함께하게 되었습니다. 인사하고 서로의 이야기를 들어 주세요.', interval '45 days')) p(kind, title, body, ago);
    -- 지난 정기 모임의 출석: 텐트 구성원의 대부분이 참석
    insert into attendance (event_id, member_id, attended_at)
    select e.id, m.id, e.start_at + interval '5 minutes'
    from events e join members m on m.chapter_id = r.id and m.status = 'active'
    where e.chapter_id = r.id and e.start_at < now() and random() < 0.72
    on conflict do nothing;
  end loop;

  -- ───────── 증명사진 (일부 회원만. 나머지는 이름 첫 글자 아바타) ─────────
  update members set photo_url = '/people/p01.jpg' where id = sc_mentor;
  update members set photo_url = '/people/p02.jpg' where id = sc_partner;
  update members set photo_url = '/people/p03.jpg' where id = sc_sponsor;
  with fem as (
    select id, row_number() over (order by role, email) rn from members
    where email like 'demo.%@demo.wmto.invalid' and email not like 'demo.showcase%' and email not like 'demo.apply%' and status = 'active'
      and right(name, 2) = any (array['서연','하은','수빈','지우','채원','소영','은지','유진','미래','나연','혜진','다은','가영','보람','지은','민서','세린','은서','하린','소희'])
  ) update members m set photo_url = '/people/' || (array['p05','p07','p09','p11'])[fem.rn] || '.jpg' from fem where m.id = fem.id and fem.rn <= 4;
  with mal as (
    select id, row_number() over (order by role, email) rn from members
    where email like 'demo.%@demo.wmto.invalid' and email not like 'demo.showcase%' and email not like 'demo.apply%' and status = 'active'
      and right(name, 2) <> all (array['서연','하은','수빈','지우','채원','소영','은지','유진','미래','나연','혜진','다은','가영','보람','지은','민서','세린','은서','하린','소희'])
  ) update members m set photo_url = '/people/' || (array['p04','p06','p08','p10','p12'])[mal.rn] || '.jpg' from mal where m.id = mal.id and mal.rn <= 5;

  -- ───────── 실제로 로그인할 수 있는 회원의 화면도 채우기 ─────────
  for r in select m.id, m.role from members m
           where m.auth_user_id is not null and m.status = 'active' and m.email not like '%@demo.wmto.invalid' and m.role in ('mentor','partner') loop
    if r.role = 'mentor' then
      update mentor_profiles set contribution_types = '{skill,coach}' where member_id = r.id and coalesce(array_length(contribution_types, 1), 0) = 0;
      -- 담당 선교사 3명
      for j in select * from unnest(array[20, 24, 28]) loop
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
      for j in select * from unnest(array[61, 50]) loop
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

-- ═════════════════════════════════════════════════════════════════════════
-- CBC 데모 보강 (사업가 전용 화면용): 선교 권한 없음, 서울 1텐트 40명(업종 모두 다름), 프로필 상세·공개 설정,
-- 활동(모임 출석·소개·감사·1:1·손님·배움), 1:1 사진, 동역 소그룹, 추천사.
-- 마이그레이션 0036 까지 적용된 데이터베이스에서 실행하세요. 대표 사업가(김은혜)의 텐트를 대상으로 합니다.
-- ═════════════════════════════════════════════════════════════════════════
do $cbc$
declare
  sc uuid; ch uuid; chname text;
  cats int[] := array[101,102,104,106,108,109,110,111,113,115,116,118,122,126,129,130,133,134,136,138,141,142,146,150,152,155,157,158,161,170,171];
  old_cats int[] := array[145,121,144,119,139,147,149,143];
  sur text[] := array['김','이','박','최','정','강','조','윤','장','임','한','오','서','신','권','황','안','송','류','홍'];
  giv text[] := array['민준','서연','지훈','하은','도윤','수빈','예준','지우','현우','채원','주원','소영','태양','은지','성민','유진','동현','미래','재현','나연','승우','혜진','준서','다은','시우','가영','건우','보람','영호','지은','상훈','민서','진우','세린','태호','은서','용준','하린','기범','소희'];
  prefixes text[] := array['온유','새벽','소망','감람','다윗','은혜','푸른','나눔','믿음','샘물'];
  dists text[] := array['강남구','서초구','마포구','송파구','강서구','영등포구','성북구','강동구'];
  churches text[] := array['소망교회','푸른숲교회'];
  clients text[] := array['동네 카페 사장님','이웃 교회 장로님','거래처 대표님','같은 상가 미용실 원장님','지인의 온라인 쇼핑몰','학부모 모임 대표','식자재 납품 업체','신규 개업 한식당','사진 촬영이 필요한 스타트업','홈페이지가 필요한 병원'];
  notes text[] := array['가격 협의가 가능하다고 전해 두었습니다.','꼭 한번 만나 보시길 권합니다.','도움이 필요하다고 하셔서 소개합니다.','먼저 전화 드려 보시면 좋겠습니다.'];
  learned text[] := array['월별 매출과 지출을 기록하는 간단한 장부 양식을 함께 만들었습니다.','다음 달 재료 구매 계획과 거래처 협상 방법을 정리했습니다.','할인 행사의 효과를 숫자로 확인하고 다음 행사를 계획했습니다.','SNS에 올릴 첫 게시물의 사진과 문구를 같이 다듬었습니다.'];
  nexts text[] := array['가격표를 새로 만들어 이번 주 안에 공유하기','지출 장부를 매일 5분씩 기록하기','단골 손님 3명에게 후기를 부탁하기','거래처 두 곳에 견적 요청하기'];
  thanks text[] := array['좋은 고객을 소개해 주셔서 감사합니다. 덕분에 이번 달 매출이 늘었습니다.','소개해 주신 덕분에 좋은 거래처를 만났습니다. 감사합니다.','꼼꼼하게 챙겨 주셔서 감사합니다.'];
  faiths text[] := array['일터에서 먼저 섬기는 사람이 되기를 기도합니다.','정직한 일터가 가장 좋은 전도라고 믿습니다.','받은 은혜를 이웃과 나누는 사업을 꿈꿉니다.'];
  streets jsonb := '{"강남구":"테헤란로","서초구":"서초대로","마포구":"월드컵북로","송파구":"올림픽로","강서구":"공항대로","영등포구":"영등포로","성북구":"동소문로"}'::jsonb;
  cnames text[] := array['새벽 기도 모임','식음료·서비스 사업 나눔방','전문직 지식 나눔','온라인·마케팅 스터디','독서 모임','건강·운동 모임'];
  cpurposes text[] := array['매주 화요일 새벽에 서로의 일터와 가정을 위해 기도합니다.','식당, 카페, 제과제빵 등 서비스 사업의 운영 노하우를 나눕니다.','법률, 세무, 의료 등 전문 지식을 서로의 사업에 나눕니다.','온라인 판매와 마케팅을 함께 공부하고 적용해 봅니다.','한 달에 한 권, 사업과 신앙에 도움이 되는 책을 함께 읽습니다.','함께 걷고 운동하며 건강한 일터를 만들어 갑니다.'];
  cposts text[] := array['이번 주 기도 제목을 나눕니다. 각자 일터에서 만나는 한 사람을 위해 기도해 주세요.','다음 모임은 이번 주 목요일 저녁입니다. 간단한 다과를 준비하겠습니다.','이번 달 매출이 처음으로 목표를 넘었습니다. 함께 기도해 주셔서 감사합니다.','신메뉴를 준비하고 있습니다. 시식해 주실 분을 찾습니다.','세금 신고 시즌입니다. 궁금한 점을 이곳에 남겨 주시면 함께 답을 찾아보겠습니다.','이번 달 읽을 책은 정직한 경영에 관한 책입니다. 함께 읽고 나눠요.','온라인 광고 성과를 비교한 자료를 공유합니다. 필요하신 분은 말씀해 주세요.','이번 주말 아침 산책을 함께합니다. 가볍게 오세요.','새로 오신 분들을 소그룹에서 환영합니다. 편하게 질문해 주세요.','이번 달 소개 목표는 한 분씩입니다. 서로의 고객을 떠올려 봐요.','고객 응대 때 도움이 된 한마디를 나눕니다. 여러분의 경험을 들려주세요.','지난 모임에서 나눈 내용을 정리해 올립니다. 빠진 부분은 댓글로 알려 주세요.'];
  tb text[] := array['약속을 정말 잘 지키시는 분입니다. 소개해 드린 고객도 만족해서 다시 찾고 있습니다.','일에 대한 정직함과 꼼꼼함이 인상적입니다. 믿고 소개할 수 있는 사업가입니다.','1:1 만남에서 제 사업의 방향을 함께 고민해 주셔서 큰 도움이 되었습니다.','어려운 시기에 먼저 연락해 주고 기도해 준 고마운 분입니다.','고객을 대하는 태도가 따뜻해서 소개받은 분들이 모두 좋은 평가를 남겼습니다.','모임에서 늘 새로운 아이디어를 나눠 주셔서 배우는 것이 많습니다.','품질에 대한 고집이 있으면서도 가격 이야기는 합리적으로 해 주셔서 안심하고 맡길 수 있습니다.','새로 온 회원들을 먼저 챙기고 환영해 주는 따뜻한 분입니다.','소개를 받으면 빠르게 연락하고 결과를 꼭 알려 주십니다. 그래서 다음 소개가 자연스럽게 이어집니다.','신앙과 일터를 따로 두지 않고 살아가는 모습에 많은 도전을 받습니다.'];
  ids uuid[]; oth uuid[]; n int; no int; i int; j int; k int; g int; mid uuid; cname text; nm text; a uuid; b uuid; ev uuid; rid uuid; cid uuid; cids uuid[] := '{}';
  members_in uuid[]; vids uuid[]; cat_i int; other_chs uuid[]; oc int := 0; rk text;
begin
  select id, chapter_id into sc, ch from members where email = 'demo.showcase.mentor@demo.wmto.invalid';
  if sc is null or ch is null then raise notice 'CBC 보강: 대표 사업가의 텐트가 없어 건너뜁니다.'; return; end if;
  -- 같은 지역에 텐트가 하나뿐이면 텐트 플랜팅으로 두 곳을 더 세웁니다(남는 기존 회원을 옮겨 이 텐트를 40명 안팎으로 맞추기 위해).
  select region_key into rk from chapters where id = ch;
  if rk is not null and (select count(*) from chapters where region_key = rk) < 2 then
    perform plant_tent(rk);
    perform plant_tent(rk);
  end if;
  select name into chname from chapters where id = ch;

  -- 1) 선교 권한 없음(사업가 전용 화면) · 선교 성격의 데모 일정 삭제 · 텐트 공지를 사업가 내용으로
  update members set mission_status = 'none' where role = 'mentor' and email like '%@demo.wmto.invalid';
  delete from events where title like '[데모]%' and (title like '%선교사 기도 모임%' or title like '%훈련 캠프%');
  update tent_posts set body = case title
    when '새로 오신 분들을 환영합니다' then '이번 달에 새 사업가 두 분이 텐트에 함께하게 되었습니다. 인사하고 서로의 일을 들어 주세요.'
    when '이번 달 모임 안내' then '이번 달 모임에서는 각자 소개하고 싶은 분을 한 분씩 준비해 오세요. 간단한 저녁을 준비합니다. 편하게 오세요.'
    when '지난 모임 후기' then '지난 모임에서 사업가 세 분이 서로의 일을 소개했고, 새로운 고객 연결이 여러 건 이루어졌습니다. 이번 달에 각자 한 가지씩 실천하기로 했습니다.'
    else body end
   where title in ('새로 오신 분들을 환영합니다','이번 달 모임 안내','지난 모임 후기');

  alter table members disable trigger members_assign_tent;

  -- 2) 기존 사업가의 업종을 서로 다르게(대표는 카페·커피)
  update mentor_profiles set category_id = 103, industry = '카페·커피', business_name = '온유 카페' where member_id = sc;
  i := 0;
  for mid in select m.id from members m join mentor_profiles p on p.member_id = m.id
              where m.chapter_id = ch and m.role = 'mentor' and m.status = 'active' and m.id <> sc and p.category_id is null order by m.name loop
    i := i + 1;
    exit when i > array_length(old_cats, 1);
    select name_ko into cname from industry_categories where id = old_cats[i];
    update mentor_profiles set category_id = old_cats[i], industry = cname, business_name = prefixes[1 + i % 10] || ' ' || cname where member_id = mid;
  end loop;

  -- 업종이 정해지지 않은 나머지 기존 회원은 같은 지역의 다른 데모 텐트로 옮겨, 이 텐트를 40명 안팎으로 맞춥니다.
  select array_agg(id order by name) into other_chs from chapters where id <> ch and name like '[데모]%' and region_key like 'DEMO:KR:서울%';
  if other_chs is not null then
    for mid in select m.id from members m join mentor_profiles p on p.member_id = m.id
                where m.chapter_id = ch and m.role = 'mentor' and m.status = 'active' and m.id <> sc and p.category_id is null loop
      oc := oc + 1;
      update members m set chapter_id = other_chs[1 + oc % array_length(other_chs, 1)],
        chapter = (select name from chapters where id = other_chs[1 + oc % array_length(other_chs, 1)]) where m.id = mid;
    end loop;
  end if;

  -- 3) 새 사업가 31명(업종 모두 다름) → 텐트 약 40명
  for i in 1..31 loop
    select name_ko into cname from industry_categories where id = cats[i];
    continue when exists (select 1 from members m join mentor_profiles p on p.member_id = m.id where m.chapter_id = ch and m.status = 'active' and p.category_id = cats[i]);
    j := (i * 11 + 7) % 40;
    loop
      nm := sur[1 + ((i * 7 + 3) % 20)] || giv[1 + (j % 40)];
      exit when not exists (select 1 from members where name = nm);
      j := j + 1;
    end loop;
    insert into members (role, name, email, phone, country, region, district, chapter, chapter_id, status, created_at, term_end, mission_status)
    values ('mentor', nm, 'demo.tent40.' || lpad(i::text, 2, '0') || '@demo.wmto.invalid', '010-' || lpad((3000 + i * 41)::text, 4, '0') || '-' || lpad((4000 + i * 59)::text, 4, '0'),
            '대한민국', '서울', dists[1 + (i % 8)], chname, ch, 'active', now() - (25 + (i * 13) % 330) * interval '1 day', current_date + (45 + (i * 29) % 300), 'none')
    returning id into mid;
    insert into mentor_profiles (member_id, business_name, industry, category_id, church, stage)
    values (mid, prefixes[1 + (i % 10)] || ' ' || cname, cname, cats[i], churches[1 + (i % 2)], (array['seed','sower','harvester'])[1 + (i % 3)]::mentor_stage);
  end loop;

  select array_agg(id order by name) into ids from members where chapter_id = ch and role = 'mentor' and status = 'active';
  select coalesce(array_agg(x), '{}') into oth from unnest(ids) x where x <> sc;
  n := array_length(ids, 1); no := array_length(oth, 1);

  -- 4) 프로필 상세(사업장 주소·전화·웹사이트·소개·키워드·교회 등)와 공개 설정
  for i in 1..n loop
    update mentor_profiles p set
      business_address = '서울특별시 ' || coalesce(m.district, '강남구') || ' ' || coalesce(streets ->> coalesce(m.district, '강남구'), '천호대로') || ' ' || (20 + (i * 17) % 380),
      business_phone = '02-' || (500 + (i * 37) % 400) || '-' || lpad((1000 + (i * 211) % 9000)::text, 4, '0'),
      website = 'https://biz' || i || '.example.com',
      intro = coalesce(p.industry, '사업') || ' 분야에서 정직과 신뢰로 고객을 섬깁니다.',
      keywords = coalesce(p.industry, '사업') || ', 신뢰, 소개',
      years_in_business = 3 + (i * 7) % 25,
      church = churches[1 + i % 2], faith_story = faiths[1 + i % 3],
      share = jsonb_build_object('business_address', true, 'business_phone', true, 'website', true,
        'phone', (abs(hashtext(p.member_id::text)) % 10) < 8, 'email', (abs(hashtext(p.member_id::text || 'e')) % 10) < 5,
        'church', (abs(hashtext(p.member_id::text || 'c')) % 10) < 7, 'faith_story', (abs(hashtext(p.member_id::text || 'f')) % 10) < 6)
    from members m where p.member_id = ids[i] and m.id = ids[i];
  end loop;
  update mentor_profiles set intro = '서울에서 10년째 카페를 운영하며, 정직한 한 잔과 따뜻한 공간으로 이웃과 함께합니다.', keywords = '커피, 로스팅, 카페, 단체 주문',
    years_in_business = 10, website = 'https://onyu-cafe.example.com', faith_story = '일터에서 먼저 섬기는 사람이 되기를 기도합니다.', church = '소망교회' where member_id = sc;
  update members set photo_url = '/people/p01.jpg' where id = sc;

  -- 5) 정기 모임: 지난 12주 + 앞으로 4주
  for k in -12..4 loop
    if not exists (select 1 from events where chapter_id = ch and start_at::date = (current_date + k * 7)) then
      insert into events (type, title, start_at, end_at, location, chapter_id)
      values ('offline', chname || ' 정기 모임 #' || (20 + k), (current_date + k * 7)::timestamptz + interval '7 hours', (current_date + k * 7)::timestamptz + interval '9 hours', '서울 강남 모임 장소', ch);
    end if;
  end loop;

  -- 출석(대표 제외, 회원마다 다른 확률) / 소개 140 / 감사 / 1:1 70 / 손님 10 / 배움 60
  for ev in select id from events where chapter_id = ch and start_at < now() and start_at > now() - interval '120 days' loop
    for i in 1..no loop
      if random() < 0.55 + 0.4 * ((i * 37) % 100) / 100.0 then
        insert into attendance (event_id, member_id, attended_at) select ev, oth[i], start_at from events where id = ev on conflict do nothing;
      end if;
    end loop;
  end loop;
  for k in 1..140 loop
    a := oth[1 + floor(random() * no)::int]; b := oth[1 + floor(random() * no)::int];
    if a <> b then
      insert into referrals (giver_id, receiver_id, client_name, note, status, created_at)
      values (a, b, clients[1 + (k % 10)], notes[1 + (k % 4)], (array['sent','contacted','won','won','contacted','closed','won','no_deal'])[1 + (k % 8)]::referral_status, now() - (random() * 150) * interval '1 day');
    end if;
  end loop;
  for rid in select id from referrals where status = 'won' and giver_id = any (oth) and receiver_id = any (oth) and not exists (select 1 from gratitude g where g.referral_id = referrals.id) order by random() limit 30 loop
    insert into gratitude (referral_id, from_member, to_member, message, created_at)
    select rid, receiver_id, giver_id, thanks[1 + floor(random() * 3)::int], created_at + interval '5 days' from referrals where id = rid;
  end loop;
  for k in 1..70 loop
    a := oth[1 + floor(random() * no)::int]; b := oth[1 + floor(random() * no)::int];
    if a <> b then
      insert into one_to_ones (member_a, member_b, held_at, place, duration_min, learned, can_help, next_step, status, confirmed_at, consent_a, consent_b)
      values (a, b, now() - (random() * 140) * interval '1 day', (array['온라인','서울 강남 모임 장소'])[1 + (k % 2)], 30 + (k % 4) * 15,
        learned[1 + (k % 4)], learned[1 + ((k + 1) % 4)], nexts[1 + (k % 4)], 'confirmed', now() - (random() * 130) * interval '1 day', false, false);
    end if;
  end loop;
  for k in 1..10 loop
    insert into visitors (chapter_id, invited_by, name, status, attended_at, kind, created_at)
    values (ch, oth[1 + (k * 5) % no], sur[1 + (k * 3) % 20] || giv[1 + (k * 7 + 11) % 40], (array['attended','joined','attended','invited'])[1 + (k % 4)],
            case when k % 4 = 0 then null else now() - (k * 9) * interval '1 day' end, 'guest', now() - (k * 9 + 5) * interval '1 day');
  end loop;
  for k in 1..60 loop
    insert into learning_logs (member_id, kind, qty, held_on) values (oth[1 + floor(random() * no)::int], (array['scripture','discipleship','business','book','other'])[1 + (k % 5)], 1 + (k % 3), current_date - (k * 2) % 80);
  end loop;
  select array_agg(id) into vids from academy_videos where title !~ '선교|멘토|후원';
  if vids is not null then
    for k in 1..70 loop
      insert into academy_completions (member_id, video_id, completed_at)
      values (oth[1 + (k * 7) % no], vids[1 + (k % array_length(vids, 1))], now() - ((k * 3) % 85) * interval '1 day') on conflict do nothing;
    end loop;
  end if;
  insert into tent_posts (chapter_id, author_id, kind, title, body, created_at) values
    (ch, oth[1], 'notice', '이번 주 모임 안내', '이번 주 목요일 아침 7시에 모입니다. 각자 소개하고 싶은 분을 한 분씩 떠올려 오세요. 간단한 아침을 준비합니다.', now() - interval '1 day'),
    (ch, oth[2], 'recap', '지난 모임 후기', '지난주에는 열두 분이 모여 서로의 일을 나눴고, 새로운 고객 연결이 다섯 건 이루어졌습니다. 감사한 한 주였습니다.', now() - interval '6 days'),
    (ch, oth[3], 'notice', '손님을 초대해 주세요', '다음 달 모임에 손님을 초대해 주세요. 초대한 분의 참석은 텐트장이 확인합니다.', now() - interval '9 days');

  -- 6) 대표 사업가(김은혜)의 최근 90일 활동: 포인트 70점대(천막 단계), 등불까지 조금 남게
  for ev in select id from events where chapter_id = ch and start_at < now() and start_at > now() - interval '90 days' order by start_at offset 3 loop
    insert into attendance (event_id, member_id, attended_at) select ev, sc, start_at from events where id = ev on conflict do nothing;
  end loop;
  for k in 1..6 loop
    insert into referrals (giver_id, receiver_id, client_name, note, status, created_at)
    values (sc, oth[1 + (k - 1) % no], clients[k], '꼭 한번 만나 보시길 권합니다.', (array['sent','contacted','won','won','contacted','closed','won','sent','contacted'])[k]::referral_status, now() - (k * 8) * interval '1 day');
  end loop;
  for k in 1..4 loop
    insert into referrals (giver_id, receiver_id, client_name, note, status, created_at)
    values (oth[k], sc, clients[1 + k], notes[k], (array['won','sent','contacted','won'])[k]::referral_status, now() - (k * 13) * interval '1 day');
  end loop;
  insert into gratitude (referral_id, from_member, to_member, message, created_at)
  select id, sc, giver_id, '좋은 고객을 소개해 주셔서 감사합니다. 덕분에 이번 달 매출이 늘었습니다.', created_at + interval '5 days' from referrals where receiver_id = sc and status = 'won' order by created_at desc limit 1;
  for k in 1..5 loop
    insert into one_to_ones (member_a, member_b, held_at, place, duration_min, learned, can_help, next_step, status, confirmed_at, consent_a, consent_b)
    values (sc, oth[1 + (k * 3) % no], now() - (k * 14) * interval '1 day', '온라인', 40, learned[1 + k % 4], learned[1 + (k + 1) % 4], nexts[1 + k % 4], 'confirmed', now() - (k * 14 - 1) * interval '1 day', false, false);
  end loop;
  insert into visitors (chapter_id, invited_by, name, status, attended_at, kind, created_at) values (ch, sc, '조민서', 'attended', now() - interval '20 days', 'guest', now() - interval '30 days');
  insert into learning_logs (member_id, kind, qty, held_on) values (sc, 'business', 2, current_date - 12), (sc, 'scripture', 1, current_date - 30);

  -- 7) 1:1 사진(정적 파일 /demo/one-to-one/1~4.jpg)과 사진 공개 동의
  update one_to_ones o set proof_path = '/demo/one-to-one/' || (1 + (abs(hashtext(o.id::text)) % 4)) || '.jpg', consent_a = true, consent_b = true
   where o.status = 'confirmed' and o.proof_path is null
     and exists (select 1 from members m where m.id = o.member_a and m.email like '%@demo.wmto.invalid')
     and exists (select 1 from members m where m.id = o.member_b and m.email like '%@demo.wmto.invalid');

  -- 8) 동역 소그룹 6개(업종에 맞춰 배정)와 글
  delete from circles where chapter_id = ch;
  for g in 1..6 loop
    insert into circles (chapter_id, name, purpose, created_by, created_at) values (ch, cnames[g], cpurposes[g], sc, now() - (60 + g * 7) * interval '1 day') returning id into cid;
    cids := cids || cid;
  end loop;
  k := 0;
  for i in 1..n loop
    select coalesce(category_id, 0) into cat_i from mentor_profiles where member_id = ids[i];
    if cat_i in (101,102,103,104,106,108,152) then g := 2;
    elsif cat_i in (109,110,111,113,115,116,119,121,122,126,130,120,125,159) then g := 3;
    elsif cat_i in (142,143,144,146,147,149,148) then g := 4;
    else k := k + 1; g := (array[1,5,6])[1 + k % 3]; end if;
    insert into circle_members (circle_id, member_id, joined_at) values (cids[g], ids[i], now() - (20 + i) * interval '1 day') on conflict do nothing;
  end loop;
  k := 0;
  for g in 1..6 loop
    select array_agg(member_id) into members_in from circle_members where circle_id = cids[g];
    continue when members_in is null;
    for i in 1..4 loop
      k := k + 1;
      insert into circle_posts (circle_id, author_id, body, created_at)
      values (cids[g], members_in[1 + (i * 3 + g) % array_length(members_in, 1)], cposts[1 + (k * 5) % 12], now() - (i * 4 + g) * interval '1 day');
    end loop;
  end loop;

  -- 9) 추천사: 회원마다 1건 이상, 대표는 받은 6건(대기 2건) + 쓴 3건
  delete from testimonials where author_id = any (ids) or subject_id = any (ids);
  for i in 1..n loop
    a := ids[1 + (i * 7 + 3) % n];
    if a = ids[i] then a := ids[1 + (i + 1) % n]; end if;
    insert into testimonials (author_id, subject_id, body, status, created_at, decided_at)
    values (a, ids[i], tb[1 + (i * 3) % 10], case when i % 9 = 0 then 'pending' else 'published' end, now() - (i * 3 % 120) * interval '1 day', case when i % 9 = 0 then null else now() - (i * 3 % 110) * interval '1 day' end)
    on conflict do nothing;
  end loop;
  for i in 1..30 loop
    a := ids[1 + (i * 11 + 5) % n]; b := ids[1 + (i * 13 + 2) % n];
    if a <> b then
      insert into testimonials (author_id, subject_id, body, status, created_at, decided_at)
      values (a, b, tb[1 + (i * 7) % 10], 'published', now() - (i * 4 % 150) * interval '1 day', now() - (i * 4 % 140) * interval '1 day') on conflict do nothing;
    end if;
  end loop;
  for i in 1..6 loop
    a := ids[1 + (i * 5 + 8) % n];
    if a <> sc then
      insert into testimonials (author_id, subject_id, body, status, created_at, decided_at)
      values (a, sc, tb[1 + (i * 2) % 10], case when i > 4 then 'pending' else 'published' end, now() - (i * 6) * interval '1 day', case when i > 4 then null else now() - (i * 5) * interval '1 day' end) on conflict do nothing;
    end if;
  end loop;
  for i in 1..3 loop
    b := ids[1 + (i * 9 + 4) % n];
    if b <> sc then
      insert into testimonials (author_id, subject_id, body, status, created_at, decided_at)
      values (sc, b, tb[1 + (i * 3 + 1) % 10], 'published', now() - (i * 12) * interval '1 day', now() - (i * 11) * interval '1 day') on conflict do nothing;
    end if;
  end loop;

  alter table members enable trigger members_assign_tent;
end
$cbc$;

-- 결과 확인
select
  (select count(*) from members where email like '%@demo.wmto.invalid' and role = 'mentor' and status = 'active')  as mentors,
  (select count(*) from members where email like '%@demo.wmto.invalid' and role = 'partner' and status = 'active') as partners,
  (select count(*) from matchings)        as matchings,
  (select count(*) from mentoring_logs)   as mentoring_logs,
  (select count(*) from referrals)        as referrals,
  (select count(*) from thanks_letters)   as thanks_letters,
  (select count(*) from events where title like '[데모]%') as events,
  (select count(*) from attendance)       as attendance,
  (select count(*) from donations)        as donations,
  (select count(*) from fund_loans)       as fund_loans;
