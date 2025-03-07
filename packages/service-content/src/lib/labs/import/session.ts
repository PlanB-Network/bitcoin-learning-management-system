import { type TransactionSql, firstRow } from '@blms/database';
import type { ChangedFile } from '@blms/types';
import matter from 'gray-matter';
import { type Token, marked } from 'marked';

interface LabSession {
  professor_id: string;
  students_count?: number;
  telegram_url?: string;
}

export const createProcessSessionFile = (transaction: TransactionSql) => {
  return async (id: string, file?: ChangedFile) => {
    if (!file) return;

    const header = matter(await file.load(), {
      excerpt: true,
      excerpt_separator: '+++',
    });

    const sessions = extractSessions(header.content);

    await transaction`DELETE FROM content.labs_sessions WHERE lab_id = ${id}`;

    for (const session of sessions) {
      await transaction<LabSession[]>`
          INSERT INTO content.labs_sessions (
              lab_id,
              title,
              start_date,
              end_date,
              live_url,
              raw_content,
              last_sync
          )
          VALUES (
              ${id},
              ${session.title},
              ${session.startDate},
              ${session.endDate},
              ${session.liveUrl},
              ${session.rawContent},
              NOW()
          )
          RETURNING *
      `.then(firstRow);
    }
  };
};

const extractData = (token: Token, type: string) => {
  if (token.type === 'paragraph' && token.tokens) {
    for (const [index, t] of token.tokens.entries()) {
      if (t.raw === `<${type}>`) {
        let res = token.tokens.at(index + 1)?.raw;
        let i = 2;

        // Marked separate the result into many tokens when it ends with an "_"
        while (i < 10) {
          const currentToken = token.tokens.at(index + i);
          if (currentToken?.raw === `</${type}>`) {
            return res ? res : null;
          }
          if (currentToken?.raw === '_') {
            res += '_';
          }
          i++;
        }
      }
    }
  }

  return null;
};

interface Session {
  title: string;
  startDate?: string;
  endDate?: string;
  liveUrl?: string;
  rawContent?: string;
}

const extractSessions = (markdown: string): Session[] => {
  const tokens = marked.lexer(markdown);
  const sessions: Session[] = [];

  for (const token of tokens) {
    if (token.type === 'heading' && token.depth === 1) {
      sessions.push({
        title: token.text as string,
        rawContent: '',
      });
    } else if (sessions.length > 0) {
      const currentSession = sessions.at(-1)!;

      if (token.raw.startsWith('<')) {
        const startDate = extractData(token, 'startDate');
        if (startDate !== null) {
          currentSession.startDate = startDate;
        }
        const endDate = extractData(token, 'endDate');
        if (endDate !== null) {
          currentSession.endDate = endDate;
        }
        const liveUrl = extractData(token, 'liveUrl');
        if (liveUrl !== null) {
          currentSession.liveUrl = liveUrl;
        }

        const regex = new RegExp(
          ['startDate', 'endDate', 'liveUrl']
            .map((tag) => `<${tag}>.*</${tag}>`)
            .join('|'),
          'gm',
        );

        token.raw = token.raw.replaceAll(regex, '');
      }

      const rawToken = token.raw;
      if (rawToken) {
        currentSession.rawContent += rawToken;
      }
    }
  }

  return sessions;
};
