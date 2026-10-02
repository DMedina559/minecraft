import { system, Player, CommandPermissionLevel, CustomCommandParamType, CustomCommandStatus } from "@minecraft/server";
import * as Economy from "../core/economy.js";
import * as Transactions from "../core/transactions.js";
import { reloadShops } from "../repositories/shops.js";
import { formatHealth } from "../core/health.js";
import { runMigrations } from "../core/migrations.js";
import { main } from "../gui/moneyz_menu.js";
const playerFrom=o=>o.sourceEntity instanceof Player?o.sourceEntity:undefined;
const result=(ok,message)=>({status:ok?CustomCommandStatus.Success:CustomCommandStatus.Failure,message});
export function registerCommands(registry){
 registry.registerCommand({name:"moneyz:menu",description:"Open the Moneyz menu",permissionLevel:CommandPermissionLevel.Any,cheatsRequired:false},origin=>{const p=playerFrom(origin);if(!p)return result(false,"Player only.");system.run(()=>main(p));return result(true,"Opening Moneyz.");});
 registry.registerCommand({name:"moneyz:balance",description:"Show a Moneyz balance",permissionLevel:CommandPermissionLevel.Any,cheatsRequired:false,optionalParameters:[{type:CustomCommandParamType.PlayerSelector,name:"player"}]},(origin,args)=>{const self=playerFrom(origin),target=args?.[0]?.[0]??self;if(!target)return result(false,"No player.");return result(true,`${target.nameTag}: ${Economy.getBalance(target)} Moneyz`);});
 for(const [name,op] of [["give","deposit"],["take","withdraw"],["set","setBalance"]])registry.registerCommand({name:`moneyz:${name}`,description:`${name} Moneyz`,permissionLevel:CommandPermissionLevel.Admin,mandatoryParameters:[{type:CustomCommandParamType.PlayerSelector,name:"player"},{type:CustomCommandParamType.Integer,name:"amount"}]},(origin,args)=>{const target=args?.[0]?.[0],amount=args?.[1];if(!target)return result(false,"No player.");const actor=playerFrom(origin)??"console";system.run(()=>Economy[op](target,amount,{type:"admin_adjustment",source:"custom_command",actor}));return result(true,"Moneyz update queued.");});
 registry.registerCommand({name:"moneyz:reload",description:"Reload Moneyz shop data",permissionLevel:CommandPermissionLevel.Admin},()=>{system.run(()=>reloadShops());return result(true,"Moneyz reload queued.");});
 registry.registerCommand({name:"moneyz:health",description:"Show Moneyz diagnostics",permissionLevel:CommandPermissionLevel.Admin},()=>result(true,formatHealth()));
 registry.registerCommand({name:"moneyz:migrate",description:"Run Moneyz schema migrations",permissionLevel:CommandPermissionLevel.Admin},()=>{system.run(()=>runMigrations());return result(true,"Moneyz migration queued.");});
 registry.registerCommand({name:"moneyz:transactions",description:"Show recent Moneyz transactions",permissionLevel:CommandPermissionLevel.Admin,optionalParameters:[{type:CustomCommandParamType.Integer,name:"count"}]},(_origin,args)=>{const n=Math.min(10,Math.max(1,Number(args?.[0]??5)));const text=Transactions.recent(n).map(t=>`${t.id} ${t.type} ${t.amount} ${t.from??""}${t.to?` -> ${t.to}`:""}`).join(" | ")||"No transactions.";return result(true,text);});
}
