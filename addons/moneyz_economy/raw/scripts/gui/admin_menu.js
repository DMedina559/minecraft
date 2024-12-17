import { world, system } from "@minecraft/server"
import { ActionFormData, ModalFormData } from "@minecraft/server-ui"
import { getScore, getCurrentUTCDate } from '../utilities.js';
import { main } from './moneyz_menu.js';
import { propertiesMenu } from './properties_menu.js';

const title = "§l§1Admin Menu";

export function moneyzAdmin(player) {
    const form = new ActionFormData()
        .title(title)
        .body(`§l§o§fManage Various Moneyz Aspects Here`)
        .button(`§d§lManage Tags\n§r§7[ Click to Manage ]`)
        .button(`§d§lManage Balances\n§r§7[ Click to Manage ]`)
        .button(`§d§lManage Auto Tags\n§r§7[ Click to Manage ]`)
        .button(`§d§lManage Properties\n§r§7[ Click to Manage ]`)
        .button(`§4§lBack`);

    form.show(player).then(r => {
        if (r.selection === 0) tagManage(player);
        if (r.selection === 1) balanceManage(player);
        if (r.selection === 2) toggleAutoTags(player);
        if (r.selection === 3) propertiesMenu(player);
        if (r.selection === 4) main(player);
    });
}

function toggleAutoTags(player) {
    const options = ['moneyzShop', 'moneyzATM', 'moneyzSend', 'moneyzLucky', 'moneyzDaily', 'oneLuckyPurchase', 'syncPlayers'];
    const scores = options.map(tag => `${tag}: ${world.getDynamicProperty(tag)}`);

    new ActionFormData()
        .title("Toggle Auto Tags")
        .body(`§l§oToggle Auto Tags:\n${scores.join('\n')}`)
        .button('§d§lToggle moneyzShop')
        .button('§d§lToggle moneyzATM')
        .button('§d§lToggle moneyzSend')
        .button('§d§lToggle moneyzLucky')
        .button('§d§lToggle moneyzDaily')
        .button('§d§lToggle oneLuckyPurchase')
        .button('§d§lToggle syncPlayers')
        .button('§4§lBack')
        .show(player).then(({ selection }) => {
            if (selection >= 0 && selection < options.length) {
                const selectedTag = options[selection];
                const currentValue = world.getDynamicProperty(selectedTag);
                const newValue = currentValue === true ? false : true;

                world.setDynamicProperty(selectedTag, newValue);

                player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§aToggled ${selectedTag} to ${newValue === true ? 'On' : 'Off'}."}]}`);
                toggleAutoTags(player);
                console.log(`Admin toggled ${selectedTag} to ${newValue === true ? 'On' : 'Off'}`);
            } else {
                moneyzAdmin(player);
            }
        });
}

function balanceManage(player) {
    const players = [...world.getPlayers()].map(p => {
        return p.nameTag;
    });

    new ActionFormData()
        .title(title)
        .body(`§l§oPlayers Moneyz Balances:\n${players.map(p => `§f${p}: §g${getScore('Moneyz', p)}`).join('\n')}`)
        .button('§d§lManage Player Balances\n§r§7[ Click to Manage ]')
        .button('§4§lBack')
        .show(player).then(r => {
            if (r.selection === 0) {
                new ModalFormData()
                    .title(title)
                    .dropdown('§o§fChoose a Player to Manage', players)
                    .textField('§fEnter the Amount to Adjust:\n', '§oNumbers Only')
                    .show(player)
                    .then(({ formValues: [dropdown, textField] }) => {
                        const selectedPlayer = players[dropdown];
                        const amount = parseInt(textField);
                        if (isNaN(amount) || amount < 0) {
                            player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cPlease enter a valid number!"}]}`);
                            console.log(`Admin entered an invalid Number`)
                            return;
                        }
                        new ActionFormData()
                            .title(title)
                            .body(`§l§oManage ${selectedPlayer}'s Moneyz`)
                            .button('§d§lAdd Moneyz')
                            .button('§d§lSet Moneyz')
                            .button('§d§lRemove Moneyz')
                            .button('§4§lCancel')
                            .show(player).then(({ selection }) => {
                                if (selection === 0) {
                                    player.runCommandAsync(`scoreboard players add ${selectedPlayer} Moneyz ${amount}`);
                                    player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§aAdded §l${amount} §r§ato ${selectedPlayer}'s Moneyz."}]}`);
                                    console.log(`Admin added ${amount} Moneyz to ${selectedPlayer} balance`)
                                } else if (selection === 1) {
                                    player.runCommandAsync(`scoreboard players set ${selectedPlayer} Moneyz ${amount}`);
                                    player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§aSet ${selectedPlayer}'s Moneyz to §l${amount}."}]}`);
                                    console.log(`Admin set ${selectedPlayer} balance to ${amount} Moneyz`)
                                } else if (selection === 2) {
                                    player.runCommandAsync(`scoreboard players remove ${selectedPlayer} Moneyz ${amount}`);
                                    player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§aRemoved §l${amount} §r§afrom ${selectedPlayer}'s Moneyz."}]}`);
                                    console.log(`Admin removed ${amount} Moneyz from ${selectedPlayer} balance`)
                                }
                            });
                    });
            } else {
                main(player);
            }
        });
}

function tagManage(player) {
    const players = [...world.getPlayers()];

    const playerTagsList = players.map(p => `${p.nameTag}: §g${p.getTags().join(', ') || 'No Tags'}`).join('\n');

    new ActionFormData()
        .title(title)
        .body(`§l§oPlayers Tags:\n${playerTagsList}`)
        .button('§d§lManage Tags\n§r§7[ Add or Remove ]')
        .button('§4§lBack')
        .show(player).then(r => {
            if (r.selection === 0) {
                new ModalFormData()
                    .title(title)
                    .dropdown('§o§fChoose a Player', players.map(p => p.nameTag))
                    .show(player)
                    .then(({ formValues: [playerIndex] }) => {

                        const selectedPlayer = players[playerIndex];
                        const tags = selectedPlayer.getTags().join(', ') || 'No Tags';

                        new ModalFormData()
                            .title(`§lManage ${selectedPlayer.nameTag}'s Tags`)
                            .dropdown('§o§fAction', ['Add Tag', 'Remove Tag'])
                            .textField('§fEnter Tag:', '§oTag')
                            .show(player)
                            .then(({ formValues: [currentTags, actionIndex, tag] }) => { 

                                const trimmedTag = tag.trim();

                                if (trimmedTag === "") {
                                    player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cPlease enter a valid tag!"}]}`);
                                    console.log(`Admin entered an invalid tag`);
                                    tagManage(player);
                                    return;
                                }

                                if (actionIndex === 0) {
                                    selectedPlayer.addTag(trimmedTag);
                                    player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§aAdded tag §l${trimmedTag} §r§ato ${selectedPlayer.nameTag}."}]}`);
                                    console.log(`Admin added ${trimmedTag} tag to ${selectedPlayer.nameTag}`);
                                } else if (actionIndex === 1) {
                                    if (selectedPlayer.hasTag(trimmedTag)) {
                                        selectedPlayer.removeTag(trimmedTag);
                                        player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§aRemoved tag §l${trimmedTag} §r§afrom ${selectedPlayer.nameTag}."}]}`);
                                        console.log(`Admin removed ${trimmedTag} tag from ${selectedPlayer.nameTag}`);
                                    } else {
                                        player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§c${selectedPlayer.nameTag} does not have the tag §l${trimmedTag}."}]}`);
                                        console.log(`Admin tried to remove a tag that didn't exist from ${selectedPlayer.nameTag}`);
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


console.info('admin_menu.js loaded')
