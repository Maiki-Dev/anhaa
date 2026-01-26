
-- Check users with null emails
select * from public.users where email is null;

-- Check if auth.users has emails (we can't query auth.users directly easily from client usually, but as postgres role we might)
-- Actually, the best way to backfill is an update query joining auth.users

update public.users
set email = auth.users.email
from auth.users
where public.users.id = auth.users.id
and public.users.email is null;

-- Check again
select * from public.users;
