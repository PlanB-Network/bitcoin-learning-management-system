import { sql } from '@blms/database';
import type { Dependencies } from '../../dependencies.js';

export interface GenerateCourseVideoResponse {
  outputKey: string;
  toolkitTask: any; // raw JSON from Language-Toolkit
  accessToken?: string;
}

interface CourseProfessor {
  professorId: string;
  name: string;
  isCoordinator: boolean;
}

/**
 * Get professor information for a course to enable voice matching
 */
const getCourseProfessors = async (
  postgres: Dependencies['postgres'],
  courseId: string,
): Promise<CourseProfessor[]> => {
  const professors = await postgres.exec(sql<CourseProfessor[]>`
    SELECT
      cp.professor_id as "professorId",
      p.name,
      cp.is_coordinator as "isCoordinator"
    FROM content.course_professors cp
    JOIN content.professors p ON cp.professor_id = p.id
    WHERE cp.course_id = ${courseId}
    ORDER BY cp.is_coordinator DESC, p.name ASC
  `);

  return professors;
};

/**
 * Create a course video by delegating the heavy lifting to the Language-Toolkit API.
 *
 * Steps performed:
 *  1. Compute the canonical S3 key where the final video will reside.
 *  2. Query professor information for voice matching.
 *  3. Acquire an access-token for the Toolkit API (supports static token or /token flow).
 *  4. POST a JSON payload to `/video/course_s3` on the Toolkit with professor info.
 *  5. Return the task information so that the caller can poll progress.
 */
export const createGenerateCourseVideo = (deps: Dependencies) => {
  return async (
    courseId: string,
    language: string,
  ): Promise<GenerateCourseVideoResponse> => {
    if (!courseId || !language) {
      throw new Error('Course ID and language are required');
    }

    const outputKey = `contribute/${courseId}/${language}/video.mp4`;
    const toolkitUrl = process.env.LTK_URL ?? 'http://localhost:8000';

    console.log(`Generating course video for ${courseId} in ${language}`);
    console.log(`Toolkit URL: ${toolkitUrl}`);
    console.log(`Output key: ${outputKey}`);

    // Query professor information for voice matching
    let professors: CourseProfessor[] = [];
    try {
      professors = await getCourseProfessors(deps.postgres, courseId);
      console.log(
        `Found ${professors.length} professors for course ${courseId}:`,
        professors.map(
          (p) =>
            `${p.name} (${p.isCoordinator ? 'coordinator' : 'associated'})`,
        ),
      );
    } catch (error) {
      console.warn(`Failed to fetch professors for course ${courseId}:`, error);
      // Continue without professor info - Language-Toolkit will use default voice
    }

    // 1) Get auth token – prefer static token but fall back to /token exchange
    let accessToken: string | undefined = process.env.LTK_STATIC_TOKEN;

    if (!accessToken) {
      console.log('No static token found, requesting token from Toolkit...');

      try {
        const tokenResp = await fetch(`${toolkitUrl}/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            // In dev Toolkit accepts arbitrary creds if none configured
            username: process.env.LTK_CLIENT_ID ?? 'blms-app',
            password: process.env.LTK_CLIENT_SECRET ?? 'blms-secret',
          }),
        });

        if (!tokenResp.ok) {
          const txt = await tokenResp.text();
          throw new Error(
            `Language-Toolkit token error: ${tokenResp.status} ${txt}`,
          );
        }

        const tokenData = (await tokenResp.json()) as { access_token: string };
        accessToken = tokenData.access_token;

        if (!accessToken) {
          throw new Error('No access token received from Language-Toolkit');
        }

        console.log('Successfully obtained access token from Toolkit');
      } catch (error) {
        console.error('Failed to get access token:', error);
        throw new Error(
          `Failed to authenticate with Language-Toolkit: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        );
      }
    } else {
      console.log('Using static token for authentication');
    }

    // 2) Call Toolkit endpoint with professor information
    const body = {
      course_id: courseId,
      language,
      output_key: outputKey,
      professors: professors.map((p) => ({
        id: p.professorId,
        name: p.name,
        is_coordinator: p.isCoordinator,
      })),
    };

    console.log('Calling Toolkit video generation endpoint...');
    console.log('Request body:', body);

    try {
      const resp = await fetch(`${toolkitUrl}/video/course_s3`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        const txt = await resp.text();
        console.error(`Toolkit API error: ${resp.status} ${txt}`);
        throw new Error(`Language-Toolkit error: ${resp.status} ${txt}`);
      }

      const toolkitTask = (await resp.json()) as any;
      console.log('Received task from Toolkit:', toolkitTask);

      if (!toolkitTask.task_id) {
        console.warn('Warning: No task_id in Toolkit response');
      }

      return {
        outputKey,
        toolkitTask,
        accessToken,
      };
    } catch (error) {
      console.error('Failed to call Toolkit API:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(
          `Cannot connect to Language-Toolkit at ${toolkitUrl}. Please ensure it's running.`,
        );
      }
      throw error;
    }
  };
};
