import type { Cols, NoArgs, SourceArg } from '../../../../types/arguments';
import type { ArgsType, OperationCreator } from '../../../../types/operation';
import type { Source } from '../../../../types/source';
import { BlurrOperation } from '../../factory';

function DataframeOperation<
  TA extends ArgsType = ArgsType,
  TR extends OperationCompatible = Source
>(operationCreator: OperationCreator) {
  return BlurrOperation<TA, TR>({
    ...operationCreator,
    sourceType: 'dataframe',
  });
}

function DropValueRowsOperation(name: string) {
  return DataframeOperation<{
    cols: Cols;
    value: string;
    how: 'any' | 'all';
  }>({
    targetType: 'dataframe',
    name,
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'value',
        default: false,
      },
      {
        name: 'how',
        default: 'any',
      },
    ],
  });
}

function SelectTypeRowsOperation(name: string) {
  return DataframeOperation<{
    cols: Cols;
    drop: boolean;
    how: 'any' | 'all';
  }>({
    targetType: 'dataframe',
    name,
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'drop',
        default: false,
      },
      {
        name: 'how',
        default: 'any',
      },
    ],
  });
}

function SelectRowsOperation(name: string) {
  return DataframeOperation<{
    cols: Cols;
    how: 'any' | 'all';
  }>({
    targetType: 'dataframe',
    name,
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'how',
        default: 'any',
      },
    ],
  });
}

function SelectValueRowsOperation(name: string) {
  return DataframeOperation<{
    cols: Cols;
    value: number;
    drop: boolean;
    how: 'any' | 'all';
  }>({
    targetType: 'dataframe',
    name,
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'value',
        default: 0,
      },
      {
        name: 'drop',
        default: false,
      },
      {
        name: 'how',
        default: 'any',
      },
    ],
  });
}

export const operations = {
  /* Append multiple dataframes
  @params dfs - Dataframes to append
  @params namesMap - Map of column names to rename
  @returns Dataframe
   */
  append: DataframeOperation<{ dfs: SourceArg[]; namesMap: number }, Source>({
    targetType: 'dataframe',
    name: 'rows.append',
    args: [
      {
        name: 'dfs',
        required: true,
      },
      {
        name: 'namesMap',
        default: null,
      },
    ],
  }),
  /* Select multiple rows using the contains or regex expression
  @params cols - Columns to select
  @params contains - String or array of strings to match
  @params case - Case sensitive
  @params flags - Regex flags
  @params na - Include NA values
  @params regex - Use regex
  @returns Dataframe
   */
  select: DataframeOperation<
    {
      expr: string;
      contains: string | string[];
      case: boolean;
      flags;
      na;
      regex;
    },
    Source
  >({
    targetType: 'dataframe',
    name: 'rows.select',
    args: [
      {
        name: 'expr',
        default: null,
      },
      {
        name: 'contains',
        default: null,
      },
      {
        name: 'case',
        default: null,
      },
      {
        name: 'flags',
        default: 0,
      },
      {
        name: 'na',
        default: false,
      },
      {
        name: 'regex',
        default: false,
      },
    ],
  }),
  /* Return the number of rows in the dataframe
  @params compute - Compute the result
   */
  count: DataframeOperation<{ compute: string }, number>({
    targetType: 'value',
    name: 'rows.count',
    args: [
      {
        name: 'compute',
        default: true,
      },
    ],
  }),
  /* Return a list of values from a column
  @params cols - Columns to select
  @returns List of rows values
   */
  toList: DataframeOperation<{ cols: Cols }, PythonCompatible>({
    targetType: 'value',
    name: 'rows.toList',
    args: [
      {
        name: 'Cols',
        default: '*',
      },
    ],
  }),
  /* Sort rows by column
  @params cols - Columns to sort
  @params order - Order to sort
  @params cast - Cast values to numeric
  @returns Dataframe
   */
  sort: DataframeOperation<{ cols: Cols; order: string; cast: boolean }>({
    targetType: 'dataframe',
    name: 'rows.sort',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'order',
        default: 'desc',
      },
      {
        name: 'cast',
        default: true,
      },
    ],
  }),
  /* Reverse the order of the rows
  @returns Dataframe
   */
  reverse: DataframeOperation<NoArgs, Source>({
    targetType: 'dataframe',
    name: 'rows.reverse',
  }),
  /* Drop rows by filtering on column values
  @params where - Where clause
  @returns Dataframe
   */
  drop: DataframeOperation<
    {
      where: string;
    },
    Source
  >({
    targetType: 'dataframe',
    name: 'rows.drop',
    args: [
      {
        name: 'where',
        default: null,
      },
    ],
  }),
  /* Limit the number of rows
  @params count - Number of rows to limit
  @returns Dataframe
   */
  limit: DataframeOperation<
    {
      count: number;
    },
    Source
  >({
    targetType: 'dataframe',
    name: 'rows.limit',
    args: [
      {
        name: 'limit',
        default: 10,
      },
    ],
  }),

  unnest: DataframeOperation<
    {
      cols: Cols;
      outputCols: Cols;
    },
    Source
  >({
    targetType: 'dataframe',
    name: 'rows.unnest',
    args: [
      {
        name: 'cols',
        default: '*',
      },
    ],
  }),
  /* Return the approx. number of rows in the dataframe
   */
  approxCount: DataframeOperation<NoArgs, number>({
    targetType: 'value',
    name: 'rows.approxCount',
  }),
  /* Select the rows that contain a string
  @params cols - Columns to select
  @params drop - Drop the rows
  @params how - How to match
  @returns Dataframe
   */
  str: SelectTypeRowsOperation('rows.str'),
  /* Select the rows that contain an integer
  @params cols - Columns to select
  @params drop - Drop the rows
  @params how - How to match
  @returns Dataframe
   */
  int: SelectTypeRowsOperation('rows.int'),
  /* Select the rows that contain a float
  @params cols - Columns to select
  @params drop - Drop the rows
  @params how - How to match
  @returns Dataframe
   */
  float: SelectTypeRowsOperation('rows.float'),
  /* Select the rows that contain a numeric value
  @params cols - Columns to select
  @params drop - Drop the rows
  @params how - How to match
  @returns Dataframe
   */
  numeric: SelectTypeRowsOperation('rows.numeric'),
  /* Select rows which values are between lower and upper bound
  @params lowerBound - Lower bound
  @params upperBound - Upper bound
  @params includeBounds - Include bounds
  @params bounds - Bounds
  @params drop - Drop the rows
  @params how - How to match
  @returns Dataframe
 */
  between: DataframeOperation<{
    lowerBound: number;
    upperBound: number;
    includeBounds: boolean;
    bounds: [];
    drop: boolean;
    how: 'any' | 'all';
  }>({
    targetType: 'dataframe',
    name: 'rows.between',
    args: [
      {
        name: 'lowerBound',
        default: null,
      },
      {
        name: 'upperBound',
        default: null,
      },
      {
        name: 'includeBounds',
        default: null,
      },
      {
        name: 'bounds',
        default: true,
      },
      {
        name: 'drop',
        default: false,
      },
      {
        name: 'how',
        default: 'any',
      },
    ],
  }),
  /* Select rows which values are greater than or equal to the lower bound
  @params cols - Columns to select
  @params values - Values to be compared
  @params how - How to apply the mask. "any" or "all"
  @returns Dataframe
   */
  greatherThanEqual: SelectValueRowsOperation('rows.greatherThanEqual'),
  /* Select rows which values are greater than the lower bound
  @params cols - Columns to select
  @params value - Values to be compared
  @params drop - Drop the rows tha
  @params how - How to apply the mask. "any" or "all"
  @returns Dataframe
   */
  greatherThan: SelectValueRowsOperation('rows.greatherThan'),
  /* Select rows which values are less than or equal to the upper bound
  @params cols - Columns to select
  @params value - Values to be compared
  @params drop - Drop the rows tha
  @params how - How to apply the mask. "any" or "all"
  @returns Dataframe
   */
  lessThanEqual: SelectValueRowsOperation('rows.lessThanEqual'),
  /* Select rows which values are less than the upper bound
  @params cols - Columns to select
  @params value - Values to be compared
  @params drop - Drop the rows tha
  @params how - How to apply the mask. "any" or "all"
  @returns Dataframe
   */
  lessThan: SelectValueRowsOperation('rows.lessThan'),
  /* Select rows which values are equal to a value
  @params cols - Columns to select
  @params value - Values to be compared
  @params drop - Drop the rows tha
  @params how - How to apply the mask. "any" or "all"
  @returns Dataframe
  */
  equal: SelectValueRowsOperation('rows.equal'),
  /*
  Select rows which values are not equal to a value
  @params cols - Columns to be used
  @params value - Value to be compared
  @params drop - Drop rows that match the condition
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  notEqual: SelectValueRowsOperation('rows.notEqual'),
  /*
  Select rows which values are missing
  @params cols - Columns to be used
  @params drop - Drop rows that match the condition
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  missing: SelectTypeRowsOperation('rows.missing'),
  /*
  Select rows which values are null
  @params cols - Columns to be used
  @params drop - Drop rows that match the condition
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
  */
  null: SelectTypeRowsOperation('rows.null'),
  /*
  Select rows which values are none
  @params cols - Columns to be used
  @params drop - Drop rows that match the condition
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
  */
  none: SelectTypeRowsOperation('rows.none'),
  /*
  Select rows which values are nan
  @params cols - Columns to be used
  @params drop - Drop rows that match the condition
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
  */
  nan: SelectTypeRowsOperation('rows.nan'),
  /*
  Select rows which values are empty
  @params cols - Columns to be used
  @params drop - Drop rows that match the condition
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
  */
  empty: SelectTypeRowsOperation('rows.empty'),
  /*
  Remove duplicates values
  @params cols - Columns to be used
  @params keep - Which duplicate value to keep. first, last or all
  @params dro - Drop rows that are duplicated
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  duplicated: DataframeOperation<{
    cols: Cols;
    keep: 'first' | 'last' | false;
    drop: boolean;
    how: 'any' | 'all';
  }>({
    targetType: 'dataframe',
    name: 'rows.duplicated',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'keep',
        default: 'first',
      },
      {
        name: 'drop',
        default: false,
      },
      {
        name: 'how',
        default: 'any',
      },
    ],
  }),
  /*
  Filter rows which values are unique
  @params cols - Columns to be used
  @params keep - Which duplicate value to keep. first, last or all
  @params drop - Drop rows that are duplicated
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  unique: DataframeOperation<{
    cols: Cols;
    keep: 'first' | 'last' | false;
    drop: boolean;
    how: 'any' | 'all';
  }>({
    targetType: 'dataframe',
    name: 'rows.unique',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'keep',
        default: 'first',
      },
      {
        name: 'drop',
        default: false,
      },
      {
        name: 'how',
        default: 'any',
      },
    ],
  }),
  /*
  Select rows which values are not the same data type
  @params cols - Columns to be used
  @params dataType - Data type to be compared
  @params drop - sDrop rows that are duplicated
  @params how - How to apply the mask. "any" or "all"
  @returns  Optimus Dataframe
   */
  mismatch: DataframeOperation<{
    cols: Cols;
    dataType: string;
    drop: boolean;
    how: 'any' | 'all';
  }>({
    targetType: 'dataframe',
    name: 'rows.mismatch',
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
        name: 'drop',
        default: false,
      },
      {
        name: 'how',
        default: 'any',
      },
    ],
  }),
  /*
  Select rows which values match a regex
  @params cols - Columns to be used
  @params regex - Regex to be compared
  @params dataType - Data type to be compared
  @params drop - Drop rows that are duplicated
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  match: DataframeOperation<{
    cols: Cols;
    regex: string;
    dataType: string;
    drop: boolean;
    how: 'any' | 'all';
  }>({
    targetType: 'dataframe',
    name: 'rows.match',
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
        name: 'drop',
        default: false,
      },
      {
        name: 'how',
        default: 'any',
      },
    ],
  }),
  /*
  Select rows which values match a regex
  @params cols - Columns to be used
  @params regex - Regex to be compared
  @params drop - Drop rows that are duplicated
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  matchRegex: DataframeOperation<{
    cols: Cols;
    regex: string;
    dataType: string;
    drop: boolean;
    how: 'any' | 'all';
  }>({
    targetType: 'dataframe',
    name: 'rows.matchRegex',
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
        name: 'drop',
        default: false,
      },
      {
        name: 'how',
        default: 'any',
      },
    ],
  }),
  /*
  Select rows which values match a data type
  @params cols - Columns to be used
  @params dataType - Data type to be compared
  @params drop - Drop rows that are duplicated
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  matchDataType: DataframeOperation<{
    cols: Cols;
    regex: string;
    dataType: string;
    drop: boolean;
    how: 'any' | 'all';
  }>({
    targetType: 'dataframe',
    name: 'rows.matchDataType',
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
        name: 'drop',
        default: false,
      },
      {
        name: 'how',
        default: 'any',
      },
    ],
  }),
  /*
  Select rows which values are in a list
  @params cols - Columns to be used
  @params values - Values to be matches
  @params drop - Drop rows that are duplicated
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  valueIn: DataframeOperation<{
    cols: Cols;
    values: BasicPythonCompatible[];
    dataType: string;
    drop: boolean;
    how: 'any' | 'all';
  }>({
    targetType: 'dataframe',
    name: 'rows.valueIn',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'values',
        default: null,
      },
      {
        name: 'dataType',
        default: null,
      },
      {
        name: 'drop',
        default: false,
      },
      {
        name: 'how',
        default: 'any',
      },
    ],
  }),
  /*
  Select rows which values match a pattern
  @params cols - Columns to be used
  @params pattern - Pattern to be matches
  @params drop - Drop rows that are duplicated
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  pattern: DataframeOperation<{
    cols: Cols;
    pattern: string;
    drop: boolean;
    how: 'any' | 'all';
  }>({
    targetType: 'dataframe',
    name: 'rows.pattern',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'pattern',
        default: null,
      },
      {
        name: 'drop',
        default: false,
      },
      {
        name: 'how',

        default: 'any',
      },
    ],
  }),
  /*
  Select rows which values starts with a string
  @params cols - Columns to be used
  @params value - String to be searched
  @params drop - Drop rows that are duplicated
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  startsWith: SelectValueRowsOperation('rows.startsWith'),
  /*
  Select rows which values ends with a string
  @params cols - Columns to be used
  @params value - String to be searched
  @params drop - Drop rows that are duplicated
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
 */
  endsWith: SelectValueRowsOperation('rows.endsWith'),
  /*
  Select rows which values contain a string
  @param cols - Columns to be used
  @param value - String to be searched
  @param drop - Drop rows that contains a string
  @param how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  contains: SelectValueRowsOperation('rows.contains'),
  /*
  Select rows which values contain a value
  @params cols - Columns to be used
  @params value - String to be searched
  @params drop - Drop rows that contains an integer
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
 */
  find: SelectValueRowsOperation('rows.find'),
  /*
  Select rows which values are email
  @params cols - Columns to be used
  @params drop - Drop rows that contains an email
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  email: SelectTypeRowsOperation('rows.email'),
  /*
  Select rows which values are ip
  @params cols - Columns to be used
  @params drop - Drop rows that contains an ip
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  ip: SelectTypeRowsOperation('rows.ip'),
  /*
  Select rows which values are url
  @params cols - Columns to be used
  @params drop - Drop rows that contains an url
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  url: SelectTypeRowsOperation('rows.url'),
  /*
  Select rows which values gender.
  @params cols - Columns to be used
  @params drop - Drop rows that contains a gender
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  gender: SelectTypeRowsOperation('rows.gender'),
  /*
  Select rows which values are boolean.
  @params cols - Columns to be used
  @params drop - Drop rows that contains a boolean
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  boolean: SelectTypeRowsOperation('rows.boolean'),
  /*
  Select rows which values are zip code.
  @params cols - Columns to be used
  @params drop - Drop rows that contains a zip code
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  zipCode: SelectTypeRowsOperation('rows.zipCode'),
  /*
  Select rows which values are credit card number.
  @params cols - Columns to be used
  @params drop - Drop rows that contains a credit card number
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  creditCardNumber: SelectTypeRowsOperation('rows.creditCardNumber'),
  /*
  Select rows which values are datetime
  @params cols - Columns to be used
  @params drop - Drop rows that contains a datetime
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  dateTime: SelectTypeRowsOperation('rows.dateTime'),
  /*
  Select rows which values are object
  @params cols: Columns to be used
  @params drop: Drop rows that contains an object
  @params how: How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  object: SelectTypeRowsOperation('rows.object'),
  /*
  Select rows which values are array
  @params cols - Columns to be used
  @params drop - Drop rows that contains an array
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  array: SelectTypeRowsOperation('rows.array'),
  /*
  Select rows which values are phone number
  @params cols - Columns to be used
  @params drop - Drop rows that contains a phone number
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  phoneNumber: SelectTypeRowsOperation('rows.phoneNumber'),
  /*
  Select rows which values are social security number
  @params cols - Columns to be used
  @params drop - Drop rows that contains a social security number
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  socialSecurityNumber: SelectTypeRowsOperation('rows.socialSecurityNumber'),
  /*
  Select rows which values are http code
  @params cols - Columns to be used
  @params drop - Drop rows that contains a http code
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  HTTPCode: SelectTypeRowsOperation('rows.HTTPCode'),
  /*
  Filter by expression
  @params where - Expression to be filtered
  @params cols - Columns to be used
  @params drop - Drop rows that match an expression
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  expression: DataframeOperation<{
    where: string;
    cols: Cols;
    drop: boolean;
    how: 'any' | 'all';
  }>({
    targetType: 'dataframe',
    name: 'rows.expression',
    args: [
      {
        name: 'where',
        default: null,
      },
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'drop',
        default: false,
      },
      {
        name: 'how',
        default: 'any',
      },
    ],
  }),
  /*
  Drop rows that contains a string
  @params cols - Columns to be used
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  dropStr: SelectRowsOperation('rows.dropStr'),
  /*
  Drop rows that contains a integer
  @params cols - Columns to be used
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  dropInt: SelectRowsOperation('rows.dropInt'),
  /*
  Drop rows that contains a float
  @params cols - Columns to be used
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  dropFloat: SelectRowsOperation('rows.dropFloat'),
  /*
  Drop rows that contains a numeric
  @params cols - Columns to be used
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  dropNumeric: SelectRowsOperation('rows.dropNumeric'),
  /*
  Drop rows that are greater or equal than a value
  @params cols - Columns to be used
  @params value - Value to be compared
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  dropGreaterThanEqual: DropValueRowsOperation('rows.dropGreaterThanEqual'),
  /*
  Drop rows that are greater than a value
  @params cols - Columns to be used
  @params value - Value to be compared
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  dropGreaterThan: DropValueRowsOperation('rows.dropGreaterThan'),
  /*
  Drop rows that are less or equal than a value
  @params cols - Columns to be used
  @params value - Value to be compared
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  dropLessThan: DropValueRowsOperation('rows.dropLessThan'),
  /*
  Drop rows that are less than a value
  @params cols: Columns to be used
  @params value - Value to be compared
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  dropLessThanEqual: DropValueRowsOperation('rows.dropLessThanEqual'),
  /*
  Drop rows between a range of values
  @params cols - Columns to be used
  @params lowerBound - Lower bound
  @params upperBound -  Upper bound
  @params equal - Include the bounds
  @params bounds - Bounds to be used
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  dropBetween: DataframeOperation<{
    cols: Cols;
    lowerBound: number;
    upperBound: number;
    includeBounds: boolean;
    bounds: [number, number];
    drop: boolean;
    how: 'any' | 'all';
  }>({
    targetType: 'dataframe',
    name: 'rows.dropBetween',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'lowerBound',
        default: null,
      },
      {
        name: 'upperBound',
        default: null,
      },
      {
        name: 'includeBounds',
        default: false,
      },
      {
        name: 'bounds',
        default: null,
      },
      {
        name: 'drop',
        default: false,
      },
      {
        name: 'how',
        default: 'any',
      },
    ],
  }),
  /*
  Drop rows that are equal to a value
  @params cols - Columns to be used
  @params value - Value to be compared
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  dropEqual: DropValueRowsOperation('rows.dropEqual'),
  /*
  Drop rows that are not equal to a value
  @params cols - Columns to be used
  @params value - Value to be compared
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  dropNotEqual: DropValueRowsOperation('rows.dropNotEqual'),
  /*
  Drop rows that contains a missing
  @params cols - Columns to be used
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  dropMissing: SelectRowsOperation('rows.dropMissing'),
  /*
  Drop rows that contains a null
  @params cols - Columns to be used
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  dropNulls: SelectRowsOperation('rows.dropNulls'),
  /*
  Drop rows that contains a none
  @params cols - Columns to be used
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  dropNone: SelectRowsOperation('rows.dropNone'),
  /*
  Drop rows that contains a nan
  @params cols - Columns to be used
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  dropNaN: SelectRowsOperation('rows.dropNaN'),
  /*
  Drop rows that contains a empty string
  @params cols - Columns to be used
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  dropEmpty: SelectRowsOperation('rows.dropEmpty'),
  /*
  Drop duplicated rows
  @params cols - Columns to be used
  @params keep - Which duplicate value to keep. first, last or all
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  dropDuplicated: DataframeOperation<{
    cols: Cols;
    keep: 'first' | 'last' | false;
    how: 'any' | 'all';
  }>({
    targetType: 'dataframe',
    name: 'rows.dropDuplicated',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'keep',
        default: 'first',
      },
      {
        name: 'how',
        default: 'any',
      },
    ],
  }),
  /*
  Drops first (passed to keep) matches of duplicates and unique values.
  @params cols - Columns to be used
  @params keep - Which duplicate value to keep. first, last or all
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  dropUniques: DataframeOperation<{
    cols: Cols;
    keep: 'first' | 'last' | false;
    how: 'any' | 'all';
  }>({
    targetType: 'dataframe',
    name: 'rows.dropUniques',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'keep',
        default: 'first',
      },
      {
        name: 'how',
        default: 'any',
      },
    ],
  }),
  /*
  Drop rows that contains a mismatch data type
  @params cols - Columns to be used
  @params dataType - Data type to be checked
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  dropMismatch: DataframeOperation<{
    cols: Cols;
    keep: 'first' | 'last' | false;
    how: 'any' | 'all';
  }>({
    targetType: 'dataframe',
    name: 'rows.dropMismatch',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'keep',
        default: 'first',
      },
      {
        name: 'how',
        default: 'any',
      },
    ],
  }),
  /*
  Drop rows that contains a match
  @params cols - Columns to be used
  @params regex - Regex to be used
  @params dataType - Data type to be checked
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  dropMatch: DataframeOperation<{
    cols: Cols;
    regex: string;
    dataType: string;
    how: 'any' | 'all';
  }>({
    targetType: 'dataframe',
    name: 'rows.dropMatch',
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
        name: 'how',
        default: 'any',
      },
    ],
  }),
  /*
  Drop rows that contains a regex match
  @params cols - Columns to be used
  @params regex - Regex to be used
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  dropByRegex: DataframeOperation<{
    cols: Cols;
    regex: string;
    how: 'any' | 'all';
  }>({
    targetType: 'dataframe',
    name: 'rows.dropByRegex',
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
        name: 'how',
        default: 'any',
      },
    ],
  }),
  /*
  Drop rows that contains a data type
  @params cols - Columns to be used
  @params dataType - Data type to be checked
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  dropByDataType: DataframeOperation<{
    cols: Cols;
    dataType: string;
    how: 'any' | 'all';
  }>({
    targetType: 'dataframe',
    name: 'rows.dropByDataType',
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
        name: 'how',
        default: 'any',
      },
    ],
  }),
  /*
  Drop rows that contains a value in a list
  @params cols - Columns to be used
  @params values - Value to be matched
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  dropValueIn: DropValueRowsOperation('rows.dropValueIn'),
  /*
  Drop rows that match a pattern
  @params cols - Columns to be used
  @params pattern - Pattern to be matched
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  dropPattern: DataframeOperation<{
    cols: Cols;
    pattern: string;
    how: 'any' | 'all';
  }>({
    targetType: 'dataframe',
    name: 'rows.dropPattern',
    args: [
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'pattern',
        default: null,
      },
      {
        name: 'how',
        default: 'any',
      },
    ],
  }),
  /*
  Drop rows that starts with a value
  @params cols - Columns to be used
  @params value - Value to be matched
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  dropStartsWith: DropValueRowsOperation('rows.dropStartsWith'),
  /*
  Drop rows that ends with a value
  @params cols - Columns to be used
  @params value - Value to be matched
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  dropEndsWith: DropValueRowsOperation('rows.dropEndsWith'),
  /*
  Drop rows that contains a value
  @params cols - Columns to be used
  @params value - Value to be matched
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  dropContains: DropValueRowsOperation('rows.dropContains'),
  /*
  Drop rows that math a value
  @params cols - Columns to be used
  @params value - Value to be matched
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  dropFind: DropValueRowsOperation('rows.dropFind'),
  /*
  Drop rows that contains a email
  @params cols - Columns to be used
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  dropEmails: SelectRowsOperation('rows.dropEmails'),
  /*
  Drop rows that contains a ip
  @params cols - Columns to be used
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  dropIPs: SelectRowsOperation('rows.dropIPs'),
  /*
  Drop rows that contains a url
  @params cols - Columns to be used
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  dropURLs: SelectRowsOperation('rows.dropURLs'),
  /*
  Drop rows that contains genders
  @params cols - Columns to be used
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  dropGenders: SelectRowsOperation('rows.dropGenders'),
  /*
  Drop rows that contains a boolean
  @params cols - Columns to be used
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  dropBooleans: SelectRowsOperation('rows.dropBooleans'),
  /*
  Drop rows that contains a zip code
  @params cols - Columns to be used
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  dropZipCodes: SelectRowsOperation('rows.dropZipCodes'),
  /*
  Drop rows that contains a credit card number
  @params cols - Columns to be used
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  dropCreditCardNumbers: SelectRowsOperation('rows.dropCreditCardNumbers'),
  /*
  Drop rows that contains a datetime
  @params cols - Columns to be used
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  dropDateTimes: SelectRowsOperation('rows.dropDateTimes'),
  /*
  Drop rows that contains a object
  @params cols - Columns to be used
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  dropObjects: SelectRowsOperation('rows.dropObjects'),
  /*
  Drop rows that contains a array
  @params cols - Columns to be used
  @params how: How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  dropArrays: SelectRowsOperation('rows.dropArrays'),
  /*
  Drop rows that contains a phone number
  @params cols - Columns to be used
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  dropPhoneNumbers: SelectRowsOperation('rows.dropPhoneNumbers'),
  /*
  Drop rows that contains a social security number
  @params cols - Columns to be used
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  dropSocialSecurityNumbers: SelectRowsOperation(
    'rows.dropSocialSecurityNumbers'
  ),
  /*
  Drop rows that contains a http code
  @params cols - Columns to be used
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  dropHTTPCodes: SelectRowsOperation('rows.dropHTTPCodes'),
  /*
  Drop rows that match an expression
  @params where - Expression to be evaluated
  @params cols - Columns to be used
  @params how - How to apply the mask. "any" or "all"
  @returns Optimus Dataframe
   */
  dropByExpression: DataframeOperation<{
    where: string;
    cols: Cols;
    how: 'any' | 'all';
  }>({
    targetType: 'dataframe',
    name: 'rows.dropByExpression',
    args: [
      {
        name: 'where',
        default: null,
      },
      {
        name: 'cols',
        default: '*',
      },
      {
        name: 'how',
        default: 'any',
      },
    ],
  }),
};
