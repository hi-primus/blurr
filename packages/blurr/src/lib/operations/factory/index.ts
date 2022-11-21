import {
  ArgsType,
  Operation,
  OperationArgument,
  OperationCreator,
} from '../../../types/operation';
import { RunsCode } from '../../../types/server';
import { isSource } from '../../client/data/source';
import {
  adaptKwargs,
  camelToSnake,
  generateUniqueVariableName,
  isObject,
  Name,
  objectMap,
  pythonArguments,
} from '../../utils';

const initialized: string[] = [];

export function makePythonCompatible(
  server: RunsCode,
  value: OperationCompatible
) {
  if (isSource(value)) {
    return Name(value.toString());
  } else if (value instanceof ArrayBuffer) {
    if (!server.supports('buffers')) {
      console.warn('Files not supported on this kind of server');
      return null;
    }
    const name = generateUniqueVariableName('file');
    server.setGlobal(name, value);
    return Name(name);
  } else if (value instanceof Function) {
    if (!server.supports('callbacks')) {
      console.warn(
        'Callbacks not supported as parameters on this kind of server'
      );
      return null;
    }
    const name = generateUniqueVariableName('func');
    server.setGlobal(name, value);
    return Name(name);
  } else if (Array.isArray(value)) {
    return value.map((v: OperationCompatible) =>
      makePythonCompatible(server, v)
    );
  } else if (isObject(value)) {
    return objectMap(value, (v: OperationCompatible) =>
      makePythonCompatible(server, v)
    );
  } else {
    return value;
  }
}

function isKwargs(
  kwargs: unknown
): kwargs is Record<string, OperationCompatible> {
  return (
    kwargs &&
    typeof kwargs === 'object' &&
    Object.keys(kwargs).every((key) => typeof key === 'string')
  );
}

async function callOperation<
  TA extends OperationArgs<OperationCompatible> = OperationArgs<OperationCompatible>,
  TR extends OperationCompatible = OperationCompatible
>(
  client: RunsCode,
  operation: Operation<TA, TR> = null,
  args: InputArgs = {}
): Promise<PythonCompatible> {
  await client.donePromise;

  if (operation.initialize && !initialized.includes(operation.name)) {
    initialized.push(operation.name);
    operation.initialize(client);
  }

  const operationArgs = operation.args || [];

  const kwargs = adaptKwargs(args, operationArgs);

  if (!('target' in kwargs) && operation.targetType === 'dataframe') {
    if (operation.targetType === operation.sourceType) {
      kwargs.target = kwargs.source;
    } else {
      kwargs.target = generateUniqueVariableName(operation.targetType);
    }
  }

  const operationResult = await operation._run(
    client,
    makePythonCompatible(client, kwargs)
  );
  if (operation.targetType == 'dataframe') {
    return Name(kwargs.target.toString());
  }
  return operationResult;
}

export function BlurrOperation<
  TA extends ArgsType = ArgsType,
  TR extends OperationCompatible = OperationCompatible
>(operationCreator: OperationCreator) {
  let _run: (
    client: RunsCode,
    kwargs: Record<string, PythonCompatible>
  ) => Promise<PythonCompatible>;

  if (operationCreator.getCode) {
    _run = async (server, kwargs) => {
      const code = operationCreator.getCode(kwargs);
      console.log('[CODE FROM GENERATOR]', code, { kwargs, args });
      return await server.runCode(code);
    };
  } else if (operationCreator.run) {
    _run = async (server, kwargs) => {
      console.log('[ARGUMENTS]', kwargs);
      return operationCreator.run(server, kwargs);
    };
  } else {
    _run = async (server, kwargs) => {
      const source = kwargs.source || operationCreator.defaultSource;
      const code =
        (kwargs.target ? `${kwargs.target} = ` : '') +
        (source ? `${source}.` : '') +
        camelToSnake(operationCreator.name) +
        `(${pythonArguments(kwargs)})`;
      console.log('[CODE FROM DEFAULT GENERATOR]', code);
      return await server.runCode(code);
    };
  }
  let initialize: (server: RunsCode) => Promise<PythonCompatible>;
  if (operationCreator.getInitializationCode) {
    initialize = async (server: RunsCode) => {
      return await server.runCode(operationCreator.getInitializationCode());
    };
  } else if (operationCreator.initialize) {
    initialize = operationCreator.initialize;
  }

  const args: OperationArgument[] = (operationCreator.args || []).map((arg) => {
    return typeof arg === 'string' ? { name: arg } : arg;
  });

  const operation: Operation<TA, TR> = {
    name: operationCreator.name,
    sourceType: operationCreator.sourceType,
    targetType: operationCreator.targetType,
    args,
    initialize,
    _run,
    run: async function (server, kwargs: TA): Promise<TR> {
      if (isKwargs(kwargs)) {
        return (await callOperation(server, operation, kwargs)) as TR;
      }
      throw new Error(
        `kwargs must be an object with string keys, type received: ${typeof kwargs}`
      );
    },
    _blurrMember: 'operation',
  };

  return operation;
}