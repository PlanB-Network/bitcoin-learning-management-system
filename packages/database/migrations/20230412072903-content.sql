-- Path: packages/database/migrations/20230412072903-content.sql

CREATE SCHEMA IF NOT EXISTS content;

--- MAIN RESOURCES
CREATE TABLE IF NOT EXISTS content.resources (
  id SERIAL PRIMARY KEY,

  category VARCHAR(255) NOT NULL,
  path VARCHAR(255) NOT NULL,

  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_commit VARCHAR(40) NOT NULL,

  UNIQUE (category, path)
);

CREATE TABLE IF NOT EXISTS content.tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS content.resource_tags (
  resource_id INTEGER NOT NULL REFERENCES content.resources(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES content.tags(id) ON DELETE CASCADE,

  PRIMARY KEY (resource_id, tag_id)
);

CREATE TABLE content.contributions (
  resource_id INTEGER NOT NULL REFERENCES content.resources(id) ON DELETE CASCADE,
  language VARCHAR(255),
  contributor_id VARCHAR(20) NOT NULL REFERENCES users.accounts(contributor_id),

  PRIMARY KEY (resource_id, language, contributor_id)
);

--- BOOKS
CREATE TABLE IF NOT EXISTS content.books (
  resource_id INTEGER PRIMARY KEY REFERENCES content.resources(id) ON DELETE CASCADE,

  level VARCHAR(255),
  author TEXT NOT NULL,
  website_url TEXT
);

CREATE TABLE IF NOT EXISTS content.books_localized (
  book_id INTEGER NOT NULL REFERENCES content.books(resource_id) ON DELETE CASCADE,
  language VARCHAR(10) NOT NULL,
  original BOOLEAN NOT NULL,

  -- Per translation
  title TEXT NOT NULL,
  translator TEXT,
  description TEXT,
  publisher VARCHAR(255),
  publication_year INTEGER,
  cover TEXT,
  summary_text TEXT,
  summary_contributor_id VARCHAR(20),

  -- Links
  shop_url TEXT,
  download_url TEXT,

  PRIMARY KEY (book_id, language)
);

--- BUILDERS
CREATE TABLE IF NOT EXISTS content.builders (
  resource_id INTEGER PRIMARY KEY REFERENCES content.resources(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  category VARCHAR(255) NOT NULL,

  -- Links
  website_url TEXT,
  twitter_url TEXT,
  github_url TEXT,
  nostr TEXT
);

CREATE TABLE IF NOT EXISTS content.builders_localized (
  builder_id INTEGER NOT NULL REFERENCES content.builders(resource_id) ON DELETE CASCADE,
  language VARCHAR(10) NOT NULL,

  description TEXT,

  PRIMARY KEY (builder_id, language)
);

--- PODCASTS
CREATE TABLE IF NOT EXISTS content.podcasts (
  resource_id INTEGER PRIMARY KEY REFERENCES content.resources(id) ON DELETE CASCADE,
  language VARCHAR(10) NOT NULL,

  name TEXT NOT NULL,
  host TEXT NOT NULL,
  description TEXT,

    -- Links
  website_url TEXT,
  twitter_url TEXT,
  podcast_url TEXT,
  nostr TEXT
);

--- COURSES
CREATE TABLE IF NOT EXISTS content.courses (
  id VARCHAR(20) PRIMARY KEY,

  level VARCHAR(255) NOT NULL,
  hours FLOAT NOT NULL,

  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_commit VARCHAR(40) NOT NULL
);

CREATE TABLE IF NOT EXISTS content.courses_localized (
  course_id VARCHAR(20) NOT NULL REFERENCES content.courses(id) ON DELETE CASCADE,
  language VARCHAR(10) NOT NULL,

  -- Per translation
  name TEXT NOT NULL,
  goal TEXT NOT NULL,
  raw_description TEXT NOT NULL,

  PRIMARY KEY (course_id, language)
);

CREATE TABLE IF NOT EXISTS content.course_chapters_localized (
  course_id VARCHAR(20) NOT NULL REFERENCES content.courses(id) ON DELETE CASCADE,
  language VARCHAR(10) NOT NULL,
  chapter INTEGER NOT NULL,

  -- Per chapter
  title TEXT NOT NULL,
  raw_content TEXT NOT NULL,

  PRIMARY KEY (course_id, language, chapter)
);

--- TUTORIALS
CREATE TABLE IF NOT EXISTS content.tutorials (
  id SERIAL PRIMARY KEY,
  path VARCHAR(255) UNIQUE NOT NULL,

  level VARCHAR(255) NOT NULL,
  builder VARCHAR(255),

  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_commit VARCHAR(40) NOT NULL
);

CREATE TABLE IF NOT EXISTS content.tutorials_localized (
  tutorial_id INTEGER NOT NULL REFERENCES content.tutorials(id) ON DELETE CASCADE,
  language VARCHAR(10) NOT NULL,

  -- Per translation
  name TEXT NOT NULL,
  goal TEXT NOT NULL,
  raw_description TEXT NOT NULL,
  raw_content TEXT NOT NULL,

  PRIMARY KEY (tutorial_id, language)
);