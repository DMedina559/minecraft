import { world, system } from "@minecraft/server"
import { ActionFormData, ModalFormData } from "@minecraft/server-ui"

world.beforeEvents.itemUse.subscribe(data => {
    let player = data.source
    let title = "§l§1Moneyz Menu"
    if (data.itemStack.typeId == "zvortex:moneyz_menu") system.run(() => main(player))

    function main() {
        const form = new ActionFormData()
            form.title(title)
            form.body(`§l§o§fWelcome §g${player.nameTag}§f!\n§fMoneyz Balance: §g${getScore('Moneyz', player.nameTag)}`)
            if (player.hasTag('moneyzMenu')) {
               form.button('§d§lShops\n§r§7[ Click to Shop ]');
            }
            if (player.hasTag('moneyzMenu')) {
               form.button(`§d§lATM\n§r§7[ Click to Exchange ]`);
            }
            form.button(`§d§lSend Moneyz\n§r§7[ Click to Send Moneyz ]`)
            form.button(`§d§lHelp\n§r§7[ Click for Help ]`)
            form.button(`§d§lCredits\n§r§7[ Click to View ]`)
            form.button(`§4§lExit Menu`)

        form.show(player).then(r => {
            if (r.selection == 0) shops(player)
            if (r.selection == 1) {
                    player.runCommandAsync("dialogue open @s @s atm")
                }
            if (r.selection == 2) moneyzTransfer(player)
            if (r.selection == 3) {
                    player.runCommandAsync("dialogue open @s @s help")
                }
            if (r.selection == 4) Credits(player)
        })
    }

    function shops() {
        new ActionFormData()
            .title(title)
            .body(`§fMoneyz Balance: §g${getScore('Moneyz', player.nameTag)}`)
            .button("§o§dFarmer's Market\n§7[ Click to Shop ]")
            .button("§o§dLibrary\n§7[ Click to Shop ]")
            .button("§o§dPet Shop\n§7[ Click to Shop ]")
            .button("§o§dWorkshop\n§7[ Click to Shop ]")
            .button(`§l§cBack`)
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
    
    const getScore = (objective, target, useZero = true) => {
        try {
            const obj = world.scoreboard.getObjective(objective);
            if (typeof target == 'string') {
                return obj.getScore(obj.getParticipants().find(v => v.displayName == target));
            }
            return obj.getScore(target.scoreboard);
        } catch {
            return useZero ? 0 : NaN;
        }
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
                    return
                } if (textField.includes("-")) {
                    player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cNumbers Only!"}]}`)
                    return
                }
                if (getScore('Moneyz', player.nameTag) < textField) {
                    player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cYou Don't Have Enough Moneyz"}]}`);
                    return;
                } try {
                    player.runCommandAsync(`scoreboard players remove @s Moneyz ${textField}`)
                    player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§aSent §l${selectedPlayer.nameTag} §r§2${textField} Moneyz"}]}`)
                    selectedPlayer.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§l${player.nameTag} §r§aSent You §2${textField} Moneyz"}]}`);
                    selectedPlayer.runCommandAsync(`scoreboard players add @s Moneyz ${textField}`)
                } catch {
                    player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cNumbers Only!"}]}`)
                    return
                }
            }).catch((e) => {
                console.error(e, e.stack)
            });
    }


    function Credits() {
        new ActionFormData()
            .title(title)
            .body(`§l§o§6                Credits\n\n§5Creator:\n§dZVortex11325`)
            .button(`§l§cBack`)
            .show(player).then(r => {
                if (r.selection == 0) main(player)
            })
    }


})
