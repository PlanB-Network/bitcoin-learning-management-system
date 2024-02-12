-- Path: packages/database/migrations/20230412072849-users.sql

CREATE SCHEMA IF NOT EXISTS users;

-- Users
CREATE TABLE IF NOT EXISTS users.accounts (
  uid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  username VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(255) UNIQUE,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),

  contributor_id VARCHAR(20) UNIQUE NOT NULL,

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users.lud4_public_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uid UUID NOT NULL REFERENCES users.accounts(uid) ON DELETE CASCADE,
  
  public_key TEXT NOT NULL UNIQUE,

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);