
## Bedrock Server Manager:

### 1.0.0
1. Initial Release

### 1.0.1
1. Perform validation on server folder name and level name
2. Fixed getting the scripts current directory
3. Script no longer needs root permissions

### 1.0.2
1. Execute update-server command and systemd prestart command
2. Make linger command optional

### 1.0.3
1. Added update-script command
2. Ask if you want to install pre-request packages first
3. Shutdown server before update if running
4. Send messages to online players about checking for server updates, when its shutting down, and when its restarting
5. Wait 10 seconds before shutdown/restart to allow players time to react to shutdown/restart messages

### 1.1.0
1. Added option to import .mcworld files from ./content/worlds folder
2. Added option to import .mcpack files from ./content/addons folder
   - This will only update already installed addons
3. Stop server before backup
4. Use values from server.properties file when reconfiguring server properties
5. Cleaned up some repetitive code

### 1.1.1
1. Optimized $SCRIPTDIR variable