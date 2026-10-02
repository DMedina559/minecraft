/** Lightweight in-pack event bus. Keeps Moneyz consumers decoupled from storage/UI. */
const listeners = new Map();

export function on(name, callback) {
    if (typeof callback !== "function") throw new TypeError("Moneyz event callback must be a function");
    const set = listeners.get(name) ?? new Set();
    set.add(callback); listeners.set(name, set);
    return () => off(name, callback);
}
export function off(name, callback) { const set=listeners.get(name); if(!set)return false; const removed=set.delete(callback); if(!set.size)listeners.delete(name); return removed; }
export function emit(name, payload) { for (const callback of [...(listeners.get(name) ?? [])]) { try { callback(payload); } catch (e) { console.warn(`[Moneyz] event ${name} listener failed: ${e}`); } } }
export function clearListeners(name) { if (name) listeners.delete(name); else listeners.clear(); }
