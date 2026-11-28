-- 1:1 만남 기록은 사진이 필수입니다(앱 화면 검사에 더해 데이터베이스에서도 막습니다).
set search_path = wmto;

create or replace function create_one_to_one(
  p_other uuid, p_held_at timestamptz, p_place text, p_duration int,
  p_learned text, p_can_help text, p_next text, p_intro text, p_prayer text,
  p_proof_path text, p_consent boolean
) returns uuid language plpgsql security definer set search_path = wmto as $$
declare me uuid := current_member_id(); new_id uuid; ok boolean;
begin
  if request_view_as() is not null then raise exception 'view only'; end if;
  if me is null or current_member_role() <> 'mentor' then raise exception 'forbidden'; end if;
  select exists (select 1 from members a, members b where a.id = me and b.id = p_other and b.role = 'mentor' and b.status = 'active'
                 and a.chapter_id is not null and a.chapter_id = b.chapter_id) into ok;
  if not ok then raise exception 'not in same chapter'; end if;
  if p_held_at > now() + interval '1 hour' then raise exception 'future date'; end if;
  if coalesce(btrim(p_learned), '') = '' or coalesce(btrim(p_can_help), '') = '' or coalesce(btrim(p_next), '') = '' then raise exception 'form incomplete'; end if;
  if coalesce(btrim(p_proof_path), '') = '' then raise exception 'photo required'; end if;
  insert into one_to_ones (member_a, member_b, held_at, place, duration_min, learned, can_help, next_step, intro_to, prayer, proof_path, consent_a)
  values (me, p_other, p_held_at, nullif(btrim(p_place), ''), p_duration, left(btrim(p_learned), 2000), left(btrim(p_can_help), 2000), left(btrim(p_next), 2000),
          nullif(left(btrim(coalesce(p_intro, '')), 1000), ''), nullif(left(btrim(coalesce(p_prayer, '')), 1000), ''), p_proof_path, coalesce(p_consent, false))
  returning id into new_id;
  return new_id;
end $$;
