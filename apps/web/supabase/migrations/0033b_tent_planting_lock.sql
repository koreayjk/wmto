set search_path = wmto;
revoke all on function assign_member_tent(uuid) from public, anon, authenticated;
revoke all on function plant_tent(text) from public, anon;
grant execute on function plant_tent(text) to authenticated;
