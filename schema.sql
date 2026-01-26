-- Create users table
create table if not exists public.users (
  id uuid references auth.users on delete cascade not null primary key,
  name text,
  loan_type text,
  stars int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on users
alter table public.users enable row level security;

-- Create policies for users
create policy "Public profiles are viewable by everyone." on public.users
  for select using (true);

create policy "Users can insert their own profile." on public.users
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on public.users
  for update using (auth.uid() = id);

-- Create groups table
create table if not exists public.groups (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  monthly_contribution numeric not null,
  max_members int not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on groups
alter table public.groups enable row level security;

-- Create policies for groups
create policy "Groups are viewable by everyone." on public.groups
  for select using (true);

create policy "Authenticated users can create groups." on public.groups
  for insert with check (auth.role() = 'authenticated');

-- Create group_members table
create table if not exists public.group_members (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references public.groups on delete cascade not null,
  user_id uuid references public.users on delete cascade not null,
  rotation_order int,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(group_id, user_id)
);

-- Enable RLS on group_members
alter table public.group_members enable row level security;

-- Create policies for group_members
create policy "Group members viewable by everyone." on public.group_members
  for select using (true);

create policy "Authenticated users can join groups." on public.group_members
  for insert with check (auth.uid() = user_id);

-- Create progress table
create table if not exists public.progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users on delete cascade not null,
  group_id uuid references public.groups on delete cascade not null,
  month text not null, -- Format: YYYY-MM
  paid boolean default false,
  note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on progress
alter table public.progress enable row level security;

-- Create policies for progress
create policy "Progress viewable by everyone." on public.progress
  for select using (true);

create policy "Users can insert their own progress." on public.progress
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own progress." on public.progress
  for update using (auth.uid() = user_id);

-- Create a trigger to sync auth.users with public.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, name, loan_type)
  values (new.id, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'loan_type');
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to avoid error on multiple runs
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Backfill existing users from auth.users to public.users
insert into public.users (id, name, loan_type)
select id, raw_user_meta_data->>'name', raw_user_meta_data->>'loan_type'
from auth.users
on conflict (id) do nothing;
