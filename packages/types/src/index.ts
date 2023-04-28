/*
 * EXPORTS
 */
export type { default as Resource } from './sql/content/Resources';

export type ChangeKind = 'added' | 'modified' | 'removed' | 'renamed';

/**
 * Changed content in a repository (agnostic to the repository)
 *
 * @example
 * ```
 * {
 *  path: 'resources/books/1/resource.yml',
 *  kind: 'added',
 *  commit: '0e4e4c599c6a171463bec46611049dd63d293f59',
 *  time: '2021-05-01T12:00:00Z',
 *  url: 'https://raw.githubusercontent.com/blc-org/sovereignacademy-data/0e4e4c599c6a171463bec46611049dd63d293f59/resources/books/1/resource.yml'
 * }
 * ```
 */
export type ChangedFileBase = {
  /** Path to the file */
  path: string;
  /** Commit hash */
  commit: string;
  /** Commit timestamp */
  time: number;
} & (
  | {
      /** Change kind */
      kind: Exclude<ChangeKind, 'renamed'>;
      previousPath?: undefined;
    }
  | {
      /** Change kind */
      kind: Extract<ChangeKind, 'renamed'>;
      /** Previous path */
      previousPath: string;
    }
);

export type ChangedAsset = ChangedFileBase & {
  /** URL to the file */
  url: string;
};

export type ChangedFile = ChangedFileBase & {
  /** Raw data */
  data: string;
};
