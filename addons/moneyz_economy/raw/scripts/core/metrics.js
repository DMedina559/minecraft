import { world } from "@minecraft/server";
import * as Transactions from "./transactions.js";
import * as Accounts from "./accounts.js";
const custom=new Map();
export function registerMetric(id,fn){if(!String(id).includes(":"))throw new Error("Metric id must be namespaced");custom.set(id,fn);return()=>custom.delete(id)}
function livePlayers(){const out=[];for(const p of world.getPlayers()){try{if(typeof p?.isValid==="function"&&!p.isValid())continue;void p.id;out.push(p);}catch{}}return out;}
function safeMoney(obj,p){try{return obj?.getScore(p)??0}catch{return 0}}
export function snapshot(){const players=livePlayers(),money=world.scoreboard.getObjective("Moneyz");const playerMoney=players.reduce((s,p)=>s+safeMoney(money,p),0);const tx=Transactions.recent?.(500)??[];const cutoff=Date.now()-86400000;const t24=tx.filter(x=>(x.at??x.timestamp)>=cutoff);const extra={};for(const [id,fn] of custom)try{extra[id]=fn()}catch{extra[id]=null}return{timestamp:Date.now(),onlinePlayers:players.length,playerMoney,virtualAccounts:Accounts.list?.().length??0,transactions24h:t24.length,volume24h:t24.reduce((s,x)=>s+Math.abs(Number(x.amount)||0),0),custom:extra}}
