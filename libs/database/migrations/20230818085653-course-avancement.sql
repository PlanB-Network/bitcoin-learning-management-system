-- Path: libs/database/migrations/20230818085653-course-avancement.sql

CREATE TABLE IF NOT EXISTS users.course_completed_chapters (
  uid UUID NOT NULL REFERENCES users.accounts(uid) ON DELETE CASCADE,
  course_id VARCHAR(20) NOT NULL REFERENCES content.courses(id) ON DELETE CASCADE,
  chapter INTEGER NOT NULL,

  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (uid, course_id, chapter)
);

CREATE INDEX idx_course_completed_chapters_account ON users.course_completed_chapters(uid);
CREATE INDEX idx_course_completed_chapters_course ON users.course_completed_chapters(course_id);

CREATE TABLE IF NOT EXISTS users.course_progress (
  uid UUID NOT NULL REFERENCES users.accounts(uid) ON DELETE CASCADE,
  course_id VARCHAR(20) NOT NULL REFERENCES content.courses(id) ON DELETE CASCADE,

  completed_chapters_count INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  progress_percentage INTEGER NOT NULL DEFAULT 0,

  PRIMARY KEY (uid, course_id)
);