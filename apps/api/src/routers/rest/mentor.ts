import { sql } from '@blms/database';
import { createGetCourseChapter, createSearch } from '@blms/service-content';
import type { Router } from 'express';

import type { Dependencies } from '#src/dependencies.js';
import { expressAuthMiddleware } from '#src/middlewares/auth.js';

interface MentorStreamRequest {
  question: string;
  language?: string;
  chapterId?: string;
}

interface MentorMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const createRestMentorRoutes = (
  dependencies: Dependencies,
  router: Router,
) => {
  // Require authentication for mentor endpoints
  router.post('/mentor/stream', expressAuthMiddleware, async (req, res) => {
    const {
      question,
      language = 'en',
      chapterId,
    } = req.body as MentorStreamRequest;

    const uid = req.session.uid!;

    // Validate input
    if (!question || question.length < 3 || question.length > 500) {
      res
        .status(400)
        .json({ error: 'Question must be between 3 and 500 characters' });
      return;
    }

    // Check Groq API key
    const groqApiKey = dependencies.config.groq.apiKey;
    if (!groqApiKey) {
      res.status(500).json({ error: 'Groq API key not configured' });
      return;
    }

    // Build session key for this context
    const sessionKey = chapterId
      ? `chapter:${chapterId}:${language}`
      : `general:${language}`;

    try {
      // Check for RESET command
      const isReset = question.trim().toUpperCase() === 'RESET';

      if (isReset) {
        // Insert RESET marker
        await dependencies.postgres.exec(sql`
          INSERT INTO users.mentor_messages (uid, session_key, role, content)
          VALUES (${uid}, ${sessionKey}, 'RESET', 'RESET')
        `);

        // Set SSE headers and send reset confirmation
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        res.flushHeaders();

        res.write(
          `data: ${JSON.stringify({ type: 'sources', sources: [] })}\n\n`,
        );
        res.write(
          `data: ${JSON.stringify({ type: 'token', content: '🔄 Context reset. How can I help you?' })}\n\n`,
        );
        res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
        res.end();
        return;
      }

      // Load conversation history from DB (since last RESET)
      const historyRows = await dependencies.postgres.exec(sql<
        {
          role: string;
          content: string;
          created_at: Date;
        }[]
      >`
        SELECT role, content, created_at
        FROM users.mentor_messages
        WHERE uid = ${uid} AND session_key = ${sessionKey}
        AND created_at > COALESCE(
          (SELECT MAX(created_at) FROM users.mentor_messages
           WHERE uid = ${uid} AND session_key = ${sessionKey} AND role = 'RESET'),
          '1970-01-01'::timestamp
        )
        ORDER BY created_at ASC
        LIMIT 20
      `);

      const conversationHistory: MentorMessage[] = historyRows
        .filter((row) => row.role !== 'RESET')
        .map((row) => ({
          role: row.role as 'user' | 'assistant',
          content: row.content,
        }));

      // Fetch current chapter content if chapterId is provided
      let currentChapterContext = '';
      let currentChapterTitle = '';
      if (chapterId) {
        try {
          const getCourseChapter = createGetCourseChapter({
            ...dependencies,
            log: console.log,
          });
          const chapter = await getCourseChapter(chapterId, language);
          if (chapter) {
            currentChapterTitle = chapter.title || '';
            const chapterContent = chapter.rawContent || '';
            currentChapterContext = chapterContent.slice(0, 3000);
          }
        } catch {
          console.warn(`[mentor] Chapter ${chapterId} not found`);
        }
      }

      // Search for additional relevant content
      const search = createSearch(dependencies);
      const searchResults = await search({
        query: question,
        language,
        categories: ['courses'],
        limit: 5,
        surroundingWords: 20,
        cursor: 1,
      });

      // Extract sources for the response
      const sources = searchResults.results
        .map((result: any) => ({
          title: result.document.title || 'Untitled',
          link: result.document.link || '#',
        }))
        .filter(
          (source: any, index: number, self: any[]) =>
            index === self.findIndex((s: any) => s.link === source.link),
        );

      // Build context for LLM
      let context = '';
      if (currentChapterContext) {
        context += `[Current Chapter: ${currentChapterTitle}]\n${currentChapterContext}\n\n`;
      }
      if (searchResults.results.length > 0) {
        const searchContext = searchResults.results
          .map((result: any, index: number) => {
            const title = result.document.title || 'Untitled';
            const body = result.document.body || '';
            return `[Source ${index + 1}: ${title}]\n${body.slice(0, 500)}...\n`;
          })
          .join('\n');
        context += searchContext;
      }

      // Build system prompt
      const systemPrompt = `You are PlanBot, a helpful AI mentor for PlanB Academy, an educational platform about Bitcoin.
The user is reading a course in "${language}" but may ask questions in any language.

CRITICAL: You MUST reply in the same language as the user's question (not the course language). Do NOT mention or comment on the language detection, just answer directly.

${context ? `Reference material:\n${context}\n\n` : ''}Be clear, pedagogical, concise but complete. If you don't know, say so.`;

      console.log('[mentor] Built system prompt and context.', systemPrompt);

      // Build messages array with history
      const messages: Array<{ role: string; content: string }> = [
        { role: 'system', content: systemPrompt },
      ];

      // Add conversation history
      for (const msg of conversationHistory) {
        messages.push({ role: msg.role, content: msg.content });
      }

      // Add current question
      messages.push({ role: 'user', content: question });

      // Log conversation context
      console.log('[mentor] Session:', sessionKey);
      console.log('[mentor] History:', conversationHistory.length, 'messages');
      console.log(
        '[mentor] Messages to LLM:',
        messages.map((m) => ({
          role: m.role,
          content:
            m.role === 'system'
              ? '[system prompt]'
              : m.content.slice(0, 100) + (m.content.length > 100 ? '...' : ''),
        })),
      );

      // Save user message to DB
      await dependencies.postgres.exec(sql`
        INSERT INTO users.mentor_messages (uid, session_key, role, content)
        VALUES (${uid}, ${sessionKey}, 'user', ${question})
      `);

      // Set SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');
      res.flushHeaders();

      // Send sources first
      res.write(`data: ${JSON.stringify({ type: 'sources', sources })}\n\n`);

      // Call Groq API with streaming
      const groqResponse = await fetch(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${groqApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages,
            max_tokens: 800,
            temperature: 0.7,
            stream: true,
          }),
        },
      );

      if (!groqResponse.ok) {
        const errorText = await groqResponse.text();
        console.error(
          '[mentor] Groq API error:',
          groqResponse.status,
          errorText,
        );
        res.write(
          `data: ${JSON.stringify({ type: 'error', error: 'AI service error' })}\n\n`,
        );
        res.end();
        return;
      }

      // Stream the response
      const reader = groqResponse.body?.getReader();
      if (!reader) {
        res.write(
          `data: ${JSON.stringify({ type: 'error', error: 'No response stream' })}\n\n`,
        );
        res.end();
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let fullResponse = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed === 'data: [DONE]') continue;
            if (!trimmed.startsWith('data: ')) continue;

            try {
              const json = JSON.parse(trimmed.slice(6));
              const content = json.choices?.[0]?.delta?.content;
              if (content) {
                fullResponse += content;
                res.write(
                  `data: ${JSON.stringify({ type: 'token', content })}\n\n`,
                );
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      // Save assistant response to DB
      if (fullResponse) {
        await dependencies.postgres.exec(sql`
          INSERT INTO users.mentor_messages (uid, session_key, role, content)
          VALUES (${uid}, ${sessionKey}, 'assistant', ${fullResponse})
        `);
      }

      // Send done signal
      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
      res.end();
    } catch (error) {
      console.error('[mentor] Stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error' });
      } else {
        res.write(
          `data: ${JSON.stringify({ type: 'error', error: 'Stream error' })}\n\n`,
        );
        res.end();
      }
    }
  });

  // Endpoint to get conversation history (requires authentication)
  router.get('/mentor/history', expressAuthMiddleware, async (req, res) => {
    const uid = req.session.uid!;
    const sessionKey = req.query.sessionKey as string;

    if (!sessionKey) {
      res.status(400).json({ error: 'sessionKey is required' });
      return;
    }

    try {
      const historyRows = await dependencies.postgres.exec(sql<
        {
          id: string;
          role: string;
          content: string;
          created_at: Date;
        }[]
      >`
        SELECT id, role, content, created_at
        FROM users.mentor_messages
        WHERE uid = ${uid} AND session_key = ${sessionKey}
        AND created_at > COALESCE(
          (SELECT MAX(created_at) FROM users.mentor_messages
           WHERE uid = ${uid} AND session_key = ${sessionKey} AND role = 'RESET'),
          '1970-01-01'::timestamp
        )
        ORDER BY created_at ASC
        LIMIT 50
      `);

      const messages = historyRows
        .filter((row) => row.role !== 'RESET')
        .map((row) => ({
          id: row.id,
          type: row.role as 'user' | 'mentor',
          content: row.content,
        }));

      res.json({ messages });
    } catch (error) {
      console.error('[mentor] History error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
};
