-- Update the admin email if the old user exists
-- This attempts to update the email of the existing admin user.
-- NOTE: This requires superuser/service_role privileges to run against auth.users directly.
-- If running from the client-side SQL editor, it might work if you are the project owner.

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@hmbrindes.com') THEN
        UPDATE auth.users 
        SET email = 'vhmelosilva@gmail.com', 
            email_confirmed_at = now(),
            updated_at = now()
        WHERE email = 'admin@hmbrindes.com';
    END IF;
END $$;
