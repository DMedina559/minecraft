import * as GameEconomy from "../services/game_economy.js";
import { emit } from "./events.js";
const registry=new Map();
const clean=v=>String(v??"").trim().toLowerCase();
function assertId(id){id=clean(id);if(!id.includes(":"))throw new Error("Game id must be namespaced (example: myaddon:game)");if(id.startsWith("moneyz:")&&registry.has(id))throw new Error("Built-in Moneyz game IDs cannot be replaced");return id;}
export function register(def){const id=assertId(def?.id);if(registry.has(id))throw new Error(`Game already registered: ${id}`);if(typeof def?.play!=="function")throw new Error("Game requires play(player, context)");const row={category:"chance",enabled:true,...def,id,name:String(def.name??id)};registry.set(id,row);emit("gameRegistered",{game:row});return()=>unregister(id);}
export function unregister(id){id=clean(id);if(id.startsWith("moneyz:"))return false;const old=registry.get(id),ok=registry.delete(id);if(ok)emit("gameUnregistered",{game:old});return ok;}
export const get=id=>registry.get(clean(id))??null;
export function list({category,enabled=true}={}){return [...registry.values()].filter(x=>(!category||x.category===category)&&(enabled===undefined||x.enabled===enabled));}
export async function play(player,id,context={}){const game=get(id);if(!game||game.enabled===false)return {ok:false,reason:"unknown_game"};try{const result=await game.play(player,{...context,gameId:game.id,economy:GameEconomy});emit("gamePlayed",{player,game,result,context});return result??{ok:true};}catch(error){emit("gameError",{player,game,error:String(error)});return {ok:false,reason:"game_error",message:String(error)};}}
export const economy=Object.freeze({validateStake:GameEconomy.validateStake,beginSession:GameEconomy.beginSession,endSession:GameEconomy.endSession,isPlaying:GameEconomy.isPlaying,placeBet:GameEconomy.placeBet,payout:GameEconomy.payout,push:GameEconomy.push});
