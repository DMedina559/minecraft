#!/bin/bash
# Bedrock Server Manager
# Bedrock Server Manager is a bash script used to easily install/manage bedorck dedcated servers from the command line
# COPYRIGHT ZVORTEX11325 2025
# You may download and use this content for personal, non-commercial use. Any other use, including reproduction, or redistribution is prohibited without prior written permission.
# Author: ZVortex11325
# Version 1.1.0

SCRIPTVERSION=$(grep -m 1 "^# Version" "$0" | sed -E 's/^# Version[[:space:]]+([0-9]+\.[0-9]+\.[0-9]+).*/\1/')
SCRIPTDIR=$(realpath "$(dirname "${BASH_SOURCE[0]}")")

set -eo pipefail

# Helper functions for colorful messages
msg_info() { echo -e "\033[1;34m[INFO]\033[0m $1"; }
msg_ok() { echo -e "\033[1;32m[OK]\033[0m $1"; }
msg_warn() { echo -e "\033[1;33m[WARN]\033[0m $1"; }
msg_error() { echo -e "\033[1;31m[ERROR]\033[0m $1"; }

# Dependencies Check
setup_prerequisites() {
  # List of required packages
  local packages=("curl" "jq" "unzip" "systemd" "screen")

  # Detect package manager
  if command -v apt-get &>/dev/null; then
    package_manager="apt-get"
    install_command="apt-get install -y"
  else
    msg_error "Unsupported package manager. Are you running a debian based systrem?"
    exit 1
  fi

  # Check if any packages are missing
  local missing_packages=()
  for pkg in "${packages[@]}"; do
    if ! command -v "$pkg" &>/dev/null; then
      missing_packages+=("$pkg")
    fi
  done

  # If no packages are missing, skip installation
  if [ ${#missing_packages[@]} -eq 0 ]; then
    #msg_info "All required packages are already installed."
    return 0
  fi

  # Loop until the user provides a valid answer
  while true; do
    # Prompt user for installation
    echo "The following packages are missing: ${missing_packages[*]}"
    read -p "Would you like to install them? (y/n): " user_response

    # Convert to lowercase and check the response
    user_response=$(echo "$user_response" | tr '[:upper:]' '[:lower:]')

    if [[ "$user_response" =~ ^(y|yes)$ ]]; then
      msg_info "Installing missing packages: ${missing_packages[*]}..."
      sudo $install_command "${missing_packages[@]}"
      msg_ok "All required packages are now installed."
      break  # Exit the loop after successful installation
    elif [[ "$user_response" =~ ^(n|no)$ ]]; then
      msg_error "Missing packages are required to proceed. Exiting..."
      exit 1
    else
      msg_warn "Invalid response. Please answer with 'y', 'yes', 'n', or 'no'."
    fi
  done
}

setup_prerequisites

# Function to download the updated script and restart it
update_script() {

  msg_info "Redownloading script..."

  local script_url="https://raw.githubusercontent.com/DMedina559/minecraft/main/scripts/bedrock-server-manager.sh"

  wget -q -O "$SCRIPTDIR/bedrock-server-manager.sh" "$script_url"

  msg_ok "Done."
}

# Default configuration
: "${BASE_DIR:="$SCRIPTDIR/bedrock_server_manager"}"
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

# Make folders if they don't exist
mkdir -p $BASE_DIR
mkdir -p $SCRIPTDIR/content/worlds
mkdir -p $SCRIPTDIR/content/addons

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

  # Stop the server if it's running
  if systemctl --user is-active --quiet "$server_name"; then
    msg_info "Stopping '$server_name' for backup..."
    $SCRIPTDIR/bedrock-server-manager.sh send-command --server "$server_name" --command "tell @a Running server backup.."
    stop_server $server_name
    msg_ok "Server '$server_name' stopped successfully."
    local was_running=true
  else
    msg_info "Server '$server_name' is not currently running."
  fi

  msg_info "Running backup"

  # Ensure backup directory exists
  mkdir -p "$backup_dir"

  # Check if the worlds directory exists
  if [[ -d "$server_dir/worlds" ]]; then
    # Backup the worlds directory
    if ! tar -czf "$backup_file" -C "$server_dir" worlds; then
      msg_error "Backup of worlds failed!"
      return 1
    fi
    msg_ok "Worlds backup created: $backup_file"
  else
    msg_info "Worlds directory does not exist. Skipping worlds backup."
  fi

  # Backup critical files (allowlist.json, permissions.json, server.properties)
  cp "$server_dir/allowlist.json" "$backup_dir/allowlist.json" 2>/dev/null
  cp "$server_dir/permissions.json" "$backup_dir/permissions.json" 2>/dev/null
  cp "$server_dir/server.properties" "$backup_dir/server.properties" 2>/dev/null
  msg_ok "Critical files backed up to $backup_dir"

  # Start the server after the world is installed (if it was running)
  if [[ "$was_running" == true ]]; then
    msg_info "Starting server '$server_name'..."
    start_server $server_name
    msg_ok "Server '$server_name' started successfully."
  else
    msg_info "Skipping server start."
  fi

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

  if systemctl --user is-active --quiet "$server_name"; then
    $SCRIPTDIR/bedrock-server-manager.sh send-command --server $server_name --command "tell @a Checking for server updates.."
  fi

  # Check if the server directory exists
  if [[ ! -f "$server_dir/bedrock_server" ]]; then
    msg_error "bedrock_server not found in $server_dir."
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

    # Check if server is running
    if [[ "$in_update" == true ]]; then
        msg_info "Checking if server is running"
        if systemctl --user is-active --quiet "$server_name"; then
          msg_info "Stopping '$server_name'..."
          $SCRIPTDIR/bedrock-server-manager.sh send-command --server $server_name --command "tell @a Updating server..."
          stop_server $server_name
          local was_running
          was_running=true
        else
          msg_info "Server '$server_name' is not currently running."
        fi
    fi

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

        # Start the server after the update (if it was running)
        if [[ "$was_running" == true ]]; then
          msg_info "Starting server '$server_name'..."
          start_server $server_name
          msg_ok "Server '$server_name' started successfully."
        else
          msg_info "Skip starting server '$server_name'."
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
    msg_info "Setting folder permissions to $real_user:$real_group"
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
  if [[ ! -f "$server_dir/bedrock_server" ]]; then
    msg_error "bedrock_server not found in $server_dir."
    return 1
  fi

  # Confirm deletion
  read -p "Are you sure you want to delete the server '$server_name'? This action is irreversible! (y/N): " confirm
  if [[ ! "${confirm,,}" =~ ^(y|yes)$ ]]; then
    msg_info "Server deletion canceled."
    return 0
  fi

  # Stop the server if it's running
  if systemctl --user is-active --quiet "$server_name"; then
    msg_warn "Stopping server '$server_name' before deletion..."
    stop_server $server_name
  fi

  # Remove the systemd service file
  if [[ -f "$service_file" ]]; then
    msg_warn "Removing user systemd service for '$server_name'"
    systemctl --user disable "$server_name"
    rm -f "$service_file"
    systemctl --user daemon-reload
  fi

  # Remove the server directory
  msg_warn "Deleting server directory: $server_dir"
  rm -rf "$server_dir" || { msg_error "Failed to delete server directory."; return 1; }

  msg_ok "Server '$server_name' deleted successfully."
}

enable_user_lingering() {
  # Check if lingering is already enabled
  if loginctl show-user $(whoami) -p Linger | grep -q "Linger=yes"; then
    msg_info "Lingering is already enabled for $(whoami)"
    return 0
  fi

  while true; do
    read -r -p "Do you want to enable lingering for user $(whoami)? This is required for servers to start after logout. (y/N): " response
    response="${response,,}" # Convert to lowercase

    case "$response" in
      yes|y)
        msg_info "Attempting to enable lingering for user $(whoami)"
        if ! sudo loginctl enable-linger $(whoami); then
          msg_warn "Failed to enable lingering for $(whoami). User services might not start after logout. Check sudo permissions if this is a problem."
          return 0 # Continue even if it fails
        fi
        msg_ok "Lingering enabled for $(whoami)"
        return 0
        ;;
      no|n|"") # Empty input is treated as "no"
        msg_info "Lingering not enabled. User services will not start after logout."
        return 0
        ;;
      *)
        msg_warn "Invalid input. Please answer 'yes' or 'no'."
        ;; # Loop again
    esac
  done
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
WorkingDirectory=$SCRIPTDIR
Environment="PATH=/usr/bin:/bin:/usr/sbin:/sbin"
ExecStartPre=/bin/bash -c "./bedrock-server-manager.sh update-server --server $server_name"
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
  enable_user_lingering

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

  # Read existing properties from the server.properties file
  local current_server_name
  local current_level_name
  local current_gamemode
  local current_difficulty
  local current_allow_cheats
  local current_port
  local current_port_v6
  local current_lan_visibility
  local current_allow_list
  local current_max_players
  local current_permission_level
  local current_render_distance
  local current_tick_distance

  current_server_name=$(grep "^server-name=" "$server_properties" | cut -d'=' -f2)
  current_level_name=$(grep "^level-name=" "$server_properties" | cut -d'=' -f2)
  current_gamemode=$(grep "^gamemode=" "$server_properties" | cut -d'=' -f2)
  current_difficulty=$(grep "^difficulty=" "$server_properties" | cut -d'=' -f2)
  current_allow_cheats=$(grep "^allow-cheats=" "$server_properties" | cut -d'=' -f2)
  current_port=$(grep "^server-port=" "$server_properties" | cut -d'=' -f2)
  current_port_v6=$(grep "^server-portv6=" "$server_properties" | cut -d'=' -f2)
  current_lan_visibility=$(grep "^enable-lan-visibility=" "$server_properties" | cut -d'=' -f2)
  current_allow_list=$(grep "^allow-list=" "$server_properties" | cut -d'=' -f2)
  current_max_players=$(grep "^max-players=" "$server_properties" | cut -d'=' -f2)
  current_permission_level=$(grep "^default-player-permission-level=" "$server_properties" | cut -d'=' -f2)
  current_render_distance=$(grep "^view-distance=" "$server_properties" | cut -d'=' -f2)
  current_tick_distance=$(grep "^tick-distance=" "$server_properties" | cut -d'=' -f2)

  # Prompt user for server properties with current values as defaults
  read -p "Enter server name [Default: ${current_server_name:-$SERVER_NAME}]: " input_server_name
  input_server_name=${input_server_name:-${current_server_name:-$SERVER_NAME}}

  read -p "Enter level name [Default: ${current_level_name:-$LEVEL_NAME}]: " input_level_name
  input_level_name=${input_level_name:-${current_level_name:-$LEVEL_NAME}}

  read -p "Enter gamemode [Default: ${current_gamemode:-$GAMEMODE}]: " input_gamemode
  input_gamemode=${input_gamemode:-${current_gamemode:-$GAMEMODE}}

  read -p "Enter difficulty [Default: ${current_difficulty:-$DIFFICULTY}]: " input_difficulty
  input_difficulty=${input_difficulty:-${current_difficulty:-$DIFFICULTY}}

  read -p "Allow cheats [Default: ${current_allow_cheats:-$ALLOW_CHEATS}]: " input_allow_cheats
  input_allow_cheats=${input_allow_cheats:-${current_allow_cheats:-$ALLOW_CHEATS}}

  read -p "Enter IPV4 Port [Default: ${current_port:-$DEFAULT_PORT}]: " input_port
  input_port=${input_port:-${current_port:-$DEFAULT_PORT}}

  read -p "Enter IPV6 Port [Default: ${current_port_v6:-$DEFAULT_IPV6_PORT}]: " input_port_v6
  input_port_v6=${input_port_v6:-${current_port_v6:-$DEFAULT_IPV6_PORT}}

  read -p "Enable LAN Visibility [Default: ${current_lan_visibility:-$LAN_VISIBILITY}]: " input_lan_visibility
  input_lan_visibility=${input_lan_visibility:-${current_lan_visibility:-$LAN_VISIBILITY}}

  read -p "Enable allow list [Default: ${current_allow_list:-$ALLOW_LIST}]: " input_allow_list
  input_allow_list=${input_allow_list:-${current_allow_list:-$ALLOW_LIST}}

  read -p "Enter max players [Default: ${current_max_players:-$MAX_PLAYERS}]: " input_max_players
  input_max_players=${input_max_players:-${current_max_players:-$MAX_PLAYERS}}

  read -p "Default permission level [Default: ${current_permission_level:-$PERMISSION_LEVEL}]: " input_permission_level
  input_permission_level=${input_permission_level:-${current_permission_level:-$PERMISSION_LEVEL}}

  read -p "Default render distance [Default: ${current_render_distance:-$RENDER_DISTANCE}]: " input_render_distance
  input_render_distance=${input_render_distance:-${current_render_distance:-$RENDER_DISTANCE}}

  read -p "Default tick distance [Default: ${current_tick_distance:-$TICK_DISTANCE}]: " input_tick_distance
  input_tick_distance=${input_tick_distance:-${current_tick_distance:-$TICK_DISTANCE}}

  # Update or add the properties in server.properties
  modify_server_properties "$server_properties" "server-name" "$input_server_name"
  modify_server_properties "$server_properties" "level-name" "$input_level_name"
  modify_server_properties "$server_properties" "gamemode" "$input_gamemode"
  modify_server_properties "$server_properties" "difficulty" "$input_difficulty"
  modify_server_properties "$server_properties" "allow-cheats" "$input_allow_cheats"
  modify_server_properties "$server_properties" "server-port" "$input_port"
  modify_server_properties "$server_properties" "server-portv6" "$input_port_v6"
  modify_server_properties "$server_properties" "enable-lan-visibility" "$input_lan_visibility"
  modify_server_properties "$server_properties" "allow-list" "$input_allow_list"
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
    msg_ok "Updated $property_name to $property_value"
  else
    # If it doesn't exist, append the property to the end of the file
    echo "$property_name=$property_value" >> "$server_properties"
    msg_ok "Added $property_name with value $property_value"
  fi
}

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
    msg_ok "Loaded existing players from allowlist.json."
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

    ignore_limit="${ignore_limit,,}"

    case "$ignore_limit" in
      yes|y)
        new_players+=("{\"ignoresPlayerLimit\":true,\"name\":\"$player_name\"}")
        ;;
      no|n)
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
    msg_warn "Server '$server_name' is not running in a screen session."
  fi
}

# Restart server
restart_server() {
  local server_name="$1"

  if ! systemctl --user is-active --quiet "$server_name"; then
    msg_warn "Server '$server_name' is not running. Starting it instead."
    start_server "$server_name"
    return $?
  fi

  msg_info "Restarting server '$server_name' using systemd..."
  
  # Send restart warning if the server is running
  $SCRIPTDIR/bedrock-server-manager.sh send-command --server "$server_name" --command "tell @a Restarting server in 10 seconds.."
  
  sleep 10

  if ! systemctl --user restart "$server_name"; then
    msg_error "Failed to restart server: '$server_name'."
    return 1
  fi

  msg_ok "Server '$server_name' restarted."
}

# Start server
start_server() {
  local server_name="$1"
  
  if systemctl --user is-active --quiet "$server_name"; then
    msg_warn "Server '$server_name' is already running."
    return 0
  fi

  msg_info "Starting server '$server_name' using systemd..."
  if ! systemctl --user start "$server_name"; then
    msg_error "Failed to start server: '$server_name'."
    return 1
  fi

  msg_ok "Server '$server_name' started."
}

# Stop server
stop_server() {
  local server_name="$1"

  if ! systemctl --user is-active --quiet "$server_name"; then
    msg_warn "Server '$server_name' is not running."
    return 0
  fi

  msg_info "Stopping server '$server_name' using systemd..."
  
  # Send shutdown warning if the server is running
  $SCRIPTDIR/bedrock-server-manager.sh send-command --server "$server_name" --command "tell @a Shutting down server in 10 seconds.."
  
  sleep 10

  if ! systemctl --user stop "$server_name"; then
    msg_error "Failed to stop server: '$server_name'."
    return 1
  fi

  msg_ok "Server '$server_name' stopped."
}

# Attach to screen
attach_console() {
  local server_name="$1"

  # Check if the server is running in a screen session
  if screen -list | grep -q "$server_name"; then
    msg_info "Attaching to server '$server_name' console..."
    screen -r "$server_name"
  else
    msg_warn "Server '$server_name' is not running in a screen session."
  fi
}

# Install world to server
extract_worlds() {
  local server_name="$1"
  
  # Path to the content/worlds folder and the server directory
  local content_dir="$SCRIPTDIR/content/worlds"
  local server_dir="$SCRIPTDIR/bedrock_server_manager/$server_name"
  local server_properties="$server_dir/server.properties"

  # Check if server.properties exists
  if [[ ! -f "$server_properties" ]]; then
    msg_error "server.properties not found in $server_dir"
    return 1
  fi
  
  # Get the world name from the server.properties file
  local world_name
  world_name=$(grep "^level-name=" "$server_properties" | sed -E 's/^level-name=([a-zA-Z0-9_ -]+)$/\1/')

  # If we couldn't find the world name, return an error
  if [[ -z "$world_name" ]]; then
    msg_error "Could not find level-name in server.properties"
    return 1
  fi

  msg_info "World name from server.properties: $world_name"
  
  # Directory to extract worlds
  local extract_dir="$server_dir/worlds/$world_name"
  mkdir -p "$extract_dir"
  
  # Get a list of all .mcworld files (which are actually .zip files)
  local mcworld_files=("$content_dir"/*.mcworld)
  
  # If no .mcworld files found, return an error
  if [[ ${#mcworld_files[@]} -eq 0 ]]; then
    msg_warn "No .mcworld files found in $content_dir"
    return 0
  fi

  # Create an array with just the base file names (without full paths)
  local file_names=()
  for file in "${mcworld_files[@]}"; do
    file_names+=("$(basename "$file")")
  done

  # Set custom prompt for select
  PS3="Select a world to install (1-${#file_names[@]}): "

  # Loop until the user selects a valid file
  while true; do
    # Show a menu of available .mcworld files to install (display only file names)
    echo "Available worlds to install:"
    select mcworld_file in "${file_names[@]}"; do
      if [[ -z "$mcworld_file" ]]; then
        msg_warn "Invalid selection. Please choose a valid option."
        break
      fi

      # Notify players that the current world will be deleted
      msg_warn "Installing a new world will DELETE the existing world!"
      while true; do
        read -p "Are you sure you want to proceed? (YES/no): " confirm_choice
        case "${confirm_choice,,}" in
          yes|y) break ;;   # Proceed with world installation
          no|n) 
            msg_warn "World installation canceled."
            return 0 ;;   # Exit function without installing
          *) msg_warn "Invalid input. Please type 'YES' to proceed or 'NO' to cancel." ;;
        esac
      done

      # Stop the server if it's running
      if systemctl --user is-active --quiet "$server_name"; then
        msg_info "Stopping '$server_name'..."
        stop_server $server_name
        msg_ok "Server '$server_name' stopped successfully."
        local was_running=true
      else
        msg_info "Server '$server_name' is not currently running."
      fi

      # Find the full path of the selected file
      local selected_file="${mcworld_files[${REPLY}-1]}"

      msg_info "Installing world from $mcworld_file..."

      # Remove existing world folder content
      msg_warn "Removing existing world folder..."
      rm -rf "$extract_dir"/*

      # Extract the new world
      msg_info "Extracting new world..."
      unzip -o "$selected_file" -d "$extract_dir" &>/dev/null
      msg_ok "World installed at: $extract_dir"

      # Start the server after the world is installed (if it was running)
      if [[ "$was_running" == true ]]; then
        msg_info "Starting server '$server_name'..."
        start_server $server_name
        msg_ok "Server '$server_name' started successfully."
      else
        msg_info "Skipping server start."
      fi
      
      # Exit the loop after successful installation
      return 0
    done
  done
}

# Install addon to server
install_addons() {
  local server_name="$1"
  
  # Directories
  local addon_dir="$SCRIPTDIR/content/addons"
  local server_dir="$SCRIPTDIR/bedrock_server_manager/$server_name"
  local server_properties="$server_dir/server.properties"

  # Check if server.properties exists
  if [[ ! -f "$server_properties" ]]; then
    msg_warn "server.properties not found in $server_dir"
    return 1
  fi
  
  # Get the world name from the server.properties file
  local world_name
  world_name=$(grep "^level-name=" "$server_properties" | sed -E 's/^level-name=([a-zA-Z0-9_ -]+)$/\1/')

  # If we couldn't find the world name, return an error
  if [[ -z "$world_name" ]]; then
    msg_error "Could not find level-name in server.properties"
    return 1
  fi

  msg_info "World name from server.properties: $world_name"

  local behavior_dir="$server_dir/worlds/$world_name/behavior_packs"
  local resource_dir="$server_dir/worlds/$world_name/resource_packs"
  local behavior_json="$server_dir/worlds/$world_name/world_behavior_packs.json"
  local resource_json="$server_dir/worlds/$world_name/world_resource_packs.json"
  local world_folder="$server_dir/worlds/$world_name"

  # Create directories if they don't exist
  mkdir -p "$behavior_dir" "$resource_dir"

  ## Collect .mcaddon and .mcpack files using globbing
  local addon_files=()
  #addon_files+=("$addon_dir"/*.mcaddon)
  addon_files+=("$addon_dir"/*.mcpack)

  # If no addons found, return an error
  if [[ ${#addon_files[@]} -eq 0 ]]; then
    msg_warn "No .mcaddon or .mcpack files found in $addon_dir"
    return 0
  fi

  # Show selection menu
  PS3="Select an addon to install (1-${#addon_files[@]}): "
  while true; do
    echo "Available addons to install:"
    select addon_file in "${addon_files[@]}"; do
      if [[ -z "$addon_file" ]]; then
        msg_error "Invalid selection. Please choose a valid option."
        break
      fi

      msg_info "Processing addon: $(basename "$addon_file")"
      
      # Extract addon name (strip file extension)
      local addon_name
      addon_name=$(basename "$addon_file" | sed -E 's/\.(mcaddon|mcpack)$//')

      # If it's a .mcaddon, extract it
      if [[ "$addon_file" == *.mcaddon ]]; then
        local temp_dir
        temp_dir=$(mktemp -d)

        msg_info "Extracting $(basename "$addon_file")..."

        # Unzip the .mcaddon file to a temporary directory
        unzip -o "$addon_file" -d "$temp_dir" &>/dev/null

        # Handle contents of the .mcaddon file
        # Check for the existence of .mcpack or .mcworld files inside the .mcaddon
        for world_file in "$temp_dir"/*.mcworld; do
          if [[ -f "$world_file" ]]; then
            msg_info "Processing .mcworld file: $world_file"
            extract_worlds "$server_name" "$world_file"
          fi
        done

        # Handle .mcpack files (behavior or resource packs)
        for pack_file in "$temp_dir"/*.mcpack; do
          if [[ -f "$pack_file" ]]; then
            msg_info "Processing .mcpack file: $pack_file"
            # Extract pack name and version from the .mcpack (manifest.json inside)
            pack_name=$(basename "$pack_file" | sed -E "s/\.(mcpack)$//")
            pack_version=$(unzip -p "$pack_file" "manifest.json" | jq -r ".header.version | join(\".\")")
            formatted_pack_name=$(echo "$pack_name" | tr "[:upper:]" "[:lower:]" | tr " " "_")
            
            # Ensure the correct behavior and resource directories are created relative to world directory
            addon_behavior_dir="$behavior_dir/$formatted_pack_name"_"$pack_version"
            addon_resource_dir="$resource_dir/$formatted_pack_name"_"$pack_version"
            mkdir -p "$addon_behavior_dir" "$addon_resource_dir"

            # Copy the files from .mcpack
            unzip -o "$pack_file" -d "$temp_dir"
            cp -r "$temp_dir"/* "$addon_behavior_dir"
            update_pack_json "$behavior_json" "$(jq -r '.header.uuid' "$pack_file")" "$pack_version"
          fi
        done

        rm -rf "$temp_dir"
        msg_ok "$(basename "$addon_file") extracted and installed."

      # If it's a .mcpack, process the manifest
      elif [[ "$addon_file" == *.mcpack ]]; then
        local temp_dir
        temp_dir=$(mktemp -d)
        msg_info "Extracting $(basename "$addon_file")..."
        unzip -o "$addon_file" -d "$temp_dir" &>/dev/null
        
        # Parse the manifest.json
        if [[ -f "$temp_dir/manifest.json" ]]; then
          local pack_type
          pack_type=$(jq -r '.modules[0].type' "$temp_dir/manifest.json")
          local uuid
          uuid=$(jq -r '.header.uuid' "$temp_dir/manifest.json")
          local version
          version=$(jq -r '.header.version | join(".")' "$temp_dir/manifest.json")
          local addon_name_from_manifest
          addon_name_from_manifest=$(jq -r '.header.name' "$temp_dir/manifest.json")
          local formatted_addon_name
          formatted_addon_name=$(echo "$addon_name_from_manifest" | tr '[:upper:]' '[:lower:]' | tr ' ' '_')

          # Combine addon name and version to create folder name
          local addon_behavior_dir="$behavior_dir/$formatted_addon_name"_"$version"
          local addon_resource_dir="$resource_dir/$formatted_addon_name"_"$version"
          mkdir -p "$addon_behavior_dir" "$addon_resource_dir"
          
          # Handle copying files
          if [[ "$pack_type" == "data" ]]; then
            msg_info "Installing behavior pack to $addon_behavior_dir"
            cp -r "$temp_dir"/* "$addon_behavior_dir"
            update_pack_json "$behavior_json" "$uuid" "$version" "$addon_name_from_manifest"
          elif [[ "$pack_type" == "resources" ]]; then
            msg_info "Installing resource pack to $addon_resource_dir"
            cp -r "$temp_dir"/* "$addon_resource_dir"
            update_pack_json "$resource_json" "$uuid" "$version" "$addon_name_from_manifest"
          else
            msg_error "Unknown pack type: $pack_type"
          fi
        else
          msg_error "manifest.json not found in $(basename "$addon_file")"
        fi

        rm -rf "$temp_dir"
      fi

      return 0
    done
  done
}

# Helper function to update pack JSON files
update_pack_json() {
  local json_file="$1"
  local uuid="$2"
  local version="$3"

  msg_info "Updating $json_file with UUID: $uuid and Version: $version"

  # If the JSON file doesn't exist, create it
  [[ ! -f "$json_file" ]] && echo "[]" > "$json_file"

  # Read existing JSON and check for duplicates
  local updated_json
  updated_json=$(jq --arg uuid "$uuid" --arg version "$version" '
    . as $packs
    | if any(.uuid == $uuid) then
        map(if .uuid == $uuid then
          if .version | split(".") | map(tonumber) < ($version | split(".") | map(tonumber)) then
            {uuid: $uuid, version: $version}
          else
            . 
          end
        else
          . 
        end)
      else
        . + [{uuid: $uuid, version: $version}]
      end' "$json_file")

  # Write updated JSON back to the file
  echo "$updated_json" > "$json_file"
  msg_ok "Updated $json_file with UUID $uuid and version $version."
}

# Main menu
main_menu() {
  while true; do
    echo
    echo -e "\033[1;34mBedrock Server Manager\033[0m"
    echo "1) Install a new server"
    echo "2) Install content"
    echo "3) Manage an existing server"
    echo "4) Send command to a server"
    echo "5) Attach to server console"
    echo "6) Exit"
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
            yes|y)
              configure_allowlist "$server_dir"
              break
              ;;
            no|n|"")
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

        # Ask if server should be started
        while true; do
          read -p "Do you want to start the server '$server_name' now? (y/N): " start_choice
          start_choice="${start_choice,,}"
          case "$start_choice" in
            yes|y)
              start_server "$server_name"
              break
              ;;
            no|n|"")
              msg_info "Server '$server_name' not started."
              break
              ;;
            *)
              msg_warn "Invalid input. Please answer 'yes' or 'no'."
              ;;
          esac
        done 

        ;;

      2) # Install content to server
        install_content
        ;;

      3) # Manage an existing server
        manage_server
        ;;

      4) # Send a command
        read -p "Enter server name: " server_name
        read -p "Enter command: " command
        send_command "$server_name" "$command"
        ;;

      5) # Attach to server console
        read -p "Enter server name: " server_name
        attach_console "$server_name"
        ;;

      6) # Exit
        exit 0
        ;;

      *)
        msg_warn "Invalid choice"
        ;;
    esac
  done
}

# Manage server
manage_server() {
  while true; do
    echo
    echo -e "\033[1;34mBedrock Server Manager\033[0m"
    echo "1) Update an existing server"
    echo "2) Start a server"
    echo "3) Stop a server"
    echo "4) Restart a server"
    echo "5) Backup a server"
    echo "6) Delete a server"
    echo "7) Edit a server's properties"
    echo "8) Configure a server's allow-list"
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

      4) # Restart a server
        read -p "Enter server name: " server_name
        restart_server "$server_name"
        ;;

      5) # Backup a server
        read -p "Enter server name: " server_name
        backup_server "$BASE_DIR/$server_name"
        ;;

      6) # Delete a server
        delete_server
        ;;

      7) # Edit server properties
        read -p "Enter server name: " server_name

        # Use default directory (./bedrock_server_manager/)
        local server_dir="$BASE_DIR/$server_name"

        configure_server_properties "$server_dir" "$server_name"
        ;;

      8) # Configure server allowlist
        read -p "Enter server name: " server_name

        # Use default directory (./bedrock_server_manager/)
        local server_dir="$BASE_DIR/$server_name"

        configure_allowlist "$server_dir"
        ;;  


      9) # Back
        main_menu
        ;;

      *)
        msg_warn "Invalid choice"
        ;;
    esac
  done
}

# Install content menu
install_content() {
  while true; do
    echo
    echo -e "\033[1;34mBedrock Server Manager\033[0m"
    echo "1) Install world"
    echo "2) Install addon (updates already installed addons only)"
    echo "3) Back"
    read -p "Select an option [1-3]: " choice

    case $choice in

      1) # Install .mcworld to server
        read -p "Enter server name: " server_name
        extract_worlds "$server_name"
        ;;

      2) # Install .mcpack/.mcaddon to sever
        read -p "Enter server name: " server_name
        install_addons "$server_name"
        ;;

      3) # Back
        main_menu
        ;;

      *)
        msg_warn "Invalid choice"
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

  update-script)
    # Update the script
    update_script
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
    echo "  update-script  -- Redownload script from github"
    echo
    echo "  main           -- Open the main menu"
    echo
    echo "  update-script  -- Redownloads script from github"
    echo
    echo "Version: $SCRIPTVERSION"
    echo "Credits: ZVortex11325"
    exit 1
    ;;
esac