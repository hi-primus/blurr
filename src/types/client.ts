import { operations } from '../lib/operations/client';

import { OperationFunctions } from './operation';
import { RunsCode, Server, ServerOptions } from './server';
import { Source } from './source';
export interface ClientOptions {
  server?: Server;
  serverOptions?: ServerOptions;
}

export type ClientFunctions = OperationFunctions<typeof operations>;

export interface Client extends RunsCode<OperationCompatible>, ClientFunctions {
  options: ClientOptions;
  backendServer: Server;
  createSource: (name: string) => Source;
  send(paramsQueue: Params[]): PromiseOr<OperationCompatible>;
}
