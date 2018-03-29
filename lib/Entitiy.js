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

export type ErrorResData = {
    status: string,
    error_message: ?string,
}

//https://developers.google.com/maps/documentation/directions/intro#DirectionsResponses
//region Direction
export type DirectionResData = {
    geocoded_waypoints: Array<GeoCodedWaypoint>,
    routes: Array<Route>,
    status: string,
}

type GeoCodedWaypoint = {
    geocoder_status: string,
    place_id: string,
    types: Array<string>,
}

type Route = {
    summary: string,
    legs: Array<Leg>,
    overview_polyline: { points: string },
    bounds: { northeast: LatLng, southwest: LatLng },
    warnings: Array<string>,
}

type Leg = {
    steps: Array<Step>,
    travel_mode: string,
    start_address: string,
    end_address: string,
    start_location: LatLng,
    end_location: LatLng,
    distance: { value: number, text: string },
    duration: { value: number, text: string },
    duration_in_traffic: ?{ value: number, text: string },
    fare: ?{ value: number, text: string },
}

type Step = {
    steps: Array<Step>,
    start_location: LatLng,
    end_location: LatLng,
    polyline: { points: string },
    distance: { value: number, text: string },
    duration: { value: number, text: string },
    maneuver: ?string,
}
//endregion