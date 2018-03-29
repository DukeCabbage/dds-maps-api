// @flow
import axios from "axios";

import { BASE_URL } from "./Constants";
import * as AuthInterceptor from "./AuthInterceptor";
import { errorHandler, reqLogger, resLogger } from "./Utility";
import type { AddressQuery, DirectionResData } from "./Entitiy";

import { getDirection, parseDirectionRoute } from "./direction/DirectionApi";

export default class DDSMapsApi {

    constructor(authInterceptor: AuthInterceptor = AuthInterceptor.none(),
                showLog: boolean = false) {

        this._axiosClient = axios.create({});

        if (showLog) {
            this._axiosClient.interceptors.request.use(reqLogger);
            this._axiosClient.interceptors.response.use(resLogger);
        }

        this._axiosClient.interceptors.response.use(res => res.data, errorHandler);

        this._authInterceptors = {};
        this._authInterceptors["common"] = authInterceptor;
    };

    get endpoint(): string {
        return this._endpoint || BASE_URL;
    };

    set endpoint(value: string) {
        console.warn(`Endpoint overridden ${value}`);
        this._endpoint = value;
    };

    getDirection = (origin: AddressQuery,
                    destination: AddressQuery,
                    optionals,
                    parser?: (DirectionResData) => any): Promise<any> => {

        const authInterceptor = this._authInterceptors["direction"]
            || this._authInterceptors["common"];

        try {
            const promise = getDirection(origin, destination, optionals,
                this._axiosClient, this.endpoint, authInterceptor);

            if (parser === undefined) {
                return promise.then(data => parseDirectionRoute(data));
            } else if (parser === null) {
                return promise;
            } else {
                return promise.then(data => parser(data));
            }
        } catch (e) {
            return Promise.reject(e);
        }
    }
}