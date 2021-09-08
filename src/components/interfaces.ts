export interface returnRequest {
    data: {
        status: string;
        code: Array<string>;
        updated: string;
    };
}

export interface EngineConfiguration {
    engine: String;
    memory_limit: String;
}

export interface InitConfig {
    optimusAddress: string;
    engineConfiguration?: EngineConfiguration;
}

export interface Request {
    operation: String;
    dict?: Object;
    target?: String;
    source?: String;
    path?: String;
    columns?: String;
    n?: String;
    endpoint_url?: String;
    bucket?: String;
    suggestion?: String;
    value?: String;
}
