-- Add account_number column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS account_number TEXT;

-- Update the handle_new_user function to include account_number
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, loan_type, stars, account_number)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'name', 
    new.raw_user_meta_data->>'loan_type', 
    0,
    new.raw_user_meta_data->>'account_number'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
