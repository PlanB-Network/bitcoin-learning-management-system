import ots from 'opentimestamps';

interface UpgradeOptions {
  ignoreBitcoinNode?: boolean;
}

export const createVerify = (options?: UpgradeOptions) => {
  return (otsFile: Buffer, targetHash: string) => {
    const detached = ots.DetachedTimestampFile.deserialize(otsFile);

    const op = new ots.Ops.OpSHA256();
    const hash = Buffer.from(targetHash, 'hex');
    const original = ots.DetachedTimestampFile.fromHash(op, hash);

    return ots.verify(detached, original, options);
  };
};
