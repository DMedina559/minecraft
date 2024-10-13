import { world, system } from "@minecraft/server"
import { ActionFormData, ModalFormData } from "@minecraft/server-ui"

const getScore = (objective, target, useZero = true) => {
    try {
        const obj = world.scoreboard.getObjective(objective);
        if (typeof target === 'string') {
            return obj.getScore(obj.getParticipants().find(v => v.displayName === target));
        }
        return obj.getScore(target.scoreboard);
    } catch {
        return useZero ? 0 : NaN;
    }
};

world.beforeEvents.itemUse.subscribe(data => {
    let player = data.source
    let title = "§l§1Moneyz Menu"
    if (data.itemStack.typeId == "zvortex:moneyz_menu") system.run(() => main(player))

    function main() {
        console.log(`${player.nameTag} entered Moneyz Menu`)
        const form = new ActionFormData();
        form.title(title);
        form.body(`§l§o§fWelcome §g${player.nameTag}§f!\n§fMoneyz Balance: §g${getScore('Moneyz', player.nameTag)}`);
        const buttons = [];
        const actions = [];
        if (player.hasTag('moneyzShop')) {
            buttons.push('§d§lShops\n§r§7[ Click to Shop ]');
            actions.push(() => shops(player));
        }
        if (player.hasTag('moneyzATM')) {
            buttons.push('§d§lATM\n§r§7[ Click to Exchange ]');
            actions.push(() => player.runCommandAsync("dialogue open @s @s atm"));
        }
        if (player.hasTag('moneyzSend')) {
            buttons.push('§d§lSend Moneyz\n§r§7[ Click to Send Moneyz ]');
            actions.push(() => moneyzTransfer(player));
        }
        if (player.hasTag('moneyzAdmin')) {
            buttons.push('§d§lMoneyz Admin\n§r§7[ Click to Manage ]');
            actions.push(() => moneyzAdmin(player));
        }
        
        buttons.push('§d§lHelp\n§r§7[ Click for Help ]');
        actions.push(() => player.runCommandAsync("dialogue open @s @s help"));

        buttons.push('§d§lCredits\n§r§7[ Click to View ]');
        actions.push(() => Credits(player));
        
        buttons.push('§4§lExit Menu');
        actions.push(() => { /* exit action, no specific function needed */ });

        buttons.forEach(button => form.button(button));

        form.show(player).then(({ selection }) => {
            if (selection >= 0 && selection < actions.length) {
                actions[selection]();
            }
        });
    }

    function shops() {
        new ActionFormData()
            .title(title)
            .body(`§fMoneyz Balance: §g${getScore('Moneyz', player.nameTag)}`)
            .button("§d§lFarmer's Market\n§r§7[ Click to Shop ]")
            .button("§d§lLibrary\n§r§7[ Click to Shop ]")
            .button("§d§lPet Shop\n§r§7[ Click to Shop ]")
            .button("§d§lWorkshop\n§r§7[ Click to Shop ]")
            .button(`§4§lBack`)
            .show(player).then(r => {
                if (r.selection == 0) {
                    player.runCommandAsync("dialogue open @s @s farmers_market")
                }
                if (r.selection == 1) {
                    player.runCommandAsync("dialogue open @s @s library")
                }
                if (r.selection == 2) {
                    player.runCommandAsync("dialogue open @s @s petshop")
                }
                if (r.selection == 3) {
                    player.runCommandAsync("dialogue open @s @s workshop")
                }
                if (r.selection == 4) main(player)
            })
    }

    const moneyzTransfer = (player) => {
        const players = [...world.getPlayers()];
        new ModalFormData()
            .title(title)
            .dropdown('§o§f      Choose Who to Send Moneyz to!', players.map(player => player.nameTag))
            .textField(`§fEnter the Amount to Send!\n§fMoneyz Balance: §g${getScore('Moneyz', player.nameTag)}`, `§o                Numbers Only`)
            .show(player)
            .then(({ formValues: [dropdown, textField] }) => {
                const selectedPlayer = players[dropdown];

                if (selectedPlayer === player) {
                    player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cYou Can't Send Moneyz to Yourself"}]}`)
                    console.log(`${player.nameTag}  tried sending Moneyz to self`)
                    return
                } if (textField.includes("-")) {
                    player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cNumbers Only!"}]}`)
                    console.log(`${player.nameTag}  entered invalid numbers`)
                    return
                }
                if (getScore('Moneyz', player.nameTag) < textField) {
                    player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cYou Don't Have Enough Moneyz"}]}`);
                    console.log(`${player.nameTag}  didnt have enough Moneyz to send`)
                    return;
                } try {
                    player.runCommandAsync(`scoreboard players remove @s Moneyz ${textField}`)
                    player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§aSent §l${selectedPlayer.nameTag} §r§2${textField} Moneyz"}]}`)
                    selectedPlayer.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§l${player.nameTag} §r§aSent You §2${textField} Moneyz"}]}`);
                    selectedPlayer.runCommandAsync(`scoreboard players add @s Moneyz ${textField}`)
                    console.log(`${player.nameTag} sent ${textField} Moneyz to ${selectedPlayer.nameTag}`)
                } catch {
                    player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cNumbers Only!"}]}`)
                    console.log(`${player.nameTag}  entered invalid numbers`)
                    return
                }
            }).catch((e) => {
                console.error(e, e.stack)
            });
    }

    function moneyzAdmin() {
        const form = new ActionFormData()
            .title(title)
            .body(`§l§o§fMoneyz Admin Menu`)
            .button(`§d§lManage Tags\n§r§7[ Click to Manage ]`)
            .button(`§d§lManage Balances\n§r§7[ Click to Manage ]`)
            .button(`§d§lManage Auto Tags\n§r§7[ Click to Manage ]`)
            .button(`§4§lBack`);

        form.show(player).then(r => {
            if (r.selection === 0) tagManage(player);
            if (r.selection === 1) balanceManage(player);
            if (r.selection === 2) toggleAutoTags(player);
            if (r.selection === 3) main(player);
        });
    }

    function toggleAutoTags(player) {
        const options = ['moneyzShop', 'moneyzATM', 'moneyzSend'];
        const scores = options.map(tag => `${tag}: ${getScore('moneyzAutoTag', tag)}`);

        new ActionFormData()
            .title(title)
            .body(`§l§oToggle Auto Tags:\n${scores.join('\n')}`)
            .button('§d§lToggle moneyzShop')
            .button('§d§lToggle moneyzATM')
            .button('§d§lToggle moneyzSend')
            .button('§4§lBack')
            .show(player).then(({ selection }) => {
                if (selection >= 0 && selection < options.length) {
                    const selectedTag = options[selection];
                    const currentScore = getScore('moneyzAutoTag', selectedTag);
                    const newScore = currentScore === 0 ? 1 : 0; // Toggle between 0 and 1
                    player.runCommandAsync(`scoreboard players set ${selectedTag} moneyzAutoTag ${newScore}`);
                    player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§aToggled ${selectedTag} to ${newScore === 1 ? 'On' : 'Off'}."}]}`);
                    console.log(`Admin toggled ${selectedTag}`)
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
            .button('§d§lAdd Tag\n§r§7[ Click to Add ]')
            .button('§d§lRemove Tag\n§r§7[ Click to Remove ]')
            .button('§4§lBack')
            .show(player).then(r => {
                if (r.selection === 0) {
                    new ModalFormData()
                        .title(title)
                        .dropdown('§o§fChoose a Player to Add Tag', players.map(p => p.nameTag))
                        .textField('§fEnter Tag to Add:', '§oTag')
                        .show(player)
                        .then(({ formValues: [dropdown, textField] }) => {
                            const selectedPlayer = players[dropdown];
                            if (textField.trim() === "") {
                                player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cPlease enter a valid tag!"}]}`);
                                console.log(`Admin entered an invalid tag`)
                                return;
                            }
                            selectedPlayer.addTag(textField);
                            player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§aAdded tag §l${textField} §r§ato ${selectedPlayer.nameTag}."}]}`);
                            console.log(`Admin added ${textField} tag to ${selectedPlayer.nameTag}`)
                            tagManage(player);
                        });
                } else if (r.selection === 1) {
                    new ModalFormData()
                        .title(title)
                        .dropdown('§o§fChoose a Player to Remove Tag', players.map(p => p.nameTag))
                        .textField('§fEnter Tag to Remove:', '§oTag')
                        .show(player)
                        .then(({ formValues: [dropdown, textField] }) => {
                            const selectedPlayer = players[dropdown];
                            if (textField.trim() === "") {
                                player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cPlease enter a valid tag!"}]}`);
                                console.log(`Admin entered an invalid tag`)
                                return;
                            }
                            if (selectedPlayer.hasTag(textField)) {
                                selectedPlayer.removeTag(textField);
                                player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§aRemoved tag §l${textField} §r§afrom ${selectedPlayer.nameTag}."}]}`);
                                console.log(`Admin removed ${textField} tag to ${selectedPlayer.nameTag}`)
                            } else {
                                player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§c${selectedPlayer.nameTag} does not have the tag §l${textField}."}]}`);
                                console.log(`Admin tried to remove a tag that didnt exist from ${selectedPlayer.nameTag}`)
                            }
                            tagManage(player);
                        });
                } else {
                    moneyzAdmin(player);
                }
            });
    }

    function Credits() {
        new ActionFormData()
            .title(title)
            .body(`§l§o§6                Credits\n\n§5Creator:\n§dZVortex11325`)
            .button(`§4§lBack`)
            .show(player).then(r => {
                if (r.selection == 0) main(player)
            })
    }

})

console.warn('Moneyz Menu loaded')