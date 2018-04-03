// @flow

type LatLng = {
    lat: number,
    lng: number,
};

type Fare = {
    currency: string,
    value: number,
    text: string,
};

export type AddressQuery = {
    placeId: ?string,
    latitude: ?number,
    longitude: ?number,
    streetNumber: ?number,
    streetName: string,
    cityName: ?string,
};

//https://developers.google.com/maps/documentation/directions/intro#DirectionsResponses
//region Direction
export type DirectionResData = {
    geocoded_waypoints: GeoCodedWaypoint[],
    routes: DirectionRoute[],
    status: string,
    error_message: ?string,
};

type GeoCodedWaypoint = {
    geocoder_status: string,
    place_id: string,
    types: string[],
};

export type DirectionRoute = {
    summary: string,
    legs: DirectionLeg[],
    overview_polyline: { points: string },
    bounds: { northeast: LatLng, southwest: LatLng },
    copyrights: string,
    warnings: string[],
    fare: ?Fare,
};

type DirectionLeg = {
    steps: DirectionStep[],
    distance: { value: number, text: string },  // In meters
    duration: { value: number, text: string },  // In seconds
    duration_in_traffic: ?{ value: number, text: string },

    start_address: string,
    end_address: string,
    start_location: LatLng,
    end_location: LatLng,
};

type DirectionStep = {
    steps: ?DirectionStep[],
    start_location: LatLng,
    end_location: LatLng,
    polyline: { points: string },
    distance: { value: number, text: string },
    duration: { value: number, text: string },
    maneuver: string,
};
//endregion

//https://developers.google.com/maps/documentation/distance-matrix/intro#DistanceMatrixResponses
//region Distance Matrix
export type DistanceMatrixResData = {
    origin_addresses: string[],
    destination_addresses: string[],
    rows: DistanceMatrixRow[],
    status: string,
    error_message: ?string,
};

export type DistanceMatrixRow = {
    elements: DistanceMatrixElement[],
};

export type DistanceMatrixElement = {
    distance: { value: number, text: string },
    duration: { value: number, text: string },
    duration_in_traffic: ?{ value: number, text: string },
    fare: ?Fare,
    status: string,
};
//endregion

//https://developers.google.com/maps/documentation/roads/snap
//region Roads
export type SnappedPoint = {
    location: { latitude: number, longitude: number },
    originalIndex: number,
    placeId: string
}

export type SnapToRoadsResData = {
    snappedPoints: SnappedPoint[],
}
//endregion