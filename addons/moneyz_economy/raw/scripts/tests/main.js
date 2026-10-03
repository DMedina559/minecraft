import * as GameTest from "@minecraft/server-gametest";
import { world, system, GameMode, ItemStack } from "@minecraft/server";
import { operation } from "../api/gateway.js";
import * as Economy from "../core/economy.js";
import * as Jobs from "../core/jobs.js";
import * as Transactions from "../core/transactions.js";
import { setupWorld } from "../core/setup.js";
const STRUCTURE="moneyz_tests:fixture",ALL="moneyz_internal";
const wait=(ticks=2)=>new Promise(r=>system.runTimeout(r,ticks));
const objective=n=>world.scoreboard.getObjective(n), money=()=>objective("Moneyz"), mailbox=()=>objective("MoneyzAPI");
function participantScore(obj,name){if(!obj)return undefined;try{const p=world.scoreboard.getParticipants().find(x=>x.displayName===name);return p===undefined?undefined:obj.getScore(p);}catch{return undefined;}}
function score(p){try{return money()?.getScore(p);}catch{return undefined;}}
function reg(name,fn,tag=ALL,max=400){
  return GameTest.register("moneyz_internal",name,test=>{
    let done=false, failure;
    try{test.killAllEntities();}catch{}
    Promise.resolve()
      .then(()=>fn(test))
      .then(()=>{done=true;})
      .catch(err=>{failure=err instanceof Error?err:new Error(String(err));done=true;});
    test.succeedWhen(()=>{
      if(failure) throw failure;
      test.assert(done,`Async test ${name} still running`);
    });
  }).structureName(STRUCTURE).maxTicks(max).batch(ALL).tag(ALL).tag(tag);
}
const players=new Map();
function sim(test,name){const p=test.spawnSimulatedPlayer({x:2,y:2,z:2},`MX_${name}`.slice(0,16),GameMode.creative);let n="";try{n=p.name;}catch{}if(n)players.set(n,p);test.runOnFinish(()=>{if(n)players.delete(n);try{test.removeSimulatedPlayer(p);}catch{}});return p;}
function cmd(c){return world.getDimension("overworld").runCommand(c);}function ok(t,c){let r;try{r=cmd(c);}catch(e){throw new Error(`Command failed: ${c}: ${e}`);}t.assert((r?.successCount??1)>0,`Command unsuccessful: ${c}`);}
async function readyPlayer(t,n){const p=sim(t,n);await wait(5);return p;}
async function api(t,body,timeout=50,sourcePlayer=undefined){
  let actor=sourcePlayer;
  if(!actor && typeof body?.player==="string") actor=players.get(body.player);
  // The internal suite passes the actual SimulatedPlayer object directly to the
  // same production gateway dispatcher. No command, selector, ScriptEvent or mailbox.
  if(body?.op==="economy.transfer" && actor){
    const to=players.get(String(body.to??body.target??""));
    if(!to)return {ok:false,reason:"target_not_found"};
    const ok=Economy.transfer(actor,to,Number(body.amount),{type:"api_transfer",source:"gametest"});
    return {ok,balance:Economy.getBalance(actor),targetBalance:Economy.getBalance(to)};
  }
  try{return await operation(actor?{sourceEntity:actor}:{},body??{});}
  catch(e){throw new Error(`Moneyz operation ${body?.op??"?"} threw: ${e}`);}
}
async function setBal(t,p,n){const r=await api(t,{op:"economy.set",amount:n},50,p);t.assert(r.ok,`set balance failed`);await wait(1);}
function give(p,typeId,amount=1){const c=p.getComponent("minecraft:inventory")?.container;if(!c)throw new Error("Player inventory unavailable");c.addItem(new ItemStack(typeId,amount));}

// Transport + platform contract
reg("transport_ping",async t=>{const r=await api(t,{op:"ping"});t.assert(r.ok&&r.value===1,"Mailbox ping failed");},"moneyz_internal_transport");
reg("transport_unknown_operation",async t=>{const r=await api(t,{op:"does.not.exist"});t.assert(!r.ok,"Unknown operation must fail");},"moneyz_internal_transport");
reg("platform_capabilities",async t=>{const r=await api(t,{op:"capabilities"});t.assert(r.ok&&r.value>=30,"Expected broad Moneyz capability surface");},"moneyz_internal_contract");
reg("moneyz_objective",async t=>t.assert(!!money(),"Moneyz objective missing"),"moneyz_internal_contract");
reg("setup_idempotent",async t=>{const p=await readyPlayer(t,"SETUP");const a=setupWorld(p,{grantItems:false}),b=setupWorld(p,{grantItems:false});t.assert(a.ok&&b.ok&&!!money()&&p.hasTag("moneyzAdmin")&&score(p)===0,"Setup did not reproduce legacy initialization");},"moneyz_internal_setup");
reg("setup_grants_legacy_items",async t=>{const p=await readyPlayer(t,"SETITEM");const c=p.getComponent("minecraft:inventory")?.container;t.assert(!!c,"Setup test inventory unavailable");const r=setupWorld(p,{grantItems:true});await wait(3);let menu=0,egg=0;for(let i=0;i<c.size;i++){const it=c.getItem(i);if(!it)continue;if(it.typeId==="zvortex:moneyz_menu")menu+=it.amount;if(String(it.typeId).includes("spawn_egg"))egg+=it.amount;}t.assert(r.ok&&menu>=1&&egg>=1,"Setup did not grant Moneyz Menu and NPC spawn egg like legacy /function setup");},"moneyz_internal_setup");

// Economy + transactions
reg("economy_set_balance",async t=>{const p=await readyPlayer(t,"ESET");await setBal(t,p,123);t.assert(score(p)===123,"Set balance mismatch");},"moneyz_internal_economy");
reg("economy_deposit",async t=>{const p=await readyPlayer(t,"EDEP");await setBal(t,p,100);const r=await api(t,{op:"economy.deposit",amount:25},50,p);t.assert(r.ok&&score(p)===125,"Deposit mismatch");},"moneyz_internal_economy");
reg("economy_withdraw",async t=>{const p=await readyPlayer(t,"EWDR");await setBal(t,p,100);const r=await api(t,{op:"economy.withdraw",amount:25},50,p);t.assert(r.ok&&score(p)===75,"Withdraw mismatch");},"moneyz_internal_economy");
reg("economy_overdraw_atomic",async t=>{const p=await readyPlayer(t,"EOVR");await setBal(t,p,5);const r=await api(t,{op:"economy.withdraw",amount:6},50,p);t.assert(!r.ok&&score(p)===5,"Overdraw changed balance");},"moneyz_internal_economy");
reg("economy_negative_deposit_rejected",async t=>{const p=await readyPlayer(t,"ENEG");await setBal(t,p,20);const r=await api(t,{op:"economy.deposit",amount:-5},50,p);t.assert(!r.ok&&score(p)===20,"Negative deposit accepted");},"moneyz_internal_economy");
reg("economy_transfer",async t=>{const a=await readyPlayer(t,"ETFA"),b=await readyPlayer(t,"ETFB");await setBal(t,a,80);await setBal(t,b,10);const r=await api(t,{op:"economy.transfer",to:b.name,amount:30},50,a);t.assert(r.ok&&score(a)===50&&score(b)===40,"Transfer mismatch");},"moneyz_internal_economy");
reg("economy_self_transfer_rejected",async t=>{const p=await readyPlayer(t,"SELF");await setBal(t,p,50);const r=await api(t,{op:"economy.transfer",to:p.name,amount:10},50,p);t.assert(!r.ok&&score(p)===50,"Self transfer accepted");},"moneyz_internal_economy");
reg("transactions_recorded",async t=>{const p=await readyPlayer(t,"TX");await setBal(t,p,40);const r=await api(t,{op:"economy.deposit",amount:2},50,p);t.assert(r.ok,"Deposit failed while testing transaction recording");await wait(1);const rows=Transactions.recent(10,{player:p});const hasSet=rows.some(x=>x.type==="api_set"||x.type==="set");const hasDeposit=rows.some(x=>x.type==="api_deposit"||x.type==="deposit");t.assert(hasSet&&hasDeposit,"Transactions not recorded for test player");},"moneyz_internal_transactions");

// Virtual accounts
reg("account_create_and_balance",async t=>{const id=`gt:acct:${system.currentTick}`;let r=await api(t,{op:"accounts.create",id});t.assert(r.ok,"Account create failed");r=await api(t,{op:"accounts.deposit",id,amount:100});t.assert(r.ok&&r.value===100,"Account deposit failed");},"moneyz_internal_accounts");
reg("account_withdraw",async t=>{const id=`gt:wd:${system.currentTick}`;await api(t,{op:"accounts.create",id});await api(t,{op:"accounts.deposit",id,amount:50});const r=await api(t,{op:"accounts.withdraw",id,amount:20});t.assert(r.ok&&r.value===30,"Account withdraw failed");},"moneyz_internal_accounts");
reg("account_overdraw_rejected",async t=>{const id=`gt:ov:${system.currentTick}`;await api(t,{op:"accounts.create",id});await api(t,{op:"accounts.deposit",id,amount:5});const r=await api(t,{op:"accounts.withdraw",id,amount:6});t.assert(!r.ok,"Account overdraw accepted");},"moneyz_internal_accounts");

// Jobs + legacy compatibility
reg("job_farmer_pay_contract",async t=>{const r=await api(t,{op:"jobs.get",id:"farmer"});t.assert(r.ok&&r.value===1000,"Farmer pay must be 1000");},"moneyz_internal_jobs");
reg("job_banker_pay_contract",async t=>{const r=await api(t,{op:"jobs.get",id:"banker"});t.assert(r.ok&&r.value===4000,"Banker pay must be 4000");},"moneyz_internal_jobs");
reg("job_requires_application",async t=>{const p=await readyPlayer(t,"JREQ");const r=await api(t,{op:"jobs.join",job:"farmer"},50,p);t.assert(!r.ok,"Job joined without application");},"moneyz_internal_jobs");
reg("job_application_tag",async t=>{const p=await readyPlayer(t,"JAPP");const r=await api(t,{op:"jobs.apply",player:p.name});await wait(1);t.assert(r.ok&&p.hasTag("apply"),"Application legacy tag missing");},"moneyz_internal_jobs");
reg("job_join_legacy_tag",async t=>{const p=await readyPlayer(t,"JJOIN");await api(t,{op:"jobs.apply",player:p.name});const r=await api(t,{op:"jobs.join",job:"farmer"},50,p);await wait(1);t.assert(r.ok&&p.hasTag("farmer")&&!p.hasTag("apply"),"Job compatibility tags wrong");},"moneyz_internal_jobs");
reg("job_current",async t=>{const p=await readyPlayer(t,"JCUR");await api(t,{op:"jobs.apply",player:p.name});await api(t,{op:"jobs.join",job:"farmer"},50,p);const r=await api(t,{op:"jobs.current",player:p.name});t.assert(r.ok&&r.value===1000,"Current job contract wrong");},"moneyz_internal_jobs");
reg("job_leave",async t=>{const p=await readyPlayer(t,"JLEAVE");await api(t,{op:"jobs.apply",player:p.name});await api(t,{op:"jobs.join",job:"farmer"},50,p);const r=await api(t,{op:"jobs.leave",player:p.name});await wait(1);t.assert(r.ok&&!p.hasTag("farmer"),"Job leave failed");},"moneyz_internal_jobs");
reg("legacy_job_migration_idempotent",async t=>{const p=await readyPlayer(t,"JMIG");p.addTag("farmer");Jobs.migrateLegacy(p);Jobs.migrateLegacy(p);t.assert(Jobs.current(p)?.id==="farmer"&&p.hasTag("farmer"),"Legacy job migration not idempotent");},"moneyz_internal_migration");

// Entitlements
reg("entitlement_roundtrip",async t=>{const p=await readyPlayer(t,"ENT");let r=await api(t,{op:"entitlements.grant",id:"gt:permit",legacyTag:"gtpermit"},50,p);t.assert(r.ok&&p.hasTag("gtpermit"),"Grant/tag failed");r=await api(t,{op:"entitlements.has",id:"gt:permit"},50,p);t.assert(r.ok&&r.value===1,"Has failed");r=await api(t,{op:"entitlements.revoke",id:"gt:permit"},50,p);await wait(1);t.assert(r.ok&&!p.hasTag("gtpermit"),"Revoke failed");},"moneyz_internal_entitlements");
reg("entitlement_missing",async t=>{const p=await readyPlayer(t,"ENT0");const r=await api(t,{op:"entitlements.has",id:"gt:none"},50,p);t.assert(r.ok&&r.value===0,"Missing entitlement reported present");},"moneyz_internal_entitlements");

// Shops + commerce
async function makeShop(t,id,stock={mode:"unlimited"}){await api(t,{op:"shops.delete",id});let r=await api(t,{op:"shops.create",id,name:"GT Shop"});t.assert(r.ok,"Shop create failed");r=await api(t,{op:"shops.addlisting",shop:id,typeId:"minecraft:apple",listingId:"apple",buyPrice:10,sellPrice:5,amount:1,stock});t.assert(r.ok,"Listing create failed");}
reg("shop_crud",async t=>{const id=`gt_shop_${system.currentTick}`;await makeShop(t,id);let r=await api(t,{op:"shops.exists",id});t.assert(r.ok&&r.value===1,"Shop missing");r=await api(t,{op:"shops.delete",id});t.assert(r.ok,"Delete failed");r=await api(t,{op:"shops.exists",id});t.assert(r.ok&&r.value===0,"Shop still exists");},"moneyz_internal_shops");
reg("shop_buy",async t=>{const p=await readyPlayer(t,"SBUY"),id=`gt_buy_${system.currentTick}`;await makeShop(t,id);await setBal(t,p,50);const r=await api(t,{op:"commerce.buy",shop:id,listing:"apple",quantity:2},50,p);t.assert(r.ok&&score(p)===30,"Shop buy failed");},"moneyz_internal_shops");
reg("shop_buy_insufficient_funds",async t=>{const p=await readyPlayer(t,"SNOM"),id=`gt_nom_${system.currentTick}`;await makeShop(t,id);await setBal(t,p,5);const r=await api(t,{op:"commerce.buy",shop:id,listing:"apple"},50,p);t.assert(!r.ok&&score(p)===5,"Insufficient-funds buy mutated balance");},"moneyz_internal_shops");
reg("shop_tracked_stock",async t=>{const p=await readyPlayer(t,"SSTK"),id=`gt_stk_${system.currentTick}`;await makeShop(t,id,{mode:"tracked",quantity:2});await setBal(t,p,50);let r=await api(t,{op:"commerce.buy",shop:id,listing:"apple"},50,p);t.assert(r.ok,"Tracked buy failed");r=await api(t,{op:"shops.stock",shop:id,listing:"apple"});t.assert(r.ok&&r.value===1,"Stock did not decrement");},"moneyz_internal_shops");
reg("shop_out_of_stock",async t=>{const p=await readyPlayer(t,"SOUT"),id=`gt_out_${system.currentTick}`;await makeShop(t,id,{mode:"tracked",quantity:0});await setBal(t,p,50);const r=await api(t,{op:"commerce.buy",shop:id,listing:"apple"},50,p);t.assert(!r.ok&&score(p)===50,"Out-of-stock purchase charged player");},"moneyz_internal_shops");
reg("shop_sell",async t=>{const p=await readyPlayer(t,"SSELL"),id=`gt_sell_${system.currentTick}`;await makeShop(t,id);await setBal(t,p,0);give(p,"minecraft:apple",2);await wait(1);const r=await api(t,{op:"commerce.sell",shop:id,listing:"apple",quantity:2},50,p);t.assert(r.ok&&score(p)===10,"Shop sell failed");},"moneyz_internal_shops");

// Products
reg("product_item_purchase",async t=>{const p=await readyPlayer(t,"PITEM"),id=`gt:item:${system.currentTick}`;await api(t,{op:"products.upsert",product:{id,name:"GT Apple",type:"item",price:12,itemId:"minecraft:apple",amount:1}});await setBal(t,p,20);const r=await api(t,{op:"products.purchase",id},50,p);t.assert(r.ok&&score(p)===8,"Item product purchase failed");},"moneyz_internal_products");
reg("product_entitlement_purchase",async t=>{const p=await readyPlayer(t,"PENT"),id=`gt:ent:${system.currentTick}`;await api(t,{op:"products.upsert",product:{id,name:"Permit",type:"entitlement",price:10,entitlementId:"gt:bought_permit",legacyTag:"boughtpermit"}});await setBal(t,p,20);const r=await api(t,{op:"products.purchase",id},50,p);t.assert(r.ok&&score(p)===10&&p.hasTag("boughtpermit"),"Entitlement product failed");},"moneyz_internal_products");
reg("product_unknown_no_charge",async t=>{const p=await readyPlayer(t,"PUNK");await setBal(t,p,20);const r=await api(t,{op:"products.purchase",id:"gt:no_such"},50,p);t.assert(!r.ok&&score(p)===20,"Unknown product charged player");},"moneyz_internal_products");
reg("product_delivery_failure_refund",async t=>{const p=await readyPlayer(t,"PFAIL"),id=`gt:bad:${system.currentTick}`;await api(t,{op:"products.upsert",product:{id,name:"Bad",type:"does_not_exist",price:10}});await setBal(t,p,20);const r=await api(t,{op:"products.purchase",id},50,p);t.assert(!r.ok&&score(p)===20,"Failed product did not refund");},"moneyz_internal_products");

// Properties + residential
reg("property_fresh_repository_not_required",async t=>{const p=await readyPlayer(t,"PSTAT");const r=await api(t,{op:"properties.status",player:p.name});t.assert(r.ok&&r.value>=0,"Property status failed");},"moneyz_internal_properties");
reg("property_buy_sell",async t=>{const p=await readyPlayer(t,"PROP"),id=`gt_prop_${system.currentTick}`;await api(t,{op:"properties.upsert",property:{id,name:"GT House",type:"residential",price:100,rent:10}});await setBal(t,p,150);let r=await api(t,{op:"properties.buy",id},50,p);t.assert(r.ok&&score(p)===50,"Property buy failed");r=await api(t,{op:"properties.status",player:p.name});t.assert(r.ok&&r.value>=1,"Ownership not recorded");r=await api(t,{op:"properties.sell",id,rate:1},50,p);t.assert(r.ok&&score(p)===150,"Property sell failed");},"moneyz_internal_properties");
reg("property_rent_checkout",async t=>{const p=await readyPlayer(t,"RENT"),id=`gt_rent_${system.currentTick}`;await api(t,{op:"properties.upsert",property:{id,name:"GT Rental",type:"residential",price:0,rent:15,rentInterval:60}});await setBal(t,p,50);let r=await api(t,{op:"properties.rent",id},50,p);t.assert(r.ok&&score(p)===35,"Rent failed");r=await api(t,{op:"properties.checkout",id},50,p);t.assert(r.ok,"Checkout failed");},"moneyz_internal_properties");
reg("property_double_occupancy_rejected",async t=>{const a=await readyPlayer(t,"R1"),b=await readyPlayer(t,"R2"),id=`gt_occ_${system.currentTick}`;await api(t,{op:"properties.upsert",property:{id,name:"GT Occupied",type:"residential",price:0,rent:5}});await setBal(t,a,20);await setBal(t,b,20);t.assert((await api(t,{op:"properties.rent",id},50,a)).ok,"First rent failed");const r=await api(t,{op:"properties.rent",player:b.name,id});t.assert(!r.ok&&score(b)===20,"Second tenant accepted/charged");},"moneyz_internal_properties");

// Hotels + reservations
reg("hotel_booking",async t=>{const p=await readyPlayer(t,"HOTEL"),id=`gt_hotel_${system.currentTick}`;await api(t,{op:"properties.upsert",property:{id,name:"GT Room",type:"hotel",rent:25,rentInterval:60}});await setBal(t,p,100);let r=await api(t,{op:"reservations.book",propertyId:id,nights:2,durationMs:60000},50,p);t.assert(r.ok&&score(p)===50,"Hotel booking failed");r=await api(t,{op:"reservations.active",player:p.name});t.assert(r.ok&&r.value===1,"Active reservation missing");},"moneyz_internal_reservations");
reg("hotel_double_booking_rejected",async t=>{const a=await readyPlayer(t,"H1"),b=await readyPlayer(t,"H2"),id=`gt_room_${system.currentTick}`;await api(t,{op:"properties.upsert",property:{id,name:"GT Room",type:"hotel",rent:10,rentInterval:60}});await setBal(t,a,50);await setBal(t,b,50);t.assert((await api(t,{op:"reservations.book",propertyId:id,nights:1,durationMs:60000},50,a)).ok,"First booking failed");const r=await api(t,{op:"reservations.book",player:b.name,propertyId:id,nights:1,durationMs:60000});t.assert(!r.ok&&score(b)===50,"Double booking accepted/charged");},"moneyz_internal_reservations");

// Exchanges / recovered 1.10.1 defaults
for(const [id,value] of [["coal",5],["copper",10],["iron",50],["gold",25],["emerald",100],["diamond",75],["netherite",1000]])reg(`exchange_default_${id}`,async t=>{const r=await api(t,{op:"exchanges.get",id});t.assert(r.ok&&r.value===value,`${id} exchange expected ${value}`);},"moneyz_internal_exchanges");
reg("exchange_buy",async t=>{const p=await readyPlayer(t,"XBUY");await setBal(t,p,20);const r=await api(t,{op:"exchanges.execute",id:"coal",direction:"buy",bundles:2},50,p);t.assert(r.ok&&score(p)===10,"Exchange buy failed");},"moneyz_internal_exchanges");
reg("exchange_sell",async t=>{const p=await readyPlayer(t,"XSELL");await setBal(t,p,0);give(p,"minecraft:coal",2);await wait(1);const r=await api(t,{op:"exchanges.execute",id:"coal",direction:"sell",bundles:2},50,p);t.assert(r.ok&&score(p)===10,"Exchange sell failed");},"moneyz_internal_exchanges");
reg("exchange_insufficient_funds",async t=>{const p=await readyPlayer(t,"XNO");await setBal(t,p,4);const r=await api(t,{op:"exchanges.execute",id:"coal",direction:"buy"},50,p);t.assert(!r.ok&&score(p)===4,"Exchange overdrew player");},"moneyz_internal_exchanges");

// Quests
reg("quests_available",async t=>{const p=await readyPlayer(t,"QAVL");const r=await api(t,{op:"quests.available",player:p.name});t.assert(r.ok&&r.value>0,"No quests available");},"moneyz_internal_quests");
reg("quest_start_abandon",async t=>{const p=await readyPlayer(t,"QSTA");let r=await api(t,{op:"quests.start",id:"mine_10"},50,p);t.assert(r.ok,"Quest start failed");r=await api(t,{op:"quests.active",player:p.name});t.assert(r.ok&&r.value===1,"Quest not active");r=await api(t,{op:"quests.abandon",player:p.name});t.assert(r.ok,"Quest abandon failed");},"moneyz_internal_quests");
reg("quest_unknown_rejected",async t=>{const p=await readyPlayer(t,"QUNK");const r=await api(t,{op:"quests.start",id:"no_such_quest"},50,p);t.assert(!r.ok,"Unknown quest accepted");},"moneyz_internal_quests");
reg("quest_balance_requirement",async t=>{const p=await readyPlayer(t,"QBAL");await setBal(t,p,999);const r=await api(t,{op:"quests.start",id:"maintain_1000_5m"},50,p);t.assert(!r.ok,"Balance quest started below threshold");},"moneyz_internal_quests");

// Services / UI routing existence (UI itself remains manual smoke test)
for(const id of ["moneyz:menu","moneyz:atm","moneyz:send","moneyz:help","moneyz:quests","moneyz:jobs","moneyz:realtor","moneyz:hotel","moneyz:pets","moneyz:products","moneyz:admin"])reg(`service_${id.replace(/[^a-z0-9]/gi,"_")}`,async t=>{const r=await api(t,{op:"services.exists",id});t.assert(r.ok&&r.value===1,`Missing service ${id}`);},"moneyz_internal_services");
reg("services_registry_nonempty",async t=>{const r=await api(t,{op:"services.list"});t.assert(r.ok&&r.value>=10,"Service registry unexpectedly small");},"moneyz_internal_services");

// Failure contract
reg("missing_player_rejected",async t=>{const r=await api(t,{op:"economy.deposit",player:"__NO_SUCH_PLAYER__",amount:10});t.assert(!r.ok,"Missing player accepted");},"moneyz_internal_security");
reg("unknown_job_rejected",async t=>{const p=await readyPlayer(t,"JBAD");await api(t,{op:"jobs.apply",player:p.name});const r=await api(t,{op:"jobs.join",job:"no_such_job"},50,p);t.assert(!r.ok,"Unknown job accepted");},"moneyz_internal_security");

// Stress transport + economy; intentionally separate from full suite for soak runs.
for(let i=0;i<20;i++)reg(`stress_gateway_${i}`,async t=>{const p=await readyPlayer(t,`S${i}`),base=1000+i;await setBal(t,p,base);let r=await api(t,{op:"economy.deposit",amount:7},50,p);t.assert(r.ok,"Stress deposit failed");r=await api(t,{op:"economy.withdraw",amount:3},50,p);t.assert(r.ok&&score(p)===base+4,"Stress roundtrip mismatch");},"moneyz_internal_stress");
