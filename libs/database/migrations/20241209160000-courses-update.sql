DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'requires_payment') THEN
    ALTER TABLE content.courses ADD COLUMN requires_payment BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS users.course_payment (
  uid UUID NOT NULL REFERENCES users.accounts(uid) ON DELETE CASCADE,
  course_id VARCHAR(20) NOT NULL REFERENCES content.courses(id) ON DELETE CASCADE,

  payment_status VARCHAR(30) NOT NULL,
  amount INTEGER NOT NULL,
  payment_id VARCHAR(255),
  invoice_url VARCHAR(255),
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (uid, course_id, payment_id)
);