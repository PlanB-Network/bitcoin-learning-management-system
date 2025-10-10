import { Stream } from 'node:stream';

import Corestore from 'corestore';
import DHT from 'hyperdht'; // https://docs.pears.com/building-blocks/hyperdht
import Hyperdrive from 'hyperdrive';
import Hyperswarm from 'hyperswarm';
import postgres from 'postgres';

console.log('Starting PeerTube sync script...', process.env);

const sql = postgres({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT
    ? Number.parseInt(process.env.POSTGRES_PORT, 10)
    : 5432,
  database: process.env.POSTGRES_DB || 'plan_b',
  user: process.env.POSTGRES_USER || 'plan_b',
  password: process.env.POSTGRES_PASSWORD || 'plan_b',
});

const check = await sql`SELECT 1+1 AS result`;
if (check[0].result !== 2) {
  throw new Error('Database connection failed');
}

const videos = await sql`
    SELECT content.courses.id AS "courseId",
       content.courses.index AS "courseIndex",
       content.videos.id AS "videoId",
       content.videos_localized.language AS "videoLanguage",
       id_from_provider AS "peertubeId"
      FROM content.videos_localized
      LEFT JOIN content.videos ON content.videos_localized.id = content.videos.id
      LEFT JOIN content.courses ON content.videos.course_id = content.courses.id
      WHERE content.videos_localized.provider = 'peertube'
`;

console.log('Found', videos.length, 'videos in the database');

const peerTubeIds = videos.map((v) => v.peertubeId).filter((id) => !!id);

console.log(
  'Syncing',
  peerTubeIds.length,
  'videos with PeerTube IDs:',
  peerTubeIds,
);

const peerTubeBaseUrl = 'https://peertube.planb.network/api/v1/videos/';

const now = () => new Date().toISOString();

const CORESTORE_SEED_PATH =
  process.env.CORESTORE_PATH || './.corestore.peertube.seed';

const ac = new AbortController();

const dht = new DHT();
const swarm = new Hyperswarm({ dht });

await dht.ready();

const store = new Corestore(CORESTORE_SEED_PATH);
await store.ready();

const drive = new Hyperdrive(store);
await drive.ready();

console.info(now(), 'Drive key:', drive.key.toString('hex'));

// Sync logic
console.info(now(), 'Starting sync...');

for (const id of peerTubeIds) {
  try {
    const url = `${peerTubeBaseUrl}${id}`;
    console.log(now(), `--- Processing video ${id} ---`);

    // Step 1: Fetch video metadata
    console.log(now(), 'Fetching video metadata from', url);
    const metaRes = await fetch(url);
    if (!metaRes.ok)
      throw new Error(`Failed to fetch metadata: ${metaRes.statusText}`);
    const metaData = await metaRes.json();

    if (!metaData.streamingPlaylists?.[0]?.playlistUrl) {
      console.warn(now(), `No HLS playlist found for video ${id}. Skipping.`);
      continue;
    }

    // Step 2: Download and store the master manifest
    const masterPlaylistUrl = metaData.streamingPlaylists[0].playlistUrl;
    console.log(now(), 'Fetching master manifest:', masterPlaylistUrl);
    const masterPlaylistRes = await fetch(masterPlaylistUrl);
    if (!masterPlaylistRes.ok)
      throw new Error(
        `Failed to fetch master manifest: ${masterPlaylistRes.statusText}`,
      );
    const masterPlaylistContent = await masterPlaylistRes.text();

    const masterKey = `/videos/${id}/master.m3u8`;
    await drive.put(masterKey, Buffer.from(masterPlaylistContent));
    console.log(
      now(),
      `Stored master manifest as ${masterKey} length=${masterPlaylistContent.length}B`,
    );

    // Step 3: Extract, download, and store resolution manifests
    const resolutionManifestPaths = masterPlaylistContent
      .split('\n')
      .filter((line) => line.endsWith('.m3u8'));

    for (const path of resolutionManifestPaths) {
      const resolutionUrl = new URL(path, masterPlaylistUrl).href;
      console.log(now(), `Fetching resolution manifest: ${resolutionUrl}`);
      const res = await fetch(resolutionUrl);
      if (!res.ok) {
        console.warn(now(), `Could not fetch ${path}, skipping.`);
        continue;
      }

      const content = await res.text();
      const key = `/videos/${id}/${path}`;
      await drive.put(key, Buffer.from(content));
      console.log(
        now(),
        `Stored resolution manifest as ${key} length=${content.length}B`,
      );
    }

    // Step 4: Download and store fragmented MP4 files
    const filesToDownload = metaData.streamingPlaylists[0].files;
    for (const file of filesToDownload) {
      const fileUrl = file.fileUrl;
      const fileName = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
      console.log(now(), `Fetching fragmented MP4: ${fileUrl}`);

      const key = `/videos/${id}/${fileName}`;
      if (await drive.exists(key)) {
        console.log(now(), `Already have ${fileName}, skipping download.`);
        continue;
      }

      const res = await fetch(fileUrl);
      if (!res.ok) {
        console.warn(now(), `Could not fetch ${fileName}, skipping.`);
        continue;
      }

      // Note: Maybe stream this directly to drive.put in future?
      const source = Stream.Readable.fromWeb(res.body, { signal: ac.signal });

      const destination = drive.createWriteStream(key);

      // Pipe the download stream directly into the drive
      await new Promise((resolve, reject) => {
        source.on('error', (err) => reject(err));
        destination.on('error', (err) => reject(err));
        destination.on('finish', () => resolve());
        source.pipe(destination);
      });

      const size = Number(res.headers.get('content-length'));

      console.log(now(), `Stored fragmented MP4 as ${key} size=${size}`);
    }

    console.log(now(), `--- Finished processing video ${id} ---`);
  } catch (err) {
    console.error(
      now(),
      `An error occurred while processing video ${id}:`,
      err.message,
    );
  }
}

swarm.on('error', (err) => console.error(now(), 'Swarm error:', err));
swarm.on('connection', (conn) => drive.replicate(conn));
const discovery = swarm.join(drive.discoveryKey, {
  client: false,
  server: true,
});
await discovery.flushed();

console.info(now(), 'Sync complete, waiting for peers...');

// Teardown - Handle shutdown
let stopping = false;
// Notice: running with npm will emit twice - TODO: mitigate
process.on('SIGINT', teardown);
process.on('SIGTERM', teardown);
async function teardown() {
  if (!stopping) {
    console.info(
      '\r',
      now(),
      'Gracefully shutting down, press Ctrl+C again to force',
    );
    stopping = true;

    ac.abort();
    await dht.destroy();
    await swarm.destroy();

    console.info('\r', now(), 'Shutdown complete');
  } else {
    console.info('\r', now(), 'Forcing shutdown');
    process.exit(1);
  }
}
