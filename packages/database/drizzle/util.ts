import { type PgEnum, pgEnum } from 'drizzle-orm/pg-core';

type StringEnum = Record<string, string>;

export interface PgNativeEnum<E extends StringEnum>
  extends PgEnum<[E[keyof E], ...E[keyof E][]]> {}

export const pgNativeEnum = <N extends string, E extends StringEnum>(
  name: N,
  e: E,
) =>
  pgEnum(
    name,
    Object.values(e) as [E[keyof E], ...E[keyof E][]],
  ) as PgNativeEnum<E>;
