import { system } from "@minecraft/server";
import { CustomForm } from "@minecraft/server-ui";
const nav=(f,fn)=>{try{if(f.isShowing())f.close();}catch{}system.run(fn);};
const pages={
 "Getting Started":"Moneyz uses the Moneyz scoreboard for player balances. Use the Moneyz Menu item, a configured NPC service, or /moneyz:open to access features. World owners can configure shops and NPC services entirely in-game.",
 "Shops":"Shop Engine v3 uses live Script API listings instead of generated buy/sell functions. Shops can contain runtime-registered items/blocks, editable prices, buy/sell bundle sizes, and unlimited or tracked stock.",
 "NPC Services":"Admins can open Moneyz Admin → Manage NPC Services. An NPC can open one specific shop, several selected shops, ATM, Send Moneyz, Help, Quests, games, or administrative services. NPC names and dialogue commands are not required.",
 "ATM & Sending":"ATM exchanges configured resources and Moneyz through native Script API. Send Moneyz transfers directly between online players. Both are reusable services for menus, NPCs, commands, ScriptEvents, and integrations.",
 "Rewards & Quests":"Daily Rewards, Quests, Lucky Purchase and Chance Games are available as standalone Moneyz services and can be assigned individually to NPCs.",
 "Administration":"Moneyz Admin manages balances, properties, tags, dynamic shops, NPC services, settings, transactions and diagnostics. Administrative services always re-check Moneyz admin permission when opened.",
 "Commands":"Use /moneyz:services to list service IDs and /moneyz:open <service> to open one. Use /moneyz:npc <service> to assign a service to a nearby NPC, /moneyz:npc_shop <shopId> for a specific shop, and /moneyz:shops to list shop IDs.",
 "Legacy Compatibility":"Legacy dialogues/functions remain in the pack for existing worlds, but modern Moneyz features use Script API services and Shop Engine v3. Existing NPC menu/shop bindings remain readable during migration.",
 "Public API":"Integrations can use Moneyz.services, Moneyz.shops, Moneyz.commerce, Moneyz.npcServices and the rest of the Moneyz SDK. Service IDs and extension IDs should be namespaced."
};
export function openHelp(player){const form=new CustomForm(player,"§l§1Moneyz Help");form.header("Moneyz Help").label("§7Choose a topic. This help reflects the current Script API architecture.");for(const title of Object.keys(pages))form.button(title,()=>nav(form,()=>helpPage(player,title)));form.closeButton().show();}
function helpPage(player,title){const form=new CustomForm(player,`Help • ${title}`);form.label(pages[title]??"").button("Back",()=>nav(form,()=>openHelp(player))).closeButton().show();}
