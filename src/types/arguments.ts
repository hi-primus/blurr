// eslint-disable-next-line @typescript-eslint/ban-types
export type NoArgs = {};
export type Cols = string | string[] | number | number[] | undefined;

const tidiedSymbol = Symbol('__tidied');

type ColumnsResultValue<TValue extends PythonCompatible> = Record<
  string,
  TValue & { [tidiedSymbol]?: true }
>;

type CompleteResultValue<
  TKey extends string,
  TValue extends PythonCompatible
> = Record<TKey, ColumnsResultValue<TValue & { [tidiedSymbol]?: true }>>;

export type TidiedOr<
  TKey extends string = string,
  TValue extends PythonCompatible = PythonCompatible
> =
  | (TValue & { [tidiedSymbol]?: true })
  | ColumnsResultValue<TValue>
  | CompleteResultValue<TKey, TValue>;

export type TidyValue<T extends TidiedOr<string, PythonCompatible>> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends TidiedOr<any, infer TValue> ? TValue : T;

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
