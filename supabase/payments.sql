-- Create payments table
create table if not exists public.payments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  group_id uuid references public.groups(id) on delete cascade not null,
  amount numeric not null,
  status text not null default 'pending', -- pending, verified, rejected
  payment_method text, -- qpay, khan_bank, etc.
  transaction_id text,
  proof_url text,
  note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.payments enable row level security;

-- Policies
create policy "Users can view their own payments." on public.payments
  for select using (auth.uid() = user_id);

create policy "Users can insert their own payments." on public.payments
  for insert with check (auth.uid() = user_id);

-- Admin policy (assuming we check admin role via a function or separate table join, 
-- or if the user has 'admin' role in auth.users metadata or public.users table)
-- Ideally:
-- create policy "Admins can view all payments." on public.payments
--   for select using (
--     exists (
--       select 1 from public.users 
--       where id = auth.uid() and role = 'admin'
--     )
--   );
-- For now, we'll leave strict admin policy out or assume service role bypasses RLS for admin pages 
-- if implemented correctly, OR add a policy for now:

create policy "Admins can view all payments" on public.payments
  for select using (
    exists (
      select 1 from public.users 
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update payments" on public.payments
  for update using (
    exists (
      select 1 from public.users 
      where id = auth.uid() and role = 'admin'
    )
  );
