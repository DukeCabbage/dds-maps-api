// @flow
import axios, { AxiosInstance } from "axios";
import Logger from "js-logger";

import { BASE_URL, LOGGER_NAME } from "./Constants";

import { errorHandler, reqLogger, resLogger } from "./Utility";
import type { AddressQuery, DirectionResData, DirectionRoute } from "./Entitiy";

import type { IAuthInterceptor } from "./AuthInterceptor";
import * as AuthInterceptor from "./AuthInterceptor";

import { getDirection } from "./direction/DirectionApi";
import { directionData2Route as defaultRouteParser } from "./direction/ModelRoute";

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

        // Logger
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
     * @param alternatives
     * @param arrivalTime
     * @param departureTime
     * @param language
     * @param customRouteParser, custom function to parse api response data, otherwise default parser will be used
     * @param customFilter, filter to be applied after parsing to filter out invalid route items, default filter will
     *     check if item is not undefined or null
     */
    getDirection = (origin: AddressQuery,
                    destination: AddressQuery,
                    alternatives?: boolean,
                    arrivalTime?: number,
                    departureTime?: number,
                    language?: string,
                    customRouteParser?: ((DirectionRoute) => any),
                    customFilter?: ((any) => boolean)): Promise<any> => {

        const authInterceptor = this._authInterceptors.direction
            || this._authInterceptors.common;

        try {

            let optionalParams = { alternatives, language };

            if (!!arrivalTime && !!departureTime) {
                return Promise.reject("Can not specify both arrival_time and departure_time");
            } else if (!!arrivalTime) {
                optionalParams = { ...optionalParams, arrivalTime };
            } else if (!!departureTime) {
                optionalParams = { ...optionalParams, departureTime };
            }

            const promise = getDirection(origin, destination, optionalParams,
                this._axiosClient, this.endpoint, authInterceptor);

            return promise.then((data: DirectionResData) => {

                let parsedData = {};
                parsedData.status = data.status;
                parsedData.errorMessage = data.error_message;
                parsedData.geocodedWaypoints = data.geocoded_waypoints;

                if (parsedData.status === "OK") {
                    parsedData.routes = data.routes
                        .map(it => (customRouteParser || defaultRouteParser)(it))
                        .filter(it => (customFilter || (item => !!item))(it));
                }

                return parsedData;
            });
        } catch (e) {
            return Promise.reject(e);
        }
    }
}

//region
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
//endregion