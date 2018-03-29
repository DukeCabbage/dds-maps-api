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