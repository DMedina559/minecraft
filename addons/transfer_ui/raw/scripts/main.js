import { world, system } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { transferPlayer } from "@minecraft/server-admin";

world.beforeEvents.itemUse.subscribe(data => {
    const player = data.source;
    // Check if the item used is a compass
    if (data.itemStack.typeId === "minecraft:compass") {
        // Run the form display on the next tick to ensure UI elements are ready
        system.run(() => showServerTransferMenu(player));
    }
});

/**
 * Displays a server transfer menu to the player, allowing them to choose between
 * IP/Port or NetherNet ID for server connection.
 * @param {import("@minecraft/server").Player} player The player to show the form to.
 */
function showServerTransferMenu(player) {
    const form = new ModalFormData()
        .title("§l§fServer Transfer") // Title of the form
        // Toggle to switch between NetherNet and IP/Port input
        .toggle("§fTransfer using NetherNet ID?", { defaultValue: false })
        // Text field for either IP, Hostname, or NetherNet ID
        .textField(
            "§fEnter Server IP (or NetherNet ID):",
            "e.g., 192.168.0.1 or my-nether-net-id",
            { placeholderText: "e.g., 192.168.0.1 or my-nether-net-id" }
        )
        // Text field for Server Port (only if using IP/Port)
        .textField(
            "§fEnter Server Port (if using IP/Port):",
            "e.g., 19132",
            { placeholderText: "e.g., 19132" }
        );

    // Show the form to the player and handle their response
    form.show(player).then((response) => {
        // If the form was not canceled by the player
        if (!response.canceled) {
            // Destructure the form values. The order matches the order of form elements.
            const [useNetherNet, input1, input2] = response.formValues;

            if (useNetherNet) {
                // Handle NetherNet transfer
                const netherNetId = input1;
                if (!netherNetId) {
                    player.sendMessage("§cPlease enter a NetherNet ID.");
                    return;
                }

                try {
                    // Attempt to transfer the player using NetherNet ID
                    transferPlayer(player, { netherNetId: netherNetId });
                    player.sendMessage(`§aSending to NetherNet ID: ${ netherNetId } `);
                    console.log(`Sending Player ${ player.name } to NetherNet ID: ${ netherNetId } `);
                } catch (error) {
                    player.sendMessage(`§cFailed to transfer via NetherNet: ${ error.message } `);
                    console.error(`Error transferring player via NetherNet: `, error);
                }
            } else {
                // Handle IP/Port transfer
                const serverIp = input1;
                const serverPort = parseInt(input2); // Convert port to integer

                // Validate inputs for IP/Port transfer
                if (!serverIp || isNaN(serverPort)) {
                    player.sendMessage("§cInvalid IP or Port. Please try again.");
                    return;
                }

                try {
                    // Attempt to transfer the player using IP and Port
                    transferPlayer(player, { hostname: serverIp, port: serverPort });
                    player.sendMessage(`§aSending to ${ serverIp }:${ serverPort } `);
                    console.log(`Sending Player ${ player.name } to ${ serverIp }:${ serverPort } `);
                } catch (error) {
                    player.sendMessage(`§cFailed to transfer: ${ error.message } `);
                    console.error(`Error transferring player: `, error);
                }
            }
        }
    });
}

// Log a message to the console when the script loads
console.log("Transfer UI loaded!");