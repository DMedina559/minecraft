# Scripts

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

### Prerequisites

The script ensures the installation of required dependencies:

`curl, jq, unzip, systemd, screen`

Users must have `sudo` permissions for `systemd` commands to work (Start/Stop/Restart server), and for required packages to be installed.

### Usage

#### Install wget if its not already:

```
sudo apt update
sudo apt install wget
```

#### Download the script:

Download the script to your desired folder

```
wget -P /path/to/your/directory https://raw.githubusercontent.com/DMedina559/minecraft/main/scripts/bedrock-server-manager.sh
```
Its recommened to download the server to a folder just for the minecraft servers

For example:

`/home/user/minecraft-servers/`

When using the script the sctipt will create a `./bedrock_server_manager` folder in its current folder. This is where servers will be installed to and where the script will look when managing various server aspects.

#### Run the script:

```
bash /path/to/script/bedrock-server-manager.sh main #To open the main menu
```
or

```
bash /path/to/script/bedrock-server-manager.sh help #To print supported commands
```
### Disclaimer:

This script has only been tested on the following linux distros:

- Debian

# License

These script are provided for personal, non-commercial use only. Redistribution or modification requires prior written permission.
