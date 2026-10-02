import { world, system } from "@minecraft/server";
import { QUEST_DATA, QUEST_BY_ID, QUEST_BY_PROPERTY, ORE_BREAK_REWARDS, MOB_REWARDS, FARM_ANIMALS, CROP_PLANT_REWARDS } from "./definitions.js";
import * as Economy from "../core/economy.js";
import * as Config from "../core/config.js";
import * as Rewards from "../services/rewards.js";
import { emit } from "../core/events.js";
import { getCurrentUTCDate } from "../utilities.js";
import { log, LOG_LEVELS } from "../logger.js";

const STATE_KEY="activeQuest";
const STATE_VERSION=2;
const runtime=new Map();
const customDefinitions=new Map();
let initialized=false;
const key=p=>p.id??p.name;
const clone=o=>JSON.parse(JSON.stringify(o));

function definitionFor(value){if(!value)return null;if(typeof value==="string")return QUEST_BY_ID.get(value)??QUEST_BY_PROPERTY.get(value)??customDefinitions.get(value)??null;return QUEST_BY_ID.get(value.id)??QUEST_BY_PROPERTY.get(value.property)??customDefinitions.get(value.id)??null;}
export function registerQuest(def){if(!def?.id||!String(def.id).includes(":"))throw new Error("Custom quest id must be namespaced");if(!def.objective||!def.reward)throw new Error("Custom quest requires objective and reward");customDefinitions.set(String(def.id),def);return()=>customDefinitions.delete(String(def.id));}
export function listDefinitions(){return [...QUEST_DATA,...customDefinitions.values()];}
function initialProgress(q){const o=q.objective; if(["break","plant","slay","slaughter"].includes(o.type)) return {current:0,target:o.count}; if(o.type==="location")return {distance:0,target:o.minAreaCovered}; if(o.type==="maintain_balance")return {elapsed:0,target:o.duration}; return {current:0,target:1};}
function makeState(q){return {version:STATE_VERSION,id:q.id,property:q.property,startedAt:Date.now(),progress:initialProgress(q)};}
function save(player,state){player.setDynamicProperty(STATE_KEY,state?JSON.stringify(state):null);}
function migrateLegacy(raw){const q=definitionFor(raw);if(!q)return null;const state=makeState(q);if(raw.objective){if(["break","plant","slay","slaughter"].includes(q.objective.type)){const remaining=Number(raw.objective.count);if(Number.isFinite(remaining))state.progress.current=Math.max(0,q.objective.count-remaining);} }
return state;}
export function getState(player){const text=player?.getDynamicProperty(STATE_KEY);if(!text)return null;try{const raw=JSON.parse(text);if(raw?.version===STATE_VERSION&&definitionFor(raw))return raw;const migrated=migrateLegacy(raw);if(migrated){save(player,migrated);return migrated;}save(player,null);return null;}catch{save(player,null);return null;}}
export function getActiveQuest(player){const state=getState(player);if(!state)return null;const q=definitionFor(state);return q?{...clone(q),state}:null;}
export function getDefinition(id){return definitionFor(id);}
function isPeaceful(){try{const d=world.getDifficulty();return d===0||String(d).toLowerCase()==="peaceful";}catch{return false;}}
export function isQuestAvailableForWorld(q){return !(q?.objective?.type==="slay"&&isPeaceful());}
export function getAvailable(player){const tags=player.getTags();return listDefinitions().filter(q=>(!q.tags||q.tags.some(t=>tags.includes(t)))&&isQuestAvailableForWorld(q));}
export function isCompletedToday(player,q){return player.getDynamicProperty(`last${q.property}`)===getCurrentUTCDate();}
export function startQuest(player,id){if(!player)return {ok:false,reason:"invalid_player"};if(getState(player))return {ok:false,reason:"active_quest"};const q=definitionFor(id);if(!q)return {ok:false,reason:"unknown_quest"};if(isCompletedToday(player,q))return {ok:false,reason:"daily_limit"};if(!isQuestAvailableForWorld(q))return {ok:false,reason:"peaceful_difficulty"};if(q.objective.type==="location"&&!parsePatrol())return {ok:false,reason:"patrol_unconfigured"};if(q.objective.type==="maintain_balance"&&Economy.getBalance(player)<q.objective.amount)return {ok:false,reason:"insufficient_balance"};const state=makeState(q);save(player,state);runtime.delete(key(player));emit("questStarted",{player,quest:q,state:clone(state)});return {ok:true,quest:q,state};}
export function abandonQuest(player,reason="abandoned"){const active=getActiveQuest(player);if(!active)return false;save(player,null);runtime.delete(key(player));emit("questAbandoned",{player,quest:active,reason});return true;}

export async function completeActiveQuest(player){const state=getState(player);if(!state)return false;const q=definitionFor(state);return q?complete(player,q,state):false;}
async function complete(player,q,state){const ok=await Rewards.apply(player,q.reward,{type:"quest_reward",source:"quest",quest:q.id});if(!ok){player.sendMessage("§cQuest reward could not be delivered. Please contact an admin.");return false;}player.setDynamicProperty(`last${q.property}`,getCurrentUTCDate());save(player,null);runtime.delete(key(player));try{player.playSound("random.levelup");player.onScreenDisplay.setActionBar("§aQuest Completed!");}catch{}const amount=q.reward.amount??q.reward.itemStack?.amount??"";player.sendMessage(`§aQuest complete: ${q.description}${amount!==""?` — reward: ${amount}${q.reward.type==="Moneyz"?" Moneyz":""}`:""}`);emit("questCompleted",{player,quest:q,state:clone(state),reward:q.reward});return true;}
function progressMessage(player,q,state){let text="";const p=state.progress;if(["break","plant","slay","slaughter"].includes(q.objective.type))text=`§eQuest: ${p.current}/${p.target}`;else if(q.objective.type==="location")text=`§ePatrol: ${Math.round(p.distance)}/${p.target} blocks`;else if(q.objective.type==="maintain_balance"){const left=Math.max(0,p.target-p.elapsed);text=`§eMaintain Balance: ${Math.floor(left/60000)}m ${Math.floor((left%60000)/1000)}s rem`;}try{player.onScreenDisplay.setActionBar(text);}catch{}}
export async function progress(player,amount=1,context={}){const state=getState(player);if(!state)return false;const q=definitionFor(state);if(!q||context.quest&&context.quest!==q.id)return false;return increment(player,q,state,amount,Number(context.reward)||0,context);}
async function increment(player,q,state,amount=1,reward=0,meta={}){state.progress.current=Math.min(state.progress.target,state.progress.current+amount);save(player,state);if(reward>0)Economy.deposit(player,reward,{type:"quest_progress_reward",source:"quest",quest:q.id,...meta});emit("questProgress",{player,quest:q,state:clone(state)});if(state.progress.current>=state.progress.target)return complete(player,q,state);progressMessage(player,q,state);return false;}
function activeOfType(player,type){const state=getState(player);if(!state)return null;const q=definitionFor(state);return q?.objective.type===type?{q,state}:null;}
function parsePatrol(){const value=Config.get("patrolLocation");if(typeof value!=="string")return null;const a=value.split(",").map(v=>Number(v.trim()));if(a.length!==5||a.some(v=>!Number.isFinite(v)))return null;return {x:a[0],y:a[1],z:a[2],radius:a[3],requiredTimeMs:a[4]*60000};}
function tickScheduled(){const now=Date.now(),patrol=parsePatrol();for(const player of world.getPlayers()){const state=getState(player);if(!state){runtime.delete(key(player));continue;}const q=definitionFor(state);if(!q)continue;const rt=runtime.get(key(player))??{lastMessage:0};if(q.objective.type==="maintain_balance"){if(Economy.getBalance(player)<q.objective.amount){abandonQuest(player,"balance_dropped");player.sendMessage(`§cQuest failed: balance dropped below ${q.objective.amount} Moneyz.`);try{player.onScreenDisplay.setActionBar("§cQuest Failed! Balance dropped.");}catch{}continue;}state.progress.elapsed=Math.max(0,now-state.startedAt);save(player,state);if(state.progress.elapsed>=state.progress.target){void complete(player,q,state);continue;}if(now-rt.lastMessage>=5000){progressMessage(player,q,state);rt.lastMessage=now;}}
else if(q.objective.type==="location"){if(!patrol){if(now-rt.lastMessage>=10000){player.sendMessage("§cPatrol location is not configured correctly.");rt.lastMessage=now;}runtime.set(key(player),rt);continue;}const pos=player.location,dx=pos.x-patrol.x,dy=pos.y-patrol.y,dz=pos.z-patrol.z,fromCenter=Math.sqrt(dx*dx+dy*dy+dz*dz);if(fromCenter>patrol.radius){if(!rt.outSince)rt.outSince=now;if(now-rt.outSince>=15000){state.progress.distance=0;rt.lastPos=null;rt.insideSince=null;save(player,state);}if(now-rt.lastMessage>=3000){try{player.onScreenDisplay.setActionBar(`§eYou are ${Math.round(fromCenter-patrol.radius)} blocks away from patrol zone`);}catch{}rt.lastMessage=now;}}
else{rt.outSince=null;if(!rt.insideSince)rt.insideSince=now;if(rt.lastPos){const dx2=pos.x-rt.lastPos.x,dz2=pos.z-rt.lastPos.z;const moved=Math.sqrt(dx2*dx2+dz2*dz2);if(moved<25)state.progress.distance=Math.min(state.progress.target,state.progress.distance+moved);}rt.lastPos={x:pos.x,z:pos.z};save(player,state);const timeOk=now-rt.insideSince>=patrol.requiredTimeMs;if(state.progress.distance>=state.progress.target&&timeOk){void complete(player,q,state);continue;}if(now-rt.lastMessage>=3000){progressMessage(player,q,state);rt.lastMessage=now;}}}runtime.set(key(player),rt);}}

export function initializeQuestEngine(){if(initialized)return;initialized=true;
 world.afterEvents.playerBreakBlock.subscribe(e=>{const a=activeOfType(e.player,"break");if(!a)return;const id=e.brokenBlockPermutation?.type?.id??e.brokenBlockPermutation?.typeId;if(!id||!a.q.objective.blockTypes.includes(id))return;void increment(e.player,a.q,a.state,1,ORE_BREAK_REWARDS[id]??0,{target:id});});
 world.afterEvents.playerPlaceBlock.subscribe(e=>{const a=activeOfType(e.player,"plant");if(!a)return;const id=e.block?.typeId;if(!id||!a.q.objective.cropTypes.includes(id))return;void increment(e.player,a.q,a.state,1,CROP_PLANT_REWARDS[id]??0,{target:id});});
 world.afterEvents.entityDie.subscribe(e=>{const p=e.damageSource?.damagingEntity;if(p?.typeId!=="minecraft:player")return;const state=getState(p);if(!state)return;const q=definitionFor(state),id=e.deadEntity?.typeId;if(!q||!id)return;if(q.objective.type==="slay"&&q.objective.entityTypes.includes(id))void increment(p,q,state,1,MOB_REWARDS[id]??0,{target:id});else if(q.objective.type==="slaughter"&&q.objective.entityTypes.includes(id))void increment(p,q,state,1,FARM_ANIMALS[id]??0,{target:id});});
 system.runInterval(tickScheduled,20);log("QuestEngine initialized",LOG_LEVELS.INFO);
}
