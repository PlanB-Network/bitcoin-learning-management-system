import { createReadStream } from 'node:fs';

import type { S3ClientConfig } from '@aws-sdk/client-s3';
import {
  ListObjectsCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

import type { S3Config } from '@sovereign-university/types';

interface WriteOptions {
  key: string;
  publicRead?: boolean;
  contentType?: string;
}

export const createS3Client = (config: S3Config) => {
  const client = new S3Client(config satisfies S3ClientConfig);

  return {
    copyFile: async (path: string, options: WriteOptions) => {
      const stream = createReadStream(path);

      const res = await client.send(
        new PutObjectCommand({
          Bucket: config.bucket,
          Key: options.key,
          Body: stream,
          ACL: options.publicRead ? 'public-read' : undefined,
          ContentType: options.contentType ?? 'application/octet-stream',
        }),
      );

      console.log(`[S3] Sent file: ${options.key}`, res);

      return res;
    },
    writeData: async (data: Buffer | string, options: WriteOptions) => {
      const res = await client.send(
        new PutObjectCommand({
          Bucket: config.bucket,
          Key: options.key,
          Body: data,
          ACL: options.publicRead ? 'public-read' : undefined,
          ContentType:
            options.contentType ?? typeof data === 'string'
              ? 'text/plain'
              : 'application/octet-stream',
        }),
      );

      console.log(`[S3] Write data: ${options.key}`, res);

      return res;
    },
    // TODO: ListObjectsCommand only returns 1000 items at a time
    listObjects: async () => {
      const res = await client.send(
        new ListObjectsCommand({
          Bucket: config.bucket,
        }),
      );

      return new Set(
        res.Contents?.map((item) => item.Key).filter(Boolean) ?? [],
      );
    },
  };
};
