/** biome-ignore-all lint/style/useNodejsImportProtocol: replaced by bare runtime */

import b4a from 'b4a';
import Corestore from 'corestore';
import debounceify from 'debounceify';
import Hyperdrive from 'hyperdrive';
import Hyperswarm from 'hyperswarm';
import { join } from 'path';

// We no longer store a boolean, but the initialization promise itself.
let initializationPromise: Promise<{
  store: typeof Corestore;
  swarm: typeof Hyperswarm;
  drive: typeof Hyperdrive;
}> | null = null;

type PeerDiscovery = any;

const startPeerRefresh = (discovery: PeerDiscovery, signal: AbortSignal) => {
  let t: ReturnType<typeof setTimeout> | null = null;
  let p = discovery.swarm.connections.size; // Previous connections count

  const refresh = debounceify(async () => {
    if (signal.aborted) {
      return;
    }

    await discovery.refresh();

    const c = discovery.swarm.connections.size; // Current connections count
    if (!!c !== !!p) {
      console.info('Discovery refreshed and found', c ? c : 'no', 'peers');
    }

    t = setTimeout(refresh, c ? 60_000 : 5_000);

    p = c;
  });

  t = setTimeout(refresh, 60_000);

  signal.addEventListener('abort', () => clearTimeout(t || undefined));

  return refresh;
};

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

    const ac = new AbortController();

    try {
      const storagePath = join(window.Pear.config.storage, 'storage');

      const swarm = new Hyperswarm();

      // This initialization logic will now only be executed
      // once and only once.
      const store = new Corestore(storagePath);
      await store.ready();

      const foundPeers = store.findingPeers();

      const key = b4a.from(
        'ce227451c202ac32bb8fef5d44ac718750189427618e6604c33e25cf8ae35abf',
        'hex',
      );

      const drive = new Hyperdrive(store, key);

      swarm.on('error', (err: any) => console.error('Swarm error:', err));
      swarm.on('connection', (conn: any) => drive.replicate(conn));
      const discovery = swarm.join(drive.discoveryKey, {
        client: true,
        server: true,
      });

      // Watch for new peers
      const refresh = startPeerRefresh(discovery, ac.signal);
      drive.core.on('peer-remove', () => {
        // If no peers are left, refresh immediately
        if (!discovery.swarm.connections.size && !ac.signal.aborted) {
          console.warn('No peers left, refreshing discovery');
          refresh();
        }
      });

      swarm.flush().then(() => foundPeers());

      // https://docs.pears.com/building-blocks/hypercore#core.update
      // This won't resolve until either
      // - The first peer is found
      // - No peers could be found
      const updated = await drive.core.update({ wait: true });
      console.info('Core length is', drive.core.length);
      if (!drive.core.peers.length && !drive.core.length) {
        console.warn('No peers found to initialize drive');
        // return await this.destroy().then(() => process.exit(1));
        throw new Error('No peers found to initialize drive');
      }

      console.info('Core', updated ? 'updated' : 'was up to date');

      console.log('Pear Service Initialized');

      return { store, swarm, drive };
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
