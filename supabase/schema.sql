-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. USERS Table (Public profiles linked to auth.users)
create table users (
  id uuid references auth.users not null primary key,
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

-- Row Level Security (RLS)
alter table users enable row level security;
alter table groups enable row level security;
alter table group_members enable row level security;
alter table progress enable row level security;

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

-- Trigger to create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, name, loan_type, stars)
  values (new.id, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'loan_type', 0);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
