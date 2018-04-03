// @flow

import { AxiosInstance } from "axios";

import type { AddressQuery } from "../NetworkEntitiy";
import type { IAuthInterceptor } from "../AuthInterceptor";

const PATH = "/api/directions/json";

/**
 * https://developers.google.com/maps/documentation/directions/intro
 */

export const getDirection = (origin: AddressQuery,
                             destination: AddressQuery,
                             optionalParams: any = {},
                             axiosClient: AxiosInstance,
                             endpoint: string,
                             authInterceptor: IAuthInterceptor) => {

    if (!origin || !destination) {
        throw new Error("Need both origin and destination");
    }

    const {
        mode = "driving",
        language = "en",
        arrivalTime,
        departureTime,
        alternatives = false,
        units = "metric",
    } = optionalParams;

    let url = `${endpoint}${PATH}?language=${language}`;

    url += `&origin=${serializeAddress(origin)}`;
    url += `&destination=${serializeAddress(destination)}`;

    url += `&mode=${mode}`;
    url += `&alternatives=${String(alternatives)}`;
    url += `&units=${units}`;

    if (!!arrivalTime && !!departureTime) {
        throw new Error("Can not specify both arrival_time and departure_time");
    } else if (!!arrivalTime) {
        url += `&arrival_time=${arrivalTime}`;
    } else if (!!departureTime) {
        url += `&departure_time=${departureTime}`;
    }

    const newUrl = authInterceptor.intercept(url);

    return axiosClient.get(newUrl);
};

const serializeAddress = (address: AddressQuery): string => {
    if (!!address.placeId) {
        return `place_id:${address.placeId}`;
    } else if (address.latitude && address.longitude) {
        return `${String(address.latitude)},${String(address.longitude)}`;
    } else {
        throw new Error("Unsupported format");
    }
};