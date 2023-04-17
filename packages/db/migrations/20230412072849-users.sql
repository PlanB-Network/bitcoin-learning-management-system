-- Path: packages/db/migrations/20230412072849-users.sql

CREATE SCHEMA IF NOT EXISTS users;

-- Users
CREATE TABLE IF NOT EXISTS users.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),

  contributor_id VARCHAR(15) UNIQUE NOT NULL,

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);