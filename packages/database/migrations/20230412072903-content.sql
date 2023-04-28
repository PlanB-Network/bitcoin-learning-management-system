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
  resource_id INTEGER NOT NULL REFERENCES content.resources(id) ON DELETE CASCADE,
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
  resource_id INTEGER NOT NULL REFERENCES content.resources(id) ON DELETE CASCADE,
  language VARCHAR(10) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  platform_url TEXT,

  UNIQUE (resource_id, language)
);

CREATE TABLE IF NOT EXISTS content.articles (
  id SERIAL PRIMARY KEY,
  resource_id INTEGER NOT NULL REFERENCES content.resources(id) ON DELETE CASCADE,
  language VARCHAR(10) NOT NULL,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT,
  article_url TEXT NOT NULL,

  UNIQUE (resource_id, language)
);

-- Tags (e.g. bitcoin, lightning, etc.)
CREATE TABLE IF NOT EXISTS content.tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT
);

-- Junction table for resources and tags
CREATE TABLE IF NOT EXISTS content.resource_tags (
  resource_id INTEGER NOT NULL REFERENCES content.resources(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES content.tags(id),
  PRIMARY KEY (resource_id, tag_id)
);