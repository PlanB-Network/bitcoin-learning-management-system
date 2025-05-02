import { Readable } from 'node:stream';

import type { GetObjectCommandOutput } from '@aws-sdk/client-s3';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

import type { S3Config } from '@blms/types';

// Re-export NoSuchKey from the S3 client
export { NoSuchKey } from '@aws-sdk/client-s3';

type Data = string | Uint8Array | Buffer;
type Metadata = Record<string, string>;
interface PutOptions {
  contentType?: string;
  metadata?: Metadata;
}

export interface S3Service {
  getBlob(key: string): Promise<Uint8Array | null>;
  getStream(key: string): Promise<Readable | null>;
  put(key: string, body: Data, opts?: PutOptions): Promise<void>;
  upload(key: string, stream: Readable, opts?: PutOptions): Promise<void>;
  head(key: string): Promise<S3Head>;
  delete(key: string): Promise<void>;
  metadata(key: string): Promise<Metadata | null>;
}

export interface S3Head {
  lastModified?: Date;
  contentType?: string;
  contentLength?: number;
}

const base = (path: string): string => {
  return path.replaceAll(/\/+/g, '/');
};

export const createS3Service = (config: S3Config): S3Service => {
  const s3 = new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKey,
      secretAccessKey: config.secretKey,
    },
  });

  const Bucket = config.bucket;

  const get = (key: string): Promise<GetObjectCommandOutput> => {
    return s3.send(new GetObjectCommand({ Bucket, Key: base(key) }));
  };

  const head = (key: string) => {
    return s3.send(new HeadObjectCommand({ Bucket, Key: base(key) }));
  };

  return {
    // Return the requested file as a blob
    getBlob(key: string) {
      return get(key).then((res) => res.Body?.transformToByteArray() ?? null);
    },
    // Return the requested file as a stream
    getStream(key: string) {
      return get(key)
        .then((res) => res.Body)
        .then((body) => {
          if (!body) {
            return null;
          }

          // Any needed here to avoid conflicting definitions between node and browser
          return Readable.fromWeb(body.transformToWebStream() as any);
        });
    },
    // Upload a file to the bucket
    put(key: string, body: Data, { contentType, metadata }: PutOptions = {}) {
      contentType ??=
        typeof body === 'string' ? 'text/plain' : 'application/octet-stream';

      const cmd = new PutObjectCommand({
        Bucket,
        Key: base(key),
        Body: body,
        ContentType: contentType,
        Metadata: metadata,
      });

      return s3.send(cmd).then(() => void 0);
    },
    // Upload a stream to the bucket
    async upload(
      key: string,
      stream: Readable,
      { contentType, metadata }: PutOptions = {},
    ) {
      contentType ??= 'application/octet-stream';

      const upload = new Upload({
        client: s3,
        params: {
          Bucket,
          Key: base(key),
          ContentType: contentType,
          Body: stream,
          Metadata: metadata,
        },
      });

      await upload.done();
    },
    // Return the metadata of the requested file
    head(key: string) {
      return head(key).then((res) => ({
        lastModified: res.LastModified,
        contentLength: res.ContentLength,
        contentType: res.ContentType,
        metadata: res.Metadata,
      }));
    },
    // Delete the requested file
    delete(key: string) {
      const cmd = new DeleteObjectCommand({ Bucket, Key: base(key) });

      return s3.send(cmd).then(() => void 0);
    },
    // Return the metadata of the requested file
    metadata(key: string) {
      return head(key)
        .then((res) => res.Metadata ?? null)
        .catch(() => null);
    },
  };
};
