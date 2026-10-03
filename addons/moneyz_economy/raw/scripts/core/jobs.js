import { world } from "@minecraft/server";
import * as Storage from "./storage.js";
import * as Economy from "./economy.js";
import { emit } from "./events.js";
const db=Storage.namespace("jobs");
const KEY="definitions";
// Canonical legacy Moneyz roster/pay imported from raw/functions/jobs + bank/pay.mcfunction.
const defaults=[
 {id:"assistant",name:"Assistant",description:"Assistant role.",pay:2000,legacyTags:["assistant"]},
 {id:"banker",name:"Banker",description:"Bank worker; can run worker payroll.",pay:4000,legacyTags:["banker"]},
 {id:"builder",name:"Builder",description:"Builder role.",pay:2000,legacyTags:["builder"]},
 {id:"cop",name:"Cop",description:"Law-enforcement role.",pay:2000,legacyTags:["cop"]},
 {id:"delivery",name:"Delivery Person",description:"Delivery role.",pay:1000,legacyTags:["delivery"]},
 {id:"farmer",name:"Farmer",description:"Agricultural worker.",pay:1000,legacyTags:["farmer"]},
 {id:"fisher",name:"Fisher",description:"Fishing worker.",pay:1000,legacyTags:["fisher"]},
 {id:"hotelowner",name:"Hotel Owner",description:"Hotel owner/operator.",pay:1000,legacyTags:["hotelown"]},
 {id:"judge",name:"Judge",description:"Justice role.",pay:4000,legacyTags:["judge"]},
 {id:"lawyer",name:"Lawyer",description:"Legal role.",pay:3000,legacyTags:["lawyer"]},
 {id:"mayor",name:"Mayor",description:"Mayor role.",pay:4000,legacyTags:["mayor"]},
 {id:"pastor",name:"Pastor",description:"Pastor role.",pay:3000,legacyTags:["pastor"]},
 {id:"realtor",name:"Realtor",description:"Real-estate worker.",pay:3000,legacyTags:["realtor"]}
].map(j=>({...j,payInterval:0,requiresApplication:true}));
const cleanId=v=>String(v??"").trim().toLowerCase().replace(/[^a-z0-9_.-]/g,"_");
function cloneJson(value){return JSON.parse(JSON.stringify(value));}
function load(){const v=db.get(KEY);if(Array.isArray(v))return v;const initial=cloneJson(defaults);db.set(KEY,initial);return initial;}
function save(v){db.set(KEY,v);return v;}
export function list(){return load().filter(x=>x.enabled!==false);}
export function listAll(){return load();}
export function get(id){id=cleanId(id);return load().find(x=>x.id===id)??null;}
export function upsert(def){const a=load(),id=cleanId(def.id||def.name);if(!id)throw new Error("Job id required");const i=a.findIndex(x=>x.id===id),old=i>=0?a[i]:{};const job={...old,...def,id,name:String(def.name??old.name??id),pay:Math.max(0,Math.round(Number(def.pay??old.pay??0))),payInterval:Math.max(0,Math.round(Number(def.payInterval??old.payInterval??0))),requiresApplication:def.requiresApplication??old.requiresApplication??true,legacyTags:Array.isArray(def.legacyTags)?def.legacyTags:(old.legacyTags??[])};if(i>=0)a[i]=job;else a.push(job);save(a);emit("jobChanged",{job});return job;}
export function remove(id){const a=load(),n=a.filter(x=>x.id!==cleanId(id));if(n.length===a.length)return false;save(n);return true;}
const pstore=p=>Storage.player(p,"jobs");
export function current(player){const id=pstore(player).get("current");return id?get(id):null;}
export function hasApplication(player){return Boolean(pstore(player).get("application")||player.hasTag?.("apply"));}
export function grantApplication(player,{source="api"}={}){pstore(player).set("application",true);try{player.addTag("apply")}catch{}emit("jobApplicationGranted",{player,source});return {ok:true};}
export function revokeApplication(player){pstore(player).delete("application");try{player.removeTag("apply")}catch{}return true;}
export function join(player,id,{source="api",bypassApplication=false}={}){const job=get(id);if(!job)return {ok:false,reason:"unknown_job"};const old=current(player);if(old?.id===job.id)return {ok:false,reason:"already_employed"};if(job.requiresApplication!==false&&!bypassApplication&&!hasApplication(player))return {ok:false,reason:"application_required"};if(old)leave(player,{source:"job_change"});pstore(player).set("current",job.id);pstore(player).set("joinedAt",Date.now());for(const t of job.legacyTags??[])try{player.addTag(t)}catch{}revokeApplication(player);emit("jobJoined",{player,job,source});return {ok:true,job};}
export function leave(player,{source="api"}={}){const job=current(player);if(!job)return {ok:false,reason:"unemployed"};for(const t of job.legacyTags??[])try{player.removeTag(t)}catch{}pstore(player).delete("current");pstore(player).delete("joinedAt");emit("jobLeft",{player,job,source});return {ok:true,job};}
export function migrateLegacy(player){if(current(player))return null;for(const job of list()){if((job.legacyTags??[]).some(t=>player.hasTag?.(t))){pstore(player).set("current",job.id);pstore(player).set("joinedAt",Date.now());return job;}}return null;}
export function canRunPayroll(player){return current(player)?.id==="banker"||player.hasTag?.("banker");}
export function runPayroll(actor,{source="jobs_payroll"}={}){if(!canRunPayroll(actor))return {ok:false,reason:"banker_required"};const payments=[];for(const player of world.getPlayers()){const job=current(player)??migrateLegacy(player);if(!job||job.pay<=0)continue;if(Economy.deposit(player,job.pay,{type:"job_pay",source,actor,jobId:job.id})){payments.push({player,job,amount:job.pay});try{player.sendMessage(`§aPayment received: ${job.pay} Moneyz (${job.name}).`)}catch{}}}emit("payrollRun",{actor,payments,source});return {ok:true,count:payments.length,total:payments.reduce((n,x)=>n+x.amount,0),payments};}
// Compatibility API: individual pay is retained for extensions/admin automation, but normal Moneyz UX uses banker-run payroll.
export function claimPay(player,{source="jobs",actor}={}){const job=current(player)??migrateLegacy(player);if(!job)return {ok:false,reason:"unemployed"};if(!Economy.deposit(player,job.pay,{type:"job_pay",source,actor,jobId:job.id}))return {ok:false,reason:"payment_failed"};emit("jobPaid",{player,job,amount:job.pay,source});return {ok:true,job,amount:job.pay};}
export function state(player){return {job:current(player),joinedAt:pstore(player).get("joinedAt")??null,hasApplication:hasApplication(player)};}
