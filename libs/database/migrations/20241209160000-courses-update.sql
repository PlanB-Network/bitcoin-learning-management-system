DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'requires_payment') THEN
    ALTER TABLE content.courses ADD COLUMN requires_payment BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;
END $$;