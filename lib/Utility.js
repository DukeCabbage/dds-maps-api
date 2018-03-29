// @flow

import { myLogger } from "./DDSMapsApi";

export const reqLogger = (config: any): any => {
    myLogger.info(`--> ${config.method.toUpperCase()}`);
    myLogger.info(config.url);
    myLogger.debug(config);
    myLogger.info("--> END")

    return config;
};

export const resLogger = (res: any): any => {
    myLogger.info(`<-- ${res.status} ${res.data.status || res.statusText || ""}`);
    myLogger.info(res.data);
    myLogger.debug(res);
    myLogger.info("<-- END");
    return res;
};

export const errorHandler = (error: any): Promise<any> => {
    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        myLogger.warn(error.response.data);
        myLogger.warn(error.response.status);
        myLogger.warn(error.response.headers);
    } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        myLogger.warn(error.request);
    } else {
        // Something happened in setting up the request that triggered an Error
        myLogger.error(error.message);
    }

    return Promise.reject(error);
};