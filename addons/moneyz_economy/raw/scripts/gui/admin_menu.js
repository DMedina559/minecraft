import { world, system } from "@minecraft/server"
import { ActionFormData, ModalFormData } from "@minecraft/server-ui"
import { getScore, updateScore, getCurrentUTCDate } from '../utilities.js';
import { main } from './moneyz_menu.js';
import { propertiesMenu } from './properties_menu.js';
import { moneyzSettings } from './settings.js';
import { log, LOG_LEVELS } from '../logger.js';

const title = "§l§1Admin Menu";

export function moneyzAdmin(player) {
    log(`Player ${player.nameTag} opened the Moneyz Admin Menu.`, LOG_LEVELS.DEBUG);
    const form = new ActionFormData()
        .title(title)
        .body(`§l§o§fManage Various Moneyz Aspects Here`)
        .button(`§d§lManage Balances\n§r§7[ Click to Manage ]`)
        .button(`§d§lManage Properties\n§r§7[ Click to Manage ]`)
        .button(`§d§lManage Tags\n§r§7[ Click to Manage ]`)
        .button(`§d§lSettings\n§r§7[ Click to Manage ]`)
        .button(`§4§lBack`);

    form.show(player).then(r => {
        if (r.selection === 0) balanceManage(player);
        if (r.selection === 1) propertiesMenu(player);
        if (r.selection === 2) tagManage(player);
        if (r.selection === 3) moneyzSettings(player);
        if (r.selection === 4) main(player);
    });
};

async function balanceManage(player) {
    log(`Player ${player.nameTag} opened the Balance Manage Menu.`, LOG_LEVELS.DEBUG);

    const players = [...world.getPlayers()].map(p => ({ name: p.nameTag, player: p }));

    try {
        const playerBalances = await Promise.all(players.map(async (p) => {
            const balance = await getScore('Moneyz', p.player);
            return `§f${p.name}: §g${balance}`;
        }));

        new ActionFormData()
            .title(title)
            .body(`§l§oPlayers Moneyz Balances:\n${playerBalances.join('\n')}`)
            .button('§d§lManage Player Balances\n§r§7[ Click to Manage ]')
            .button('§4§lBack')
            .show(player)
            .then(r => {
                if (!r || r.selection === undefined) {
                    log("Balance Manage Menu (main) closed.", LOG_LEVELS.INFO, player.nameTag);
                    return;
                }

                if (r.selection === 0) {
                    new ModalFormData()
                        .title(title)
                        .dropdown('§o§fChoose a Player to Manage', players.map(p => p.name))
                        .textField('§fEnter the Amount to Adjust:\n', '§oNumbers Only')
                        .show(player)
                        .then(({ formValues }) => {
                            if (!formValues || formValues.length !== 2 || formValues.some(val => val === undefined)) {
                                log("Balance Manage Menu (player select) closed or invalid input.", LOG_LEVELS.INFO, player.nameTag);
                                return;
                            }

                            const [dropdownIndex, textField] = formValues;

                            const selectedPlayer = players[dropdownIndex]?.player;
                            if (!selectedPlayer) {
                                log("Invalid player selected from dropdown.", LOG_LEVELS.WARN, player.nameTag);
                                return;
                            }

                            const amount = parseInt(textField);

                            if (isNaN(amount) || amount < 0) {
                                player.runCommandAsync(`playsound note.bassattack @s ~ ~ ~`);
                                player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cPlease enter a valid positive number!"}]}`);
                                log(`Player ${player.nameTag} entered an invalid amount for balance adjustment.`, LOG_LEVELS.WARN);
                                return;
                            }

                            new ActionFormData()
                                .title(title)
                                .body(`§l§oManage ${selectedPlayer.nameTag}'s Moneyz`)
                                .button('§d§lAdd Moneyz')
                                .button('§d§lSet Moneyz')
                                .button('§d§lRemove Moneyz')
                                .button('§4§lCancel')
                                .show(player)
                                .then(({ selection }) => {
                                    if (selection === undefined) {
                                        log("Balance Manage Menu (action select) closed.", LOG_LEVELS.INFO, player.nameTag);
                                        return;
                                    }
                                    if (selection === 0) {
                                        player.runCommandAsync(`playsound random.levelup @s ~ ~ ~`);
                                        updateScore(selectedPlayer, amount, "add");
                                        player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§aAdded §l${amount} §r§ato ${selectedPlayer.nameTag}'s Moneyz."}]}`);
                                        log(`Player ${player.nameTag} added ${amount} Moneyz to ${selectedPlayer.nameTag}.`, LOG_LEVELS.INFO);
                                    } else if (selection === 1) {
                                        player.runCommandAsync(`playsound random.levelup @s ~ ~ ~`);
                                        updateScore(selectedPlayer, amount, "set");
                                        player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§aSet ${selectedPlayer.nameTag}'s Moneyz to §l${amount}."}]}`);
                                        log(`Player ${player.nameTag} set ${selectedPlayer.nameTag}'s Moneyz to ${amount}.`, LOG_LEVELS.INFO);
                                    } else if (selection === 2) {
                                        player.runCommandAsync(`playsound random.levelup @s ~ ~ ~`);
                                        updateScore(selectedPlayer, amount, "remove");
                                        player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§aRemoved §l${amount} §r§afrom ${selectedPlayer.nameTag}'s Moneyz."}]}`);
                                        log(`Player ${player.nameTag} removed ${amount} Moneyz from ${selectedPlayer.nameTag}.`, LOG_LEVELS.INFO);
                                    }
                                })
                                .catch(err => {
                                    log(`Error in ActionFormData (action select): ${err}`, LOG_LEVELS.ERROR, err.stack);
                                });

                        })
                        .catch(err => {
                            log(`Error in ModalFormData (player select): ${err}`, LOG_LEVELS.ERROR, err.stack);
                        });
                } else {
                    moneyzAdmin(player);
                }
            })
            .catch(err => {
                log(`Error in ActionFormData (main menu): ${err}`, LOG_LEVELS.ERROR, err.stack);
            });
    } catch (error) {
        log(`Error retrieving balances: ${error}`, LOG_LEVELS.ERROR, error.stack);
        player.sendMessage("§cError retrieving player balances. Check logs.");
    }
}

async function tagManage(player) {
    log(`Player ${player.nameTag} opened the Tag Manage Menu.`, LOG_LEVELS.DEBUG);
    const players = [...world.getPlayers()];
    const playerTagsList = players.map(p => `${p.nameTag}: §g${p.getTags().join(', ') || 'No Tags'}`).join('\n');

    new ActionFormData()
        .title(title)
        .body(`§l§oPlayers Tags:\n${playerTagsList}`)
        .button('§d§lManage Tags\n§r§7[ Add or Remove ]')
        .button('§4§lBack')
        .show(player)
        .then(r => {
            if (!r || r.selection === undefined) {
                log("Tag Manage Menu (main) closed.", LOG_LEVELS.INFO, player.nameTag);
                return;
            }

            if (r.selection === 0) {
                new ModalFormData()
                    .title(title)
                    .dropdown('§o§fChoose a Player', players.map(p => p.nameTag))
                    .show(player)
                    .then(({ formValues }) => {
                        if (!formValues || formValues[0] === undefined) {
                            log("Tag Manage Menu (player select) closed or no player selected.", LOG_LEVELS.INFO, player.nameTag);
                            return;
                        }

                        const playerIndex = formValues[0];
                        const selectedPlayer = players[playerIndex];

                        if (!selectedPlayer) {
                            log("Invalid player index.", LOG_LEVELS.WARN, player.nameTag);
                            return;
                        }

                        new ModalFormData()
                            .title(`§lManage Tags for ${selectedPlayer.nameTag}`)
                            .dropdown('§o§fAction', ['Add Tag', 'Remove Tag'])
                            .textField('§fEnter Tag:', '§oTag')
                            .show(player)
                            .then(({ formValues }) => {
                                if (!formValues || formValues.some(val => val === undefined)) {
                                    log("Tag Manage Menu (tag action) closed or incomplete input.", LOG_LEVELS.INFO, player.nameTag);
                                    return;
                                }

                                const [actionIndex, tag] = formValues;
                                const trimmedTag = tag.trim();

                                if (trimmedTag === "") {
                                    player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cPlease enter a valid tag!"}]}`);
                                    log(`Player ${player.nameTag} entered an invalid tag.`, LOG_LEVELS.WARN);
                                    return;
                                }

                                if (actionIndex === 0) {
                                    selectedPlayer.addTag(trimmedTag);
                                    player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§aAdded tag §l${trimmedTag} §r§ato ${selectedPlayer.nameTag}."}]}`);
                                    log(`Player ${player.nameTag} added tag ${trimmedTag} to ${selectedPlayer.nameTag}.`, LOG_LEVELS.INFO);
                                } else if (actionIndex === 1) {
                                    if (selectedPlayer.hasTag(trimmedTag)) {
                                        selectedPlayer.removeTag(trimmedTag);
                                        player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§aRemoved tag §l${trimmedTag} §r§afrom ${selectedPlayer.nameTag}."}]}`);
                                        log(`Player ${player.nameTag} removed tag ${trimmedTag} from ${selectedPlayer.nameTag}.`, LOG_LEVELS.INFO);
                                    } else {
                                        player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§c${selectedPlayer.nameTag} does not have the tag §l${trimmedTag}."}]}`);
                                        log(`Player ${player.nameTag} tried to remove a non-existent tag ${trimmedTag} from ${selectedPlayer.nameTag}.`, LOG_LEVELS.WARN);
                                    }
                                }

                                tagManage(player);
                            })
                            .catch(err => {
                                log(`Error in ModalFormData (tag action): ${err}`, LOG_LEVELS.ERROR, err.stack);
                            });
                    })
                    .catch(err => {
                        log(`Error in ModalFormData (player select): ${err}`, LOG_LEVELS.ERROR, err.stack);
                    });
            } else {
                moneyzAdmin(player);
            }
        })
        .catch(err => {
            log(`Error in ActionFormData (main menu): ${err}`, LOG_LEVELS.ERROR, err.stack);
        });
}

log('admin_menu.js loaded', LOG_LEVELS.DEBUG);