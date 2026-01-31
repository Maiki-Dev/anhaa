-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. USERS Table (Public profiles linked to auth.users)
create table users (
  id uuid references auth.users not null primary key,
  email text,
  name text,
  loan_type text check (loan_type in ('bank', 'nbfi', 'app')),
  stars int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. GROUPS Table
create table groups (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  monthly_contribution numeric not null,
  max_members int not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. GROUP_MEMBERS Table
create table group_members (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references groups(id) on delete cascade not null,
  user_id uuid references users(id) on delete cascade not null,
  rotation_order int,
  has_received boolean default false,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(group_id, user_id)
);

-- 4. PROGRESS Table
create table progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) on delete cascade not null,
  group_id uuid references groups(id) on delete cascade,
  month text not null, -- Format: 'YYYY-MM'
  paid boolean default false,
  note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. PAYMENTS Table
create table if not exists payments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) on delete cascade not null,
  group_id uuid references groups(id) on delete cascade not null,
  amount numeric not null,
  payment_method text not null,
  status text default 'pending',
  note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. SAVINGS Table (New)
create table if not exists savings_accounts (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  created_by uuid references users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists savings_members (
  id uuid default uuid_generate_v4() primary key,
  account_id uuid references savings_accounts(id) on delete cascade not null,
  user_id uuid references users(id) on delete cascade not null,
  status text default 'active', -- active, invited, rejected
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(account_id, user_id)
);

create table if not exists savings_transactions (
  id uuid default uuid_generate_v4() primary key,
  account_id uuid references savings_accounts(id) on delete cascade not null,
  user_id uuid references users(id) on delete cascade not null,
  amount numeric not null,
  payment_method text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. SAVINGS MESSAGES Table (New)
create table if not exists savings_messages (
  id uuid default uuid_generate_v4() primary key,
  account_id uuid references savings_accounts(id) on delete cascade not null,
  user_id uuid references users(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. NOTIFICATIONS Table (New)
create table if not exists notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) on delete cascade not null,
  type text not null,
  title text not null,
  message text not null,
  data jsonb,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- Row Level Security (RLS)
alter table users enable row level security;
alter table groups enable row level security;
alter table group_members enable row level security;
alter table progress enable row level security;
alter table payments enable row level security;
alter table savings_accounts enable row level security;
alter table savings_members enable row level security;
alter table savings_transactions enable row level security;
alter table savings_messages enable row level security;
alter table notifications enable row level security;

-- Policies

-- Users: Everyone can read users, but only the user can update their own profile
create policy "Public profiles are viewable by everyone." on users for select using (true);
create policy "Users can insert their own profile." on users for insert with check (auth.uid() = id);
create policy "Users can update own profile." on users for update using (auth.uid() = id);

-- Groups: Authenticated users can read all groups (to join), create groups
create policy "Groups are viewable by authenticated users." on groups for select to authenticated using (true);
create policy "Authenticated users can create groups." on groups for insert to authenticated with check (true);

-- Group Members: Members can view their group members
create policy "Group members viewable by group members." on group_members for select using (
  auth.uid() in (
    select user_id from group_members where group_id = group_members.group_id
  )
);
create policy "Authenticated users can join groups." on group_members for insert to authenticated with check (auth.uid() = user_id);

-- Progress: Users view their own progress, or group members view progress
create policy "Users can view own progress." on progress for select using (auth.uid() = user_id);
create policy "Users can insert own progress." on progress for insert with check (auth.uid() = user_id);
create policy "Group members can view progress of others in same group." on progress for select using (
  auth.uid() in (
    select user_id from group_members where group_id = progress.group_id
  )
);
-- Allow authenticated users to update progress (for admin actions)
create policy "Authenticated users can update progress." on progress for update using (auth.role() = 'authenticated');
create policy "Authenticated users can insert progress." on progress for insert with check (auth.role() = 'authenticated');


-- Payments: Users view their own payments, or group members view payments
create policy "Users can view own payments." on payments for select using (auth.uid() = user_id);
create policy "Users can insert own payments." on payments for insert with check (auth.uid() = user_id);
create policy "Admins can view all payments." on payments for select using (true);
-- Allow authenticated users to update payments (for admin actions)
create policy "Authenticated users can update payments." on payments for update using (auth.role() = 'authenticated');

-- Savings Policies

-- Helper function to avoid infinite recursion in RLS
create or replace function get_my_savings_account_ids()
returns setof uuid
language sql
security definer
set search_path = public
stable
as $$
  select account_id from savings_members where user_id = auth.uid();
$$;

create policy "Savings accounts viewable by members." on savings_accounts for select using (
  id in (select get_my_savings_account_ids())
  or
  created_by = auth.uid()
);
create policy "Authenticated users can create savings accounts." on savings_accounts for insert to authenticated with check (
  auth.uid() = created_by
);

create policy "Savings members viewable by members." on savings_members for select using (
  account_id in (select get_my_savings_account_ids())
);
create policy "Authenticated users can join savings." on savings_members for insert to authenticated with check (auth.uid() = user_id);

create policy "Creators can add members." on savings_members for insert to authenticated with check (
  exists (
    select 1 from savings_accounts
    where id = savings_members.account_id
    and created_by = auth.uid()
  )
);
create policy "Anyone can update savings members." on savings_members for update using (true);

create policy "Savings transactions viewable by members." on savings_transactions for select using (
  account_id in (select get_my_savings_account_ids())
);
create policy "Members can insert savings transactions." on savings_transactions for insert with check (
  account_id in (select get_my_savings_account_ids())
);

-- Savings Messages Policies
create policy "Savings messages viewable by members." on savings_messages for select using (
  account_id in (select get_my_savings_account_ids())
);
create policy "Members can insert savings messages." on savings_messages for insert with check (
  account_id in (select get_my_savings_account_ids())
);

-- Notifications Policies
create policy "Users can view own notifications." on notifications for select using (auth.uid() = user_id);
create policy "Users can update own notifications." on notifications for update using (auth.uid() = user_id);
create policy "Anyone can insert notifications." on notifications for insert with check (true);

-- Trigger to create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name, loan_type, stars)
  values (new.id, new.email, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'loan_type', 0);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
