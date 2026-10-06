import { system, world } from "@minecraft/server";
// One cue per player per burst. Errors outrank success and navigation.
const KEY="moneyz:audio",pending=new Map(),active=new WeakMap(),last=new WeakMap();
const defaults=Object.freeze({enabled:true,success:true,received:true,error:true,navigation:false,volume:0.65});
export const sounds=Object.freeze({success:"random.orb",received:"random.orb",celebrate:"random.levelup",error:"note.bass",navigation:"random.click"});
const priority={navigation:0,success:1,received:2,celebrate:3,error:4};
function resolve(player){try{if(player&&typeof player==="object"&&typeof player.playSound==="function")return player;if(typeof player==="string")return world.getPlayers().find(p=>p.name===player||p.nameTag===player)??null;}catch{}return null;}

export function preferences(player){player=resolve(player)??player;try{const raw=player?.getDynamicProperty?.(KEY),p=typeof raw==="string"?JSON.parse(raw):{};return {...defaults,...p,volume:Math.max(0,Math.min(1,Number(p.volume??defaults.volume)||0))};}catch{return {...defaults};}}
export function setPreferences(player,patch={}){player=resolve(player)??player;const p=preferences(player);for(const key of ["enabled","success","received","error","navigation"])if(typeof patch[key]==="boolean")p[key]=patch[key];if(Number.isFinite(Number(patch.volume)))p.volume=Math.max(0,Math.min(1,Number(patch.volume)));player.setDynamicProperty(KEY,JSON.stringify(p));return p;}
export function isCompensation(metadata={}){return metadata?.feedback===false||/(?:refund|rollback|reversal|game_push)/i.test(String(metadata?.type??""))||/quest_progress/i.test(String(metadata?.type??""));}
function target(player){try{return !!player&&typeof player==="object"&&typeof player.playSound==="function";}catch{return false;}}
function allowed(p,kind){return p.enabled&&p.volume>0&&(kind==="celebrate"?p.success:p[kind]!==false);}
function play(player,kind){try{const p=preferences(player);if(!allowed(p,kind))return;const now=Date.now(),old=last.get(player);if(old&&now-old.at<180&&priority[kind]<=priority[old.kind])return;player.playSound(sounds[kind],{volume:p.volume*(kind==="navigation"?0.35:1),pitch:kind==="error"?0.5:1});last.set(player,{kind,at:now});}catch{/* Invalid/disconnected players and sound errors never affect gameplay. */}}
function queue(player,kind){if(!target(player)||!(kind in sounds))return;const old=pending.get(player);if(old){if(priority[kind]>priority[old.kind])old.kind=kind;return;}const row={kind};pending.set(player,row);try{system.run(()=>{if(pending.get(player)!==row)return;pending.delete(player);play(player,row.kind);});}catch{pending.delete(player);}}
export function cue(player,kind="success"){player=resolve(player);if(!(kind in sounds)||!target(player))return;const scope=active.get(player);if(scope){if(!scope.quiet&&(scope.cue===undefined||priority[kind]>priority[scope.cue]))scope.cue=kind;return;}queue(player,kind);}
export const success=p=>cue(p,"success");export const received=p=>cue(p,"received");export const error=p=>cue(p,"error");export const celebrate=p=>cue(p,"celebrate");export const click=p=>cue(p,"navigation");
export function result(player,value,{success:kind="success",quiet=false,errorOnly=false}={}){if(quiet)return value;const ok=typeof value==="boolean"?value:value?.ok;if(ok===false)error(player);else if(ok===true&&!errorOnly&&!value?.opened)cue(player,kind);return value;}
// Defer nested player operations until the owning operation has actually completed.
// Preserve original return types: synchronous operations remain synchronous.
export function begin(player,options={}){
 player=resolve(player);
 if(!target(player)||active.has(player))return value=>value;
 const scope={quiet:options.quiet===true};active.set(player,scope);
 return (value,thrown=false)=>{
  if(active.get(player)===scope)active.delete(player);
  if(!scope.quiet){
   const ok=options.successIf?Boolean(options.successIf(value)):(typeof value==="boolean"?value:value?.ok);
   if(thrown||ok===false)error(player);
   else if(ok===true&&!options.errorOnly&&!value?.opened){let kind=options.success??"success";if(scope.cue&&scope.cue!=="error"&&priority[scope.cue]>priority[kind])kind=scope.cue;cue(player,kind);}
   else if(ok===undefined&&scope.cue)cue(player,scope.cue);
  }
  return value;
 };
}
export function run(player,work,options={}){
 player=resolve(player);
 const parent=target(player)?active.get(player):null;
 if(parent){
  const retain=value=>{const ok=typeof value==="boolean"?value:value?.ok;if(active.get(player)===parent&&ok===true&&!options.quiet&&!options.errorOnly&&!value?.opened)cue(player,options.success??"success");return value;};
  const value=work();return value&&typeof value.then==="function"?value.then(retain):retain(value);
 }
 const finish=begin(player,options);
 try{const value=work();if(value&&typeof value.then==="function")return value.then(v=>finish(v),e=>{finish(undefined,true);throw e;});return finish(value);}catch(e){finish(undefined,true);throw e;}
}
// Explicit message outcomes, without changing the text sent to the player.
export function message(player,text,kind){const value=player?.sendMessage?.(text);if(!kind&&typeof text==="string"){const prefix=text.trimStart().replace(/^(?:§[klmnor])+/i,"");if(prefix.startsWith("§c"))kind="error";else if(prefix.startsWith("§a"))kind="success";}if(kind)cue(player,kind);return value;}
