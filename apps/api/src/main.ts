import dotenv from 'dotenv';

import { startDependencies, stopDependencies } from './dependencies';
import { startServer } from './server';

dotenv.config();

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const start = async () => {
  const dependencies = await startDependencies();
  const server = await startServer(dependencies, port);

  server.once('close', async () => {
    await stopDependencies();

    server.close();
  });
};


start();
