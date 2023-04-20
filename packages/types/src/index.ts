export type ChangeKind = 'added' | 'modified' | 'removed';

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
 *  url: 'https://raw.githubusercontent.com/blc-org/sovereignacademy-data/0e4e4c599c6a171463bec46611049dd63d293f59/resources/books/1/resource.yml',
 *  data: '...'
 * }
 * ```
 */
export interface ChangedFile {
  /** Path to the file */
  path: string;
  /** Type of the change */
  kind: ChangeKind;
  /** Commit hash */
  commit: string;
  /** Commit time */
  time: string;
  /** URL to the file */
  url: string;
  /** Raw data */
  data?: string;
}
