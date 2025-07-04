import postgres from 'postgres';

const connection = postgres({
  host: '127.0.0.1',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'postgres',
  max: 1,
});

async function checkChapterData() {
  console.log('Checking chapter data...');

  const chapters = await connection`
    SELECT cc.course_id, cc.chapter_id, ccl.title
    FROM content.course_chapters cc
    LEFT JOIN content.course_chapters_localized ccl ON ccl.chapter_id = cc.chapter_id AND ccl.language = 'en'
    WHERE cc.chapter_id = 'cf2f087b-6c6b-5037-8f98-94fc9f1d7f46'
  `;
  console.log('Chapter info:', chapters);

  console.log('Checking slides data...');
  const slides = await connection`
    SELECT * FROM content.course_translation_slides
    WHERE chapter_id = 'cf2f087b-6c6b-5037-8f98-94fc9f1d7f46'
    AND language = 'fr'
  `;
  console.log('Slides found:', slides.length);
  if (slides.length > 0) {
    console.log('First slide:', slides[0]);
  }

  console.log('Checking course translation entries...');
  const courseTranslations = await connection`
    SELECT * FROM content.course_translations
    WHERE course_id = '3ce1d37c-05ba-4f54-aa15-7586d37b2bb7'
    AND language = 'fr'
  `;
  console.log('Course translations:', courseTranslations);

  console.log('Checking course translation chapters...');
  const chapterTranslations = await connection`
    SELECT * FROM content.course_translation_chapters
    WHERE course_id = '3ce1d37c-05ba-4f54-aa15-7586d37b2bb7'
    AND chapter_id = 'cf2f087b-6c6b-5037-8f98-94fc9f1d7f46'
    AND language = 'fr'
  `;
  console.log('Chapter translations:', chapterTranslations);

  // Test the exact query used by getChapterTranslationContextQuery
  console.log('\nTesting the exact context query...');
  const courseId = '3ce1d37c-05ba-4f54-aa15-7586d37b2bb7';
  const chapterId = 'cf2f087b-6c6b-5037-8f98-94fc9f1d7f46';
  const language = 'fr';

  const contextResult = await connection`
    SELECT
      c.id AS "courseId",
      c.index AS "courseIndex",
      cl_en.name AS "courseName",
      cp.part_id AS "partId",
      cp.part_index AS "partIndex",
      cpl_en.title AS "partTitle",
      cc.chapter_id AS "chapterId",
      cc.chapter_index AS "chapterIndex",
      ccl_en.title AS "chapterTitle",
      ct.status AS "translationStatus",
      ctc.status AS "chapterTranslationStatus"
    FROM content.courses c
    JOIN content.course_chapters cc ON cc.course_id = c.id
    JOIN content.course_parts cp ON cp.part_id = cc.part_id
    LEFT JOIN content.courses_localized cl_en ON cl_en.course_id = c.id AND cl_en.language = 'en'
    LEFT JOIN content.course_parts_localized cpl_en ON cpl_en.part_id = cp.part_id AND cpl_en.language = 'en'
    LEFT JOIN content.course_chapters_localized ccl_en ON ccl_en.chapter_id = cc.chapter_id AND ccl_en.language = 'en'
    LEFT JOIN content.course_translations ct ON ct.course_id = c.id AND ct.language = LOWER(${language})
    LEFT JOIN content.course_translation_chapters ctc ON ctc.course_id = c.id
      AND ctc.language = LOWER(${language})
      AND ctc.chapter_id = cc.chapter_id
    WHERE c.id = ${courseId}
      AND cc.chapter_id = ${chapterId}
    LIMIT 1
  `;

  console.log('Context query result:', contextResult);

  await connection.end();
}

checkChapterData().catch(console.error);
