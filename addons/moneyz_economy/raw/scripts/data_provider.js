import { world, system } from "@minecraft/server";
import { itemData as defaultShopData } from "./item_data.js";
import { log, LOG_LEVELS } from "./logger.js";

export const SHOP_DATA_PREFIX = "shop_";

let activeShopData = defaultShopData;

/**
 * Loads all shop data from the world's dynamic properties.
 * Searches for properties starting with SHOP_DATA_PREFIX and merges them into defaultShopData.
 */
function loadAllShopData() {
    try {
        log("Loading shop data...", LOG_LEVELS.DEBUG);
        const newShopData = JSON.parse(JSON.stringify(defaultShopData));
        const allPropIds = world.getDynamicPropertyIds();
        const shopPropIds = allPropIds.filter(id => id.startsWith(SHOP_DATA_PREFIX));

        if (shopPropIds.length > 0) {
            for (const propId of shopPropIds) {
                const shopJson = world.getDynamicProperty(propId);
                if (typeof shopJson === "string") {
                    const shopId = propId.substring(SHOP_DATA_PREFIX.length);
                    try {
                        const customShopData = JSON.parse(shopJson);
                        newShopData[shopId] = { ...(newShopData[shopId] || {}), ...customShopData };
                    } catch (e) {
                        log(`Could not parse shop data for ${shopId}: ${e}`, LOG_LEVELS.ERROR);
                    }
                }
            }
        }

        activeShopData = newShopData;
    } catch (error) {
        log(`Error loading shop data: ${error}`, LOG_LEVELS.ERROR);
        activeShopData = defaultShopData;
    }
}

// Initial load
system.run(() => {
    loadAllShopData();
});

// Periodic polling to stay updated with external property changes
system.runInterval(() => {
    loadAllShopData();
}, 100);

/**
 * Gets the currently active shop data.
 * @returns {object} Active shop data.
 */
export function getShopData() {
    return activeShopData;
}

log("data_provider.js loaded and initialized.", LOG_LEVELS.DEBUG);
