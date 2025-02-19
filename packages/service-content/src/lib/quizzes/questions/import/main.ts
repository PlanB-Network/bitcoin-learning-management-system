import type { CourseLevel } from '@blms/constants';
import type { TransactionSql } from '@blms/database';
import { firstRow } from '@blms/database';
import type { ChangedFile, Course, QuizQuestion } from '@blms/types';

import { yamlToObject } from '../../../utils.js';

import type { ChangedQuizQuestion } from './index.js';

interface QuizQuestionMain {
  id: string;
  chapterId: string;
  difficulty: CourseLevel;
  author?: string;
  duration?: number;
  tags?: string[];
}

export const createProcessMainFile = (transaction: TransactionSql) => {
  return async (quizQuestion: ChangedQuizQuestion, file?: ChangedFile) => {
    if (!file) return;

    const parsedQuizQuestion = await yamlToObject<QuizQuestionMain>(file);

    const lastUpdated = quizQuestion.files.sort((a, b) => b.time - a.time)[0];

    const courseIndex = file.fullPath?.split('/')[1];

    const courseId = await transaction<Course[]>`
        SELECT id FROM content.courses WHERE index = ${courseIndex}
      `
      .then(firstRow)
      .then((row) => row?.id);

    if (!courseId) {
      throw new Error(`Course not found for path ${file.path}`);
    }

    const result = await transaction<QuizQuestion[]>`
        INSERT INTO content.quiz_questions
        (id, course_id, chapter_id, difficulty, author, duration, disabled, last_updated, last_commit, last_sync)
        VALUES (
          ${parsedQuizQuestion.id},
          ${courseId},
          ${parsedQuizQuestion.chapterId},
          ${parsedQuizQuestion.difficulty},
          ${parsedQuizQuestion.author},
          ${parsedQuizQuestion.duration},
          false,
          ${lastUpdated.time},
          ${lastUpdated.commit},
          NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          course_id = EXCLUDED.course_id,
          chapter_id = EXCLUDED.chapter_id,
          difficulty = EXCLUDED.difficulty,
          author = EXCLUDED.author,
          duration = EXCLUDED.duration,
          disabled = EXCLUDED.disabled,
          last_updated = EXCLUDED.last_updated,
          last_commit = EXCLUDED.last_commit,
          last_sync = NOW()
        RETURNING *
      `.then(firstRow);

    if (result) {
      await transaction`
        INSERT INTO content.quiz_answers (
        quiz_question_id, "order", correct
        )
        VALUES (
        ${result.id},
        0,
        true
        )
        ON CONFLICT (quiz_question_id, "order") DO UPDATE SET
        correct = EXCLUDED.correct
      `;

      for (let i = 0; i < 3; i++) {
        await transaction`
        INSERT INTO content.quiz_answers (
          quiz_question_id, "order", correct
        )
        VALUES (
          ${result.id},
          ${i + 1},
          false
        )
        ON CONFLICT (quiz_question_id, "order") DO UPDATE SET
          correct = EXCLUDED.correct
      `;
      }
    }

    // If the quiz has tags, insert them into the tags table and link them to the quiz
    if (
      result &&
      parsedQuizQuestion.tags &&
      parsedQuizQuestion.tags?.length > 0
    ) {
      await transaction`
          INSERT INTO content.tags ${transaction(
            parsedQuizQuestion.tags.map((tag) => ({ name: tag.toLowerCase() })),
          )}
          ON CONFLICT (name) DO NOTHING
        `;

      await transaction`
          INSERT INTO content.quiz_question_tags (quiz_question_id, tag_id)
          SELECT
            ${result.id},
            id FROM content.tags WHERE name = ANY(${parsedQuizQuestion.tags})
          ON CONFLICT DO NOTHING
        `;
    }

    return result?.id;
  };
};
