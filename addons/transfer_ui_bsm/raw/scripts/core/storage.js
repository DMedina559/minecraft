const clean=v=>`${v??""}`.trim();
export function createProviderStorage(world,key,schemaVersion){
  const defaults=()=>({schemaVersion,localServer:"",defaultInclude:true,servers:{}});
  return {
    defaults,
    load(){try{const raw=world.getDynamicProperty(key);if(typeof raw!=="string"||!raw)return defaults();const x=JSON.parse(raw);return {schemaVersion,localServer:clean(x?.localServer),defaultInclude:x?.defaultInclude!==false,servers:x?.servers&&typeof x.servers==="object"?x.servers:{}}}catch(e){console.warn(`[Transfer UI BSM Provider] config load failed: ${e}`);return defaults()}},
    save(value){world.setDynamicProperty(key,JSON.stringify({...value,schemaVersion}))}
  };
}
