const axios = require('axios');

import { returnRequest } from './interfaces';

export async function engineRequest(
    url: string,
    data: Object
): Promise<returnRequest> {
    try {
        const result = await axios
            .post(url + '/init-engine', data)
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
    data: Object
): Promise<returnRequest> {
    try {
        const result = await axios.post(url, data).catch((error: any) => {
            throw new Error(error);
        });

        return result.data;
    } catch (error) {
        throw error;
    }
}
