// @flow
import axios, { AxiosInstance } from "axios";
import Logger from "js-logger";

import { BASE_URL, LOGGER_NAME } from "./Constants";

import { errorHandler, reqLogger, resLogger } from "./Utility";
import type { AddressQuery, DirectionResData } from "./Entitiy";

import * as AuthInterceptor from "./AuthInterceptor";
import type { IAuthInterceptor } from "./AuthInterceptor";

import { getDirection } from "./direction/DirectionApi";
import { directionData2Route } from "./direction/ModelRoute";

class DDSMapsApi {

    _axiosClient: AxiosInstance;
    _endpoint: ?string;
    _authInterceptors: {
        common: IAuthInterceptor,
        direction?: IAuthInterceptor,
    };

    constructor(authInterceptor: IAuthInterceptor = AuthInterceptor.none()) {
        myLogger.debug("DDSMapsApi::constructor");
        myLogger.info("Default authInterceptor: ", authInterceptor);

        this._axiosClient = axios.create({});

        this._axiosClient.interceptors.request.use(reqLogger);
        this._axiosClient.interceptors.response.use(resLogger);

        this._axiosClient.interceptors.response.use(res => res.data, errorHandler);

        this._authInterceptors = { common: authInterceptor };
    };

    get endpoint(): string {
        return this._endpoint || BASE_URL;
    };

    set endpoint(value: string) {
        myLogger.warn(`Endpoint overridden ${value}`);
        this._endpoint = value;
    };

    /**
     * Calculates directions between locations
     * {@see https://developers.google.com/maps/documentation/directions/intro}
     * @param origin
     * @param destination
     * @param optionals, either arrivalTime or departureTime
     * @param parser, custom function to transform api response data. If undefined default parser will be used, else if
     * null is passed in, no parsing will be done.
     */
    getDirection = (origin: AddressQuery,
                    destination: AddressQuery,
                    optionals: any,
                    parser?: ?((DirectionResData) => any)): Promise<any> => {

        const authInterceptor = this._authInterceptors.direction
            || this._authInterceptors.common;

        try {
            const promise = getDirection(origin, destination, optionals,
                this._axiosClient, this.endpoint, authInterceptor);

            return promise.then((data: DirectionResData) => {
                if (parser === undefined) {
                    return directionData2Route(data);
                } else if (parser === null) {
                    return data;
                } else {
                    return parser(data);
                }
            });
        } catch (e) {
            return Promise.reject(e);
        }
    }
}

Logger.useDefaults();
export const myLogger = Logger.get(LOGGER_NAME);

let instance;
export default Object.freeze({
    get Instance(): DDSMapsApi {
        if (instance === undefined) throw new Error("Not initialized");
        return instance;
    },

    init({ authInterceptor, logLevel = Logger.DEBUG }: any = {}): DDSMapsApi {
        myLogger.setLevel(logLevel);
        myLogger.info("Initializing...");
        instance = new DDSMapsApi(authInterceptor);
        return instance;
    }
});