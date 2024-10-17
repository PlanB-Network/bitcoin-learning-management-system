declare module 'opentimestamps' {
  class Op {}
  class OpSHA256 extends Op {}

  type GenericBuffer = ArrayBuffer | Uint8Array;

  interface Ops {
    OpSHA256: typeof OpSHA256;
  }

  class DetachedTimestampFile {
    static fromHash(op: Op, hash: GenericBuffer): DetachedTimestampFile;
    static fromBytes(op: Op, hash: GenericBuffer): DetachedTimestampFile;
    static deserialize(buffer: GenericBuffer): DetachedTimestampFile;
    serializeToBytes(): Uint8Array;
  }

  interface StampOptions {
    calendars?: string[]; // public calendar url list.
    m?: number; // at least M calendars replied.
  }

  function stamp(
    data: DetachedTimestampFile,
    options?: StampOptions,
  ): Promise<void>;

  interface InfoOptions {
    verbose?: boolean;
  }

  function info(data: DetachedTimestampFile, options?: InfoOptions): string;

  interface VerifyOptions {
    ignoreBitcoinNode?: boolean; // Ignore verification with bitcoin node, only with explorer.
    calendars?: boolean; // Override calendars in timestamp.
    timeout?: number; // Override timeout (default: 1000).
    esplora?: never; // todo
    whitelist?: never; // todo
  }

  interface VerifyResult {
    bitcoin?: { timestamp: number; height: number };
  }

  function verify(
    detachedStamped: DetachedTimestampFile,
    detachedOriginal: DetachedTimestampFile,
    options?: VerifyOptions,
  ): Promise<VerifyResult>;

  interface UpgradeOptions {
    calendars?: string[]; // Override calendars in timestamp.
    whitelist?: never; // todo
  }

  function upgrade(
    detachedStamped: DetachedTimestampFile,
    options?: UpgradeOptions,
  ): Promise<boolean>;

  interface DefaultExport {
    DetachedTimestampFile: typeof DetachedTimestampFile;
    upgrade: typeof upgrade;
    verify: typeof verify;
    stamp: typeof stamp;
    info: typeof info;
    Ops: Ops;
  }

  const ots: DefaultExport;
  export default ots;
}
