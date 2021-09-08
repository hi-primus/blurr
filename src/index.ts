import {
    returnRequest,
    EngineConfiguration,
    InitConfig,
    Request,
} from './components/interfaces';

import { engineRequest, codeRequest } from './components/api';

export class Blurr {
    private _optimusAddress: string;
    private _engineConfiguration: EngineConfiguration = {
        engine: 'dask',
        memory_limit: '2 GB',
    };
    private _request?: Request;

    constructor(config: InitConfig) {
        this._optimusAddress = config.optimusAddress;
        this.engine(config.engineConfiguration);
    }

    async engine(
        engineConfiguration?: EngineConfiguration
    ): Promise<EngineConfiguration> {
        try {
            this._engineConfiguration = Object.assign(
                this._engineConfiguration,
                engineConfiguration
            );

            await engineRequest(
                this._optimusAddress,
                this._engineConfiguration
            );

            return this._engineConfiguration;
        } catch (error) {
            throw error;
        }
    }

    async request(request: Request): Promise<returnRequest> {
        this._request = request;

        return await codeRequest(this._optimusAddress, this._request);
    }
}
