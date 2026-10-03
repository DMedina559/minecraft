import { system, world } from "@minecraft/server";
import * as Economy from "../core/economy.js";
import * as Jobs from "../core/jobs.js";
import * as Entitlements from "../core/entitlements.js";
import * as Transactions from "../core/transactions.js";
import * as Accounts from "../core/accounts.js";
import * as Shops from "../repositories/shops.js";
import * as Commerce from "../services/commerce.js";
import * as Products from "../core/products.js";
import * as Properties from "../core/properties.js";
import * as Exchanges from "../core/exchanges.js";
import * as Reservations from "../core/reservations.js";
import * as Treasury from "../core/treasury.js";
import * as Metrics from "../core/metrics.js";
import * as Audit from "../core/audit.js";
import * as Config from "../core/config.js";
import * as Permissions from "../core/permissions.js";
import * as Merchants from "../core/merchants.js";
import * as Extensions from "./extensions.js";
import * as Pricing from "../core/pricing.js";
import * as Fees from "../core/fees.js";
import * as Quests from "../quest/engine.js";
import * as Services from "./services.js";
import { capabilities, API_VERSION, PACK_PLATFORM_VERSION } from "../core/api.js";
import { log, LOG_LEVELS } from "../logger.js";

const PREFIX="moneyz:api:", MAILBOX="MoneyzAPI";
const cleanId=v=>String(v??"").trim().replace(/[^a-zA-Z0-9_.:-]/g,"_").slice(0,40);
function parse(message){const raw=String(message??"").trim();if(!raw)return {};try{const value=JSON.parse(raw);return value&&typeof value==="object"?value:{value};}catch{return {value:raw};}}
function findPlayer(name){
 const wanted=String(name??"").trim();
 if(!wanted)return null;
 // GameTest and disconnect churn can leave transient Player wrappers in
 // world.getPlayers() whose properties throw when read. Never let one stale
 // entry abort resolution of every other player.
 for(const p of world.getPlayers()){
  try{
   if(typeof p?.isValid==="function"&&!p.isValid())continue;
   let playerName="",nameTag="";
   try{playerName=String(p.name??"");}catch{}
   try{nameTag=String(p.nameTag??"");}catch{}
   if(playerName===wanted||nameTag===wanted)return p;
  }catch{}
 }
 return null;
}
function actor(event){return event.initiator??(event.sourceEntity?.typeId==="minecraft:player"?event.sourceEntity:null);}
function target(event,data){return actor(event)??findPlayer(data.player??data.playerName);}
function normalize(result){if(result===undefined)return {ok:true};if(typeof result==="boolean")return {ok:result};if(result&&typeof result==="object")return result;return {ok:true,value:result};}
function fail(reason,extra={}){return {ok:false,reason,...extra};}
function mailbox(){let o=world.scoreboard.getObjective(MAILBOX);if(!o)try{o=world.scoreboard.addObjective(MAILBOX,"Moneyz API Mailbox");}catch{}return o;}
function numericValue(r){for(const k of ["value","balance","targetBalance","count","total","amount","changed","pay","nights","items","money"]){const n=Number(r?.[k]);if(Number.isFinite(n))return Math.round(n);}return 0;}
function writeMailbox(requestId,result){const id=cleanId(requestId);if(!id)return;const r=normalize(result),o=mailbox();if(!o)return;try{o.setScore(`${id}:status`,r.ok===true?1:-1);o.setScore(`${id}:value`,numericValue(r));}catch(error){log(`API mailbox write failed: ${error}`,LOG_LEVELS.DEBUG);}}
function reply(requestId,result){if(!requestId)return;const id=cleanId(requestId);if(!id)return;const r=normalize(result);writeMailbox(id,r);let text;try{text=JSON.stringify(r);}catch{text=JSON.stringify({ok:false,reason:"response_not_serializable"});}if(text.length>1900)text=JSON.stringify({ok:false,reason:"response_too_large"});try{system.sendScriptEvent(`${PREFIX}response/${id}`,text);}catch(error){log(`API gateway response failed: ${error}`,LOG_LEVELS.DEBUG);}}

export async function operation(event,data){
 const op=String(data.op??data.action??"").trim().toLowerCase(),player=target(event,data);
 switch(op){
  case"ping":return {ok:true,value:1,api:"moneyz",apiVersion:API_VERSION,version:PACK_PLATFORM_VERSION};
  case"capabilities":return {ok:true,value:Object.values(capabilities).filter(Boolean).length,capabilities};
  case"economy.balance":return player?{ok:true,balance:Economy.getBalance(player)}:fail("player_not_found");
  case"economy.deposit":return player?{ok:Economy.deposit(player,Number(data.amount),{type:"api_deposit",source:"gateway"}),balance:Economy.getBalance(player)}:fail("player_not_found");
  case"economy.withdraw":return player?{ok:Economy.withdraw(player,Number(data.amount),{type:"api_withdraw",source:"gateway"}),balance:Economy.getBalance(player)}:fail("player_not_found");
  case"economy.set":return player?{ok:Economy.setBalance(player,Number(data.amount),{type:"api_set",source:"gateway"}),balance:Economy.getBalance(player)}:fail("player_not_found");
  case"economy.transfer":{const to=findPlayer(data.to??data.target);if(!player)return fail("player_not_found");if(!to)return fail("target_not_found");const ok=Economy.transfer(player,to,Number(data.amount),{type:"api_transfer",source:"gateway"});return {ok,balance:Economy.getBalance(player),targetBalance:Economy.getBalance(to)};}
  case"transactions.count":{const count=Transactions.count();return {ok:true,value:count,count};}
  case"accounts.create":{const a=Accounts.create(data.id,{name:data.name??data.id,type:data.type??"test"});return {ok:true,value:a.balance??0,id:a.id};}
  case"accounts.deposit":{const r=Accounts.deposit(data.id,Number(data.amount),{source:"gateway"});return {...r,value:Accounts.getBalance(data.id)};}
  case"accounts.withdraw":{const r=Accounts.withdraw(data.id,Number(data.amount),{source:"gateway"});return {...r,value:Accounts.getBalance(data.id)};}
  case"accounts.balance":return Accounts.get(data.id)?{ok:true,balance:Accounts.getBalance(data.id)}:fail("unknown_account");
  case"jobs.apply":return player?Jobs.grantApplication(player,{source:"gateway"}):fail("player_not_found");
  case"jobs.join":return player?Jobs.join(player,data.job??data.id,{source:"gateway"}):fail("player_not_found");
  case"jobs.leave":case"jobs.quit":return player?Jobs.leave(player,{source:"gateway"}):fail("player_not_found");
  case"jobs.current":{if(!player)return fail("player_not_found");const job=Jobs.current(player);return {ok:true,value:job?.pay??0,job:job?{id:job.id,name:job.name,pay:job.pay}:null,hasApplication:Jobs.hasApplication(player)};}
  case"jobs.get":{const j=Jobs.get(data.id);return j?{ok:true,value:j.pay??0,job:j}:fail("unknown_job");}
  case"entitlements.has":return player?{ok:true,value:Entitlements.has(player,data.id)?1:0,has:Entitlements.has(player,data.id)}:fail("player_not_found");
  case"entitlements.grant":return player?Entitlements.grant(player,data.id,{durationMs:data.durationMs,expiresAt:data.expiresAt,metadata:data.metadata,legacyTag:data.legacyTag}):fail("player_not_found");
  case"entitlements.revoke":return player?{ok:Entitlements.revoke(player,data.id)}:fail("player_not_found");
  case"shops.exists":return {ok:true,value:Shops.getShop(data.id)?1:0};
  case"shops.create":{try{const s=Shops.createShop({id:data.id,name:data.name??data.id,settings:data.settings});return {ok:true,value:s.listings.length};}catch(e){return fail("shop_create_failed",{message:String(e)});}}
  case"shops.delete":{try{Shops.deleteShop(data.id);return {ok:true};}catch(e){return fail("shop_delete_failed",{message:String(e)});}}
  case"shops.addlisting":{try{const x=Shops.addListing(data.shop,{typeId:data.typeId,listingId:data.listingId,category:data.category??"test",buy:{price:Number(data.buyPrice??-1),amount:Number(data.amount??1)},sell:{price:Number(data.sellPrice??-1),amount:Number(data.amount??1)},stock:data.stock});return {ok:true,value:x.buy?.price??0,id:x.id};}catch(e){return fail("listing_create_failed",{message:String(e)});}}
  case"shops.stock":{const x=Shops.getListing(data.shop,data.listing);return x?{ok:true,value:x.stock?.mode==="unlimited"?-1:Number(x.stock?.quantity??0)}:fail("unknown_listing");}
  case"commerce.buy":return player?await Commerce.buyListing(player,data.shop,data.listing,Number(data.quantity??1)):fail("player_not_found");
  case"commerce.sell":return player?await Commerce.sellListing(player,data.shop,data.listing,Number(data.quantity??1)):fail("player_not_found");
  case"products.upsert":{try{const p=Products.upsert(data.product??data);return {ok:true,value:p.price,id:p.id};}catch(e){return fail("product_upsert_failed",{message:String(e)});}}
  case"products.remove":return {ok:Products.remove(data.id)};
  case"products.purchase":return player?await Products.purchase(player,data.id,{source:"gateway"}):fail("player_not_found");
  case"products.exists":return {ok:true,value:Products.get(data.id)?1:0};
  case"treasury.stats":return {ok:true,...Treasury.stats(),reserves:Treasury.listReserves()};
  case"treasury.balance":return {ok:true,balance:Treasury.getBalance(),value:Treasury.getBalance(),mode:Treasury.getMode()};
  case"treasury.mode":{try{return {ok:true,mode:Treasury.setMode(data.mode)}}catch(e){return fail("invalid_mode",{message:String(e)})}}
  case"treasury.deposit":return Treasury.deposit(Number(data.amount),{reason:"api_treasury_deposit",metadata:{source:"gateway"}});
  case"treasury.withdraw":return Treasury.withdraw(Number(data.amount),{reason:"api_treasury_withdraw",metadata:{source:"gateway"}});
  case"metrics.snapshot":return {ok:true,metrics:Metrics.snapshot()};
  case"audit.recent":{const rows=Audit.recent(Math.max(1,Math.min(100,Number(data.limit)||25)));return {ok:true,value:rows.length,entries:rows};}
  case"audit.query":{const rows=Audit.query({action:data.action,actor:data.actor,since:Number(data.since)||undefined,limit:Math.max(1,Math.min(100,Number(data.limit)||25))});return {ok:true,value:rows.length,entries:rows};}
  case"config.get":{const key=String(data.key??"");return key?{ok:true,key,value:Config.get(key)}:fail("key_required");}
  case"config.list":return {ok:true,config:Config.all()};
  case"permissions.list":{const rows=Permissions.list();return {ok:true,value:rows.length,permissions:rows};}
  case"merchants.list":{const rows=Merchants.list().map(x=>({id:x.id,name:x.name,accountId:x.accountId,metadata:x.metadata}));return {ok:true,value:rows.length,merchants:rows};}
  case"merchants.get":{const x=Merchants.get(data.id);return x?{ok:true,merchant:{id:x.id,name:x.name,accountId:x.accountId,metadata:x.metadata}}:fail("unknown_merchant");}
  case"extensions.list":{const rows=Extensions.list().map(x=>({id:x.id,name:x.name,version:x.version,metadata:x.metadata}));return {ok:true,value:rows.length,extensions:rows};}
  case"currencies.list":{const rows=Extensions.currencies.list();return {ok:true,value:rows.length,currencies:rows};}
  case"pricing.calculate":{const value=Pricing.calculate(Number(data.base??data.price??0),data.context??{});return {ok:true,value,price:value};}
  case"fees.calculate":{const rows=Fees.calculate(data.context??data);return {ok:true,value:rows.reduce((n,x)=>n+Number(x.amount||0),0),fees:rows};}
  case"realestate.list":{const rows=Properties.list({type:data.type,available:data.available});return {ok:true,value:rows.length,properties:rows};}
  case"realestate.get":{const p=Properties.get(data.id);return p?{ok:true,property:p}:fail("unknown_property");}
  case"realestate.register":case"hotels.register":{try{const p=op==="hotels.register"?Properties.registerHotel(data.property??data):Properties.registerProperty(data.property??data);return {ok:true,id:p.id,property:p};}catch(e){return fail("property_register_failed",{message:String(e)})}}
  case"realestate.unregister":return {ok:Properties.unregisterProperty(data.id)};
  case"realestate.owner":{const owner=Properties.getOwner(data.id);return {ok:Boolean(Properties.get(data.id)),owner};}
  case"realestate.ownedby":{if(!player)return fail("player_not_found");const rows=Properties.ownedBy(player);return {ok:true,value:rows.length,properties:rows};}
  case"realestate.purchase":return player?Properties.buy(player,data.id):fail("player_not_found");
  case"realestate.sell":return player?Properties.sell(player,data.id,{rate:Number(data.rate??1)}):fail("player_not_found");
  case"realestate.rent":return player?Properties.rent(player,data.id):fail("player_not_found");
  case"realestate.access.check":return player?{ok:true,has:Properties.hasAccess(player,data.id),value:Properties.hasAccess(player,data.id)?1:0}:fail("player_not_found");
  case"realestate.access.grant":{if(!player)return fail("player_not_found");const guest=findPlayer(data.guest??data.target);return guest?Properties.grantAccess(player,data.id,guest,data.role):fail("target_not_found");}
  case"realestate.access.revoke":{if(!player)return fail("player_not_found");const guest=findPlayer(data.guest??data.target);return guest?Properties.revokeAccess(player,data.id,guest):fail("target_not_found");}
  case"hotels.list":{const rows=Properties.listHotels();return {ok:true,value:rows.length,hotels:rows};}
  case"reservations.available":return {ok:true,available:Reservations.isAvailable(data.propertyId??data.id),value:Reservations.isAvailable(data.propertyId??data.id)?1:0};
  case"properties.upsert":{try{const p=Properties.upsert(data.property??data);return {ok:true,value:p.price,id:p.id};}catch(e){return fail("property_upsert_failed",{message:String(e)});}}
  case"properties.remove":return {ok:Properties.remove(data.id)};
  case"properties.buy":return player?Properties.buy(player,data.id):fail("player_not_found");
  case"properties.sell":return player?Properties.sell(player,data.id,{rate:Number(data.rate??1)}):fail("player_not_found");
  case"properties.rent":return player?Properties.rent(player,data.id):fail("player_not_found");
  case"properties.checkout":return player?Properties.checkout(player,data.id):fail("player_not_found");
  case"properties.status":{if(!player)return fail("player_not_found");const s=Properties.status(player);return {ok:true,value:s.owned.length+s.rented.length,owned:s.owned.length,rented:s.rented.length};}
  case"exchanges.get":{const x=Exchanges.get(data.id);return x?{ok:true,value:x.moneyz,exchange:x}:fail("unknown_exchange");}
  case"exchanges.upsert":{try{const x=Exchanges.upsert(data.exchange??data);return {ok:true,value:x.moneyz,id:x.id};}catch(e){return fail("exchange_upsert_failed",{message:String(e)});}}
  case"exchanges.remove":return {ok:Exchanges.remove(data.id)};
  case"exchanges.execute":return player?await Exchanges.execute(player,data.id,data.direction,Number(data.bundles??1)):fail("player_not_found");
  case"reservations.book":return player?Reservations.book(player,data.propertyId??data.id,{nights:Number(data.nights??1),durationMs:data.durationMs,metadata:{source:"gateway"}}):fail("player_not_found");
  case"reservations.active":{if(!player)return fail("player_not_found");const a=Reservations.activeFor(player);return {ok:true,value:a.length,count:a.length};}
  case"reservations.checkout":return player?Reservations.checkout(player,data.id):fail("player_not_found");
  case"quests.available":{if(!player)return fail("player_not_found");const a=Quests.getAvailable(player);return {ok:true,value:a.length,count:a.length};}
  case"quests.start":return player?Quests.startQuest(player,data.id):fail("player_not_found");
  case"quests.abandon":return player?{ok:Quests.abandonQuest(player,"gateway_test")}:fail("player_not_found");
  case"quests.active":{if(!player)return fail("player_not_found");const q=Quests.getActiveQuest(player);return {ok:true,value:q?1:0,id:q?.id??null};}
  case"services.exists":return {ok:true,value:Services.exists(data.id)?1:0};
  case"services.list":{const a=Services.list(data.category?{category:data.category}:{});return {ok:true,value:a.length,count:a.length};}
  default:return fail("unknown_operation",{op});
 }
}
export function handleApiRequest(event){const data=parse(event.message),requestId=data.requestId??data.request??data.id;system.run(async()=>{let result;try{result=await operation(event,data);}catch(error){result=fail("exception",{message:String(error)});log(`API gateway ${data.op??data.action??"?"} failed: ${error}`,LOG_LEVELS.ERROR);}reply(requestId,result);});}

/** Execute a gateway request received through the custom-command RPC transport.
 * This intentionally shares the exact dispatcher/mailbox used by ScriptEvents.
 */
export function handleApiCommand(data, sourcePlayer = undefined){
 const requestId=data?.requestId??data?.request??data?.id;
 system.run(async()=>{
  let result;
  try{result=await operation(sourcePlayer ? { sourceEntity: sourcePlayer } : {},data??{});}
  catch(error){result=fail("exception",{message:String(error)});log(`API command gateway ${data?.op??data?.action??"?"} failed: ${error}`,LOG_LEVELS.ERROR);}
  reply(requestId,result);
 });
}
