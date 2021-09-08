const axios = require('axios');

import { returnRequest } from './interfaces';

export async function engineRequest(
    url: string,
    configuration: Object
): Promise<returnRequest> {
    try {
        const result = await axios
            .post(url + '/default/init-engine', configuration)
            .catch((error: any) => {
                throw new Error(error);
            });

        return result.data;
    } catch (error) {
        throw error;
    }
}

export async function codeRequest(
    url: string,
    configuration: Object
): Promise<returnRequest> {
    try {
        const result = await axios
            .post(url + '/default/code', configuration)
            .catch((error: any) => {
                throw new Error(error);
            });

        return result.data;
    } catch (error) {
        throw error;
    }
}
