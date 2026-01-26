
-- Allow members to update their own status (e.g. accept/reject invite)
create policy "Members can update own status." on savings_members for update using (auth.uid() = user_id);
