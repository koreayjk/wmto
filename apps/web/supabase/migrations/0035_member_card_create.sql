-- 같은 텐트 회원 상세 카드: 사업장 주소·전화(공개 정보), 휴대전화·이메일은 본인이 공개한 경우에만.
set search_path = wmto;

alter table mentor_profiles add column if not exists business_address text;
alter table mentor_profiles add column if not exists business_phone text;
alter table mentor_profiles add column if not exists share_contact boolean not null default false;

create or replace function tent_member_card(p_member uuid) returns jsonb
language plpgsql stable security definer set search_path = wmto as $$
declare
  me uuid := current_member_id(); t members; p mentor_profiles; cat text; share boolean;
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
  share := t.id = me or coalesce(p.share_contact, false);
  select count(*), max(held_at) into met, last_met from one_to_ones
   where status = 'confirmed' and ((member_a = me and member_b = t.id) or (member_a = t.id and member_b = me));
  select count(*) into rs from referrals where giver_id = me and receiver_id = t.id;
  select count(*) into rr from referrals where giver_id = t.id and receiver_id = me;
  return jsonb_build_object(
    'id', t.id, 'name', t.name, 'photo_url', t.photo_url, 'chapter', t.chapter, 'joined_at', t.created_at, 'is_me', t.id = me,
    'business_name', p.business_name, 'industry', coalesce(cat, p.industry), 'intro', p.intro, 'keywords', p.keywords,
    'years', p.years_in_business, 'website', p.website, 'church', p.church, 'faith_story', p.faith_story,
    'business_address', p.business_address, 'business_phone', p.business_phone,
    'contact_shared', share, 'phone', case when share then t.phone end, 'email', case when share then t.email end,
    'met', met, 'last_met', last_met, 'ref_sent', rs, 'ref_received', rr);
end $$;

grant update (business_address, business_phone, share_contact) on mentor_profiles to authenticated;
