const permissions=new Set(["moneyz.admin","moneyz.shop.edit","moneyz.transactions.view","moneyz.config.edit"]);const providers=[];
export function register(id){if(!String(id).includes("."))throw new Error("Permission must be namespaced/dotted");permissions.add(String(id));return id;}
export function addProvider(provider){if(!provider?.has)throw new Error("Permission provider requires has()");providers.push(provider);return()=>{const i=providers.indexOf(provider);if(i>=0)providers.splice(i,1)}}
export function has(player,id){id=String(id);for(const p of providers){try{const v=p.has(player,id);if(v!==undefined)return Boolean(v)}catch{}}if(id.startsWith("moneyz."))return player?.hasTag?.("moneyzAdmin")??false;return false;}
export const list=()=>[...permissions].sort();
