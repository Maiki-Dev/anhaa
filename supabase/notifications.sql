
-- 1. Add status to savings_members
-- First add column with 'active' default to handle existing records
alter table savings_members add column if not exists status text default 'active';

-- Ensure existing records are active
update savings_members set status = 'active' where status is null;

-- Change default to 'invited' for future records and add constraint
alter table savings_members alter column status set default 'invited';
-- Drop constraint if exists to avoid error on re-run
alter table savings_members drop constraint if exists savings_members_status_check;
alter table savings_members add constraint savings_members_status_check check (status in ('invited', 'active', 'rejected'));


-- 2. Create Notifications table
create table if not exists notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) on delete cascade not null,
  type text not null,
  title text not null,
  message text,
  data jsonb,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. RLS for notifications
alter table notifications enable row level security;

drop policy if exists "Users can view own notifications." on notifications;
create policy "Users can view own notifications." on notifications for select using (auth.uid() = user_id);

drop policy if exists "Users can update own notifications." on notifications;
create policy "Users can update own notifications." on notifications for update using (auth.uid() = user_id);

drop policy if exists "Authenticated users can insert notifications." on notifications;
create policy "Authenticated users can insert notifications." on notifications for insert to authenticated with check (true);
