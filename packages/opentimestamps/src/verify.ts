import ots from 'opentimestamps';

interface VerifyOptions {
  ignoreBitcoinNode?: boolean;
}

type VerifyReturn = { timestamp: number; height: number } | null;

export const createVerify = (options?: VerifyOptions) => {
  return (otsFile: Buffer, targetHash: string): VerifyReturn => {
    const detached = ots.DetachedTimestampFile.deserialize(otsFile);

    const op = new ots.Ops.OpSHA256();
    const hash = Buffer.from(targetHash, 'hex');
    const original = ots.DetachedTimestampFile.fromHash(op, hash);

    return ots.verify(detached, original, options).bitcoin ?? null;
  };
};
