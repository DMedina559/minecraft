const registries={extensions:new Map(),menus:new Map(),pages:new Map(),actions:new Map(),dashboard:new Map(),shopProviders:new Map(),questProviders:new Map(),currencies:new Map(),rewardTypes:new Map()};
const valid=id=>{id=String(id??"");if(!/^[a-z0-9_.-]+:[a-z0-9_./-]+$/i.test(id))throw new Error("Extension id must be namespaced");return id};
const put=(name,def)=>{const id=valid(def?.id);if(registries[name].has(id))throw new Error(`${id} is already registered`);registries[name].set(id,def);return()=>registries[name].delete(id)};
export function register(def){if(!def?.name||!def?.version)throw new Error("Extension requires id, name and version");const off=put("extensions",def);try{def.onLoad?.({id:def.id,version:def.version})}catch(e){off();throw e}return off}
export const get=id=>registries.extensions.get(String(id));export const list=()=>[...registries.extensions.values()];
export const ui={registerMenuItem:def=>put("menus",def),listMenuItems:()=>[...registries.menus.values()],registerPage:def=>put("pages",def),getPage:id=>registries.pages.get(String(id)),listPages:()=>[...registries.pages.values()],registerAction:def=>put("actions",def),getAction:id=>registries.actions.get(String(id)),registerDashboardSection:def=>put("dashboard",def),dashboardSections:()=>[...registries.dashboard.values()]};
export const shops={registerProvider:def=>put("shopProviders",def),providers:()=>[...registries.shopProviders.values()]};
export const quests={registerProvider:def=>put("questProviders",def),providers:()=>[...registries.questProviders.values()]};
export const currencies={register:def=>put("currencies",def),get:id=>registries.currencies.get(String(id)),list:()=>[...registries.currencies.values()]};
export const rewards={registerType:(id,handler)=>put("rewardTypes",{id,handler}),getType:id=>registries.rewardTypes.get(String(id))};
