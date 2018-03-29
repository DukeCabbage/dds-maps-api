import type { AddressQuery, DirectionResData } from "../Entitiy";
import type { ModelRoute } from "./ModelRoute";

const PATH = "/api/directions/json";

/**
 * https://developers.google.com/maps/documentation/directions/intro
 */

export const getDirection = (origin: AddressQuery,
                             destination: AddressQuery,
                             optionals = {},
                             axiosClient,
                             endpoint: string,
                             authInterceptor) => {

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

export const parseDirectionRoute = (data: DirectionResData): ModelRoute => {
    if (data.status !== "OK") { return data; }

    let model: ModelRoute = {};

    try {
        const resRoute = data.routes[0];
        model.summary = resRoute.summary;
        model.overviewPolyline = resRoute.overview_polyline.points;
        model.viewPort = {
            northeast: {
                latitude: resRoute.bounds.northeast.lat,
                longitude: resRoute.bounds.northeast.lng,
            },
            southwest: {
                latitude: resRoute.bounds.southwest.lat,
                longitude: resRoute.bounds.southwest.lng,
            }
        };

        const resLeg = resRoute.legs[0];
        model.startAddress = resLeg.start_address;
        model.startLocation = {
            latitude: resLeg.start_location.lat,
            longitude: resLeg.start_location.lng,
        };
        model.endAddress = resLeg.end_address;
        model.endLocation = {
            latitude: resLeg.end_location.lat,
            longitude: resLeg.end_location.lng,
        };

        model.distance = resLeg.distance.value;
        model.duration = resLeg.duration.value;
        model.durationInTraffic = resLeg.duration_in_traffic ? resLeg.duration_in_traffic.value : null;
    } catch (error) {
        console.warn(error);
    }

    return model;
};

const serializeAddress = (address: AddressQuery): string => {
    if (address.placeId) {
        return `place_id:${address.placeId}`;
    } else if (address.latitude && address.longitude) {
        return `${address.latitude},${address.longitude}`;
    } else {
        console.warn(new Error("Unsupported format"));
        return "";
    }
};