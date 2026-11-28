-- 회원이 항목별로 "같은 텐트에 공개"를 고릅니다. 키가 없으면 사업장 정보(주소·전화·웹사이트)는 공개, 개인 연락처·교회·신앙 이야기는 비공개가 기본입니다.
set search_path = wmto;

alter table mentor_profiles add column if not exists share jsonb not null default '{}'::jsonb;
update mentor_profiles set share = jsonb_build_object('phone', share_contact, 'email', share_contact) where share = '{}'::jsonb and share_contact;
grant update (share) on mentor_profiles to authenticated;

create or replace function tent_member_card(p_member uuid) returns jsonb
language plpgsql stable security definer set search_path = wmto as $$
declare
  me uuid := current_member_id(); t members; p mentor_profiles; cat text; self boolean;
  met int; last_met timestamptz; rs int; rr int;
begin
  if me is null then raise exception 'forbidden'; end if;
  select * into t from members where id = p_member and role = 'mentor' and status = 'active';
  if not found then raise exception 'not found'; end if;
  if t.id <> me and not exists (select 1 from members a where a.id = me and a.chapter_id is not null and a.chapter_id = t.chapter_id) then
    raise exception 'forbidden';
  end if;
  select * into p from mentor_profiles where member_id = t.id;
  select c.name_ko into cat from industry_categories c where c.id = p.category_id;
  self := t.id = me;
  select count(*), max(held_at) into met, last_met from one_to_ones
   where status = 'confirmed' and ((member_a = me and member_b = t.id) or (member_a = t.id and member_b = me));
  select count(*) into rs from referrals where giver_id = me and receiver_id = t.id;
  select count(*) into rr from referrals where giver_id = t.id and receiver_id = me;
  return jsonb_build_object(
    'id', t.id, 'name', t.name, 'photo_url', t.photo_url, 'chapter', t.chapter, 'joined_at', t.created_at, 'is_me', self,
    'business_name', p.business_name, 'industry', coalesce(cat, p.industry), 'intro', p.intro, 'keywords', p.keywords, 'years', p.years_in_business,
    'website', case when self or coalesce((p.share->>'website')::boolean, true) then p.website end,
    'business_address', case when self or coalesce((p.share->>'business_address')::boolean, true) then p.business_address end,
    'business_phone', case when self or coalesce((p.share->>'business_phone')::boolean, true) then p.business_phone end,
    'church', case when self or coalesce((p.share->>'church')::boolean, false) then p.church end,
    'faith_story', case when self or coalesce((p.share->>'faith_story')::boolean, false) then p.faith_story end,
    'phone', case when self or coalesce((p.share->>'phone')::boolean, false) then t.phone end,
    'email', case when self or coalesce((p.share->>'email')::boolean, false) then t.email end,
    'contact_shared', self or coalesce((p.share->>'phone')::boolean, false) or coalesce((p.share->>'email')::boolean, false),
    'met', met, 'last_met', last_met, 'ref_sent', rs, 'ref_received', rr);
end $$;
