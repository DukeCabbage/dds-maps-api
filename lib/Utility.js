const LOG_TAG = "DDSMapsApi: ";

export const reqLogger = config => {
    console.log(LOG_TAG, config.method.toUpperCase());
    console.log(LOG_TAG, config.url);

    return config;
};

export const resLogger = res => {
    console.log(LOG_TAG, `${res.status} ${res.statusText}`);
    console.log(LOG_TAG, res.data);
    return res;
};

export const errorHandler = error => {
    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(LOG_TAG, error.response.data);
        console.log(LOG_TAG, error.response.status);
        console.log(LOG_TAG, error.response.headers);
    } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(LOG_TAG, error.request);
    } else {
        // Something happened in setting up the request that triggered an Error
        console.log(LOG_TAG, error.message);
    }
    console.log(LOG_TAG, error.config);

    return Promise.reject(error);
};