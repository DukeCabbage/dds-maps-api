// @flow
import axios, { AxiosInstance } from "axios";
import Logger from "js-logger";

import { errorHandler, reqLogger, resLogger } from "./Utility";
import type {
    AddressQuery,
    DirectionResData,
    DirectionRoute,
    DistanceMatrixResData,
} from "./NetworkEntitiy";

import type { IAuthInterceptor } from "./AuthInterceptor";
import * as AuthInterceptor from "./AuthInterceptor";

import { getDirection } from "./direction/DirectionApi";
import { directionData2Route as defaultRouteParser } from "./direction/ModelRoute";
import type { Location } from "./direction/ModelRoute";
import { defaultRowParser, getEstimate } from "./distance/DistanceMatrixApi";
import { nearestRoads, snapToRoad } from "./roads/RoadsApi";

const BASE_URL = "https://maps.googleapis.com/maps";
const BASE_ROADS_URL = "https://roads.googleapis.com";
const LOGGER_NAME = "DDSMapsApi";

class DDSMapsApi {

    _axiosClient: AxiosInstance;
    // _endpoint: ?string;
    _authInterceptors: {
        common: IAuthInterceptor,
        direction?: IAuthInterceptor,
        distanceMatrix?: IAuthInterceptor,
        roads?: IAuthInterceptor,
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

    static get endpoint(): string {
        // return this._endpoint || BASE_URL;
        return BASE_URL;
    };

    static get roadsEndpoint(): string {
        return BASE_ROADS_URL;
    };

    // set endpoint(value: string) {
    //     myLogger.warn(`Endpoint overridden ${value}`);
    //     this._endpoint = value;
    // };

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
                    customFilter?: ((any) => boolean)) => {
        try {
            const authInterceptor = this._authInterceptors.direction
                || this._authInterceptors.common;

            const optionalParams = {
                alternatives,
                language,
                arrivalTime,
                departureTime,
            };

            const promise = getDirection(origin, destination, optionalParams,
                this._axiosClient, DDSMapsApi.endpoint, authInterceptor);

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
            myLogger.warn(e.message);
            return Promise.reject(e);
        }
    };

    /**
     * Provides travel distance and time for a matrix of origins and destinations.
     * {@see https://developers.google.com/maps/documentation/distance-matrix/intro}
     * @param origins
     * @param destinations
     * @param language
     */
    getEstimate = (origins: AddressQuery[],
                   destinations: AddressQuery[],
                   language?: string) => {

        try {
            const authInterceptor = this._authInterceptors.distanceMatrix
                || this._authInterceptors.common;

            const optionalParams = { language };

            const promise = getEstimate(origins, destinations, optionalParams,
                this._axiosClient, DDSMapsApi.endpoint, authInterceptor);

            return promise.then((data: DistanceMatrixResData) => {

                let parsedData = {};
                parsedData.status = data.status;
                parsedData.errorMessage = data.error_message;
                parsedData.origins = data.origin_addresses;
                parsedData.destination = data.destination_addresses;

                if (parsedData.status === "OK") {
                    parsedData.estimates = data.rows.map(it => defaultRowParser(it));
                }

                return parsedData;
            });

        } catch (e) {
            myLogger.warn(e.message);
            return Promise.reject(e);
        }
    };

    /**
     * Takes up to 100 GPS points collected along a route, and returns a similar set of data, with the points snapped
     * to the most likely roads the vehicle was traveling along.
     * {@see https://developers.google.com/maps/documentation/roads/snap}
     * @param path
     * @param interpolate
     */
    snapToRoads = (path: Location[], interpolate: boolean) => {
        try {
            const authInterceptor = this._authInterceptors.roads
                || this._authInterceptors.common;

            return snapToRoad(path, interpolate,
                this._axiosClient, DDSMapsApi.roadsEndpoint, authInterceptor);

        } catch (e) {
            myLogger.warn(e.message);
            return Promise.reject(e);
        }
    };

    /**
     * Takes up to 100 independent coordinates, and returns the closest road segment for each point.
     * The points passed do not need to be part of a continuous path.
     * {@see https://developers.google.com/maps/documentation/roads/nearest}
     * @param points
     */
    nearestRoads = (points: Location[]) => {
        try {
            const authInterceptor = this._authInterceptors.roads
                || this._authInterceptors.common;

            return nearestRoads(points,
                this._axiosClient, DDSMapsApi.roadsEndpoint, authInterceptor);

        } catch (e) {
            myLogger.warn(e.message);
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