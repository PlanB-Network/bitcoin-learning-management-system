import process from 'node:process';

import { Redis } from 'ioredis';
import type { RedisOptions } from 'ioredis';

import type { RedisKey, RedisKeyValue } from '@sovereign-university/types';

Redis.Command.setReplyTransformer('exists', (result: number) => result === 1);

/**
 * Redis database connector
 */
export class RedisClient extends Redis {
  private _original_client?: Redis;
  host: string;
  port: number;

  /**
   * Create a new Redis client
   *
   * @param host - Redis host
   * @param port - Redis port
   * @param database - Redis database number
   * @param username - Redis username
   * @param password - Redis password
   */
  constructor(
    options: {
      host?: string;
      port?: number | string;
      database?: number | string;
      username?: string;
      password?: string;
    } = {},
  ) {
    const {
      host = process.env['REDIS_HOST'] || '127.0.0.1',
      port = process.env['REDIS_PORT'] || 6379,
      username = process.env['REDIS_USERNAME'],
      password = process.env['REDIS_PASSWORD'],
    } = options;

    super({
      lazyConnect: true,
      host,
      port,
      username,
      password,
    } as RedisOptions);
    this.host = host;
    this.port = Number(port);
  }

  override async connect() {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    super.connect();

    await new Promise<void>((resolve, reject) => {
      this.once('error', reject);

      this.once('ready', () => {
        console.debug(`Redis connected to ${this.host}:${this.port}`);

        resolve();
      });
    });

    this.on('end', () => {
      console.debug('Redis client disconnected');
    });

    this.on('error', (error) => {
      console.error(error);
    });

    this.on('closed', () => {
      console.error('Connection to redis closed');
    });
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  override set<K extends RedisKey>(key: K, value: RedisKeyValue[K]) {
    return super.set(key, JSON.stringify(value));
  }

  override del<K extends RedisKey>(key: K) {
    if (key.includes('*')) {
      const stream = super.scanStream({
        match: key,
      });

      return new Promise<number>((resolve, reject) => {
        stream.on('data', async (keys: string[]) => {
          if (keys.length > 0) {
            const pipeline = super.pipeline();

            for (const key of keys) {
              pipeline.del(key);
            }

            await pipeline.exec();
          }
        });

        stream.on('end', resolve);
        stream.on('error', reject);
      });
    }

    return super.del(key);
  }

  setWithExpiry<K extends RedisKey>(
    key: K,
    value: RedisKeyValue[K],
    expiry: number,
  ) {
    return super.set(key, JSON.stringify(value), 'EX', expiry);
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  override async get<K extends RedisKey>(key: K) {
    const result = await super.get(key);
    return result ? (JSON.parse(result) as RedisKeyValue[K]) : undefined;
  }

  /**
   * Returned an unaltered version of the ioredis client
   *
   * @returns Original ioredis client
   */
  get getClient() {
    if (!this._original_client) {
      this._original_client = this.duplicate();
    }

    return this._original_client;
  }
}
