DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'paid_price_euros') THEN
    ALTER TABLE content.courses ADD COLUMN paid_price_euros INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'paid_description') THEN
    ALTER TABLE content.courses ADD COLUMN paid_description TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'paid_video_link') THEN
    ALTER TABLE content.courses ADD COLUMN paid_video_link TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'paid_start_date') THEN
    ALTER TABLE content.courses ADD COLUMN paid_start_date TIMESTAMP;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'paid_end_date') THEN
    ALTER TABLE content.courses ADD COLUMN paid_end_date TIMESTAMP;
  END IF;
END $$;