import { wireBytes } from "./ipc.js";
const object=value=>value!==null&&typeof value==="object"&&!Array.isArray(value);
export function validateProviderConfig(value){
 if(!object(value)||typeof value.localServer!=="string"||typeof value.defaultInclude!=="boolean"||!object(value.servers))throw Error("Invalid BSM provider configuration");
 if(value.revision!==undefined&&(!Number.isSafeInteger(value.revision)||value.revision<0))throw Error("Invalid provider revision");
 if(Object.keys(value.servers).length>512)throw Error("Too many server overrides");
 for(const [name,x] of Object.entries(value.servers)){
  if(!name||!object(x))throw Error("Invalid server override");
  for(const key of ["included","showMaintenance"])if(x[key]!==undefined&&typeof x[key]!=="boolean")throw Error(`${name}: invalid ${key}`);
  for(const key of ["displayName","host","netherNetId"])if(x[key]!==undefined&&(typeof x[key]!=="string"||x[key].length>255))throw Error(`${name}: invalid ${key}`);
  if(x.port!==undefined&&(!Number.isInteger(x.port)||x.port<0||x.port>65535))throw Error(`${name}: invalid port`);
  if(x.priority!==undefined&&!Number.isFinite(x.priority))throw Error(`${name}: invalid priority`);
  if(x.addressFamily!==undefined&&!["ipv4","ipv6"].includes(x.addressFamily))throw Error(`${name}: invalid address family`);
  if(x.transport!==undefined&&!["","bedrock","nethernet"].includes(x.transport))throw Error(`${name}: invalid transport`);
 }
 return value;
}
export function createProviderStorage(world,key,schemaVersion){
 const defaults=()=>({schemaVersion,revision:0,localServer:"",defaultInclude:true,servers:{}});
 function load(){
  const raw=world.getDynamicProperty(key);if(typeof raw!=="string"||!raw)return defaults();
  const value=JSON.parse(raw);if(value.schemaVersion!==undefined&&value.schemaVersion!==schemaVersion)throw Error("Unsupported provider configuration version");
  return validateProviderConfig({...defaults(),...value});
 }
 return {defaults,load,save(value,expectedRevision=value.revision??0){
  const current=load();if(current.revision!==expectedRevision)throw Error("Provider settings changed. Reopen the form before saving.");
  const next=validateProviderConfig({...value,schemaVersion,revision:current.revision+1}),text=JSON.stringify(next);if(wireBytes(text)>30000)throw Error("Provider configuration too large");world.setDynamicProperty(key,text);return next;
 }};
}
