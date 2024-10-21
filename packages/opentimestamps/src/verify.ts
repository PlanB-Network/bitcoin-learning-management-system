import ots from 'opentimestamps';

interface VerifyOptions {
  ignoreBitcoinNode?: boolean;
}

type VerifyReturn = { timestamp: number; height: number } | null;

export const createVerify = (options?: VerifyOptions) => {
  return async (otsFile: Buffer, targetHash: string): Promise<VerifyReturn> => {
    const detached = ots.DetachedTimestampFile.deserialize(otsFile);

    const op = new ots.Ops.OpSHA256();
    const hash = Buffer.from(targetHash, 'hex');
    const original = ots.DetachedTimestampFile.fromHash(op, hash);

    const res = await ots.verify(detached, original, options);

    return res.bitcoin ?? null;
  };
};
