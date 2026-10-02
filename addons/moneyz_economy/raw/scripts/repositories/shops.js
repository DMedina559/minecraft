import { world } from "@minecraft/server";
import { itemData as defaults } from "../item_data.js";
import { log, LOG_LEVELS } from "../logger.js";

export const SHOP_DATA_PREFIX = "shop_";
let cache;

function cloneDefaults() { return JSON.parse(JSON.stringify(defaults)); }

export function reloadShops() {
    const next = cloneDefaults();
    try {
        for (const id of world.getDynamicPropertyIds()) {
            if (!id.startsWith(SHOP_DATA_PREFIX)) continue;
            const raw = world.getDynamicProperty(id);
            if (typeof raw !== "string") continue;
            const shopId = id.slice(SHOP_DATA_PREFIX.length);
            try { next[shopId] = { ...(next[shopId] || {}), ...JSON.parse(raw) }; }
            catch (error) { log(`ShopRepository: invalid ${shopId}: ${error}`, LOG_LEVELS.ERROR); }
        }
    } catch (error) { log(`ShopRepository.reload failed: ${error}`, LOG_LEVELS.ERROR); }
    cache = next;
    return cache;
}

export function getShopData() { return cache ?? reloadShops(); }
export function getShop(id) { return getShopData()[id]; }

export function saveShop(id, value) {
    world.setDynamicProperty(SHOP_DATA_PREFIX + id, JSON.stringify(value));
    reloadShops();
}

export function deleteShop(id) {
    world.setDynamicProperty(SHOP_DATA_PREFIX + id, undefined);
    reloadShops();
}
