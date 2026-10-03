import { system } from "@minecraft/server";
import { ActionFormData } from "../ui/forms.js";
import { luckyMenu } from "./lucky_menu.js";
import { testYourLuck } from "../games/randomNum.js";
import { start21Game } from "../games/21Game.js";
import { startCrapsGame } from "../games/diceGame.js";
import { startSlotsGame } from "../games/slotGame.js";
import { log, LOG_LEVELS } from "../logger.js";
import * as Config from "../core/config.js";
import * as Games from "../core/games.js";
let defaults=false;
function ensureDefaults(){if(defaults)return;defaults=true;const add=(id,name,play)=>{try{Games.register({id,name,category:"chance",play:async p=>{system.run(()=>play(p));return {ok:true,opened:true};}});}catch{}};add("moneyz:test_luck","Test Your Luck",testYourLuck);add("moneyz:blackjack","21 / Blackjack",start21Game);add("moneyz:craps","Dice / Craps",startCrapsGame);add("moneyz:slots","Slots",startSlotsGame);}
export function chanceMenu(player){if(!player)return;ensureDefaults();const chanceX=Config.get("chanceX","2"),rows=Games.list({category:"chance"});const form=new ActionFormData().title("§l§1Chance Games").body(`§l§oTake a chance!\nYou have a chance to win:\n§g§l${chanceX}x §ryour stake amount!`);for(const game of rows)form.button(`§d§l${game.name}`);form.button("§c§lBack").show(player).then(r=>{if(!r||r.canceled)return;if(r.selection===rows.length)return luckyMenu(player);const game=rows[r.selection];if(game)void Games.play(player,game.id,{source:"chance_menu"});}).catch(error=>log(`Error showing Chance Menu: ${error}`,LOG_LEVELS.ERROR));}
log("chance_menu.js loaded",LOG_LEVELS.DEBUG);
