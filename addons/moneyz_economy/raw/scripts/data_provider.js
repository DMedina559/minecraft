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
        log('Starting to load all shop data...', LOG_LEVELS.DEBUG);
        log('Default shop data at start of load:', LOG_LEVELS.DEBUG, JSON.stringify(defaultShopData));
        
        let newShopData = JSON.parse(JSON.stringify(defaultShopData));
        
        const allPropIds = world.getDynamicPropertyIds();
        const shopPropIds = allPropIds.filter(id => id.startsWith(SHOP_DATA_PREFIX));
        log(`Found shop property IDs: ${JSON.stringify(shopPropIds)}`, LOG_LEVELS.DEBUG);

        if (shopPropIds.length > 0) {
            for (const propId of shopPropIds) {
                const shopJson = world.getDynamicProperty(propId);
                if (typeof shopJson === 'string') {
                    const shopId = propId.substring(SHOP_DATA_PREFIX.length);
                    try {
                        const customShopData = JSON.parse(shopJson);
                        newShopData[shopId] = { ...(newShopData[shopId] || {}), ...customShopData };
                        log(`Merged data for ${shopId}. newShopData is now:`, LOG_LEVELS.DEBUG, JSON.stringify(newShopData));
                    } catch (e) {
                        log(`Could not parse shop data for ${shopId}: ${e}`, LOG_LEVELS.ERROR);
                    }
                }
            }
            log(`Successfully loaded and merged ${shopPropIds.length} custom shops.`, LOG_LEVELS.INFO);
        }

        activeShopData = newShopData;
        log('Finished loading all shop data. Final activeShopData:', LOG_LEVELS.DEBUG, JSON.stringify(activeShopData));
    } catch (error) {
        log(`Error loading shop data: ${error}`, LOG_LEVELS.ERROR, error.stack);
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
