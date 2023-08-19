-- Path: packages/database/migrations/20230412072849-users.sql

CREATE SCHEMA IF NOT EXISTS users;

-- Users
CREATE TABLE IF NOT EXISTS users.accounts (
  uid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),

  contributor_id VARCHAR(20) UNIQUE NOT NULL,

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);