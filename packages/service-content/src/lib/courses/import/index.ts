import matter from 'gray-matter';
import type { Token } from 'marked';
import { marked } from 'marked';
import { validate as uuidValidate } from 'uuid';

import { firstRow, sql } from '@blms/database';
import type {
  ChangedFile,
  Course,
  ModifiedFile,
  Proofreading,
  RenamedFile,
} from '@blms/types';

import type { Language } from '../../const.js';
import type { Dependencies } from '../../dependencies.js';
import type { ChangedContent, ProofreadingEntry } from '../../types.js';
import {
  convertStringToTimestamp,
  getContentType,
  getRelativePath,
  separateContentFiles,
  yamlToObject,
} from '../../utils.js';

interface CourseDetails {
  id: string;
  path: string;
  fullPath: string;
  language?: Language;
}

export interface ChangedCourse extends ChangedContent {
  id: string;
}

/**
 * Parse course details from path
 *
 * @param path - Path of the file
 * @returns Resource details
 */
const parseDetailsFromPath = (path: string): CourseDetails => {
  const pathElements = path.split('/');

  // Validate that the path has at least 3 elements (courses/name)
  if (pathElements.length < 2) {
    throw new Error('Invalid resource path');
  }

  return {
    id: pathElements[1],
    path: pathElements.slice(0, 2).join('/'),
    fullPath: pathElements.join('/'),
    language: pathElements[2].replace(/\..*/, '').toLowerCase() as Language,
  };
};

export const groupByCourse = (files: ChangedFile[], errors: string[]) => {
  const coursesFiles = files.filter(
    (item) =>
      getContentType(item.path) === 'courses' && !item.path.includes('quizz'),
  );
  const groupedCourses = new Map<string, ChangedCourse>();

  for (const file of coursesFiles) {
    try {
      const {
        id,
        path: coursePath,
        fullPath,
        language,
      } = parseDetailsFromPath(file.path);

      const course: ChangedCourse = groupedCourses.get(coursePath) || {
        type: 'courses',
        id,
        path: coursePath,
        fullPath,
        files: [],
      };

      course.files.push({
        ...file,
        path: getRelativePath(file.path, coursePath),
        language,
      });

      groupedCourses.set(coursePath, course);
    } catch {
      errors.push(`Unsupported path ${file.path}, skipping file...`);
    }
  }

  return [...groupedCourses.values()];
};

interface CourseMain {
  level: string;
  hours: number;
  topic: string;
  subtopic: string;
  original_language: string;
  professors: string[];
  tags?: string[];
  requires_payment: boolean;
  format: string;
  online_price_dollars?: number;
  inperson_price_dollars?: number;
  paid_description?: string;
  paid_video_link?: string;
  paid_start_date?: string;
  paid_end_date?: string;
  contact?: string;
  available_seats: number;
  proofreading: ProofreadingEntry[];
}

interface CourseLocalized {
  name: string;
  goal: string;
  objectives?: string[];
}

interface Part {
  partId: string;
  title: string;
  chapters: Chapter[];
}

interface Chapter {
  partId: string;
  chapterId: string;
  title: string;
  sections: string[];
  raw_content: string;
  professors: string[];
  releasePlace: string | null;
  isOnline: boolean;
  isInPerson: boolean;
  isCourseReview: boolean;
  isCourseExam: boolean;
  isCourseConclusion: boolean;
  startDate: string | null;
  endDate: string | null;
  timeZone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  addressLine3: string | null;
  liveUrl: string | null;
  chatUrl: string | null;
  availableSeats: number | null;
  remainingSeats: number | null;
  liveLanguage: string | null;
}

const extractData = (token: Token, type: string) => {
  if (token.type === 'paragraph' && token.tokens) {
    for (const [index, t] of token.tokens.entries()) {
      if (
        t.raw === `<${type}>` &&
        token.tokens.at(index + 2)?.raw === `</${type}>`
      ) {
        const res = token.tokens.at(index + 1)?.raw;
        if (res) {
          return res;
        }
      }
    }
  }

  return null;
};

const extractParts = (markdown: string): Part[] => {
  const tokens = marked.lexer(markdown);
  const parts: Part[] = [];

  for (const token of tokens) {
    if (token.type === 'heading' && token.depth === 1) {
      parts.push({
        partId: '',
        title: token.text as string,
        chapters: [],
      });
    } else if (parts.length > 0) {
      const currentPart = parts.at(-1)!;

      const partId = extractData(token, 'partId');
      if (partId !== null) {
        currentPart.partId = partId;
      }

      if (token.type === 'heading' && token.depth === 2) {
        currentPart.chapters.push({
          chapterId: '',
          partId: currentPart.partId,
          title: token.text as string,
          sections: [],
          raw_content: '',
          professors: [],
          releasePlace: '',
          isOnline: false,
          isInPerson: false,
          isCourseReview: false,
          isCourseExam: false,
          isCourseConclusion: false,
          startDate: null,
          endDate: null,
          addressLine1: '',
          addressLine2: '',
          addressLine3: '',
          timeZone: '',
          liveUrl: '',
          chatUrl: '',
          availableSeats: -1,
          remainingSeats: -1,
          liveLanguage: '',
        });
      } else if (currentPart.chapters.length > 0) {
        const currentChapter = currentPart.chapters.at(-1)!;

        if (token.type === 'heading' && token.depth === 3) {
          currentChapter.sections.push(token.text as string);
        }

        if (token.raw.startsWith('<')) {
          const chapterId = extractData(token, 'chapterId');
          if (chapterId !== null) {
            currentChapter.chapterId = chapterId;
          }
          currentChapter.partId = currentPart.partId;
          currentChapter.releasePlace = extractData(token, 'releasePlace');
          currentChapter.isInPerson =
            extractData(token, 'isInPerson') === 'true';
          currentChapter.isOnline = extractData(token, 'isOnline') === 'true';
          currentChapter.isCourseReview =
            extractData(token, 'isCourseReview') === 'true';
          currentChapter.isCourseExam =
            extractData(token, 'isCourseExam') === 'true';
          currentChapter.isCourseConclusion =
            extractData(token, 'isCourseConclusion') === 'true';
          currentChapter.startDate = extractData(token, 'startDate');
          currentChapter.endDate = extractData(token, 'endDate');
          currentChapter.timeZone = extractData(token, 'timeZone');
          currentChapter.addressLine1 = extractData(token, 'addressLine1');
          currentChapter.addressLine2 = extractData(token, 'addressLine2');
          currentChapter.addressLine3 = extractData(token, 'addressLine3');
          currentChapter.liveUrl = extractData(token, 'liveUrl');
          currentChapter.chatUrl = extractData(token, 'chatUrl');
          const availableSeats = extractData(token, 'availableSeats');
          if (availableSeats) {
            currentChapter.availableSeats = +availableSeats;
            currentChapter.remainingSeats = +availableSeats;
          }
          currentChapter.liveLanguage = extractData(token, 'liveLanguage');

          const professor = extractData(token, 'professor');
          if (professor) {
            currentChapter.professors.push(professor);
          }

          const tagsToRemove = [
            'chapterId',
            'professor',
            'releasePlace',
            'isOnline',
            'isInPerson',
            'isCourseReview',
            'isCourseExam',
            'isCourseConclusion',
            'startDate',
            'endDate',
            'timeZone',
            'addressLine1',
            'addressLine2',
            'addressLine3',
            'liveUrl',
            'chatUrl',
            'availableSeats',
            'liveLanguage',
          ];

          const regex = new RegExp(
            tagsToRemove.map((tag) => `<${tag}>.*</${tag}>`).join('|'),
            'gm',
          );

          token.raw = token.raw.replaceAll(regex, '');
        }

        currentChapter.raw_content += token.raw;
      }
    }
  }

  return parts;
};

export const createUpdateCourses = ({ postgres }: Dependencies) => {
  return async (course: ChangedCourse, errors: string[]) => {
    const { main, files } = separateContentFiles(course, 'course.yml');

    return postgres
      .begin(async (transaction) => {
        try {
          if (main && main.kind !== 'removed') {
            // Remove all professors, reinsert them just after
            await transaction`
                DELETE FROM content.course_professors
                WHERE course_id = ${course.id}
              `;

            await transaction`
                DELETE FROM content.course_chapters_localized_professors
                WHERE course_id = ${course.id}
              `;

            // Only get the tags from the main resource file
            const parsedCourse = yamlToObject<CourseMain>(main.data);
            if (parsedCourse.requires_payment === null) {
              parsedCourse.requires_payment = false;
            }

            const startDateTimestamp = convertStringToTimestamp(
              parsedCourse.paid_start_date
                ? parsedCourse.paid_start_date.toString()
                : '20220101',
            );
            if (parsedCourse.requires_payment) {
              console.log(
                '-- Sync procedure: StartDateTimestamp',
                startDateTimestamp,
              );
            }
            const endDateTimestamp = convertStringToTimestamp(
              parsedCourse.paid_end_date
                ? parsedCourse.paid_end_date.toString()
                : '20220101',
            );

            const lastUpdated = course.files
              .filter(
                (file): file is ModifiedFile | RenamedFile =>
                  file.kind !== 'removed',
              )
              .sort((a, b) => b.time - a.time)[0];

            if (!parsedCourse.format) {
              parsedCourse.format = 'online';
            }

            const result = await transaction<Course[]>`
                INSERT INTO content.courses (id, level, hours, topic, subtopic, original_language, requires_payment, format, online_price_dollars, inperson_price_dollars,
                  paid_description, paid_video_link, paid_start_date, paid_end_date, contact, available_seats, remaining_seats,
                  last_updated, last_commit, last_sync)
                VALUES (
                  ${course.id},
                  ${parsedCourse.level},
                  ${parsedCourse.hours},
                  ${parsedCourse.topic},
                  ${parsedCourse.subtopic},
                  ${parsedCourse.original_language},
                  ${parsedCourse.requires_payment === true ? true : false},
                  ${parsedCourse.format},
                  ${parsedCourse.online_price_dollars},
                  ${parsedCourse.inperson_price_dollars},
                  ${parsedCourse.paid_description},
                  ${parsedCourse.paid_video_link},
                  ${startDateTimestamp},
                  ${endDateTimestamp},
                  ${parsedCourse.contact},
                  ${parsedCourse.available_seats},
                  ${parsedCourse.available_seats},
                  ${lastUpdated.time},
                  ${lastUpdated.commit},
                  NOW()
                )
                ON CONFLICT (id) DO UPDATE SET
                  level = EXCLUDED.level,
                  hours = EXCLUDED.hours,
                  topic = EXCLUDED.topic,
                  subtopic = EXCLUDED.subtopic,
                  original_language = EXCLUDED.original_language,
                  requires_payment = EXCLUDED.requires_payment,
                  format = EXCLUDED.format,
                  online_price_dollars = EXCLUDED.online_price_dollars,
                  inperson_price_dollars = EXCLUDED.inperson_price_dollars,
                  paid_description = EXCLUDED.paid_description,
                  paid_video_link = EXCLUDED.paid_video_link,
                  paid_start_date = EXCLUDED.paid_start_date,
                  paid_end_date = EXCLUDED.paid_end_date,
                  contact = EXCLUDED.contact,
                  available_seats = EXCLUDED.available_seats,
                  remaining_seats = EXCLUDED.remaining_seats,
                  last_updated = EXCLUDED.last_updated,
                  last_commit = EXCLUDED.last_commit,
                  last_sync = NOW()
                RETURNING *
              `.then(firstRow);

            if (!result) {
              throw new Error('Could not insert course');
            }

            await transaction`
                INSERT INTO content.contributors ${transaction(
                  parsedCourse.professors.map((professor) => ({
                    id: professor,
                  })),
                )}
                ON CONFLICT DO NOTHING
              `;

            await transaction`
                INSERT INTO content.course_professors (course_id, contributor_id)
                SELECT
                  ${result.id},
                  id FROM content.contributors WHERE id = ANY(${parsedCourse.professors})
                ON CONFLICT DO NOTHING
              `;

            // If the resource has tags, insert them into the tags table and link them to the resource
            if (parsedCourse.tags && parsedCourse.tags?.length > 0) {
              await transaction`
                  INSERT INTO content.tags ${transaction(
                    parsedCourse.tags.map((tag) => ({
                      name: tag.toLowerCase(),
                    })),
                  )}
                  ON CONFLICT (name) DO NOTHING
                `;

              await transaction`
                  INSERT INTO content.course_tags (course_id, tag_id)
                  SELECT
                    ${result.id},
                    id FROM content.tags WHERE name = ANY(${parsedCourse.tags})
                  ON CONFLICT DO NOTHING
                `;
            }

            // If the resource has proofreads
            if (parsedCourse.proofreading) {
              for (const p of parsedCourse.proofreading) {
                const proofreadResult = await transaction<Proofreading[]>`
                  INSERT INTO content.proofreading (course_id, language, last_contribution_date, urgency, reward)
                  VALUES (${course.id}, ${p.language.toLowerCase()}, ${p.last_contribution_date}, ${p.urgency}, ${p.reward})
                  RETURNING *;
                `.then(firstRow);

                if (p.contributors_id) {
                  for (const [index, contrib] of p.contributors_id.entries()) {
                    await transaction`INSERT INTO content.contributors (id) VALUES (${contrib}) ON CONFLICT DO NOTHING`;
                    await transaction`
                      INSERT INTO content.proofreading_contributor(proofreading_id, contributor_id, "order")
                      VALUES (${proofreadResult?.id},${contrib},${index})
                    `;
                  }
                }
              }
            }
          }
        } catch (error) {
          errors.push(
            `Error processing file(courses1) ${course?.fullPath}: ${error}`,
          );
          return;
        }

        for (const file of files) {
          try {
            if (file.kind === 'removed') {
              continue;
            }

            if (!file.language) {
              console.warn(
                `Course file ${file.path} does not have a language, skipping...`,
              );
              continue;
            }

            const header = matter(file.data, {
              excerpt: true,
              excerpt_separator: '+++',
            });

            const data = header.data as CourseLocalized;

            if (header.excerpt) {
              header.content = header.content.replace(
                `${header.excerpt}+++\n`,
                '',
              );
              header.excerpt = header.excerpt.trim();
            }

            const parts = extractParts(header.content);

            await transaction`
              INSERT INTO content.courses_localized (
                course_id, language, name, goal, objectives, raw_description
              )
              VALUES (
                ${course.id},
                ${file.language},
                ${data.name},
                ${data.goal?.trim()},
                ${data.objectives || []},
                ${header.excerpt}
              )
              ON CONFLICT (course_id, language) DO UPDATE SET
                name = EXCLUDED.name,
                goal = EXCLUDED.goal,
                objectives = EXCLUDED.objectives,
                raw_description = EXCLUDED.raw_description
              `;

            if (parts.length > 0) {
              await transaction`
                INSERT INTO content.course_parts ${transaction(
                  parts.map((p, index) => {
                    if (!uuidValidate(p.partId)) {
                      throw new Error(
                        `Part id (uuid) missing or invalid: ${p.partId} on part ${p.title}`,
                      );
                    }
                    return {
                      course_id: course.id,
                      part_index: index + 1,
                      part_id: p.partId,
                    };
                  }),
                )}
                ON CONFLICT (course_id, part_id) DO UPDATE SET
                part_index = EXCLUDED.part_index,
                  last_sync = NOW()
                RETURNING *
              `;
              /// TODO change to part_id (here and everywhere on ON CONFLICTS)
              await transaction`
                INSERT INTO content.course_parts_localized ${transaction(
                  parts.map((part) => ({
                    course_id: course.id,
                    part_id: part.partId,
                    language: file.language,
                    title: part.title,
                  })),
                  'course_id',
                  'part_id',
                  'language',
                  'title',
                )}
                ON CONFLICT (course_id, language, part_id)
                DO UPDATE SET
                  title = EXCLUDED.title,
                  last_sync = NOW()
              `;

              // if there is at least one chapter across all parts
              if (parts.some((part) => part.chapters.length > 0)) {
                await transaction`
                INSERT INTO content.course_chapters ${transaction(
                  parts.flatMap((part) =>
                    part.chapters.map((c, chapterIndex) => {
                      if (!uuidValidate(c.chapterId)) {
                        throw new Error(
                          `Chapter id (uuid) missing or invalid: ${c.chapterId} on chapter ${c.title}`,
                        );
                      }
                      return {
                        course_id: course.id,
                        part_id: part.partId,
                        chapter_index: chapterIndex + 1,
                        chapter_id: c.chapterId,
                      };
                    }),
                  ),
                )}
                ON CONFLICT (chapter_id)
                DO UPDATE SET
                  chapter_index = EXCLUDED.chapter_index,
                  part_id = EXCLUDED.part_id,
                  last_sync = NOW()
                RETURNING *
              `;

                const formattedChapters = parts.flatMap((part) =>
                  part.chapters.map((chapter) => {
                    return {
                      course_id: course.id,
                      chapter_id: chapter.chapterId,
                      language: file.language,
                      title: chapter.title,
                      sections: chapter.sections,
                      raw_content: chapter.raw_content.trim(),
                      release_place: chapter.releasePlace,
                      is_online: chapter.isOnline,
                      is_in_person: chapter.isInPerson,
                      is_course_review: chapter.isCourseReview,
                      is_course_exam: chapter.isCourseExam,
                      is_course_conclusion: chapter.isCourseConclusion,
                      start_date: chapter.startDate,
                      end_date: chapter.endDate,
                      timezone: chapter.timeZone,
                      address_line_1: chapter.addressLine1,
                      address_line_2: chapter.addressLine2,
                      address_line_3: chapter.addressLine3,
                      live_url: chapter.liveUrl,
                      chat_url: chapter.chatUrl,
                      available_seats: chapter.availableSeats,
                      remaining_seats: chapter.availableSeats,
                      live_language: chapter.liveLanguage,
                    };
                  }),
                );

                await transaction`
                  INSERT INTO content.course_chapters_localized ${transaction(formattedChapters)}
                  ON CONFLICT (course_id, chapter_id, language) DO UPDATE SET
                    title = EXCLUDED.title,
                    sections = EXCLUDED.sections,
                    raw_content = EXCLUDED.raw_content,
                    release_place = EXCLUDED.release_place,
                    is_online = EXCLUDED.is_online,
                    is_in_person = EXCLUDED.is_in_person,
                    is_course_review = EXCLUDED.is_course_review,
                    is_course_exam = EXCLUDED.is_course_exam,
                    is_course_conclusion = EXCLUDED.is_course_conclusion,
                    start_date = EXCLUDED.start_date,
                    end_date = EXCLUDED.end_date,
                    timezone = EXCLUDED.timezone,
                    address_line_1 = EXCLUDED.address_line_1,
                    address_line_2 = EXCLUDED.address_line_2,
                    address_line_3 = EXCLUDED.address_line_3,
                    live_url = EXCLUDED.live_url,
                    chat_url = EXCLUDED.chat_url,
                    available_seats = EXCLUDED.available_seats,
                    live_language = EXCLUDED.live_language,
                    last_sync = NOW()
                `;

                const formatedChapters2 = parts.flatMap((part, partIndex) =>
                  part.chapters.map((chapter, chapterIndex) => ({
                    course_id: course.id,
                    chapter_id: chapter.chapterId,
                    part: partIndex + 1,
                    chapter: chapterIndex + 1,
                    language: file.language,
                    title: chapter.title,
                    sections: chapter.sections,
                    raw_content: chapter.raw_content.trim(),
                    professors: chapter.professors,
                  })),
                );

                for (const chapter of formatedChapters2) {
                  for (const professor of chapter.professors) {
                    await transaction`INSERT INTO content.contributors (id) VALUES (${professor}) ON CONFLICT DO NOTHING`;
                    await transaction`
                        INSERT INTO content.course_chapters_localized_professors (course_id, chapter_id, language, contributor_id)
                        VALUES (${course.id}, ${chapter.chapter_id}, ${chapter.language}, ${professor})
                        ON CONFLICT DO NOTHING
                  `;
                  }
                }
              } else {
                console.warn(
                  `Course file ${course.id} ${file.path} does not have any chapters, skipping...`,
                );
              }
            }
          } catch (error) {
            errors.push(
              `Error processing file(courses2) ${course.fullPath} ${file?.path}: ${error}`,
            );
          }
        }
      })
      .catch(() => {
        return;
      });
  };
};

export const createDeleteCourses = ({ postgres }: Dependencies) => {
  return async (sync_date: number, errors: string[]) => {
    try {
      await postgres.exec(
        sql`DELETE FROM content.course_chapters_localized WHERE last_sync < ${sync_date}`,
      );

      await postgres.exec(
        sql`DELETE FROM content.course_chapters WHERE last_sync < ${sync_date}`,
      );

      await postgres.exec(
        sql`DELETE FROM content.course_parts_localized WHERE last_sync < ${sync_date}`,
      );

      await postgres.exec(
        sql`DELETE FROM content.course_parts WHERE last_sync < ${sync_date}`,
      );

      await postgres.exec(
        sql`DELETE FROM content.courses WHERE last_sync < ${sync_date}`,
      );
    } catch (error) {
      errors.push(`Error deleting courses : ${error}`);
    }
  };
};
