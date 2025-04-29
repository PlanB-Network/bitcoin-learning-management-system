import matter from 'gray-matter';
import type { Token } from 'marked';
import { marked } from 'marked';
import { validate as uuidValidate } from 'uuid';

import { firstRow, sql } from '@blms/database';
import type {
  ChangedAsset,
  ChangedFile,
  Course,
  Proofreading,
  VideosLocalized,
} from '@blms/types';

import type { Language } from '../../const.js';
import type { Dependencies } from '../../dependencies.js';
import type { ChangedContent, ProofreadingEntry } from '../../types.js';
import {
  getContentType,
  getRelativePath,
  separateContentFiles,
  yamlToObject,
} from '../../utils.js';

// --- Constants ---
const COURSE_MAIN_FILE = 'course.yml';
const COURSE_LOGO_FILE = 'logo.webp';
const PRESENTATION_FILE = 'presentation';
const EXCERPT_SEPARATOR = '+++';

interface CourseDetails {
  index: string;
  path: string;
  fullPath: string;
  language?: Language;
}

export interface ChangedCourse extends ChangedContent {
  index: string;
}

interface CourseMain {
  id: string;
  is_archived: boolean;
  project_id?: string;
  level: string;
  hours: number;
  topic: string;
  subtopic: string;
  original_language: string;
  professors_id: string[];
  tags?: string[];
  requires_payment: boolean;
  payment_expiration_date?: number;
  published_at?: string;
  format: string;
  teaching_format: string;
  online_price_dollars?: number;
  inperson_price_dollars?: number;
  paid_description?: string;
  paid_video_link?: string;
  start_date?: number;
  end_date?: number;
  contact?: string;
  available_seats: number;
  proofreading: ProofreadingEntry[];
  is_planb_school?: boolean;
  is_gdpr_compliance: boolean;
  custom_tc_disclaimer: string;
  test_only?: boolean;
  videos?: {
    id: string;
    youtube?: { [key: string]: string };
    rumble?: { [key: string]: string };
  }[];
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
  professorIds: string[];
  releasePlace: string | null;
  isOnline: boolean;
  isInPerson: boolean;
  isCourseReview: boolean;
  isCourseExam: boolean;
  isCourseConclusion: boolean;
  isGdprCompliance: boolean;
  customTcDisclaimer: string | null;
  startDate: string | null;
  endDate: string | null;
  releaseDate: string | null;
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

export const groupByCourse = (
  files: ChangedFile[] | ChangedAsset[],
  errors: string[],
) => {
  const groupedCourses = new Map<string, ChangedCourse>();

  for (const file of files) {
    if (
      getContentType(file.path) !== 'courses' ||
      file.path.includes('quizz')
    ) {
      continue;
    }

    try {
      const {
        index,
        path: coursePath,
        fullPath,
        language,
      } = parseDetailsFromPath(file.path);

      const course: ChangedCourse = groupedCourses.get(coursePath) || {
        type: 'courses',
        index,
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

const parseDetailsFromPath = (path: string): CourseDetails => {
  const pathElements = path.split('/');

  // Expecting at least "courses/courseIndex/language.md" or "courses/courseIndex/course.yml"
  if (pathElements.length < 3 || pathElements[0].toLowerCase() !== 'courses') {
    throw new Error(
      `Invalid course path structure: ${path}. Expected "courses/slug/..."`,
    );
  }

  return {
    index: pathElements[1],
    path: pathElements.slice(0, 2).join('/'),
    fullPath: path,
    language: pathElements[2].replace(/\..*/, '').toLowerCase() as Language,
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
          professorIds: [],
          releasePlace: '',
          isOnline: false,
          isInPerson: false,
          isCourseReview: false,
          isCourseExam: false,
          isCourseConclusion: false,
          isGdprCompliance: false,
          customTcDisclaimer: '',
          startDate: null,
          endDate: null,
          releaseDate: null,
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
          currentChapter.isGdprCompliance =
            extractData(token, 'isGdprCompliance') === 'true';
          currentChapter.customTcDisclaimer = extractData(
            token,
            'customTcDisclaimer',
          );

          currentChapter.startDate = extractData(token, 'startDate');
          currentChapter.endDate = extractData(token, 'endDate');
          currentChapter.releaseDate = extractData(token, 'releaseDate');
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

          const chapterProfessorId = extractData(token, 'professorId');
          if (chapterProfessorId) {
            currentChapter.professorIds.push(chapterProfessorId);
          }

          const tagsToRemove = [
            'chapterId',
            'professor',
            'professorId',
            'releasePlace',
            'isOnline',
            'isInPerson',
            'isCourseReview',
            'isCourseExam',
            'isCourseConclusion',
            'isGdprCompliance',
            'customTcDisclaimer',
            'startDate',
            'endDate',
            'releaseDate',
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
  return async (
    course: ChangedCourse,
    assets: ChangedCourse | undefined,
    errors: string[],
  ) => {
    const { main, files } = separateContentFiles(course, COURSE_MAIN_FILE);
    if (!main) return;

    let presentationMarkdown = null;
    const presentationIndex = files.findIndex(
      (file) => file.language === PRESENTATION_FILE,
    );
    if (presentationIndex !== -1) {
      const presentationFile = files.splice(presentationIndex, 1)[0];
      const header = matter(await presentationFile.load(), { excerpt: false });
      presentationMarkdown = header.content.trim();
    }

    const logo = assets?.files.find((f) => f.path === COURSE_LOGO_FILE);
    const hasLogo = logo !== undefined;

    let courseId: string;

    return postgres
      .begin(async (transaction) => {
        try {
          let parsedCourse = await yamlToObject<CourseMain>(main);

          if (
            parsedCourse.test_only === true &&
            process.env.PLANB_ENVIRONMENT === 'mainnet'
          ) {
            console.log('-- Sync: Ignore course', course.index);
            return;
          }

          courseId = parsedCourse.id;

          const defaults = {
            is_archived: false,
            requires_payment: false,
            is_planb_school: false,
            is_gdpr_compliance: false,
            format: 'online',
            teaching_format: 'self_paced',
          };

          parsedCourse = { ...defaults, ...parsedCourse };

          const lastUpdated = course.files.sort((a, b) => b.time - a.time)[0];

          // Remove all professors, reinsert them just after
          await transaction`
                    DELETE FROM content.course_professors
                    WHERE course_id = ${parsedCourse.id}
                  `;

          await transaction`
                    DELETE FROM content.course_chapters_localized_professors
                    WHERE course_id = ${parsedCourse.id}
                  `;

          const insertedCourse = await transaction<Course[]>`
                INSERT INTO content.courses
                  ( id,
                   index,
                   project_id,
                   is_archived,
                   level,
                   hours,
                   topic,
                   subtopic,
                   original_language,
                   requires_payment,
                   payment_expiration_date,
                   published_at,
                   format,
                   teaching_format,
                   online_price_dollars,
                   inperson_price_dollars,
                   paid_description,
                   paid_video_link,
                   start_date,
                   end_date,
                   contact,
                   available_seats,
                   remaining_seats,
                   is_planb_school,
                   presentation_markdown,
                   has_logo,
                   is_gdpr_compliance,
                   custom_tc_disclaimer,
                   last_updated,
                   last_commit,
                   last_sync
                  )
                VALUES (
                  ${parsedCourse.id},
                  ${course.index},
                  ${parsedCourse.project_id},
                  ${parsedCourse.is_archived === true},
                  ${parsedCourse.level},
                  ${parsedCourse.hours},
                  ${parsedCourse.topic},
                  ${parsedCourse.subtopic},
                  ${parsedCourse.original_language},
                  ${parsedCourse.requires_payment === true},
                  ${parsedCourse.payment_expiration_date},
                  ${parsedCourse.published_at},
                  ${parsedCourse.format},
                  ${parsedCourse.teaching_format},
                  ${parsedCourse.online_price_dollars},
                  ${parsedCourse.inperson_price_dollars},
                  ${parsedCourse.paid_description},
                  ${parsedCourse.paid_video_link},
                  ${parsedCourse.start_date},
                  ${parsedCourse.end_date},
                  ${parsedCourse.contact},
                  ${parsedCourse.available_seats},
                  ${parsedCourse.available_seats},
                  ${parsedCourse.is_planb_school},
                  ${presentationMarkdown},
                  ${hasLogo},
                  ${parsedCourse.is_gdpr_compliance},
                  ${parsedCourse.custom_tc_disclaimer},
                  ${lastUpdated.time},
                  ${lastUpdated.commit},
                  NOW()
                )
                ON CONFLICT (id) DO UPDATE SET
                  index = EXCLUDED.index,
                  project_id = EXCLUDED.project_id,
                  is_archived = EXCLUDED.is_archived,
                  level = EXCLUDED.level,
                  hours = EXCLUDED.hours,
                  topic = EXCLUDED.topic,
                  subtopic = EXCLUDED.subtopic,
                  original_language = EXCLUDED.original_language,
                  requires_payment = EXCLUDED.requires_payment,
                  payment_expiration_date = EXCLUDED.payment_expiration_date,
                  published_at = EXCLUDED.published_at,
                  format = EXCLUDED.format,
                  teaching_format = EXCLUDED.teaching_format,
                  online_price_dollars = EXCLUDED.online_price_dollars,
                  inperson_price_dollars = EXCLUDED.inperson_price_dollars,
                  paid_description = EXCLUDED.paid_description,
                  paid_video_link = EXCLUDED.paid_video_link,
                  start_date = EXCLUDED.start_date,
                  end_date = EXCLUDED.end_date,
                  contact = EXCLUDED.contact,
                  available_seats = EXCLUDED.available_seats,
                  remaining_seats = EXCLUDED.remaining_seats,
                  is_planb_school = EXCLUDED.is_planb_school,
                  presentation_markdown = EXCLUDED.presentation_markdown,
                  has_logo = EXCLUDED.has_logo,
                  is_gdpr_compliance = EXCLUDED.is_gdpr_compliance,
                  custom_tc_disclaimer = EXCLUDED.custom_tc_disclaimer,
                  last_updated = EXCLUDED.last_updated,
                  last_commit = EXCLUDED.last_commit,
                  last_sync = NOW()
                RETURNING *
              `.then(firstRow);

          if (!insertedCourse) {
            throw new Error('Could not insert course');
          }

          if (parsedCourse.videos) {
            for (let i = 0; i < parsedCourse.videos.length; i++) {
              const currentVideo = parsedCourse.videos[i];

              // Insert video
              const insertedVideo = await transaction<VideosLocalized[]>`
                INSERT INTO content.videos
                  (
                    id,
                    course_id,
                    last_sync
                  )
                VALUES (
                  ${currentVideo.id},
                  ${parsedCourse.id},
                  NOW()
                )
                ON CONFLICT (id) DO UPDATE SET
                  course_id = EXCLUDED.course_id,
                  last_sync = NOW()
                RETURNING *
              `.then(firstRow);

              if (insertedVideo) {
                if (currentVideo.youtube) {
                  for (const [_key, value] of Object.entries(
                    currentVideo.youtube,
                  )) {
                    for (const [lang, langVideoId] of Object.entries(value)) {
                      await transaction`
                    INSERT INTO content.videos_localized (id, language, provider, id_from_provider)
                    VALUES (${insertedVideo.id}, ${lang}, 'youtube', ${langVideoId})
                    ON CONFLICT (id, language) DO UPDATE SET
                      provider = EXCLUDED.provider,
                      id_from_provider = EXCLUDED.id_from_provider
                    `;
                    }
                  }
                }

                if (currentVideo.rumble) {
                  for (const [_key, value] of Object.entries(
                    currentVideo.rumble,
                  )) {
                    for (const [lang, langVideoId] of Object.entries(value)) {
                      await transaction`
                    INSERT INTO content.videos_localized (id, language, provider, id_from_provider)
                    VALUES (${insertedVideo.id}, ${lang}, 'rumble', ${langVideoId})
                    ON CONFLICT (id, language) DO UPDATE SET
                      provider = EXCLUDED.provider,
                      id_from_provider = EXCLUDED.id_from_provider
                    `;
                    }
                  }
                }
              }
            }
          }

          for (let i = 0; i < parsedCourse.professors_id.length; i++) {
            const prof = parsedCourse.professors_id[i];
            await transaction`
              INSERT INTO content.course_professors (course_id, professor_id, is_coordinator)
              VALUES(
                ${insertedCourse.id},
                ${prof},
                ${i === 0}
              )
              ON CONFLICT DO NOTHING
            `;
          }

          // If the resource has tags, insert them into the tags table and link them to the resource
          if (parsedCourse.tags && parsedCourse.tags?.length > 0) {
            const lowercaseTags = parsedCourse.tags.map((tag) =>
              tag.toLowerCase(),
            );

            await transaction`
              DELETE FROM content.course_tags WHERE course_id = ${insertedCourse.id}
             `;

            await transaction`
              INSERT INTO content.tags ${transaction(lowercaseTags.map((tag) => ({ name: tag })))}
              ON CONFLICT (name) DO NOTHING
            `;

            await transaction`
              INSERT INTO content.course_tags (course_id, tag_id)
              SELECT
                ${insertedCourse.id},
                id
                FROM content.tags
                WHERE name = ANY(${lowercaseTags})
              ON CONFLICT DO NOTHING
            `;
          }

          // If the resource has proofreads
          if (parsedCourse.proofreading) {
            for (const p of parsedCourse.proofreading) {
              const proofreadResult = await transaction<Proofreading[]>`
                  INSERT INTO content.proofreading (course_id, language, last_contribution_date, urgency, reward)
                  VALUES (${courseId}, ${p.language.toLowerCase()}, ${p.last_contribution_date}, ${p.urgency}, ${Math.round(p.reward * 100)})
                  RETURNING *;
                `.then(firstRow);

              if (p.contributor_names) {
                for (const [index, contrib] of p.contributor_names.entries()) {
                  await transaction`INSERT INTO content.contributors (id) VALUES (${contrib}) ON CONFLICT DO NOTHING`;
                  await transaction`
                      INSERT INTO content.proofreading_contributor(proofreading_id, contributor_id, "order")
                      VALUES (${proofreadResult?.id},${contrib},${index})
                    `;
                }
              }
            }
          }
        } catch (error) {
          const err = `Error processing file(courses1) ${course?.fullPath}: ${error}`;
          console.error(error);
          errors.push(err);
          return;
        }

        for (const file of files) {
          try {
            if (!file.language) {
              console.warn(
                `Course file ${file.path} does not have a language, skipping...`,
              );
              continue;
            }

            const header = matter(await file.load(), {
              excerpt: true,
              excerpt_separator: EXCERPT_SEPARATOR,
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
                ${courseId},
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
                      course_id: courseId,
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

              await transaction`
                INSERT INTO content.course_parts_localized ${transaction(
                  parts.map((part) => ({
                    course_id: courseId,
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
                        course_id: courseId,
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
                      course_id: courseId,
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
                      is_gdpr_compliance: chapter.isGdprCompliance,
                      custom_tc_disclaimer: chapter.customTcDisclaimer,
                      start_date: chapter.startDate,
                      end_date: chapter.endDate,
                      release_date: chapter.releaseDate,
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
                    is_gdpr_compliance = EXCLUDED.is_gdpr_compliance,
                    custom_tc_disclaimer = EXCLUDED.custom_tc_disclaimer,
                    start_date = EXCLUDED.start_date,
                    end_date = EXCLUDED.end_date,
                    release_date = EXCLUDED.release_date,
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

                const formattedChapters2 = parts.flatMap((part, partIndex) =>
                  part.chapters.map((chapter, chapterIndex) => ({
                    course_id: courseId,
                    chapter_id: chapter.chapterId,
                    part: partIndex + 1,
                    chapter: chapterIndex + 1,
                    language: file.language,
                    title: chapter.title,
                    sections: chapter.sections,
                    raw_content: chapter.raw_content.trim(),
                    professorIds: chapter.professorIds,
                  })),
                );

                for (const chapter of formattedChapters2) {
                  for (const professorId of chapter.professorIds) {
                    await transaction`
                      INSERT INTO content.course_chapters_localized_professors (course_id, chapter_id, language, professor_id)
                      VALUES (${courseId}, ${chapter.chapter_id}, ${chapter.language}, ${professorId})
                      ON CONFLICT DO NOTHING
                  `;
                  }
                }
              } else {
                console.warn(
                  `Course file ${course.index} ${file.path} does not have any chapters, skipping...`,
                );
              }
            }
          } catch (error) {
            errors.push(
              `Error processing file(courses2) ${course.fullPath} ${file?.path}: ${error}`,
            );
            return;
          }
        }
      })
      .catch((error) => {
        console.error('Error during transaction:', error);
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
