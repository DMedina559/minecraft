import { world } from "@minecraft/server";
import { log, LOG_LEVELS } from "../logger.js";

const KEY = "moneyz:transactions";
const MAX = 100;
let cache;

function load() {
    if (cache) return cache;
    try {
        const raw = world.getDynamicProperty(KEY);
        cache = typeof raw === "string" ? JSON.parse(raw) : [];
        if (!Array.isArray(cache)) cache = [];
    } catch { cache = []; }
    return cache;
}
function save() {
    try { world.setDynamicProperty(KEY, JSON.stringify(cache.slice(-MAX))); }
    catch (e) { log(`Transaction persistence failed: ${e}`, LOG_LEVELS.WARN); }
}
export function record(type, { actor, from, to, amount = 0, metadata = {} } = {}) {
    const tx = { id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`, at: Date.now(), type,
        actor: actor?.name ?? actor?.nameTag ?? actor ?? null, from: from?.name ?? from?.nameTag ?? from ?? null,
        to: to?.name ?? to?.nameTag ?? to ?? null, amount: Math.round(Number(amount) || 0), metadata };
    load().push(tx); if (cache.length > MAX) cache.splice(0, cache.length - MAX); save(); return tx;
}
export function recent(limit = 25) { return load().slice(-Math.max(1, limit)).reverse(); }
export function clear() { cache = []; save(); }
