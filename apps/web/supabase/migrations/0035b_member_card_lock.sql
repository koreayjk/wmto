set search_path = wmto;
revoke all on function tent_member_card(uuid) from public, anon;
grant execute on function tent_member_card(uuid) to authenticated;
