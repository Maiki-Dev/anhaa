-- 1. Ensure users has role column (if not exists)
ALTER TABLE users ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

-- 2. Enable delete policy for groups (only for admins)
DROP POLICY IF EXISTS "Admins can delete groups" ON groups;
CREATE POLICY "Admins can delete groups" ON groups FOR DELETE USING (
  (select role from users where id = auth.uid()) = 'admin'
);

-- 3. Ensure ON DELETE CASCADE for group_members
ALTER TABLE group_members DROP CONSTRAINT IF EXISTS group_members_group_id_fkey;
ALTER TABLE group_members ADD CONSTRAINT group_members_group_id_fkey
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE;

-- 4. Ensure ON DELETE CASCADE for payments
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_group_id_fkey;
ALTER TABLE payments ADD CONSTRAINT payments_group_id_fkey
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE;

-- 5. Ensure ON DELETE CASCADE for progress
ALTER TABLE progress DROP CONSTRAINT IF EXISTS progress_group_id_fkey;
ALTER TABLE progress ADD CONSTRAINT progress_group_id_fkey
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE;
