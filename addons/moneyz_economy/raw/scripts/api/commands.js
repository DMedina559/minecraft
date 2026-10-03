import { system, Player, CommandPermissionLevel, CustomCommandParamType, CustomCommandStatus } from "@minecraft/server";
import * as Economy from "../core/economy.js";
import * as Transactions from "../core/transactions.js";
import { reloadShops } from "../repositories/shops.js";
import { formatHealth } from "../core/health.js";
import { runMigrations } from "../core/migrations.js";
import { main } from "../gui/moneyz_menu.js";
import * as NpcMenus from "./npc_menus.js";
import * as NpcShops from "./npc_shops.js";
import * as NpcServices from "./npc_services.js";
import * as Services from "./services.js";
import * as Shops from "../repositories/shops.js";
import { Moneyz } from "../core/api.js";
import * as Jobs from "../core/jobs.js";
import * as Properties from "../core/properties.js";
import { handleApiCommand } from "./gateway.js";
const playerFrom=o=>o.sourceEntity instanceof Player?o.sourceEntity:undefined;
const result=(ok,message)=>({status:ok?CustomCommandStatus.Success:CustomCommandStatus.Failure,message});
export function registerCommands(registry){
 registry.registerCommand({name:"moneyz:menu",description:"Open the Moneyz menu",permissionLevel:CommandPermissionLevel.Any,cheatsRequired:false},origin=>{const p=playerFrom(origin);if(!p)return result(false,"Player only.");system.run(()=>main(p));return result(true,"Opening Moneyz.");});
 registry.registerCommand({name:"moneyz:balance",description:"Show a Moneyz balance",permissionLevel:CommandPermissionLevel.Any,cheatsRequired:false,optionalParameters:[{type:CustomCommandParamType.PlayerSelector,name:"player"}]},(origin,targets)=>{const target=targets?.[0]??playerFrom(origin);if(!target)return result(false,"No player.");return result(true,`${target.nameTag}: ${Economy.getBalance(target)} Moneyz`);});
 for(const [name,op] of [["give","deposit"],["take","withdraw"],["set","setBalance"]])registry.registerCommand({name:`moneyz:${name}`,description:`${name} Moneyz`,permissionLevel:CommandPermissionLevel.Admin,mandatoryParameters:[{type:CustomCommandParamType.PlayerSelector,name:"player"},{type:CustomCommandParamType.Integer,name:"amount"}]},(origin,targets,amount)=>{const target=targets?.[0];if(!target)return result(false,"No player.");const actor=playerFrom(origin)??"console";system.run(()=>Economy[op](target,amount,{type:"admin_adjustment",source:"custom_command",actor}));return result(true,"Moneyz update queued.");});
 registry.registerCommand({name:"moneyz:reload",description:"Reload Moneyz shop data",permissionLevel:CommandPermissionLevel.Admin},()=>{system.run(()=>reloadShops());return result(true,"Moneyz reload queued.");});
 registry.registerCommand({name:"moneyz:health",description:"Show Moneyz diagnostics",permissionLevel:CommandPermissionLevel.Admin},()=>result(true,formatHealth()));
 registry.registerCommand({name:"moneyz:migrate",description:"Run Moneyz schema migrations",permissionLevel:CommandPermissionLevel.Admin},()=>{system.run(()=>runMigrations());return result(true,"Moneyz migration queued.");});
 registry.registerCommand({name:"moneyz:transactions",description:"Show recent Moneyz transactions",permissionLevel:CommandPermissionLevel.Admin,optionalParameters:[{type:CustomCommandParamType.Integer,name:"count"}]},(_origin,count)=>{const n=Math.min(10,Math.max(1,Number(count??5)));const text=Transactions.recent(n).map(t=>`${t.id} ${t.type} ${t.amount} ${t.from??""}${t.to?` -> ${t.to}`:""}`).join(" | ")||"No transactions.";return result(true,text);});
 registry.registerCommand({name:"moneyz:npc",description:"Add a Moneyz service to an NPC. Uses nearest NPC if selector is omitted.",permissionLevel:CommandPermissionLevel.GameDirectors,mandatoryParameters:[{type:CustomCommandParamType.String,name:"service"}],optionalParameters:[{type:CustomCommandParamType.EntitySelector,name:"npc"}]},(origin,serviceId,entities)=>{const player=playerFrom(origin),npc=entities?.[0]??(player?NpcMenus.nearest(player):null);if(!npc)return result(false,"No NPC found.");if(!Services.exists(serviceId))return result(false,`Unknown service: ${serviceId}. Use /moneyz:services.`);system.run(()=>{const r=NpcServices.add(npc,{type:"service",id:serviceId});if(player)player.sendMessage(r.ok?`§aAdded NPC service ${serviceId}.`:`§cNPC setup failed: ${r.reason}.`);});return result(true,"NPC service assignment queued.");});
 registry.registerCommand({name:"moneyz:npc_shop",description:"Bind a dynamic Moneyz shop to an NPC. Uses nearest NPC if selector is omitted.",permissionLevel:CommandPermissionLevel.GameDirectors,mandatoryParameters:[{type:CustomCommandParamType.String,name:"shop"}],optionalParameters:[{type:CustomCommandParamType.EntitySelector,name:"npc"}]},(origin,shopId,entities)=>{const player=playerFrom(origin),npc=entities?.[0]??(player?NpcMenus.nearest(player):null);if(!Shops.getShop(shopId))return result(false,`Unknown shop: ${shopId}`);if(!npc)return result(false,"No NPC found.");if(Shops.getShop(shopId)?.settings?.allowNpcBinding===false)return result(false,"That shop does not allow NPC binding.");system.run(()=>{NpcServices.add(npc,{type:"shop",id:shopId});if(player)player.sendMessage(`§aNPC now includes ${Shops.getShop(shopId).name}.`);});return result(true,"NPC shop assignment queued.");});
 registry.registerCommand({name:"moneyz:shops",description:"List dynamic Moneyz shop IDs",permissionLevel:CommandPermissionLevel.GameDirectors,cheatsRequired:false},()=>result(true,Object.keys(Shops.getShopData()).join(", ")||"No shops."));
 registry.registerCommand({name:"moneyz:npc_shop_clear",description:"Clear shop services from the nearest NPC",permissionLevel:CommandPermissionLevel.GameDirectors},origin=>{const player=playerFrom(origin);if(!player)return result(false,"Player only.");const npc=NpcMenus.nearest(player);if(!npc)return result(false,"No NPC found within 6 blocks.");system.run(()=>NpcServices.clearType(npc,"shop"));return result(true,"NPC shop services cleared.");});
 registry.registerCommand({name:"moneyz:menus",description:"List registered Moneyz NPC menu IDs",permissionLevel:CommandPermissionLevel.GameDirectors},()=>result(true,NpcMenus.listMenus().map(x=>x.id).join(", ")||"No menus registered."));
 registry.registerCommand({name:"moneyz:npc_clear",description:"Clear all Moneyz services from the nearest NPC",permissionLevel:CommandPermissionLevel.GameDirectors},origin=>{const player=playerFrom(origin);if(!player)return result(false,"Player only.");system.run(()=>{const npc=NpcMenus.nearest(player);player.sendMessage(npc&&NpcServices.clear(npc)?"§aAll Moneyz NPC services cleared.":"§cNo NPC found within 6 blocks.");});return result(true,"NPC clear queued.");});
 registry.registerCommand({name:"moneyz:services",description:"List registered Moneyz service IDs",permissionLevel:CommandPermissionLevel.Any,cheatsRequired:false},()=>result(true,Services.list().map(x=>x.id).join(", ")||"No services registered."));
 registry.registerCommand({name:"moneyz:open",description:"Open a registered Moneyz service",permissionLevel:CommandPermissionLevel.Any,cheatsRequired:false,mandatoryParameters:[{type:CustomCommandParamType.String,name:"service"}]},(origin,serviceId)=>{const p=playerFrom(origin);if(!p)return result(false,"Player only.");if(!Services.exists(serviceId))return result(false,`Unknown service: ${serviceId}`);system.run(()=>Services.open(serviceId,p,{source:"command"}));return result(true,`Opening ${serviceId}.`);});
 registry.registerCommand({name:"moneyz:help",description:"Open Moneyz Help",permissionLevel:CommandPermissionLevel.Any,cheatsRequired:false},origin=>{const p=playerFrom(origin);if(!p)return result(false,"Player only.");system.run(()=>Services.open("moneyz:help",p,{source:"command"}));return result(true,"Opening Moneyz Help.");});
 registry.registerCommand({name:"moneyz:admin",description:"Open Moneyz Admin",permissionLevel:CommandPermissionLevel.Any,cheatsRequired:false},origin=>{const p=playerFrom(origin);if(!p)return result(false,"Player only.");system.run(()=>Services.open("moneyz:admin",p,{source:"command"}));return result(true,"Opening Moneyz Admin.");});
 registry.registerCommand({name:"moneyz:jobs",description:"Open Jobs / Employment",permissionLevel:CommandPermissionLevel.Any,cheatsRequired:false},origin=>{const p=playerFrom(origin);if(!p)return result(false,"Player only.");system.run(()=>Services.open("moneyz:jobs",p,{source:"command"}));return result(true,"Opening Jobs.");});
 registry.registerCommand({name:"moneyz:job",description:"Join a Moneyz job by ID",permissionLevel:CommandPermissionLevel.Any,cheatsRequired:false,mandatoryParameters:[{type:CustomCommandParamType.String,name:"job"}]},(origin,id)=>{const p=playerFrom(origin);if(!p)return result(false,"Player only.");const r=Jobs.join(p,id,{source:"command"});return result(r.ok,r.ok?`Joined ${r.job.name}.`:`Could not join: ${r.reason}`);});
 registry.registerCommand({name:"moneyz:job_quit",description:"Leave your current Moneyz job",permissionLevel:CommandPermissionLevel.Any,cheatsRequired:false},origin=>{const p=playerFrom(origin);if(!p)return result(false,"Player only.");const r=Jobs.leave(p,{source:"command"});return result(r.ok,r.ok?"Job left.":`Could not leave: ${r.reason}`);});
 registry.registerCommand({name:"moneyz:job_apply",description:"Get a job application permit",permissionLevel:CommandPermissionLevel.Any,cheatsRequired:false},origin=>{const p=playerFrom(origin);if(!p)return result(false,"Player only.");Jobs.grantApplication(p,{source:"command"});return result(true,"Application permit granted.");});
 registry.registerCommand({name:"moneyz:pay",description:"Run worker payroll (Banker)",permissionLevel:CommandPermissionLevel.Any,cheatsRequired:false},origin=>{const p=playerFrom(origin);if(!p)return result(false,"Player only.");const r=Jobs.runPayroll(p,{source:"command"});return result(r.ok,r.ok?`Payroll complete: ${r.count} worker(s), ${r.total} Moneyz.`:`Payroll unavailable: ${r.reason}`);});
 registry.registerCommand({name:"moneyz:realtor",description:"Open Real Estate services",permissionLevel:CommandPermissionLevel.Any,cheatsRequired:false},origin=>{const p=playerFrom(origin);if(!p)return result(false,"Player only.");system.run(()=>Services.open("moneyz:realtor",p,{source:"command"}));return result(true,"Opening Real Estate.");});
 registry.registerCommand({name:"moneyz:hotel",description:"Open Hotel services",permissionLevel:CommandPermissionLevel.Any,cheatsRequired:false},origin=>{const p=playerFrom(origin);if(!p)return result(false,"Player only.");system.run(()=>Services.open("moneyz:hotel",p,{source:"command"}));return result(true,"Opening Hotel Services.");});
 registry.registerCommand({name:"moneyz:pets",description:"Open configured pet products",permissionLevel:CommandPermissionLevel.Any,cheatsRequired:false},origin=>{const p=playerFrom(origin);if(!p)return result(false,"Player only.");system.run(()=>Services.open("moneyz:pets",p,{source:"command"}));return result(true,"Opening Pet Shop.");});
 registry.registerCommand({name:"moneyz:products",description:"Open products and services",permissionLevel:CommandPermissionLevel.Any,cheatsRequired:false},origin=>{const p=playerFrom(origin);if(!p)return result(false,"Player only.");system.run(()=>Services.open("moneyz:products",p,{source:"command"}));return result(true,"Opening Products.");});
 registry.registerCommand({name:"moneyz:setup",description:"Open Moneyz setup wizard",permissionLevel:CommandPermissionLevel.GameDirectors,cheatsRequired:false},origin=>{const p=playerFrom(origin);if(!p)return result(false,"Player only.");system.run(()=>Services.open("moneyz:admin/setup",p,{source:"command"}));return result(true,"Opening Setup Wizard.");});
 registry.registerCommand({name:"moneyz:api",description:"Show Moneyz public API version and capabilities",permissionLevel:CommandPermissionLevel.GameDirectors,cheatsRequired:false},()=>result(true,`Moneyz API ${Moneyz.apiVersion}: ${Object.entries(Moneyz.capabilities).filter(([,v])=>v).map(([k])=>k).join(", ")}`));
 registry.registerCommand({name:"moneyz:extensions",description:"List registered Moneyz extensions",permissionLevel:CommandPermissionLevel.GameDirectors,cheatsRequired:false},()=>result(true,Moneyz.extensions.list().map(x=>`${x.id}@${x.version}`).join(", ")||"No third-party extensions registered."));
 registry.registerCommand({name:"moneyz:test_rpc",description:"Developer RPC transport for Moneyz integration tests",permissionLevel:CommandPermissionLevel.Any,cheatsRequired:true,mandatoryParameters:[{type:CustomCommandParamType.String,name:"payload"}]},(_origin,payload)=>{
  try{
   const hex=String(payload??"");
   if(!hex||hex.length%2!==0||!/^[0-9a-f]+$/i.test(hex))return result(false,"Invalid RPC payload.");
   let json="";for(let i=0;i<hex.length;i+=2)json+=String.fromCharCode(parseInt(hex.slice(i,i+2),16));
   const data=JSON.parse(json);
   if(!data||typeof data!=="object")return result(false,"Invalid RPC request.");
   handleApiCommand(data);
   return result(true,"Moneyz RPC queued.");
  }catch(error){return result(false,`Moneyz RPC rejected: ${error}`);}
 });
 registry.registerCommand({name:"moneyz:test_rpc_player",description:"Developer RPC transport targeting a resolved player",permissionLevel:CommandPermissionLevel.Any,cheatsRequired:true,mandatoryParameters:[{type:CustomCommandParamType.PlayerSelector,name:"player"},{type:CustomCommandParamType.String,name:"payload"}]},(_origin,targets,payload)=>{
  try{
   const target=targets?.[0];
   if(!target)return result(false,"No test player resolved.");
   const hex=String(payload??"");
   if(!hex||hex.length%2!==0||!/^[0-9a-f]+$/i.test(hex))return result(false,"Invalid RPC payload.");
   let json="";for(let i=0;i<hex.length;i+=2)json+=String.fromCharCode(parseInt(hex.slice(i,i+2),16));
   const data=JSON.parse(json);
   if(!data||typeof data!=="object")return result(false,"Invalid RPC request.");
   handleApiCommand(data,target);
   return result(true,"Moneyz player RPC queued.");
  }catch(error){return result(false,`Moneyz player RPC rejected: ${error}`);}
 });
 registry.registerCommand({name:"moneyz:validate",description:"Validate the Moneyz runtime",permissionLevel:CommandPermissionLevel.Admin},()=>{const v=Moneyz.dev.validate(Moneyz);return result(v.ok,v.ok?`Moneyz API ${v.apiVersion} validated successfully.`:`Moneyz validation: ${v.issues.join("; ")}`);});

}
