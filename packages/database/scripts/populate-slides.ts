import { parseArgs } from 'node:util';
import postgres from 'postgres';

const {
  values: { database: databaseName },
} = parseArgs({
  options: {
    database: {
      type: 'string',
    },
  },
});

const connection = postgres({
  host: process.env.POSTGRES_HOST || '127.0.0.1',
  port: Number(process.env.POSTGRES_PORT) || 5432,
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: databaseName ?? (process.env.POSTGRES_DB || 'postgres'),
  max: 1,
  onnotice: (notice) => console.log(`Postgres NOTICE: ${notice.message}`),
});

// Fake slide content arrays
const fakeSlideTopics = [
  'Introduction to Bitcoin',
  'Understanding Blockchain',
  'Bitcoin Mining Basics',
  'Cryptographic Fundamentals',
  'Transaction Structure',
  'Digital Signatures',
  'Hash Functions',
  'Merkle Trees',
  'Proof of Work',
  'Network Consensus',
  'Wallet Security',
  'Private Keys',
  'Public Key Cryptography',
  'Bitcoin Script',
  'Lightning Network',
];

const fakeOriginalContent = [
  'This slide introduces the fundamental concepts of Bitcoin and its revolutionary impact on digital finance.',
  'Learn about the underlying blockchain technology that powers Bitcoin and other cryptocurrencies.',
  'Understand how Bitcoin mining works and its role in securing the network.',
  'Explore the cryptographic principles that make Bitcoin secure and trustworthy.',
  'Dive deep into Bitcoin transaction structure and how value is transferred.',
  'Master the concept of digital signatures and their importance in Bitcoin.',
  'Understand hash functions and their critical role in Bitcoin security.',
  'Learn about Merkle trees and how they enable efficient transaction verification.',
  'Explore the proof-of-work consensus mechanism that secures Bitcoin.',
  'Understand how network consensus is achieved in a decentralized system.',
  'Learn essential wallet security practices to protect your Bitcoin.',
  'Master the management and security of Bitcoin private keys.',
  'Understand public key cryptography and its application in Bitcoin.',
  'Explore Bitcoin Script and its role in transaction validation.',
  'Discover the Lightning Network and Bitcoin layer-2 solutions.',
];

const fakeResourcePaths = [
  's3://course-slides/btc-intro/slides/',
  's3://course-slides/blockchain-basics/slides/',
  's3://course-slides/mining-fundamentals/slides/',
  's3://course-slides/cryptography/slides/',
  's3://course-slides/transactions/slides/',
  's3://course-slides/signatures/slides/',
  's3://course-slides/hashing/slides/',
  's3://course-slides/merkle-trees/slides/',
  's3://course-slides/proof-of-work/slides/',
  's3://course-slides/consensus/slides/',
  's3://course-slides/wallet-security/slides/',
  's3://course-slides/private-keys/slides/',
  's3://course-slides/public-key-crypto/slides/',
  's3://course-slides/bitcoin-script/slides/',
  's3://course-slides/lightning-network/slides/',
];

// RGB-specific content for CSV402
const rgbSlideTopics = [
  'Introduction to RGB Protocol',
  'Distributed Computing Concepts',
  'Commitment Layer Architecture',
  'Smart Contract States',
  'RGB Contract Operations',
  'RGB Glossary & Terminology',
  'Implementing RGB Contracts',
  'Contract Transfer Mechanisms',
  'Smart Contract Development',
  'RGB Lightning Integration',
  'DIBA & Bitmask Project',
  'Bitfinex RGB Implementation',
  'RGB Lightning Node (RLN)',
  'RGB Course Review',
  'RGB Protocol Conclusion',
];

const rgbOriginalContent = [
  'Welcome to the RGB Protocol course. This comprehensive training covers the fundamentals of client-side validation and smart contracts on Bitcoin.',
  'Understanding distributed computing principles is essential for grasping how RGB achieves scalability and privacy.',
  'The commitment layer forms the foundation of RGB, enabling secure and private smart contract execution.',
  'Learn how RGB smart contracts maintain state and transition between different states securely.',
  'Explore the various operations available in RGB contracts and how to implement them effectively.',
  'Master the essential terminology and concepts used throughout the RGB ecosystem.',
  'Practical implementation of RGB contracts using the latest tools and libraries.',
  'Understanding how contract transfers work in RGB and their advantages over traditional approaches.',
  'Learn to draft and deploy smart contracts using RGB protocol specifications.',
  'Discover how RGB integrates with the Lightning Network for enhanced functionality.',
  'Explore the DIBA project and Bitmask implementation for practical RGB applications.',
  "Understanding Bitfinex's approach to implementing RGB in production environments.",
  'Learn about RGB Lightning Node and its role in the RGB ecosystem.',
  'Comprehensive review of key concepts and practical applications covered in the course.',
  'Course conclusion with next steps and advanced topics in RGB development.',
];

const translationStatuses = [
  'todo',
  'in_progress',
  'ready_for_review',
  'under_review',
];

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateUuid(): string {
  return crypto.randomUUID();
}

interface CourseStructure {
  courseId: string;
  courseName: string;
  parts: Array<{
    partId: string;
    partTitle: string;
    chapters: Array<{
      chapterId: string;
      chapterTitle: string;
    }>;
  }>;
}

// Real CSV402 course data
function getCSV402CourseStructure(): CourseStructure {
  return {
    courseId: '3ce1d37c-05ba-4f54-aa15-7586d37b2bb7',
    courseName: 'RGB Protocol Development',
    parts: [
      {
        partId: 'c6f7a70f-d894-595f-8c0a-b54759778839',
        partTitle: 'Introduction',
        chapters: [
          {
            chapterId: 'cf2f087b-6c6b-5037-8f98-94fc9f1d7f46',
            chapterTitle: 'Course presentation',
          },
        ],
      },
      {
        partId: '80e797ee-3f33-599f-ab82-e82eeee08219',
        partTitle: 'RGB in theory',
        chapters: [
          {
            chapterId: 'f52f8af5-5d7c-588b-b56d-99b97176204b',
            chapterTitle: 'Introduction to distributed computing concepts',
          },
          {
            chapterId: 'cc2fe85a-9cc7-5b8c-a00a-c0a867241061',
            chapterTitle: 'The commitment layer',
          },
          {
            chapterId: '04a9569f-3563-5382-bf53-0c7069343ba0',
            chapterTitle: 'Introduction to smart contracts and their states',
          },
          {
            chapterId: '78c44e88-50c4-5ec4-befe-456c1a9f080b',
            chapterTitle: 'RGB contract operations',
          },
          {
            chapterId: '545e16a4-3cca-44a3-9fd5-dbc5868abf97',
            chapterTitle: 'RGB Glossary',
          },
        ],
      },
      {
        partId: '148a7436-d079-56d9-be08-aaa4c14c6b3a',
        partTitle: 'Programming on RGB',
        chapters: [
          {
            chapterId: '8333ea5f-51c7-5dd5-b1d7-47d491e58e51',
            chapterTitle: 'Implementing RGB contracts',
          },
          {
            chapterId: 'f043a307-d420-5752-b0d7-ebfd845802c0',
            chapterTitle: 'Contract transfers',
          },
          {
            chapterId: '0e0a645c-0049-588d-8965-b8c536590cc9',
            chapterTitle: 'Drafting smart contracts',
          },
          {
            chapterId: '0962980a-8f94-5d0f-9cd0-43d7f884a01d',
            chapterTitle: 'RGB on the Lightning Network',
          },
        ],
      },
      {
        partId: '3b4b0d66-0c1b-505a-b5ca-4b2e57dd73c2',
        partTitle: 'Building on RGB',
        chapters: [
          {
            chapterId: 'dc92a5e8-ed93-5a3f-bcd0-d433932842f4',
            chapterTitle: 'DIBA and the Bitmask project',
          },
          {
            chapterId: 'd4d80e07-5eac-5b29-a93a-123180e97047',
            chapterTitle: "Bitfinex's work on RGB",
          },
          {
            chapterId: 'ecaabe32-20ba-5f8c-8ca1-a3f095792958',
            chapterTitle: 'RLN - RGB Lightning Node',
          },
        ],
      },
      {
        partId: 'b0baebfc-d146-5938-849a-f835fafb386f',
        partTitle: 'Final Section',
        chapters: [
          {
            chapterId: '0217e8b0-942a-5fee-bd91-9a866551eff3',
            chapterTitle: 'Reviews & Ratings',
          },
          {
            chapterId: '0309536d-c336-56a0-869e-a8395ed8d9ae',
            chapterTitle: 'Conclusion',
          },
        ],
      },
    ],
  };
}

// Generate fake course structure data
function generateFakeCourseStructure(count = 10): CourseStructure[] {
  const courses: CourseStructure[] = [];

  for (let i = 1; i <= count; i++) {
    const courseId = `btc-course-${i.toString().padStart(3, '0')}`;
    const courseName = `Bitcoin Course ${i}: ${getRandomItem(fakeSlideTopics)}`;

    const parts = [];
    const partCount = Math.floor(Math.random() * 3) + 2; // 2-4 parts

    for (let j = 1; j <= partCount; j++) {
      const partId = generateUuid();
      const partTitle = `Part ${j}: ${getRandomItem(fakeSlideTopics)}`;

      const chapters = [];
      const chapterCount = Math.floor(Math.random() * 4) + 3; // 3-6 chapters

      for (let k = 1; k <= chapterCount; k++) {
        const chapterId = generateUuid();
        const chapterTitle = `Chapter ${k}: ${getRandomItem(fakeSlideTopics)}`;

        chapters.push({
          chapterId,
          chapterTitle,
        });
      }

      parts.push({
        partId,
        partTitle,
        chapters,
      });
    }

    courses.push({
      courseId,
      courseName,
      parts,
    });
  }

  return courses;
}

async function createCourseStructure(courses: CourseStructure[]) {
  console.log('Creating course structure...');

  for (const course of courses) {
    // Insert course
    await connection.unsafe(
      `
      INSERT INTO content.courses (
        id, "index", level, hours, topic, subtopic, original_language,
        requires_payment, format, teaching_format, is_planb_school,
        has_logo, is_gdpr_compliance, is_assignment_grading_published,
        last_updated, last_commit, last_sync,
        number_of_rating, sum_of_all_rating
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
      ) ON CONFLICT (id) DO NOTHING
    `,
      [
        course.courseId,
        `TEST-${course.courseId.toUpperCase()}`,
        'beginner',
        10.0,
        'Bitcoin',
        'Fundamentals',
        'en',
        false,
        'online',
        'self_paced',
        false,
        false,
        false,
        false,
        new Date().toISOString(),
        'fake-commit-hash',
        new Date().toISOString(),
        0,
        0,
      ],
    );

    // Insert course localized
    await connection.unsafe(
      `
      INSERT INTO content.courses_localized (
        course_id, language, name, goal, objectives, raw_description
      ) VALUES (
        $1, $2, $3, $4, $5, $6
      ) ON CONFLICT (course_id, language) DO NOTHING
    `,
      [
        course.courseId,
        'en',
        course.courseName,
        'Learn Bitcoin fundamentals',
        [
          'Understanding Bitcoin',
          'Practical knowledge',
          'Real-world applications',
        ],
        'A comprehensive course about Bitcoin and cryptocurrency fundamentals.',
      ],
    );

    // Insert course translation
    await connection.unsafe(
      `
      INSERT INTO content.course_translations (
        course_id, language, status, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5
      ) ON CONFLICT (course_id, language) DO NOTHING
    `,
      [
        course.courseId,
        'fr',
        'todo',
        new Date().toISOString(),
        new Date().toISOString(),
      ],
    );

    // Insert parts and chapters
    for (let partIndex = 0; partIndex < course.parts.length; partIndex++) {
      const part = course.parts[partIndex];

      // Insert part
      await connection.unsafe(
        `
        INSERT INTO content.course_parts (
          course_id, part_index, part_id, last_sync
        ) VALUES (
          $1, $2, $3, $4
        ) ON CONFLICT (course_id, part_id) DO NOTHING
      `,
        [course.courseId, partIndex + 1, part.partId, new Date().toISOString()],
      );

      // Insert part localized
      await connection.unsafe(
        `
        INSERT INTO content.course_parts_localized (
          course_id, part_id, language, title, last_sync
        ) VALUES (
          $1, $2, $3, $4, $5
        ) ON CONFLICT (course_id, part_id, language) DO NOTHING
      `,
        [
          course.courseId,
          part.partId,
          'en',
          part.partTitle,
          new Date().toISOString(),
        ],
      );

      // Insert chapters
      for (
        let chapterIndex = 0;
        chapterIndex < part.chapters.length;
        chapterIndex++
      ) {
        const chapter = part.chapters[chapterIndex];

        // Insert chapter
        await connection.unsafe(
          `
          INSERT INTO content.course_chapters (
            course_id, chapter_index, part_id, chapter_id, last_sync
          ) VALUES (
            $1, $2, $3, $4, $5
          ) ON CONFLICT (chapter_id) DO NOTHING
        `,
          [
            course.courseId,
            chapterIndex + 1,
            part.partId,
            chapter.chapterId,
            new Date().toISOString(),
          ],
        );

        // Insert chapter localized
        await connection.unsafe(
          `
          INSERT INTO content.course_chapters_localized (
            course_id, chapter_id, language, title, sections, raw_content, last_sync
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7
          ) ON CONFLICT (course_id, chapter_id, language) DO NOTHING
        `,
          [
            course.courseId,
            chapter.chapterId,
            'en',
            chapter.chapterTitle,
            ['Introduction', 'Main Content', 'Summary'],
            'Fake chapter content for testing purposes.',
            new Date().toISOString(),
          ],
        );

        // Insert course translation chapter
        await connection.unsafe(
          `
          INSERT INTO content.course_translation_chapters (
            course_id, language, part_id, chapter_id, status, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7
          ) ON CONFLICT (course_id, language, part_id, chapter_id) DO NOTHING
        `,
          [
            course.courseId,
            'fr',
            part.partId,
            chapter.chapterId,
            'todo',
            new Date().toISOString(),
            new Date().toISOString(),
          ],
        );
      }
    }
  }

  console.log(`Created structure for ${courses.length} courses`);
}

async function populateSlideData() {
  console.log('Starting to populate slide data...');

  try {
    // Generate fake course structure
    const fakeCourses = generateFakeCourseStructure(10);

    // Add CSV402 real course data
    const csv402Course = getCSV402CourseStructure();

    // Combine fake and real courses
    const allCourses = [...fakeCourses, csv402Course];

    // Create the course structure in the database (only for fake courses since CSV402 already exists)
    await createCourseStructure(fakeCourses);

    // Ensure CSV402 has course translation entries
    console.log('Ensuring CSV402 has translation entries...');
    await connection.unsafe(
      `
      INSERT INTO content.course_translations (
        course_id, language, status, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5
      ) ON CONFLICT (course_id, language) DO NOTHING
    `,
      [
        csv402Course.courseId,
        'fr',
        'todo',
        new Date().toISOString(),
        new Date().toISOString(),
      ],
    );

    // Ensure CSV402 has course translation chapter entries
    for (const part of csv402Course.parts) {
      for (const chapter of part.chapters) {
        await connection.unsafe(
          `
          INSERT INTO content.course_translation_chapters (
            course_id, language, part_id, chapter_id, status, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7
          ) ON CONFLICT (course_id, language, part_id, chapter_id) DO NOTHING
        `,
          [
            csv402Course.courseId,
            'fr',
            part.partId,
            chapter.chapterId,
            'todo',
            new Date().toISOString(),
            new Date().toISOString(),
          ],
        );
      }
    }

    let totalSlidesCreated = 0;

    for (const course of allCourses) {
      console.log(
        `Processing course ${course.courseId} (${course.courseName}) with ${course.parts.length} parts`,
      );

      // Use RGB-specific content for CSV402, regular content for others
      const isCSV402 =
        course.courseId === '3ce1d37c-05ba-4f54-aa15-7586d37b2bb7';
      const slideTopics = isCSV402 ? rgbSlideTopics : fakeSlideTopics;
      const slideContent = isCSV402 ? rgbOriginalContent : fakeOriginalContent;

      for (const part of course.parts) {
        for (const chapter of part.chapters) {
          // Create 3-5 slides per chapter
          const slidesPerChapter = Math.floor(Math.random() * 3) + 3; // 3 to 5 slides

          for (let i = 0; i < slidesPerChapter; i++) {
            const slideId = generateUuid();
            const topicIndex = (totalSlidesCreated + i) % slideTopics.length;
            const contentIndex = (totalSlidesCreated + i) % slideContent.length;
            const pathIndex =
              (totalSlidesCreated + i) % fakeResourcePaths.length;

            // Generate resource paths
            const pptResourcePath = isCSV402
              ? `s3://course-slides/csv402/slides/${slideId}.pdf`
              : `${fakeResourcePaths[pathIndex]}${slideId}.pdf`;

            // Currently we do not have audio resources for fake data; set to NULL
            // This can be updated later if needed to point to actual audio files.
            const audioResourcePath: string | null = null;

            const originalContent = `${slideTopics[topicIndex]}: ${slideContent[contentIndex]}`;
            const translatedContent =
              Math.random() > 0.7
                ? null
                : isCSV402
                  ? `[FR] ${slideTopics[topicIndex]}: Contenu traduit en français pour le protocole RGB.`
                  : `[FR] ${slideTopics[topicIndex]}: Contenu traduit en français pour cette diapositive.`;
            const status = getRandomItem(translationStatuses);

            // Insert slide using raw SQL
            await connection.unsafe(
              `
              INSERT INTO content.course_translation_slides (
                course_id, language, part_id, chapter_id, slide_id,
                ppt_resource_path, audio_resource_path, original_content, translated_content,
                status, created_at, updated_at
              ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
              ) ON CONFLICT DO NOTHING
            `,
              [
                course.courseId,
                'fr',
                part.partId,
                chapter.chapterId,
                slideId,
                pptResourcePath,
                audioResourcePath,
                originalContent,
                translatedContent,
                status,
                new Date().toISOString(),
                new Date().toISOString(),
              ],
            );

            totalSlidesCreated++;
          }
        }
      }
    }

    console.log(
      `Successfully created ${totalSlidesCreated} slides for ${allCourses.length} courses (including CSV402)`,
    );

    // Display summary
    const summary = await connection.unsafe(`
      SELECT status, COUNT(*) as count
      FROM content.course_translation_slides
      WHERE language = 'fr'
      GROUP BY status
      ORDER BY status
    `);

    console.log('\nSummary of created slides by status:');
    for (const row of summary) {
      console.log(`  ${row.status}: ${row.count} slides`);
    }

    // Show some sample slides
    const sampleSlides = await connection.unsafe(`
      SELECT course_id, slide_id, status, original_content, ppt_resource_path
      FROM content.course_translation_slides
      WHERE language = 'fr'
      LIMIT 3
    `);

    console.log('\nSample slides created:');
    for (const slide of sampleSlides) {
      console.log(
        `  Course: ${slide.course_id}, Slide: ${slide.slide_id.slice(0, 8)}..., Status: ${slide.status}`,
      );
      console.log(`  Content: ${slide.original_content.slice(0, 80)}...`);
      console.log(`  PPT Resource: ${slide.ppt_resource_path}`);
      console.log('  ---');
    }
  } catch (error) {
    console.error('Error populating slide data:', error);
    throw error;
  }
}

// Run the population script
await populateSlideData();
await connection.end();

console.log('Slide population completed!');
