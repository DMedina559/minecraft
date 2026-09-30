import { world } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { getScore, updateScore } from "../utilities.js";
import { main } from "./moneyz_menu.js";
import { propertiesMenu } from "./properties_menu.js";
import { moneyzSettings } from "./settings.js";
import { showShopEditorMenu } from "./shop_editor.js";
import { log, LOG_LEVELS } from "../logger.js";

const TITLE = "§l§1Admin Menu";

export function moneyzAdmin(player) {
    if (!player) return;

    const form = new ActionFormData()
        .title(TITLE)
        .body("§l§o§fManage Various Moneyz Aspects Here")
        .button("§d§lManage Balances\n§r§7[ Click to Manage ]")
        .button("§d§lManage Properties\n§r§7[ Click to Manage ]")
        .button("§d§lManage Tags\n§r§7[ Click to Manage ]")
        .button("§d§lManage Shops\n§r§7[ Click to Edit ]")
        .button("§d§lSettings\n§r§7[ Click to Manage ]")
        .button("§c§lBack");

    form.show(player).then(r => {
        if (r.canceled) return;
        switch (r.selection) {
            case 0: balanceManage(player); break;
            case 1: propertiesMenu(player); break;
            case 2: tagManage(player); break;
            case 3: showShopEditorMenu(player); break;
            case 4: moneyzSettings(player); break;
            case 5: main(player); break;
        }
    }).catch(err => log(`Error in moneyzAdmin: ${err}`, LOG_LEVELS.ERROR));
}

function balanceManage(player) {
    const players = [...world.getPlayers()].map(p => ({ name: p.nameTag, player: p }));

    try {
        const playerBalances = players.map(p => `§f${p.name}: §g${getScore("Moneyz", p.player)}`);

        new ActionFormData()
            .title(TITLE)
            .body(`§l§oPlayers Moneyz Balances:\n${playerBalances.join("\n")}`)
            .button("§d§lManage Player Balances\n§r§7[ Click to Manage ]")
            .button("§c§lBack")
            .show(player)
            .then(r => {
                if (!r || r.canceled) return;

                if (r.selection === 0) {
                    new ModalFormData()
                        .title(TITLE)
                        .dropdown("§o§fChoose a Player to Manage", players.map(p => p.name))
                        .textField("§fEnter the Amount to Adjust:\n", "§oNumbers Only")
                        .show(player)
                        .then(({ formValues, canceled }) => {
                            if (canceled || !formValues) return;

                            const [dropdownIndex, textField] = formValues;
                            const selectedPlayer = players[dropdownIndex]?.player;
                            if (!selectedPlayer) return;

                            const amount = parseInt(textField, 10);
                            if (isNaN(amount) || amount < 0) {
                                try { player.playSound("note.bass"); } catch {}
                                player.sendMessage("§cPlease enter a valid positive number!");
                                return;
                            }

                            new ActionFormData()
                                .title(TITLE)
                                .body(`§l§oManage ${selectedPlayer.nameTag}'s Moneyz`)
                                .button("§d§lAdd Moneyz")
                                .button("§d§lSet Moneyz")
                                .button("§d§lRemove Moneyz")
                                .button("§c§lCancel")
                                .show(player)
                                .then(({ selection, canceled: actionCanceled }) => {
                                    if (actionCanceled || selection === undefined || selection === 3) return;

                                    try { player.playSound("random.levelup"); } catch {}
                                    if (selection === 0) {
                                        updateScore(selectedPlayer, amount, "add");
                                        player.sendMessage(`§aAdded §l${amount} §r§ato ${selectedPlayer.nameTag}'s Moneyz.`);
                                    } else if (selection === 1) {
                                        updateScore(selectedPlayer, amount, "set");
                                        player.sendMessage(`§aSet ${selectedPlayer.nameTag}'s Moneyz to §l${amount}.`);
                                    } else if (selection === 2) {
                                        updateScore(selectedPlayer, amount, "remove");
                                        player.sendMessage(`§aRemoved §l${amount} §r§afrom ${selectedPlayer.nameTag}'s Moneyz.`);
                                    }
                                });
                        });
                } else {
                    moneyzAdmin(player);
                }
            });
    } catch (error) {
        log(`Error retrieving balances: ${error}`, LOG_LEVELS.ERROR);
        player.sendMessage("§cError retrieving player balances.");
    }
}

async function tagManage(player) {
    const players = [...world.getPlayers()];
    const playerTagsList = players.map(p => `${p.nameTag}: §g${p.getTags().join(", ") || "No Tags"}`).join("\n");

    new ActionFormData()
        .title(TITLE)
        .body(`§l§oPlayers Tags:\n${playerTagsList}`)
        .button("§d§lManage Tags\n§r§7[ Add or Remove ]")
        .button("§c§lBack")
        .show(player)
        .then(r => {
            if (!r || r.canceled) return;

            if (r.selection === 0) {
                new ModalFormData()
                    .title(TITLE)
                    .dropdown("§o§fChoose a Player", players.map(p => p.nameTag))
                    .show(player)
                    .then(({ formValues, canceled }) => {
                        if (canceled || !formValues) return;

                        const selectedPlayer = players[formValues[0]];
                        if (!selectedPlayer) return;

                        new ModalFormData()
                            .title(`§lManage Tags for ${selectedPlayer.nameTag}`)
                            .dropdown("§o§fAction", ["Add Tag", "Remove Tag"])
                            .textField("§fEnter Tag:", "§oTag")
                            .show(player)
                            .then(({ formValues: actionValues, canceled: actionCanceled }) => {
                                if (actionCanceled || !actionValues) return;

                                const [actionIndex, tag] = actionValues;
                                const trimmedTag = String(tag || "").trim();

                                if (!trimmedTag) {
                                    player.sendMessage("§cPlease enter a valid tag!");
                                    return;
                                }

                                if (actionIndex === 0) {
                                    selectedPlayer.addTag(trimmedTag);
                                    player.sendMessage(`§aAdded tag §l${trimmedTag} §r§ato ${selectedPlayer.nameTag}.`);
                                } else if (actionIndex === 1) {
                                    if (selectedPlayer.hasTag(trimmedTag)) {
                                        selectedPlayer.removeTag(trimmedTag);
                                        player.sendMessage(`§aRemoved tag §l${trimmedTag} §r§afrom ${selectedPlayer.nameTag}.`);
                                    } else {
                                        player.sendMessage(`§c${selectedPlayer.nameTag} does not have the tag §l${trimmedTag}.`);
                                    }
                                }
                                tagManage(player);
                            });
                    });
            } else {
                moneyzAdmin(player);
            }
        });
}

log("admin_menu.js loaded", LOG_LEVELS.DEBUG);
