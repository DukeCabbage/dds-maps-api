// @flow
import { myLogger } from "../DDSMapsApi";
import type { ErrorResData } from "../Entitiy";

type Location = {
    latitude: number,
    longitude: number
};

export type ModelRoute = {

    summary: string,
    startAddress: string,
    endAddress: string,
    startLocation: Location,
    endLocation: Location,
    overviewPolyline: string,
    distance: number,   // in meters
    duration: number,   // in seconds
    durationInTraffic: ?number, // premium only

    viewPort: {
        northeast: Location,
        southwest: Location,
    }
};

export const directionData2Route = (data: any): ModelRoute | ErrorResData => {
    if (data.status !== "OK") { return data; }

    let model = {};

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
        myLogger.error(error);
    }

    return model;
};