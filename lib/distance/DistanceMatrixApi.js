import { AxiosInstance } from "axios";

import type { AddressQuery, DistanceMatrixRow } from "../NetworkEntitiy";
import type { IAuthInterceptor } from "../AuthInterceptor";

const PATH = "/api/distancematrix/json";

/**
 * https://developers.google.com/maps/documentation/distance-matrix/intro
 */

export const getEstimate = (origins: AddressQuery[],
                            destinations: AddressQuery[],
                            optionalParams: any,
                            axiosClient: AxiosInstance,
                            endpoint: string,
                            authInterceptor: IAuthInterceptor) => {

    if (!origins || !destinations || origins.length === 0 || destinations.length === 0) {
        throw new Error("Need at least one origin and one destination");
    }

    const {
        mode = "driving",
        language = "en",
        units = "metric",
    } = optionalParams;

    let url = `${endpoint}${PATH}?language=${language}`;

    url += `&origin=${serializeAddress(origins)}`;
    url += `&destination=${serializeAddress(destinations)}`;

    url += `&mode=${mode}`;
    url += `&units=${units}`;

    const newUrl = authInterceptor.intercept(url);

    return axiosClient.get(newUrl);
};

const serializeAddress = (addresses: AddressQuery[]): string => {
    return addresses.map(item => {
        if (!!item.placeId) {
            return `place_id:${item.placeId}`;
        } else if (item.latitude && item.longitude) {
            return `${String(item.latitude)},${String(item.longitude)}`;
        } else {
            throw new Error("Unsupported format");
        }
    }).join("|");
};

export const defaultRowParser = (row: DistanceMatrixRow): any[] => {
    return row.elements.map(element =>
        ({
            distance: element.distance || null,
            duration: element.duration || null,
            durationInTraffic: element.duration_in_traffic || null
        })
    );
};