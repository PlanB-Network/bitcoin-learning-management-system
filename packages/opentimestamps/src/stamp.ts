import { createHash } from 'node:crypto';

import type { PrivateKey } from 'openpgp';
import { createCleartextMessage, sign } from 'openpgp';
import ots from 'opentimestamps';

const getLatestBlockHeight = async (): Promise<number> => {
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

const getLatestBlockHash = async (): Promise<string> => {
  const height = await getLatestBlockHeight();
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

interface TemplateOptions {
  blockHash: string;
  fullName: string;
  subject: string;
}

// TODO: read from template file
const fillTemplate = ({ blockHash, fullName, subject }: TemplateOptions) => {
  return `This is to certify that ${fullName} has successfully completed the ${subject} at block ${blockHash}.`;
};

interface GenerateOptions extends TemplateOptions {
  userName: string;
}

// Generate diploma text
const generateDiplomaText = ({ userName, ...opts }: GenerateOptions) => {
  const text = fillTemplate(opts);

  return { userName, text };
};

// Sign diploma text
interface SignOptions {
  userName: string;
  text: string;
}

const createSignature = (privateKey: PrivateKey) => {
  return async ({ userName, text }: SignOptions) => {
    const message = await createCleartextMessage({ text });

    const signature = await sign({
      message,
      signingKeys: [privateKey],
    });

    return { userName, text, signature };
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

    return { ...options, ots: Buffer.from(detached.serializeToBytes()) };
  };
};

interface TimeStampDiplomaOptions {
  userName: string;
  fullName: string;
  subject: string;
}

export function createTimeStampDiploma(ctx: { privateKey: PrivateKey }) {
  const sign = createSignature(ctx.privateKey);
  const stamp = createStamp();

  return (options: TimeStampDiplomaOptions) => {
    return getLatestBlockHash()
      .then((blockHash) => ({ blockHash, ...options }))
      .then(generateDiplomaText)
      .then(sign)
      .then(stamp);
  };
}
