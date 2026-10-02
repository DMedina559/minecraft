import { system, Player, CommandPermissionLevel, CustomCommandParamType, CustomCommandStatus } from "@minecraft/server";
import * as Economy from "../core/economy.js";
import { reloadShops } from "../repositories/shops.js";
import { main } from "../gui/moneyz_menu.js";

function playerFrom(origin) { return origin.sourceEntity instanceof Player ? origin.sourceEntity : undefined; }
function result(ok, message) { return { status: ok ? CustomCommandStatus.Success : CustomCommandStatus.Failure, message }; }

export function registerCommands(registry) {
    registry.registerCommand({ name:"moneyz:menu", description:"Open the Moneyz menu", permissionLevel:CommandPermissionLevel.Any, cheatsRequired:false }, origin => {
        const p=playerFrom(origin); if(!p) return result(false,"Player only."); system.run(()=>main(p)); return result(true,"Opening Moneyz.");
    });
    registry.registerCommand({ name:"moneyz:balance", description:"Show a Moneyz balance", permissionLevel:CommandPermissionLevel.Any, cheatsRequired:false,
        optionalParameters:[{type:CustomCommandParamType.PlayerSelector,name:"player"}] }, (origin,args) => {
        const self=playerFrom(origin), target=args?.[0]?.[0] ?? self; if(!target) return result(false,"No player.");
        return result(true,`${target.nameTag}: ${Economy.getBalance(target)} Moneyz`);
    });
    for (const [name, op] of [["give","deposit"],["take","withdraw"],["set","setBalance"]]) {
        registry.registerCommand({ name:`moneyz:${name}`, description:`${name} Moneyz`, permissionLevel:CommandPermissionLevel.Admin,
            mandatoryParameters:[{type:CustomCommandParamType.PlayerSelector,name:"player"},{type:CustomCommandParamType.Integer,name:"amount"}] }, (origin,args) => {
            const target=args?.[0]?.[0], amount=args?.[1]; if(!target) return result(false,"No player.");
            system.run(()=>Economy[op](target,amount,{source:"custom_command",actor:playerFrom(origin)?.nameTag ?? "console"})); return result(true,"Moneyz update queued.");
        });
    }
    registry.registerCommand({ name:"moneyz:reload", description:"Reload Moneyz shop data", permissionLevel:CommandPermissionLevel.Admin }, () => {
        system.run(()=>reloadShops()); return result(true,"Moneyz reload queued.");
    });
}
