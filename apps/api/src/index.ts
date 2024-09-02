import type {} from 'express-serve-static-core';
import type {} from 'qs';
import 'express-session';

import { pathToFileURL } from 'node:url';

import * as dotenv from 'dotenv';

import { startDependencies } from './dependencies.js';
import { startServer } from './server.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

declare module 'express-session' {
  interface SessionData {
    uid?: string;
    role: 'student' | 'professor' | 'community' | 'admin' | 'superadmin';
    professorId?: number | null;
    professorName: string;
    professorPath: string;
    professorTwitterUrl: string;
    professorWebsiteUrl: string;
    professorGithubUrl: string;
    professorNostr: string;
    professorCourses: string[];
    professorTutorials: number[];
    professorShortBio: { [key: string]: string };
    professorTags: string[];
    professorLightningAddress: string;
    professorLastCommit: string;
  }
}

dotenv.config();

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const start = async () => {
  const { dependencies, stopDependencies } = await startDependencies();
  const server = await startServer(dependencies, port);

  server.once('close', async () => {
    await stopDependencies();

    server.close();
  });
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await start();
}
