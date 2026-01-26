
-- 1. Fix null emails in public.users table
update public.users
set email = auth.users.email
from auth.users
where public.users.id = auth.users.id
and public.users.email is null;

-- 2. Add created_by column to savings_accounts if it doesn't exist
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'savings_accounts' and column_name = 'created_by') then
        alter table savings_accounts add column created_by uuid references users(id);
    end if;
end $$;

-- 3. Enable creators to add members to their savings accounts
drop policy if exists "Creators can add members." on savings_members;
create policy "Creators can add members." on savings_members for insert to authenticated with check (
  exists (
    select 1 from savings_accounts
    where id = savings_members.account_id
    and created_by = auth.uid()
  )
);

-- 4. Ensure savings account creation policy is correct
drop policy if exists "Authenticated users can create savings accounts." on savings_accounts;
create policy "Authenticated users can create savings accounts." on savings_accounts for insert to authenticated with check (
  auth.uid() = created_by
);
