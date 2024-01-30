DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'last_sync') THEN
    ALTER TABLE content.courses ADD COLUMN last_sync TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quiz_questions' AND column_name = 'last_sync') THEN
    ALTER TABLE content.quiz_questions ADD COLUMN last_sync TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'professors' AND column_name = 'last_sync') THEN
    ALTER TABLE content.professors ADD COLUMN last_sync TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resources' AND column_name = 'last_sync') THEN
    ALTER TABLE content.resources ADD COLUMN last_sync TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tutorials' AND column_name = 'last_sync') THEN
    ALTER TABLE content.tutorials ADD COLUMN last_sync TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;
END $$;