import { sql } from '@blms/database';
import { TRPCError } from '@trpc/server';
import type { Dependencies } from '../../dependencies.js';
import {
  createTranslationAssignmentQuery,
  getTranslationAssignmentRequestsQuery,
  getUserTranslationAssignmentsQuery,
} from '../queries/assignment-queries.js';

export interface TranslationAssignment {
  id: string;
  courseId: string;
  language: string;
  assigneeId: string;
  assignerId: string;
  status: string;
  assignedAt: Date;
  completedAt?: Date;
  rejectionReason?: string;
  courseIndex?: string;
  courseName?: string;
  assigneeUsername?: string;
  assignerUsername?: string;
}

/**
 * Service to create a translation assignment request
 */
export const createRequestTranslationAssignment = ({
  postgres,
}: Dependencies) => {
  return async ({
    courseId,
    language,
    userId,
  }: {
    courseId: string;
    language: string;
    userId: string;
  }): Promise<TranslationAssignment> => {
    try {
      return await postgres.begin(async (transaction) => {
        // Check if user already has an assignment for this course-language combination
        const existingAssignment = await transaction<{ id: string }[]>`
          SELECT id
          FROM users.translation_assignments
          WHERE course_id = ${courseId}
            AND language = LOWER(${language})
            AND assignee_id = ${userId}
          LIMIT 1
        `;

        if (existingAssignment.length > 0) {
          throw new TRPCError({
            code: 'CONFLICT',
            message:
              'You already have an assignment for this course and language',
          });
        }

        // Check if course translation exists, if not create it
        const existingTranslation = await transaction`
          SELECT course_id, language
          FROM content.course_translations
          WHERE course_id = ${courseId} AND language = LOWER(${language})
        `;

        if (existingTranslation.length === 0) {
          // Create the course translation entry
          await transaction`
            INSERT INTO content.course_translations (course_id, language, status)
            VALUES (${courseId}, LOWER(${language}), 'todo'::translation_status)
          `;

          // Populate course_translation_chapters
          await transaction`
            INSERT INTO content.course_translation_chapters (course_id, language, part_id, chapter_id, status, created_at, updated_at)
            SELECT
              ${courseId},
              ${language.toLowerCase()},
              cc.part_id,
              cc.chapter_id,
              'todo'::translation_status,
              NOW(),
              NOW()
            FROM content.course_chapters cc
            WHERE cc.course_id = ${courseId}
            ON CONFLICT (course_id, language, part_id, chapter_id) DO NOTHING
          `;
        }

        // Create the assignment request
        const results = await transaction<TranslationAssignment[]>`
          INSERT INTO users.translation_assignments (course_id, language, assignee_id, assigner_id, status)
          VALUES (${courseId}, LOWER(${language}), ${userId}, ${userId}, 'requested')
          RETURNING
            id,
            course_id AS "courseId",
            language,
            assignee_id AS "assigneeId",
            assigner_id AS "assignerId",
            status,
            assigned_at AS "assignedAt",
            completed_at AS "completedAt",
            rejection_reason AS "rejectionReason"
        `;

        if (results.length === 0) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create translation assignment request',
          });
        }

        return results[0];
      });
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create translation assignment request',
      });
    }
  };
};

/**
 * Service to get user's translation assignments
 */
export const createGetUserTranslationAssignments = ({
  postgres,
}: Dependencies) => {
  return async ({
    userId,
    language,
    status,
  }: {
    userId: string;
    language?: string;
    status?: string;
  }): Promise<TranslationAssignment[]> => {
    try {
      const results = await postgres.exec(
        getUserTranslationAssignmentsQuery(userId, language, status),
      );

      return results as TranslationAssignment[];
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch user translation assignments',
      });
    }
  };
};

/**
 * Service to update translation assignment status
 */
export const createUpdateTranslationAssignmentStatus = ({
  postgres,
}: Dependencies) => {
  return async ({
    assignmentId,
    status,
    rejectionReason,
  }: {
    assignmentId: string;
    status: string;
    rejectionReason?: string;
  }): Promise<TranslationAssignment> => {
    try {
      console.log('🔄 updateTranslationAssignmentStatus called with:', {
        assignmentId,
        status,
        rejectionReason,
      });

      return await postgres.begin(async (transaction) => {
        // Récupérer les détails de l'assignation
        console.log('📥 Fetching assignment details for ID:', assignmentId);
        const assignmentDetails = await transaction`
          SELECT course_id, language, assignee_id, assigner_id
          FROM users.translation_assignments
          WHERE id = ${assignmentId}
        `;

        console.log('🔍 Raw assignment details result:', assignmentDetails);

        if (assignmentDetails.length === 0) {
          console.log('❌ Assignment not found for ID:', assignmentId);
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Translation assignment not found',
          });
        }

        const assignmentData = assignmentDetails[0];
        const course_id = assignmentData.courseId;
        const language = assignmentData.language;
        const assignee_id = assignmentData.assigneeId;
        const assigner_id = assignmentData.assignerId;

        console.log('📋 Assignment details:', {
          course_id,
          language,
          assignee_id,
          assigner_id,
        });

        // Mettre à jour le statut de l'assignation
        console.log('🔄 Updating assignment status to:', status);
        const results = await transaction`
          UPDATE users.translation_assignments
          SET
            status = ${status},
            completed_at = ${status === 'completed' ? sql`NOW()` : sql`NULL`},
            rejection_reason = ${rejectionReason || null}
          WHERE id = ${assignmentId}
          RETURNING
            id,
            course_id AS "courseId",
            language,
            assignee_id AS "assigneeId",
            assigner_id AS "assignerId",
            status,
            assigned_at AS "assignedAt",
            completed_at AS "completedAt",
            rejection_reason AS "rejectionReason"
        `;

        console.log('✅ Assignment status updated. Result:', results[0]);

        // Si le statut est "assigned" (accepté par l'admin)
        if (status === 'assigned') {
          console.log(
            '🚀 Status is "assigned", creating chapter and part assignments...',
          );

          // Diagnostic : vérifier si le cours a des chapitres
          console.log('🔍 Diagnostic: Checking if course has chapters...');
          const chaptersCheck = await transaction`
            SELECT COUNT(*) as count FROM content.course_chapters WHERE course_id = ${course_id}
          `;
          console.log(
            `📊 Course ${course_id} has ${chaptersCheck[0].count} chapters`,
          );

          // Diagnostic : vérifier les entrées de traduction existantes
          console.log(
            '🔍 Diagnostic: Checking existing translation entries...',
          );
          const translationsCheck = await transaction`
            SELECT
              (SELECT COUNT(*) FROM content.course_translations WHERE course_id = ${course_id} AND language = LOWER(${language})) as course_translations,
              (SELECT COUNT(*) FROM content.course_translation_chapters WHERE course_id = ${course_id} AND language = LOWER(${language})) as chapter_translations
          `;
          console.log('📊 Existing translation entries:', translationsCheck[0]);

          // Si pas d'entrées de traduction, les créer d'abord
          if (translationsCheck[0].course_translations === 0) {
            console.log('📝 Creating missing course_translations entry...');
            await transaction`
              INSERT INTO content.course_translations (course_id, language, status)
              VALUES (${course_id}, LOWER(${language}), 'under_review'::translation_status)
              ON CONFLICT (course_id, language) DO UPDATE SET
                status = 'under_review'::translation_status,
                updated_at = NOW()
            `;
            console.log('✅ Created course_translations entry');
          }

          // Créer les entrées manquantes pour les chapitres
          if (chaptersCheck[0].count > 0) {
            console.log('📝 Creating missing chapter translation entries...');

            // Créer les entrées course_translation_chapters manquantes
            const chapterTranslationResults = await transaction`
              INSERT INTO content.course_translation_chapters (course_id, language, part_id, chapter_id, status)
              SELECT
                ch.course_id,
                LOWER(${language}),
                ch.part_id,
                ch.chapter_id,
                'under_review'::translation_status
              FROM content.course_chapters ch
              WHERE ch.course_id = ${course_id}
              ON CONFLICT (course_id, language, part_id, chapter_id) DO UPDATE SET
                status = 'under_review'::translation_status,
                updated_at = NOW()
              RETURNING course_id
            `;
            console.log(
              `✅ Created/updated ${chapterTranslationResults.length} chapter translation entries`,
            );
          }

          // Créer les assignations de chapitres
          console.log('📝 Creating chapter assignments...');
          const chapterAssignmentsResult = await transaction`
            INSERT INTO users.translation_chapter_assignments (course_id, language, part_id, chapter_id, assignee_id, assigner_id, status)
            SELECT
              ${course_id},
              LOWER(${language}),
              ch.part_id,
              ch.chapter_id,
              ${assignee_id},
              ${assigner_id},
              'assigned'::assignment_status
            FROM content.course_chapters ch
            WHERE ch.course_id = ${course_id}
            ON CONFLICT (course_id, language, part_id, chapter_id, assignee_id) DO NOTHING
            RETURNING id
          `;
          console.log(
            `✅ Created ${chapterAssignmentsResult.length} chapter assignments`,
          );

          // Mettre à jour les statuts des traductions à "under_review" (normalement déjà fait ci-dessus)
          console.log(
            '🔄 Final update: Ensuring all translation statuses are under_review...',
          );
          const courseTranslationsResult = await transaction`
            UPDATE content.course_translations
            SET
              status = 'under_review'::translation_status,
              updated_at = NOW()
            WHERE course_id = ${course_id} AND language = LOWER(${language})
            RETURNING course_id
          `;
          console.log(
            `✅ Updated ${courseTranslationsResult.length} course_translations`,
          );

          console.log('🎉 All updates completed successfully!');
        } else {
          console.log(
            'ℹ️ Status is not "assigned", skipping chapter/part assignments creation',
          );
        }

        return results[0] as TranslationAssignment;
      });
    } catch (error) {
      console.error('❌ Error in updateTranslationAssignmentStatus:', error);
      if (error instanceof TRPCError) {
        throw error;
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update translation assignment status',
      });
    }
  };
};

/**
 * Service to check if user has an existing translation assignment for a course
 */
export const createCheckUserTranslationAssignment = ({
  postgres,
}: Dependencies) => {
  return async ({
    userId,
    courseId,
    language,
  }: {
    userId: string;
    courseId: string;
    language: string;
  }): Promise<TranslationAssignment | null> => {
    try {
      const results = await postgres.exec(sql`
        SELECT
          ta.id,
          ta.course_id AS "courseId",
          ta.language,
          ta.assignee_id AS "assigneeId",
          ta.assigner_id AS "assignerId",
          ta.status,
          ta.assigned_at AS "assignedAt",
          ta.completed_at AS "completedAt",
          ta.rejection_reason AS "rejectionReason"
        FROM users.translation_assignments ta
        WHERE ta.assignee_id = ${userId}
          AND ta.course_id = ${courseId}
          AND ta.language = LOWER(${language})
        ORDER BY ta.assigned_at DESC
        LIMIT 1
      `);

      return results.length > 0 ? (results[0] as TranslationAssignment) : null;
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to check user translation assignment',
      });
    }
  };
};

/**
 * Service to get all translation assignment requests (for admins)
 */
export const createGetTranslationAssignmentRequests = ({
  postgres,
}: Dependencies) => {
  return async (status?: string): Promise<TranslationAssignment[]> => {
    try {
      const results = await postgres.exec(
        getTranslationAssignmentRequestsQuery(status),
      );

      return results as TranslationAssignment[];
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch translation assignment requests',
      });
    }
  };
};

/**
 * Service to assign a course translation to a contributor (admin action)
 */
export const createAssignCourseToContributor = ({ postgres }: Dependencies) => {
  return async ({
    courseId,
    language,
    assigneeId,
    assignerId,
  }: {
    courseId: string;
    language: string;
    assigneeId: string;
    assignerId: string;
  }) => {
    try {
      // Check if there's already an assignment for this course and language
      const existingAssignment = await postgres.exec(sql`
        SELECT id, status
        FROM users.translation_assignments
        WHERE course_id = ${courseId}
          AND language = LOWER(${language})
          AND status IN ('assigned', 'in_progress')
      `);

      if (existingAssignment.length > 0) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Course is already assigned to another contributor',
        });
      }

      // Create the assignment with 'assigned' status
      const result = await postgres.exec(
        createTranslationAssignmentQuery(
          courseId,
          language,
          assigneeId,
          assignerId,
          'assigned',
        ),
      );

      return result[0];
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error assigning course to contributor:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to assign course to contributor',
      });
    }
  };
};

/**
 * Service to reassign a course translation to a different contributor (admin action)
 */
export const createReassignCourseToContributor = ({
  postgres,
}: Dependencies) => {
  return async ({
    assignmentId,
    newAssigneeId,
    assignerId,
  }: {
    assignmentId: string;
    newAssigneeId: string;
    assignerId: string;
  }) => {
    try {
      // Update the existing assignment
      const result = await postgres.exec(sql`
        UPDATE users.translation_assignments
        SET
          assignee_id = ${newAssigneeId},
          assigner_id = ${assignerId},
          status = 'assigned',
          assigned_at = NOW(),
          completed_at = NULL,
          rejection_reason = NULL
        WHERE id = ${assignmentId}
        RETURNING
          id,
          course_id AS "courseId",
          language,
          assignee_id AS "assigneeId",
          assigner_id AS "assignerId",
          status,
          assigned_at AS "assignedAt",
          completed_at AS "completedAt",
          rejection_reason AS "rejectionReason"
      `);

      if (result.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Assignment not found',
        });
      }

      return result[0];
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error reassigning course to contributor:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to reassign course to contributor',
      });
    }
  };
};
