// @flow
import { myLogger } from "../DDSMapsApi";
import type { DirectionRoute } from "../NetworkEntitiy";

export type Location = {
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
    },
    steps: Step[],
};

type Step = {
    maneuver: ?string,
    startLocation: Location,
    endLocation: Location,
};

export const directionData2Route = (resRoute: DirectionRoute): ?ModelRoute => {
    try {
        let model = {};
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
        model.copyrights = resRoute.copyrights;

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

        model.steps = resLeg.steps
            .map(it => ({
                maneuver: it.maneuver,
                startLocation: {
                    latitude: it.start_location.lat,
                    longitude: it.start_location.lng,
                },
                endLocation: {
                    latitude: it.end_location.lat,
                    longitude: it.end_location.lng,
                },
            }));

        return model;

    } catch (error) {
        myLogger.error(error);
        return null;
    }
};