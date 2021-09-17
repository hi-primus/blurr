export interface returnRequest {
    status: string;
    code: Array<string>;
    updated: string;
    result?: string;
}

export interface ContentRequest {
    status: string;
    code: Array<string>;
    content?: string;
    updated?: string;
}

export interface EngineConfiguration {
    engine: String;
    memory_limit?: String;
}

export interface InitConfig {
    optimusAddress: string;
    engineConfiguration?: EngineConfiguration;
    session?: string;
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
