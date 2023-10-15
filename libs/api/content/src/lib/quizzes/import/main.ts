import { TransactionSql, firstRow } from '@sovereign-university/database';
import {
  ChangedFile,
  ModifiedFile,
  Quiz,
  RenamedFile,
} from '@sovereign-university/types';

import { yamlToObject } from '../../utils';

import { ChangedQuiz, parseDetailsFromPath } from '.';

interface QuizMain {
  course: string;
  part: string;
  chapter: string;
  difficulty: 'easy' | 'intermediate' | 'hard' | 'expert';
  author?: string;
  duration?: number;
  tags?: string[];
}

export const createProcessMainFile =
  (transaction: TransactionSql) =>
  async (quiz: ChangedQuiz, file?: ChangedFile) => {
    if (!file) return;

    if (file.kind === 'removed') {
      // If quiz file was removed, delete the main quiz and all its translations (with cascade)

      await transaction`
        DELETE FROM content.quizzes WHERE id = ${quiz.id} 
      `;

      return;
    }

    if (file.kind === 'renamed') {
      // If quiz file was moved, update the id

      const { id: previousId } = parseDetailsFromPath(file.previousPath);

      await transaction`
        UPDATE content.quizzes
        SET id = ${quiz.id}
        WHERE id = ${previousId}
      `;
    }

    if (
      file.kind === 'added' ||
      file.kind === 'modified' ||
      file.kind === 'renamed'
    ) {
      // If new or updated quiz file, insert or update quiz

      // Only get the tags from the main quiz file
      const parsedQuiz = yamlToObject<QuizMain>(file.data);

      const lastUpdated = quiz.files
        .filter(
          (file): file is ModifiedFile | RenamedFile => file.kind !== 'removed',
        )
        .sort((a, b) => b.time - a.time)[0];

      const result = await transaction<Quiz[]>`
        INSERT INTO content.quizzes
        (id, course_id, part, chapter, difficulty, author, duration, last_updated, last_commit)
        VALUES (
          ${quiz.id},
          ${parsedQuiz.course}, 
          ${parsedQuiz.part},
          ${parsedQuiz.chapter},
          ${parsedQuiz.difficulty},
          ${parsedQuiz.author},
          ${parsedQuiz.duration},
          ${lastUpdated.time}, 
          ${lastUpdated.commit}
        )
        ON CONFLICT (id) DO UPDATE SET
          course_id = EXCLUDED.course_id,
          part = EXCLUDED.part,
          chapter = EXCLUDED.chapter,
          difficulty = EXCLUDED.difficulty,
          author = EXCLUDED.author,
          duration = EXCLUDED.duration,
          last_updated = EXCLUDED.last_updated,
          last_commit = EXCLUDED.last_commit
        RETURNING *
      `.then(firstRow);

      // If the quiz has tags, insert them into the tags table and link them to the quiz
      if (result && parsedQuiz.tags && parsedQuiz.tags?.length > 0) {
        await transaction`
          INSERT INTO content.tags ${transaction(
            parsedQuiz.tags.map((tag) => ({ name: tag })),
          )}
          ON CONFLICT DO NOTHING
        `;

        await transaction`
          INSERT INTO content.quiz_tags (quiz_id, tag_id)
          SELECT
            ${result.id}, 
            id FROM content.tags WHERE name = ANY(${parsedQuiz.tags})
          ON CONFLICT DO NOTHING
        `;
      }
    }
  };
