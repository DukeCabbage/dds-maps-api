// @flow

/**
 * https://developers.google.com/maps/documentation/distance-matrix/get-api-key#premium-auth
 *
 * Currently only implemented with api key
 */

import { myLogger } from "./DDSMapsApi";

class AuthInterceptor {

    _authMethod: string;
    _apiKey: ?string;

    constructor(authMethod: string, apiKey: ?string) {
        myLogger.debug("AuthInterceptor::constructor");
        myLogger.debug(`Method: ${authMethod}, apiKey: ${String(apiKey)}`);

        this._authMethod = authMethod;

        switch (authMethod) {
            case AuthMethod.NONE:
                break;
            case AuthMethod.API_KEY:
                if (!apiKey) throw new Error("Api key not present!");
                this._apiKey = apiKey;
                break;
            default:
                throw new Error("Unsupported operation!");
        }
    };

    // noinspection JSUnusedGlobalSymbols
    intercept = (url: string): string => {

        let newUrl = url;
        switch (this._authMethod) {
            case AuthMethod.API_KEY:
                newUrl += `&key=${String(this._apiKey)}`;
                break;
            default:
        }

        myLogger.debug(`Authed url: ${newUrl}`);
        return newUrl;
    };
}

export type IAuthInterceptor = {
    intercept: (string) => string,
};

export const AuthMethod = {
    NONE: "none",
    API_KEY: "api_key",
};

export const create = (authMethod: string = AuthMethod.NONE,
                       apiKey: ?string = null): AuthInterceptor => {

    const instance = new AuthInterceptor(authMethod, apiKey);
    return Object.freeze(instance);
};

export const none = () => create(AuthMethod.NONE);

export const apiKey = (apiKey: string) => create(AuthMethod.API_KEY, apiKey);