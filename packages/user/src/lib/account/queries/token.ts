import { sql } from '@sovereign-university/database';
import { Token, TokenType } from '@sovereign-university/types';

export const createTokenQuery = (
  uid: string,
  type: TokenType,
  data?: string,
) => {
  return sql<Array<Token>>`
    INSERT INTO users.tokens (uid, type, expires_at, data)
    VALUES (${uid}, ${type}, NOW() + INTERVAL '1 hour', ${data ?? null})
    RETURNING *;
  `;
};

export const consumeTokenQuery = (id: string, type: TokenType) => {
  return sql<Array<Token>>`
    UPDATE users.tokens
    SET consumed_at = NOW()
    WHERE id = ${id} AND type = ${type} AND consumed_at IS NULL AND expires_at > NOW()
    RETURNING *;
  `;
};
