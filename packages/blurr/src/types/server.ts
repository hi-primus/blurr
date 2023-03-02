import { SourceArg } from './arguments';
import { KernelGatewayBackendOptions } from './kernelgateway';
import { PyodideBackendOptions, PyodideInterface } from './pyodide';

export interface RunsCode {
  donePromise: Promise<boolean>;
  supports: (feature: string) => boolean;
  run: (
    kwargs: ArrayOrSingle<Params>,
    callbackKey?: string
  ) => PromiseOr<unknown>;
  runCode: (
    code: string,
    callback?: (result: PythonCompatible) => void
  ) => PromiseOr<unknown>;
  getGlobal: (name: string) => PromiseOr<PythonCompatible>;
  setGlobal: (name: string, value: PythonCompatible) => PromiseOr<void>;
}
interface PromiseWorker {
  postMessage: (
    message: unknown,
    transfer?: Transferable[] | null,
    callback?: (result: unknown) => void
  ) => Promise<unknown>;
}

type BackendInterface = PyodideInterface | PromiseWorker;

export type ServerOptions = PyodideBackendOptions | KernelGatewayBackendOptions;

export interface Server extends RunsCode {
  pyodide?: PyodideInterface;
  worker?: PromiseWorker;
  options: ServerOptions;
  runMethod?: (
    source: SourceArg,
    method: string,
    kwargs: Record<string, unknown>,
    callback?: (result: PythonCompatible) => void
  ) => PromiseOr<PythonCompatible>;
  backend?: BackendInterface;
  backendLoaded: boolean;
  run: (
    kwargs: ArrayOrSingle<Params>,
    callbackKey?: string
  ) => PromiseOr<PythonCompatible>;
}
