import { firstRow, sql, type TransactionSql } from '@blms/database';
import type { S3Service } from '@blms/s3';
import type { ChangedFile, Course } from '@blms/types';
import type { Dependencies } from '../../dependencies.js';
import type { ChangedContent } from '../../types.js';
import {
  getRelativePath,
  separateContentFiles,
  yamlToObject,
} from '../../utils.js';

interface BCertExamDetails {
  path: string;
  fullPath: string;
}

export type ChangedAssignment = ChangedContent;

export const parseDetailsFromPath = (path: string): BCertExamDetails => {
  const pathElements = path.split('/');

  // Validate that the path has at least 4 elements (courses/course/assignments/assignment)
  if (pathElements.length < 3) throw new Error('Invalid assignment path');

  return {
    fullPath: pathElements.join('/'),
    path: pathElements.slice(0, 4).join('/'),
  };
};

export const groupByAssignments = (files: ChangedFile[], errors: string[]) => {
  const assignmentsFiles = files.filter((item) =>
    item.path.match(/^courses\/[^/]+\/assignments\//),
  );

  const groupedAssignments = new Map<string, ChangedAssignment>();

  for (const file of assignmentsFiles) {
    try {
      const { path: assignmentsPath, fullPath } = parseDetailsFromPath(
        file.path,
      );

      const assignment: ChangedAssignment = groupedAssignments.get(
        assignmentsPath,
      ) || {
        files: [],
        fullPath: fullPath,
        path: assignmentsPath,
        type: 'assignments',
      };

      assignment.files.push({
        ...file,
        fullPath: file.path,
        path: getRelativePath(file.path, assignmentsPath),
      });

      groupedAssignments.set(assignmentsPath, assignment);
    } catch {
      errors.push(`Unsupported path ${file.path}, skipping file...`);
    }
  }

  return [...groupedAssignments.values()];
};

export const createUpdateAssignments = ({
  postgres,
  s3,
}: Pick<Dependencies, 'postgres' | 's3'>) => {
  return async (assignment: ChangedAssignment, errors: string[]) => {
    const { main, files } = separateContentFiles(assignment, 'assignment.yml');

    return postgres
      .begin(async (transaction) => {
        const processMainFile = createProcessMainFile(transaction);
        const processPdfFile = createProcessPdfFile(transaction, s3);

        if (!main) return;

        const courseIndex = main.fullPath?.split('/')[1]!;

        let assignmentId: string | undefined;
        try {
          assignmentId = await processMainFile(assignment, main, courseIndex);
        } catch (error) {
          console.log(
            `Error processing file(Assignment) ${assignment?.fullPath} : ${error}${(error as any).detail ? ` - Detail: ${(error as any).detail}` : ''}`,
          );
          errors.push(
            `Error processing file(Assignment) ${assignment?.fullPath} : ${error}${(error as any).detail ? ` - Detail: ${(error as any).detail}` : ''}`,
          );
        }

        const pdfFile = files
          .filter((file) =>
            file.path.split('/').slice(-1).includes('assignment.pdf'),
          )
          .at(0);

        try {
          if (pdfFile && assignmentId) {
            await processPdfFile(pdfFile, courseIndex, assignmentId);
          }
        } catch (error) {
          console.log(
            `Error processing file(Assignment) ${pdfFile?.path}: ${error}${(error as any).detail ? ` - Detail: ${(error as any).detail}` : ''}`,
          );

          errors.push(
            `Error processing file(Assignment) ${pdfFile?.path}: ${error}${(error as any).detail ? ` - Detail: ${(error as any).detail}` : ''}`,
          );
        }
      })
      .catch((error) => {
        console.log(`[sync] Error during transaction: ${error?.message}`);
        errors.push(`Error during transaction: ${error}`);
      });
  };
};

interface AssignmentMain {
  id: string;
  company: string;
  assignment_name: string;
  mentor: string;
  telegram: string;
}

export const createProcessMainFile = (transaction: TransactionSql) => {
  return async (
    assignment: ChangedAssignment,
    file: ChangedFile,
    courseIndex: string,
  ) => {
    if (!file) return;

    const parsedAssignment = await yamlToObject<AssignmentMain>(file);

    const lastUpdated = assignment.files.sort((a, b) => b.time - a.time)[0];

    const courseId = await transaction<Course[]>`
            SELECT id FROM content.courses WHERE index = ${courseIndex}
          `
      .then(firstRow)
      .then((row) => row?.id);

    if (!courseId) {
      // For test-only courses, we don't want to throw an error
      return;
    }

    await transaction<AssignmentMain[]>`
        INSERT INTO content.course_assignment (
          id, course_id, name, description, mentor, telegram_url, file_url, last_updated, last_commit, last_sync)
        VALUES (
          ${parsedAssignment.id},
          ${courseId},
          ${parsedAssignment.company},
          ${parsedAssignment.assignment_name},
          ${parsedAssignment.mentor},
          ${parsedAssignment.telegram},
          '',
          ${lastUpdated.time},
          ${lastUpdated.commit},
          NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          course_id = EXCLUDED.course_id,
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          mentor = EXCLUDED.mentor,
          telegram_url = EXCLUDED.telegram_url,
          file_url = EXCLUDED.file_url,
          last_updated = EXCLUDED.last_updated,
          last_commit = EXCLUDED.last_commit,
          last_sync = NOW()
        RETURNING *
      `;

    return parsedAssignment.id;
  };
};

export const createDeleteAssignments = ({
  postgres,
}: Pick<Dependencies, 'postgres'>) => {
  return async (sync_date: number, errors: string[]) => {
    try {
      await postgres.exec(
        sql`DELETE FROM content.course_assignment WHERE last_sync < ${sync_date}
      `,
      );
    } catch {
      errors.push('Error deleting Assignments');
    }
  };
};

export const createProcessPdfFile = (
  transaction: TransactionSql,
  s3: S3Service,
) => {
  return async (
    file: ChangedFile,
    courseIndex: string,
    assignmentId: string,
  ) => {
    const fileBuffer = await file.load();
    const fileName = file.path;
    const filePath = `course-assignments/${courseIndex}/${assignmentId}/${fileName}`;
    const filePathWithoutExtension = filePath.split('.').slice(0, 1).join('');

    // Check if the file is already synced on s3
    const metadata = await s3.metadata(filePath);

    if (metadata?.commit === file.commit) {
      console.log(`[sync] Already processed file: ${filePath}`, metadata);
    } else {
      console.log('put on s3', filePath);
      const mimeType = 'application/pdf';

      const metadata = { commit: file.commit };

      const fileBufferCopy1 = Buffer.from(fileBuffer);
      await s3.put(filePath, fileBufferCopy1, {
        contentType: mimeType,
        metadata,
      });
    }

    await transaction`
      UPDATE content.course_assignment
      SET
        file_url = ${`${filePathWithoutExtension}.pdf`},
        last_sync = NOW()
      WHERE
        id = ${assignmentId}
    `;
  };
};
