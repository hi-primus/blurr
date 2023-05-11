import type {
  Cols,
  FunctionArgument,
  NoArgs,
  SearchBy,
  SourceArg,
  TidiedOr,
} from '../../../../types/arguments';
import type { ArgsType, OperationCreator } from '../../../../types/operation';
import type { Source } from '../../../../types/source';
import { RELATIVE_ERROR } from '../../../utils';
import { BlurrOperation } from '../../factory';

import { operations as maskOperations } from './mask';

function DataframeOperation<
  TA extends ArgsType = ArgsType,
  TR extends OperationCompatible = Source
>(operationCreator: OperationCreator) {
  return BlurrOperation<TA, TR>({
    ...operationCreator,
    sourceType: 'dataframe',
  });
}

function AggregationOperation<TA extends ArgsType = NoArgs>(
  operationCreator: Pick<OperationCreator, 'name' | 'args'>
) {
  type Args = { cols: Cols } & TA & { tidy: boolean; compute: boolean };

  operationCreator = Object.assign({ args: [] }, operationCreator);

  return DataframeOperation<Args, PythonCompatible>({
    targetType: 'value',
    name: operationCreator.name,
    args: [
      {
        name: 'cols',
        default: '*',
      },
      ...(operationCreator.args || []),
      {
        name: 'tidy',
        default: true,
      },
      {
        name: 'compute',
        default: true,
      },
    ],
  });
}

function DateDataframeOperation(name: string) {
  return DataframeOperation<{ cols: Cols; outputCols: Cols }>({
    targetType: 'dataframe',
    name,
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'value',
        default: null,
      },
      {
        name: 'dateFormat',
        default: null,
      },
      {
        name: 'round',
        default: null,
      },
      {
        name: 'outputCols',
        default: null,
      },
      {
        name: 'func',
        default: null,
      },
    ],
  });
}

function StandardDataframeOperation(name: string) {
  return DataframeOperation<{ cols: Cols; outputCols: Cols }>({
    targetType: 'dataframe',
    name,
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  });
}

function ColsMathOperation(name: string) {
  return DataframeOperation<{ cols: Cols; outputCols: Cols }>({
    targetType: 'dataframe',
    name,
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  });
}

export const operations = {
  ...maskOperations,
  append: DataframeOperation<{ dfs: SourceArg[]; buckets: number }, Source>({
    targetType: 'dataframe',
    name: 'cols.append',
    args: [
      {
        name: 'dfs',
        required: true,
      },
    ],
  }),
  /** Concatenate two dataframes.
   * @param dfs - Dataframes to concatenate.
   * @returns - Dataframe with the concatenated columns.
   */
  concat: DataframeOperation<{ dfs: SourceArg[] }>({
    targetType: 'dataframe',
    name: 'cols.concat',
    args: [
      {
        name: 'dfs',
        required: true,
      },
    ],
  }),
  /** Join two dataframes using a column.
   * @param dfRight - Dataframe to join.
   * @param how - Type of join.
   * @param on - Column to join on.
   * @param leftOn - Column to join on in the left dataframe.
   * @param rightOn - Column to join on in the right dataframe.
   * @param keyMiddle - If true, the key column will be placed in the middle of the dataframe.
   * @returns - Dataframe with the joined columns.
   */
  join: DataframeOperation<{
    dfRight: SourceArg;
    on: string;
    how: 'left' | 'right' | 'inner' | 'outer';
    leftOn: string;
    rightOn: string;
    keyMiddle: boolean;
  }>({
    targetType: 'dataframe',
    name: 'cols.join',
    args: [
      {
        name: 'dfRight',
      },
      {
        name: 'how',
        default: 'left',
      },
      {
        name: 'on',
        default: null,
      },
      {
        name: 'leftOn',
        default: null,
      },
      {
        name: 'rightOn',
        default: null,
      },
      {
        name: 'keyMiddle',
        default: false,
      },
    ],
  }),
  /** Select columns in a dataframe.
   * @param cols - Columns to be selected.
   * @param regex - Regex pattern to match columns.
   * @param dataType - Data type of the columns.
   * @param invert - Invert the selection.
   * @param acceptsMissingCols - If true, the operation will not fail if some of the columns are missing.
   * @returns - Dataframe with the selected columns.
   */
  select: DataframeOperation<{ cols: Cols }>({
    targetType: 'dataframe',
    name: 'cols.select',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'regex',
        default: null,
      },
      {
        name: 'dataType',
        default: null,
      },
      {
        name: 'invert',
        default: false,
      },
      {
        name: 'acceptsMissingCols',
        default: false,
      },
    ],
  }),
  /** Copy a column or multiple columns.
   * @param cols - Columns to be copied.
   * @param outputCols - Output columns.
   * @returns - Dataframe with the new columns.
   */
  copy: DataframeOperation<{ cols: Cols; outputCols: Cols }>({
    targetType: 'dataframe',
    name: 'cols.copy',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Drop columns from a dataframe.
   * @param cols - Columns to be dropped.
   * @param regex - Regex pattern to match columns.
   * @param data_type - Data type of the columns.
   * @returns - Dataframe without the columns.
   */
  drop: DataframeOperation<{ cols: Cols; regex: string; data_type: string }>({
    targetType: 'dataframe',
    name: 'cols.drop',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'regex',
        default: null,
      },
      {
        name: 'data_type',
        default: null,
      },
    ],
  }),
  /** Keep columns in a dataframe.
   * @param cols - Columns to be kept.
   * @param regex - Regex pattern to match columns.
   * @returns - Dataframe with the columns.
   */
  keep: DataframeOperation<{ cols: Cols; regex: string }>({
    targetType: 'dataframe',
    name: 'cols.keep',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'regex',
        default: null,
      },
    ],
  }),
  /** Convert a column to timestamp.
   * @param cols - Columns to be converted.
   * @param format - Timestamp format.
   * @returns - Dataframe with the new column.
   */
  toTimeStamp: DataframeOperation<{ cols: Cols; format: string }>({
    targetType: 'dataframe',
    name: 'cols.toTimeStamp',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'format',
        default: null,
      },
    ],
  }),
  /** Convert a column to a list.
   * @param cols - Columns to be converted.
   * @returns - Dataframe with the new column.
   */
  toList: DataframeOperation<{ cols: Cols }>({
    targetType: 'value',
    name: 'cols.toList',
    args: [
      {
        name: 'cols',
        default: '*',
      },
    ],
  }),
  // TODO:Support UDF
  /** Set a column value using a number, string or an expression.
   * @param cols - Columns to be updated.
   * @param valueFunc - Function to calculate the new value. It can be a number, string or an expression.
   * @param where - Expression to filter rows.
   * @param args - Arguments to be passed to the function.
   * @param default - Default value to use when the valueFunc returns null or undefined.
   * @param evalValue - Indicates if the valueFunc should be evaluated.
   * @param each - Indicates if the valueFunc should be evaluated for each row or just once.
   * @param evalVariables - Variables to be passed to the expression evaluator.
   * @returns - Dataframe with the new column value.
   */
  set: DataframeOperation<{
    cols: Cols;
    valueFunc: FunctionArgument | PythonCompatible;
    where: string;
    args: PythonCompatible[];
    default: PythonCompatible;
    evalValue: boolean;
    each: boolean;
    evalVariables: Record<string, PythonCompatible>;
  }>({
    targetType: 'dataframe',
    name: 'cols.set',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'valueFunc',
        default: null,
      },
      {
        name: 'where',
        default: null,
      },
      {
        name: 'args',
        default: null,
      },
      {
        name: 'default',
        default: null,
      },
      {
        name: 'evalValue',
        default: false,
      },
      {
        name: 'each',
        default: true,
      },
      {
        name: 'evalVariables',
        default: null,
      },
    ],
  }),
  /** Rename one or multiple columns.
   * @param cols - Columns to be renamed
   * @param names - New names to be assigned
   * @param func - Function to be applied to the column names
   * @returns - A dataframe with the renamed columns
   */
  rename: DataframeOperation<{
    cols: Cols;
    names: Cols;
    func: FunctionArgument;
  }>({
    targetType: 'dataframe',
    name: 'cols.rename',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'outputCols',
        // TODO: use argName to override python argument name
        // name: 'names',
        // argName: 'output_cols',
        default: null,
      },
      {
        name: 'func',
      },
    ],
  }),
  /** Parse a engine column specific data type to a profiler data type.
   * @param colDataType - Column data type to be parsed
   * @returns - A dataframe with the parsed data type
   */
  parseInferredTypes: DataframeOperation<{ colDataType }>({
    targetType: 'value',
    name: 'cols.parseInferredTypes',
    args: [
      {
        name: 'colDataType',
      },
    ],
  }),
  /** Returns the inferred data type of the column
   * @param cols - Columns to be processed
   * @param useInternal - Use internal data type
   * @param calculate - Calculate the inferred data type
   * @param tidy - Tidy output
   * @returns - A dataframe with the inferred data type
   */
  inferredDataType: DataframeOperation<
    {
      cols: Cols;
      useInternal: boolean;
      calculate: boolean;
      tidy: boolean;
    },
    TidiedOr<'inferred_data_type', string>
  >({
    targetType: 'value',
    name: 'cols.inferredDataType',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'useInternal',
      },
      {
        name: 'calculate',
      },
      {
        name: 'tidy',
        default: true,
      },
    ],
  }),
  /** Set user defined date format in the metadata
   * @param cols - Columns to be processed
   * @param dataTypes - Date format
   * @param inferred - Infer date format
   * @returns - A dataframe with the new date format
   */
  setDataType: DataframeOperation<{
    cols: Cols;
    dataTypes: string;
    inferred: boolean;
  }>({
    targetType: 'dataframe',
    name: 'cols.setDataType',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'dataTypes',
        default: null,
      },
      {
        name: 'inferred',
        default: false,
      },
    ],
  }),
  /** Unset user set data type.
   * @param cols - Columns to be processed
   * @returns - A dataframe with the un-setted data type
   */
  unSetDateType: DataframeOperation<{ cols: Cols }>({
    targetType: 'dataframe',
    name: 'cols.unSetDateType',
    args: [
      {
        name: 'cols',
        default: '*',
      },
    ],
  }),
  /** Cast the elements inside a column or a list of columns to a specific data type.
   * @param cols - Columns to be processed
   * @param dataType - Data type to be casted
   * @param outputCols - Output columns
   * @returns - A dataframe with the casted columns
   */
  cast: DataframeOperation<{ cols: Cols; dataType: string; outputCols: Cols }>({
    targetType: 'dataframe',
    name: 'cols.cast',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'dataType',
        default: null,
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Returns the profile of selected columns.
   * @param cols - Columns to be processed
   * @param bins - Number of bins to be used
   * @param flush - Flush the cache
   * @returns - A dataframe with the profile of the selected columns
   */
  profile: DataframeOperation<{ cols: Cols; bins: number; flush: boolean }>({
    targetType: 'value',
    name: 'cols.profile',
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
  /** Replace alphanumeric and punctuation chars for canned chars. We aim to help to find string patterns
     c = Any alpha char in lower or upper case
     l = Any alpha char in lower case
     U = Any alpha char in upper case
     * = Any alphanumeric in lower or upper case. Used only in type 2 nd 3
     # = Any numeric
     ! = Any punctuation
   * @param cols - Columns to be processed
   * @param outputCols - Output columns
   * @param mode - 1: Replace all chars except the ones specified in chars arg. 2: Replace only the chars specified in chars arg. 3: Replace chars specified in chars arg and replace the rest with the char specified in the char arg

   */
  pattern: DataframeOperation<{ cols: Cols; outputCols: Cols; mode: number }>({
    targetType: 'dataframe',
    name: 'cols.pattern',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'outputCols',
        default: null,
      },
      {
        name: 'mode',
        default: 0,
      },
    ],
  }),
  /** Assign new columns to a Dataframe.
   * @param cols - Columns to be assigned
   * @param values - Value to be assigned or a function to compute the value
   * @returns - Dataframe with new columns assigned
   */
  assign: DataframeOperation<{
    cols: Cols;
    value;
    [k: string]: PythonCompatible;
  }>({
    targetType: 'dataframe',
    name: 'cols.assign',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'value',
        default: null,
      },
    ],
  }),
  /** Compute pairwise correlation of columns, excluding NA/null values.
   * @param cols - Columns to be used to compute the correlation
   * @param method - Correlation method to be used. 'pearson', 'spearman', 'kendall'
   * @param compute - If True, compute the operation and return the table. Otherwise, return a function that can be passed to a dataframe
   * @returns - A dataframe with the correlation of each combination of columns
   */
  correlation: AggregationOperation<{
    method: string;
  }>({
    name: 'cols.correlation',
    args: [
      {
        name: 'method',
        default: 'pearson',
      },
    ],
  }),
  /** By default, computes a frequency table of the factors unless an array of values and an aggregation function are passed.
   * @param colX - Column to be used as X
   * @param colY - Column to be used as Y
   * @param output - Column name for the output
   * @param compute - If True, compute the operation and return the table. Otherwise, return a function that can be passed to a dataframe
   * @returns - A dataframe with the frequency of appearance of each combination of values between the two columns
   */
  crossTab: DataframeOperation<{
    colX: Cols;
    colY: Cols;
    output: string;
    compute;
  }>({
    targetType: 'dataframe',
    name: 'cols.crossTab',
    args: [
      {
        name: 'colX',
      },
      {
        name: 'colY',
      },
      {
        name: 'output',
      },
      {
        name: 'compute',
        default: true,
      },
    ],
  }),
  /** Get how many equal patterns there are in a column. Triggers the operation only if necessary.
   * @param cols: Columns to be transformed
   * @param n: Number of patterns to be returned
   * @param mode: 1: Ordered by frequency. 2: Ordered by appearance
   * @param flush: If True, flushes cache
   * @param tidy: If True, returns a dataframe. If False, returns an object
   * @return: Dataframe with columns transformed
   */
  patternCounts: DataframeOperation<
    {
      cols: Cols;
      n: number;
      mode: number;
      flush: boolean;
      tidy: boolean;
    },
    TidiedOr<
      'pattern_counts',
      {
        more: boolean;
        updated: number;
        values: { value: string; count: number }[];
      }
    >
  >({
    targetType: 'value',
    name: 'cols.patternCounts',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'n',
        default: 10,
      },
      {
        name: 'mode',
        default: 0,
      },
      {
        name: 'flush',
        default: false,
      },
      {
        name: 'tidy',
        default: true,
      },
    ],
  }),
  /** Group by a column and aggregate the values of another column.
   * @param by - Column to group by
   * @param agg - Aggregation function to apply
   * @returns - Dataframe with the grouped columns
   */
  groupBy: DataframeOperation<{ by: Cols; agg: string }>({
    targetType: 'dataframe',
    name: 'cols.groupby',
    args: [
      {
        name: 'by',
      },
      {
        name: 'agg',
      },
    ],
  }),
  /** Move a column to a specific position.
   * @param column - Column to be moved
   * @param position - 'before' or 'after'
   * @param refCol - Reference column
   * @returns - Dataframe with the moved column
   */
  move: DataframeOperation<{
    column: Cols;
    position: string | number;
    refCol: string;
  }>({
    targetType: 'dataframe',
    name: 'cols.move',
    args: [
      {
        name: 'column', // 'col' TODO: fix name != argName
        argName: 'column',
        default: '*',
      },
      {
        name: 'position',
        default: 'after',
      },
      {
        name: 'refCol',
        default: null,
      },
    ],
  }),
  /** Sort the columns by name.
   * @param order - 'ascending' or 'descending'
   * @param cols - Columns to be transformed
   * @returns - Dataframe with the sorted columns
   */
  sort: DataframeOperation<{ order: string; cols: Cols }>({
    targetType: 'dataframe',
    name: 'cols.sort',
    args: [
      {
        name: 'order',
        default: 'ascending',
      },
      {
        name: 'cols',
      },
    ],
  }),
  /** Return the column(s) data type as string.
   * @param cols - Columns to be transformed
   * @param names - Whether to return the result as a string or an array of strings
   * @param tidy - Whether to return the result as a tidy dataframe
   * @returns - Dataframe with the data type of the columns
   */
  dataType: DataframeOperation<{ cols: Cols; names: string; tidy: boolean }>({
    targetType: 'value',
    name: 'cols.dataType',
    args: [
      {
        name: 'cols',
      },
      {
        name: 'names',
        default: false,
      },
      {
        name: 'tidy',
        default: true,
      },
    ],
  }),
  /** Return the column(s) data type as Type.
   * @param cols - Columns to be transformed
   * @param tidy - Whether to return the result as a tidy dataframe
   * @returns - Dataframe with the data type of the columns
   */
  schemaDataType: DataframeOperation<{ cols: Cols; tidy: boolean }>({
    targetType: 'value',
    name: 'cols.schemaDataType',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'tidy',
        default: true,
      },
    ],
  }),
  /** Return the median absolute deviation over one or more columns.
   * @param cols - Columns to be transformed
   * @param relativeError - Whether to use relative error
   * @param more - Whether to return more information
   * @param estimate - Whether to use the estimated median
   * @tidy - Whether to return the result as a tidy dataframe
   * @returns - Dataframe with the mad values
   */
  mad: AggregationOperation<{
    relativeError: boolean;
    more: boolean;
    estimate: boolean;
  }>({
    name: 'cols.mad',
    args: [
      {
        name: 'relativeError',
        default: RELATIVE_ERROR,
      },
    ],
  }),
  /** Get the minimum value of the requested columns.
   * @param cols - Columns to be transformed
   * @param numeric - Whether to return the result as a tidy dataframe
   * @tidy - Whether to return the result as a tidy dataframe
   * @compute - Whether to compute immediately
   * @returns - Dataframe with the min values
   */
  min: AggregationOperation<{ numeric: boolean }>({
    name: 'cols.min',
    args: [
      {
        name: 'numeric',
        default: null,
      },
    ],
  }),
  /** Get the maximum value of the requested columns.
   * @param cols - Columns to be transformed
   * @param numeric - Whether to return the result as a tidy dataframe
   * @tidy - Whether to return the result as a tidy dataframe
   * @compute - Whether to compute immediately
   * @returns - Dataframe with the max values
   */
  max: AggregationOperation<{ numeric: boolean }>({
    name: 'cols.max',
    args: [
      {
        name: 'numeric',
        default: null,
      },
    ],
  }),
  /*
  mode: AggregationOperation({
    name: 'cols.mode',
  }),
  /** Return the minimum and maximum of the values over the requested columns.
  * @param cols - Columns to be transformed
  * @param tidy - Whether to return the result as a tidy dataframe
  * @param compute - Whether to compute immediately
  * @returns - Dataframe with the min and max values
   */
  range: AggregationOperation({
    name: 'cols.range',
  }),
  /** Return values at the given percentile over requested column.
   * @param cols - Columns to be transformed
   * @param values - Percentile values
   * @param relativeError - Relative Error
   * @estimate - Whether to use estimate or not
   * @tidy - Whether to return the result as a tidy dataframe
   * @compute - Whether to compute immediately
   * @returns - Dataframe with the values at the given percentile
   */
  percentile: AggregationOperation<{
    values: number;
    relativeError: number;
    estimate: boolean;
  }>({
    name: 'cols.percentile',
    args: [
      {
        name: 'values',
        default: null,
      },
      {
        name: 'relativeError',
        default: RELATIVE_ERROR,
      },
      {
        name: 'estimate',
        default: true,
      },
    ],
  }),
  /** Return the median of the values over the requested column.
   * @param cols - Columns to be transformed
   * @param relativeError - Relative Error
   * @param tidy - Whether to return the result as a tidy dataframe
   * @param compute - Whether to compute immediately
   * @returns - Dataframe with the median of the values
   */
  median: AggregationOperation<{
    relativeError: number;
  }>({
    name: 'cols.median',
    args: [
      {
        name: 'relativeError',
        default: RELATIVE_ERROR,
      },
    ],
  }),
  /** Return the variance of the values over the requested column.
   * @param cols - Columns to be transformed
   * @param tidy - Whether to return the result as a tidy dataframe
   * @param compute - Whether to compute immediately
   * @returns - Dataframe with the variance of the values
   */
  kurtosis: AggregationOperation({
    name: 'cols.kurtosis',
  }),
  /** Return the skew of the values over the requested column.
   * @param cols - Columns to be transformed
   * @param tidy - Whether to return the result as a tidy dataframe
   * @param compute - Whether to compute immediately
   * @returns - Dataframe with the skew of the values
   */
  skew: AggregationOperation({
    name: 'cols.skew',
  }),
  /** Return the mean of the values over the requested column.
   * @param cols - Columns to be transformed
   * @param tidy - Whether to return the result as a tidy dataframe
   * @param compute - Whether to compute immediately
   * @returns - Dataframe with the mean of the values
   */
  mean: AggregationOperation({
    name: 'cols.mean',
  }),
  /** Return the sum of the values over the requested column.
   * @param cols - Columns to be transformed
   * @param tidy - Whether to return the result as a tidy dataframe
   * @param compute - Whether to compute immediately
   * @returns - Dataframe with the sum of the values
   */
  sum: AggregationOperation({
    name: 'cols.sum',
  }),
  /** Return the prod of the values over the requested column.
   * @param cols - Columns to be transformed
   * @param tidy - Whether to return the result as a tidy dataframe
   * @param compute - Whether to compute immediately
   * @returns - Dataframe with the prod of the values
   */
  prod: AggregationOperation({
    name: 'cols.prod',
  }),
  /** Get the cumulative sum of a numeric column.
   * @param cols - Columns to be transformed
   * @param outputCols - Output columns names
   * @returns - Dataframe with the cumulative sum
   */
  cumSum: DataframeOperation<{ cols: Cols; outputCols: Cols }>({
    targetType: 'dataframe',
    name: 'cols.cumSum',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Get the cumulative product of a numeric column.
   * @param cols - Columns to be transformed
   * @param outputCols - Output columns names
   * @returns - Dataframe with the cumulative product
   */
  cumProd: DataframeOperation<{ cols: Cols; outputCols: Cols }>({
    targetType: 'dataframe',
    name: 'cols.cumProd',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Get the cumulative maximum of a numeric column.
   * @param cols - Columns to be transformed
   * @param outputCols - Output columns names
   * @returns - Dataframe with the cumulative maximum
   */
  cumMax: DataframeOperation<{ cols: Cols; outputCols: Cols }>({
    targetType: 'dataframe',
    name: 'cols.cumMax',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Get the cumulative minimum of a numeric column.
   * @param cols - Columns to be transformed
   * @param outputCols - Output columns names
   * @returns - Dataframe with the cumulative minimum
   */
  cumMin: DataframeOperation<{ cols: Cols; outputCols: Cols }>({
    targetType: 'dataframe',
    name: 'cols.cumMin',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Get the variance of a numeric column.
   * @param cols - Columns to be transformed
   * @param compute - Whether to compute immediately
   * @param tidy - Whether to return the output in tidy format
   * @returns - Dataframe with the variance
   */
  variance: AggregationOperation({
    name: 'cols.var',
  }),
  /** Get the standard deviation of a numeric column.
   * @param cols - Columns to be transformed
   * @param compute - Whether to compute immediately
   * @param cached - Whether to used cached results
   * @returns - Dataframe with the standard deviation
   */
  std: AggregationOperation({
    name: 'cols.std',
  }),
  /** Get the date format from a column, compatible with 'format_date'.
   * @param cols - Columns to be transformed
   * @param tidy - Whether to return the output in tidy format
   * @param compute - Whether to compute immediately
   * @returns - Dataframe with the date format
   */
  dateFormat: DataframeOperation<{
    cols: Cols;
    tidy: boolean;
    compute: boolean;
    cached: boolean;
    [k: string]: PythonCompatible;
  }>({
    targetType: 'dataframe',
    name: 'cols.dateFormat',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'tidy',
        default: true,
      },
      {
        name: 'compute',
        default: true,
      },
      {
        name: 'cached',
        default: null,
      },
    ],
  }),
  /** Get an item from a list in a cell and put it in another column.
   * @param col - Column to be transformed
   * @param index - Index to be extracted
   * @param outputCols - Output columns names
   * @returns - Dataframe with the extracted item
   */
  item: DataframeOperation<{ col: Cols; index: number; outputCols: Cols }>({
    targetType: 'dataframe',
    name: 'cols.item',
    args: [
      {
        name: 'col',
        default: '*',
      },
      {
        name: 'index',
        default: 0,
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Return items from a dict over requested columns.
   * @param col - Column to be transformed
   * @param keys - Keys to be extracted
   * @param outputCols - Output columns names
   * @returns - Dataframe with the extracted keys
   */
  get: DataframeOperation<{ col: Cols; keys: number; outputCols: Cols }>({
    targetType: 'dataframe',
    name: 'cols.get',
    args: [
      {
        name: 'col',
        default: '*',
      },
      {
        name: 'keys',
        default: null,
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Return the absolute value of each element in the DataFrame.
   * @param cols - Columns to be transformed
   * @param outputCols - Output columns names
   * @returns - Dataframe with the absolute value of each element in the DataFrame.
   */
  abs: DataframeOperation<{ cols: Cols; outputCols: Cols }>({
    targetType: 'dataframe',
    name: 'cols.abs',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Return Euler's number, e (~2.718) raised to the power of each value in a column.
   * @param cols - Columns to be transformed
   * @param outputCols - Output columns names
   * @returns - Dataframe with the exponential of each value in a column.
   */
  exp: DataframeOperation<{ cols: Cols; outputCols: Cols }>({
    targetType: 'dataframe',
    name: 'cols.exp',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Calculate th logarithm base 10 of each value in a column.
   * @param cols - Columns to be transformed
   * @param outputCols - Output columns names
   * @returns - Dataframe with the logarithm base 10 of each value in a column.
   */
  log: DataframeOperation<{ cols: Cols; base: number; outputCols: Cols }>({
    targetType: 'dataframe',
    name: 'cols.log',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'base',
        default: 10,
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Calculate the natural logarithm of the values
   * @param cols - Columns to be transformed
   * @param outputCols - Output columns names
   * @returns - Dataframe with the natural logarithm of the values plus one
   */
  ln: DataframeOperation<{ cols: Cols; outputCols: Cols }>({
    targetType: 'dataframe',
    name: 'cols.ln',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Calculate the square of the values
   * @param cols - Columns to be transformed
   * @param outputCols - Output columns names
   * @returns - Dataframe with the square of the values
   */
  pow: DataframeOperation<{ cols: Cols; outputCols: Cols; power: number }>({
    targetType: 'dataframe',
    name: 'cols.pow',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'power',
        default: 1,
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Calculate the square of the values
   * @param cols - Columns to be transformed
   * @param outputCols - Output columns names
   * @returns - Dataframe with the square of the values
   */
  sqrt: DataframeOperation<{ cols: Cols; outputCols: Cols }>({
    targetType: 'dataframe',
    name: 'cols.sqrt',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Calculate the reciprocal(1/x) of each value in a column.
   * @param cols - Columns to be transformed
   * @param outputCols - Output columns names
   * @returns - Dataframe with the reciprocal of the values
   */
  reciprocal: DataframeOperation<{ cols: Cols; outputCols: Cols }>({
    targetType: 'dataframe',
    name: 'cols.reciprocal',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Calculate the round of the values
   * @param cols - Columns to be transformed
   * @param outputCols - Output columns names
   * @param decimals - Number of decimal places to round to
   */
  round: DataframeOperation<{ cols: Cols; outputCols: Cols; decimals: number }>(
    {
      targetType: 'dataframe',
      name: 'cols.round',
      args: [
        {
          name: 'cols',
          default: '*',
        },
        {
          name: 'outputCols',
          default: null,
        },
      ],
    }
  ),
  /** Calculate the floor of the values
   * @param cols - Columns to be transformed
   * @param outputCols - Output columns names
   * @returns Dataframe with new columns containing the floor of the values
   */
  floor: DataframeOperation<{ cols: Cols; outputCols: Cols }>({
    targetType: 'dataframe',
    name: 'cols.floor',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Calculate the ceiling of the values
   * @param cols - Columns to be transformed
   * @param outputCols - Output columns names
   * @returns Dataframe with new columns containing the ceiling of the values
   */
  ceil: DataframeOperation<{ cols: Cols; outputCols: Cols }>({
    targetType: 'dataframe',
    name: 'cols.ceil',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Calculate the Sine
   * @param cols - Columns to be transformed
   * @param outputCols - Output columns names
   * @returns Dataframe with new columns containing the sine of the values
   */
  sin: StandardDataframeOperation('cols.sin'),
  /** Calculate the Cosine
   * @param cols - Columns to be transformed
   * @param outputCols - Output columns names
   * @returns Dataframe with new columns containing the cosine of the values
   */
  cos: StandardDataframeOperation('cols.cos'),
  /** Calculate the Tangent
   * @param cols - Columns to be transformed
   * @param outputCols - Output columns names
   * @returns Dataframe with new columns containing the tangent of the values
   */
  tan: StandardDataframeOperation('cols.tan'),
  /** Calculate the Arc sine
   * @param cols - Columns to be transformed
   * @param outputCols - Output columns names
   * @returns Dataframe with new columns containing the arc sine of the values
   */
  asin: StandardDataframeOperation('cols.asin'),
  /** Calculate the Arc cosine
   * @param cols - Columns to be transformed
   * @param outputCols - Output columns names
   * @returns Dataframe with new columns containing the arc cosine of the values
   */
  acos: StandardDataframeOperation('cols.acos'),
  /** Calculate the Arc tangent
   * @param cols - Columns to be transformed
   * @param outputCols - Output columns names
   * @returns Dataframe with new columns containing the arc tangent of the values
   */
  atan: StandardDataframeOperation('cols.atan'),
  /** Calculate the Hyperbolic sine
   * @param cols - Columns to be transformed
   * @param outputCols - Output columns names
   * @returns Dataframe with new columns containing the hyperbolic sine of the values
   */
  sinh: StandardDataframeOperation('cols.sinh'),
  /** Calculate the Hyperbolic cosine
   * @param cols - Columns to be transformed
   * @param outputCols - Output columns names
   * @returns Dataframe with new columns containing the hyperbolic cosine of the values
   */
  cosh: StandardDataframeOperation('cols.cosh'),
  /** Calculate the Hyperbolic tangent
   * @param cols - Columns to be transformed
   * @param outputCols - Output columns names
   * @returns Dataframe with new columns containing the hyperbolic tangent of the values
   */
  tanh: StandardDataframeOperation('cols.tanh'),
  /** Calculate the Inverse sine
   * @param cols - Columns to be transformed
   * @param outputCols - Output columns names
   * @returns Dataframe with new columns containing the inverse sine of the values
   */
  asinh: StandardDataframeOperation('cols.asinh'),
  /** Calculate the Inverse hyperbolic cosine
   * @param cols - Columns to be transformed
   * @param outputCols - Output columns names
   * @returns Dataframe with new columns containing the inverse hyperbolic cosine of the values
   */
  acosh: StandardDataframeOperation('cols.acosh'),
  /** Calculate the Inverse hyperbolic tangent
   * @param cols - Columns to be transformed
   * @param outputCols - Output columns names
   * @returns Dataframe with new columns containing the inverse hyperbolic tangent of the values
   */
  atanh: StandardDataframeOperation('cols.atanh'),
  /** Slice substrings from each element in a column.
   * @param cols - Columns to be transformed
   * @param start - Starting index
   * @param end - Ending index
   * @param outputCols - Output columns names
   * @returns Dataframe with new columns containing the sliced values
   */
  substring: DataframeOperation<{
    cols: Cols;
    start: number;
    end: number;
    outputCols: Cols;
  }>({
    targetType: 'dataframe',
    name: 'cols.substring',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'start',
        default: null,
      },
      {
        name: 'end',
        default: null,
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Extract a string that match a regular expression.
   * @param cols - Columns to be transformed
   * @param regex - Regular expression to be matched
   * @param replacement - Replacement string
   * @param outputCols - Output columns names
   * @returns Dataframe with new columns containing the extracted values
   */

  extract: DataframeOperation<{ cols: Cols; regex: string; outputCols: Cols }>({
    targetType: 'dataframe',
    name: 'cols.extract',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'regex',
        default: null,
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** TODO: implement */
  slice: DataframeOperation<{
    cols: Cols;
    start: number;
    stop: number;
    step: number;
    outputCols: Cols;
  }>({
    targetType: 'dataframe',
    name: 'cols.slice',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'start',
        default: null,
      },
      {
        name: 'stop',
        default: null,
      },
      {
        name: 'step',
        default: null,
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Get the leftmost n characters of each string in a column
   * @param cols - Columns to be processed.
   * @param n - Number of characters to be extracted.
   * @param outputCols - Output columns.
   * @returns Dataframe with new substring columns.
   */
  left: DataframeOperation<{ cols: Cols; n: number; outputCols: Cols }>({
    targetType: 'dataframe',
    name: 'cols.left',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'n',
        default: null,
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Get the rightmost n characters of each string in a column
   * @param cols - Columns to be processed.
   * @param n - Number of characters to be extracted.
   * @param outputCols - Output columns.
   * @returns Dataframe with new substring columns.
   */
  right: DataframeOperation<{ cols: Cols; n: number; outputCols: Cols }>({
    targetType: 'dataframe',
    name: 'cols.right',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'n',
        default: null,
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Get the substring from two indices or from an index and a length
   * @param cols - Columns to be processed.
   * @param start - Starting index.
   * @param end - Ending index.
   * @param n - Length of the substring.
   * @param outputCols - Output columns.
   * @returns Dataframe with new substring columns.
   */
  mid: DataframeOperation<{
    cols: Cols;
    start: number;
    end: number;
    n: number;
    outputCols: Cols;
  }>({
    targetType: 'dataframe',
    name: 'cols.mid',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'start',
        default: 0,
      },
      {
        name: 'end',
        default: null,
      },
      {
        name: 'n',
        default: null,
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Cast to float.
   * @param cols - Columns to be casted.
   * @param outputCols - Output columns.
   * @returns Dataframe with new float columns.
   */
  toFloat: DataframeOperation<{ cols: Cols; outputCols: Cols }>({
    targetType: 'dataframe',
    name: 'cols.toFloat',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Cast to numeric.
   * @param cols - Columns to be casted.
   * @param outputCols - Output columns.
   * @returns Dataframe with new numeric columns.
   */
  toNumeric: DataframeOperation<{ cols: Cols; outputCols: Cols }>({
    targetType: 'dataframe',
    name: 'cols.toNumeric',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Cast to integer.
   * @param cols - Columns to be casted.
   * @param outputCols - Output columns.
   * @returns Dataframe with new integer columns.
   */
  toInteger: DataframeOperation<{ cols: Cols; outputCols: Cols }>({
    targetType: 'dataframe',
    name: 'cols.toInteger',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Cast to boolean.
   * @param cols - Columns to be casted.
   * @param outputCols - Output columns.
   * @returns Dataframe with new boolean columns.
   */
  toBoolean: DataframeOperation<{ cols: Cols; outputCols: Cols }>({
    targetType: 'dataframe',
    name: 'cols.toBoolean',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Cast columns to string type.
   * @param cols - Columns to be casted.
   * @param outputCols - Output columns.
   * @returns Dataframe with new string columns.
   */
  toString: DataframeOperation<{ cols: Cols; outputCols: Cols }>({
    targetType: 'dataframe',
    name: 'cols.toString',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Get the date format for every value in specified columns.
   * @param cols - Columns to be processed.
   * @param outputCols - Output columns.
   * @returns Dataframe with new date columns.
   */
  dateFormats: DataframeOperation<{ cols: Cols; outputCols: Cols }>({
    targetType: 'dataframe',
    name: 'cols.dateFormats',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Get a random sample from a dataframe.
   * @param cols - Columns to be sampled.
   * @param n - Number of rows to be sampled.
   * @param seed - Seed for sampling.
   * @param outputCols - Output columns.
   */
  sample: DataframeOperation<{ cols: Cols; outputCols: Cols }>({
    targetType: 'dataframe',
    name: 'cols.sample',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'n',
        default: 10,
      },
      {
        name: 'seed',
        default: 0,
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Convert a string column to lower case.
   * @param cols - Columns to be processed.
   * @param outputCols - Output columns.
   * @returns Dataframe with new lower case columns.
   */
  lower: StandardDataframeOperation('cols.lower'),
  /**
   * Convert a string column to upper case.
   * @param cols - Columns to be processed.
   * @param outputCols - Output columns.
   * @returns Dataframe with new upper case columns.
   */
  upper: StandardDataframeOperation('cols.upper'),
  /**
   * Convert a string column to snake case.
   * @param cols - Columns to be processed.
   * @param outputCols - Output columns.
   * @returns Dataframe with new snake case columns.
   */
  title: StandardDataframeOperation('cols.title'),
  /**
   * Convert a string column to snake case.
   * @param cols - Columns to be processed.
   * @param outputCols - Output columns.
   * @returns Dataframe with new snake case columns.
   */
  capitalize: StandardDataframeOperation('cols.capitalize'),
  /** Pad a string column to a fixed width.
   * @param cols - Column to be padded.
   * @param width - Minimum width of the field.
   * @param fillChar - Character to use for padding.
   * @param side - Side to place the padding (left, right or both).
   * @param outputCols - Output column names.
   * @returns A new DataFrame with padded `cols`.
   */
  pad: DataframeOperation<{
    cols: Cols;
    width: number;
    fillChar: string;
    side: 'left' | 'right' | 'both';
    outputCols: Cols;
  }>({
    targetType: 'dataframe',
    name: 'cols.pad',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'width',
        default: 0,
      },
      {
        name: 'side',
        default: 'left',
      },
      {
        name: 'fillChar',
        default: ' ',
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Trim whitespace from both sides of each string in the specified column.
   * @param cols - Column to be trimmed.
   * @param outputCols - Output column names.
   * @returns A new DataFrame with trimmed `cols`.
   */
  trim: DataframeOperation<{
    cols: Cols;
    outputCols;
  }>({
    targetType: 'dataframe',
    name: 'cols.trim',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  strip: DataframeOperation<{
    cols: Cols;
    chars: string;
    side: string;
    outputCols: Cols;
  }>({
    targetType: 'dataframe',
    name: 'cols.strip',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'chars',
        default: null,
      },
      {
        name: 'side',
        default: 'left',
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Strip html tags from a string.
   * @param cols - Columns to be transformed.
   * @param outputCols - Output column names.
   * @returns A new dataframe with the new columns containing the stripped string.
   */
  stripHTML: DataframeOperation<{ cols: Cols; outputCols: Cols }>({
    targetType: 'dataframe',
    name: 'cols.strip_html',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Format a date string.
   * @param cols - Columns to be transformed.
   * @param currentFormat - Current date format.
   * @param outputFormat - Output date format.
   * @param outputCols - Output column names.
   * @returns A new dataframe with the new columns containing the date.
   */
  formatDate: DataframeOperation<{
    cols: Cols;
    currentFormat: string;
    outputFormat: string;
    outputCols: Cols;
  }>({
    targetType: 'dataframe',
    name: 'cols.formatDate',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'currentFormat',
        default: null,
      },
      {
        name: 'outputFormat',
        default: null,
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Tokenize words in a string.
   * @param cols - Columns to be transformed.
   * @param outputCols - Output column names.
   * @returns A new dataframe with the new columns containing the date.
   */
  wordTokenizer: DataframeOperation<{ cols: Cols; outputCols: Cols }>({
    targetType: 'dataframe',
    name: 'cols.wordTokenize',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Returns the number of words in a string.
   * @param cols - Columns to be transformed.
   * @param outputCols - Output column names.
   * @returns A new dataframe with the new columns containing the date.
   */
  wordCount: DataframeOperation<{ cols: Cols; outputCols: Cols }>({
    targetType: 'dataframe',
    name: 'cols.wordCount',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Returns the length of a string.
   * @param cols - Columns to be transformed.
   * @param outputCols - Output column names.
   * @returns A new dataframe with the new columns containing the date.
   */
  len: DataframeOperation<{ cols: Cols; outputCols: Cols }>({
    targetType: 'dataframe',
    name: 'cols.len',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Expand contracted words, e.g. "don't" to "do not"
   * @param cols - Columns to be transformed.
   * @param outputCols - Output column names.
   * @returns A new dataframe with the new columns containing the date.
   */
  expandContractedWords: DataframeOperation<{ cols: Cols; outputCols: Cols }>({
    targetType: 'dataframe',
    name: 'cols.expandContractedWords',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Reverse the order of the characters in a column
   * @param cols - Columns to be transformed.
   * @param outputCols - Output column names.
   * @returns A new dataframe with the new columns containing the date.
   */
  reverse: DataframeOperation<{ cols: Cols; outputCols: Cols }>({
    targetType: 'dataframe',
    name: 'cols.reverse',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Remove a specific character, string or regex from a column
   * @param cols - Columns to be transformed.
   * @param search - String to be searched.
   * @param searchBy - Search mode. Available options: 'full', 'word' or 'regex'.
   * @param outputCols - Output column names.
   * @returns A new dataframe with the new columns containing the date.
   */
  remove: DataframeOperation<{
    cols: Cols;
    search: string;
    searchBy: SearchBy;
    outputCols: Cols;
  }>({
    targetType: 'dataframe',
    name: 'cols.remove',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'search',
        default: null,
      },
      {
        name: 'searchBy',
        default: 'word',
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Remove diacritics from a column
   * @param cols - Columns to be transformed.
   * @param outputCols - Output column names.
   * @returns A new dataframe with the new columns containing the date.
   */
  normalizeChars: DataframeOperation<{ cols: Cols; outputCols: Cols }>({
    targetType: 'dataframe',
    name: 'cols.normalizeChars',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Remove numbers from a column
   * @param cols - Columns to be transformed.
   * @param outputCols - Output column names.
   * @returns A new dataframe with the new columns containing the date.
   */
  removeNumbers: DataframeOperation<{ cols: Cols; outputCols: Cols }>({
    targetType: 'dataframe',
    name: 'cols.removeNumbers',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Remove white spaces from a column
   * @param cols - Columns to be transformed.
   * @param outputCols - Output column names.
   * @returns A new dataframe with the new columns containing the date.
   */
  removeWhiteSpaces: DataframeOperation<{ cols: Cols; outputCols: Cols }>({
    targetType: 'dataframe',
    name: 'cols.removeWhiteSpaces',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Remove stop words from a column
   * @param cols - Columns to be transformed.
   * @param language - Language of the stop words.
   * @param outputCols - Output column names.
   * @returns A new dataframe with the new columns containing the date.
   */
  removeStopWords: DataframeOperation<{
    cols: Cols;
    language: string;
    outputCols: Cols;
  }>({
    targetType: 'dataframe',
    name: 'cols.removeStopWords',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'language',
        default: 'english',
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Remove URLs from a column
   * @param cols - Columns to be transformed.
   * @param outputCols - Output column names.
   * @returns A new dataframe with the new columns containing the date.
   */
  removeURLS: DataframeOperation<{ cols: Cols; outputCols: Cols }>({
    targetType: 'dataframe',
    name: 'cols.removeURLS',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Remove extra spaces from a column
   * @param cols - Columns to be transformed.
   * @param outputCols - Output column names.
   * @returns A new dataframe with the new columns containing the date.
   */
  normalizeSpaces: DataframeOperation<{ cols: Cols; outputCols: Cols }>({
    targetType: 'dataframe',
    name: 'cols.normalizeSpaces',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Remove special characters from a column
   * @param cols - Columns to be transformed.
   * @param outputCols - Output column names.
   * @returns A new dataframe with the new columns containing the date.
   */
  removeSpecialChars: DataframeOperation<{ cols: Cols; outputCols: Cols }>({
    targetType: 'dataframe',
    name: 'cols.removeSpecialChars',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Convert a column to a datetime column
   * @param cols - Columns to be transformed.
   * @param currentFormat - Current date format.
   * @param outputCols - Output column names.
   * @param outputFormat - Output date format.
   * @returns A new dataframe with the new columns containing the date.
   */
  toDateTime: DataframeOperation<{
    cols: Cols;
    currentFormat: string;
    outputCols: Cols;
    outputFormat: string;
  }>({
    targetType: 'dataframe',
    name: 'cols.toDateTime',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'currentFormat',
        default: null,
      },
      {
        name: 'outputCols',
        default: null,
      },
      {
        name: 'outputFormat',
        default: null,
      },
    ],
  }),
  /** Get the year of a date
   * @param cols - Columns to be transformed.
   * @param format - Date format.
   * @param outputCols - Output column names.
   * @returns A new dataframe with the new columns containing the year of the date.
   */
  year: DataframeOperation<{ cols: Cols; format: string; outputCols: Cols }>({
    targetType: 'dataframe',
    name: 'cols.year',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'format',
        default: null,
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Get the month of a date
   * @param cols - Columns to be transformed.
   * @param format - Date format.
   * @param outputCols - Output column names.
   * @returns A new dataframe with the new columns containing the month of the date.
   */
  month: DataframeOperation<{ cols: Cols; format: string; outputCols: Cols }>({
    targetType: 'dataframe',
    name: 'cols.month',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'format',
        default: null,
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Get the day of a date
   * @param cols - Columns to be transformed.
   * @param format - Date format.
   * @param outputCols - Output column names.
   * @returns A new dataframe with the new columns containing the day of the date.
   */
  day: DataframeOperation<{ cols: Cols; format: string; outputCols: Cols }>({
    targetType: 'dataframe',
    name: 'cols.day',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'format',
        default: null,
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Get the hour of a date
   * @param cols - Columns to be transformed.
   * @param format - Date format.
   * @param outputCols - Output column names.
   * @returns A new dataframe with the new columns containing the hour of the date.
   */
  hour: DataframeOperation<{ cols: Cols; format: string; outputCols: Cols }>({
    targetType: 'dataframe',
    name: 'cols.hour',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'format',
        default: null,
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Get the minute of a date
   * @param cols - Columns to be transformed.
   * @param format - Date format.
   * @param outputCols - Output column names.
   * @returns A new dataframe with the new columns containing the minute of the date.
   */
  minute: DataframeOperation<{ cols: Cols; format: string; outputCols: Cols }>({
    targetType: 'dataframe',
    name: 'cols.minute',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'format',
        default: null,
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Get the second of a date
   * @param cols - Columns to be transformed.
   * @param format - Date format.
   * @param outputCols - Output column names.
   * @returns A new dataframe with the new columns containing the second of the date.
   * */

  second: DataframeOperation<{ cols: Cols; format: string; outputCols: Cols }>({
    targetType: 'dataframe',
    name: 'cols.second',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'format',
        default: null,
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /**
   * Returns the day of the week for a given date as an integer between 1 (Sunday) and 7 (Saturday).
   * @param cols - Columns to be transformed.
   * @param format - Date format.
   * @param outputCols - Output column names.
   * @returns A new dataframe with the new columns containing the day of the week.
   */
  weekday: DataframeOperation<{ cols: Cols; format: string; outputCols: Cols }>(
    {
      targetType: 'dataframe',
      name: 'cols.weekday',
      args: [
        {
          name: 'cols',
          default: '*',
        },
        {
          name: 'format',
          default: null,
        },
        {
          name: 'outputCols',
          default: null,
        },
      ],
    }
  ),
  /** TODO: Add description */
  yearsBetween: DateDataframeOperation('cols.yearsBetween'),
  monthsBetween: DateDataframeOperation('cols.monthsBetween'),
  daysBetween: DateDataframeOperation('cols.daysBetween'),
  hoursBetween: DateDataframeOperation('cols.hoursBetween'),
  minutesBetween: DateDataframeOperation('cols.minutesBetween'),
  secondsBetween: DateDataframeOperation('cols.secondsBetween'),
  timeBetween: DataframeOperation<{
    cols: Cols;
    value;
    dateFormat;
    round;
    outputCols: Cols;
    func;
  }>({
    targetType: 'dataframe',
    name: 'cols.timeBetween',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'value',
        default: null,
      },
      {
        name: 'dateFormat',
        default: null,
      },
      {
        name: 'round',
        default: null,
      },
      {
        name: 'outputCols',
        default: null,
      },
      {
        name: 'func',
        default: null,
      },
    ],
  }),
  /**
   * Replaces values in the specified columns of a dataframe with a new value.
   * @param cols - The columns to apply the replacement to.
   * @param search - The value to search for.
   * @param replaceBy - The value to replace with.
   * @param searchBy - The method to use for searching (e.g. 'startsWith', 'contains', 'endsWith').
   * @param ignoreCase - Whether to ignore case when searching for values.
   * @param outputCols - The names of the output columns.
   * @returns A new dataframe with the specified replacements.
   */
  replace: DataframeOperation<{
    cols: Cols;
    search: string;
    replaceBy: string;
    searchBy: SearchBy;
    ignoreCase: boolean;
    outputCols: Cols;
  }>({
    targetType: 'dataframe',
    name: 'cols.replace',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'search',
        default: null,
      },
      {
        name: 'replaceBy',
        default: null,
      },
      {
        name: 'searchBy',
        default: null,
      },
      {
        name: 'ignoreCase',
        default: false,
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Replace values that match a regular expression in the specified columns of a dataframe with a new value.
   * @param cols - The columns to apply the replacement to.
   * @param search - The regular expression to search for.
   * @param replaceBy - The value to replace with.
   * @param searchBy - The method to use for searching (e.g. 'startsWith', 'contains', 'endsWith').
   * @param ignoreCase - Whether to ignore case when searching for values.
   * @param outputCols - The names of the output columns.
   * @returns A new dataframe with the specified replacements.
   */
  replaceRegex: DataframeOperation<{
    cols: Cols;
    search;
    replaceBy: string;
    searchBy: string;
    ignoreCase: boolean;
    outputCols: Cols;
  }>({
    targetType: 'dataframe',
    name: 'cols.replaceRegex',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'search',
        default: null,
      },
      {
        name: 'replaceBy',
        default: null,
      },
      {
        name: 'searchBy',
        default: null,
      },
      {
        name: 'ignoreCase',
        default: false,
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /*
   * Replaces numbers in the specified columns of a dataframe with a string representation of the number.
   * @param cols - The columns to apply the replacement to.
   * @param language - The language to use for the number to word conversion.
   * @param outputCols - The names of the output columns.
   * @returns A new dataframe with the specified replacements.
   *
   */
  numToWords: DataframeOperation<{
    cols: Cols;
    language: string;
    outputCols: Cols;
  }>({
    targetType: 'dataframe',
    name: 'cols.numToWords',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'language',
        default: 'en',
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Lemmatize verbs in the specified columns of a dataframe.
   * @param cols - The columns to apply the lemmatization to.
   * @param language - The language to use for the lemmatization.
   * @param outputCols - The names of the output columns.
   * @returns A new dataframe with the specified lemmatization.
   */
  lemmatizeVerbs: DataframeOperation<{
    cols: Cols;
    language: string;
    outputCols: Cols;
  }>({
    targetType: 'dataframe',
    name: 'cols.lemmatizeVerbs',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'language',
        default: 'en',
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Stem verbs in the specified columns of a dataframe.
   * @param cols - The columns to apply the stemming to.
   * @param outputCols - The names of the output columns.
   * @returns A new dataframe with the specified stemming.
   */
  stemVerbs: DataframeOperation<{ cols: Cols; outputCols: Cols }>({
    targetType: 'dataframe',
    name: 'cols.stemVerbs',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Impute missing values in the specified columns of a dataframe.
   * @param cols - The columns to apply the imputation to.
   * @param dataType - The data type to use for the imputation.
   * @param strategy - The strategy to use for the imputation.
   * @param fillValue - The value to use for the imputation.
   * @param outputCols - The names of the output columns.
   * @returns A new dataframe with the specified imputation.
   */
  impute: DataframeOperation<{
    cols: Cols;
    dataType: string;
    strategy: string;
    fillValue;
    outputCols: Cols;
  }>({
    targetType: 'dataframe',
    name: 'cols.impute',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'dataType',
        default: 'auto',
      },
      {
        name: 'strategy',
        default: 'auto',
      },
      {
        name: 'fillValue',
        default: null,
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Fill missing values in the specified columns of a dataframe.
   * @param cols - The columns to apply the imputation to.
   * @param value - The value to use for the imputation.
   * @param outputCols - The names of the output columns.
   * @param evalValue - Whether to evaluate the value as an expression.
   * @returns A new dataframe with the specified imputation.
   */
  fillNA: DataframeOperation<{
    cols: Cols;
    value;
    outputCols: Cols;
    evalValue;
  }>({
    targetType: 'dataframe',
    name: 'cols.fillNA',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'value',
        default: null,
      },
      {
        name: 'outputCols',
        default: null,
      },
      {
        name: 'evalValue',
        default: false,
      },
    ],
  }),

  count: DataframeOperation<NoArgs, number>({
    targetType: 'value',
    name: 'cols.count',
  }),
  uniqueValues: AggregationOperation<{
    estimate: boolean;
  }>({
    name: 'cols.uniqueValues',
    args: [
      {
        name: 'estimate',
        default: false,
      },
    ],
  }),
  /** Count the number of unique values in the specified columns of a dataframe.
   * @param cols - The columns to count the unique values of.
   * @param estimate - Whether to estimate the number of unique values.
   * @returns A new dataframe with the specified unique value counts.
   */
  countUniques: AggregationOperation<{
    estimate: boolean;
  }>({
    name: 'cols.countUniques',
    args: [
      {
        name: 'estimate',
        default: false,
      },
    ],
  }),
  /** Sum the values in the specified columns of a dataframe.
   * @param cols - The columns to sum.
   * @returns A new dataframe with the specified sums.
   */
  add: ColsMathOperation('cols.add'),
  /** Subtract the values in the specified columns of a dataframe.
   * @param cols - The columns to subtract.
   * @returns A new dataframe with the specified differences.
   */
  sub: ColsMathOperation('cols.sub'),
  /** Multiply the values in the specified columns of a dataframe.
   * @param cols - The columns to multiply.
   * @returns A new dataframe with the specified products.
   */
  mul: ColsMathOperation('cols.mul'),
  /** Divide the values in the specified columns of a dataframe.
   * @param cols - The columns to divide.
   * @returns A new dataframe with the specified quotients.
   */
  div: ColsMathOperation('cols.div'),
  /** Modulo the values in the specified columns of a dataframe.
   * @param cols - The columns to modulo.
   * @returns A new dataframe with the specified remainders.
   */
  rdiv: ColsMathOperation('cols.rdiv'),
  /** Calculate the z-score of the values in the specified columns of a dataframe.
   * @param cols - The columns to calculate the z-score of.
   * @param outputCols - The names of the output columns.
   * @returns A new dataframe with the specified z-scores.
   */
  zScore: DataframeOperation<{ cols: Cols; outputCols: Cols }>({
    targetType: 'dataframe',
    name: 'cols.zScore',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Calculate the modified z-score of the values in the specified columns of a dataframe.
   * @param cols - The columns to calculate the modified z-score of.
   * @param estimate - Whether to estimate the median absolute deviation.
   * @param outputCols - The names of the output columns.
   */
  modifiedZScore: DataframeOperation<{
    cols: Cols;
    estimate: boolean;
    outputCols: Cols;
  }>({
    targetType: 'dataframe',
    name: 'cols.modifiedZScore',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'estimate',
        default: true,
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Calculate the standard score of the values in the specified columns of a dataframe.
   * @param cols - The columns to calculate the standard score of.
   * @param outputCols - The names of the output columns.
   * @returns A new dataframe with the specified standard scores.
   */
  standardScaler: DataframeOperation<{ cols: Cols; outputCols: Cols }>({
    targetType: 'dataframe',
    name: 'cols.standardScaler',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Calculate the max-abs scaler of the values in the specified columns of a dataframe.
   * @param cols - The columns to calculate the max-abs scaler of.
   * @param outputCols - The names of the output columns.
   * @returns A new dataframe with the specified max-abs scalers.
   */
  maxAbsScaler: DataframeOperation<{ cols: Cols; outputCols: Cols }>({
    targetType: 'dataframe',
    name: 'cols.maxAbsScaler',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Calculate the min-max scaler of the values in the specified columns of a dataframe.
   * @param cols - The columns to calculate the min-max scaler of.
   * @param outputCols - The names of the output columns.
   * @returns A new dataframe with the specified min-max scalers.
   */
  minMaxScaler: DataframeOperation<{ cols: Cols; outputCols: Cols }>({
    targetType: 'dataframe',
    name: 'cols.minMaxScaler',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'outputCols',
        default: null,
      },
    ],
  }),
  /** Calculate the interquartile range of the values in the specified columns of a dataframe.
   * @param cols - The columns to calculate the interquartile range of.
   * @param more - Whether to calculate additional stats.
   * @param estimate - Whether to estimate the median absolute deviation.
   * @returns A new dataframe with the specified interquartile ranges.
   */
  iqr: DataframeOperation<{ cols: Cols; more: boolean; estimate: boolean }>({
    targetType: 'value',
    name: 'cols.iqr',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'more',
        default: false,
      },
      {
        name: 'estimate',
        default: true,
      },
    ],
  }),
  /** Split the values from the specified column into a single array column.
   * @param cols - The columns to merge.
   * @param outputCol - The name of the output column.
   * @param drop - Whether to drop the source columns.
   * @param shape - The shape of the output column.
   * @returns A new dataframe with the specified merged column.
   */
  nest: DataframeOperation<{
    cols: Cols;
    outputCol: string;
    drop: boolean;
    shape: string;
  }>({
    targetType: 'dataframe',
    name: 'cols.nest',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'outputCol',
        default: null,
      },
      {
        name: 'drop',
        default: true,
      },
      {
        name: 'shape',
        default: 'string',
      },
    ],
  }),
  /** Merge the values from the specified columns into a single array column.
   * @param cols - The columns to merge.
   * @param separator - The separator to use between merged values.
   * @param splits - The number of splits to perform on each value.
   * @param index - The index of the split to select.
   * @param outputCol - The name of the output column.
   * @param drop - Whether to drop the source columns.
   * @param mode - The mode to use when merging.
   * @returns A new dataframe with the specified merged column.
   */
  unnest: DataframeOperation<{
    cols: Cols;
    separator: string;
    splits: number;
    index: number;
    outputCols: Cols;
    drop: boolean;
    mode: string;
  }>({
    targetType: 'dataframe',
    name: 'cols.unnest',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'separator',
        default: null,
      },
      {
        name: 'splits',
        default: 2,
      },
      {
        name: 'index',
        default: null,
      },
      {
        name: 'outputCols',
        default: null,
      },
      {
        name: 'drop',
        default: false,
      },
      {
        name: 'mode',
        default: 'string',
      },
    ],
  }),
  /** Heatmap of the values in the specified columns of a dataframe.
   * @param colX - The column containing the X values.
   * @param colsY - The columns containing the Y values.
   * @param binX - The number of bins to use for the X axis.
   * @param binY - The number of bins to use for the Y axis.
   * @param compute - Whether to compute the heatmap.
   * @returns A new dataframe with the specified heatmap.
   */
  heatMap: DataframeOperation<{
    colX: Cols;
    colsY: Cols;
    binX: number;
    binY: number;
    compute: boolean;
  }>({
    targetType: 'dataframe',
    name: 'cols.heatMap',
    args: [
      {
        name: 'colX',
        default: '*',
      },
      {
        name: 'colsY',
        default: '*',
      },
      {
        name: 'binX',
        default: 10,
      },
      {
        name: 'binY',
        default: 10,
      },
      {
        name: 'compute',
        default: true,
      },
    ],
  }),
  /** Calculate the histogram of the values in the specified columns of a dataframe.
   * @param cols - The columns to calculate the histogram of.
   * @param buckets - The number of buckets to use.
   * @returns A dictionary of histograms, one key for each specified column.
   */
  histogram: DataframeOperation<{
    cols: Cols;
    buckets: number;
  }>({
    targetType: 'value',
    name: 'cols.hist',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'buckets',
        default: 10,
      },
    ],
  }),
  /** Calculate the quality of the values in the specified columns of a dataframe.
   * @param cols - The columns to calculate the quality of.
   * @param flush - Whether to flush the cache.
   * @param compute - Whether to compute the quality.
   * @returns A new dataframe with the specified quality.
   */
  quality: DataframeOperation<{ cols: Cols; flush: boolean; compute: boolean }>(
    {
      targetType: 'value',
      name: 'cols.quality',
      args: [
        {
          name: 'cols',
          default: '*',
        },
        {
          name: 'flush',
          default: false,
        },
        {
          name: 'compute',
          default: true,
        },
      ],
    }
  ),
  /** Infer the types of the values in the specified columns of a dataframe.
   * @param cols - The columns to infer the types of.
   * @param sampleCount - The number of samples to use.
   * @param tidy - Whether to return the result as a tidy dataframe.
   */
  inferType: DataframeOperation<{
    cols: Cols;
    sampleCount: number;
    tidy: boolean;
  }>({
    targetType: 'dataframe',
    name: 'cols.inferType',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'sampleCount',
        default: null,
      },
      {
        name: 'tidy',
        default: true,
      },
    ],
  }),
  /** Infer the date formats of the values in the specified columns of a dataframe.
   * @param cols - The columns to infer the date formats of.
   * @param sample - The number of samples to use.
   * @param tidy - Whether to return the result as a tidy dataframe.
   * @returns A new dataframe with the specified date formats.
   */
  inferDateFormats: DataframeOperation<{
    cols: Cols;
    sample: number;
    tidy: boolean;
  }>({
    targetType: 'dataframe',
    name: 'cols.inferDateFormats',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'sample',
        default: 200,
      },
      {
        name: 'tidy',
        default: true,
      },
    ],
  }),
  /** Calculate the frequency of the values in the specified columns of a dataframe.
   * @param cols - The columns to calculate the frequency of.
   * @param top - The number of most frequent values to return.
   * @param percentage - Whether to return the frequency as a percentage.
   * @param totalRows - The total number of rows in the dataframe.
   * @param countUniques - Whether to count uniques.
   * @returns A new dictionary with the specified frequency by column.
   */
  frequency: AggregationOperation<{
    top: number;
    percentage: boolean;
    totalRows: boolean;
    countUniques: boolean;
  }>({
    name: 'cols.frequency',
    args: [
      {
        name: 'top',
        default: 10,
      },
      {
        name: 'percentage',
        default: false,
      },
      {
        name: 'totalRows',
        default: null,
      },
      {
        name: 'countUniques',
        default: false,
      },
    ],
  }),
  /** Calculate the box plot of the values in the specified columns of a dataframe.
   * @param cols - The columns to calculate the box plot of.
   * @returns A new dataframe with the specified box plot.
   */
  boxPlot: DataframeOperation<{ cols: Cols }>({
    targetType: 'value',
    name: 'cols.boxPlot',
    args: [
      {
        name: 'cols',
        default: '*',
      },
    ],
  }),
  /** Get the names of the columns that match the specified data types.
   * @param cols - The columns to get the names of.
   * @param dataTypes - The data types to match.
   * @param invert - Whether to invert the match.
   * @param isRegex - Whether to interpret the data types as regular expressions.
   * @returns A new dataframe with the names of the columns that match the specified data types.
   */
  names: DataframeOperation<
    {
      cols: Cols;
      dataTypes: string;
      invert: boolean;
      isRegex: boolean;
    },
    string[]
  >({
    targetType: 'value',
    name: 'cols.names',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'dataTypes',
        default: null,
      },
      {
        name: 'invert',
        default: false,
      },
      {
        name: 'isRegex',
        default: null,
      },
    ],
  }),
  /** Count the number of zeros in the specified columns of a dataframe.
   * @param cols - The columns to count the zeros of.
   * @param tidy - Whether to return the result as a tidy dataframe.
   * @returns A new dataframe with the specified number of zeros.
   */
  countZeros: DataframeOperation<{ cols: Cols; tidy: boolean }>({
    targetType: 'value',
    name: 'cols.countZeros',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'tidy',
        default: true,
      },
    ],
  }),
  /** Quantile-based discretization function.
   * Discretize variable into equal-sized buckets based on rank or based on sample quantiles.
   * @param cols - The columns to discretize.
   * @param quantiles - The number of quantiles.
   * @param outputCol - The output column.
   * @returns A new dataframe with the specified number of quantiles.
   */
  qcut: DataframeOperation<{ cols: Cols; quantiles: number; outputCol: Cols }>({
    targetType: 'dataframe',
    name: 'cols.qcut',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'quantiles',
        default: null,
      },
      {
        name: 'outputCol',
        default: null,
      },
    ],
  }),
  /**  Use cut when you need to segment and sort data values into bins.
   * This function is also useful for going from a continuous variable to a categorical variable.
   * @param cols - The columns to discretize.
   * @param bins - The number of bins.
   * @param labels - The labels for the bins.
   * @param default - The default value for the bins.
   * @param outputCol - The output column.
   * @returns A new dataframe
   */
  cut: DataframeOperation<{
    cols: Cols;
    bins: number;
    labels: [] | false;
    default: PythonCompatible;
    outputCol: Cols;
  }>({
    targetType: 'dataframe',
    name: 'cols.cut',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'bins',
        default: null,
      },
      {
        name: 'labels',
        default: null,
      },
      {
        name: 'default',
        default: null,
      },
      {
        name: 'outputCol',
        default: null,
      },
    ],
  }),
  /** Bin values into discrete intervals.
   * @param cols - The columns to clip.
   * @param lower_bound - The lower bound.
   * @param upper_bound - The upper bound.
   * @param outputCol - The output column.
   * @returns A new dataframe
   */
  clip: DataframeOperation<{
    cols: Cols;
    lower_bound: number;
    upper_bound: number;
    outputCol: Cols;
  }>({
    targetType: 'dataframe',
    name: 'cols.clip',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'lower_bound',
        default: null,
      },
      {
        name: 'upper_bound',
        default: null,
      },
      {
        name: 'outputCol',
        default: null,
      },
    ],
  }),
  /** One-hot encoding maps a column of label indices to a column of binary vectors, with at most a single one-value.
   * @param cols - The columns to one hot encode.
   * @param prefix - The prefix for the column names.
   * @param drop - Whether to drop the old columns.
   * @param outputCol - The output column.
   * @returns A new dataframe
   */
  oneHotEncode: DataframeOperation<{
    cols: Cols;
    prefix: string;
    drop: boolean;
    outputCol: Cols;
    [k: string]: PythonCompatible;
  }>({
    targetType: 'dataframe',
    name: 'cols.oneHotEncode',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'prefix',
        default: null,
      },
      {
        name: 'drop',
        default: true,
      },
    ],
  }),
  /** Convert a string column to an index column by replacing the unique values with an index.
   * @param cols - The columns to index.
   * @param outputCol - The output column.
   * @returns A new dataframe
   */
  stringToIndex: DataframeOperation<{ cols: Cols; outputCol: Cols }>({
    targetType: 'dataframe',
    name: 'cols.stringToIndex',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'outputCol',
        default: null,
      },
    ],
  }),
  /** Convert a index column to a string column by replacing the unique values with an index.
   * @param cols - The columns to index.
   * @param outputCol - The output column.
   * @returns A new dataframe
   */
  indexToString: DataframeOperation<{ cols: Cols; outputCol: Cols }>({
    targetType: 'dataframe',
    name: 'cols.indexToString',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'outputCol',
        default: null,
      },
    ],
  }),
  /** Extract the domain of an url.
  @param cols - The columns to extract the domain.
  @param outputCol - The output column.
  @returns A new dataframe
   */
  domain: StandardDataframeOperation('cols.domain'),
  /** Extract the top level domain of an url.
  @param cols - The columns to extract the top level domain.
  @param outputCol - The output column.
  @returns A new dataframe
   */
  topDomain: StandardDataframeOperation('cols.topDomain'),
  /** Extract the subdomain of an url.
  @param cols - The columns to extract the subdomain.
  @param outputCol - The output column.
  @returns A new dataframe
   */
  subDomain: StandardDataframeOperation('cols.subDomain'),
  /** Extract the protocol of an url.
  @param cols - The columns to extract the protocol.
  @param outputCol - The output column.
  @returns A new dataframe
   */
  urlSchema: StandardDataframeOperation('cols.urlSchema'),
  /** Extract the path of an url.
  @param cols - The columns to extract the path.
  @param outputCol - The output column.
  @returns A new dataframe
   */
  urlPath: StandardDataframeOperation('cols.urlPath'),
  /** Extract the file of an url.
  @param cols - The columns to extract the file.
  @param outputCol - The output column.
  @returns A new dataframe
   */
  urlFile: StandardDataframeOperation('cols.urlFile'),
  /** Extract the query of an url.
  @param cols - The columns to extract the query.
  @param outputCol - The output column.
  @returns A new dataframe
   */
  urlQuery: StandardDataframeOperation('cols.urlQuery'),
  /** Extract the fragment of an url.
  @param cols - The columns to extract the fragment.
  @param outputCol - The output column.
  @returns A new dataframe
   */
  urlFragment: StandardDataframeOperation('cols.urlFragment'),
  /** Extract the host of an url.
  @param cols - The columns to extract the host.
  @param outputCol - The output column.
  @returns A new dataframe
   */
  host: StandardDataframeOperation('cols.host'),
  /** Extract the port of an url.
  @param cols - The columns to extract the port.
  @param outputCol - The output column.
  @returns A new dataframe
   */
  port: StandardDataframeOperation('cols.port'),
  /** Extract the email username of an url.
  @param cols - The columns to extract the email username.
  @param outputCol - The output column.
  @returns A new dataframe
   */
  emailUsername: StandardDataframeOperation('cols.emailUsername'),
  /** Extract the email domain of an url.
  @param cols - The columns to extract the email domain.
  @param outputCol - The output column.
  @returns A new dataframe
   */
  emailDomain: StandardDataframeOperation('cols.emailDomain'),

  // TODO: handle any and count functions, _values
  /** Create the fingerprint for a column
  @param cols - The columns to extract the fingerprint.
  @param outputCol - The output column.
  @returns A new dataframe
   */
  fingerprint: StandardDataframeOperation('cols.fingerprint'),
  /**  A part-of-speech tagger, or POS-tagger, processes a sequence of words, and attaches a part of speech tag to each word.
  @param cols - The columns to extract the part of speech.
  @param outputCol - The output column.
  @returns A new dataframe
   */
  pos: StandardDataframeOperation('cols.pos'),
  /** Calculate the ngram for string.
  @param cols - The columns to extract the ngram.
  @param outputCol - The output column.
  @returns A new dataframe
   */
  ngrams: DataframeOperation<{ cols: Cols; n: number; outputCol: Cols }>({
    targetType: 'dataframe',
    name: 'cols.ngramFingerprint',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'n',
        default: 2,
      },
      {
        name: 'outputCol',
        default: null,
      },
    ],
  }),
  /** Calculate the ngram for a fingerprinted string.
  @param cols - The columns to extract the ngram.
  @param outputCol - The output column.
  @returns A new dataframe
   */
  ngramFingerprint: DataframeOperation<{
    cols: Cols;
    n: number;
    outputCol: Cols;
  }>({
    targetType: 'dataframe',
    name: 'cols.ngramFingerprint',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'n',
        default: 2,
      },
      {
        name: 'outputCol',
        default: null,
      },
    ],
  }),
  /** Apply the Metaphone algorithm to a specified column.
  @param cols - The columns to extract the metaphone.
  @param outputCol - The output column.
  @returns A new dataframe
   */
  metaphone: StandardDataframeOperation('cols.metaphone'),
  /** Calculate the levenshtein distance to a specified column.
  @param cols - The columns to extract the levenshtein.
  @param otherCols - The other columns to extract the levenshtein.
  @param value - The value to extract the levenshtein.
  @param outputCol - The output column.
  @returns A new dataframe
   */
  levenshtein: DataframeOperation<{
    cols: Cols;
    otherCols: Cols;
    value: PythonCompatible;
    outputCol: Cols;
  }>({
    targetType: 'dataframe',
    name: 'cols.levenshtein',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'otherCols',
        default: null,
      },
      {
        name: 'value',
        default: null,
      },
      {
        name: 'outputCol',
        default: null,
      },
    ],
  }),
  /** Apply the NYSIIS algorithm to a specified column.
  @param cols - The columns to extract the nysiis.
  @param outputCol - The output column.
  @returns A new dataframe
   */
  nysiis: StandardDataframeOperation('cols.nysiis'),
  /** The match rating approach (MRA) is a phonetic algorithm developed by Western Airlines in 1977
and published by the U.S. National Bureau of Standards in 1985. It is a refinement of the Soundex
algorithm created by Margaret Odell and Robert Russell.
  @param cols - The columns to extract the match rating.
  @param outputCol - The output column.
  @returns A new dataframe
 */
  matchRatingEncoder: StandardDataframeOperation('cols.matchRatingCodex'),
  /** The Double Metaphone phonetic encoding algorithm is the second generation of this algorithm.
  @param cols - The columns to extract the double metaphone.
  @param outputCol - The output column.
  @returns A new dataframe
   */
  doubleMetaphone: StandardDataframeOperation('cols.doubleMetaphone'),
  /** Apply the Soundex algorithm to a specified column.
  @param cols - The columns to extract the soundex.
  @param outputCol - The output column.
  @returns A new dataframe
   */
  soundex: StandardDataframeOperation('cols.soundex'),
  /** TD-IDF (term frequency-inverse document frequency) is a statistical measure that evaluates how relevant a word.
  @param cols - The columns to extract the tfidf.
  @param outputCol - The output column.
  @returns A new dataframe
   */
  tfidf: DataframeOperation<{ cols: Cols }>({
    targetType: 'value',
    name: 'cols.tfidf',
    args: [
      {
        name: 'cols',
        default: '*',
      },
    ],
  }),
  /** Method of extracting features from text for use in modeling, such as with machine learning.
  @param cols - The columns to extract the count vectorizer.
  @param outputCol - The output column.
  @returns A new dataframe
   */
  bagOfWords: DataframeOperation<{
    cols: Cols;
    analyzer: string;
    ngramRange: [number, number];
  }>({
    targetType: 'value',
    name: 'cols.bagOfWords',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'analyzer',
        default: 'word',
      },
      {
        name: 'ngramRange',
        default: [1, 1],
      },
    ],
  }),
};
