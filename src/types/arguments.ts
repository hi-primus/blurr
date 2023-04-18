// eslint-disable-next-line @typescript-eslint/ban-types
export type NoArgs = {};
export type Cols = string | string[] | number | number[] | undefined;
export type TidiedOr<TValue, TKey extends string = string> =
  | TValue
  | Record<TKey, Record<string, TValue>>;
export type ColsResult<T> = T | Record<string, T>;
export type SearchBy = 'full' | 'words' | 'chars' | 'values';
export type FunctionArgument = (v: PythonCompatible) => PythonCompatible;

export interface SourceArg {
  name: string;
  _blurrMember: 'source';
  toString: () => string;
}

export interface Name {
  name: string;
  _blurrMember: 'name';
  toString: () => string;
}

export interface RequestOptions {
  category?: string;
  priority?: number;
  getCode?: boolean;
}
