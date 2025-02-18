export type NonFunctionProperties<T> = Pick<
  T,
  {
    [K in keyof T]: T[K] extends (...args: any[]) => any ? never : K;
  }[keyof T]
>;

export const enumValues = <V>(obj: { [K: string]: V }) => {
  return Object.values(obj) as V[];
};

export const enumKeys = <
  K extends keyof T,
  T extends { [K in keyof T]: unknown },
>(
  obj: T,
): K[] => {
  return Object.keys(obj) as K[];
};
