import { world, system } from "@minecraft/server";
import { itemData as defaultShopData } from "./item_data.js";
import { log, LOG_LEVELS } from './logger.js';

// The prefix for dynamic properties that store individual shop data.
export const SHOP_DATA_PREFIX = "shop_";

// In-memory cache of the shop data.
let activeShopData = {};

/**
 * Loads all shop data from the world's dynamic properties.
 * It searches for all properties with the SHOP_DATA_PREFIX and merges them.
 */
function loadAllShopData() {
    try {
        const allPropIds = world.getDynamicPropertyIds();
        const shopPropIds = allPropIds.filter(id => id.startsWith(SHOP_DATA_PREFIX));

        const newShopData = {};
        let loaded = false;

        for (const propId of shopPropIds) {
            const shopJson = world.getDynamicProperty(propId);
            if (typeof shopJson === 'string') {
                const shopId = propId.substring(SHOP_DATA_PREFIX.length);
                newShopData[shopId] = JSON.parse(shopJson);
                loaded = true;
            }
        }

        if (loaded) {
            activeShopData = newShopData;
            log(`Successfully loaded ${Object.keys(newShopData).length} shops.`, LOG_LEVELS.INFO);
        } else {
            // If no custom shops exist, fall back to the default data.
            log("No custom shops found, using default shop data.", LOG_LEVELS.INFO);
            activeShopData = defaultShopData;
        }
    } catch (error) {
        log(`Error loading shop data: ${error}`, LOG_LEVELS.ERROR, error.stack);
        // Fallback to default data in case of any error during loading/parsing.
        activeShopData = defaultShopData;
    }
}

// Initial load when the world is ready.
world.afterEvents.worldLoad.subscribe(() => {
    loadAllShopData();
});

// Polling to detect changes made by other scripts or in other game sessions.
system.runInterval(() => {
    // This is a simple polling mechanism. A more optimized version might
    // compare property counts or use version numbers if this becomes a performance issue.
    loadAllShopData();
}, 100); // Check every 5 seconds (100 ticks).

/**
 * Gets the currently active shop data.
 * @returns {object} The active shop data object.
 */
export function getShopData() {
    return activeShopData;
}

log("data_provider.js loaded and initialized for multi-property shop storage.", LOG_LEVELS.DEBUG);
