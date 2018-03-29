// @flow
import Logger from "js-logger";

import DDSMapsApi from "./lib/DDSMapsApi";
import * as AuthInterceptor from "./lib/AuthInterceptor";

const LogLevel = {
    DEBUG: Logger.DEBUG,
    INFO: Logger.INFO,
    TIME: Logger.TIME,
    WARN: Logger.WARN,
    ERROR: Logger.ERROR,
    OFF: Logger.OFF,
};

export {
    AuthInterceptor,
    DDSMapsApi,
    LogLevel,
};