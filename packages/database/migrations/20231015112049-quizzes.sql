-- Path: packages/database/migrations/20231015112049-quizz.sql

CREATE TABLE IF NOT EXISTS content.quiz_questions (
  id INTEGER PRIMARY KEY,

  course_id VARCHAR(20) NOT NULL,
  part INTEGER NOT NULL,
  chapter INTEGER NOT NULL,

  difficulty VARCHAR(255) NOT NULL,
  author VARCHAR(255),
  duration INTEGER,

  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_commit VARCHAR(40) NOT NULL,

  CONSTRAINT fk_quizzes_to_course_chapters
    FOREIGN KEY (course_id, part, chapter)
    REFERENCES content.course_chapters(course_id, part, chapter)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS content.quiz_questions_localized (
  quiz_question_id INTEGER NOT NULL REFERENCES content.quiz_questions(id) ON DELETE CASCADE,
  language VARCHAR(10) NOT NULL,

  -- Per quiz
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  wrong_answers TEXT[] NOT NULL,
  explanation TEXT,

  PRIMARY KEY (quiz_question_id, language)
);

CREATE TABLE IF NOT EXISTS content.quiz_question_tags (
  quiz_question_id INTEGER NOT NULL REFERENCES content.quiz_questions(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES content.tags(id) ON DELETE CASCADE,

  PRIMARY KEY (quiz_question_id, tag_id)
);

CREATE TABLE IF NOT EXISTS users.quiz_attempts (
  uid UUID NOT NULL REFERENCES users.accounts(uid) ON DELETE CASCADE,
  course_id VARCHAR(20) NOT NULL,
  part INTEGER NOT NULL,
  chapter INTEGER NOT NULL,
  
  questions_count INTEGER NOT NULL,
  correct_answers_count INTEGER NOT NULL,

  done_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (uid, course_id, part, chapter)
);