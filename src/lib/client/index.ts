import { RequestOptions } from '../../types/arguments';
import type { Client, ClientOptions } from '../../types/client';
import type {
  FutureSource,
  Source as SourceInterface,
} from '../../types/source';
import { getOperation } from '../operations';
import { operations } from '../operations/client';
import { makePythonCompatible } from '../operations/factory';
import { defaultOptions as defaultServerOptions, Server } from '../server';
import { camelToSnake, pythonArguments } from '../utils';
import {
  adaptKwargs,
  generateUniqueVariableName,
  isName,
  isPromiseLike,
  isStringRecord,
} from '../utils';

const prepareResult = (client: Client, result: PythonCompatible) => {
  if (isName(result) || isSource(result)) {
    const sourceData = (result as SourceInterface).data;
    if (sourceData !== undefined || result.name) {
      const newSource = Source(
        client,
        sourceData !== undefined ? sourceData : result.name
      );
      delete (newSource as Partial<FutureSource>).then;
      return newSource as SourceInterface;
    }
  }
  if (
    client.options.serverOptions.local &&
    result instanceof client.backendServer.pyodide.ffi.PyProxy
  ) {
    const newSource = Source(client, result);
    delete (newSource as Partial<FutureSource>).then;
    return newSource as SourceInterface;
  }
  return result;
};

import { isSource, Source } from './data/source';

export function Blurr(options: ClientOptions = {}): Client {
  const blurr = {} as Client;

  const serverOptions =
    (options.server ? options.server.options : options.serverOptions) || {};

  options.serverOptions = Object.assign(
    {},
    defaultServerOptions,
    serverOptions
  );

  blurr.options = options;

  blurr.backendServer = options.server
    ? options.server
    : Server(options?.serverOptions);

  blurr.run = (
    paramsArray: ArrayOrSingle<Params>,
    requestOptions: RequestOptions
  ) => {
    if (!Array.isArray(paramsArray)) {
      paramsArray = [paramsArray];
    }

    const firstParams = paramsArray[0];

    let paramsQueue = [] as Params[];

    if (firstParams && isSource(firstParams.source)) {
      paramsQueue = [...firstParams.source.paramsQueue];
    }

    paramsQueue.push(
      ...paramsArray.map((params: Params) => {
        return {
          ...params,
          requestOptions: params.requestOptions || requestOptions || {},
        } as Params;
      })
    );

    const operations = paramsQueue.map((params) => {
      const { operationKey, operationType } = params;
      const operation = getOperation(operationKey, operationType);
      if (!operation) {
        throw new Error(
          `Operation '${operationKey}' of type '${operationType}' not found`
        );
      }
      return operation;
    });

    const lastOperation = operations[operations.length - 1];

    requestOptions = Object.assign(
      {},
      ...paramsQueue.map((params) => params?.requestOptions || {}),
      requestOptions
    );

    if (
      lastOperation &&
      lastOperation.targetType === 'dataframe' &&
      !requestOptions.getCode
    ) {
      const lastParams = paramsQueue[paramsQueue.length - 1];

      if (lastParams.target === undefined) {
        if (lastOperation.createsNew) {
          lastParams.target = generateUniqueVariableName(
            lastOperation.targetType
          );
        } else {
          lastParams.target =
            lastParams.source ||
            generateUniqueVariableName(lastOperation.targetType);
        }
      }

      if (!blurr.options.serverOptions.local) {
        if (lastParams.target === undefined) {
          throw new Error('Target is undefined');
          // should return a promise that resolves to a result
        }

        console.log(
          '🛼 Returning without running using params:',
          lastParams.target
        );

        const newSource = Source(blurr, lastParams.target.toString());
        newSource.paramsQueue = paramsQueue;
        return newSource;
      }
    }

    return blurr.send(paramsQueue);
  };

  blurr.send = (paramsQueue) => {
    console.log('🛼 Sending params:', paramsQueue);
    paramsQueue = makePythonCompatible(
      blurr,
      paramsQueue,
      blurr.options.serverOptions.local
    ) as Params[];
    const requestOptions: RequestOptions = Object.assign(
      {},
      ...paramsQueue.map((params) => params?.requestOptions || {})
    );
    let code: string | null;
    if (requestOptions.getCode) {
      code = '';
      for (const params of paramsQueue) {
        const { operationKey, operationType } = params;
        const operation = getOperation(operationKey, operationType);
        if (!operation) {
          throw new Error(
            `Operation '${operationKey}' of type '${operationType}' not found`
          );
        }
        const kwargs = { ...params } as Record<string, PythonCompatible>;
        delete kwargs.operationKey;
        delete kwargs.operationType;
        delete kwargs.requestOptions;

        for (const key in kwargs) {
          if (kwargs[key] === undefined) {
            delete kwargs[key];
          }
        }

        if (operation.getCode) {
          code += operation.getCode(kwargs);
          continue;
        } else {
          if (params.target) {
            code += `${params.target} = `;
          }
          if (params.source) {
            code += `${params.source}.`;
          }
          delete kwargs.source;
          delete kwargs.target;
          code += `${camelToSnake(operation.name)}(${pythonArguments(
            kwargs
          )})\n`;
        }
      }
      return code;
    }
    const result = blurr.backendServer.run(paramsQueue, requestOptions);
    if (isPromiseLike(result)) {
      return result.then((result) => prepareResult(blurr, result));
    }
    return prepareResult(blurr, result);
  };

  blurr.runCode = (code: string, requestOptions: RequestOptions) => {
    if (requestOptions?.getCode) {
      return code;
    }
    // TODO: check if it's debug
    const result = blurr.backendServer.runCode(
      code,
      requestOptions
    ) as PromiseOr<PythonCompatible>;
    if (isPromiseLike(result)) {
      return result.then((result) => prepareResult(blurr, result));
    }
    return prepareResult(blurr, result);
  };

  blurr.createSource = (name: string) => {
    const source = Source(blurr, name);
    return source;
  };

  blurr.supports = blurr.backendServer.supports;
  // TODO: improve security in setGlobal and getGlobal
  blurr.setGlobal = blurr.backendServer.setGlobal;
  blurr.getGlobal = blurr.backendServer.getGlobal;
  blurr.donePromise = blurr.backendServer.donePromise;

  const clientFunctions = {};

  for (const key in operations) {
    const operationArgs = operations[key].args;
    const operationArgsNames = [
      'target',
      'source',
      'requestOptions',
      ...operationArgs.map((arg) => arg.name),
    ];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    clientFunctions[key as any] = (...args) => {
      let _args: InputArgs;
      if (
        args.length === 1 &&
        isStringRecord(args[0]) &&
        Object.keys(args[0]).every((key) => operationArgsNames.includes(key))
      ) {
        _args = args[0] as Record<string, OperationCompatible>;
      } else {
        _args = args as OperationCompatible[];
      }
      const kwargs = adaptKwargs(_args, operationArgs);
      return blurr.run({
        ...kwargs,
        operationKey: key,
        operationType: 'client',
      });
    };
  }

  Object.assign(blurr, clientFunctions);

  return blurr;
}
