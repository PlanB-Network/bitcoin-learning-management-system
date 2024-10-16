declare module 'opentimestamps' {
  declare class Op {}
  declare class OpSHA256 extends Op {}

  declare type GenericBuffer = ArrayBuffer | Uint8Array;

  declare interface Ops {
    OpSHA256: typeof OpSHA256;
  }

  declare class DetachedTimestampFile {
    static fromHash(op: Op, hash: GenericBuffer): DetachedTimestampFile;
    static fromBytes(op: Op, hash: GenericBuffer): DetachedTimestampFile;
    static deserialize(buffer: GenericBuffer): DetachedTimestampFile;
    serializeToBytes(): Uint8Array;
  }

  interface StampOptions {
    calendars?: string[]; // public calendar url list.
    m?: number; // at least M calendars replied.
  }

  declare function stamp(
    data: DetachedTimestampFile,
    options?: StampOptions,
  ): Promise<void, Error>;

  interface InfoOptions {
    verbose?: boolean;
  }

  declare function info(
    data: DetachedTimestampFile,
    options?: InfoOptions,
  ): string;

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

  declare function verify(
    detachedStamped: DetachedTimestampFile,
    detachedOriginal: DetachedTimestampFile,
    options?: VerifyOptions,
  ): Promise<VerifyResult, Error>;

  interface UpgradeOptions {
    calendars?: string[]; // Override calendars in timestamp.
    whitelist?: never; // todo
  }

  declare function upgrade(
    detachedStamped: DetachedTimestampFile,
    options?: UpgradeOptions,
  ): Promise<HashMap<string, object>, Error>;

  declare const Ops: Ops;

  export default {
    DetachedTimestampFile,
    upgrade,
    verify,
    stamp,
    info,
    Ops,
  };
}
