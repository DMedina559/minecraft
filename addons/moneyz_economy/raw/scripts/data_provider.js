import { world } from "@minecraft/server";
import { itemData as defaultShopData } from "./item_data.js";
import { log, LOG_LEVELS } from './logger.js';

const SHOP_DATA_PROPERTY = "worldShopData";

let activeShopData = defaultShopData;

/**
 * Loads shop data from the world's dynamic properties. If it doesn't exist or fails to parse,
 * it falls back to the default data from item_data.js.
 */
function loadShopData() {
    try {
        const overrideDataString = world.getDynamicProperty(SHOP_DATA_PROPERTY);
        if (overrideDataString && typeof overrideDataString === 'string') {
            log("Found worldShopData property, attempting to parse.", LOG_LEVELS.INFO);
            const overrideData = JSON.parse(overrideDataString);
            activeShopData = overrideData;
            log("Successfully loaded and applied shop data from world property.", LOG_LEVELS.INFO);
        } else {
            log("No worldShopData property found, using default shop data.", LOG_LEVELS.INFO);
            activeShopData = defaultShopData;
        }
    } catch (error) {
        log(`Error parsing worldShopData property. Using default data. Error: ${error}`, LOG_LEVELS.ERROR, error.stack);
        activeShopData = defaultShopData;
    }
}

// Load the data when the world is ready
world.afterEvents.worldLoad.subscribe(() => {
    loadShopData();
});

// Watch for changes to the property so it can be updated live without a server restart
world.afterEvents.dynamicPropertyChanged.subscribe(event => {
    if (event.propertyId === SHOP_DATA_PROPERTY) {
        log("worldShopData property changed, reloading shop data.", LOG_LEVELS.INFO);
        loadShopData();
    }
});

/**
 * Gets the currently active shop data.
 * This is exported as a function to ensure modules always get the latest data,
 * especially after a live reload from a property change.
 * @returns {object} The active shop data object.
 */
export function getShopData() {
    return activeShopData;
}

log("data_provider.js loaded", LOG_LEVELS.DEBUG);
