import * as Storage from "./storage.js";
import * as Economy from "./economy.js";
import * as Treasury from "./treasury.js";
import * as Inventory from "../services/inventory.js";
import { emit } from "./events.js";
const db=Storage.namespace("exchanges"),KEY="definitions";
const clean=v=>String(v??"").trim().toLowerCase().replace(/[^a-z0-9_.:-]/g,"_");
const defaults=[
 {id:"coal",name:"Coal",itemId:"minecraft:coal",itemAmount:1,moneyz:5},
 {id:"copper",name:"Copper Ingot",itemId:"minecraft:copper_ingot",itemAmount:1,moneyz:10},
 {id:"iron",name:"Iron Ingot",itemId:"minecraft:iron_ingot",itemAmount:1,moneyz:50},
 {id:"gold",name:"Gold Ingot",itemId:"minecraft:gold_ingot",itemAmount:1,moneyz:25},
 {id:"emerald",name:"Emerald",itemId:"minecraft:emerald",itemAmount:1,moneyz:100},
 {id:"diamond",name:"Diamond",itemId:"minecraft:diamond",itemAmount:1,moneyz:75},
 {id:"netherite",name:"Netherite Ingot",itemId:"minecraft:netherite_ingot",itemAmount:1,moneyz:1000}
];
function load(){let v=db.get(KEY);if(!Array.isArray(v)){v=defaults.map(x=>({...x,enabled:true,allowBuy:true,allowSell:true}));db.set(KEY,v);}return v;}
const save=v=>(db.set(KEY,v),v);
export const list=()=>load().filter(x=>x.enabled!==false);
export const all=()=>load();
export const get=id=>load().find(x=>x.id===clean(id))??null;
export function upsert(def){const a=load(),id=clean(def.id||def.name);if(!id)throw new Error("Exchange id required");const i=a.findIndex(x=>x.id===id),old=i>=0?a[i]:{};const x={...old,...def,id,name:String(def.name??old.name??id),itemId:String(def.itemId??old.itemId??""),itemAmount:Math.max(1,Math.round(Number(def.itemAmount??old.itemAmount??1))),moneyz:Math.max(0,Math.round(Number(def.moneyz??old.moneyz??0))),allowBuy:def.allowBuy??old.allowBuy??true,allowSell:def.allowSell??old.allowSell??true,enabled:def.enabled??old.enabled??true};if(!x.itemId)throw new Error("Item ID required");if(i>=0)a[i]=x;else a.push(x);save(a);emit("exchangeChanged",{exchange:x});return x;}
export function remove(id){const a=load(),n=a.filter(x=>x.id!==clean(id));if(n.length===a.length)return false;save(n);return true;}
export async function execute(player,id,direction,bundles=1){const x=get(id);if(!x||x.enabled===false)return {ok:false,reason:"unknown_exchange"};bundles=Math.max(1,Math.floor(Number(bundles)||1));const items=x.itemAmount*bundles,money=x.moneyz*bundles;
 if(direction==="sell"){if(!x.allowSell)return {ok:false,reason:"sell_disabled"};if(Inventory.count(player,x.itemId)<items)return {ok:false,reason:"missing_items"};const mode=Treasury.getMode();if(mode==="treasury"&&!Treasury.canAfford(money))return {ok:false,reason:"treasury_insufficient_funds",available:Treasury.getBalance()};if(!await Inventory.remove(player,x.itemId,items))return {ok:false,reason:"remove_failed"};if(mode==="reserve")Treasury.addReserve(x.itemId,items,money,{reason:"exchange_deposit"});const pay=Treasury.payout(money,{type:"exchange",exchangeId:x.id,direction});if(!pay.ok){if(mode==="reserve")Treasury.removeReserve(x.itemId,items,money,{reason:"exchange_rollback"});await Inventory.give(player,x.itemId,items);return {ok:false,reason:pay.reason};}if(!Economy.deposit(player,money,{type:"exchange",exchangeId:x.id,direction})){Treasury.collect(money,{type:"exchange_rollback",exchangeId:x.id});if(mode==="reserve")Treasury.removeReserve(x.itemId,items,money,{reason:"exchange_rollback"});await Inventory.give(player,x.itemId,items);return {ok:false,reason:"deposit_failed"};}}
 else {if(!x.allowBuy)return {ok:false,reason:"buy_disabled"};if(Treasury.getMode()==="reserve"&&Treasury.reserveCount(x.itemId)<items)return {ok:false,reason:"reserve_insufficient_items",available:Treasury.reserveCount(x.itemId)};if(!Economy.withdraw(player,money,{type:"exchange",exchangeId:x.id,direction}))return {ok:false,reason:"insufficient_funds"};if(!await Inventory.give(player,x.itemId,items)){Economy.deposit(player,money,{type:"exchange_refund",exchangeId:x.id});return {ok:false,reason:"delivery_failed"};}Treasury.collect(money,{type:"exchange",exchangeId:x.id,direction});if(Treasury.getMode()==="reserve")Treasury.removeReserve(x.itemId,items,money,{reason:"exchange_withdrawal"});}
 emit("exchangeCompleted",{player,exchange:x,direction,bundles,items,money});return {ok:true,exchange:x,direction,bundles,items,money};}
