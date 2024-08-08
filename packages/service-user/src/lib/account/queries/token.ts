import { sql } from '@blms/database';
import type { Token, TokenType } from '@blms/types';

export const createTokenQuery = (
  uid: string,
  type: TokenType,
  data?: string,
) => {
  return sql<Token[]>`
    INSERT INTO users.tokens (uid, type, expires_at, data)
    VALUES (${uid}, ${type}, NOW() + INTERVAL '1 hour', ${data ?? null})
    RETURNING *;
  `;
};

export const consumeTokenQuery = (id: string, type: TokenType) => {
  return sql<Token[]>`
    UPDATE users.tokens
    SET consumed_at = NOW()
    WHERE id = ${id} AND type = ${type} AND consumed_at IS NULL AND expires_at > NOW()
    RETURNING *;
  `;
};

export const getTokenInfoQuery = (id: string) => {
  return sql<
    Array<Pick<Token, 'id' | 'type'> & { expired: boolean; consumed: boolean }>
  >`
    SELECT id, type, expires_at < NOW() as expired, consumed_at IS NOT NULL as consumed
    FROM users.tokens
    WHERE id = ${id};
  `;
};
