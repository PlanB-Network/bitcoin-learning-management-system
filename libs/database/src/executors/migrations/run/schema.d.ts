export interface MigrationRunExecutorSchema {
  dir: string;
  file?: string;
  database?: string;
  drop?: boolean;
}
