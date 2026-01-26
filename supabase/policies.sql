-- Allow creators to add members to their savings accounts
create policy "Creators can add members." on savings_members for insert to authenticated with check (
  exists (
    select 1 from savings_accounts
    where id = savings_members.account_id
    and created_by = auth.uid()
  )
);
