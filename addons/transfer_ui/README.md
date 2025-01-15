# Transfer UI

The Transfer UI Behavior Pack allows players to transfer to other Minecraft Bedrock servers using an in-game menu. Players can access the transfer menu by using a compass and input the desired server IP address and port. Upon confirmation, they are seamlessly transferred to the specified server. This behavior pack is for dedicated servers on the LAN network.

## Features
- Players interact with a compass to open the transfer menu.
- Simple and user-friendly interface for entering server IP and port.
- Designed for dedicated server environments.

### Ideal for PlayStation/Xbox:
- `Minecraft Bedrock` for `Playstation` and `Xbox` are able to join custom servers that are on the same LAN. 
This means if you're able to run a `dedicated server`, your console can join a world with this pack installed and you can join any custom server you wish as long as you have the server `IP` and `PORT`.

## Requirements:

### - Dedicated Server:

The Transfer UI Behavior Pack must be installed on a Bedrock Dedicated Server.
The `@minecraft/server-admin` module is only available on dedicated servers.

#### Install Dedicated Server:

You have a few options to install the dedicated server:

- Direct Download:

You can download the server from Mojang directly with the following link: https://www.minecraft.net/en-us/download/server/bedrock

This is the simplest method, but does not include any auto update/backup functions.

- Docker:

If you have experience with docker you can run this container: https://github.com/itzg/docker-minecraft-bedrock-server

This method supports auto updates/backups, but requires external software to install (docker) and does require you to be familiarized with managing docker containers

- Ubuntu/Debian Script:

You can download/run this script from an Ubuntu shell to install the dedicated server: https://github.com/TheRemote/MinecraftBedrockServer

This method also supports auto updates/backups, but only supports Ubuntu/Debian distributions.

##### If you are unable to install the dedicated server you might be interested in these mobile apps that achieve the same function:

- https://bedrocktogether.net/

- https://bedrockconnect.app/

### - Beta API Experiment:

The behavior pack requires a world with the `Beta APIs` experiment to be enabled.
This experiment is required for the `@minecraft/server-admin` module on the dedicated server.

## Instructions:

### Step 1: Create/Load a World
- Use the Minecraft Client to create the world (or import an already made world).
- Enable the `Beta APIs` experiment in the world settings.
- Add the Transfer UI Behavior Pack to the world.
- Load the world to make sure all settings/packs are applied.
- Save & Quit then copy the world folder to dedicated server world folder.

### Step 2: Deploy the World to the Server

- Update the `server.properties` file to point to your world folder.

### Step 3: Enable Module Permissions

- Create a subfolder in the `config` directory of the `dedicated server` using the behavior pack's script module `UUID` (`21261991-a854-4f99-9720-f495978a06b7`).
- Create a new file named `permissions.json` within the subfolder to allow access to the `@minecraft/server-admin` module:

/server/config/21261991-a854-4f99-9720-f495978a06b7/permissions.json:

```
{
  "allowed_modules": [
    "@minecraft/server",
    "@minecraft/server-ui",
    "@minecraft/server-admin"
  ]
}
```
### Step 4: Run the Server

- Start the Bedrock Dedicated Server and ensure everything loads correctly by checking the server logs.
You should see this message `[Scripting] Transfer UI loaded!` and no errors related to any modules or `@minecraft/server-admin`

Join the server and obtain a `Compass` item. If everything is installed correctly you should be able to use item to open the menu.
  
Now you should be able to use a compass item to open the Transfer UI. Here you can enter the server IP and Port you wish to join.

## References:

### `@minecraft/server-admin`:

https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server-admin/minecraft-server-admin?view=minecraft-bedrock-experimental#transferplayer

### Dedicated Server:

#### Server Config:

- https://learn.microsoft.com/en-us/minecraft/creator/documents/scriptingservers?view=minecraft-bedrock-experimental#the-bedrock-dedicated-server-configuration-system

#### Module Permisions:

- https://learn.microsoft.com/en-us/minecraft/creator/documents/scriptingservers?view=minecraft-bedrock-experimental#enable-differentiated-module-permissions