-- 1. Enable RLS on users table (if not already enabled)
alter table public.users enable row level security;

-- 2. Policy to allow admins to delete users
drop policy if exists "Admins can delete users" on public.users;
create policy "Admins can delete users"
on public.users
for delete
to authenticated
using (
  (select role from public.users where id = auth.uid()) = 'admin'
);

-- 3. Policy to allow admins to delete groups
drop policy if exists "Admins can delete groups" on public.groups;
create policy "Admins can delete groups"
on public.groups
for delete
to authenticated
using (
  (select role from public.users where id = auth.uid()) = 'admin'
);

-- 4. Policy to allow admins to delete savings accounts
drop policy if exists "Admins can delete savings_accounts" on public.savings_accounts;
create policy "Admins can delete savings_accounts"
on public.savings_accounts
for delete
to authenticated
using (
  (select role from public.users where id = auth.uid()) = 'admin'
);

-- 5. Policy to allow admins to delete group members
drop policy if exists "Admins can delete group_members" on public.group_members;
create policy "Admins can delete group_members"
on public.group_members
for delete
to authenticated
using (
  (select role from public.users where id = auth.uid()) = 'admin'
);

-- 6. Policy to allow admins to delete payments
drop policy if exists "Admins can delete payments" on public.payments;
create policy "Admins can delete payments"
on public.payments
for delete
to authenticated
using (
  (select role from public.users where id = auth.uid()) = 'admin'
);

-- 7. Policy to allow admins to delete progress
drop policy if exists "Admins can delete progress" on public.progress;
create policy "Admins can delete progress"
on public.progress
for delete
to authenticated
using (
  (select role from public.users where id = auth.uid()) = 'admin'
);

-- 8. Policy to allow admins to delete savings transactions
drop policy if exists "Admins can delete savings_transactions" on public.savings_transactions;
create policy "Admins can delete savings_transactions"
on public.savings_transactions
for delete
to authenticated
using (
  (select role from public.users where id = auth.uid()) = 'admin'
);

-- 9. Policy to allow admins to delete savings members
drop policy if exists "Admins can delete savings_members" on public.savings_members;
create policy "Admins can delete savings_members"
on public.savings_members
for delete
to authenticated
using (
  (select role from public.users where id = auth.uid()) = 'admin'
);

-- 10. Policy to allow admins to delete savings messages
drop policy if exists "Admins can delete savings_messages" on public.savings_messages;
create policy "Admins can delete savings_messages"
on public.savings_messages
for delete
to authenticated
using (
  (select role from public.users where id = auth.uid()) = 'admin'
);

-- 11. Policy to allow admins to delete notifications
drop policy if exists "Admins can delete notifications" on public.notifications;
create policy "Admins can delete notifications"
on public.notifications
for delete
to authenticated
using (
  (select role from public.users where id = auth.uid()) = 'admin'
);
