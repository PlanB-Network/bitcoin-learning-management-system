-- Path: packages/database/migrations/20230412072903-content.sql

CREATE SCHEMA IF NOT EXISTS content;

-- Main resource table
CREATE TABLE IF NOT EXISTS content.resources (
  id SERIAL PRIMARY KEY,
  type VARCHAR(255) NOT NULL,
  path VARCHAR(255) NOT NULL,
  original_language VARCHAR(10) NOT NULL,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_commit VARCHAR(40) NOT NULL,

  UNIQUE (type, path)
);

-- Tables per type of content
CREATE TABLE IF NOT EXISTS content.books (
  id SERIAL PRIMARY KEY,
  resource_id INTEGER REFERENCES content.resources(id) ON DELETE CASCADE,
  language VARCHAR(10) NOT NULL,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT,
  publication_date DATE,
  cover TEXT,

  UNIQUE (resource_id, language)
);

CREATE TABLE IF NOT EXISTS content.podcasts (
  id SERIAL PRIMARY KEY,
  resource_id INTEGER REFERENCES content.resources(id) ON DELETE CASCADE,
  language VARCHAR(10) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  platform_url TEXT,

  UNIQUE (resource_id, language)
);

CREATE TABLE IF NOT EXISTS content.articles (
  id SERIAL PRIMARY KEY,
  resource_id INTEGER REFERENCES content.resources(id) ON DELETE CASCADE,
  language VARCHAR(10) NOT NULL,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT,
  article_url TEXT NOT NULL,

  UNIQUE (resource_id, language)
);
