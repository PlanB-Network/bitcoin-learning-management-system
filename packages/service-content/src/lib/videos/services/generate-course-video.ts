import type { Dependencies } from '../../dependencies.js';

export interface GenerateCourseVideoResponse {
  outputKey: string;
  toolkitTask: any; // raw JSON from Language-Toolkit
  accessToken?: string;
}

/**
 * Create a course video by delegating the heavy lifting to the Language-Toolkit API.
 *
 * Steps performed:
 *  1. Compute the canonical S3 key where the final video will reside.
 *  2. Acquire an access-token for the Toolkit API (supports static token or /token flow).
 *  3. POST a JSON payload to `/video/course_s3` on the Toolkit.
 *  4. Return the task information so that the caller can poll progress.
 */
export const createGenerateCourseVideo = (_deps: Dependencies) => {
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

    // 2) Call Toolkit endpoint
    const body = {
      course_id: courseId,
      language,
      output_key: outputKey,
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
