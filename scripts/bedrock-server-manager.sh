#!/bin/bash
# Bedrock Server Manager
# Bedrock Server Manager is a bash script used to easily install/manage bedorck dedcated servers from the command line
# COPYRIGHT ZVORTEX11325 2025
# You may download and use this content for personal, non-commercial use. Any other use, including reproduction, or redistribution is prohibited without prior written permission.
# Author: ZVortex11325
# Version 1.0.1

set -eo pipefail

# Helper functions for colorful messages
msg_info() { echo -e "\033[1;34m[INFO]\033[0m $1"; }
msg_ok() { echo -e "\033[1;32m[OK]\033[0m $1"; }
msg_error() { echo -e "\033[1;31m[ERROR]\033[0m $1"; }

# Dependencies Check
setup_prerequisites() {
  msg_info "Checking and installing required packages (curl, jq, unzip, systemd, screen)..."

  # List of required packages
  local packages=("curl" "jq" "unzip" "systemd" "screen")

  # Detect package manager
  if command -v apt-get &>/dev/null; then
    package_manager="apt-get"
    install_command="apt-get install -y"
  elif command -v yum &>/dev/null; then
    package_manager="yum"
    install_command="yum install -y"
  else
    msg_error "Unsupported package manager. Please manually install: ${packages[*]}"
    exit 1
  fi

  # Install missing packages
  for pkg in "${packages[@]}"; do
    if ! command -v "$pkg" &>/dev/null; then
      msg_info "Installing $pkg..."
      sudo $install_command "$pkg"
    else
      # Suppress messages for already installed packages
      :
    fi
  done

  msg_ok "All required packages are installed"
}

setup_prerequisites

# Default configuration
: "${BASE_DIR:="$(realpath "$(dirname "${BASH_SOURCE[0]}")")/bedrock_server_manager"}"
: "${PACKAGE_BACKUP_KEEP:=3}"           # Number of backups to retain
: "${DEFAULT_PORT:=19132}"              # Default IPv4 port
: "${DEFAULT_IPV6_PORT:=19133}"         # Default IPv6 port (required for Bedrock)
: "${ALLOW_CHEATS:=false}"              # Default cheats setting
: "${MAX_PLAYERS:=8}"                   # Default maximum players
: "${ONLINE_MODE:=true}"                # Default online mode setting
: "${DIFFICULTY:=normal}"               # Default difficulty setting
: "${GAMEMODE:=survival}"               # Default gamemode
: "${LEVEL_NAME:=world}"                # Default level name
: "${SERVER_NAME:='Bedrock Server'}"    # Default server name
: "${LAN_VISIBILITY:=true}"             # Default lan visibility
: "${ALLOW_LIST:=false}"                # Default allow-list
: "${PERMISSION_LEVEL:=member}"         # Default permission level
: "${RENDER_DISTANCE:=12}"              # Default render distance
: "${TICK_DISTANCE:=4}"                 # Default render distance

# Back up a server's worlds and critical configuration files
backup_server() {
  local server_dir="$1"
  local backup_dir="$server_dir/backups"
  local timestamp
  local backup_file
  local backups_to_keep

  # Generate timestamp and define backup file for worlds
  timestamp=$(date +"%Y%m%d_%H%M%S")
  backup_file="$backup_dir/worlds_backup_$timestamp.tar.gz"

  msg_info "Running backup"

  # Ensure backup directory exists
  mkdir -p "$backup_dir"

  # Check if the worlds directory exists
  if [[ -d "$server_dir/worlds" ]]; then
    # Backup the worlds directory
    #msg_info "Backing up worlds directory to $backup_file"
    if ! tar -czf "$backup_file" -C "$server_dir" worlds; then
      msg_error "Backup of worlds failed!"
      return 1
    fi
    msg_ok "Worlds backup created: $backup_file"
  else
    msg_info "Worlds directory does not exist. Skipping worlds backup."
  fi

  # Backup critical files (allowlist.json, permissions.json, server.properties)
  #msg_info "Backing up server files..."
  cp "$server_dir/allowlist.json" "$backup_dir/allowlist.json" 2>/dev/null
  cp "$server_dir/permissions.json" "$backup_dir/permissions.json" 2>/dev/null
  cp "$server_dir/server.properties" "$backup_dir/server.properties" 2>/dev/null
  msg_ok "Critical files backed up to $backup_dir"

  # Prune old backups (keeping a defined number of backups)
  msg_info "Pruning old backups..."
  backups_to_keep=$((PACKAGE_BACKUP_KEEP + 1))
  find "$backup_dir" -maxdepth 1 -name "worlds_backup_*.tar.gz" -type f | sort -r | tail -n "+$backups_to_keep" | while read -r old_backup; do
    msg_info "Removing old backup: $old_backup"
    rm -f "$old_backup" || msg_error "Failed to remove $old_backup"
  done

  # Clean up old configuration backups
  find "$backup_dir" -maxdepth 1 -name "allowlist.json" -type f | sort -r | tail -n "+$backups_to_keep" | while read -r old_backup; do
    msg_info "Removing old config backup: $old_backup"
    rm -f "$old_backup" || msg_error "Failed to remove $old_backup"
  done

  msg_ok "Backup complete and old backups pruned"
}

# Updates a server
update_server() {
  local server_name="$1"
  local server_dir="$BASE_DIR/$server_name"

  msg_info "Starting update process for server: $server_name"

  # Check if the server directory exists
  if [[ ! -d "$server_dir" ]]; then
    msg_error "Server '$server_name' does not exist in $BASE_DIR."
    return 1
  fi

  # Get the installed version
  local installed_version
  installed_version=$(get_installed_version "$server_dir")
  if [[ $? -ne 0 ]]; then
    msg_error "Failed to get the installed version."
    return 1
  fi

  # Read the target version from version.txt
  local version_file="$server_dir/version.txt"
  if [[ ! -f "$version_file" ]]; then
    msg_error "Version file not found in $server_dir. Cannot determine the target version."
    return 1
  fi

  local target_version
  target_version=$(cat "$version_file")

  # Delegate download to `download_bedrock_server`
  local actual_version

  actual_version=$(download_bedrock_server "$server_dir" "$target_version" "$server_name" true "$installed_version" )

  if [[ $? -ne 0 ]]; then
    msg_error "Failed to download or extract the Bedrock server."
    return 1
  fi
  msg_ok "Installed server version: $installed_version"
  echo "$actual_version"
}

# Downloads and installs the Bedrock server
download_bedrock_server() {
    local server_dir="$1"
    local version="${2:-"LATEST"}"
    local server_name="${3:-"Bedorck Server"}"
    local in_update="${4:-false}"
    local installed_version="${5:-undefined}"
    local download_url
    local actual_version
    local download_page="https://www.minecraft.net/en-us/download/server/bedrock"


    msg_info "Downloading Bedrock server version: $version"

    # Ensure the server directory exists
    mkdir -p "$server_dir"
    mkdir -p "$server_dir/.downloads"

    # Function to fetch and extract the correct download URL
    lookup_version() {
        local version_type="$1"  # 'LATEST' or 'PREVIEW'
        local custom_version="$2"  # Specific version if provided
        local regex
        local download_page_content

        download_page_content=$(curl -sSL -A "zvortex11325/bedrock-server-manager" \
            -H "Accept-Language: en-US,en;q=0.5" \
            -H "Accept: text/html" \
            "$download_page")

        # Validate the download page content
        if [[ -z "$download_page_content" ]]; then
            msg_error "Failed to fetch download page content. Cannot proceed."
            return 1
        fi

        # Set regex for parsing the download link
        if [[ "$version_type" == "PREVIEW" ]]; then
            regex='<a[^>]+href="([^"]+)"[^>]+data-platform="serverBedrockPreviewLinux"'
        elif [[ "$version_type" == "LATEST" ]]; then
            regex='<a[^>]+href="([^"]+)"[^>]+data-platform="serverBedrockLinux"'
        fi

        # Extract the URL
        local match
        match=$(echo "$download_page_content" | grep -oEm1 "$regex")

        if [[ -n "$match" ]]; then
            download_url=$(echo "$match" | sed -E 's/.*href="([^"]+)".*/\1/')

            # If a specific version is provided, modify the URL
            if [[ -n "$custom_version" ]]; then
                download_url=$(echo "$download_url" | sed -E "s/(bedrock-server-)[^/]+(\.zip)/\1${custom_version}\2/")
            fi

            # Extract the actual version from the download URL
            actual_version=$(echo "$download_url" | grep -oP 'bedrock-server-\K[0-9.]+')

            if [[ "$in_update" == true ]]; then
                if [[ "${installed_version}" == "${actual_version%.}" ]]; then  
                  msg_ok "Server '$server_name' is already running the latest version ($installed_version). No update needed."
                  exit 0
                fi
            fi

            # If this is a fresh install, create server_output.txt with the resolved version
            if [[ "$in_update" == false ]]; then
                echo "Version: ${actual_version%.}" > "$server_dir/server_output.txt"
                msg_info "Created server_output.txt with version: $actual_version"
            fi
        else
            msg_error "Could not find a valid download URL for $version_type."
            return 1
        fi
    }

    # Determine the version type and call `lookup_version`
    case ${version^^} in
        PREVIEW)
            msg_info "Target version is 'preview'."
            if ! lookup_version "PREVIEW"; then return 1; fi
            ;;
        LATEST)
            msg_info "Target version is 'latest'."
            if ! lookup_version "LATEST"; then return 1; fi
            ;;
        *-PREVIEW)
            local version_cleaned="${version%-preview}"
            msg_info "Target version is a specific preview version: $version_cleaned."
            if ! lookup_version "PREVIEW" "$version_cleaned"; then return 1; fi
            ;;
        *)
            msg_info "Target version is a specific stable version: $version."
            if ! lookup_version "LATEST" "$version"; then return 1; fi
            ;;
    esac

    # Handle version from version.txt and manage '-preview' for URL
    local target_version="$version"
    if [[ "$version" == *"-preview" ]]; then
        target_version="${version%-preview}"  # Remove the '-preview' from version for URL handling
    fi

    # Validate the resolved download URL
    if [[ -z "$download_url" ]]; then
        msg_error "Resolved download URL is empty. Cannot proceed with downloading the server."
        return 1
    fi
    msg_info "Resolved download URL: $download_url"

    # Download the server file
    local zip_file="$server_dir/.downloads/bedrock_server.zip"
    if ! curl -fsSL -o "$zip_file" -A "zvortex11325/bedrock-server-manager" "$download_url"; then
        msg_error "Failed to download Bedrock server from $download_url"
        return 1
    fi
    msg_info "Downloaded Bedrock server ZIP to: $zip_file"

    # Extract files based on whether it's an update or fresh install
    if [[ "$in_update" == true ]]; then
        msg_info "Backing up server before update..."
        backup_server "$server_dir"

        msg_info "Extracting the server files, excluding critical files..."
        if ! unzip -o "$zip_file" -d "$server_dir" -x "worlds/*" "allowlist.json" "permissions.json" "server.properties" > /dev/null 2>&1; then
            msg_error "Failed to extract server files during update."
            return 1
        fi

        msg_info "Restoring critical files from backup..."
        local backup_dir="$server_dir/backups"
        cp "$backup_dir/allowlist.json" "$server_dir/allowlist.json" 2>/dev/null
        cp "$backup_dir/permissions.json" "$server_dir/permissions.json" 2>/dev/null
        cp "$backup_dir/server.properties" "$server_dir/server.properties" 2>/dev/null

        # Restart the server after the update (if it was running)
        if systemctl --user is-active --quiet "$server_name"; then
          msg_info "Restarting user server '$server_name'..."
          if ! systemctl --user restart "$server_name"; then
              msg_error "Failed to restart user service '$server_name'."
              return 1
          fi
          msg_ok "User server '$server_name' restarted successfully."
        else
          msg_info "User server '$server_name' is not currently running."
        fi

    else
        msg_info "Extracting server files for fresh installation..."
        if ! unzip -o "$zip_file" -d "$server_dir" > /dev/null 2>&1; then
            msg_error "Failed to extract server files during fresh installation."
            return 1
        fi
    fi

    real_user=$(id -u)
    real_group=$(id -g)
    msg_ok "Setting folder permissions to $real_user:$real_group"
    # Change ownership of extracted files to the real user/group
    chown -R "$real_user":"$real_group" "$server_dir"

    msg_ok "Installed Bedrock server version: ${actual_version%.}"
    return 0
}

# Gets the installed version of a server
get_installed_version() {
  local server_dir="$1"
  local server_binary="$server_dir/bedrock_server"
  local log_file="$server_dir/server_output.txt"

  # Ensure the server binary exists
  if [[ ! -f $server_binary ]]; then
    msg_error "Server binary not found in $server_dir"
    return 1
  fi

  # Ensure the log file exists
  if [[ ! -f $log_file ]]; then
    msg_error "Log file not found. Ensure the server has started and generated the log."
    return 1
  fi

  # Extract the version from the log file (looking for the line starting with 'Version: ')
  local version_output
  version_output=$( grep -oE '[0-9]+\.[0-9]+\.[0-9]+(\.[0-9]+)?(-[a-zA-Z0-9]+)?' "$log_file" | head -n 1 )

  if [[ -n $version_output ]]; then
    # Extract just the version number
    version_output=$(echo "$version_output" | sed 's/-beta/\./')
    echo "$version_output"
  else
    msg_error "Failed to determine server version from log file."
    return 1
  fi
}

# Delete a Bedrock server
delete_server() {
  local server_name
  read -p "Enter the name of the server to delete: " server_name
  local server_dir="$BASE_DIR/$server_name"
  local service_file="$HOME/.config/systemd/user/$server_name.service"

  # Check if the server directory exists
  if [[ ! -d $server_dir ]]; then
    msg_error "Server '$server_name' does not exist at $server_dir"
    return 1
  fi

  # Confirm deletion
  read -p "Are you sure you want to delete the server '$server_name'? This action is irreversible! (y/N): " confirm
  if [[ ${confirm,,} != "y" ]]; then
    msg_info "Server deletion canceled."
    return 0
  fi

  # Stop the server if it's running
  if systemctl --user is-active --quiet "$server_name"; then
    msg_info "Stopping server '$server_name' before deletion..."
    systemctl --user stop "$server_name"
  fi

  # Remove the systemd service file
  if [[ -f "$service_file" ]]; then
    msg_info "Removing user systemd service for '$server_name'"
    systemctl --user disable "$server_name"
    rm -f "$service_file"
    systemctl --user daemon-reload
  fi

  # Remove the server directory
  msg_info "Deleting server directory: $server_dir"
  rm -rf "$server_dir" || { msg_error "Failed to delete server directory."; return 1; }

  msg_ok "Server '$server_name' deleted successfully."
}

# Make server systemd service
create_systemd_service() {
  local server_name="$1"
  local server_dir="$BASE_DIR/$server_name"
  local service_file="$HOME/.config/systemd/user/$server_name.service"

  # Ensure the user's systemd directory exists
  mkdir -p "$HOME/.config/systemd/user"

  # Check if the service file already exists
  if [[ -f "$service_file" ]]; then
    msg_error "Service file for '$server_name' already exists at $service_file"
    return 1
  fi

  # Create the systemd service file dynamically
  msg_info "Creating systemd service for '$server_name'"
  cat <<EOF > "$service_file"
[Unit]
Description=Minecraft Bedrock Server: $server_name
After=network.target

[Service]
Type=forking
WorkingDirectory=$(realpath "$(dirname "${BASH_SOURCE[0]}")")
Environment="PATH=/usr/bin:/bin:/usr/sbin:/sbin"
ExecStart=/bin/bash -c "truncate -s 0 ./bedrock_server_manager/$server_name/server_output.txt && /usr/bin/screen -dmS $server_name -L -Logfile ./bedrock_server_manager/$server_name/server_output.txt bash -c 'cd ./bedrock_server_manager/$server_name && ./bedrock_server'"
ExecStop=/usr/bin/screen -S $server_name -X quit
ExecReload=/bin/bash -c "truncate -s 0 ./bedrock_server_manager/$server_name/server_output.txt && /usr/bin/screen -S $server_name -X quit && /usr/bin/screen -dmS $server_name -L -Logfile ./bedrock_server_manager/$server_name/server_output.txt bash -c 'cd ./bedrock_server_manager/$server_name && ./bedrock_server'"
Restart=always
RestartSec=10
StartLimitIntervalSec=500
StartLimitBurst=3

[Install]
WantedBy=default.target
EOF

  # Reload systemd to register the new service
  msg_info "Reloading user systemd daemon"
  systemctl --user daemon-reload

  # Enable the service to start on boot
  msg_info "Enabling service for '$server_name'"
  systemctl --user enable "$server_name"

  # Run linger command
  msg_info "Enabling lingering for user"
  sudo loginctl enable-linger $(whoami)

  msg_ok "Systemd service created for '$server_name'"
}


# Configures common server properties interactively
configure_server_properties() {
  local server_dir=$1
  local server_name=$2
  msg_info "Configuring server properties for '$server_name'"

  # Check if server.properties exists
  local server_properties="$server_dir/server.properties"
  if [[ ! -f "$server_properties" ]]; then
    msg_error "server.properties not found!"
    return 1
  fi

  # Prompt user for server properties
  read -p "Enter server name [Default: $SERVER_NAME]: " input_server_name
  input_server_name=${input_server_name:-$SERVER_NAME}

  # Ask for level name inside the configure_server_properties function (used for world folder name)
  while true; do
    read -p "Enter level name [Default: $LEVEL_NAME]: " input_level_name

    # Check if input_level_name is empty (user pressed Enter)
    if [[ -z "$input_level_name" ]]; then
      input_level_name="$LEVEL_NAME"  # Use default value
      break
    fi

    # Check if input_level_name contains only alphanumeric characters, hyphens, and underscores
    if [[ "$input_level_name" =~ ^[[:alnum:]_-]+$ ]]; then
      break  # Exit the loop if the name is valid
    else
      echo "Invalid level name. Only alphanumeric characters, hyphens, and underscores are allowed."
    fi
  done

  read -p "Enter gamemode [Default: $GAMEMODE]: " input_gamemode
  input_gamemode=${input_gamemode:-$GAMEMODE}

  read -p "Enter difficulty [Default: $DIFFICULTY]: " input_difficulty
  input_difficulty=${input_difficulty:-$DIFFICULTY}

  read -p "Allow cheats [Default: $ALLOW_CHEATS]: " input_allow_cheats
  input_allow_cheats=${input_allow_cheats:-$ALLOW_CHEATS}

  read -p "Enter IPV4 Port [Default: $DEFAULT_PORT]: " input_port
  input_port=${input_port:-$DEFAULT_PORT}

  read -p "Enter IPV6 Port [Default: $DEFAULT_IPV6_PORT]: " input_port_v6
  input_port_v6=${input_port_v6:-$DEFAULT_IPV6_PORT}

  read -p "Enable LAN Visibility [Default: $LAN_VISIBILITY]: " input_lan_visibility
  input_lan_visibility=${input_lan_visibility:-$LAN_VISIBILITY}

  read -p "Enable allow list [Default: $ALLOW_LIST]: " input_allow_list
  input_allow_list=${input_max_players:-$ALLOW_LIST}

  read -p "Enter max players [Default: $MAX_PLAYERS]: " input_max_players
  input_max_players=${input_max_players:-$MAX_PLAYERS}

  read -p "Default permission level [Default: $PERMISSION_LEVEL]: " input_permission_level
  input_permission_level=${input_permission_level:-$PERMISSION_LEVEL}

  read -p "Default render distance [Default: $RENDER_DISTANCE]: " input_render_distance
  input_render_distance=${input_render_distance:-$RENDER_DISTANCE}

  read -p "Default tick distance [Default: $TICK_DISTANCE]: " input_tick_distance
  input_tick_distance=${input_tick_distance:-$TICK_DISTANCE}

  # Update or add the properties in server.properties
  modify_server_properties "$server_properties" "server-name" "$input_server_name"
  modify_server_properties "$server_properties" "level-name" "$input_level_name"
  modify_server_properties "$server_properties" "gamemode" "$input_gamemode"
  modify_server_properties "$server_properties" "difficulty" "$input_difficulty"
  modify_server_properties "$server_properties" "allow-cheats" "$input_allow_cheats"
  modify_server_properties "$server_properties" "server-port" "$input_port"
  modify_server_properties "$server_properties" "server-portv6" "$input_port_v6"
  modify_server_properties "$server_properties" "enable-lan-visibility" "$input_lan_visibility"
  modify_server_properties "$server_properties" "allow-list" "$ALLOW_LIST"
  modify_server_properties "$server_properties" "max-players" "$input_max_players"
  modify_server_properties "$server_properties" "default-player-permission-level" "$input_permission_level"
  modify_server_properties "$server_properties" "view-distance" "$input_render_distance"
  modify_server_properties "$server_properties" "tick-distance" "$input_tick_distance"

  msg_ok "Server properties configured"
}

# Modify or add a property in server.properties
modify_server_properties() {
  local server_properties="$1"
  local property_name="$2"
  local property_value="$3"

  # Check if the property already exists in the file
  if grep -q "^$property_name=" "$server_properties"; then
    # If it exists, update the value
    sed -i "s/^$property_name=.*/$property_name=$property_value/" "$server_properties"
    msg_info "Updated $property_name to $property_value"
  else
    # If it doesn't exist, append the property to the end of the file
    echo "$property_name=$property_value" >> "$server_properties"
    msg_info "Added $property_name with value $property_value"
  fi
}

# Configure permissions.json
#configure_permissions() {
#  local server_dir=$1
#  msg_info "Configuring permissions.json"

#  jq -n --arg ops "$OPS" --arg members "$MEMBERS" --arg visitors "$VISITORS" '[ 
#    [$ops | split(",") | map({permission: "operator", xuid: .})],
#    [$members | split(",") | map({permission: "member", xuid: .})],
#    [$visitors | split(",") | map({permission: "visitor", xuid: .})]
#  ] | flatten' > "$server_dir/permissions.json"
#
#  msg_ok "Configured permissions.json"
#}

# Configure allowlist.json
configure_allowlist() {
  local server_dir=$1
  local allowlist_file="$server_dir/allowlist.json"
  local existing_players=()
  local new_players=()

  msg_info "Configuring allowlist.json"

  # Load existing players from allowlist.json if the file exists and is not empty
  if [[ -f "$allowlist_file" && -s "$allowlist_file" ]]; then
    existing_players=$(jq -r '.[] | .name' "$allowlist_file")
    msg_info "Loaded existing players from allowlist.json."
  else
    msg_info "No existing allowlist.json found. A new one will be created."
  fi

  # Ask the user for new players
  while true; do
    read -p "Enter a player's name to add to the allowlist (or type 'done' to finish): " player_name
    if [[ "$player_name" == "done" ]]; then
      break
    elif [[ -z "$player_name" ]]; then
      msg_warn "Player name cannot be empty. Please try again."
      continue
    fi

    # Check if the player already exists in the allowlist
    if echo "$existing_players" | grep -qx "$player_name"; then
      msg_warn "Player '$player_name' is already in the allowlist. Skipping."
      continue
    fi

    # Ask if the player should ignore the player limit
    read -p "Should this player ignore the player limit? (y/N): " ignore_limit
    case "$ignore_limit" in
      yes|y|Y)
        new_players+=("{\"ignoresPlayerLimit\":true,\"name\":\"$player_name\"}")
        ;;
      no|n|N)
        new_players+=("{\"ignoresPlayerLimit\":false,\"name\":\"$player_name\"}")
        ;;
      *)
        msg_warn "Invalid input. Please answer 'yes' or 'no'."
        ;;
    esac
  done

  # Combine existing players with new players
  if [[ ${#new_players[@]} -gt 0 ]]; then
    # Create a temporary file for the updated allowlist
    local updated_allowlist=$(mktemp)

    # Merge existing players and new players into a valid JSON array
    {
      jq -c '.[]' "$allowlist_file" 2>/dev/null || echo "[]"  # Load existing players if present
      printf "%s\n" "${new_players[@]}" | jq -c '.'  # Add new players
    } | jq -s '.' > "$updated_allowlist"  # Combine and format as a JSON array

    # Save the updated allowlist to the file
    mv "$updated_allowlist" "$allowlist_file"
    msg_ok "Updated allowlist.json with ${#new_players[@]} new players."
  else
    msg_info "No new players were added. Existing allowlist.json was not modified."
  fi
}

# Send commands to server
send_command() {
  local server_name="$1"
  local command="$2"

  # Check if the server is running in a screen session
  if screen -list | grep -q "$server_name"; then
    # Send the command to the screen session
    msg_info "Sending command '$command' to server '$server_name' via screen..."
    screen -S "$server_name" -X stuff "$command^M"  # ^M simulates Enter key
    msg_ok "Command '$command' sent to server '$server_name'."
  else
    msg_error "Server '$server_name' is not running in a screen session."
    return 1
  fi
}

# Ask to start the server after installation
prompt_start_server() {
  local server_name="$1"
  read -p "Do you want to start the server '$server_name' now? (y/N): " start_choice
  if [[ ${start_choice,,} == "y" ]]; then
    if ! systemctl --user start "$server_name"; then
        msg_error "Failed to start user service '$server_name'."
        return 1
    fi
    msg_ok "Server '$server_name' started."
  else
    msg_info "Server '$server_name' not started."
  fi
}

# Restart server
restart_server() {
  local server_name="$1"
  msg_info "Restarting user server '$server_name' using systemd..."
    if ! systemctl --user restart "$server_name"; then
        msg_error "Failed to restart user service '$server_name'."
        return 1
    fi
  msg_ok "User server '$server_name' restarted."
}

# Start server
start_server() {
  local server_name="$1"
  msg_info "Starting user server '$server_name' using systemd..."
    if ! systemctl --user start "$server_name"; then
        msg_error "Failed to start user service '$server_name'."
        return 1
    fi
  msg_ok "User server '$server_name' started."
}

# Stop server
stop_server() {
  local server_name="$1"
  msg_info "Stopping user server '$server_name' using systemd..."
    if ! systemctl --user stop "$server_name"; then
        msg_error "Failed to stop user service '$server_name'."
        return 1
    fi
  msg_ok "User server '$server_name' stopped."
}

# Attach to screen
attach_console() {
  local server_name="$1"

  # Check if the server is running in a screen session
  if screen -list | grep -q "$server_name"; then
    msg_info "Attaching to server '$server_name' console..."
    screen -r "$server_name"
  else
    msg_error "Server '$server_name' is not running in a screen session."
    return 1
  fi
}

# Main menu
main_menu() {
  while true; do
    echo
    echo -e "\033[1;34mBedrock Server Manager\033[0m"
    echo "1) Install a new server"
    echo "2) Manage an existing server"
    echo "3) Send command to a server"
    echo "4) Attach to server console"
    echo "5) Exit"
    read -p "Select an option [1-5]: " choice

    case $choice in
      1) # Install a new server
        while true; do
          read -p "Enter server folder name: " server_name

          # Check if server_name contains only alphanumeric characters, hyphens, and underscores
          if [[ "$server_name" =~ ^[[:alnum:]_-]+$ ]]; then
            break  # Exit the loop if the name is valid
          else
            echo "Invalid server folder name. Only alphanumeric characters, hyphens, and underscores are allowed."
          fi
        done

        read -p "Enter server version (e.g., LATEST or PREVIEW): " version

        # Use default directory (./bedrock_server_manager/)
        local server_dir="$BASE_DIR/$server_name"

        # Create the server directory if it doesn't exist
        mkdir -p "$server_dir"

        # Save the target version input directly to version.txt
        echo "$version" > "$server_dir/version.txt"
        msg_info "Saved target version '$version' to version.txt"

        # Install the server
        download_bedrock_server "$server_dir" "$version"

        # Configure the server properties after installation
        configure_server_properties "$server_dir" "$server_name"

        # Ask if allow-list should be configured
        while true; do
          read -p "Configure allow-list? (y/N): " allowlist_response
          case "$allowlist_response" in
            yes|y|Y)
              configure_allowlist "$server_dir"
              break
              ;;
            no|n|N|"")
              msg_info "Skipping allow-list configuration."
              break
              ;;
            *)
              msg_warn "Invalid input. Please answer 'yes' or 'no'."
              ;;
          esac
        done 

        # Create a systemd service for the server
        create_systemd_service "$server_name"

        # Ask to start the server
        prompt_start_server "$server_name"
        ;;

      2) # Manage an existing server
        manage_server
        ;;

      3) # Send a command
        read -p "Enter server name: " server_name
        read -p "Enter command: " command
        send_command "$server_name" "$command"
        ;;

      4) # Attach to server console
        read -p "Enter server name: " server_name
        attach_console "$server_name"
        ;;

      5) # Exit
        exit 0
        ;;

      *)
        msg_error "Invalid choice"
        ;;
    esac
  done
}

# Main menu
manage_server() {
  while true; do
    echo
    echo -e "\033[1;34mBedrock Server Manager\033[0m"
    echo "1) Update an existing server"
    echo "2) Start a server"
    echo "3) Stop a server"
    echo "4) Edit a server's properties"
    echo "5) Configure a server's allow-list"
    echo "6) Restart a server"
    echo "7) Backup a server"
    echo "8) Delete a server"
    echo "9) Back"
    read -p "Select an option [1-8]: " choice

    case $choice in

      1) # Update an existing server
        read -p "Enter server name: " server_name
        update_server "$server_name"
        ;;

      2) # Start a server
        read -p "Enter server name: " server_name
        start_server "$server_name"
        ;;

      3) # Stop a server
        read -p "Enter server name: " server_name
        stop_server "$server_name"
        ;;

      4) # Edit server properties
        read -p "Enter server name: " server_name

        # Use default directory (./bedrock_server_manager/)
        local server_dir="$BASE_DIR/$server_name"

        configure_server_properties "$server_dir" "$server_name"
        ;;

      5) # Configure server allowlist
        read -p "Enter server name: " server_name

        # Use default directory (./bedrock_server_manager/)
        local server_dir="$BASE_DIR/$server_name"

        configure_allowlist "$server_dir"
        ;;  

      6) # Restart a server
        read -p "Enter server name: " server_name
        restart_server "$server_name"
        ;;

      7) # Backup a server
        read -p "Enter server name: " server_name
        backup_server "$BASE_DIR/bedrock_server_manager/$server_name"
        ;;

      8) # Delete a server
        delete_server
        ;;

      9) # Back
        main_menu
        ;;

      *)
        msg_error "Invalid choice"
        ;;
    esac
  done
}

# Parse and execute commands passed via the command line
#echo "Arguments received: $@"

# Parse commands
case "$1" in
  send-command)
    shift # Remove the first argument (send-command)
    while [[ $# -gt 0 ]]; do
      case $1 in
        --server)
          server_name=$2
          shift 2
          ;;
        --command)
          command=$2
          shift 2
          ;;
        *)
          msg_error "Unknown option: $1"
          echo "Usage: $0 send-command --server <server_name> --command <command>"
          exit 1
          ;;
      esac
    done

    # Validate inputs
    if [[ -z $server_name || -z $command ]]; then
      msg_error "Missing required arguments: --server or --command"
      echo "Usage: $0 send-command --server <server_name> --command <command>"
      exit 1
    fi

    send_command "$server_name" "$command"
    exit 0
    ;;

  update-server)
    shift # Remove the first argument (update-server)
    while [[ $# -gt 0 ]]; do
      case $1 in
        --server)
          server_name=$2
          shift 2
          ;;
        *)
          msg_error "Unknown option: $1"
          echo "Usage: $0 update-server --server <server_name>"
          exit 1
          ;;
      esac
    done

    # Validate inputs
    if [[ -z $server_name ]]; then
      msg_error "Missing required argument: --server"
      echo "Usage: $0 update-server --server <server_name>"
      exit 1
    fi

    update_server "$server_name"
    exit 0
    ;;

  backup-server)
    shift # Remove the first argument (backup-server)
    while [[ $# -gt 0 ]]; do
      case $1 in
        --server)
          server_name=$2
          shift 2
          ;;
        *)
          msg_error "Unknown option: $1"
          echo "Usage: $0 backup-server --server <server_name>"
          exit 1
          ;;
      esac
    done

    # Validate inputs
    if [[ -z $server_name ]]; then
      msg_error "Missing required argument: --server"
      echo "Usage: $0 backup-server --server <server_name>"
      exit 1
    fi

    backup_server "$server_name"
    exit 0
    ;;

  start-server)
    shift # Remove the first argument (start-server)
    while [[ $# -gt 0 ]]; do
      case $1 in
        --server)
          server_name=$2
          shift 2
          ;;
        *)
          msg_error "Unknown option: $1"
          echo "Usage: $0 start-server --server <server_name>"
          exit 1
          ;;
      esac
    done

    # Validate inputs
    if [[ -z $server_name ]]; then
      msg_error "Missing required argument: --server"
      echo "Usage: $0 start-server --server <server_name>"
      exit 1
    fi

    start_server "$server_name"
    exit 0
    ;;

  stop-server)
    shift # Remove the first argument (stop-server)
    while [[ $# -gt 0 ]]; do
      case $1 in
        --server)
          server_name=$2
          shift 2
          ;;
        *)
          msg_error "Unknown option: $1"
          echo "Usage: $0 stop-server --server <server_name>"
          exit 1
          ;;
      esac
    done

    # Validate inputs
    if [[ -z $server_name ]]; then
      msg_error "Missing required argument: --server"
      echo "Usage: $0 stop-server --server <server_name>"
      exit 1
    fi

    stop_server "$server_name"
    exit 0
    ;;

  restart-server)
    shift # Remove the first argument (restart-server)
    while [[ $# -gt 0 ]]; do
      case $1 in
        --server)
          server_name=$2
          shift 2
          ;;
        *)
          msg_error "Unknown option: $1"
          echo "Usage: $0 restart-server --server <server_name>"
          exit 1
          ;;
      esac
    done

    # Validate inputs
    if [[ -z $server_name ]]; then
      msg_error "Missing required argument: --server"
      echo "Usage: $0 stop-server --server <server_name>"
      exit 1
    fi

    restart_server "$server_name"
    exit 0
    ;;

  main)
    # Open the main menu
    msg_info "Opening main menu..."
    main_menu
    exit 0
    ;;

  help | *)
    # Print usage for all available commands automatically if no valid command or help argument is passed
    echo "Usage: $0 <command> [options]"
    echo
    echo "Available commands:"
    echo "  send-command   -- Send a command to a running server"
    echo "    --server <server_name>    Specify the server name"
    echo "    --command <command>       The command to send to the server (must be in quotations)"
    echo
    echo "  update-server  -- Update a server to a specified version"
    echo "    --server <server_name>    Specify the server name"
    echo
    echo "  backup-server  -- Back up the server's worlds"
    echo "    --server <server_name>    Specify the server name"
    echo
    echo "  start-server   -- Start the server"
    echo "    --server <server_name>    Specify the server name"
    echo
    echo "  stop-server    -- Stop the server"
    echo "    --server <server_name>    Specify the server name"
    echo
    echo "  restart-server -- Restart the server"
    echo "    --server <server_name>    Specify the server name"
    echo
    echo "  main           -- Open the main menu"
    echo
    echo "Version: 1.0.1"
    echo "Credits: ZVortex11325"
    exit 1
    ;;
esac