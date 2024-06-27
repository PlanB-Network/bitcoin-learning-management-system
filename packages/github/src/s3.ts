import { createReadStream } from 'node:fs';

import type { S3ClientConfig } from '@aws-sdk/client-s3';
import {
  ListObjectsV2Command,
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

      console.log(`-- [S3] Sent file: ${options.key}`);

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

      console.log(`-- [S3] Write data: ${options.key}`, res);

      return res;
    },
    // TODO: ListObjectsCommand only returns 1000 items at a time
    listObjects: async () => {
      const allKeys = new Set<string>();
      let isTruncated = true;
      let marker: string | undefined;
      let calls = 0;

      while (isTruncated) {
        calls += 1;

        const list = await client.send(
          new ListObjectsV2Command({
            Bucket: config.bucket,
            ContinuationToken: marker,
          }),
        );

        const keys =
          list.Contents?.map((item) => item.Key) //
            .filter((key): key is string => !!key) ?? [];

        for (const key of keys) {
          allKeys.add(key);
        }

        // // Update the marker to the last key received
        marker = list.NextContinuationToken;

        console.log(`-- [S3] List objects: ${keys.length} keys`);

        // Update isTruncated based on the response
        isTruncated = list.IsTruncated ?? false;
      }

      console.log(
        `-- [S3] List objects: ${allKeys.size} keys in ${calls} calls`,
      );

      return allKeys;
    },
  };
};
