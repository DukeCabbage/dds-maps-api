// @flow

type LatLng = {
    lat: number,
    lng: number,
}

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
    geocoded_waypoints: Array<GeoCodedWaypoint>,
    routes: Array<DirectionRoute>,
    status: string,
    error_message: ?string,
};

type GeoCodedWaypoint = {
    geocoder_status: string,
    place_id: string,
    types: Array<string>,
};

export type DirectionRoute = {
    summary: string,
    legs: Array<DirectionLeg>,
    overview_polyline: { points: string },
    bounds: { northeast: LatLng, southwest: LatLng },
    copyrights: string,
    warnings: Array<string>,
    fare: ?Fare,
};

type DirectionLeg = {
    steps: Array<DirectionStep>,
    distance: { value: number, text: string },  // In meters
    duration: { value: number, text: string },  // In seconds
    duration_in_traffic: ?{ value: number, text: string },

    arrival_time: ?Time,    // Transit only
    departure_time: ?Time,    // Transit only

    start_address: string,
    end_address: string,
    start_location: LatLng,
    end_location: LatLng,
};

type DirectionStep = {
    steps: ?Array<DirectionStep>,
    start_location: LatLng,
    end_location: LatLng,
    polyline: { points: string },
    distance: { value: number, text: string },
    duration: { value: number, text: string },
    maneuver: string,
};

type Time = {
    value: any,
    text: string,
    time_zone: string,
};

type Fare = {
    currency: string,
    value: number,
    text: string,
};
//endregion