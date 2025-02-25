# Scripts

- [Bedrock Server Manager](#bedrock-server-manager)
- [Moneyz Economy Function Creator](#moneyz-economy-function-creator)

## Bedrock Server Manager

Bedrock Server Manager is a comprehensive python script designed for installing, managing, and maintaining Minecraft Bedrock Dedicated Servers with ease. The script is Linux and Windows compatable.

### Features

Install New Servers: Quickly set up a server with customizable options like version (LATEST, PREVIEW, or specific versions).

Update Existing Servers: Seamlessly download and update server files while preserving critical configuration files and backups.

Backup Management: Automatically backup worlds and configuration files, with pruning for older backups.

Server Configuration: Easily modify server properties, and allow-list interactively.

Auto-Update supported: Automatically update the server with a simple restart.

Command-Line Tools: Send game commands (Linux only), start, stop, and restart servers directly from the command line.

Interactive Menu: Access a user-friendly interface to manage servers without manually typing commands.

Install/Update Content: Easily import .mcworld/.mcpack files into your server.

Automate Various Server Task: Quickly create cron task to automate task such as backup-server or restart-server (Linux only).

View Resource Usage: View how much CPU and RAM your server is using.

### Prerequisites

This script requires Python 3.10 or later. You also need to install the following Python packages:

*   colorama
*   requests
*   psutil

On Linux, you'll also need:

*  screen
*  systemd


### Usage

#### Download the script:

Download the script to your desired folder

```
curl -o /path/to/your/directory/bedrock-server-manager.py https://raw.githubusercontent.com/DMedina559/minecraft/main/scripts/bedrock-server-manager.py # Downloads the script to the path you choose

chmod +x /path/to/your/directory/bedrock-server-manager.py # Makes the script executable IMPORTANT (Linux only)
```
Its recommened to download the server to a folder just for the minecraft servers

For example:

`/home/user/minecraft-servers/`

The script will create `./server`,`./backups`,`./.downloads` `./.config`  `./content/worlds`, and `./content/addons` folders in its current folder. This is where servers will be installed to and where the script will look when managing various server aspects.

#### Run the script:

```
python bedrock-server-manager.py <command> [options]
```

##### Available commands:

<sub>When interacting with the script, server_name is the name of the servers folder (the name you chose durring the first step of instalation)</sub>

| Command             | Description                                       | Arguments                                                                                                     | Platform      |
|----------------------|---------------------------------------------------|---------------------------------------------------------------------------------------------------------------|---------------|
| **main**        | Open Bedrock Server Manager menu                  | None                                                                                                          | All           |
| **list-servers**     | List all servers and their statuses               | `-l, --loop`: Continuously list servers (optional)                                                          | All           |
| **get-status**       | Get the status of a specific server               | `-s, --server`: Server name (required)                                                                       | All           |
| **update-script**    | Update the script                                 | None                                                                                                          | All           |
| **configure-allowlist** | Configure the allowlist for a server            | `-s, --server`: Server name (required)                                                                       | All           |
| **configure-permissions**| Configure permissions for a server             | `-s, --server`: Server name (required)                                                                       | All           |
| **configure-properties**| Configure individual server.properties           | `-s, --server`: Server name (required) <br> `-p, --property`: Name of the property to modify (required) <br> `-v, --value`: New value for the property (required) | All           |
| **install-server**   | Install a new server                              | None                                                                                                          | All           |
| **update-server**    | Update an existing server                         | `-s, --server`: Server name (required) <br> `-v, --version`: Server version to install (optional, default: LATEST) | All           |
| **start-server**     | Start a server                                    | `-s, --server`: Server Name (required)                                                                      | All           |
| **stop-server**      | Stop a server                                     | `-s, --server`: Server Name (required)                                                                      | All           |
| **install-world**    | Install a world from a .mcworld file             | `-s, --server`: Server name (required) <br> `-f, --file`: Path to the .mcworld file (optional)             | All           |
| **install-addon**    | Install an addon (.mcaddon or .mcpack)          | `-s, --server`: Server name (required) <br> `-f, --file`: Path to the .mcaddon or .mcpack file (optional) | All           |
| **restart-server**   | Restart a server                                  | `-s, --server`: Server name (required)                                                                       | All           |
| **delete-server**    | Delete a server                                   | `-s, --server`: Server name (required)                                                                       | All           |
| **backup-server**    | Backup server files                               | `-s, --server`: Server name (required) <br> `-t, --type`: Backup type (required) <br> `-f, --file`: Specific file to backup (optional, for config type) <br> `--no-stop`: Don't stop the server before backup (optional, flag) | All           |
| **backup-all**       | Restores all newest files (world and configuration files). | `-s, --server`: Server Name (required) <br> `--no-stop`: Don't stop the server before restore (optional, flag) | All           |
| **restore-server**   | Restore server files from backup                  | `-s, --server`: Server name (required) <br> `-f, --file`: Path to the backup file (required) <br> `-t, --type`: Restore type (required) <br> `--no-stop`: Don't stop the server before restore (optional, flag) | All           |
| **restore-all**      | Restores all newest files (world and configuration files). | `-s, --server`: Server Name (required) <br> `--no-stop`: Don't stop the server before restore (optional, flag) | All           |
| **create-service**   | Enable/Disable Auto-Update, Reconfigures Systemd file on Linux                         | `-s, --server`: Server name (required)                                                                       | All     |
| **scan-players**     | Scan server logs for player data                  | None                                                                                                          | All           |
| **monitor-usage**    | Monitor server resource usage                     | `-s, --server`: Server name (required)                                                                       | All           |
| **add-players**      | Manually add player:xuid to players.json        | `-p, --players`: `<player1:xuid> <player2:xuid> ...` (required, nargs='+')                                   | All           |
| **manage-log-files** | Manages log files                                 | `--log-dir`: The directory containing the log files. (optional, default: LOG_DIR) <br> `--max-files`: The maximum number of log files to keep. (optional, default: 10) <br> `--max-size-mb`: The maximum total size of log files in MB. (optional, default: 15) | All           |
| **prune-old-backups**| Prunes old backups                                | `-s, --server`: Server Name (required) <br> `-f, --file-name`: Specific file name to prune (optional) <br> `-k, --keep`: How many backups to keep (optional) | All           |
| **manage-script-config**| Manages the script's configuration file         | `-k, --key`: The configuration key to read or write. (required) <br> `-o, --operation`: read or write (required, choices: ["read", "write"]) <br> `-v, --value`: The value to write (optional, required for 'write') | All           |
| **manage-server-config**| Manages individual server configuration files    | `-s, --server`: Server Name (required) <br> `-k, --key`: The configuration key to read or write. (required) <br> `-o, --operation`: read or write (required, choices: ["read", "write"]) <br> `-v, --value`: The value to write (optional, required for 'write') | All           |
| **get-installed-version**| Gets the installed version of a server          | `-s, --server`: Server Name (required)                                                                      | All           |
| **check-server-status**| Checks the server status by reading server_output.txt | `-s, --server`: Server Name (required)                                                                      | All           |
| **get-server-status-from-config**| Gets the server status from the server's config.json | `-s, --server`: Server name (required)                                                                       | All           |
| **update-server-status-in-config**| Updates the server status in the server's config.json | `-s, --server`: Server name (required)                                                                       | All           |
| **get-world-name**   | Gets the world name from the server.properties     | `-s, --server`: Server name (required)                                                                       | All           |
| **check-internet**   | Checks for internet connectivity                    | None                                                                                                          | All           |
| **get-service-status-from-config**| Gets the server status from the server's config.json | `-s, --server`: Server name (required)                                                                       | All           |


## Linux-Specific Commands

| Command             | Description                                       | Arguments                                                                                                     |
|----------------------|---------------------------------------------------|---------------------------------------------------------------------------------------------------------------|
| **systemd-start**    | systemd start command (Linux only)                | `-s, --server`: Server name (required)                                                                       | Linux only    |
| **systemd-stop**     | systemd stop command (Linux only)                 | `-s, --server`: Server name (required)                                                                       | Linux only    |
| **attach-console**   | Attach to the server console (Linux only)         | `-s, --server`: Server Name (required)                                                                      | Linux only    |
| **check-service-exists**| Checks if a systemd service file exists (Linux only)| `-s, --server`: Server name (required)                                                                       | Linux only    |
| **enable-service**   | Enables a systemd service(Linux only)             | `-s, --server`: Server name (required)                                                                       | Linux only    |
| **disable-service**  | Disables a systemd service (Linux only)            | `-s, --server`: Server name (required)                                                                       | Linux only    |
| **send-command**     | Sends a command to the server (Linux only)        | `-s, --server`: Server name (required) <br> `-c, --command`: Command to send (required)                        | Linux only    |


## Windows-Specific Commands

| Command             | Description                                       | Arguments                                                               |
|----------------------|---------------------------------------------------|-------------------------------------------------------------------------|
| **windows-stop**     | Stop a server (Windows only)                      | `-s, --server`: Server name (required)                                |
| **windows-start**    | Start a server (Windows only)                     | `-s, --server`: Server name (required)                                |

###### Examples:

Open Main Menu:

```
python /path/to/script/bedrock-server-manager.py main
```

Send Command:
```
python /path/to/script/bedrock-server-manager.py send-command --server server_name --command "tell @a hello"
```

Update Server:

```
python /path/to/script/bedrock-server-manager.py update-server --server server_name
```


### Install Content:

With the bedrock-server-manager.sh script you can easily import .mcworld and .mcpack files into your server. The script will look in `./content/worlds` and `./content/addons` respectively. 

For .mcworlds the script will scan the server.properties files for the `level-name` and extract the file to that folder.

For .mcpacks the script will extract them to a tmp folder and scan the manifest.json, looking for the pack type, name, version, and uuid. The script will then move the pack to it respective world folder (resource_packs, or behaviour_packs) with the name+verison used as the folder name, and the script will update the `world_behavior_packs.json` and `world_resource_packs.json` as needed with the packs uuid and version.
### Optional:


#### LINUX:
For convenient access from any directory, you can create a symbolic link to the bedrock-server-manager.py script in a directory within your $PATH.

1. Find your $PATH:

```
echo $PATH
```

This will output a list of directories, similar to:

```
/home/USER/bin:/usr/local/bin:/usr/bin:/bin:/usr/local/games:/usr/games
```

2. Create the symbolic link:

```
sudo ln -s /path/to/script/bedrock-server-manager.py /path/in/your/$PATH/bedrock-server-manager
```

Replace `/path/to/script/bedrock-server-manager.py` with the actual path to your script and `/path/in/your/$PATH` with one of the directories from your `$PATH` (e.g., `/home/USER/bin`).

After creating a symlink you can just use the below command without having to cd or specify the script directory

```
bedrock-server-manager <command>
```

### Tested on these systems:
- Debian 12 (bookworm)
- Ubuntu 24.04
- Windows 11 24H2
- WSL2

### Platform Differences:
- Windows suppport has the following limitations such as:
 - No send-command support
 - No attach to console support
 - Doesn't auto restart if crashed

If any of the above limitatoins are a roadblock for you, you might want to look into Windows Subsystem Linux (wsl)

## Moneyz Economy Function Creator

Moneyz Economy Function Creator is bash script used to quickly create basic Moneyz Economy buy/sell function files for the Moneyz Economy Behavior Pack. 

Automatically create functions in bulk with a ./items.txt

# License

These scripts are provided for personal, non-commercial use only. Redistribution or modification requires prior written permission.