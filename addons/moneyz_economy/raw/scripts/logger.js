import { world } from "@minecraft/server";

export const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

let currentLogLevel = LOG_LEVELS.WARN;

export const setLogLevelFromWorldProperty = () => {
  const logLevelString = world.getDynamicProperty("logLevel");

  if (logLevelString) {
    switch (logLevelString.toUpperCase()) {
      case "ERROR":
        currentLogLevel = LOG_LEVELS.ERROR;
        break;
      case "WARN":
        currentLogLevel = LOG_LEVELS.WARN;
        break;
      case "INFO":
        currentLogLevel = LOG_LEVELS.INFO;
        break;
      case "DEBUG":
        currentLogLevel = LOG_LEVELS.DEBUG;
        break;
      default:
        log(`Invalid log level in world property: ${logLevelString}. Using default WARN.`, LOG_LEVELS.WARN);
        currentLogLevel = LOG_LEVELS.WARN;
        break;
    }
    log(`Log level set from world property to: ${logLevelString.toUpperCase()}`, LOG_LEVELS.INFO);
  } else {
    log("No 'logLevel' world property found. Using default WARN level.", LOG_LEVELS.WARN);
  }
};

export const log = (message, level = currentLogLevel, ...optionalParams) => {
  if (level <= currentLogLevel) {
    switch (level) {
      case LOG_LEVELS.ERROR:
        console.error(message, ...optionalParams);
        break;
      case LOG_LEVELS.WARN:
        console.warn(message, ...optionalParams);
        break;
      case LOG_LEVELS.INFO:
        console.info(message, ...optionalParams);
        break;
      case LOG_LEVELS.DEBUG:
        console.log("[DEBUG]", message, ...optionalParams);
        break;
      default:
        console.log(message, ...optionalParams);
    }
  }
};

log("logger.js loaded", LOG_LEVELS.DEBUG);