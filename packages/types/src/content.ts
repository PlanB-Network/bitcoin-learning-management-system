/*
 * EXPORTS
 */
export type { default as Resource } from './sql/content/Resources';
export type { default as Course } from './sql/content/Courses';
export type { default as Tag } from './sql/content/Tags';
export type { default as Book } from './sql/content/Books';

export type ChangeKind = 'added' | 'modified' | 'removed' | 'renamed';

/**
 * Changed content in a repository (agnostic to the repository)
 *
 * @example
 * ```
 * {
 *  path: 'resources/books/1/resource.yml',
 *  commit: '0e4e4c599c6a171463bec46611049dd63d293f59',
 *  time: '2021-05-01T12:00:00Z',
 * }
 * ```
 */
interface ChangedFileBase {
  /** Path to the file */
  path: string;
  /** Commit hash */
  commit: string;
  /** Commit timestamp */
  time: number;
}

interface RenamedFile extends ChangedFileBase {
  /** Change kind */
  kind: Extract<ChangeKind, 'renamed'>;
  /** Previous path */
  previousPath: string;
}

interface ModifiedFile extends ChangedFileBase {
  /** Change kind */
  kind: Exclude<ChangeKind, 'renamed'>;
  previousPath?: undefined;
}

interface AssetFile extends ChangedFileBase {
  /** The file is an asset */
  isAsset: true;
  data?: undefined;
}

interface TextFile extends ChangedFileBase {
  /** The file is not an asset */
  isAsset: false;
  /** Raw data */
  data: string;
}

export type ChangedAssetFile = AssetFile & (ModifiedFile | RenamedFile);
export type ChangedTextFile = TextFile & (ModifiedFile | RenamedFile);
export type ChangedFile = ChangedAssetFile | ChangedTextFile;

export const isAssetFile = (file: ChangedFile): file is ChangedAssetFile =>
  file.isAsset;
