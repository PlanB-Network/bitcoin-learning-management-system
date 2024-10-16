import ots from 'opentimestamps';

interface UpgradeOptions {
  calendars?: string[];
}

export const createUpgrade = (options?: UpgradeOptions) => {
  return (otsFile: Buffer): Promise<Buffer | null> => {
    const detached = ots.DetachedTimestampFile.deserialize(otsFile);

    return ots.upgrade(detached, options).then((upgraded: boolean) => {
      if (upgraded) {
        return Buffer.from(detached.serializeToBytes());
      }

      return null;
    });
  };
};
