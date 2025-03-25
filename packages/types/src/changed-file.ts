export type LazyLoader = () => Promise<Buffer>;

/**
 * Changed content in a repository (agnostic to the repository)
 */
export interface ChangedFile {
  /** Path to the file */
  path: string;
  /** Full path to the file */
  fullPath?: string;
  /** Commit hash */
  commit: string;
  /** Commit timestamp */
  time: number;
  /** Raw data */
  load: LazyLoader;
}

/**
 * Changed assets in a repository (agnostic to the repository)
 */
export interface ChangedAsset {
  /** Path to the file */
  path: string;
  /** Full path to the file */
  fullPath?: string;
  /** Commit hash */
  commit: string;
  /** Commit timestamp */
  time: number;
  /** Raw data */
  load: LazyLoader;
}
