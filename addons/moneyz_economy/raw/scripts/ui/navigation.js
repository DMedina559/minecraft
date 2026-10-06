import { system } from "@minecraft/server";
// UI-only hook. Keep this module independent of services and forms to avoid cycles.
let shortcutsHandler;
let currentRoute;
export function configureShortcuts(handler) { shortcutsHandler = handler; }
export function getShortcutsHandler() { return shortcutsHandler; }
export function getCurrentRoute() { return currentRoute; }
export function withRoute(route, fn) { const previous = currentRoute; currentRoute = route; try { return fn(); } finally { currentRoute = previous; } }

let accessChecker;
export function configureAccessChecker(checker) { accessChecker=checker; }
export function canUseRoute(route,player) { try { return (!route?.guard||route.guard(player))&&(!route||!accessChecker||accessChecker(route,player)); } catch { return false; } }
export function contextualPromise(promise,route=getCurrentRoute()) {
 const then=promise.then.bind(promise);
 promise.then=(ok,fail)=>contextualPromise(then(ok&&(v=>withRoute(route,()=>ok(v))),fail&&(e=>withRoute(route,()=>fail(e)))),route);
 return promise;
}
export function defer(callback) { const route=getCurrentRoute();return system.run(()=>withRoute(route,callback)); }
