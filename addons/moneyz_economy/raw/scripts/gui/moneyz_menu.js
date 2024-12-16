import { world, system } from "@minecraft/server"
import { ActionFormData, ModalFormData } from "@minecraft/server-ui"

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
        if (player.hasTag("moneyzLucky")) {
        buttons.push('§d§lFeeling Lucky?\n§r§7[ Click to Access ]');
        actions.push(() => luckyPurchase(player));
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
            .button("§d§lArmory\n§r§7[ Click to Shop ]")
            .button("§d§lCrafters's Market\n§r§7[ Click to Shop ]")
            .button("§d§lFarmer's Market\n§r§7[ Click to Shop ]")
            .button("§d§lLibrary\n§r§7[ Click to Shop ]")
            .button("§d§lPet Shop\n§r§7[ Click to Shop ]")
            .button("§d§lWorkshop\n§r§7[ Click to Shop ]")
            .button(`§4§lBack`)
            .show(player).then(r => {
                if (r.selection == 0) {
                    player.runCommandAsync("dialogue open @s @s armory")
                }
                if (r.selection == 1) {
                    player.runCommandAsync("dialogue open @s @s craftershop")
                }
                if (r.selection == 2) {
                    player.runCommandAsync("dialogue open @s @s farmers_market")
                }
                if (r.selection == 3) {
                    player.runCommandAsync("dialogue open @s @s library")
                }
                if (r.selection == 4) {
                    player.runCommandAsync("dialogue open @s @s petshop")
                }
                if (r.selection == 5) {
                    player.runCommandAsync("dialogue open @s @s workshop")
                }
                if (r.selection == 6) main(player)
            })
    }

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

    function luckyPurchase(player) {    
        function getCurrentUTCDate() {
            const date = new Date();
            return `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1).toString().padStart(2, '0')}-${date.getUTCDate().toString().padStart(2, '0')}`;
        }
        
        function canAccessLuckyMenu(player) {
            const lastAccessDate = player.getDynamicProperty("lastLuckyPurchase");

            if (!lastAccessDate) {
                return true;
            }
            const currentDate = getCurrentUTCDate();
            if (lastAccessDate !== currentDate) {
                return true;
            }
            return false; 
        }

        if (canAccessLuckyMenu(player)) {
            player.setDynamicProperty("lastLuckyPurchase", getCurrentUTCDate());

            const shops = ["armory", "craftershop", "farmers_market", "library", "petshop", "workshop"];

            new ActionFormData()
                .title("§l§1Lucky Purchase Menu")
                .body("§l§o§fChoose a shop to make a lucky purchase!")
                .button("§d§lArmory\n§r§7[ Feeling Lucky? ]")
                .button("§d§lCrafter's Market\n§r§7[ Feeling Lucky? ]")
                .button("§d§lFarmer's Market\n§r§7[ Feeling Lucky? ]")
                .button("§d§lLibrary\n§r§7[ Feeling Lucky? ]")
                .button("§d§lPet Shop\n§r§7[ Feeling Lucky? ]")
                .button("§d§lWorkshop\n§r§7[ Feeling Lucky? ]")
                .button("§4§lBack")
                .show(player).then(r => {
                    if (r.selection === 0) player.runCommandAsync("function armory/lucky");
                    if (r.selection === 1) player.runCommandAsync("function craftershop/lucky");
                    if (r.selection === 2) player.runCommandAsync("function farmers_market/lucky");
                    if (r.selection === 3) player.runCommandAsync("function library/lucky");
                    if (r.selection === 4) player.runCommandAsync("function petshop/lucky");
                    if (r.selection === 5) player.runCommandAsync("function workshop/lucky");
                    if (r.selection === 6) main(player);
                });
        } else {
            new ActionFormData()
                .title("§l§cLucky Purchase Restricted")
                .body("§cYou have already made your Lucky Purchase today.\n§7Try again tomorrow!")
                .button("§4§lBack")
                .show(player);
        }
    }

    function moneyzAdmin() {
        const form = new ActionFormData()
            .title(title)
            .body(`§l§o§fMoneyz Admin Menu`)
            .button(`§d§lManage Tags\n§r§7[ Click to Manage ]`)
            .button(`§d§lManage Balances\n§r§7[ Click to Manage ]`)
            .button(`§d§lManage Auto Tags\n§r§7[ Click to Manage ]`)
            .button(`§d§lManage Player Properties\n§r§7[ Click to Manage ]`)
            .button(`§d§lManage World Properties\n§r§7[ Click to Manage ]`)
            .button(`§4§lBack`);

        form.show(player).then(r => {
            if (r.selection === 0) tagManage(player);
            if (r.selection === 1) balanceManage(player);
            if (r.selection === 2) toggleAutoTags(player);
            if (r.selection === 3) playerPropertiesMenu();
            if (r.selection === 4) worldPropertiesMenu(player);
            if (r.selection === 5) main(player);
        });
    }

    function toggleAutoTags(player) {
        const options = ['moneyzShop', 'moneyzATM', 'moneyzSend', 'moneyzLucky'];
        const scores = options.map(tag => `${tag}: ${getScore('moneyzAutoTag', tag)}`);

        new ActionFormData()
            .title(title)
            .body(`§l§oToggle Auto Tags:\n${scores.join('\n')}`)
            .button('§d§lToggle moneyzShop')
            .button('§d§lToggle moneyzATM')
            .button('§d§lToggle moneyzSend')
            .button('§d§lToggle moneyzLucky')
            .button('§4§lBack')
            .show(player).then(({ selection }) => {
                if (selection >= 0 && selection < options.length) {
                    const selectedTag = options[selection];
                    const currentScore = getScore('moneyzAutoTag', selectedTag);
                    const newScore = currentScore === 0 ? 1 : 0;
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

    function playerPropertiesMenu() {
        const players = [...world.getPlayers()].map(p => p.nameTag);

        new ModalFormData()
            .title("§l§fView or Modify Dynamic Properties")
            .dropdown("§oChoose a Player", players)
            .show(player)
            .then(({ formValues: [dropdown] }) => {
                const selectedPlayer = players[dropdown];
                const player = world.getPlayers().find(p => p.nameTag === selectedPlayer);

                if (!player) {
                    player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cPlayer not found!"}]}`);
                    return;
                }

                new ActionFormData()
                    .title(`§l§f${selectedPlayer} Dynamic Properties`)
                    .body("§oWhat would you like to do?")
                    .button("§d§lView Properties\n§r§7[ View ]")
                    .button("§d§lModify Properties\n§r§7[ Modify ]")
                    .button("§4§lBack")
                    .show(player).then(r => {
                        if (r.selection === 0) viewPlayerProperties(player, selectedPlayer);
                        if (r.selection === 1) modifyPlayerProperties(player, selectedPlayer);
                        if (r.selection === 2) moneyzAdmin(player);
                    });
            });
    }

    function viewPlayerProperties(player, selectedPlayer) {
        const targetPlayer = world.getPlayers().find(p => p.nameTag === selectedPlayer);
        
        if (!targetPlayer) {
            player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cPlayer not found!"}]}`);
            return;
        }

        const dynamicPropertyIds = targetPlayer.getDynamicPropertyIds();
        let propertyList = "§l§oDynamic Properties:\n\n";
        let foundProperties = false;

        dynamicPropertyIds.forEach(property => {
            const value = targetPlayer.getDynamicProperty(property);
            if (value !== undefined) {
                foundProperties = true;
                propertyList += `§f${property}: §7${value}\n`;
            }
        });

        if (!foundProperties) {
            propertyList += "§cNo properties found.\n";
        }

        new ActionFormData()
            .title(`§l§f${selectedPlayer} Properties`)
            .body(propertyList)
            .button("§4§lBack")
            .show(player)
            .then(r => {
                if (r.selection === 0) moneyzAdmin(player);
            });
    }

    function modifyPlayerProperties(player, selectedPlayer) {
        new ModalFormData()
            .title(`§l§fModify ${selectedPlayer} Properties`)
            .textField("§fEnter Property Key:", "§oProperty Key")
            .textField("§fEnter Property Value:", "§oProperty Value")
            .show(player)
            .then(({ formValues: [keyField, valueField] }) => {
                const targetPlayer = world.getPlayers().find(p => p.nameTag === selectedPlayer);
                if (!targetPlayer) {
                    player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cPlayer not found!"}]}`);
                    return;
                }

                if (keyField.trim() === "" || valueField.trim() === "") {
                    player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cBoth key and value must be provided!"}]}`);
                    return;
                }

                targetPlayer.setDynamicProperty(keyField, valueField);
                player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§aDynamic property ${keyField} has been set to ${valueField} for ${selectedPlayer}."}]}`);
                console.log(`Admin set dynamic property ${keyField} to ${valueField} for ${selectedPlayer}`);
            }).catch(error => {
                console.error("Error with ModalFormData:", error);
            });
    }

    function worldPropertiesMenu(player) {
        const worldProperties = world.getDynamicPropertyIds();

        let propertiesList = "§l§oWorld Properties:\n\n";
        if (worldProperties.length === 0) {
            propertiesList += "§cNo world properties found.";
        } else {
            worldProperties.forEach(property => {
                const value = world.getDynamicProperty(property);
                if (value === undefined) {
                    propertiesList += `§f${property}: §cundefined\n`;
                } else {
                    propertiesList += `§f${property}: §7${value}\n`;
                }
            });
        }

        new ActionFormData()
            .title("§l§1World Properties Menu")
            .body(propertiesList)
            .button("§d§lModify Properties\n§r§7[ Modify World Properties ]")
            .button("§d§lClear Properties\n§r§7[ Clear World Properties ]")
            .button("§4§lBack")
            .show(player)
            .then(r => {
                if (r.selection === 0) modifyWorldProperties(player);
                if (r.selection === 1) clearAllWorldProperties(player);
                if (r.selection === 2) moneyzAdmin(player);
            });
    }

    function modifyWorldProperties(player) {
        new ModalFormData()
            .title("§l§fModify World Properties")
            .textField("§fEnter Property Key:", "§oProperty Key")
            .textField("§fEnter Property Value:", "§oProperty Value")
            .show(player)
            .then(({ formValues: [keyField, valueField] }) => {
                if (keyField.trim() === "" || valueField.trim() === "") {
                    player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cBoth key and value must be provided!"}]}`);
                    return;
                }

                world.setDynamicProperty(keyField, valueField);
                player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§aWorld property ${keyField} has been set to ${valueField}."}]}`);
            }).catch(error => {
                console.error("Error with ModalFormData:", error);
            });
    }

    function clearAllWorldProperties(player) {
        world.clearDynamicProperties();
        player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§aAll dynamic properties have been cleared successfully!"}]}`);
        console.log("All dynamic properties cleared by", player.nameTag);
    }

    function Credits() {
        new ActionFormData()
            .title(title)
            .body(`§l§o§6                Credits\n\n§5Creator:\n§dZVortex11325\n§5Link:\n§dlinktr.ee/dmedina559`)
            .button(`§4§lBack`)
            .show(player).then(r => {
                if (r.selection == 0) main(player)
            })
    }

})

console.info('moneyz_menu.js loaded')