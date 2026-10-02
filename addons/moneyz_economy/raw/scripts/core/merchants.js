import * as Accounts from "./accounts.js";
import * as Economy from "./economy.js";
import { emit } from "./events.js";
const merchants=new Map();
export function register(def){if(!def?.id)throw new Error("Merchant id required");const id=String(def.id);const merchant={id,name:def.name??id,accountId:def.accountId??`merchant:${id}`,metadata:def.metadata??{}};Accounts.create(merchant.accountId,{name:merchant.name,type:"merchant",metadata:{merchantId:id,...merchant.metadata}});merchants.set(id,merchant);emit("merchantRegistered",merchant);return merchant;}
export function get(id){return merchants.get(String(id))??null;} export function list(){return [...merchants.values()];}
export function charge(id,player,amount,metadata={}){const m=get(id);if(!m)return {ok:false,reason:"unknown_merchant"};if(!Economy.withdraw(player,amount,{type:metadata.type??"merchant_purchase",source:metadata.source??id,merchantId:id,...metadata}))return {ok:false,reason:"charge_failed"};const credit=Accounts.deposit(m.accountId,amount,{type:"merchant_credit",source:id,actor:player,...metadata});if(!credit.ok){Economy.deposit(player,amount,{type:"merchant_refund",source:id,merchantId:id,...metadata});return {ok:false,reason:"merchant_credit_failed"};}return {ok:true,merchant:m};}
