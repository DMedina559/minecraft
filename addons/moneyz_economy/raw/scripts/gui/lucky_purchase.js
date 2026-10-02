import { world } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { getCurrentUTCDate, runCommand } from "../utilities.js";
import * as Economy from "../core/economy.js";
import { luckyMenu } from "./lucky_menu.js";
import { log, LOG_LEVELS } from "../logger.js";
import { giveLootTable } from "../services/rewards.js";
import * as Config from "../core/config.js";

export async function luckyPurchase(player, isNpcInteraction) {
    if (!player) return;

    function canAccessLuckyMenu() {
        const lastAccessDate = player.getDynamicProperty("lastLuckyPurchase");
        const currentDate = getCurrentUTCDate();
        const oneLuckyPurchaseEnabled = Config.get("oneLuckyPurchase");
        return oneLuckyPurchaseEnabled !== "true" || !lastAccessDate || lastAccessDate !== currentDate;
    }

    if (canAccessLuckyMenu()) {
        new ActionFormData()
            .title("§l§1Lucky Purchase")
            .body("§l§o§fMake a Lucky Purchase for 150 Moneyz!")
            .button("§a§lMake Purchase")
            .button("§c§lBack")
            .show(player).then(async r => {
                if (!r || r.canceled) return;

                if (r.selection === 0) {
                    const currentDate = getCurrentUTCDate();
                    const oneLuckyPurchaseEnabled = Config.get("oneLuckyPurchase");
                    const money = Economy.getBalance(player);

                    if (money >= 150) {
                        try { player.playSound("random.levelup"); } catch {}
                        player.sendMessage("§aYou made a Lucky Purchase!");

                        try {
                            const playerName = player.nameTag || player.name;
                            if (!await giveLootTable(player, "lucky_purchase")) {
                                await runCommand(player, `execute as "${playerName.replace(/"/g, '\\"')}" at @s run loot spawn ~ ~ ~ loot "lucky_purchase"`);
                            }
                        } catch (err) {
                            log(`Loot spawn command failed: ${err}`, LOG_LEVELS.WARN);
                        }

                        Economy.withdraw(player, 150, { source: "lucky_purchase" });

                        if (oneLuckyPurchaseEnabled === "true") {
                            player.setDynamicProperty("lastLuckyPurchase", currentDate);
                        }
                    } else {
                        try { player.playSound("note.bass"); } catch {}
                        player.sendMessage(`§cYou need 150 Moneyz for this purchase\n§6You have ${money} Moneyz`);
                    }
                } else if (r.selection === 1 && !isNpcInteraction) {
                    luckyMenu(player);
                }
            }).catch(err => {
                log(`Error in luckyPurchase form: ${err}`, LOG_LEVELS.ERROR);
            });
    } else {
        new ActionFormData()
            .title("§l§cLucky Purchase Restricted")
            .body("§cYou have already made your Lucky Purchase today.\n§7Try again tomorrow!")
            .button("§c§lBack")
            .show(player);
    }
}

log("lucky_purchase.js loaded", LOG_LEVELS.DEBUG);
