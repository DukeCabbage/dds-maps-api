// @flow

import { AxiosInstance } from "axios";

import { myLogger } from "../DDSMapsApi";
import type { AddressQuery } from "../Entitiy";
import type { IAuthInterceptor } from "../AuthInterceptor";

const PATH = "/api/directions/json";

/**
 * https://developers.google.com/maps/documentation/directions/intro
 */

export const getDirection = (origin: AddressQuery,
                             destination: AddressQuery,
                             optionals: any = {},
                             axiosClient: AxiosInstance,
                             endpoint: string,
                             authInterceptor: IAuthInterceptor) => {

    if (!origin || !destination) {
        throw new Error("Need both origin and destination");
    }

    const {
        language = "en",
        mode = "driving",
        arrivalTime,
        departureTime,
    } = optionals

    let url = `${endpoint}${PATH}?language=${language}`;
    url += `&mode=${mode}`;

    url += `&origin=${serializeAddress(origin)}`;
    url += `&destination=${serializeAddress(destination)}`;

    if (!!arrivalTime) {
        url += `arrival_time=${arrivalTime}`;
    } else if (!!departureTime) {
        url += `departure_time=${departureTime}`;
    }

    const newUrl = authInterceptor.intercept(url);

    return axiosClient.get(newUrl);
}

const serializeAddress = (address: AddressQuery): string => {
    if (!!address.placeId) {
        return `place_id:${address.placeId}`;
    } else if (address.latitude && address.longitude) {
        return `${String(address.latitude)},${String(address.longitude)}`;
    } else {
        myLogger.error(new Error("Unsupported format"));
        return "";
    }
};