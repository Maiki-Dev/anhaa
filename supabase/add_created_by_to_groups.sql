-- Add created_by column to groups table
ALTER TABLE groups ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES users(id);

-- Update RLS policy for creation to ensure created_by matches auth.uid()
DROP POLICY IF EXISTS "Authenticated users can create groups." ON groups;
CREATE POLICY "Authenticated users can create groups." ON groups FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
