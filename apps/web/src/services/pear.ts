// src/pear-service.ts

import Corestore from 'corestore';
import Hyperswarm from 'hyperswarm';
import { join } from 'path';

// We no longer store a boolean, but the initialization promise itself.
let initializationPromise: Promise<{
  store: typeof Corestore;
  swarm: typeof Hyperswarm;
}> | null = null;

export const getPearInstance = () => {
  // If the promise already exists, it means initialization
  // is either in progress or completed. We return this promise.
  if (initializationPromise) {
    return initializationPromise;
  }

  // If the promise does not exist, this is the VERY FIRST call.
  // We create the promise, store it, and return it.
  initializationPromise = (async () => {
    // Make sure we are in the Pear environment
    if (typeof window.Pear === 'undefined') {
      throw new Error('Not in a Pear environment.');
    }

    try {
      // This initialization logic will now only be executed
      // once and only once.
      const store = new Corestore(
        join(window.Pear.config.storage, 'storage123'),
      );
      await store.ready();

      const swarm = new Hyperswarm();
      swarm.on('connection', (conn: any) => store.replicate(conn));

      console.log('Pear Service Initialized');
      return { store, swarm };
    } catch (err) {
      // In case of error, we reset the promise to allow
      // another attempt later.
      initializationPromise = null;
      console.error('Failed to initialize Pear Service', err);
      throw err;
    }
  })();

  return initializationPromise;
};
