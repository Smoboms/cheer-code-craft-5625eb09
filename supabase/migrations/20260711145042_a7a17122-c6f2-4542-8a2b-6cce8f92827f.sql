DROP TRIGGER IF EXISTS on_auth_user_created_admin_allowlist ON auth.users;
CREATE TRIGGER on_auth_user_created_admin_allowlist
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.grant_admin_for_allowlist();