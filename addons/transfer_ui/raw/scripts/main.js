import { world, system } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { transferPlayer } from "@minecraft/server-admin";

world.beforeEvents.itemUse.subscribe(data => {
    const player = data.source;
    if (data.itemStack.typeId == "minecraft:compass") system.run(() => showServerTransferMenu(player));
});

function showServerTransferMenu(player) {
    const form = new ModalFormData()
        .title("§l§fServer Transfer")
        .textField("§fEnter Server IP:", "e.g., 192.168.0.1")
        .textField("§fEnter Server Port:", "e.g., 19132");

    form.show(player).then((response) => {
        if (!response.canceled) {
            const [serverIp, serverPort] = response.formValues;

            if (!serverIp || !serverPort || isNaN(parseInt(serverPort))) {
                player.sendMessage("§cInvalid IP or Port. Please try again.");
                return;
            }

            try {
                // Using the TransferPlayerIpPortOptions interface for transferPlayer
                transferPlayer(player, { hostname: serverIp, port: parseInt(serverPort) });
                player.sendMessage(`§aSending to ${ serverIp }:${ serverPort } `);
                console.log(`Sending Player ${ player.name } to ${ serverIp }:${ parseInt(serverPort) } `);
            } catch (error) {
                player.sendMessage(`§cFailed to transfer: ${ error.message } `);
                console.error(`Error transferring player: ${ error } `);
            }
        }
    });
}

console.log("Transfer UI loaded!");