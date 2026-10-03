import * as Storage from "./storage.js";
import { emit } from "./events.js";
const db=Storage.namespace("treasury"), KEY="state";
const defaults={mode:"classic",balance:0,reserves:{},issued:0,destroyed:0,inflow:0,outflow:0};
const n=v=>Math.max(0,Math.round(Number(v)||0));
function load(){const v=db.get(KEY);return v&&typeof v==="object"?{...defaults,...v,reserves:{...(v.reserves??{})}}:{...defaults,reserves:{}};}
function save(s){db.set(KEY,s);return s;}
export function getMode(){return load().mode;}
export function setMode(mode){mode=String(mode??"").toLowerCase();if(!["classic","treasury","reserve"].includes(mode))throw new Error("Mode must be classic, treasury, or reserve");const s=load();s.mode=mode;save(s);emit("treasuryModeChanged",{mode});return mode;}
export function getBalance(){return load().balance;}
export function setBalance(amount,{reason="admin_set"}={}){const s=load();s.balance=n(amount);save(s);emit("treasuryChanged",{balance:s.balance,delta:0,reason});return s.balance;}
export function canAfford(amount){const s=load();return s.mode==="classic"||s.balance>=n(amount);}
export function deposit(amount,{reason="system_inflow",metadata={}}={}){amount=n(amount);const s=load();s.balance+=amount;s.inflow+=amount;save(s);emit("treasuryChanged",{balance:s.balance,delta:amount,reason,metadata});return {ok:true,balance:s.balance,amount};}
export function withdraw(amount,{reason="system_outflow",metadata={}}={}){amount=n(amount);const s=load();if(s.mode!=="classic"&&s.balance<amount)return {ok:false,reason:"treasury_insufficient_funds",balance:s.balance,required:amount};if(s.mode!=="classic")s.balance-=amount;s.outflow+=amount;save(s);emit("treasuryChanged",{balance:s.balance,delta:s.mode==="classic"?0:-amount,reason,metadata});return {ok:true,balance:s.balance,amount};}
export function issue(amount,{reason="issuance"}={}){amount=n(amount);const s=load();s.balance+=amount;s.issued+=amount;save(s);emit("treasuryChanged",{balance:s.balance,delta:amount,reason});return s.balance;}
export function destroy(amount,{reason="destruction"}={}){amount=n(amount);const s=load(),used=Math.min(s.balance,amount);s.balance-=used;s.destroyed+=used;save(s);emit("treasuryChanged",{balance:s.balance,delta:-used,reason});return used;}
export function collect(amount,metadata={}){return getMode()==="classic"?{ok:true,balance:getBalance(),amount:n(amount)}:deposit(amount,{reason:metadata.type??"system_collection",metadata});}
export function payout(amount,metadata={}){return withdraw(amount,{reason:metadata.type??"system_payout",metadata});}
export function reserveCount(itemId){return n(load().reserves[String(itemId)]?.count);}
export function reserveValue(){return Object.values(load().reserves).reduce((sum,r)=>sum+n(r.value),0);}
export function addReserve(itemId,count,value,{reason="resource_deposit"}={}){itemId=String(itemId);count=n(count);value=n(value);const s=load(),r=s.reserves[itemId]??{count:0,value:0};r.count+=count;r.value+=value;s.reserves[itemId]=r;if(s.mode==="reserve")s.balance+=value;save(s);emit("reserveChanged",{itemId,count,value,reason,reserve:r});return {...r};}
export function removeReserve(itemId,count,value,{reason="resource_withdrawal"}={}){itemId=String(itemId);count=n(count);value=n(value);const s=load(),r=s.reserves[itemId]??{count:0,value:0};if(r.count<count)return {ok:false,reason:"reserve_insufficient_items",available:r.count};r.count-=count;r.value=Math.max(0,r.value-value);s.reserves[itemId]=r;save(s);emit("reserveChanged",{itemId,count:-count,value:-value,reason,reserve:r});return {ok:true,...r};}
export function stats(){const s=load(),rv=reserveValue();return {...s,reserveValue:rv,totalBacking:s.balance+rv};}
export function listReserves(){const s=load();return Object.entries(s.reserves).map(([itemId,v])=>({itemId,count:n(v.count),value:n(v.value)}));}
export function setReserve(itemId,count,value,{reason="admin_reserve_set",metadata={}}={}){itemId=String(itemId??"").trim();if(!itemId)throw new Error("Resource identifier is required");count=n(count);value=n(value);const s=load();if(count===0&&value===0)delete s.reserves[itemId];else s.reserves[itemId]={count,value};save(s);emit("reserveChanged",{itemId,count,value,reason,metadata,reserve:{count,value},absolute:true});return {ok:true,itemId,count,value};}
export function clearReserve(itemId,{reason="admin_reserve_clear",metadata={}}={}){itemId=String(itemId??"").trim();const s=load(),previous=s.reserves[itemId]??{count:0,value:0};delete s.reserves[itemId];save(s);emit("reserveChanged",{itemId,count:-n(previous.count),value:-n(previous.value),reason,metadata,reserve:{count:0,value:0},absolute:true});return {ok:true,itemId,previous:{count:n(previous.count),value:n(previous.value)}};}
