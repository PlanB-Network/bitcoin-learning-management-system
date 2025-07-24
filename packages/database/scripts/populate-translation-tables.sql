-- Populate translation tables based on existing content
-- This script initializes the translation workflow tables

-- Populate course_translations table
INSERT INTO content.course_translations (course_id, language, status, created_at, updated_at)
SELECT DISTINCT
    c.id,
    'en',
    'published'::translation_status,
    NOW(),
    NOW()
FROM content.courses c
WHERE c.is_archived = false
ON CONFLICT (course_id, language) DO NOTHING;

-- Populate course_translations for other languages with 'todo' status
INSERT INTO content.course_translations (course_id, language, status, created_at, updated_at)
SELECT DISTINCT
    c.id,
    'fr',
    'todo'::translation_status,
    NOW(),
    NOW()
FROM content.courses c
WHERE c.is_archived = false
ON CONFLICT (course_id, language) DO NOTHING;

-- Populate course_translation_chapters table
INSERT INTO content.course_translation_chapters (course_id, language, part_id, chapter_id, status, created_at, updated_at)
SELECT
    ct.course_id,
    ct.language,
    cc.part_id,
    cc.chapter_id,
    CASE
        WHEN ct.language = 'en' THEN 'published'::translation_status
        ELSE 'todo'::translation_status
    END,
    NOW(),
    NOW()
FROM content.course_translations ct
CROSS JOIN content.course_chapters cc
WHERE cc.course_id = ct.course_id
ON CONFLICT (course_id, language, part_id, chapter_id) DO UPDATE SET
    status = EXCLUDED.status,
    updated_at = NOW();

-- Check the results
SELECT
    'course_translations' as table_name,
    language,
    status,
    COUNT(*) as count
FROM content.course_translations
GROUP BY language, status
ORDER BY language, status;

SELECT
    'course_translation_chapters' as table_name,
    language,
    status,
    COUNT(*) as count
FROM content.course_translation_chapters
GROUP BY language, status
ORDER BY language, status;
