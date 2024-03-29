import type { Cols, NoArgs } from '../../../types/arguments';
import type { ArgsType, OperationCreator } from '../../../types/operation';
import type { Source } from '../../../types/source';
import { BlurrOperation } from '../factory';

function DataframeOperation<
  TA extends ArgsType = ArgsType,
  TR extends OperationCompatible = Source
>(operationCreator: OperationCreator) {
  return BlurrOperation<TA, TR>({
    ...operationCreator,
    sourceType: 'dataframe',
  });
}

export const operations = {
  columnsSample: DataframeOperation<
    NoArgs,
    { columns: { title: string }[]; value: PythonCompatible[] }
  >({
    name: 'columnsSample',
    targetType: 'value',
  }),
  ascii: DataframeOperation<NoArgs, string>({
    name: 'ascii',
    targetType: 'value',
  }),
  getMeta: DataframeOperation<{ spec: string }, string | undefined>({
    name: 'getMeta',
    targetType: 'value',
    args: [
      {
        name: 'spec',
      },
    ],
    getCode: function (kwargs: {
      source: string;
      target?: string;
      spec: string;
    }) {
      return (
        (kwargs.target ? `${kwargs.target} = ` : '') +
        `Meta.get(${kwargs.source}.meta, "${kwargs.spec}")`
      );
    },
  }),
  saveCsv: DataframeOperation<NoArgs, ArrayBuffer>({
    name: 'saveCsv',
    targetType: 'value',
    getCode: function (kwargs: { source: string }) {
      return `save_csv(${kwargs.source})`;
    },
  }),
  /** Get a random sample from a dataframe.
   * @param n - Number of rows to be sampled.
   * @param seed - Seed for sampling.
   * @param outputCols - Output columns.
   */
  sample: DataframeOperation<{ n: number; seed: number }>({
    targetType: 'dataframe',
    name: 'sample',
    args: [
      {
        name: 'n',
        default: 10,
      },
      {
        name: 'seed',
        default: 0,
      },
    ],
  }),
  /** Get a slice of a dataframe.
   * @param lower_bound - Lower bound of the slice.
   * @param upper_bound - Upper bound of the slice.
   */
  iloc: DataframeOperation<{ lower_bound: number; upper_bound: number }>({
    name: 'iloc',
    targetType: 'dataframe',
    args: [{ name: 'lower_bound' }, { name: 'upper_bound' }],
  }),
  copy: DataframeOperation<NoArgs>({
    name: 'copy',
    targetType: 'dataframe',
    createsNew: true,
  }),
  profile: DataframeOperation<
    { cols: Cols; bins: number; flush: boolean },
    {
      columns: Record<string, PythonCompatible>;
      summary: {
        data_types_list: string[];
        total_count_data_types: number;
        cols_count: number;
        rows_count: number;
        missing_count: number;
        p_missing: number;
      };
      name?: string;
      file_name?: string;
    }
  >({
    targetType: 'value',
    name: 'profile',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'bins',
        default: 10,
      },
      {
        name: 'flush',
        default: false,
      },
    ],
  }),
};
