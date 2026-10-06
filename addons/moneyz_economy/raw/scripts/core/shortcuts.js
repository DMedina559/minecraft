import * as Feedback from "./feedback.js";
import * as Storage from "./storage.js";
const MAX=24, KEY="saved";
const fields=["namespace","buildingId","communityId","provider","shopId","type"];
function normalize(def){
 if(!def||!["service","shop","menu"].includes(def.type??"service"))throw new Error("Shortcut type must be service, shop, or menu");
 const type=def.type??"service",id=String(def.id??"").trim();if(!id)throw new Error("Shortcut destination required");
 const args={};for(const key of fields)if(def.args?.[key]!==undefined)args[key]=["namespace","buildingId","communityId","provider"].includes(key)?String(def.args[key]).trim().toLowerCase():String(def.args[key]).trim();
 return {type,id,label:String(def.label??id).replace(/§[0-9a-gk-or]/gi,"").trim().slice(0,80)||id,args};
}
const keyOf=d=>JSON.stringify([d.type,d.id,...fields.map(k=>d.args[k]??null)]);
export function list(player){const rows=Storage.player(player,"shortcuts").get(KEY);return Array.isArray(rows)?rows.slice(0,MAX).flatMap(r=>{try{return [normalize(r)];}catch{return [];}}):[];}
function save(player,rows){Storage.player(player,"shortcuts").set(KEY,rows);return rows;}
function _audio_add(player,def){const d=normalize(def),rows=list(player),i=rows.findIndex(r=>keyOf(r)===keyOf(d));if(i>=0)return {ok:true,alreadySaved:true,shortcut:rows[i]};if(rows.length>=MAX)return {ok:false,reason:"shortcut_limit",limit:MAX};rows.push(d);save(player,rows);return {ok:true,shortcut:d};}
function _audio_remove(player,index){const rows=list(player);if(!Number.isInteger(index)||index<0||index>=rows.length)return false;rows.splice(index,1);save(player,rows);return true;}
function _audio_rename(player,index,label){const rows=list(player);if(!rows[index])return false;rows[index]=normalize({...rows[index],label});save(player,rows);return true;}
function _audio_move(player,index,to){const rows=list(player);if(!Number.isInteger(index)||!Number.isInteger(to)||index<0||to<0||index>=rows.length||to>=rows.length)return false;const [row]=rows.splice(index,1);rows.splice(to,0,row);save(player,rows);return true;}
export const limit=MAX;

export function add(...args){return Feedback.run(args[0],()=>_audio_add(...args));}

export function remove(...args){return Feedback.run(args[0],()=>_audio_remove(...args));}

export function rename(...args){return Feedback.run(args[0],()=>_audio_rename(...args));}

export function move(...args){return Feedback.run(args[0],()=>_audio_move(...args));}
