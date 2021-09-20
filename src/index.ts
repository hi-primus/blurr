import {
    ContentRequest,
    returnRequest,
    EngineConfiguration,
    InitConfig,
    Request,
} from './components/interfaces';

import { engineRequest, codeRequest } from './components/api';
import { v4 as uuidv4 } from 'uuid';
class Blurr {
    private _optimusAddress: string;
    private _engineConfiguration: EngineConfiguration = {
        engine: 'dask',
    };
    private _request?: Request;
    private _session: string;
    private _currentSource?: string;

    constructor(config: InitConfig) {
        this._session = config.session ?? uuidv4();
        this._optimusAddress = `${config.optimusAddress}/${this._session}`;
        this._engineConfiguration = Object.assign(
            this._engineConfiguration,
            config.engineConfiguration
        );
    }

    async engine(engineConfiguration?: EngineConfiguration): Promise<string> {
        try {
            this._engineConfiguration = Object.assign(
                this._engineConfiguration,
                engineConfiguration
            );

            const result = await engineRequest(
                this._optimusAddress,
                this._engineConfiguration
            );

            return result.updated;
        } catch (error) {
            throw error;
        }
    }

    async request(request: Request): Promise<ContentRequest> {
        this._request = request;

        if (!this._currentSource) {
            this._currentSource = await this.engine();
        }

        if (!this._request.source) {
            this._request.source = this._currentSource;
        }

        const { status, code, result, updated } = await codeRequest(
            this._optimusAddress + '/run',
            this._request
        );

        const contentRequest: ContentRequest = {
            status,
            code,
        };

        if (result) contentRequest.content = result;

        if (updated !== 'result') contentRequest.updated = updated;

        return contentRequest;
    }

    async code(request: Request): Promise<returnRequest> {
        this._request = request;

        const { status, code, updated } = await codeRequest(
            this._optimusAddress + '/code',
            this._request
        );

        return {
            status,
            code,
            updated,
        };
    }
}

module.exports = Blurr;
