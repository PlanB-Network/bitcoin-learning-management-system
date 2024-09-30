export type ChangeKind = 'added' | 'modified' | 'removed' | 'renamed';

interface ModifiedBaseFile {
  /** Path to the file */
  path: string;
  /** Full path to the file */
  fullPath?: string;
  /** Commit hash */
  commit: string;
  /** Commit timestamp */
  time: number;
  /** Raw data */
  data: string;
}

export interface RenamedFile extends ModifiedBaseFile {
  /** Change kind */
  kind: Extract<ChangeKind, 'renamed'>;
  /** Previous path */
  previousPath: string;
}

export interface ModifiedFile extends ModifiedBaseFile {
  /** Change kind */
  kind: Exclude<ChangeKind, 'renamed' | 'removed'>;
  /** Previous path */
  previousPath?: undefined;
}

export interface RemovedFile {
  /** Path to the file */
  path: string;
  /** Full path to the file */
  fullPath?: string;
  /** Change kind */
  kind: Extract<ChangeKind, 'removed'>;
}

/**
 * Changed content in a repository (agnostic to the repository)
 */
export type ChangedFile = ModifiedFile | RenamedFile | RemovedFile;
