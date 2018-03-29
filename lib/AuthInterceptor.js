/**
 * https://developers.google.com/maps/documentation/distance-matrix/get-api-key#premium-auth
 *
 * Currently only implemented with api key
 */

class AuthInterceptor {
    constructor(authMethod: string, apiKey: ?string) {

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

    intercept = (url: string): string => {

        switch (this._authMethod) {
            case AuthMethod.NONE:
                return url;
            case AuthMethod.API_KEY:
                return url + `&key=${this._apiKey}`;
        }
    };
}

export const AuthMethod = {
    NONE: "none",
    API_KEY: "api_key",
};

export const create = (authMethod: string = AuthMethod.NONE,
                       apiKey: ?string = null) => {

    const instance = new AuthInterceptor(authMethod, apiKey);
    return Object.freeze(instance);
};

export const none = () => create(AuthMethod.NONE);