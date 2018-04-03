import { AxiosInstance } from "axios/index";
import type { IAuthInterceptor } from "../AuthInterceptor";
import type { SnapToRoadsResData } from "../NetworkEntitiy";
import type { Location } from "../direction/ModelRoute";

export const snapToRoad = (path: Location[],
                           interpolate: boolean = false,
                           axiosClient: AxiosInstance,
                           endpoint: string,
                           authInterceptor: IAuthInterceptor): Promise<SnapToRoadsResData> => {

    if (!path || path.length === 0) {
        throw new Error("Missing input path");
    } else if (path.length > 100) {
        throw new Error("Maximum 100 points allowed");
    }

    let url = `${endpoint}/v1/snapToRoads`;
    url += `?path=${serializePath(path)}`;
    url += `&interpolate=${interpolate}`;

    const newUrl = authInterceptor.intercept(url);

    return axiosClient.get(newUrl);
};

export const nearestRoads = (points: Location[],
                             axiosClient: AxiosInstance,
                             endpoint: string,
                             authInterceptor: IAuthInterceptor): Promise<SnapToRoadsResData> => {

    if (!points || points.length === 0) {
        throw new Error("Missing input path");
    } else if (points.length > 100) {
        throw new Error("Maximum 100 points allowed");
    }

    let url = `${endpoint}/v1/nearestRoads`;
    url += `?points=${serializePath(points)}`;

    const newUrl = authInterceptor.intercept(url);

    return axiosClient.get(newUrl);
};

const serializePath = (path: Location[]): string =>
    path.map(latLng => `${latLng.latitude},${latLng.longitude}`).join("|");