import { createHash } from 'node:crypto';

import type { PrivateKey } from 'openpgp';
import * as openpgp from 'openpgp';
import ots from 'opentimestamps';

import type { OpenTimestampsConfig } from '@blms/types';

export const getLatestBlockHeight = async (): Promise<number> => {
  const res = await fetch('https://mempool.space/api/blocks/tip/height');
  const height = await res.json();

  if (!height) {
    throw new Error('Failed to fetch block height');
  }

  if (typeof height !== 'number' || !Number.isInteger(height)) {
    throw new TypeError('Invalid block height');
  }

  return height;
};

export const getBlockHashFromHeight = async (
  height: number | string,
): Promise<string> => {
  const res = await fetch(`https://mempool.space/api/block-height/${height}`);
  const blockHash = await res.text();

  if (!blockHash) {
    throw new Error('Failed to fetch block header');
  }

  if (!/[\da-f]{64}/.test(blockHash)) {
    throw new Error('Invalid block header');
  }

  return blockHash;
};

export const getLatestBlockHash = async (): Promise<string> => {
  const height = await getLatestBlockHeight();
  return getBlockHashFromHeight(height);
};

// Sign diploma text
interface SignOptions {
  text: string;
}

const createSignature = (privateKey: PrivateKey) => {
  return async ({ text }: SignOptions) => {
    const message = await openpgp.createCleartextMessage({ text });

    const signature = await openpgp.sign({
      message,
      signingKeys: [privateKey],
    });

    return { text, signature };
  };
};

interface StampOptions extends SignOptions {
  signature: string;
}

// Generate OpenTimestamps proof
const createStamp = () => {
  return async (options: StampOptions) => {
    const op = new ots.Ops.OpSHA256();
    const hash = createHash('sha256').update(options.signature).digest();
    const detached = ots.DetachedTimestampFile.fromHash(op, hash);

    await ots.stamp(detached);

    return {
      ...options,
      hash: hash.toString('hex'),
      ots: Buffer.from(detached.serializeToBytes()),
    };
  };
};

interface TimeStampDiplomaOptions {
  text: string;
}

export async function loadPrivateKey(config: OpenTimestampsConfig) {
  const { armoredKey, passphrase } = config;
  if (!armoredKey) {
    return null;
  }

  let privateKey = await openpgp.readPrivateKey({ armoredKey });

  if (passphrase) {
    privateKey = await openpgp.decryptKey({ passphrase, privateKey });
  }

  return privateKey;
}

export function createTimestamp(privateKey: PrivateKey | null) {
  if (!privateKey) {
    throw new Error('Private key is required');
  }

  const sign = createSignature(privateKey);
  const stamp = createStamp();

  return ({ text }: TimeStampDiplomaOptions) => {
    return getLatestBlockHash()
      .then((blockHash) => ({ blockHash, text }))
      .then(sign)
      .then(stamp);
  };
}
