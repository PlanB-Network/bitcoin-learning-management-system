import { Readable } from 'node:stream';

import type { GetObjectCommandOutput } from '@aws-sdk/client-s3';
import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

import type { S3Config } from '@blms/types';

type Data = string | Uint8Array | Buffer | Readable;

export interface S3Service {
  getBlob(key: string): Promise<Uint8Array | null>;
  getStream(key: string): Promise<Readable | null>;
  put(key: string, body: Data, contentType?: string): Promise<void>;
  head(key: string): Promise<S3Head>;
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

          return Readable.fromWeb(body.transformToWebStream());
        });
    },
    // Upload a file to the bucket
    put(key: string, body: Data, contentType?: string) {
      contentType ??=
        typeof body === 'string' ? 'text/plain' : 'application/octet-stream';

      const cmd = new PutObjectCommand({
        Bucket,
        Key: base(key),
        Body: body,
        ContentType: contentType,
      });

      return s3.send(cmd).then(() => void 0);
    },
    // Return the metadata of the requested file
    head(key: string) {
      const cmd = new HeadObjectCommand({ Bucket, Key: base(key) });

      return s3.send(cmd).then((res) => ({
        lastModified: res.LastModified,
        contentLength: res.ContentLength,
        contentType: res.ContentType,
      }));
    },
  };
};
