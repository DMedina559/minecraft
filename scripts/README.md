# Scripts

- [Bedrock Server Manager](#bedrock-server-manager)
- [Moneyz Economy Function Creator](#moneyz-economy-function-creator)

## Bedrock Server Manager

Bedrock Server Manager is a comprehensive Bash script designed for installing, managing, and maintaining Minecraft Bedrock Dedicated Servers with ease.

### Features

Install New Servers: Quickly set up a server with customizable options like version (LATEST, PREVIEW, or specific versions).

Update Existing Servers: Seamlessly download and update server files while preserving critical configuration files and backups.

Backup Management: Automatically backup worlds and configuration files, with pruning for older backups.

Server Configuration: Easily modify server properties, and allow-list interactively.

Systemd Integration: Automatically generate and manage systemd service files for streamlined server control.

Command-Line Tools: Send game commands, start, stop, and restart servers directly from the command line.

Interactive Menu: Access a user-friendly interface to manage servers without manually typing commands.

Install/Update Content: Easily import .mcworld/.mcpack files into your server.

Automate Various Server Task: Quickly create cron task to automate task such as backup-server or restart-server.

View Resource Usage: View how much CPU and RAM your server is using.

### Prerequisites

The script ensures the installation of required dependencies:

`curl, jq, unzip, systemd, screen`

Users need `sudo` permissions for installing these packages for the first time, and for enabling the optional `loginctl enable-linger` command. 

The script assumes your installation has `sudo` installed for these two instances.

#### Install wget if its not already:

```
sudo apt update
sudo apt install wget
```


### Usage

#### Download the script:

Download the script to your desired folder

```
wget -P /path/to/your/directory https://raw.githubusercontent.com/DMedina559/minecraft/main/scripts/bedrock-server-manager.sh # Downloads the script to the path you choose

chmod +x /path/to/your/directory/bedrock-server-manager.sh # Makes the script executable IMPORTANT
```
Its recommened to download the server to a folder just for the minecraft servers

For example:

`/home/user/minecraft-servers/`

The script will create `./bedrock_server_manager`, `./content/worlds`, and `./content/addons` folders in its current folder. This is where servers will be installed to and where the script will look when managing various server aspects.

#### Run the script:

```
bash /path/to/script/bedrock-server-manager.sh <command>
```

##### Available commands:

<sub>When interacting with the script, server_name is the name of the servers folder (the name you chose durring the first step of instalation)</sub>

```
  main           -- Open the main menu
  
  send-command   -- Send a command to a running server
    --server <server_name>    Specify the server name
    --command <command>       The command to send to the server (must be in "quotations")

  update-server  -- Update a server to a specified version
    --server <server_name>    Specify the server name

  backup-server  -- Back up the server's worlds
    --server <server_name>    Specify the server name

  start-server   -- Start the server
    --server <server_name>    Specify the server name

  stop-server    -- Stop the server
    --server <server_name>    Specify the server name

  restart-server -- Restart the server
    --server <server_name>    Specify the server name

  enable-server  -- Enable server autostart
    --server <server_name>    Specify the server name
 
  disable-server -- Disable server autostart
    --server <server_name>    Specify the server name

  update-script -- Redownload script from github
      
```

###### Examples:

Open Main Menu:

```
bash /path/to/script/bedrock-server-manager.sh main
```

Send Command:
```
bash /path/to/script/bedrock-server-manager.sh send-command --server server_name --command "tell @a hello"
```

Update Server:

```
bash /path/to/script/bedrock-server-manager.sh update-server --server server_name
```


### Install Content:

With the bedrock-server-manager.sh script you can easily import .mcworld and .mcpack files into your server. The script will look in `./content/worlds` and `./content/addons` respectively. 

For .mcworlds the script will scan the server.properties files for the `level-name` and extract the file to that folder.

For .mcpacks the script will extract them to a tmp folder and scan the manifest.json, looking for the pack type, name, version, and uuid. The script will then move the pack to it respective world folder (resource_packs, or behaviour_packs) with the name+verison used as the folder name, and the script will update the `world_resource_packs.json` and `world_resource_packs.json` as needed with the packs uuid and version.
### Optional:

For convenient access from any directory, you can create a symbolic link to the bedrock-server-manager.sh script in a directory within your $PATH.

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
sudo ln -s /path/to/script/bedrock-server-manager.sh /path/in/your/$PATH/bedrock-server-manager
```

Replace /path/to/script/bedrock-server-manager.sh with the actual path to your script and /path/in/your/$PATH with one of the directories from your $PATH (e.g., /home/USER/bin).

After creating a symlink you can just use the below command without having to cd or specify the script directory

```
bedrock-server-manager <command>
```

### Disclaimer:

This script has only been tested on the following linux distros:

- Debian

## Moneyz Economy Function Creator

Moneyz Economy Function Creator is bash script used to quickly create basic Moneyz Economy buy/sell function files for the Moneyz Economy Behavior Pack. 

Automatically create functions in bulk with a ./items.txt

# License

These scripts are provided for personal, non-commercial use only. Redistribution or modification requires prior written permission.