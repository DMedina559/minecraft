#!/bin/bash
# Bedrock Server Manager
# Bedrock Server Manager is a bash script used to easily install/manage bedorck dedcated servers from the command line
# You may download and use this content for personal, non-commercial use. Any other use, including reproduction, or redistribution is prohibited without prior written permission.
# Change default config at ./config/script_config.json
# COPYRIGHT ZVORTEX11325 2025
# Author: ZVortex11325
# Version 1.4.1

handle_error() {
    local exit_code=$1
    local action="$2"

    msg_error "Error code: ${1}"
    case $exit_code in
        0)  echo "0" ; return 0 ;;  # Success, no action needed
        1)  msg_error "$action: General error occurred." ; echo "1" ;;
        2)  msg_error "$action: Missing required argument." ; echo "2" ;;
        3)  msg_error "$action: Unsupported package manager." ; echo "3" ;;
        4)  msg_error "$action: Missing required packages." ; echo "4" ;;
        5)  msg_error "$action: Invalid input." ; echo "5" ;;
        6)  msg_error "$action: Server not found." ; echo "6" ;;
        7)  msg_error "$action: Server already running." ; echo "7" ;;
        8)  msg_error "$action: Server not running." ; echo "8" ;;
        9)  msg_error "$action: Failed to install/update server." ; echo "9" ;;
        10) msg_error "$action: Failed to start/stop server." ; echo "10" ;;
        11) msg_error "$action: Failed to configure server properties." ; echo "11" ;;
        12) msg_error "$action: Failed to create systemd service." ; echo "12" ;;
        13) msg_error "$action: Failed to enable/disable service." ; echo "13" ;;
        14) msg_error "$action: Failed to read/write configuration file." ; echo "14" ;;
        15) msg_error "$action: Failed to download or extract files." ; echo "15" ;;
        16) msg_error "$action: Failed to create or remove directories." ; echo "16" ;;
        17) msg_error "$action: Failed to send command to server." ; echo "17" ;;
        18) msg_error "$action: Failed to attach to server console." ; echo "18" ;;
        19) msg_error "$action: Failed to configure allowlist." ; echo "19" ;;
        20) msg_error "$action: Failed to backup server." ; echo "20" ;;
        21) msg_error "$action: Failed to delete server." ; echo "21" ;;
        22) msg_error "$action: Failed to schedule cron job." ; echo "22" ;;
        23) msg_error "$action: Failed to monitor server resource usage." ; echo "23" ;;
        24) msg_error "$action: Internet connectivity test failed." ; echo "24" ;;
        25) msg_error "$action: Invalid server name." ; echo "25" ;;
        26) msg_error "$action: Invalid cron job input." ; echo "26" ;;
        27) msg_error "$action: Invalid pack type (for addons)." ; echo "27" ;;
        28) msg_error "$action: Failed to reload allowlist." ; echo "28" ;;
        29) msg_error "$action: Failed to migrate server directories." ; echo "29" ;;
        255) msg_warn "$action: User exited." ; echo "0" ;;
        *)  msg_error "$action: Unknown error ($exit_code)." ; echo "$exit_code" ;;
    esac

    return "$exit_code"
}

set -eo pipefail

# Script version
SCRIPTVERSION=$(grep -m 1 "^# Version" "$0" | sed -E 's/^# Version[[:space:]]+([0-9]+\.[0-9]+\.[0-9]+).*/\1/') # Get script version from top line
# Directory script it in
SCRIPTDIR=$(dirname "$(realpath "$0")")
# Config directory
CONFIGDIR=$SCRIPTDIR/.config
# Full path to script
SCRIPTDIRECT=$SCRIPTDIR/bedrock-server-manager.sh
# Get current date in YYYYMMDD formmat
log_timestamp=$(date +"%Y%m%d")
# Log file for script
scriptLog=$SCRIPTDIR/.logs/log_${log_timestamp}.log

# Save all script output to logfile
#exec > >(tee -a "$scriptLog") 2>&1

# Default color
RESET='\033[0m'
# Name
MAGENTA='\033[0;35m'
# Sub name
PINK='\033[0;95m'
# ERROR/NO
RED='\033[0;31m'
# OK/YES
GREEN='\033[0;32m'
# WARN/STATUS
YELLOW='\033[0;33m'
# INFO/Subsub name
CYAN='\033[0;36m'
#WHITE='\033[0;37m'
#GOLD='\033[0;33m'
#DARK_GREEN='\033[0;32m'
#GRAY='\033[0;90m'
#BLUE='\033[0;34m'

# Get current date in YYYYMMDD_HHMMSS formmat
get_timestamp() {
  date +"%Y%m%d_%H%M%S"
}

# Log script output to log file
log_to_file() {
  echo "$(date +"%Y-%m-%d %H:%M:%S") $1" >> "$scriptLog"
}

# Helper functions for logging with timestamps in the log file but no colors
msg_info()  { 
  local tag="${CYAN}[INFO]${RESET}"
  local message="[INFO] $1"
  echo -e "$tag $1" >&2
  log_to_file "$message"
}

msg_ok()  { 
  local tag="${GREEN}[OK]${RESET}"
  local message="[OK] $1"
  echo -e "$tag $1" >&2
  log_to_file "$message"
}

msg_warn()  { 
  local tag="${YELLOW}[WARN]${RESET}"
  local message="[WARN] $1"
  echo -e "$tag $1" >&2
  log_to_file "$message"
}

msg_error()  { 
  local tag="${RED}[ERROR]${RESET}"
  local message="[ERROR] $1"
  echo -e "$tag $1" >&2
  log_to_file "$message"
}

msg_debug() { 
  log_to_file "[DEBUG] $1"
}

# Remove old logs
manage_log_files() {
    local log_dir="$SCRIPTDIR/.logs"
    local max_files=10
    local max_size_mb=15
    local action="manage log files"

    # Ensure log directory exists
    mkdir -p "$log_dir"
    if [[ $? -ne 0 ]]; then
      return $(handle_error 16 "$action") # Failed to create directory
    fi

    msg_debug "Managing log files in: $log_dir"

    # Get list of log files, sorted by modification time (newest first)
    local log_files=($(ls -t "$log_dir" 2>/dev/null))
    if [[ $? -ne 0 ]]; then
        msg_warn "Failed to list log files in $log_dir.  Log management may be incomplete."
        # Continue anyway, as some cleanup might still be possible
    fi

    # Count existing log files
    local num_log_files=${#log_files[@]}

    # --- Count-Based Cleanup (unchanged) ---
    if [[ "$num_log_files" -gt "$max_files" ]]; then
        msg_debug "Performing log file count-based cleanup (keeping last $max_files)..."
        ls -t "$log_dir" 2>/dev/null | tail -n +$((max_files + 1)) | xargs -r rm -f
        if [[ $? -ne 0 ]]; then
            msg_warn "Failed to delete some old log files (count-based cleanup)."
            # Continue anyway, as size-based cleanup might still help.
        fi
        msg_debug "Old log files deleted, keeping last $max_files."
    else
        msg_debug "Log file count is within limit ($num_log_files files, max $max_files). Skipping count-based cleanup."
    fi

    # --- Size-Based Cleanup (size reduction) ---
    local total_size_mb_actual=$(du -sb "$log_dir" 2>/dev/null | awk '{print $1}')
    if [[ $? -ne 0 ]]; then
      msg_warn "Failed to get total size of log directory. Size-based cleanup may be inaccurate."
      # Continue anyway, as some cleanup might still be possible
    fi
    total_size_mb_actual=$((total_size_mb_actual / 1048576))

    if [[ "$total_size_mb_actual" -gt "$max_size_mb" ]]; then
        msg_warn "Log directory size exceeds limit ($total_size_mb_actual MB > $max_size_mb MB). Reducing size..."

        # --- MODIFIED DELETION LOOP ---
        while [[ "$total_size_mb_actual" -gt "$max_size_mb" ]]; do
            oldest_log_file=$(ls -rt "$log_dir" 2>/dev/null | head -n 1) # Get oldest file
            if [[ $? -ne 0 ]]; then
                msg_warn "Failed to list log files in $log_dir.  Log management may be incomplete."
                 break # Exit loop, since we can no longer determine the file list
            fi

            if [[ -n "$oldest_log_file" ]]; then
                rm -f "$log_dir/$oldest_log_file"
                if [[ $? -ne 0 ]]; then
                    msg_warn "Failed to delete log file: $log_dir/$oldest_log_file"
                   break  # Exit on delete failure
                fi
                log_files=($(ls -t "$log_dir" 2>/dev/null)) # Re-list files after deletion
                num_log_files=${#log_files[@]}              # Re-count files
                total_size_bytes=$(du -sb "$log_dir" 2>/dev/null | awk '{print $1}') # Re-calculate size
                if [[ $? -ne 0 ]]; then
                  msg_warn "Failed to get total size of log directory. Size-based cleanup may be inaccurate."
                   break
                fi
                total_size_mb_actual=$((total_size_bytes / 1048576)) # Re-convert to MB
            else
                msg_warn "No more log files to delete to reduce size."
                break # Exit loop if no more files to delete (shouldn't happen if directory was over size initially)
            fi
            if [[ "$num_log_files" -le "$max_files" && "$total_size_mb_actual" -le "$max_size_mb" ]]; then
                msg_debug "Log directory now within both size and count limits after cleanup."
                break # Exit loop if both count and size are now within limits
            fi
        done
        # --- END MODIFIED DELETION LOOP ---

        msg_debug "Log directory size reduced to $total_size_mb_actual MB (limit: $max_size_mb MB)."
    else
        msg_debug "Log directory size is within limit ($total_size_mb_actual MB, max $max_size_mb MB). Skipping size-based cleanup."
    fi

    msg_debug "Log file management completed."
    return 0
}
manage_log_files

# Dependencies Check
setup_prerequisites() {
  # List of required packages
  local packages=("curl" "jq" "unzip" "systemd" "screen" "zip")
  local action="setup prerequisites"

  # Detect package manager
  if command -v apt-get &>>$scriptLog; then
    package_manager="apt-get"
    install_command="apt-get install -y"
  #elif command -v yum &>>$scriptLog; then
  #  package_manager="yum"
  #  install_command="yum install -y"
  #elif command -v dnf &>>$scriptLog; then
  #  package_manager="dnf"
  #  install_command="dnf install -y"
  #elif command -v zypper &>>$scriptLog; then  # OpenSUSE/SLES
  #      package_manager="zypper"
  #      install_command="zypper install -y"
  #elif command -v pacman &>>$scriptLog; then  # Arch Linux
  #      package_manager="pacman"
  #      install_command="pacman -S --noconfirm"
  else
    msg_error "Unsupported package manager.  Please install the following packages manually: ${packages[*]}"
    return $(handle_error 3 "$action") # Unsupported package manager
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
    msg_debug "All required packages are already installed."
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
        if [[ $? -ne 0 ]]; then
            msg_error "Failed to install required packages. Please install them manually: ${packages[*]}"
            return $(handle_error 4 "$action") #Missing required packages.
        fi
      msg_ok "All required packages are now installed."
      break  # Exit the loop after successful installation
    elif [[ "$user_response" =~ ^(n|no)$ ]]; then
      msg_error "Missing packages are required to proceed. Exiting..."
      return $(handle_error 4 "$action") #Missing required packages
    else
      msg_warn "Invalid input. Please answer 'yes' or 'no'."
    # No 'return' here. We want to loop again for invalid input.
    fi
  done
  return 0
}

setup_prerequisites

# Check internet connection
check_internet_connectivity() {
    local action="check internet connectivity"
    msg_debug "Checking internet connectivity"
    if ! ping -c 1 -W 2 example.com &>>$scriptLog; then
        msg_warn "Connectivity test failed."
        return $(handle_error 24 "$action") # Internet connectivity test failed
    fi
    msg_debug "Internet connectivity OK."
    return 0
}

# Download the updated script and restart it
update_script() {
  local action="update script"
  msg_info "Redownloading script..."
  local script_url="https://raw.githubusercontent.com/DMedina559/minecraft/main/scripts/bedrock-server-manager.sh"
  wget -q -O "$SCRIPTDIR/bedrock-server-manager.sh" "$script_url"
  if [[ $? -ne 0 ]]; then
    msg_error "Failed to download updated script."
    return $(handle_error 1 "$action")  # General error
  fi
  msg_ok "Done."
  return 0 # Success
}

# Write/validate script config
write_config_if_not_exists() {
  local config_file="$CONFIGDIR/script_config.json"
  local required_keys=("BASE_DIR" "BACKUP_KEEP" "DOWNLOAD_KEEP") # Array of required keys
  local config_valid=true # Assume config is valid initially
  local action="write config if not exists"

  msg_debug "Checking configuration file: '$config_file'"

  # Check if config file exists
  if [[ ! -f "$config_file" ]]; then
    msg_debug "Configuration file not found. Proceeding to write default config."
    config_valid=false # Force write default config
  else
    msg_debug "Configuration file exists. Validating content."

    # Validate JSON format by attempting to parse
    if ! jq '.' "$config_file" &>/dev/null; then # Check if jq can parse without errors
      msg_warn "Warning: Configuration file is not valid JSON. Recreating config with defaults."
      rm -f "$config_file"
      if [[ $? -ne 0 ]]; then
        msg_warn "Failed to remove invalid config file. This may cause issues."
        return $(handle_error 16 "$action") # Return error
      fi
      config_valid=false
    else
      msg_debug "Configuration file is valid JSON. Checking for required keys."

      # Check for required keys
      for req_key in "${required_keys[@]}"; do
        if ! jq -e "has(\"$req_key\")" "$config_file" &>/dev/null; then # Check if key exists
          msg_warn "Warning: Required key '$req_key' is missing from config. Recreating config with defaults."
          config_valid=false
          break # No need to check further keys if one is missing, we'll recreate anyway
        fi
      done

      if [[ "$config_valid" == true ]]; then
        msg_debug "Configuration file is valid and contains all required keys."
      fi
    fi
  fi

  # Write default config if file was not valid or didn't exist
  if [[ "$config_valid" == false ]]; then
    msg_debug "Writing default configuration..."
    manage_script_config "BASE_DIR" "write" "$SCRIPTDIR/servers"
      if [[ $? -ne 0 ]]; then
          msg_error "Failed to set default for BASE_DIR, exiting script"
          return $(handle_error 14 "$action")
      fi
    manage_script_config "BACKUP_KEEP" "write" "3"
      if [[ $? -ne 0 ]]; then
        msg_error "Failed to set default for BACKUP_KEEP, exiting script"
        return $(handle_error 14 "$action")
      fi
    manage_script_config "DOWNLOAD_KEEP" "write" "3"
      if [[ $? -ne 0 ]]; then
        msg_error "Failed to set default for DOWNLOAD_KEEP, exiting script"
        return $(handle_error 14 "$action")
      fi
    msg_debug "Default configuration written to '$config_file'."
  else
    msg_debug "Configuration file is valid."
  fi
  return 0
}

# Manage script config file
manage_script_config() {
  local key="$1"
  local operation="$2"
  local value="$3"
  local SCRIPTCONFDIR="$CONFIGDIR"
  local config_file="$SCRIPTCONFDIR/script_config.json"
  local action="manage script config"

    if [[ -z "$key" ]]; then
        msg_error "manage_script_config: key is empty."
        return $(handle_error 2 "$action") # Missing argument
    fi
    if [[ -z "$operation" ]]; then
      msg_error "manage_script_config: operation is empty"
      return $(handle_error 2 "$action") # Missing argument
    fi

  # Ensure the configuration directory exists
  mkdir -p "$SCRIPTCONFDIR"
  if [[ $? -ne 0 ]]; then
    msg_error "Failed to create config directory: $SCRIPTCONFDIR"
    return $(handle_error 16 "$action") # Failed to create directory
  fi


  # Create config.json with an empty JSON object if it doesn't exist
  if [[ ! -f "$config_file" ]]; then
    msg_debug "config.json not found in $SCRIPTCONFDIR. Creating a new one."
    echo '{}' > "$config_file"
    if [[ $? -ne 0 ]]; then
      msg_error "Failed to initialize config.json"
      return $(handle_error 14 "$action") # Failed to write file
    fi
  fi

  # Read the existing config.json, or start with an empty object if reading fails
  local current_config
  current_config=$(jq '.' "$config_file" 2>>$scriptLog)
    if [[ $? -ne 0 ]]; then  #Check if loading fails
        msg_error "Failed to read or parse existing config.json."
        return $(handle_error 14 "$action") # Failed to read file
    fi
  if [[ -z "$current_config" ]]; then
    current_config='{}'
    msg_warn "Warning: Could not read or parse config.json. Starting with a clean configuration."
  fi

  # --- Operation Type Check and Logic ---
  case "$operation" in
    "read")
          msg_debug "Operating in READ mode."

          local read_value
          read_value=$(jq -r ".\"$key\" // empty" <<< "$current_config" 2>>$scriptLog)

          if [[ -n "$read_value" && "$read_value" != "null" ]]; then
            echo "$read_value" # Output the read value to stdout
            return 0
          else
            msg_warn "Warning: Key '$key' not found in config.json or value is empty."
            return $(handle_error 1 "$action") # Indicate key not found or empty value
          fi
          ;;

    "write")

      if [[ -z "$value" ]]; then
        msg_error "Error: Value is required for 'write' operation."
        return $(handle_error 2 "$action") #Missing argument
      fi

      # Update or add the key-value pair using the evaluated variable as the key
      local updated_config
      updated_config=$(jq --arg key "$key" --arg value "$value" '. + { ($key): $value }' <<< "$current_config")
        if [[ $? -ne 0 ]]; then
            msg_error "Failed to update config.json with key '$key'."
            return $(handle_error 14 "$action")  # Failed to write configuration file
        fi

      # Check if the jq command was successful
      if [[ -z "$updated_config" ]]; then
        msg_error "Error: Failed to update config.json using jq."
        return $(handle_error 14 "$action") # Failed to write config
      fi

      # Write the updated JSON back to config.json
      echo "$updated_config" > "$config_file"
        if [[ $? -ne 0 ]]; then
          msg_error "Failed to write to config.json"
          return $(handle_error 14 "$action") # Failed to read/write file
        fi

      msg_debug "Successfully updated '$key' in $config_file to: '$value'"
      return 0
      ;;

    *)
      msg_error "Error: Invalid operation type: '$operation'. Must be 'read' or 'write'."
      return $(handle_error 5 "$action") # Invalid Input
      ;;
  esac
}

# Define default config variables
default_config() {
  local action="load default configuration"
  msg_debug "Loading default configuration variables..."

  # Ensure the config file exists and has defaults written if needed
  write_config_if_not_exists
  if [[ $? -ne 0 ]]; then
    msg_error "Failed to write or validate config. Exiting"
    return $(handle_error 14 "$action") # Exit on failure
  fi

  # Now read the configuration values using manage_script_config and assign them to variables
  BASE_DIR=$(manage_script_config "BASE_DIR" read)
    if [[ $? -ne 0 ]]; then
        msg_error "Failed to read BASE_DIR from config. Exiting."
        return $(handle_error 14 "$action")  # Exit if BASE_DIR is missing
    fi
  BACKUP_KEEP=$(manage_script_config "BACKUP_KEEP" read)
    if [[ $? -ne 0 ]]; then
      msg_warn "Failed to read BACKUP_KEEP, defaulting to 3"
      BACKUP_KEEP=3 # Default value
      # Don't exit here; use the default value
    fi
  DOWNLOAD_KEEP=$(manage_script_config "DOWNLOAD_KEEP" read)
    if [[ $? -ne 0 ]]; then
      msg_warn "Failed to read DOWNLOAD_KEEP, defaulting to 3"
      DOWNLOAD_KEEP=3 # Default value
      # Don't exit here; use the default value
    fi

  msg_debug "Default configuration variables loaded."
    return 0 #Success
}

# Manage server config file
manage_server_config() {
  local server_name="$1"
  local key="$2"
  local operation="$3"
  local value="$4"
  local SERVERCONFDIR="$CONFIGDIR/$server_name"
  local config_file="$SERVERCONFDIR/${server_name}_config.json"
  local action="manage server config"

  msg_debug "Managing ${server_name}_config.json, Key: '$key', Operation: '$operation'"

  if [[ -z "$server_name" ]]; then
    msg_error "manage_server_config: server_name is empty."
    return $(handle_error 25 "$action")  # Invalid server name
  fi
  if [[ -z "$key" ]]; then
      msg_error "manage_server_config: key is empty."
      return $(handle_error 2 "$action")  # Missing argument
  fi
  if [[ -z "$operation" ]]; then
    msg_error "manage_server_config: operation is empty"
    return $(handle_error 2 "$action") # Missing argument
  fi

  # Ensure the configuration directory exists
  mkdir -p "$SERVERCONFDIR"
  if [[ $? -ne 0 ]]; then
    msg_error "Failed to create config directory: $SERVERCONFDIR"
    return $(handle_error 16 "$action") # Failed to create/remove directory
  fi

  # Create config.json with an empty JSON object if it doesn't exist
  if [[ ! -f "$config_file" ]]; then
    msg_debug "${server_name}_config.json not found in $SERVERCONFDIR. Creating a new one."
    echo '{}' > "$config_file"
      if [[ $? -ne 0 ]]; then
        msg_error "Failed to initialize ${server_name}_config.json."
        return $(handle_error 14 "$action")  # Failed to read/write configuration file
      fi
  fi

  # Read the existing config.json, or start with an empty object if reading fails
  local current_config
  current_config=$(jq '.' "$config_file" 2>>$scriptLog)
    if [[ $? -ne 0 ]]; then
        msg_error "Failed to read or parse existing ${server_name}_config.json."
        return $(handle_error 14 "$action")  # Failed to read/write configuration file
    fi
  if [[ -z "$current_config" ]]; then
    current_config='{}'
    msg_warn "Could not read or parse ${server_name}_config.json. Starting with a clean configuration."
  fi

  # --- Operation Type Check and Logic ---
  case "$operation" in
    "read")

      local read_value
      read_value=$(jq -r ".\"$key\" // empty" <<< "$current_config" 2>>$scriptLog)

      if [[ -n "$read_value" &&  "$read_value" != "null" ]]; then
        echo "$read_value" # Output the read value to stdout
        return 0
      else
        msg_warn "Key '$key' not found in ${server_name}_config.json or value is empty."
        return $(handle_error 1 "$action") # Indicate key not found or empty value
      fi
      ;;

    "write")

      if [[ -z "$value" ]]; then
        msg_error "Error: Value is required for 'write' operation."
        return $(handle_error 5 "$action") # Invalid input.
      fi

      # Update or add the key-value pair using the evaluated variable as the key
      local updated_config
      updated_config=$(jq --arg key "$key" --arg value "$value" '. + { ($key): $value }' <<< "$current_config")
      if [[ $? -ne 0 ]]; then
        msg_error "Failed to update ${server_name}_config.json using jq."
        return $(handle_error 14 "$action") # Failed to write
      fi

      # Check if the jq command was successful
      if [[ -z "$updated_config" ]]; then
        msg_error "Failed to update ${server_name}_config.json using jq."
        return $(handle_error 14 "$action") # Failed to write
      fi

      # Write the updated JSON back to config.json
      echo "$updated_config" > "$config_file"
      if [[ $? -ne 0 ]]; then
        msg_error "Failed to write to ${server_name}_config.json"
        return $(handle_error 14 "$action") # Failed to write
      fi

      msg_debug "Successfully updated '$key' in $config_file to: '$value'"
      return 0
      ;;

    *)
      msg_error "Invalid operation type: '$operation'. Must be 'read' or 'write'."
      return $(handle_error 5 "$action") # Invalid input
      ;;
  esac
}

# Validate if the server exists
validate_server() {
    local server_name="$1"
    local server_dir="$BASE_DIR/$server_name"
    local action="validate server"

    if [[ -z "$server_name" ]]; then
        msg_error "validate_server: server_name is empty."
        return $(handle_error 25 "$action") # Invalid server name.
    fi

    # Check if the server directory exists and contains bedrock_server
    if [[ ! -f "$server_dir/bedrock_server" ]]; then
        msg_warn "'bedrock_server' not found in $server_dir."
        return $(handle_error 1 "$action") # Using general error.
    fi

    msg_debug "$server_name valid"
    return 0
}

# Prompt user for server name and validate
get_server_name() {
    local action="get server name"
    while true; do
        read -p "Enter server name (or type 'exit' to cancel): " server_name

        if [[ "$server_name" == "exit" ]]; then
            msg_ok "Operation canceled."
            return 1 # User canceled, using general error is fine
        fi
        if [[ -z "$server_name" ]]; then
            msg_warn "Server name cannot be empty."
            continue
        fi

        if validate_server "$server_name"; then
            msg_debug "Server '$server_name' found."
            echo "$server_name"  # Output the server name to stdout
            return 0
        else
            msg_warn "Please enter a valid server name or type 'exit' to cancel."
        fi
    done
}

# Get the world name from server.properties
get_world_name() {
  local server_name="$1"
  local server_properties="$BASE_DIR/$server_name/server.properties"
  local action="get world name"

  if [[ -z "$server_name" ]]; then
    msg_error "get_world_name: server_name is empty"
    return $(handle_error 25 "$action") # Invalid server name
  fi
  
  msg_debug "Getting world name for: $server_name"

  # Check if server.properties exists
  if [[ ! -f "$server_properties" ]]; then
    msg_error "server.properties not found for $server_namr"
    return $(handle_error 11 "$action") # Failed to configure server properties
  fi
  
  local world_name=$(grep -E '^level-name=' "$server_properties" | cut -d'=' -f2)
    if [[ $? -ne 0 || -z "$world_name" ]]; then  # Check for empty world_name as well
        msg_error "Failed to extract world name from server.properties."
        return $(handle_error 1 "$action")  # General error: Extraction failed.
    fi

  msg_debug "World name: $world_name"
  echo "$world_name"
    return 0
}

# Gets the installed version of a server from its config.json file
get_installed_version() {
  local server_name="$1"
  local config_file="$CONFIGDIR/$server_name/${server_name}_config.json"
  local action="get installed version"

  msg_debug "Getting installed version for server: $server_name"

  # Ensure server name is provided
  if [[ -z "$server_name" ]]; then
    msg_error "No server name provided."
    return $(handle_error 2 "$action")  # Missing argument
  fi

  # Ensure the config file exists
  if [[ ! -f "$config_file" ]]; then
    msg_error "Config file not found: $config_file"
    return $(handle_error 14 "$action") # Failed to read file
  fi

  # Extract the installed_version from config.json
  local installed_version
  installed_version=$(manage_server_config "$server_name" "installed_version" "read" 2>>"$scriptLog")
  local read_exit_code=$? #store exit code from the manage_server_config

  # Handle missing or empty installed_version
  if [[ -z "$installed_version" || "$installed_version" == "UNKNOWN" || $read_exit_code -ne 0 ]]; then #Check exit code
    msg_warn "No installed_version found in config.json, defaulting to UNKNOWN."
    installed_version="UNKNOWN"
  else
    msg_debug "Installed version for $server_name: $installed_version"
  fi

  echo "$installed_version"
  return 0  # Success
}

# Read server_output.txt to check server status Running/Stopped
check_server_status() {
  local server_name="$1"
  local status="UNKNOWN"
  local log_file="$BASE_DIR/$server_name/server_output.txt"
  local max_attempts=20
  local attempt=0
  local chunk_size=500  # Start by scanning the last 500 lines
  local max_lines=5000  # Don't scan more than this to avoid lag
  local action="check server status"

  # Ensure server name is provided
    if [[ -z "$server_name" ]]; then
        msg_error "check_server_status: server_name is empty."
        return $(handle_error 25 "$action")  # Invalid server name
    fi

  # Ensure log file exists before proceeding
  while [[ ! -s "$log_file" && $attempt -lt $max_attempts ]]; do
    sleep 0.5  # Wait for the log to populate
    attempt=$((attempt + 1))
  done

  if [[ ! -s "$log_file" ]]; then
    echo "UNKNOWN"  # Handle case where log never appears
    return 0 # Success, but status is unknown
  fi

  local total_lines=$(wc -l < "$log_file")  # Get total lines in the log
  local read_lines=0  # Tracks how many lines we've scanned

  while [[ $read_lines -lt $max_lines ]]; do
    # Ensure we don't exceed the total number of lines
    local lines_to_read=$((chunk_size < total_lines - read_lines ? chunk_size : total_lines - read_lines))

    # Read the last "lines_to_read" lines, reversing them for bottom-to-top scanning
    local log_chunk=$(tail -n $((read_lines + lines_to_read)) "$log_file" | tac)

    while IFS= read -r line; do
      if [[ "$line" == *"Server started."* ]]; then
        status="RUNNING"
        break 2  # Exit both loops
      elif [[ "$line" == *"Starting Server"* ]]; then
        status="STARTING"
        break 2
      elif [[ "$line" == *"Restarting server in 10 seconds"* ]]; then
        status="RESTARTING"
        break 2
      elif [[ "$line" == *"Shutting down server in 10 seconds"* ]]; then
        status="STOPPING"
        break 2
      elif [[ "$line" == *"Quit correctly"* ]]; then
        status="STOPPED"
        break 2
      fi
    done <<< "$log_chunk"

    # If we found a status, break
    [[ "$status" != "UNKNOWN" ]] && break

    # Increase the read lines count
    read_lines=$((read_lines + chunk_size))

    # If we've scanned the entire log, stop
    if [[ $read_lines -ge $total_lines ]]; then
      break
    fi
  done

  msg_debug "$server_name status from output file: $status"

  echo "$status"
  return 0  # Explicit success return at the end
}

# Get status from config.json
get_server_status_from_config() {
  local server_name="$1"
  local SERVERCONFDIR="$CONFIGDIR/$server_name"
  local config_file="$SERVERCONFDIR/${server_name}_config.json"
  local status="UNKNOWN"
  local action="get server status from config"

    # Ensure server name is provided
    if [[ -z "$server_name" ]]; then
        msg_error "get_server_status_from_config: server_name is empty."
        return $(handle_error 25 "$action")  # Invalid server name
    fi

  # Ensure the config file exists before proceeding
  if [[ ! -f "$config_file" ]]; then
    msg_warn "Config file not found for $server_name. Returning UNKNOWN status."
    echo "$status"
    return 0 # Success: status is unknown because config is missing
  fi

  # Use jq to extract the status field, defaulting to UNKNOWN if empty
  status=$(manage_server_config "$server_name" "status" "read" 2>>$scriptLog)
    local read_exit_code=$?

  # Validate the status value
  if [[ -z "$status" || "$status" == "null" || $read_exit_code -ne 0 ]]; then
    status="UNKNOWN"
  fi

  echo "$status"
  return 0 #Success: status could be read and is now available
}

# Write server status to config file
update_server_status_in_config() {
  local server_name="$1"
  local action="update server status in config"

    # Ensure server name is provided
    if [[ -z "$server_name" ]]; then
        msg_error "update_server_status_in_config: server_name is empty."
        return $(handle_error 25 "$action")  # Invalid server name
    fi

  # Get the current status from the config.json
  local current_status
  current_status=$(manage_server_config "$server_name" "status" "read" 2>>$scriptLog)

  if [[ $? -ne 0 ]]; then
    msg_error "Failed to read current server status from config for $server_name."
    return $(handle_error 14 "$action") # Failed to read configuration file
  fi

  # Get the server status using the check_server_status function
  local status
  status=$(check_server_status "$server_name")

  if [[ $? -ne 0 ]]; then
    msg_error "Failed to retrieve server status for $server_name."
    return $(handle_error 1 "$action")  # General error (check_server_status always returns 0)
  fi

  # If the current status is "installed" and the retrieved status is "UNKNOWN", do not update
  if [[ "$current_status" == "installed" && "$status" == "UNKNOWN" ]]; then
    msg_debug "Status is 'installed' and retrieved status is 'UNKNOWN'. Not updating config.json."
    return 0 #Success, the current status is installed.
  fi

  # Update the status in the config.json using manage_server_config
  local key="status"
  local value="$status"
  manage_server_config "$server_name" "$key" "write" "$value"

  if [[ $? -eq 0 ]]; then
    msg_debug "Successfully updated server status for $server_name in config.json"
  else
    msg_error "Failed to update server status in config.json"
    return $(handle_error 14 "$action") # Failed to write configuration file.
  fi

  return 0 #Success: the status has been successfully written.
}

# Generate list of server status+version
list_servers_status() {
  local action="list servers status"
  echo -e "${PINK}Servers Status:${RESET}"
  echo "---------------------------------------------------"
  echo -e "${RESET}$(printf '%-20s' "SERVER NAME") $(printf '%-20s' "STATUS") $(printf '%-10s' "VERSION")"
  echo "---------------------------------------------------"

  if [[ ! -d "$BASE_DIR" ]]; then
    msg_error "Error: BASE_DIR does not exist or is not a directory."
    return $(handle_error 16 "$action") # Failed to create or remove directories
  fi

  local found_servers=false

  for server_path in "$BASE_DIR"/*; do
    if [[ -d "$server_path" ]]; then
      server_name=$(basename "$server_path")
      service_name="bedrock-${server_name}"
      status="${RED}UNKNOWN${RESET}"  # Default to UNKNOWN
      version="${RED}UNKNOWN${RESET}"       # Default to Unknown

      # Check if the service file exists
      if check_service_exists "$server_name"; then
        status="${YELLOW}CHECKING...${RESET}"  # Initial status while checking

        # Get server status safely
        server_status=$(get_server_status_from_config "$server_name" 2>>"$scriptLog")
        if [[ $? -eq 0 && -n "$server_status" ]]; then
          status="$server_status"
        else
          status="${RED}ERROR IN STATUS CHECK${RESET}"
          msg_error "Error in status check for $server_name"
          # No 'return' here.  We still want to show other servers.
        fi

        if [[ "$status" == "RUNNING" ]]; then
          status="${GREEN}${status}${RESET}"
        elif [[ "$status" == "STARTING" ]]; then
          status="${YELLOW}${status}${RESET}"
        elif [[ "$status" == "RESTARTING" ]]; then
          status="${YELLOW}${status}${RESET}"
        elif [[ "$status" == "STOPPING" ]]; then
          status="${YELLOW}${status}${RESET}"
        elif [[ "$status" == "STOPPED" ]]; then
          status="${RED}${status}${RESET}"
        else
          status="${YELLOW}${status}${RESET}" # Keep "CHECKING..." for unknown states
        fi

        # Get installed version safely
        retrieved_version=$(get_installed_version "$server_name" 2>>"$scriptLog")
        if [[ $? -eq 0 && -n "$retrieved_version" ]]; then #Check for get_installed_version's exit status.
          version="${YELLOW}$retrieved_version${RESET}"
        else
          version="${RED}ERROR GETTING VERSION${RESET}" # Indicate a problem.
          msg_error "Error retrieving version for $server_name"
        fi
      fi

      # Print the server status and version
      echo -e "${CYAN}$(printf '%-20s' "$server_name")${RESET} $(printf '%-20s' "$status") $(printf '%-10s' "") $(printf '%-10s' "$version")"
      found_servers=true
    fi
  done

  if [[ ! "$found_servers" ]]; then
    echo "No servers found."
  fi

  echo "---------------------------------------------------"
  echo
  return 0  # Always return 0
}

# Scan server_output.txt and extract player names & XUIDs
scan_player_data() {
  local players_data=()
  local action="scan player data"

  msg_info "Scanning for Players"

    if [[ ! -d "$BASE_DIR" ]]; then
        msg_error "Error: BASE_DIR does not exist or is not a directory."
        return $(handle_error 16 "$action") # Failed to create or remove directories
    fi

  # Scan each folder inside $BASE_DIR
  for server_folder in "$BASE_DIR"/*/; do
    msg_debug "Processing $(basename "$server_folder")"
    local log_file="${server_folder}server_output.txt"
    
    # Skip if the log file doesn't exist
    if [[ ! -f "$log_file" ]]; then
      msg_warn "Log file not found for $(basename "$server_folder"), skipping."
      continue  # Go to the next server folder
    fi

    # Flag to track if any players are found in the log
    local players_found=false

    # Extract player names and XUIDs
    while IFS= read -r line; do
      # Corrected regex for matching player name and XUID
      if [[ "$line" =~ \[.*INFO\]\ Player\ connected:\ ([^,]+),\ xuid:\ ([0-9]+) ]]; then
        local player_name="${BASH_REMATCH[1]}"
        local xuid="${BASH_REMATCH[2]}"
        
        msg_info "Found player: $player_name with XUID: $xuid"

        # Collect the player data
        players_data+=("$player_name:$xuid")
        players_found=true
      fi
    done < "$log_file"

    # If no players were found, skip to the next server folder
    if ! $players_found; then
      msg_info "No players found in $(basename "$server_folder"), skipping."
      continue # Go to next server folder
    fi
  done

  # If any player data was found, save it to the JSON file
  if [[ ${#players_data[@]} -gt 0 ]]; then
    save_players_to_json "${players_data[@]}"
    if [[ $? -ne 0 ]]; then
      return $(handle_error 14 "$action") # Error saving to JSON (read/write config file)
    fi
  else
    msg_info "No player data found across all servers."
  fi

  return 0 # Success
}

# Modify/validate players.json
save_players_to_json() {
  local players_file="$CONFIGDIR/players.json"
  local players_data=("$@")
  local action="save players to json"

  msg_info "Processing $players_data"

  mkdir -p "$(dirname "$players_file")"  # Ensure the config directory exists
  if [[ $? -ne 0 ]]; then
    msg_error "Failed to create directory for players.json"
    return $(handle_error 16 "$action")  # Directory creation failure
  fi


  # Create an empty JSON array if the file doesn't exist or is empty
  if [[ ! -f "$players_file" || ! -s "$players_file" ]]; then
    echo '{ "players": [] }' > "$players_file"
     if [[ $? -ne 0 ]]; then
        msg_error "Failed to initialize players.json"
        return $(handle_error 14 "$action") #Write failure
    fi
  fi

  # Read existing players into a temporary variable
  local existing_players
  existing_players=$(jq -r '.players | map({ (.xuid): .name }) | add' "$players_file" 2>>$scriptLog || echo "{}")
  if [[ $? -ne 0 ]]; then
    msg_error "Failed to read existing players from players.json"
    return $(handle_error 14 "$action") # Read failure
  fi

  declare -A unique_players  # Associative array for new unique players

  # Process the collected player data
  for player in "${players_data[@]}"; do
    local player_name=$(echo "$player" | cut -d: -f1)
    local xuid=$(echo "$player" | cut -d: -f2)

    # Skip if the player already exists in the JSON file
    if echo "$existing_players" | jq -e "has(\"$xuid\")" &>>$scriptLog; then
        if [[ $? -ne 0 ]]; then
           msg_warn "Error while checking for existing player with jq."
           # No fatal error here; continue
        fi
      continue
    fi

    # Store new unique players in an associative array
    unique_players["$xuid"]="$player_name"
  done

  # If no new players were found, exit
  if [[ ${#unique_players[@]} -eq 0 ]]; then
    msg_info "No new players found."
    return 0 # Success: No new players to add.
  fi

  # Prepare the JSON update
  local temp_file="$(mktemp)"
  echo '{ "players": [' > "$temp_file"
  if [[ $? -ne 0 ]]; then
    msg_error "Failed to write to temporary file"
    rm -f "$temp_file"
    return $(handle_error 1 "$action") # General Error (temporary file issue)
  fi

  local first_entry=true
  for xuid in "${!unique_players[@]}"; do
    [[ "$first_entry" == false ]] && echo "," >> "$temp_file"
    echo "  { \"name\": \"${unique_players[$xuid]}\", \"xuid\": \"$xuid\" }" >> "$temp_file"
    if [[ $? -ne 0 ]]; then
      msg_error "Failed to write to temporary file"
      rm -f "$temp_file"
      return $(handle_error 1 "$action") # General Error (temporary file issue)
    fi
    first_entry=false
  done
  echo "] }" >> "$temp_file"
   if [[ $? -ne 0 ]]; then
    msg_error "Failed to write to temporary file"
    rm -f "$temp_file"
    return $(handle_error 1 "$action") # General Error (temporary file issue)
   fi

  # Merge new players with existing JSON
  jq -s '.[0] * { "players": (.[0].players + .[1].players | unique_by(.xuid)) }' "$players_file" "$temp_file" > "$players_file.tmp" && mv "$players_file.tmp" "$players_file"
  if [[ $? -ne 0 ]]; then
    msg_error "Failed to merge player data into players.json"
    rm -f "$temp_file"
    return $(handle_error 14 "$action")  # File writing error
  fi


  # Cleanup
  rm "$temp_file"

  msg_ok "Players processed."
  return 0 #Success
}

# View current cron jobs and present options for next actions
cron_scheduler() {
    local server_name=$1
    local action="cron scheduler"
    clear

    # Ensure server name is provided
    if [[ -z "$server_name" ]]; then
        msg_error "cron_scheduler: server_name is empty."
        return $(handle_error 25 "$action")  # Invalid server name
    fi

    # Ask user what to do
    while true; do
        clear
        echo -e "${MAGENTA}Bedrock Server Manager${RESET} - ${PINK}Task Scheduler${RESET}"
        echo -e "You can schedule various server task."
        echo -e "Current scheduled task for ${CYAN}${server_name}${RESET}:"
        cron_jobs=$(get_server_cron_jobs "$server_name")
        if [[ $? -ne 0 ]]; then
            msg_error "Failed to retrieve cron jobs for $server_name"
            sleep 2
            continue  # Retry the loop.
        fi
        display_cron_job_table "$cron_jobs"
        if [[ $? -ne 0 ]]; then
            msg_error "Failed to display cron job table"
            sleep 2
            continue # Retry the loop.
        fi


        echo "What would you like to do?"
        echo "1) Add Job"
        echo "2) Modify Job"
        echo "3) Delete Job"
        echo "4) Back"
        read -p "Enter the number (1-4): " choice
        case $choice in
            1) 
                add_cron_job "$server_name"
                if [[ $? -ne 0 ]]; then
                  msg_error "add_cron_job failed."
                  # No return here, go back to the menu
                fi
                ;;
            2)
                modify_cron_job "$server_name"
                if [[ $? -ne 0 ]]; then
                   msg_error "modify_cron_job failed."
                   # No return here, go back to the menu
                fi
                ;;
            3)
                delete_cron_job "$server_name"
                if [[ $? -ne 0 ]]; then
                    msg_error "delete_cron_job failed."
                    # No return here, go back to the menu
                fi
                ;;
            4) return 0 ;;  # Explicitly return 0 for "Back"
            *) msg_warn "Invalid choice. Please try again." ;;
        esac
    done
}

# Get cron jobs for server
get_server_cron_jobs() {
    local server_name=$1
    local action="get server cron jobs"

    # Ensure server name is provided
    if [[ -z "$server_name" ]]; then
        msg_error "get_server_cron_jobs: server_name is empty."
        return $(handle_error 25 "$action")  # Invalid server name
    fi

    # Try to get the cron jobs
    cron_jobs=$(crontab -l 2>&1)  # Capture both stdout and stderr

    # Check for errors from crontab -l *before* filtering
    if [[ "$cron_jobs" == *"no crontab for"* ]]; then
        echo -e "${YELLOW}No crontab for current user.${RESET}"
        echo "undefined"
        return 0  # No crontab is not an error in this context
    fi

    if [[ $? -ne 0 ]]; then
        msg_error "Error running crontab -l: $cron_jobs"
        echo "undefined"
        return $(handle_error 22 "$action")  # Failed to schedule cron job
    fi

    # Filter for the specific server's cron jobs *after* error checking.
    cron_jobs=$(echo "$cron_jobs" | grep -E "(--server ${server_name}|scan-players)")

    if [ -z "$cron_jobs" ]; then
        echo -e "${YELLOW}No scheduled cron jobs found for $server_name.${RESET}"
        echo "undefined"
    else
        echo "$cron_jobs" # Return the cron jobs string
    fi

     return 0 # Success in either case (jobs found or not found)
}

# Displays a table of task for server
display_cron_job_table() {
    local cron_jobs="$1"
    local action="display cron job table"

    if [ "$cron_jobs" = "undefined" ]; then
        return 0 # Already handled "No scheduled cron jobs found." in get_server_cron_jobs
    else
        echo "-------------------------------------------------------"
        echo -e "${RESET}$(printf '%-15s' "CRON JOBS") $(printf '%-20s' "SCHEDULE") $(printf '%-5s' "") $(printf '%-10s' "COMMAND")"
        echo "-------------------------------------------------------"
        # Loop through cron jobs and display them in readable format
        echo "$cron_jobs" | while IFS= read -r cron_job; do

            # Use awk to split the line, but handle the command separately
            minute=$(echo "$cron_job" | awk '{print $1}')
            hour=$(echo "$cron_job" | awk '{print $2}')
            day=$(echo "$cron_job" | awk '{print $3}')
            month=$(echo "$cron_job" | awk '{print $4}')
            weekday=$(echo "$cron_job" | awk '{print $5}')
            command=$(echo "$cron_job" | cut -d' ' -f6-) # Get everything from the 6th field onwards
            command="${command#*bedrock-server-manager}" # Remove up to bedrock-server-manager
            command="${command#*.sh}" # Remove .sh (if present)
            command="${command# }" # Remove the leading space
            command="${command%% --*}" # Remove everything after the first --

            # Convert to readable format
            convert_to_readable_schedule "$month" "$day" "$hour" "$minute" "$weekday"
            if [[ $? -ne 0 ]]; then
                msg_error "Failed to convert schedule to readable format"
                schedule_time="ERROR"
            fi

            echo -e "${CYAN}$(printf '%-10s' "${cron_job%%/*}")${RESET} ${GREEN}$(printf '%-20s' "$schedule_time")${RESET} $(printf '%-5s' "") ${YELLOW}$(printf '%-10s' "$command")${RESET}"
            echo ""
        done
        echo "-------------------------------------------------------"
    fi

    return 0  #Always return 0, it's a display function
}

# Function to add a new cron job
add_cron_job() {
    local server_name=$1
    local command=""
    local action="add cron job"
    clear

    # Ensure server name is provided
    if [[ -z "$server_name" ]]; then
        msg_error "add_cron_job: server_name is empty."
        return $(handle_error 25 "$action")  # Invalid server name
    fi

    echo -e "${MAGENTA}Bedrock Server Manager${RESET} - ${PINK}Task Scheduler${RESET}"
    cron_jobs=$(get_server_cron_jobs "$server_name")
    if [[ $? -ne 0 ]]; then
        msg_error "Failed to get existing cron jobs"
        # Return to the cron_scheduler menu, do not exit or prevent adding a job
    fi

    display_cron_job_table "$cron_jobs"
     if [[ $? -ne 0 ]]; then
        msg_error "Failed to display existing cron jobs"
        # Return to the cron_scheduler menu, do not exit or prevent adding a job
    fi


    # Prompt user for cron job details
    echo "Choose the command for '$server_name':"
    echo "1) Update Server"
    echo "2) Backup Server"
    echo "3) Start Server"
    echo "4) Stop Server"
    echo "5) Restart Server"
    echo "6) Scan Players"
    while true; do
        read -p "Enter the number (1-6): " choice

        case $choice in
            1) command="$SCRIPTDIRECT update-server --server $server_name" ; break ;;
            2) command="$SCRIPTDIRECT backup-server --server $server_name" ; break ;;
            3) command="$SCRIPTDIRECT start-server --server $server_name" ; break ;;
            4) command="$SCRIPTDIRECT stop-server --server $server_name" ; break ;;
            5) command="$SCRIPTDIRECT restart-server --server $server_name" ; break ;;
            6) command="$SCRIPTDIRECT scan-players" ; break ;;
            *) msg_warn "Invalid choice, please try again." ;;
        esac
    done

    # Get cron timing details with validation
    while true; do
        read -p "Month (1-12 or *): " month
        validate_cron_input "$month" 1 12
        if [[ $? -ne 0 ]]; then
          continue # Retry input
        fi

        read -p "Day of Month (1-31 or *): " day
        validate_cron_input "$day" 1 31
         if [[ $? -ne 0 ]]; then
          continue # Retry input
        fi

        read -p "Hour (0-23): " hour
        validate_cron_input "$hour" 0 23
        if [[ $? -ne 0 ]]; then
          continue # Retry input
        fi

        read -p "Minute (0-59): " minute
        validate_cron_input "$minute" 0 59
        if [[ $? -ne 0 ]]; then
          continue # Retry input
        fi

        read -p "Day of Week (0-7, 0 or 7 for Sunday or *): " weekday
        validate_cron_input "$weekday" 0 7
        if [[ $? -ne 0 ]]; then
          continue # Retry input
        fi

        break  # All inputs valid
    done

    # Convert to readable format
    convert_to_readable_schedule "$month" "$day" "$hour" "$minute" "$weekday"
    if [[ $? -ne 0 ]]; then
        msg_error "Failed to convert schedule to readable format."
         schedule_time="ERROR CONVERTING"
    fi

    echo "Your cron job will run with the following schedule:"

    echo "-------------------------------------------------------"
    echo -e "${RESET}$(printf '%-15s' "CRON JOB") $(printf '%-20s' "SCHEDULE") $(printf '%-5s' "") $(printf '%-10s' "COMMAND")"
    echo "-------------------------------------------------------"

        display_command="${command#*bedrock-server-manager}" # Remove up to bedrock-server-manager
        display_command="${display_command#*.sh}" # Remove .sh (if present)
        display_command="${display_command# }" # Remove the leading space
        display_command="${display_command%% --*}" # Remove everything after the first --

        echo -e "${CYAN}$(printf '%-10s' "${YELLOW}${minute} ${hour} ${day} ${month} ${weekday}${RESET}")${RESET} ${GREEN}$(printf '%-25s' "$schedule_time")${RESET} $(printf '%-5s' "") ${YELLOW}$(printf '%-10s' "$display_command")${RESET}"
        echo ""
    echo "-------------------------------------------------------"

    while true; do
        read -p "Do you want to add this job? (y/n): " confirm
        confirm="${confirm,,}"  # Convert to lowercase
        case "$confirm" in
            yes|y)
                # Improved cron command handling:
                if crontab -l 2>>$scriptLog | grep -q . ; then # Check if crontab exists
                  (crontab -l; echo "$minute $hour $day $month $weekday $command") | crontab -
                else
                  echo "$minute $hour $day $month $weekday $command" | crontab - # Add to empty crontab
                fi

                if [[ $? -ne 0 ]]; then  # Check if crontab command failed
                  msg_error "Failed to add cron job."
                  return $(handle_error 22 "$action")  # Failed to schedule cron job
                fi

                msg_ok "Cron job added successfully!"
                return 0 # Success
                ;;
            no|n|"")
                msg_info "Cron job not added."
                return 0 # Success: User chose not to add.
                ;;
            *)
                msg_warn "Invalid input. Please answer 'yes' or 'no'."
                ;;
        esac
    done
}

# Function to modify an existing cron job
modify_cron_job() {
    local server_name="$1"
    local action="modify cron job"

    # Ensure server name is provided
    if [[ -z "$server_name" ]]; then
        msg_error "modify_cron_job: server_name is empty."
        return $(handle_error 25 "$action")  # Invalid server name
    fi

    echo "Current scheduled cron jobs for '$server_name':"

    # Retrieve cron jobs using your unchanged get_server_cron_jobs function
    local cron_jobs
    cron_jobs=$(get_server_cron_jobs "$server_name")
    if [[ $? -ne 0 ]]; then
        msg_error "Failed to retrieve cron jobs for $server_name"
        return $(handle_error 22 "$action")  # Failed to schedule cron job
    fi
    msg_debug "Value of cron_jobs after get_server_cron_jobs: '$cron_jobs'"

    # Check if get_server_cron_jobs returned "undefined" or an empty string (no jobs found)
    if [[ "$cron_jobs" == "undefined" ]] || [[ -z "$cron_jobs" ]]; then
        echo "No scheduled cron jobs found to modify."
        return 0 # Success: No jobs to modify
    fi

    # Convert the multi-line cron_jobs string into an array using mapfile
    mapfile -t cron_jobs_array <<< "$cron_jobs"

    # Ensure that we have at least one cron job in the array
    if [[ ${#cron_jobs_array[@]} -eq 0 ]]; then
        echo "No scheduled cron jobs found to modify."
        return 0 # Success: no jobs to modify
    fi

    # Display the list of cron jobs with index numbers
    local index=1
    for line in "${cron_jobs_array[@]}"; do
        echo "$index) $line"
        ((index++))
    done

    # Get user input to select the job to modify
    read -p "Enter the number of the job you want to modify: " job_number

    # Validate the user input
    if ! [[ "$job_number" =~ ^[0-9]+$ ]] || (( job_number < 1 || job_number > ${#cron_jobs_array[@]} )); then
        msg_warn "Invalid selection. No matching cron job found."
        return $(handle_error 26 "$action")  # Invalid cron job input
    fi

    local job_to_modify="${cron_jobs_array[$((job_number - 1))]}"

    # Extract the command part of the cron job (everything after the time fields)
    local job_command
    job_command=$(echo "$job_to_modify" | awk '{for (i=6; i<=NF; i++) printf $i " "; print ""}')

    # Get new cron timing details with validation
    echo "Modify the timing details for this cron job:"
    local month day hour minute weekday
    while true; do
        read -p "Month (1-12 or *): " month
        validate_cron_input "$month" 1 12
        if [[ $? -ne 0 ]]; then continue; fi

        read -p "Day of Month (1-31 or *): " day
        validate_cron_input "$day" 1 31
        if [[ $? -ne 0 ]]; then continue; fi

        read -p "Hour (0-23): " hour
        validate_cron_input "$hour" 0 23
        if [[ $? -ne 0 ]]; then continue; fi

        read -p "Minute (0-59): " minute
        validate_cron_input "$minute" 0 59
        if [[ $? -ne 0 ]]; then continue; fi

        read -p "Day of Week (0-7, 0 or 7 for Sunday or *): " weekday
        validate_cron_input "$weekday" 0 7
        if [[ $? -ne 0 ]]; then continue; fi
        break
    done

    # Convert to readable format
    convert_to_readable_schedule "$month" "$day" "$hour" "$minute" "$weekday"
     if [[ $? -ne 0 ]]; then
        msg_error "Failed to convert schedule to readable format."
        schedule_time="ERROR CONVERTING"
    fi
    echo "Your modified cron job will run with the following schedule:"
    echo "-------------------------------------------------------"
    echo -e "${RESET}$(printf '%-15s' "CRON JOB") $(printf '%-20s' "SCHEDULE") $(printf '%-5s' "") $(printf '%-10s' "COMMAND")"
    echo "-------------------------------------------------------"

    # Process job_command to get a cleaner display version
    local display_command="$job_command"
    display_command="${display_command#*bedrock-server-manager}"
    display_command="${display_command#*.sh}"
    display_command="${display_command# }"
    display_command="${display_command%% --*}"

    echo -e "${CYAN}$(printf '%-10s' "${YELLOW}${minute} ${hour} ${day} ${month} ${weekday}${RESET}")${RESET} ${GREEN}$(printf '%-25s' "$schedule_time")${RESET} $(printf '%-5s' "") ${YELLOW}$(printf '%-10s' "$display_command")${RESET}"
    echo ""
    echo "-------------------------------------------------------"

    # Confirm before modifying the cron job
    while true; do
        read -p "Do you want to modify this job? (y/n): " confirm
        confirm="${confirm,,}"  # Convert to lowercase
        case "$confirm" in
            y|yes)
                local temp_cron
                temp_cron=$(mktemp)
                if [[ $? -ne 0 ]]; then
                    msg_error "Failed to create temporary file for cron modification"
                    return $(handle_error 1 "$action") # General error.
                fi

                # Remove the selected job from the current crontab
                crontab -l 2>>"$scriptLog" | awk -v job="$job_to_modify" '$0 != job' > "$temp_cron"
                if [[ $? -ne 0 ]]; then
                    msg_error "Failed to remove old cron job from temporary file"
                    rm -f "$temp_cron"
                    return $(handle_error 22 "$action") # Failed to modify
                fi
                # Append the modified cron job to the temporary file
                echo "$minute $hour $day $month $weekday $job_command" >> "$temp_cron"
                 if [[ $? -ne 0 ]]; then
                    msg_error "Failed to add modified cron job to temporary file"
                    rm -f "$temp_cron"
                    return $(handle_error 22 "$action")  # Failed to modify cron job.
                 fi
                # Load the updated crontab
                crontab "$temp_cron"
                if [[ $? -ne 0 ]]; then
                  msg_error "Failed to update crontab with modified job"
                  rm -f "$temp_cron"
                  return $(handle_error 22 "$action") #Failed to modify
                fi

                rm "$temp_cron"

                msg_ok "Cron job modified successfully!"
                return 0 # Success
                ;;
            n|no|"")
                msg_info "Cron job not modified."
                return 0 #Success: user decided to not modify
                ;;
            *)
                msg_warn "Invalid input. Please answer 'yes' or 'no'."
                ;;
        esac
    done
}

# Function to delete an existing cron job
delete_cron_job() {
    local server_name="$1"
    local action="delete cron job"

    # Ensure server name is provided
    if [[ -z "$server_name" ]]; then
        msg_error "delete_cron_job: server_name is empty."
        return $(handle_error 25 "$action")  # Invalid server name
    fi

    echo "Current scheduled cron jobs for '$server_name':"

    # Retrieve cron jobs get_server_cron_jobs
    cron_jobs=$(get_server_cron_jobs "$server_name")
    if [[ $? -ne 0 ]]; then
        msg_error "Failed to retrieve cron jobs for $server_name"
        return $(handle_error 22 "$action")  # Failed to schedule cron job
    fi

    # If no jobs were found, get_server_cron_jobs returns "undefined" or an empty string.
    if [[ "$cron_jobs" == "undefined" ]] || [[ -z "$cron_jobs" ]]; then
        echo "No scheduled cron jobs found to delete."
        return 0 # Success: Nothing to delete
    fi

    # Use mapfile to split the multi-line cron_jobs string into an array.
    mapfile -t cron_jobs_array <<< "$cron_jobs"

    # Check if the array has any elements.
    if [[ ${#cron_jobs_array[@]} -eq 0 ]]; then
        echo "No scheduled cron jobs found to delete."
        return 0 #Success: Nothing to delete
    fi

    # Display the list of cron jobs with index numbers.
    local index=1
    for line in "${cron_jobs_array[@]}"; do
        echo "$index) $line"
        ((index++))
    done

    # Prompt the user for the job number to delete.
    read -p "Enter the number of the job you want to delete: " job_number

    # Validate the input to ensure it is a valid number within the array range.
    if ! [[ "$job_number" =~ ^[0-9]+$ ]] || (( job_number < 1 || job_number > ${#cron_jobs_array[@]} )); then
        msg_warn "Invalid selection. No matching cron job found."
        return $(handle_error 26 "$action")  # Invalid cron job input
    fi

    # Identify the selected cron job.
    local job_to_delete="${cron_jobs_array[$((job_number - 1))]}"

    # Ask for confirmation before deletion.
    while true; do
        read -p "Are you sure you want to delete this cron job? (y/n): " confirm_delete
        confirm_delete="${confirm_delete,,}"  # Convert to lowercase.
        case "$confirm_delete" in
            y|yes)
                # Create a temporary file to hold the updated crontab.
                temp_cron=$(mktemp)
                if [[ $? -ne 0 ]]; then
                    msg_error "Failed to create temporary file for cron deletion"
                    return $(handle_error 1 "$action") # General error
                fi
                # Remove the selected job from the current crontab.
                crontab -l 2>>"$scriptLog" | grep -F -v "$job_to_delete" > "$temp_cron"
                if [[ $? -ne 0 ]]; then
                    msg_error "Failed to remove cron job from temporary file"
                    rm -f "$temp_cron"
                    return $(handle_error 22 "$action")  # Failed to delete cron job
                fi
                # Install the updated crontab.
                crontab "$temp_cron"
                if [[ $? -ne 0 ]]; then
                    msg_error "Failed to update crontab"
                    rm -f "$temp_cron"
                    return $(handle_error 22 "$action") # Failed to delete
                fi
                rm "$temp_cron"
                msg_ok "Cron job deleted successfully!"
                return 0 # Success
                ;;
            n|no|"")
                msg_info "Cron job not deleted."
                return 0 #Success: user did not delete.
                ;;
            *)
                msg_warn "Invalid input. Please answer 'yes' or 'no'."
                ;;
        esac
    done
}

# Function to validate cron input (minute, hour, day, month, weekday)
validate_cron_input() {
    local value=$1
    local min=$2
    local max=$3
    local action="validate cron input"

    if [[ "$value" == "*" ]] || ([[ "$value" =~ ^[0-9]+$ ]] && [ "$value" -ge "$min" ] && [ "$value" -le "$max" ]); then
        return 0  # Valid input
    else
        msg_warn "Invalid input. Please enter a value between $min and $max, or '*' for any."
        return $(handle_error 26 "$action")  # Invalid cron job input
    fi
}

# Function to convert cron format to readable schedule
convert_to_readable_schedule() {
    local month=$1
    local day=$2
    local hour=$3
    local minute=$4
    local weekday=$5
    local action="convert to readable schedule"

    # Handle empty or null inputs
    if [[ -z "$month" || "$month" == "null" || -z "$day" || "$day" == "null" || -z "$hour" || "$hour" == "null" || -z "$minute" || "$minute" == "null" || -z "$weekday" || "$weekday" == "null" ]]; then
      schedule_time="Invalid Input"
      return $(handle_error 26 "$action") # Invalid cron job input
    fi

    # Validate input ranges
    validate_cron_input "$month" 1 12
    if [[ $? -ne 0 ]]; then schedule_time="Invalid Month"; return $(handle_error 26 "$action"); fi
    validate_cron_input "$day" 1 31
    if [[ $? -ne 0 ]]; then schedule_time="Invalid Day"; return $(handle_error 26 "$action"); fi
    validate_cron_input "$hour" 0 23
    if [[ $? -ne 0 ]]; then schedule_time="Invalid Hour"; return $(handle_error 26 "$action"); fi
    validate_cron_input "$minute" 0 59
    if [[ $? -ne 0 ]]; then schedule_time="Invalid Minute"; return $(handle_error 26 "$action"); fi
    validate_cron_input "$weekday" 0 7
    if [[ $? -ne 0 ]]; then schedule_time="Invalid Weekday"; return $(handle_error 26 "$action"); fi

    if [ "$day" == "*" ] && [ "$weekday" == "*" ]; then
        schedule_time="Daily at $(printf "%02d:%02d" "$hour" "$minute")" # Format with leading zeros
    elif [ "$day" != "*" ] && [ "$weekday" == "*" ] && [ "$month" == "*" ]; then
        schedule_time="Monthly on day $day at $(printf "%02d:%02d" "$hour" "$minute")"
    elif [ "$day" == "*" ] && [ "$weekday" != "*" ]; then
        week_days=("Sunday" "Monday" "Tuesday" "Wednesday" "Thursday" "Friday" "Saturday" "Sunday")
        # Handle weekday 8 (wraps to 0):
        local weekday_index=$((weekday % 8))
        schedule_time="Weekly on ${week_days[$weekday_index]} at $(printf "%02d:%02d" "$hour" "$minute")"
    else
        # Check if any field is a wildcard; if so, don't use date -d
        if [[ "$month" == "*" || "$day" == "*" || "$hour" == "*" || "$minute" == "*" ]]; then
            schedule_time="Cron schedule: $(printf "%02d %02d %s %s %s" "$minute" "$hour" "$day" "$month" "$weekday")" # With leading zeros
        else
            # Use date -d, but handle potential errors
            next_run=$(date -d "$month/$day $hour:$minute" +"%m/%d/%Y %H:%M" 2>&1)
            if [[ $? -ne 0 ]]; then
                schedule_time="Invalid Date/Time"
                return $(handle_error 26 "$action") # Invalid date/time combination
            fi
            schedule_time="Next run at $next_run"
        fi
    fi

    return 0 # Success
}

# Function to install a new server
install_new_server() {
  local action="install new server"
  while true; do
      read -p "Enter server folder name: " server_name

      # Check if server_name contains only alphanumeric characters, hyphens, and underscores
      if [[ "$server_name" =~ ^[[:alnum:]_-]+$ ]]; then
          break  # Exit the loop if the name is valid
      else
          msg_warn "Invalid server folder name. Only alphanumeric characters, hyphens, and underscores are allowed."
      fi
  done

     # Check if server already exists *before* doing anything else.
    if [[ -d "$BASE_DIR/$server_name" ]]; then
        msg_warn "Folder '$server_name' already exists, continue?"

        # Ask if allow-list should be configured
        while true; do
            read -p "Folder '$server_name' already exists, continue? (y/n): " continue_response
            continue_response="${continue_response,,}"
            case "$continue_response" in
                yes|y)
                    msg_warn "Removing folder"
                    if ! rm -rf "$BASE_DIR/$server_name" > /dev/null 2>> "$scriptLog"; then
                        msg_error "Failed to remove folder"
                        return $(handle_error 21 "$action") # Failed to delete server
                    fi
                    msg_warn "Deleting config directory: $config_folder"
                    rm -rf "$config_folder"
                    if [[ $? -ne 0 ]]; then
                      msg_error "Failed to delete config directory: $config_folder"
                      return $(handle_error 21 "$action") # Failed to delete server
                    fi
                    break
                    ;;
                no|n|"")
                    msg_warn "Exiting"
                    return $(handle_error 25 "$action") # Invalid server name
                    ;;
                *)
                    msg_warn "Invalid input. Please answer 'yes' or 'no'."
                    ;;
            esac
        done
    fi

  if ! manage_server_config "$server_name" "server_name" "write" "$server_name"; then
    msg_error "Failed to update server name in config.json for server: $server_name"
    return $(handle_error 14 "$action") # Configuration file write error
  else
    msg_ok "Successfully updated server name in config.json for server: $server_name"
  fi

    read -p "Enter server version (e.g., LATEST or PREVIEW): " target_version

  if ! manage_server_config "$server_name" "target_version" "write" "$target_version"; then
    msg_error "Failed to update target version in config.json for server: $server_name"
    return $(handle_error 14 "$action") # Configuration file write error
  else
    msg_ok "Successfully updated target version in config.json for server: $server_name"
  fi

    # Create the server directory if it doesn't exist
    mkdir -p "$BASE_DIR/$server_name"
    if [[ $? -ne 0 ]]; then
        msg_error "Failed to create server directory: $BASE_DIR/$server_name"
        return $(handle_error 16 "$action") # Failed to create directory
    fi

    # Save the target version input directly to version.txt
    echo "$target_version" > "$BASE_DIR/$server_name/version.txt"
     if [[ $? -ne 0 ]]; then
        msg_error "Failed to write target version to version.txt"
        return $(handle_error 1 "$action") # General Error (file write failed)
    fi
    msg_info "Saved target version '$target_version' to version.txt"

    # Install the server
    local current_version_output
    current_version_output=$(download_bedrock_server "$server_name" "$target_version")
    local download_status=$?  # Capture the exit status of download_bedrock_server

    if [[ "$download_status" -eq 0 ]]; then
        msg_ok "Server $server_name installed"
    else
        msg_error "Failed to install server."
        return $(handle_error 9 "$action") # Failed to install server
    fi

    # Configure the server properties after installation
    configure_server_properties "$server_name"
    if [[ $? -ne 0 ]]; then
       msg_error "Failed to configure server properties"
       # No return. Continue with other setup steps even if config fails.
    fi

    # Ask if allow-list should be configured
    while true; do
        read -p "Configure allow-list? (y/n): " allowlist_response
        allowlist_response="${allowlist_response,,}"
        case "$allowlist_response" in
            yes|y)
                configure_allowlist "$server_name"
                if [[ $? -ne 0 ]]; then
                    msg_error "Failed to configure allowlist"
                    # No return. Continue with other setup steps.
                fi
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

    # Ask if permissions should be configured
    while true; do
        read -p "Configure permissions? (y/n): " permissions_response
        permissions_response="${permissions_response,,}"
        case "$permissions_response" in
            yes|y)
                select_player_for_permission "$server_name"
                if [[ $? -ne 0 ]]; then
                   msg_error "Failed to configure permissions"
                    # No return. Continue with other setup steps.
                fi
                break
                ;;
            no|n|"")
                msg_info "Skipping permissions configuration."
                break
                ;;
            *)
                msg_warn "Invalid input. Please answer 'yes' or 'no'."
                ;;
        esac
    done 

    # Create a systemd service for the server
    create_systemd_service "$server_name"
    if [[ $? -ne 0 ]]; then
      msg_error "Failed to create systemd service"
       # No return. Continue with other setup steps.
    fi

    # Ask if server should be started
    while true; do
        read -p "Do you want to start the server '$server_name' now? (y/n): " start_choice
        start_choice="${start_choice,,}"
        case "$start_choice" in
            yes|y)
                start_server "$server_name"
                if [[ $? -ne 0 ]]; then
                  msg_error "Failed to start server"
                  # No return
                fi
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
    return 0 # Success
}

# Updates a server
update_server() {
    local server_name="$1"
    local server_dir="$BASE_DIR/$server_name"
    local action="update server"

    # Ensure server name is provided
    if [[ -z "$server_name" ]]; then
        msg_error "update_server: server_name is empty."
        return $(handle_error 25 "$action")  # Invalid server name
    fi

    # Internet connectivity check - Extracted to function check_internet_connectivity
    if ! check_internet_connectivity; then
        msg_warn "Internet connectivity check failed. Cannot check for updates."
        #return $(handle_error 24 "$action")  # Internet connectivity test failed
        return 0 # Return early
    fi

    msg_info "Starting update process for server: $server_name"

    if systemctl --user is-active --quiet "bedrock-${server_name}"; then
        send_command "$server_name" "say Checking for server updates.."
        if [[ $? -ne 0 ]]; then
            msg_warn "Failed to send command to server $server_name. It might not be running."
            # Continue, as this isn't a fatal error for the update *process*.
        fi
    fi

    # Get the installed version
    local installed_version
    installed_version=$(get_installed_version "$server_name")
    if [[ $? -ne 0 ]]; then
        msg_error "Failed to get the installed version."
        return $(handle_error 1 "$action")  # General error (getting version failed)
    fi

    # Read the target version from the config file
    local version_file="$CONFIGDIR/$server_name/${server_name}_config.json"
    if [[ ! -f "$version_file" ]]; then
        msg_error "Version file not found in $CONFIGDIR/$server_name/. Cannot determine the target version."
        return $(handle_error 14 "$action") # Config file not found
    fi

    local target_version
    target_version=$(manage_server_config "$server_name" "target_version" "read" 2>>$scriptLog)
    if [[ $? -ne 0 ]]; then
        msg_error "Failed to read target_version from config."
        return $(handle_error 14 "$action") # Failed to read configuration file
    fi

    # Lookup download URL based on version
    if ! download_url=$(lookup_bedrock_download_url "$target_version"); then
        msg_error "Failed to lookup download URL. Cannot proceed."
        return $(handle_error 15 "$action")  # Failed to download or extract files (closest match)
    fi

    local current_version
    current_version=$(get_version_from_url "$download_url") # Extract version from URL
    if [[ $? -ne 0 ]]; then
      msg_error "Failed to extract version from URL."
      return $(handle_error 1 "$action")  # General error (version extraction failed)
    fi

    current_version=${current_version%.}

    # Check if an update is needed
    if no_update_needed "$server_name" "$installed_version" "$current_version"; then
        msg_info "No update needed for server '$server_name'."
        return 0  # No update needed, but function executed successfully
    fi

    # Update is needed.
    local current_version_output
    current_version_output=$(download_bedrock_server "$server_name" "$target_version" true "$installed_version")
    local download_status=$?  # Capture the exit status of download_bedrock_server

    if [[ "$download_status" -eq 0 ]]; then
        msg_ok "Server '$server_name' updated to version: $current_version"
        return 0  # Update successful
    else
        msg_error "Failed to install server."
        return $(handle_error 9 "$action")  # Failed to install/update server
    fi
}

# Downloads and installs the Bedrock server
download_bedrock_server() {
    local server_name="$1"
    local server_dir="$BASE_DIR/$server_name"
    local target_version="${2:-"LATEST"}"
    local in_update="${3:-false}"
    local installed_version="${4:-undefined}"
    local download_url
    local current_version
    local download_page="https://www.minecraft.net/en-us/download/server/bedrock"
    local was_running=false
    local action="download bedrock server"

    # Ensure server name is provided
    if [[ -z "$server_name" ]]; then
        msg_error "download_bedrock_server: server_name is empty."
        return $(handle_error 25 "$action")  # Invalid server name
    fi

    # Internet connectivity check - Extracted to function check_internet_connectivity
    if ! check_internet_connectivity; then
        msg_warn "Internet connectivity check failed. Cannot download server."
        return $(handle_error 24 "$action")  # Internet connectivity test failed
    fi

    msg_info "You chose server version: $target_version"

    # Ensure directories exist
    mkdir -p "$server_dir"
    if [[ $? -ne 0 ]]; then
        msg_error "Failed to create server directory: $server_dir"
        return $(handle_error 16 "$action")  # Failed to create directory
    fi
    mkdir -p "$SCRIPTDIR/.downloads"
    if [[ $? -ne 0 ]]; then
        msg_error "Failed to create downloads directory: $SCRIPTDIR/.downloads"
        return $(handle_error 16 "$action")  # Failed to create directory
    fi

    # Lookup download URL based on version
    if ! download_url=$(lookup_bedrock_download_url "$target_version"); then
        msg_error "Failed to lookup download URL. Cannot proceed."
        return $(handle_error 15 "$action")  # Failed to download or extract files
    fi

    current_version=$(get_version_from_url "$download_url")
    if [[ $? -ne 0 ]]; then
        msg_error "Failed to extract version from URL."
        return $(handle_error 1 "$action") # General error
    fi
    current_version=${current_version%.}

    # Determine the correct download directory
    local download_dir="$SCRIPTDIR/.downloads"
    case ${target_version^^} in
        LATEST) download_dir="$download_dir/stable" ;;
        PREVIEW) download_dir="$download_dir/preview" ;;
        *) download_dir="$download_dir" ;;  # Specific versions stay in main downloads directory
    esac

    mkdir -p "$download_dir"
    if [[ $? -ne 0 ]]; then
        msg_error "Failed to create download subdirectory: $download_dir"
        return $(handle_error 16 "$action")  # Failed to create directory
    fi
    local zip_file="$download_dir/bedrock_server_${current_version}.zip"

    if [[ -f "$zip_file" ]]; then
      msg_ok "Bedrock server version $current_version is already downloaded. Skipping download."
    else
      msg_info "Server ZIP not found. Proceeding with download."
      # Download the server ZIP
      if ! download_server_zip_file "$download_url" "$zip_file"; then
          msg_error "Failed to download server ZIP file."
          return $(handle_error 15 "$action")  # Failed to download or extract files
      fi
    fi

    # Cleanup old downloads
    prune_old_downloads "$download_dir"
    if [[ $? -ne 0 ]]; then
      msg_warn "Failed to prune old downloads"
    fi

    # Stop server if running for update
    if [[ "$in_update" == true ]]; then
        was_running=$(stop_server_if_running "$server_name")
        if [[ $? -ne 0 ]]; then
            msg_error "Failed to stop server $server_name"
             return $(handle_error 10 "$action") #Failed to stop server
        fi
    fi

    # Backup server before update
    if [[ "$in_update" == true ]]; then
        local backup_success=false

        backup_all "$server_name" false
        if [[ $? -eq 0 ]]; then
            backup_success=true
        else
            msg_error "Failed to backup server $server_name"
        fi
    fi

    # Extract server files
    if ! extract_server_files_from_zip "$zip_file" "$server_dir" "$in_update"; then
        msg_error "Failed to extract server files."
        return $(handle_error 15 "$action")  # Failed to download or extract files
    fi

    # Restore critical files after update is backup was successful
    if [[ "$in_update" == true && "$backup_success" == true ]]; then
        restore_all "$server_name" false
        if [[ $? -ne 0 ]]; then
            msg_error "Failed to restore files for $server_name"
        fi
    fi

    # Set folder permissions
    set_server_folder_permissions "$server_dir"
    if [[ $? -ne 0 ]]; then
      msg_error "Failed to set server folder permissions"
    fi

    # Write version to config.json
    write_version_config "$server_name" "$current_version"
    if [[ $? -ne 0 ]]; then
        msg_error "Failed to write version to config.json"
        return $(handle_error 14 "$action") # Configuration file write error
    fi

    msg_ok "Installed Bedrock server version: ${current_version}"

    # Start server if it was running
    start_server_if_was_running "$server_name" "$was_running"
    if [[ $? -ne 0 ]]; then
        msg_error "Failed to restart server: $server_name"
        return $(handle_error 10 "$action") # Failed to start server
    fi

    msg_info "Bedrock server download process finished"
    return 0  # Success
}

# Find server download url
lookup_bedrock_download_url() {
    local target_version="$1"
    local download_page="https://www.minecraft.net/en-us/download/server/bedrock"
    local version_type
    local custom_version
    local regex
    local download_page_content
    local resolved_download_url="" # Initialize to empty string
    local action="lookup bedrock download url"

    # Input validation: Target version cannot be empty
    if [[ -z "$target_version" ]]; then
        msg_error "lookup_bedrock_download_url: target_version is empty."
        return $(handle_error 2 "$action")  # Missing argument
    fi

    case ${target_version^^} in
        PREVIEW)
            version_type="PREVIEW"
            msg_info "Target version is 'preview'."
            regex='<a[^>]+href="([^"]+)"[^>]+data-platform="serverBedrockPreviewLinux"'
            ;;
        LATEST)
            version_type="LATEST"
            msg_info "Target version is 'latest'."
            regex='<a[^>]+href="([^"]+)"[^>]+data-platform="serverBedrockLinux"'
            ;;
        *-PREVIEW)
            version_type="PREVIEW"
            custom_version="${target_version%-preview}"
            msg_info "Target version is a specific preview version: $custom_version."
            regex='<a[^>]+href="([^"]+)"[^>]+data-platform="serverBedrockPreviewLinux"'
            ;;
        *)
            version_type="LATEST"
            custom_version="$target_version"
            msg_info "Target version is a specific stable version: $custom_version."
            regex='<a[^>]+href="([^"]+)"[^>]+data-platform="serverBedrockLinux"'
            ;;
    esac

    download_page_content=$(curl -sSL -A "zvortex11325/bedrock-server-manager" \
        -H "Accept-Language: en-US,en;q=0.5" \
        -H "Accept: text/html" \
        "$download_page")

    if [[ -z "$download_page_content" ]]; then
        msg_error "Failed to fetch download page content."
        return $(handle_error 15 "$action") # Failed to download or extract files
    fi

    local match
    match=$(echo "$download_page_content" | grep -oEm1 "$regex")

    if [[ -n "$match" ]]; then
        resolved_download_url=$(echo "$match" | sed -E 's/.*href="([^"]+)".*/\1/')
        if [[ $? -ne 0 ]]; then
            msg_error "Failed to extract URL from match using sed."
            return $(handle_error 1 "$action") # General error
        fi

        if [[ -n "$custom_version" ]]; then
            resolved_download_url=$(echo "$resolved_download_url" | sed -E "s/(bedrock-server-)[^/]+(\.zip)/\1${custom_version}\2/")
            if [[ $? -ne 0 ]]; then
                msg_error "Failed to construct custom URL using sed."
                return $(handle_error 1 "$action") # General error
            fi
        fi
         msg_ok "Resolved download URL lookup OK."

         echo "$resolved_download_url" # Return the URL via stdout
         return 0 # Success
    else
        msg_error "Could not find a valid download URL for $version_type."
        return $(handle_error 15 "$action") # Failed to download or extract files.
    fi
}

# Extract version from url
get_version_from_url() {
    local download_url="$1"
    local action="get version from url"
    if [[ -z "$download_url" ]]; then
        msg_error "download_url is empty."
        return $(handle_error 2 "$action")  # Missing argument
    fi

    local version
    version=$(echo "$download_url" | grep -oP 'bedrock-server-\K[0-9.]+') # Return version via stdout

    if [[ $? -ne 0 ]]; then
        msg_error "Failed to extract version from URL using grep."
        return $(handle_error 1 "$action")  # General error
    fi
    if [[ -z "$version" ]]; then
      msg_error "Extracted version is empty."
      return $(handle_error 1 "$action") # General error
    fi

    echo "$version"
    return 0 # Success
}

# Update version in config.json
write_version_config() {
  local server_name="$1"
  local installed_version="$2"
  local action="write version config"

  if [[ -z "$server_name" ]]; then
    msg_error "write_version_config: server_name is empty"
    return $(handle_error 25 "$action") # Invalid server name
  fi

  if [[ -z "$installed_version" ]]; then
      msg_warn "write_version_config: installed_version is empty.  Writing empty string to config."
      # Continue, but log a warning.
  fi

  if ! manage_server_config "$server_name" "installed_version" "write" "$installed_version"; then
    msg_error "Failed to update installed_version in config.json for server: $server_name"
    return $(handle_error 14 "$action") # Failed to write config file
  else
    msg_ok "Successfully updated installed_version in config.json for server: $server_name"
    return 0 # Success
  fi
}

# No update needed
no_update_needed() {
    local server_name="$1"
    local installed_version="$2"
    local current_version="$3"
    local action="check no update needed"

    if [[ -z "$server_name" ]]; then
      msg_error "no_update_needed: server_name is empty."
      return $(handle_error 25 "$action") # Invalid server name
    fi
    if [[ -z "$installed_version" ]]; then
      msg_warn "no_update_needed: installed_version is empty. Assuming update is needed."
      return 1 # Update is needed
    fi
    if [[ -z "$current_version" ]]; then
      msg_warn "no_update_needed: current_version is empty.  Assuming update is needed."
      return 1 # Update is needed
    fi

    if [[ "${installed_version}" == "${current_version}" ]]; then
        return 0 # Indicate no update needed
    fi
    return 1 # Indicate update is needed
}

# Remove old downloads
prune_old_downloads() {
    local download_dir="$1"
    local action="prune old downloads"

    if [[ -z "$download_dir" ]]; then
        msg_error "prune_old_downloads: download_dir is empty."
        return $(handle_error 2 "$action") # Missing argument
    fi

    if [[ ! -d "$download_dir" ]]; then
        msg_warn "prune_old_downloads: '$download_dir' is not a directory or does not exist. Skipping cleanup."
        return 0  # Not an error if the directory doesn't exist.
    fi

    msg_info "Cleaning up old Bedrock server downloads..."

    # Find all zip files in the specified download directory using null-terminated output
    local download_files=()
    while IFS= read -r -d $'\0' file; do
        download_files+=("$file")
    done < <(find "$download_dir" -maxdepth 1 -name "bedrock_server_*.zip" -print0 | sort -z -t '_' -k 3 -n)

    # Debug output of found files
    msg_debug "Files found: ${download_files[@]} in Dir: $download_dir"

    # Check if any download files were found
    if [[ ${#download_files[@]} -gt 0 ]]; then
        local num_files="${#download_files[@]}"
        if [[ "$num_files" -gt "$DOWNLOAD_KEEP" ]]; then  # Compare with DOWNLOAD_KEEP
            msg_debug "Found $num_files old server downloads. Keeping the $DOWNLOAD_KEEP most recent."
            # Get filenames to delete (all except last DOWNLOAD_KEEP - which are most recent due to sort order)
            local files_to_delete=("${download_files[@]:0:$((num_files - DOWNLOAD_KEEP))}")
            if [[ ${#files_to_delete[@]} -gt 0 ]]; then
                msg_debug "Files to delete: ${files_to_delete[@]}"
                rm -f "${files_to_delete[@]}"
                if [[ $? -ne 0 ]]; then
                    msg_error "Failed to delete old server downloads."
                    return $(handle_error 1 "$action") # General Error
                fi
                msg_ok "Old server downloads deleted."
            else
                msg_debug "No old server downloads to delete (keeping $DOWNLOAD_KEEP most recent)."
            fi
        else
            msg_debug "Found $num_files or fewer old server downloads. Keeping all."
        fi
    else
        msg_info "No old server downloads found."
    fi
    return 0
}

# Download server zip
download_server_zip_file() {
    local download_url="$1"
    local zip_file="$2"
    local action="download server zip file"

    if [[ -z "$download_url" ]]; then
        msg_error "download_server_zip_file: download_url is empty."
        return $(handle_error 2 "$action")  # Missing argument
    fi
    if [[ -z "$zip_file" ]]; then
        msg_error "download_server_zip_file: zip_file is empty."
        return $(handle_error 2 "$action") # Missing argument
    fi

    msg_info "Resolved download URL: $download_url"

    if ! curl -fsSL -o "$zip_file" -A "zvortex11325/bedrock-server-manager" "$download_url"; then
        msg_error "Failed to download Bedrock server from $download_url"
        return $(handle_error 15 "$action")  # Failed to download or extract files
    fi
    msg_info "Downloaded Bedrock server ZIP to: $zip_file"
    return 0 # Success
}

# Extract zip to server folder
extract_server_files_from_zip() {
    local zip_file="$1"
    local server_dir="$2"
    local in_update="$3"
    local action="extract server files from zip"

    if [[ -z "$zip_file" ]]; then
       msg_error "extract_server_files_from_zip: zip_file is empty."
       return $(handle_error 2 "$action") # Missing argument
    fi
    if [[ -z "$server_dir" ]]; then
       msg_error "extract_server_files_from_zip: server_dir is empty."
       return $(handle_error 1 "$action") # General Error, but really a missing arg
    fi

    if [[ "$in_update" == true ]]; then
        msg_info "Extracting the server files, excluding critical files..."
        if ! unzip -o "$zip_file" -d "$server_dir" -x "worlds/*" "allowlist.json" "permissions.json" "server.properties" > /dev/null 2>>$scriptLog; then
            msg_error "Failed to extract server files during update."
            return $(handle_error 15 "$action")  # Failed to download or extract files
        fi
    else
        msg_info "Extracting server files for fresh installation..."
        if ! unzip -o "$zip_file" -d "$server_dir" > /dev/null 2>>$scriptLog; then
            msg_error "Failed to extract server files during fresh installation."
            return $(handle_error 15 "$action")  # Failed to download or extract files
        fi
    fi
    msg_ok "Server files extracted successfully."
    return 0 # Success
}

# Set folder r/w owner:group permissions
set_server_folder_permissions() {
    local server_dir="$1"
    local action="set server folder permissions"

    if [[ -z "$server_dir" ]]; then
      msg_error "set_server_folder_permissions: server_dir is empty."
      return $(handle_error 2 "$action") # Missing argument
    fi
    if [[ ! -d "$server_dir" ]]; then
        msg_error "set_server_folder_permissions: server_dir '$server_dir' does not exist or is not a directory."
        return $(handle_error 16 "$action")  # Directory-related error
    fi

    local real_user=$(id -u)
    local real_group=$(id -g)
    msg_info "Setting folder permissions to $real_user:$real_group"
    chown -R "$real_user":"$real_group" "$server_dir"
    if [[ $? -ne 0 ]]; then
        msg_error "Failed to change ownership of server directory."
        return $(handle_error 1 "$action")  # General error (permissions)
    fi
    chmod -R u+w "$server_dir"
    if [[ $? -ne 0 ]]; then
      msg_error "Failed to set write permissions on server directory."
      return $(handle_error 1 "$action")  # General error
    fi

    msg_ok "Folder permissions set."
    return 0 #Success
}

# Allow server to run when not logged in
enable_user_lingering() {
  local action="enable user lingering"
  # Check if lingering is already enabled
  if loginctl show-user $(whoami) -p Linger | grep -q "Linger=yes"; then
    msg_info "Lingering is already enabled for $(whoami)"
    return 0  # Already enabled, so successful
  fi

  while true; do
    read -r -p "Do you want to enable lingering for user $(whoami)? This is required for servers to start after logout. (y/n): " response
    response="${response,,}" # Convert to lowercase

    case "$response" in
      yes|y)
        msg_info "Attempting to enable lingering for user $(whoami)"
        if ! sudo loginctl enable-linger $(whoami); then
          msg_warn "Failed to enable lingering for $(whoami). User services might not start after logout. Check sudo permissions if this is a problem."
          return $(handle_error 13 "$action") # Failed to enable/disable service
        fi
        msg_ok "Lingering enabled for $(whoami)"
        return 0  # Success
        ;;
      no|n|"") # Empty input is treated as "no"
        msg_info "Lingering not enabled. User services will not start after logout."
        return 0  # User chose not to enable
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
  local service_file="$HOME/.config/systemd/user/bedrock-${server_name}.service"
  local action="create systemd service"

    if [[ -z "$server_name" ]]; then
        msg_error "create_systemd_service: server_name is empty."
        return $(handle_error 25 "$action")  # Invalid server name
    fi

  # Ensure the user's systemd directory exists
  mkdir -p "$HOME/.config/systemd/user"
  if [[ $? -ne 0 ]]; then
    msg_error "Failed to create systemd user directory: $HOME/.config/systemd/user"
    return $(handle_error 16 "$action") # Failed to create directory
  fi

  # Check if the service file already exists
  if [[ -f "$service_file" ]]; then
    msg_warn "Reconfiguring service file for '$server_name' at $service_file"
  fi

  # Ask user if they want to enable auto-update on start
  local autoupdate=""
  while true; do
    read -r -p "Do you want to enable auto-update on start for $server_name? (y/n): " response
    response="${response,,}" # Convert to lowercase
    case "$response" in
      yes|y)
        autoupdate="ExecStartPre=/bin/bash -c \"$SCRIPTDIRECT  update-server --server $server_name\""
        msg_info "Auto-update enabled on start."
        break
        ;;
      no|n|"")
        msg_info "Auto-update disabled on start."
        break
        ;;
      *)
        msg_warn "Invalid input. Please answer 'yes' or 'no'."
        ;;
    esac
  done

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
$autoupdate
ExecStart=/bin/bash -c "$SCRIPTDIRECT systemd-start --server $server_name"
ExecStop=/bin/bash -c "$SCRIPTDIRECT systemd-stop --server $server_name"
ExecReload=/bin/bash -c "$SCRIPTDIRECT systemd-stop $server_name && $SCRIPTDIRECT systemd-start $server_name"
Restart=always
RestartSec=10
StartLimitIntervalSec=500
StartLimitBurst=3

[Install]
WantedBy=default.target
EOF

  if [[ $? -ne 0 ]]; then
        msg_error "Failed to write systemd service file: $service_file"
        return $(handle_error 12 "$action") # Failed to create systemd service
  fi

  # Reload systemd to register the new service
  msg_info "Reloading user systemd daemon"
  systemctl --user daemon-reload
  if [[ $? -ne 0 ]]; then
    msg_error "Failed to reload systemd daemon."
    return $(handle_error 1 "$action") # General Error
  fi

  # Ask user if they want to enable the service to start on boot
  while true; do
    read -r -p "Do you want to autostart the server $server_name? (y/n): " response
    response="${response,,}" # Convert to lowercase
    case "$response" in
      yes|y)
        msg_info "Enabling systemd service for $server_name"
        enable_service "$server_name"
        if [[ $? -ne 0 ]]; then
          msg_error "Failed to enable service $server_name"
        fi
        break
        ;;
      no|n|"")
        msg_info "Disabling systemd service for $server_name"
        disable_service "$server_name"
         if [[ $? -ne 0 ]]; then
            msg_error "Failed to disable service $server_name"
        fi
        break
        ;;
      *)
        msg_warn "Invalid input. Please answer 'yes' or 'no'."
        ;;
    esac
  done

  # Run linger command
  enable_user_lingering
  if [[ $? -ne 0 ]]; then
      msg_error "Failed to enable user lingering"
       # It's optional, so don't return an error, just log it
  fi

  msg_ok "Systemd service created for '$server_name'"
  return 0 #Success
}

# Check if a service exists
check_service_exists() {
  local service_name="$1"
  local service_file="$HOME/.config/systemd/user/bedrock-${service_name}.service"
  local action="check service exists"

  if [[ -z "$service_name" ]]; then
    msg_error "check_service_exists: service_name is empty."
    return $(handle_error 25 "$action")  # Invalid server name
  fi

  if [[ ! -f "$service_file" ]]; then
    msg_debug "Service file for '$service_name' does not exist."
    return 1  # Service file doesn't exist
  else
    return 0  # Service file exists
  fi
}

# Enable the service
enable_service() {
  local server_name=$1
  local action="enable service"

  if [[ -z "$server_name" ]]; then
      msg_error "enable_service: server_name is empty."
      return $(handle_error 25 "$action")  # Invalid server name
  fi

  local service_exists_status=$(check_service_exists "$server_name")
  if [[ $service_exists_status -ne 0 ]]; then
    msg_error "Service file for '$server_name' does not exist. Cannot enable."
    return $(handle_error 12 "$action")  # Failed to create systemd service
  fi

  # Check if the service is already enabled
  if systemctl --user is-enabled "bedrock-${server_name}" &>>$scriptLog; then
    msg_info "Service $server_name is already enabled."
    return 0  # Already enabled, so successful
  fi

  # Enable the server with systemctl
  systemctl --user enable "bedrock-${server_name}"
  if [[ $? -eq 0 ]]; then
    msg_ok "Autostart for $server_name enabled successfully."
    return 0  # Success
  else
    msg_error "Failed to enable $server_name."
    return $(handle_error 13 "$action")  # Failed to enable/disable service
  fi
}

# Disable the service
disable_service() {
  local server_name=$1
  local action="disable service"

  if [[ -z "$server_name" ]]; then
      msg_error "disable_service: server_name is empty."
      return $(handle_error 25 "$action")  # Invalid server name
  fi

   local service_exists_status=$(check_service_exists "$server_name")
  if [[ $service_exists_status -ne 0 ]]; then
        msg_info "Service file for '$server_name' does not exist.  No need to disable."
        return 0  # Not an error if the service doesn't exist when disabling.
  fi

  # Check if the service is already disabled
  if ! systemctl --user is-enabled "bedrock-${server_name}" &>>$scriptLog; then
    msg_info "Service $server_name is already disabled."
    return 0  # Already disabled, so successful
  fi

  # Disable the server with systemctl
  systemctl --user disable "bedrock-${server_name}"
  if [[ $? -eq 0 ]]; then
    msg_ok "Server $server_name disabled successfully."
    return 0  # Success
  else
    msg_error "Failed to disable $server_name."
    return $(handle_error 13 "$action")  # Failed to enable/disable service
  fi
}

# Start systemd commands
systemd_start_server() {
  local server_name="$1"
  local action="systemd start server"

  if [[ -z "$server_name" ]]; then
    msg_error "systemd_start_server: server_name is empty."
    return $(handle_error 25 "$action")  # Invalid server name
  fi

  # Set status to starting
  manage_server_config "$server_name" "status" "write" "STARTING"
  if [[ $? -ne 0 ]]; then
    msg_error "Failed to set server status to STARTING"
    return $(handle_error 14 "$action")  # Failed to write configuration file
  fi

  # Clear server_output.txt
  truncate -s 0 "$BASE_DIR/$server_name/server_output.txt"
   if [[ $? -ne 0 ]]; then
    msg_warn "Failed to truncate server_output.txt.  Continuing..."
    # Not a fatal error, so don't return.
  fi

  echo "Starting Server" >> "$BASE_DIR/$server_name/server_output.txt"

  screen -dmS "bedrock-$server_name" -L -Logfile "$BASE_DIR/$server_name/server_output.txt" bash -c "cd \"$BASE_DIR/$server_name\" && exec ./bedrock_server"
  if [[ $? -ne 0 ]]; then
    msg_error "Failed to start server with screen."
    update_server_status_in_config "$server_name" # Attempt to set status
    return $(handle_error 10 "$action")  # Failed to start/stop server
  fi

  # Set server to running
  local status
  local attempts=0
  local max_attempts=30  # Wait for up to 60 seconds (30 * 2)

  while [[ $attempts -lt $max_attempts ]]; do
    status=$(check_server_status "$server_name")
    if [[ $? -ne 0 ]]; then
       msg_error "Failed to get server status from logs."
    fi
    if [[ "$status" == "RUNNING" ]]; then
      break
    fi
    msg_info "Waiting for server '$server_name' to start... Current status: $status"
    sleep 2  # Check the server status every 2 seconds
    attempts=$((attempts + 1))
  done

  if [[ "$status" != "RUNNING" ]]; then
    msg_warn "Server '$server_name' did not start within the timeout.  Final status: $status"
  fi

  update_server_status_in_config "$server_name"
  if [[ $? -ne 0 ]]; then
    msg_error "Failed to update server status in config."
    return $(handle_error 14 "$action") # Failed to update config
  fi

  return 0
}

# Stop systemd commands
systemd_stop_server() {
  local server_name="$1"
  local action="systemd stop server"

  if [[ -z "$server_name" ]]; then
    msg_error "systemd_stop_server: server_name is empty."
    return $(handle_error 25 "$action")  # Invalid server name
  fi

  msg_info "Stopping server '$server_name'..."
  # Send shutdown warning if the server is running
  send_command "$server_name" "say Shutting down server in 10 seconds.."
   if [[ $? -ne 0 ]]; then
    msg_warn "Failed to send shutdown warning to server $server_name. It might not be running."
    # Continue; not fatal if the server isn't running to receive the warning.
  fi

  sleep 0.5

  # Set status to stopping
  manage_server_config "$server_name" "status" "write" "STOPPING"
    if [[ $? -ne 0 ]]; then
        msg_error "Failed to update server status in config (STOPPING)."
        return $(handle_error 14 "$action")
    fi

  sleep 10

  # Send shutdown command to the server inside the screen session
  send_command "$server_name" "stop"
  if [[ $? -ne 0 ]]; then
    msg_warn "Failed to send stop command to server $server_name. It might not be running."
    # Continue, as we still need to try to kill the screen session.
  fi

  # Wait for the server to stop by checking its status
  local status
  local attempts=0
  local max_attempts=30  # Wait up to 60 seconds

  while [[ $attempts -lt $max_attempts ]]; do
    status=$(check_server_status "$server_name")
    if [[ $? -ne 0 ]]; then
        msg_error "Failed to retrieve server status from check_server_status"
        # Continue checking
    fi
    if [[ "$status" == "STOPPED" ]]; then
      break
    fi
    msg_info "Waiting for server '$server_name' to stop... Current status: $status"
    sleep 2  # Check the server status every 2 seconds
    attempts=$((attempts + 1))
  done

  if [[ "$status" != "STOPPED" ]]; then
      msg_warn "Server '$server_name' did not stop gracefully within the timeout. Final status: $status"
      # Continue to try to quit the screen session.
  fi

    # Ensure the screen session is terminated even if the server didn't stop gracefully
    #screen -S "bedrock-${server_name}" -X quit
    #if [[ $? -ne 0 ]]; then
      #msg_warn "Failed to quit screen session for server: $server_name. It may already be stopped."
      # Not a fatal error if screen session is already gone.
    #fi
    #msg_info "Stopped Screen service for: $server_name"

  # Set status to stopped
  manage_server_config "$server_name" "status" "write" "STOPPED"
    if [[ $? -ne 0 ]]; then
        msg_error "Failed to update server status in config (STOPPED)."
        return $(handle_error 14 "$action")
    fi

  return 0
}

# Monitor system resource usage of a systemd service
monitor_service_usage() {
    local service_name="$1"
    local action="monitor service usage"

    if [[ -z "$service_name" ]]; then
      msg_error "monitor_service_usage: server_name is empty."
      return $(handle_error 25 "$action")  # Invalid server name
    fi

    # Check if the service exists before proceeding (user-level services)
    local service_exists_status=$(check_service_exists "$service_name")
    if [[ $service_exists_status -ne 0 ]]; then
        msg_error "Service file for '$service_name' does not exist. Cannot monitor."
        return $(handle_error 12 "$action")  # Failed to create systemd service
    fi

    server_status=$(get_server_status_from_config "$server_name" 2>>"$scriptLog")
    if [[ $? -ne 0 ]]; then
       msg_warn "Failed to get server status from config, continuing."
       # Don't return, we might still be able to get the pid.
    fi

    if [[ ! "$server_status" == "RUNNING" ]]; then
      msg_warn "$service_name not running"
      return 0  # Not an error if the server isn't running
    fi

    msg_info "Monitoring resource usage for service: $service_name"

    while true; do

        # Get the PID of the 'screen' process that is running the Bedrock server
        local screen_pid
        screen_pid=$(pgrep -f "bedrock-${server_name}")  # Get screen PID
        if [[ $? -ne 0 || -z "$screen_pid" ]]; then # Handle both pgrep failure and no match
            msg_warn "No running 'screen' process found for service '$service_name'."
            return 0  # Not running
        fi

        # Get the PID of the Bedrock server process (child of screen)
        local bedrock_pid
        bedrock_pid=$(pgrep -P "$screen_pid") # Get child process PID
        if [[ $? -ne 0 || -z "$bedrock_pid" ]]; then  # Handle pgrep failure and no child
            msg_warn "No running Bedrock server process found for service '$service_name'."
            return 0
        fi

        # Get CPU and Memory usage for the child Bedrock server process
        local cpu mem cmd uptime
        # Use top to get CPU and memory usage
        top_output=$(top -b -n 1 -p "$bedrock_pid" | awk 'NR>7 {print $9, $10, $12, $11}' | head -n 1)

        if [[ -z "$top_output" ]]; then
            msg_error "Failed to retrieve CPU/Memory usage using top."
            return $(handle_error 23 "$action")  # Resource monitoring error.
        fi

        read cpu mem cmd uptime <<< "$top_output"

        
        # Clear screen and display output
        clear
        echo "---------------------------------"
        echo " Monitoring:  $service_name "
        echo "---------------------------------"
        echo "PID:          $bedrock_pid"
        echo "CPU Usage:    $cpu%"
        echo "Memory Usage: $mem%"
        #echo "Command:      $cmd"
        echo "Uptime:       $uptime"
        echo "---------------------------------"
        echo "Press CTRL + C to exit"

        # Wait before refreshing the display
        sleep 1
    done
}

# Configures common server properties interactively
configure_server_properties() {
  local server_name="$1"
  local server_dir="$BASE_DIR/$server_name"
  local action="configure server properties"
  msg_info "Configuring server properties for '$server_name'"

    if [[ -z "$server_name" ]]; then
        msg_error "configure_server_properties: server_name is empty."
        return $(handle_error 25 "$action")  # Invalid server name
    fi

  # Check if server.properties exists
  local server_properties="$server_dir/server.properties"
  if [[ ! -f "$server_properties" ]]; then
    msg_error "server.properties not found!"
    return $(handle_error 11 "$action")  # Failed to configure server properties
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
  local current_level_seed
  local current_online_mode
  local current_texturepack_required

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
  current_level_seed=$(grep "^level-seed=" "$server_properties" | cut -d'=' -f2)
  current_online_mode=$(grep "^online-mode=" "$server_properties" | cut -d'=' -f2)
  current_texturepack_required=$(grep "^texturepack-required=" "$server_properties" | cut -d'=' -f2)

  # Prompt for properties with validation
  select_option() {
    local prompt="$1"
    local default_value="$2"
    shift 2
    local options=("$@")

    PS3="$prompt"

    while true; do
      # Show the options
      select choice in "${options[@]}"; do
        # If the user presses Enter without selecting an option, use the default value
        if [[ -z "$choice" ]]; then
          choice="$default_value"
          echo "Using default: $choice"
          echo "$choice"
          return 0  # Success
        fi

        if [[ -n "$choice" ]]; then
          echo "$choice"  # Return the actual choice value (or default if blank)
          return 0 # Success
        else
          msg_error "Invalid selection. Please try again."
        fi
      done
    done
  }

  # Server Name Validation (no semicolons)
  while true; do
    read -p "Enter server name [Default: ${current_server_name}]: " input_server_name
    input_server_name=${input_server_name:-${current_server_name}}
    if [[ "$input_server_name" == *";"* ]]; then
      msg_error "Server name cannot contain semicolons."
    else
      break # Valid server name
    fi
  done

  # Level Name Validation (only valid folder characters)
  while true; do
    read -p "Enter level name [Default: ${current_level_name}]: " input_level_name
    input_level_name=${input_level_name:-${current_level_name}}

    # --- ADD SPACE TO UNDERSCORE CONVERSION HERE ---
    input_level_name=$(echo "$input_level_name" | tr ' ' '_')

    if [[ ! "$input_level_name" =~ ^[a-zA-Z0-9_-]+$ ]]; then
      msg_error "Invalid level-name. Only alphanumeric characters, hyphens, and underscores are allowed (spaces converted to underscores)."
    else
      break # Valid level name
    fi
  done

  # Gamemode - Select from predefined options
  input_gamemode=$(select_option "Select gamemode:" "$current_gamemode" "survival" "creative" "adventure")
  if [[ $? -ne 0 ]]; then return $(handle_error 1 "$action"); fi

  # Difficulty - Select from predefined options
  input_difficulty=$(select_option "Select difficulty:" "$current_difficulty" "peaceful" "easy" "normal" "hard")
  if [[ $? -ne 0 ]]; then return $(handle_error 1 "$action"); fi

  # Allow Cheats - Select true or false
  input_allow_cheats=$(select_option "Allow cheats:" "$current_allow_cheats" "true" "false")
  if [[ $? -ne 0 ]]; then return $(handle_error 1 "$action"); fi

 # Ports - Validate integer within valid range
 while true; do
  read -p "Enter IPV4 Port [Default: ${current_port}]: " input_port
  input_port=${input_port:-${current_port:-$DEFAULT_PORT}}
  if ! [[ "$input_port" =~ ^[0-9]+$ ]] || [ "$input_port" -lt 1024 ] || [ "$input_port" -gt 65535 ]; then
   msg_error "Invalid port number. Please enter a number between 1024 and 65535."
  else
   break # Valid IPV4 port
  fi
 done

 while true; do
  read -p "Enter IPV6 Port [Default: ${current_port_v6}]: " input_port_v6
  input_port_v6=${input_port_v6:-${current_port_v6:-$DEFAULT_IPV6_PORT}}
  if ! [[ "$input_port_v6" =~ ^[0-9]+$ ]] || [ "$input_port_v6" -lt 1024 ] || [ "$input_port_v6" -gt 65535 ]; then
   msg_error "Invalid IPV6 port number. Please enter a number between 1024 and 65535."
  else
   break # Valid IPV6 port
  fi
 done

  # LAN visibility - Select true or false
  input_lan_visibility=$(select_option "Enable LAN visibility:" "$current_lan_visibility" "true" "false")
  if [[ $? -ne 0 ]]; then return $(handle_error 1 "$action"); fi

  # Allow list - Select true or false
  input_allow_list=$(select_option "Enable allow list:" "$current_allow_list" "true" "false")
  if [[ $? -ne 0 ]]; then return $(handle_error 1 "$action"); fi

 # Max Players - Validate integer input
 while true; do
  read -p "Enter max players [Default: ${current_max_players}]: " input_max_players
  input_max_players=${input_max_players:-${current_max_players}}
  if ! [[ "$input_max_players" =~ ^[0-9]+$ ]]; then
   msg_error "Invalid number for max players."
  else
   break # Valid max players
  fi
 done

  # Permission level - Select predefined options
  input_permission_level=$(select_option "Select default permission level:" "$current_permission_level" "visitor" "member" "operator")
  if [[ $? -ne 0 ]]; then return $(handle_error 1 "$action"); fi

 # View Distance - Validate integer input
 while true; do
  read -p "Default render distance [Default: ${current_render_distance}]: " input_render_distance
  input_render_distance=${input_render_distance:-${current_render_distance}}
  if ! [[ "$input_render_distance" =~ ^[0-9]+$ ]] || [ "$input_render_distance" -lt 5 ]; then
   msg_error "Invalid render distance. Please enter a number greater than or equal to 5."
  else
   break # Valid render distance
  fi
 done

 # Tick Distance - Validate integer in range 4-12
 while true; do
  read -p "Default tick distance [Default: ${current_tick_distance}]: " input_tick_distance
  input_tick_distance=${input_tick_distance:-${current_tick_distance}}
  if ! [[ "$input_tick_distance" =~ ^[0-9]+$ ]] || [ "$input_tick_distance" -lt 4 ] || [ "$input_tick_distance" -gt 12 ]; then
   msg_error "Invalid tick distance. Please enter a number between 4 and 12."
  else
   break # Valid tick distance
  fi
 done

  # Online mode - Select true or false
  input_online_mode=$(select_option "Enable online mode:" "$current_online_mode" "true" "false")
  if [[ $? -ne 0 ]]; then return $(handle_error 1 "$action"); fi

  # Texturepack required - Select true or false
  input_texturepack_required=$(select_option "Require texture pack:" "$current_texturepack_required" "true" "false")
  if [[ $? -ne 0 ]]; then return $(handle_error 1 "$action"); fi

  # Update or add the properties in server.properties
  modify_server_properties "$server_properties" "server-name" "$input_server_name"
  if [[ $? -ne 0 ]]; then return $(handle_error 11 "$action"); fi
  modify_server_properties "$server_properties" "level-name" "$input_level_name"
  if [[ $? -ne 0 ]]; then return $(handle_error 11 "$action"); fi
  modify_server_properties "$server_properties" "gamemode" "$input_gamemode"
  if [[ $? -ne 0 ]]; then return $(handle_error 11 "$action"); fi
  modify_server_properties "$server_properties" "difficulty" "$input_difficulty"
  if [[ $? -ne 0 ]]; then return $(handle_error 11 "$action"); fi
  modify_server_properties "$server_properties" "allow-cheats" "$input_allow_cheats"
  if [[ $? -ne 0 ]]; then return $(handle_error 11 "$action"); fi
  modify_server_properties "$server_properties" "server-port" "$input_port"
  if [[ $? -ne 0 ]]; then return $(handle_error 11 "$action"); fi
  modify_server_properties "$server_properties" "server-portv6" "$input_port_v6"
  if [[ $? -ne 0 ]]; then return $(handle_error 11 "$action"); fi
  modify_server_properties "$server_properties" "enable-lan-visibility" "$input_lan_visibility"
  if [[ $? -ne 0 ]]; then return $(handle_error 11 "$action"); fi
  modify_server_properties "$server_properties" "allow-list" "$input_allow_list"
  if [[ $? -ne 0 ]]; then return $(handle_error 11 "$action"); fi
  modify_server_properties "$server_properties" "max-players" "$input_max_players"
  if [[ $? -ne 0 ]]; then return $(handle_error 11 "$action"); fi
  modify_server_properties "$server_properties" "default-player-permission-level" "$input_permission_level"
  if [[ $? -ne 0 ]]; then return $(handle_error 11 "$action"); fi
  modify_server_properties "$server_properties" "view-distance" "$input_render_distance"
  if [[ $? -ne 0 ]]; then return $(handle_error 11 "$action"); fi
  modify_server_properties "$server_properties" "tick-distance" "$input_tick_distance"
  if [[ $? -ne 0 ]]; then return $(handle_error 11 "$action"); fi
  modify_server_properties "$server_properties" "level-seed" "$current_level_seed"
  if [[ $? -ne 0 ]]; then return $(handle_error 11 "$action"); fi
  modify_server_properties "$server_properties" "online-mode" "$input_online_mode"
  if [[ $? -ne 0 ]]; then return $(handle_error 11 "$action"); fi
  modify_server_properties "$server_properties" "texturepack-required" "$input_texturepack_required"
  if [[ $? -ne 0 ]]; then return $(handle_error 11 "$action"); fi

  msg_ok "Server properties configured"
  return 0 #Success
}

# Modify or add a property in server.properties
modify_server_properties() {
  local server_properties="$1"
  local property_name="$2"
  local property_value="$3"
  local action="modify server properties"

  if [[ -z "$server_properties" ]]; then
      msg_error "modify_server_properties: server_properties file path is empty."
      return $(handle_error 14 "$action")  # Failed to read/write configuration file
  fi
  if [[ ! -f "$server_properties" ]]; then
     msg_error "modify_server_properties: server_properties file does not exist: $server_properties"
      return $(handle_error 14 "$action")  # Failed to read/write configuration file
  fi
  if [[ -z "$property_name" ]]; then
      msg_error "modify_server_properties: property_name is empty."
      return $(handle_error 2 "$action") # Missing argument
  fi
    if [[ "$property_value" == *[[:cntrl:]]* ]]; then
      msg_error "modify_server_properties: property_value contains control characters."
      return $(handle_error 5 "$action")  # Invalid input
  fi


  # Check if the property already exists in the file
  if grep -q "^$property_name=" "$server_properties"; then
    # If it exists, update the value
    sed -i "s/^$property_name=.*/$property_name=$property_value/" "$server_properties"
    if [[ $? -ne 0 ]]; then
      msg_error "Failed to update property '$property_name' in '$server_properties'"
      return $(handle_error 14 "$action") # Failed to read/write config
    fi
    msg_debug "Updated $property_name to $property_value"
  else
    # If it doesn't exist, append the property to the end of the file
    echo "$property_name=$property_value" >> "$server_properties"
    if [[ $? -ne 0 ]]; then
      msg_error "Failed to add property '$property_name' to '$server_properties'"
      return $(handle_error 14 "$action") # Failed to read/write config
    fi
    msg_ok "Added $property_name with value $property_value"
  fi
  return 0 # Success
}

# Configure allowlist.json
configure_allowlist() {
  local server_name="$1"
  local server_dir="$BASE_DIR/$server_name"
  local allowlist_file="$server_dir/allowlist.json"
  local existing_players=()
  local new_players=()
  local action="configure allowlist"

  msg_info "Configuring allowlist.json"

  if [[ -z "$server_name" ]]; then
      msg_error "configure_allowlist: server_name is empty."
      return $(handle_error 25 "$action")  # Invalid server name
  fi

  # Load existing players from allowlist.json if the file exists and is not empty
  if [[ -f "$allowlist_file" && -s "$allowlist_file" ]]; then
    existing_players=$(jq -r '.[] | .name' "$allowlist_file" 2>>$scriptLog)
     if [[ $? -ne 0 ]]; then
        msg_error "Failed to read existing players from allowlist.json."
        return $(handle_error 14 "$action")  # Failed to read/write configuration file
    fi
    msg_debug "Loaded existing players from allowlist.json."
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
      n|no|"") # Treat empty as "no"
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
    if [[ $? -ne 0 ]]; then
      msg_error "Failed to create temporary file for allowlist."
      return $(handle_error 1 "$action")  # General error
    fi

    # Merge existing players and new players into a valid JSON array
    {
      jq -c '.[]' "$allowlist_file" 2>>$scriptLog || echo "[]"  # Load existing players if present
      printf "%s\n" "${new_players[@]}" | jq -c '.'  # Add new players
    } | jq -s '.' > "$updated_allowlist"  # Combine and format as a JSON array

    if [[ $? -ne 0 ]]; then
        msg_error "Failed to create updated allowlist JSON."
        rm -f "$updated_allowlist" # Clean up on error
        return $(handle_error 1 "$action")  # General error (jq failed)
    fi

    # Save the updated allowlist to the file
    mv "$updated_allowlist" "$allowlist_file"
    if [[ $? -ne 0 ]]; then
        msg_error "Failed to save updated allowlist to $allowlist_file."
        return $(handle_error 14 "$action")  # Failed to read/write configuration file
    fi

    # Reload the allowlist
    #send_command $server_name "allowlist reload"
    #if [[ $? -ne 0 ]]; then
     # msg_error "Failed to reload the allow list."
     # return $(handle_error 28 "$action") # Failed to reload
    #fi
    msg_ok "Updated allowlist.json with ${#new_players[@]} new players."
  else
    msg_info "No new players were added. Existing allowlist.json was not modified."
  fi
  return 0 # Success
}

# Update permissions.json with a player and their permission level
configure_permissions() {
    local server_name="$1"
    local xuid="$2"
    local permission="$3"
    local server_dir="$BASE_DIR/$server_name"
    local permissions_file="$server_dir/permissions.json"
    local action="configure permissions"

    if [[ -z "$server_name" ]]; then
        msg_error "configure_permissions: server_name is empty."
        return $(handle_error 25 "$action")  # Invalid server name
    fi
    if [[ -z "$xuid" ]]; then
        msg_error "configure_permissions: xuid is empty."
        return $(handle_error 5 "$action")  # Invalid input
    fi
    if [[ -z "$permission" ]]; then
        msg_error "configure_permissions: permission is empty."
        return $(handle_error 5 "$action")  # Invalid input
    fi

    # Ensure the server directory exists
    if [[ ! -d "$server_dir" ]]; then
        msg_error "Server directory not found: $server_dir"
        return $(handle_error 16 "$action")  # Failed to create or remove directories (closest match)
    fi

    # Ensure permissions.json exists, or create an empty JSON array
    if [[ ! -s "$permissions_file" ]]; then
        echo "[]" > "$permissions_file"
        if [[ $? -ne 0 ]]; then
          msg_error "Failed to initialize permissions.json"
          return $(handle_error 14 "$action")
        fi
    fi

    # Check if the player already exists with any permission and if permission is the same
    if jq -e --arg xuid "$xuid" --arg permission "$permission" \
            '.[] | select(.xuid == $xuid and .permission == $permission)' "$permissions_file" &>>$scriptLog; then
        msg_warn "Player XUID: $xuid with permission '$permission' is already in permissions.json."
        return 0  # Already exists with the same permission
    fi

    # Check if the player already exists with a different permission
    if jq -e --arg xuid "$xuid" '.[] | select(.xuid == $xuid)' "$permissions_file" &>>$scriptLog; then
        # Update the player's permission instead of adding a duplicate
        local tmp_file=$(mktemp)
        if [[ $? -ne 0 ]]; then
            msg_error "Failed to create temporary file for permissions update."
            return $(handle_error 1 "$action")  # General error
        fi
        jq --arg xuid "$xuid" --arg permission "$permission" \
            'map(if .xuid == $xuid then .permission = $permission else . end)' "$permissions_file" > "$tmp_file"
        if [[ $? -ne 0 ]]; then
            msg_error "Failed to update player permission in temporary file."
            rm -f "$tmp_file"  # Clean up on error
            return $(handle_error 1 "$action")  # General error
        fi
        mv "$tmp_file" "$permissions_file"
        if [[ $? -ne 0 ]]; then
            msg_error "Failed to update permissions.json"
            return $(handle_error 14 "$action") # Failed to move file
        fi

        msg_ok "Updated player XUID: $xuid to '$permission' in permissions.json."
    else
        # Add the player if they don’t exist
        local tmp_file=$(mktemp)
        if [[ $? -ne 0 ]]; then
          msg_error "Failed to create temporary file for permissions update."
          return $(handle_error 1 "$action")  # General error
        fi
        jq --arg permission "$permission" --arg xuid "$xuid" \
            '. += [{"permission": $permission, "xuid": $xuid}]' "$permissions_file" > "$tmp_file"
        if [[ $? -ne 0 ]]; then
            msg_error "Failed to add player to temporary permissions file."
            rm -f "$tmp_file" # Clean up temp
            return $(handle_error 1 "$action")  # General error
        fi
        mv "$tmp_file" "$permissions_file"
        if [[ $? -ne 0 ]]; then
            msg_error "Failed to update permissions.json"
            return $(handle_error 14 "$action") # Failed to move file
        fi
        msg_ok "Added player XUID: $xuid as '$permission' in permissions.json."
    fi
    return 0 #Success
}

# Select a player and permission level, then call configure_permissions
select_player_for_permission() {
    local players_file="$CONFIGDIR/players.json"
    local server_name="$1"
    local selected_name=""
    local selected_xuid=""
    local permission=""
    local action="select player for permission"

    if [[ -z "$server_name" ]]; then
        msg_error "select_player_for_permission: server_name is empty."
        return $(handle_error 25 "$action")  # Invalid server name
    fi

    # Ensure players.json exists
    if [[ ! -f "$players_file" ]]; then
        msg_error "No players.json file found!"
        return $(handle_error 14 "$action")  # Failed to read/write configuration file (closest match)
    fi

    # Read players from JSON and store names and XUIDs separately
    mapfile -t player_names < <(jq -r '.players[].name' "$players_file")
    if [[ $? -ne 0 ]]; then
        msg_error "Failed to read player names from players.json."
        return $(handle_error 14 "$action")  # Failed to read config
    fi
    mapfile -t xuids < <(jq -r '.players[].xuid' "$players_file")
    if [[ $? -ne 0 ]]; then
      msg_error "Failed to read XUIDs from players.json."
      return $(handle_error 14 "$action") #Failed to read config
    fi

    if [[ ${#player_names[@]} -eq 0 ]]; then
        msg_warn "No players found in players.json!"
        return 0  # Not an error if no players are found
    fi

    # Display player selection menu
    echo "Select a player to add to permissions.json:"
      # Set custom prompt for select
    PS3="Select a player: "
    select selected_name in "${player_names[@]}" "Cancel"; do
        if [[ "$selected_name" == "Cancel" || -z "$selected_name" ]]; then
            msg_ok "Operation canceled."
            return 0  # User canceled, not an error
        fi

        # Find the corresponding XUID based on the selected name
        for i in "${!player_names[@]}"; do
            if [[ "${player_names[i]}" == "$selected_name" ]]; then
                selected_xuid="${xuids[i]}"
                break
            fi
        done

        if [[ -z "$selected_xuid" ]]; then
          msg_error "Could not find XUID for selected player.  This should not happen."
          return $(handle_error 1 "$action") # General Error
        fi

        break
    done

    # Prompt for permission level
    echo "Select a permission level:"
    PS3="Choose permission: "
    select permission in "operator" "member" "visitor" "cancel"; do
        if [[ "$permission" == "cancel" || -z "$permission" ]]; then
            msg_ok "Operation canceled."
            return 0  # User canceled, not an error
        fi
        break
    done

    # Call the function to add player to permissions.json
    configure_permissions "$server_name" "$selected_xuid" "$permission"
    if [[ $? -ne 0 ]]; then
      msg_error "Failed to configure permissions for $selected_name."
      return 1  # General error, as configure_permissions handles specifics
    fi

    return 0 #Success
}

# Select .mcworld menu
install_worlds() {
  local server_name="$1"
  local action="install worlds"

  if [[ -z "$server_name" ]]; then
    msg_error "install_worlds: server_name is empty."
    return $(handle_error 25 "$action")  # Invalid server name
  fi

  # Path to the content/worlds folder and the server directory
  local content_dir="$SCRIPTDIR/content/worlds"
  local server_dir="$BASE_DIR/$server_name"

    if [[ ! -d "$content_dir" ]]; then
        msg_warn "Content directory not found: $content_dir.  No worlds to install."
        return 0  # Not an error; just no worlds available.
    fi

  # Get the world name from the server.properties file
  local world_name
  world_name=$(get_world_name "$server_name")
  if [[ $? -ne 0 ]]; then
        msg_error "Failed to get world name from server.properties."
        return $(handle_error 11 "$action")  # Failed to configure server properties
  fi

  # If we couldn't find the world name, return an error
  if [[ -z "$world_name" ]]; then
    msg_error "Could not find level-name in server.properties"
    return $(handle_error 11 "$action") #Failed to config
  fi

  msg_debug "World name from server.properties: $world_name"

  # Get a list of all .mcworld files (which are actually .zip files)
  local mcworld_files=("$content_dir"/*.mcworld)

  # If no .mcworld files found, return a message and exit (no error)
  if [[ ${#mcworld_files[@]} -eq 0 ]]; then
    msg_warn "No .mcworld files found in $content_dir"
    return 0 # Not an error, just no worlds to install
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
    echo -e "${CYAN}Available worlds to install${RESET}:"
    select mcworld_file in "${file_names[@]}"; do
      if [[ -z "$mcworld_file" ]]; then
        msg_warn "Invalid selection. Please choose a valid option."
        break # Go back to the select menu
      fi

      # Notify players that the current world will be deleted
      msg_warn "Installing a new world will DELETE the existing world!"
      while true; do
        read -p "Are you sure you want to proceed? (y/n): " confirm_choice
        case "${confirm_choice,,}" in
          yes|y) break ;;    # Proceed with world installation
          no|n)
            msg_warn "World installation canceled."
            return 0 ;;    # Exit function without installing
          *) msg_warn "Invalid input. Please answer 'yes' or 'no'." ;;
        esac
      done

      # Find the full path of the selected file
      local selected_file="${mcworld_files[$((REPLY - 1))]}"

      # Call the install_world function to handle the extraction and server management
      extract_world "$server_name" "$selected_file"
        if [[ $? -ne 0 ]]; then
            msg_error "Failed to extract world."
            return 1 # Pass through error from extract_world
        fi
      return 0 # Exit extract_worlds after successful install_world or failure
    done
  done
}

# Install world to server
extract_world() {
  local server_name="$1"
  local selected_file="$2"
  local from_addon="${3:-false}"
  local server_dir="$BASE_DIR/$server_name"
  local was_running=false
  local action="extract world"

  if [[ -z "$server_name" ]]; then
    msg_error "extract_world: server_name is empty."
    return $(handle_error 25 "$action")  # Invalid server name
  fi
  if [[ -z "$selected_file" ]]; then
    msg_error "extract_world: selected_file is empty."
    return $(handle_error 2 "$action")  # Missing Argument
  fi
  if [[ ! -f "$selected_file" ]]; then
        msg_error "extract_world: selected_file does not exist: $selected_file"
        return $(handle_error 15 "$action") # Failed to download or extract files
  fi

  # Get the world name from server.properties
  local world_name
  world_name=$(get_world_name "$server_name")
  if [[ $? -ne 0 ]]; then
        msg_error "Failed to get world name from server.properties."
        return $(handle_error 11 "$action")  # Failed to configure server properties
  fi
    if [[ -z "$world_name" ]]; then
    msg_error "extract_world: world_name is empty. Check server.properties"
    return $(handle_error 11 "$action") # Failed to configure server properties
  fi

  local extract_dir="$server_dir/worlds/$world_name"

    # Check if server is running when not from addon
    if [[ "$from_addon" == false ]]; then
        was_running=$(stop_server_if_running "$server_name")
        if [[ $? -ne 0 ]]; then
            msg_error "Failed to stop server $server_name"

             return $(handle_error 10 "$action") #Failed to stop server
        fi
    fi

  msg_info "Installing world $(basename "$selected_file")..."

  # Remove existing world folder content
  msg_warn "Removing existing world folder..."
  rm -rf "$extract_dir"/*
    if [[ $? -ne 0 ]]; then
        msg_error "Failed to remove existing world folder content."
        return $(handle_error 16 "$action") # Failed to create/remove dir
    fi

  # Extract the new world
  msg_info "Extracting new world..."
  unzip -o "$selected_file" -d "$extract_dir" > /dev/null 2>>$scriptLog
  if [[ $? -ne 0 ]]; then
      msg_error "Failed to extract world from $selected_file"

      return $(handle_error 15 "$action") # Failed to download or extract
  fi
   chmod -R u+w "$extract_dir"
  if [[ $? -ne 0 ]]; then
      msg_warn "Failed to set write permissions on extracted world. This might cause issues."
      # Not fatal, so do not return
  fi

  msg_ok "World installed to $server_name"

  # Start the server after the world is installed if not from addon
  if [[ "$from_addon" == false ]]; then
    start_server_if_was_running "$server_name" "$was_running"
    if [[ $? -ne 0 ]]; then
        msg_error "Failed to restart server $server_name"
        return $(handle_error 10 "$action") # Failed to start server
    fi
  fi
  return 0 #Success
}

# Select .mcaddon/.mcpack menu
install_addons() {
  local server_name="$1"
  local action="install addons"

  if [[ -z "$server_name" ]]; then
    msg_error "install_addons: server_name is empty."
    return $(handle_error 25 "$action")  # Invalid server name
  fi

  # Directories
  local addon_dir="$SCRIPTDIR/content/addons"
  local server_dir="$BASE_DIR/$server_name"

  if [[ ! -d "$addon_dir" ]]; then
      msg_warn "Addon directory not found: $addon_dir.  No addons to install."
      return 0  # Not an error; just no addons available.
  fi

  # Get the world name from the server.properties file
  local world_name
  world_name=$(get_world_name "$server_name")
  if [[ $? -ne 0 ]]; then
      msg_error "Failed to retrieve world name."
      return $(handle_error 11 "$action")  # Failed to configure server properties
  fi

  # If we couldn't find the world name, return an error
  if [[ -z "$world_name" ]]; then
    msg_error "Could not find level-name in server.properties"
    return $(handle_error 11 "$action") #Failed to config
  fi

  msg_info "World name from server.properties: $world_name"

  # Set up addon and world directories
  local behavior_dir="$server_dir/worlds/$world_name/behavior_packs"
  local resource_dir="$server_dir/worlds/$world_name/resource_packs"
  local behavior_json="$server_dir/worlds/$world_name/world_behavior_packs.json"
  local resource_json="$server_dir/worlds/$world_name/world_resource_packs.json"

  # Create directories if they don't exist
  mkdir -p "$behavior_dir" "$resource_dir"
  if [[ $? -ne 0 ]]; then
      msg_error "Failed to create behavior/resource pack directories."
      return $(handle_error 16 "$action") # Failed to create directories.
  fi

  # Collect .mcaddon and .mcpack files using globbing
  local addon_files=()
  # Check for .mcaddon files
  if compgen -G "$addon_dir/*.mcaddon" &>>$scriptLog; then
    addon_files+=("$addon_dir"/*.mcaddon)
  fi
  # Check for .mcpack files
  if compgen -G "$addon_dir/*.mcpack" &>>$scriptLog; then
    addon_files+=("$addon_dir"/*.mcpack)
  fi

  # If no addons found, return an error
  if [[ ${#addon_files[@]} -eq 0 ]]; then
    msg_warn "No .mcaddon or .mcpack files found in $addon_dir"
    return 0  # Not an error, just no addons to install
  fi

  # Show selection menu
  show_addon_selection_menu "$server_name" "${addon_files[@]}"
  if [[ $? -ne 0 ]]; then
    msg_error "Failed to display or process addon selection menu."
    return $(handle_error 1 "$action")  # General error (menu failed)
  fi
  return 0
}

# Addon slection menu
show_addon_selection_menu() {
  local server_name="$1"
  shift
  local addon_files=("$@")
  local was_running=false
  local action="addon selection menu"

  if [[ -z "$server_name" ]]; then
    msg_error "show_addon_selection_menu: server_name is empty."
    return $(handle_error 25 "$action")  # Invalid server name
  fi

  if [[ ${#addon_files[@]} -eq 0 ]]; then
    msg_error "show_addon_selection_menu: addon_files array is empty."
    return $(handle_error 1 "$action")  # General error: No addons provided.
  fi

    local addon_dir="$SCRIPTDIR/content/addons" # Define addon_dir here

  PS3="Select an addon to install (1-${#addon_files[@]}): "
    local addon_names=()  # Make addon_names local
    for addon_file in "${addon_files[@]}"; do
      addon_names+=("$(basename "$addon_file")")  # Extract file name from path
    done
    while true; do
      echo -e "${CYAN}Available addons to install${RESET}:"
      select addon_name in "${addon_names[@]}"; do
        if [[ -z "$addon_name" ]]; then
          msg_error "Invalid selection. Please choose a valid option."
          break # Go back to the select menu
        fi

        # Find the full path of the selected file
        local addon_file=$(realpath "$addon_dir/$addon_name")
        if [[ $? -ne 0 || ! -f "$addon_file" ]]; then
          msg_error "Failed to resolve the full path to the addon file or file does not exist."
          return $(handle_error 1 "$action") # General error
        fi

        msg_info "Processing addon: $addon_name"

        # Check if server is running
        was_running=$(stop_server_if_running "$server_name")
         if [[ $? -ne 0 ]]; then
            msg_error "Failed to stop server $server_name."
            return $(handle_error 10 "$action")  # Failed to stop server
         fi

        process_addon "$addon_file" "$server_name"
        if [[ $? -ne 0 ]]; then
          msg_error "Failed to process addon $addon_name"
          return $(handle_error 1 "$action")  # Pass through error from process_addon
        fi

        start_server_if_was_running "$server_name" "$was_running"
        if [[ $? -ne 0 ]]; then
          msg_error "Failed to restart the server."
          return $(handle_error 10 "$action")  # Failed to start/stop server
        fi
        return 0 # Success
      done
    done
}

# Process the selected addon
process_addon() {
  local addon_file="$1"
  local server_name="$2"
  local action="process addon"

  if [[ -z "$addon_file" ]]; then
    msg_error "process_addon: addon_file is empty."
    return $(handle_error 2 "$action")  # Missing argument
  fi
  if [[ -z "$server_name" ]]; then
    msg_error "process_addon: server_name is empty."
    return $(handle_error 25 "$action")  # Invalid server name
  fi
  if [[ ! -f "$addon_file" ]]; then
      msg_error "process_addon: addon_file does not exist: $addon_file"
      return $(handle_error 15 "$action")  # Failed to download or extract files (closest match)
  fi

  # Extract addon name (strip file extension)
  local addon_name
  addon_name=$(basename "$addon_file" | sed -E 's/\.(mcaddon|mcpack)$//')
  if [[ $? -ne 0 ]]; then
    msg_error "Failed to extract addon name from: $addon_file"
    return $(handle_error 1 "$action")  # General error
  fi


  # If it's a .mcaddon, extract it
  if [[ "$addon_file" == *.mcaddon ]]; then
    process_mcaddon "$addon_file" "$server_name"
    if [[ $? -ne 0 ]]; then
      msg_error "Failed to process .mcaddon file: $addon_file"
      return 1  # General Error
    fi

  # If it's a .mcpack, process it
  elif [[ "$addon_file" == *.mcpack ]]; then
    process_mcpack "$addon_file" "$server_name"
     if [[ $? -ne 0 ]]; then
      msg_error "Failed to process .mcpack file: $addon_file"
      return 1 # General Error
     fi
  else
    msg_error "Unsupported addon file type: $addon_file"
    return $(handle_error 27 "$action") #Invalid pack type
  fi
  return 0
}

# Process .mcaddon file
process_mcaddon() {
  local addon_file="$1"
  local server_name="$2"
  local action="process mcaddon"

  if [[ -z "$addon_file" ]]; then
    msg_error "process_mcaddon: addon_file is empty."
    return $(handle_error 2 "$action")  # Missing argument
  fi
  if [[ -z "$server_name" ]]; then
    msg_error "process_mcaddon: server_name is empty."
    return $(handle_error 25 "$action")  # Invalid server name
  fi
  if [[ ! -f "$addon_file" ]]; then
        msg_error "process_mcaddon: addon_file does not exist: $addon_file"
        return $(handle_error 15 "$action")  # Failed to download or extract files
  fi

  local temp_dir
  temp_dir=$(mktemp -d)
  if [[ $? -ne 0 ]]; then
    msg_error "Failed to create temporary directory for .mcaddon processing."
    return $(handle_error 1 "$action")  # General error
  fi

  msg_info "Extracting $(basename "$addon_file")..."

  # Unzip the .mcaddon file to a temporary directory
  unzip -o "$addon_file" -d "$temp_dir" > /dev/null 2>>$scriptLog
  if [[ $? -ne 0 ]]; then
    msg_error "Failed to unzip .mcaddon file: $addon_file"
    rm -rf "$temp_dir"  # Clean up on failure
    return $(handle_error 15 "$action")  # Failed to download or extract files
  fi

  chmod -R u+w "$temp_dir"
  if [[ $? -ne 0 ]]; then
      msg_warn "Failed to set write permissions on extracted .mcaddon content."
      # Not fatal, don't return
  fi

  # Handle contents of the .mcaddon file
  process_mcaddon_files "$temp_dir" "$server_name"
  if [[ $? -ne 0 ]]; then
      msg_error "Failed to process extracted .mcaddon files."
      rm -rf "$temp_dir"
      return 1  # General Error
  fi

  rm -rf "$temp_dir"
  if [[ $? -ne 0 ]]; then
    msg_warn "Failed to remove temporary directory: $temp_dir"
     # This is less critical, so just log a warning.
  fi

  msg_ok "$(basename "$addon_file") extracted and installed."
  return 0 # Success
}

# Process files inside the .mcaddon
process_mcaddon_files() {
  local temp_dir="$1"
  local server_name="$2"
  local action="process mcaddon files"

  if [[ -z "$temp_dir" ]]; then
    msg_error "process_mcaddon_files: temp_dir is empty."
    return $(handle_error 2 "$action")  # Missing argument
  fi
  if [[ -z "$server_name" ]]; then
    msg_error "process_mcaddon_files: server_name is empty."
    return $(handle_error 25 "$action")  # Invalid server name
  fi
  if [[ ! -d "$temp_dir" ]]; then
      msg_error "process_mcaddon_files: temp_dir does not exist or is not a directory: $temp_dir"
      return $(handle_error 1 "$action")  # General error: Invalid temp dir
  fi

  # Process .mcworld files
  for world_file in "$temp_dir"/*.mcworld; do
    if [[ -f "$world_file" ]]; then
      msg_info "Processing .mcworld file: $(basename "$world_file")"
      extract_world "$server_name" "$world_file" true
      if [[ $? -ne 0 ]]; then
            msg_error "Failed to extract world from .mcaddon: $(basename "$world_file")"
            return 1  # General Error
      fi
    fi
  done

  # Process .mcpack files
  for pack_file in "$temp_dir"/*.mcpack; do
    if [[ -f "$pack_file" ]]; then
      msg_info "Processing .mcpack file: $(basename "$pack_file")"  # Corrected: use pack_file
      process_mcpack "$pack_file" "$server_name"
        if [[ $? -ne 0 ]]; then
            msg_error "Failed to process .mcpack from .mcaddon: $(basename "$pack_file")"
            return 1  # General Error
        fi
    fi
  done
  return 0
}

# Process .mcpack file
process_mcpack() {
  local pack_file="$1"
  local server_name="$2"
  local action="process mcpack"

  if [[ -z "$pack_file" ]]; then
    msg_error "process_mcpack: pack_file is empty."
    return $(handle_error 2 "$action")  # Missing argument
  fi
  if [[ -z "$server_name" ]]; then
    msg_error "process_mcpack: server_name is empty."
    return $(handle_error 25 "$action")  # Invalid server name
  fi
  if [[ ! -f "$pack_file" ]]; then
      msg_error "process_mcpack: pack_file does not exist: $pack_file"
      return $(handle_error 15 "$action")  # Failed to download or extract files
  fi

  local temp_dir
  temp_dir=$(mktemp -d)
  if [[ $? -ne 0 ]]; then
    msg_error "Failed to create temporary directory for .mcpack processing."
    return $(handle_error 1 "$action")  # General error
  fi

  msg_info "Extracting $(basename "$pack_file")..."

  # Unzip the .mcpack file to a temporary directory
  unzip -o "$pack_file" -d "$temp_dir" > /dev/null 2>>$scriptLog
  if [[ $? -ne 0 ]]; then
      msg_error "Failed to unzip .mcpack file: $pack_file"
      rm -rf "$temp_dir" # Clean up
      return $(handle_error 15 "$action")  # Failed to download or extract files
  fi
  chmod -R u+w "$temp_dir"
  if [[ $? -ne 0 ]]; then
      msg_warn "Failed to set write permissions on extracted .mcpack content."
      # Not fatal, don't return.
  fi

  # Parse the manifest.json and process the pack
  process_manifest "$temp_dir" "$server_name" "$pack_file"
  if [[ $? -ne 0 ]]; then
    msg_error "Failed to process manifest for $pack_file"
    rm -rf "$temp_dir"
    return 1 # General Error
  fi

  rm -rf "$temp_dir"
  if [[ $? -ne 0 ]]; then
    msg_warn "Failed to remove temporary directory: $temp_dir."
     # Not fatal, don't return.
  fi
  return 0 # Success
}

# Process manifest and install the pack
process_manifest() {
  local temp_dir="$1"
  local server_name="$2"
  local pack_file="$3"
  local action="process manifest"

  if [[ -z "$temp_dir" ]]; then
    msg_error "process_manifest: temp_dir is empty."
    return $(handle_error 2 "$action")  # Missing argument
  fi
  if [[ -z "$server_name" ]]; then
      msg_error "process_manifest: server_name is empty."
      return $(handle_error 25 "$action")  # Invalid server name
  fi
  if [[ -z "$pack_file" ]]; then
      msg_error "process_manifest: pack_file is empty."
      return $(handle_error 2 "$action")  # Missing argument
  fi

  # Extract information from manifest.json
  if extract_manifest_info "$temp_dir"; then
    # Use the extracted pack_type to install the pack
    install_pack "$pack_type" "$temp_dir" "$server_name" "$pack_file"
    if [[ $? -ne 0 ]]; then
      msg_error "install_pack failed for $(basename "$pack_file")"
      return 1 # General error
    fi
  else
    msg_error "Failed to process $(basename "$pack_file") due to missing manifest.json"
    return 1 # General Error
  fi
  return 0 # Success
}

# Extract info from manifest.json
extract_manifest_info() {
  local temp_dir="$1"
  local manifest_file="$temp_dir/manifest.json"
  local action="extract manifest info"

  if [[ -z "$temp_dir" ]]; then
    msg_error "extract_manifest_info: temp_dir is empty."
    return $(handle_error 2 "$action")  # Missing argument
  fi

  if [[ ! -f "$manifest_file" ]]; then
    msg_error "manifest.json not found in $temp_dir"
    return $(handle_error 1 "$action") # General error
  fi

  # Use jq to extract the necessary values
  pack_type=$(jq -r '.modules[0].type' "$manifest_file" 2>&1) # Capture stderr
  if [[ $? -ne 0 ]]; then
      msg_error "Failed to extract pack_type from manifest.json"
      return $(handle_error 1 "$action") #General error
  fi

  uuid=$(jq -r '.header.uuid' "$manifest_file" 2>&1)
  if [[ $? -ne 0 ]]; then
      msg_error "Failed to extract uuid from manifest.json"
      return $(handle_error 1 "$action") # General error
  fi

  version=$(jq -r '.header.version | join(".")' "$manifest_file" 2>&1)
  if [[ $? -ne 0 ]]; then
      msg_error "Failed to extract version from manifest.json"
      return $(handle_error 1 "$action") #General error
  fi

  addon_name_from_manifest=$(jq -r '.header.name' "$manifest_file" 2>&1)
  if [[ $? -ne 0 ]]; then
    msg_error "Failed to extract name from manifest.json"
    return $(handle_error 1 "$action") # General error
  fi

  formatted_addon_name=$(echo "$addon_name_from_manifest" | tr '[:upper:]' '[:lower:]' | tr ' ' '_')
  if [[ $? -ne 0 ]]; then
    msg_error "Failed to format addon name."
    return $(handle_error 1 "$action")  # General error
  fi
  return 0 # Success
}

# Install .mcpack based on type
install_pack() {
  local type="$1"
  local temp_dir="$2"
  local server_name="$3"
  local pack_file="$4"
  local action="install pack"
  # Note: the following variables are assumed to be set by extract_manifest_info:
  #   uuid, version, addon_name_from_manifest, formatted_addon_name

  if [[ -z "$type" ]]; then
      msg_error "install_pack: type is empty."
      return $(handle_error 2 "$action")  # Missing argument
  fi
  if [[ -z "$temp_dir" ]]; then
      msg_error "install_pack: temp_dir is empty."
      return $(handle_error 2 "$action")  # Missing argument
  fi
  if [[ -z "$server_name" ]]; then
    msg_error "install_pack: server_name is empty."
    return $(handle_error 25 "$action")  # Invalid server name
  fi
  if [[ -z "$pack_file" ]]; then
      msg_error "install_pack: pack_file is empty."
      return $(handle_error 2 "$action") # Missing argument
  fi

  # Get the world name from the server.properties file
  local world_name
  world_name=$(get_world_name "$server_name")
  if [[ -z "$world_name" ]]; then
      msg_error "Could not find level-name in server.properties"
      return $(handle_error 11 "$action") # Failed to config
  fi

  local behavior_dir="$server_dir/worlds/$world_name/behavior_packs"
  local resource_dir="$server_dir/worlds/$world_name/resource_packs"
  local behavior_json="$server_dir/worlds/$world_name/world_behavior_packs.json"
  local resource_json="$server_dir/worlds/$world_name/world_resource_packs.json"

  # Create directories if they don't exist
  mkdir -p "$behavior_dir" "$resource_dir"
  if [[ $? -ne 0 ]]; then
      msg_error "Failed to create behavior/resource pack directories."
      return $(handle_error 16 "$action") # Failed to create directories.
  fi

  if [[ "$type" == "data" ]]; then
    msg_info "Installing behavior pack to $server_name"
    local addon_behavior_dir="$behavior_dir/${formatted_addon_name}_${version}"
    mkdir -p "$addon_behavior_dir"
    if [[ $? -ne 0 ]]; then
      msg_error "Failed to create behavior pack directory: $addon_behavior_dir"
      return $(handle_error 16 "$action") # Failed to create directory
    fi
    cp -r "$temp_dir"/* "$addon_behavior_dir"
    if [[ $? -ne 0 ]]; then
      msg_error "Failed to copy behavior pack files to: $addon_behavior_dir"
       return $(handle_error 1 "$action") # General error
    fi
    chmod -R u+w "$addon_behavior_dir"
    if [[ $? -ne 0 ]]; then
      msg_warn "Failed to set write permissions on behavior pack directory."
      # Not fatal, so don't return.
    fi
    update_pack_json "$behavior_json" "$uuid" "$version"
    if [[ $? -ne 0 ]]; then
      msg_error "Failed to update $behavior_json"
      return $(handle_error 14 "$action") # Failed to read/write config file
    fi
    msg_ok "Installed $(basename "$pack_file") to $server_name."

  elif [[ "$type" == "resources" ]]; then
    msg_info "Installing resource pack to $server_name"
    local addon_resource_dir="$resource_dir/${formatted_addon_name}_${version}"
    mkdir -p "$addon_resource_dir"
    if [[ $? -ne 0 ]]; then
        msg_error "Failed to create resource pack directory: $addon_resource_dir"
        return $(handle_error 16 "$action") #Failed to create dir
    fi
    cp -r "$temp_dir"/* "$addon_resource_dir"
    if [[ $? -ne 0 ]]; then
      msg_error "Failed to copy resource pack files to: $addon_resource_dir"
      return $(handle_error 1 "$action") # General error
    fi
    chmod -R u+w "$addon_resource_dir"
    if [[ $? -ne 0 ]]; then
      msg_warn "Failed to set write permissions on resource pack directory."
       # Not fatal, so don't return.
    fi
    update_pack_json "$resource_json" "$uuid" "$version"
    if [[ $? -ne 0 ]]; then
      msg_error "Failed to update $resource_json"
      return $(handle_error 14 "$action") # Failed to update json
    fi
    msg_ok "Installed $(basename "$pack_file") to $server_name."
  else
    msg_error "Unknown pack type: $type"
    return $(handle_error 27 "$action") # Invalid Pack Type
  fi
  return 0 # Success
}

# Update pack JSON files
update_pack_json() {
  local json_file="$1"
  local pack_id="$2"
  local version="$3"
  local action="update pack json"

  msg_info "Updating "$(basename "$json_file")"."

  if [[ -z "$json_file" ]]; then
      msg_error "update_pack_json: json_file is empty."
      return $(handle_error 2 "$action")  # Missing argument
  fi
  if [[ -z "$pack_id" ]]; then
      msg_error "update_pack_json: pack_id is empty."
      return $(handle_error 2 "$action")  # Missing argument
  fi
  if [[ -z "$version" ]]; then
      msg_error "update_pack_json: version is empty."
      return $(handle_error 2 "$action")  # Missing argument
  fi

  # Ensure JSON file exists
  if [[ ! -f "$json_file" ]]; then
    echo "[]" > "$json_file"
    if [[ $? -ne 0 ]]; then
        msg_error "Failed to initialize JSON file: $json_file"
        return $(handle_error 14 "$action") # Failed to write
    fi
  fi

  # Convert version string to an array
  local version_array
  version_array=$(echo "$version" | awk -F '.' '{print "["$1", "$2", "$3"]"}')
  if [[ $? -ne 0 ]]; then
      msg_error "Failed to format version as JSON array."
      return $(handle_error 1 "$action") # General error
  fi

  # Read existing JSON and update
  local updated_json
  updated_json=$(jq --arg pack_id "$pack_id" --argjson version "$version_array" '
    . as $packs
    | if any(.pack_id == $pack_id) then
        map(if .pack_id == $pack_id then
          if (.version | join(".") | split(".") | map(tonumber)) < ($version | join(".") | split(".") | map(tonumber)) then
            {pack_id: $pack_id, version: $version}
          else
            .
          end
        else
          .
        end)
      else
        . + [{pack_id: $pack_id, version: $version}]
      end' "$json_file")

  if [[ $? -ne 0 ]]; then
    msg_error "Failed to update JSON data using jq."
    return $(handle_error 1 "$action")  # General error
  fi

  # Write updated JSON back to the file
  echo "$updated_json" > "$json_file"
  if [[ $? -ne 0 ]]; then
    msg_error "Failed to write updated JSON to file: $json_file"
    return $(handle_error 14 "$action")  # Failed to read/write configuration file
  fi
  msg_ok "Updated "$(basename "$json_file")"."
  return 0 # Success
}

# Attach to screen
attach_console() {
  local server_name="$1"
  local action="attach console"

  if [[ -z "$server_name" ]]; then
    msg_error "attach_console: server_name is empty."
    return $(handle_error 25 "$action")  # Invalid server name
  fi

  # Check if the server is running in a screen session
  if screen -list | grep -q "bedrock-${server_name}"; then
    msg_info "Attaching to server '$server_name' console..."
    screen -r "bedrock-${server_name}"
    if [[ $? -ne 0 ]]; then  # Check if screen -r failed
        msg_error "Failed to attach to screen session for server: $server_name"
        return $(handle_error 18 "$action") # Failed to attach to server console.
    fi
  else
    msg_warn "Server '$server_name' is not running in a screen session."
    return $(handle_error 6 "$action") # Server Not found
  fi
  return 0
}

# Send commands to server
send_command() {
  local server_name="$1"
  local command="$2"
  local action="send command"

  if [[ -z "$server_name" ]]; then
    msg_error "send_command: server_name is empty."
    return $(handle_error 25 "$action")  # Invalid server name
  fi
  if [[ -z "$command" ]]; then
    msg_error "send_command: command is empty."
    return $(handle_error 5 "$action")  # Invalid input: empty command
  fi

  # Check if the server is running in a screen session
  if screen -list | grep -q "bedrock-${server_name}"; then
    # Send the command to the screen session
    msg_info "Sending command to server '$server_name'..."
    screen -S "bedrock-${server_name}" -X stuff "$command"^M"" # ^M simulates Enter key
    if [[ $? -ne 0 ]]; then
      msg_error "Failed to send command '$command' to server '$server_name'."
      return $(handle_error 17 "$action")  # Failed to send command to server
    fi
    msg_ok "Command '$command' sent to server '$server_name'."
  else
    msg_warn "Server '$server_name' is not running in a screen session."
    return $(handle_error 6 "$action") # Server Not found
  fi
  return 0
}

# Delete a Bedrock server
delete_server() {
  local server_name="$1"
  local server_dir="$BASE_DIR/$server_name"
  local service_file="$HOME/.config/systemd/user/bedrock-${server_name}.service"
  local config_folder="$CONFIGDIR/$server_name"
  local action="delete server"

  if [[ -z "$server_name" ]]; then
    msg_error "delete_server: server_name is empty."
    return $(handle_error 25 "$action")  # Invalid server name
  fi

  if [[ ! -d "$server_dir" && ! -d "$config_folder" ]]; then
      msg_warn "Server '$server_name' does not appear to exist (no server or config directory)."
      return 0  # Not an error if it doesn't exist when deleting.
  fi

  # Confirm deletion
  read -p "Are you sure you want to delete the server '$server_name'? This action is irreversible! (y/n): " confirm
  if [[ ! "${confirm,,}" =~ ^(y|yes)$ ]]; then
    msg_info "Server deletion canceled."
    return 0  # User canceled, not an error
  fi

  # Stop the server if it's running
  if systemctl --user is-active --quiet "bedrock-${server_name}"; then
    msg_warn "Stopping server '$server_name' before deletion..."
    stop_server "$server_name"
    if [[ $? -ne 0 ]]; then
      msg_warn "Failed to stop server '$server_name' before deletion.  Continuing with deletion..."
      # In this specific case, failing to *stop* a server before deleting it
      # is probably *not* grounds to abort the deletion. The user has confirmed
      # they want to delete, so proceed.
    fi
  fi

  # Remove the systemd service file
  if [[ -f "$service_file" ]]; then
    msg_warn "Removing user systemd service for '$server_name'"
    disable_service "$server_name"
     if [[ $? -ne 0 ]]; then
            msg_warn "Failed to disable service $server_name."
            # Not a fatal error for deleting
     fi
    rm -f "$service_file"
    if [[ $? -ne 0 ]]; then
        msg_warn "Failed to remove service file: $service_file"
        # Not a fatal error for deleting
    fi
    systemctl --user daemon-reload
    if [[ $? -ne 0 ]]; then
        msg_warn "Failed to reload systemd daemon after service removal."
        #Not a fatal error.
    fi
  fi

  # Remove the server directory
  msg_warn "Deleting server directory: $server_dir"
  rm -rf "$server_dir"
  if [[ $? -ne 0 ]]; then
    msg_error "Failed to delete server directory: $server_dir"
    return $(handle_error 21 "$action") #Failed to delete
  fi

   # Remove the config directory
  msg_warn "Deleting config directory: $config_folder"
  rm -rf "$config_folder"
  if [[ $? -ne 0 ]]; then
    msg_error "Failed to delete config directory: $config_folder"
    return $(handle_error 16 "$action")# Failed to remove
  fi

  msg_ok "Server '$server_name' deleted successfully."
  return 0
}

# Back up a server's worlds and critical configuration files
backup_server() {
  local server_name="$1"
  local backup_type="$2"   # "world" or "config"
  local file_to_backup="$3"  # for config type only
  local change_status="${4:-true}"
  local server_dir="$BASE_DIR/$server_name"
  local backup_dir="$SCRIPTDIR/backups/$server_name"
  local action="backup server"

    if [[ -z "$server_name" ]]; then
        msg_error "backup_server: server_name is empty."
        return $(handle_error 25 "$action")  # Invalid server name
    fi
    if [[ -z "$backup_type" ]]; then
        msg_error "backup_server: backup_type is empty."
        return $(handle_error 2 "$action")  # Missing argument
    fi

  local file_name="$file_to_backup" # for config type only

  file_to_backup="$server_dir/$file_to_backup"

  # Ensure the backup directory exists.
  mkdir -p "$backup_dir"
  if [[ $? -ne 0 ]]; then
    msg_error "Failed to create backup directory: $backup_dir"
    return $(handle_error 16 "$action") # Failed to create directory
  fi

  if [[ "$backup_type" == "world" ]]; then

    # Check if server is running when change_status is true
    if [[ "$change_status" == true ]]; then
      was_running=$(stop_server_if_running "$server_name")
        if [[ $? -ne 0 ]]; then
          msg_error "Failed to stop server $server_name for backup."
          return $(handle_error 10 "$action") # Failed to start/stop
        fi
    fi

    # Export world to .mcworld
    export_world "$server_name"
    if [[ $? -ne 0 ]]; then
        msg_error "Failed to export world for backup."
        # Restart the server IF it was originally running
        if [[ "$change_status" == true && "$was_running" == true ]]; then
            start_server "$server_name"
            if [[ $? -ne 0 ]]; then
                msg_error "Failed to restart server $server_name after failed backup"
            fi
        fi
        return $(handle_error 20 "$action") # Failed to backup
    fi

    # Start the server (if it was running)
    if [[ "$change_status" == true ]]; then # Only restart if we stopped it
      start_server_if_was_running "$server_name" "$was_running"
      if [[ $? -ne 0 ]]; then
          msg_error "Failed to restart server $server_name after backup."
          return $(handle_error 10 "$action") # Failed to start/stop server
      fi
    fi

    prune_old_backups "$server_name"
     if [[ $? -ne 0 ]]; then
      msg_warn "Failed to prune old backups after world backup."
      #Not a fatal error
    fi

  elif [[ "$backup_type" == "config" ]]; then
    if [[ -z "$file_to_backup" ]]; then
      msg_error "backup_server: file_to_backup is empty when backup_type is config."
      return $(handle_error 2 "$action") # Missing argument
    fi

    if [[ ! -f "$file_to_backup" ]]; then
      msg_error "Configuration file '$file_to_backup' not found!"
      return $(handle_error 14 "$action") # Failed to read config file
    fi
    local timestamp
    timestamp=$(get_timestamp)
    if [[ $? -ne 0 ]]; then
      msg_error "Failed to get timestamp for backup."
      return $(handle_error 1 "$action") # General error
    fi

    cp "$file_to_backup" "$backup_dir/${file_name%.*}_backup_${timestamp}.${file_name##*.}"
    if [[ $? -ne 0 ]]; then
      msg_error "Failed to copy '$file_to_backup' to '$backup_dir'"
      return $(handle_error 1 "$action")  # General Error.
    fi

    msg_ok "$file_name backed up to $backup_dir"
    prune_old_backups "$server_name" "$file_name"
    if [[ $? -ne 0 ]]; then
      msg_warn "Failed to prune old backups."
      # Non fatal error
    fi
  else
    msg_error "Invalid backup type: $backup_type"
    return $(handle_error 5 "$action") # Invalid Input
  fi
  msg_ok "Backup process completed."
  return 0 # Success
}

# Backup all files (world and configuration files)
backup_all() {
  local server_name="$1"
  local change_status="${2:-true}"
  local action="backup all"

  if [[ -z "$server_name" ]]; then
    msg_error "backup_all: server_name is empty."
    return $(handle_error 25 "$action")  # Invalid server name
  fi

  local was_running=false # Initialize to false

  # Check if server is running and stop if required
  if [[ "$change_status" == true ]]; then
    was_running=$(stop_server_if_running "$server_name")
    if [[ $? -ne 0 ]]; then
        msg_error "Failed to stop server $server_name for backup."
        # Since this is a general backup, it's probably best *not* to continue
        # if we can't stop the server.  A consistent state is important.
        return $(handle_error 10 "$action") # Failed to stop server
    fi
  fi

  backup_server "$server_name" "world" "" false
  if [[ $? -ne 0 ]]; then
    msg_error "Failed to backup world for $server_name."
    # Don't return, try to back up other files.
  fi
  backup_server "$server_name" "config" "allowlist.json" false
  if [[ $? -ne 0 ]]; then
    msg_error "Failed to backup allowlist.json for $server_name."
     # Don't return, try to back up other files.
  fi
  backup_server "$server_name" "config" "permissions.json" false
  if [[ $? -ne 0 ]]; then
    msg_error "Failed to backup permissions.json for $server_name."
     # Don't return, try to back up other files.
  fi
  backup_server "$server_name" "config" "server.properties" false
  if [[ $? -ne 0 ]]; then
    msg_error "Failed to backup server.properties for $server_name."
    # Don't return, try to back up other files.
  fi

  # Start server if was running
  if [[ "$change_status" == true ]]; then
    start_server_if_was_running "$server_name" "$was_running"
    if [[ $? -ne 0 ]]; then
      msg_error "Failed to restart server $server_name after backup."
      return $(handle_error 10 "$action") # Failed to start/stop the server
    fi
  fi

  prune_old_backups "$server_name"
  if [[ $? -ne 0 ]]; then
    msg_warn "Failed to prune old backups."
    # Non-fatal error
  fi

  msg_ok "All files have been backed up."
  return 0 # Success
}

# Prune old backups in the backup directory (world and config files).
prune_old_backups() {
  local server_name="$1"
  local file_name="$2"
  local backup_dir="$SCRIPTDIR/backups/$server_name"
  local action="prune old backups"

  if [[ -z "$server_name" ]]; then
    msg_error "prune_old_backups: server_name is empty."
    return $(handle_error 25 "$action")  # Invalid server name
  fi

  if [[ ! -d "$backup_dir" ]]; then
    msg_warn "Backup directory does not exist: $backup_dir.  Nothing to prune."
    return 0  # Not an error; nothing to do.
  fi


  local level_name
  level_name=$(get_world_name "$server_name")
  if [[ $? -ne 0 ]]; then
    msg_warn "Failed to get world name. Pruning world backups may be inaccurate."
    # Not a fatal error, try to prune the backups
  fi

  local backups_to_keep=$((BACKUP_KEEP + 1))
  msg_info "Pruning old backups..."

  # Prune world backups (*.mcworld)
  find "$backup_dir" -maxdepth 1 -name "${level_name}_backup_*.mcworld" -type f | sort -r | tail -n "+$backups_to_keep" | while read -r old_backup; do
    msg_info "Removing old backup: $old_backup"
    rm -f "$old_backup"
    if [[ $? -ne 0 ]]; then
      msg_error "Failed to remove $old_backup"
      # Non-fatal error, log and continue
    fi
  done

  # Only attempt to prune config files if file_name is provided.
  if [[ -n "$file_name" ]]; then
      # Prune configuration file backups for JSON files
      find "$backup_dir" -maxdepth 1 -name "${file_name%.*}_backup_*.json" -type f | sort -r | tail -n "+$backups_to_keep" | while read -r old_backup; do
        msg_info "Removing old backup: $old_backup"
        rm -f "$old_backup"
        if [[ $? -ne 0 ]]; then
          msg_error "Failed to remove $old_backup"
          # Non-fatal error, log and continue
        fi
      done

      # Prune configuration file backups for properties files
      find "$backup_dir" -maxdepth 1 -name "${file_name%.*}_backup_*.properties" -type f | sort -r | tail -n "+$backups_to_keep" | while read -r old_backup; do
        msg_info "Removing old backup: $old_backup"
        rm -f "$old_backup"
         if [[ $? -ne 0 ]]; then
          msg_error "Failed to remove $old_backup"
           # Non-fatal error, log and continue
        fi
      done
  fi
    return 0
}

# Export world as a .mcworld file
export_world() {
  local server_name="$1"
  local server_dir="$BASE_DIR/$server_name"
  local world_folder
  local timestamp
  local backup_dir
  local backup_file
  local action="export world"
  # Define backup directory
  backup_dir="$SCRIPTDIR/backups/$server_name"

  if [[ -z "$server_name" ]]; then
    msg_error "export_world: server_name is empty."
    return $(handle_error 25 "$action")  # Invalid server name
  fi

  # Extract world folder name from server.properties
  world_folder=$(get_world_name "$server_name")
  if [[ $? -ne 0 ]]; then
        msg_error "Failed to get world name from server.properties."
        return $(handle_error 11 "$action")  # Failed to configure server properties (closest match)
  fi
  if [[ -z "$world_folder" ]]; then
    msg_error "Failed to determine world folder from server.properties!"
    return $(handle_error 11 "$action") # Failed to config
  fi

  # Get the timestamp for the backup
  timestamp=$(get_timestamp)  # Get timestamp only when backing up files
  if [[ $? -ne 0 ]]; then
    msg_error "Failed to get timestamp for backup."
    return $(handle_error 1 "$action")  # General error
  fi

  # Backup world folder into a .mcworld file
  backup_file="$backup_dir/${world_folder}_backup_${timestamp}.mcworld"
  if [[ -d "$server_dir/worlds/$world_folder" ]]; then
    msg_info "Backing up world folder '$world_folder'..."
    if ! (cd "$server_dir/worlds/$world_folder" && zip -r "$backup_file" . ); then
      msg_error "Backup of world failed!"
      return $(handle_error 20 "$action")  # Failed to backup server
    fi
    msg_ok "World backup created: $backup_file"
  else
    msg_warn "World directory '$world_folder' does not exist. Skipping world backup."
    return 0 # Not a failure if world directory does not exist
  fi
  return 0 #Success
}

# Perform the server restore
restore_server() {
  local server_name="$1"
  local backup_file="$2"
  local restore_type="$3"
  local change_status="${4:-true}"
  local server_dir="$BASE_DIR/$server_name"
  local action="restore server"

  if [[ -z "$server_name" ]]; then
      msg_error "restore_server: server_name is empty."
      return $(handle_error 25 "$action")  # Invalid server name
  fi
  if [[ -z "$backup_file" ]]; then
      msg_error "restore_server: backup_file is empty."
      return $(handle_error 2 "$action")  # Missing argument
  fi
  if [[ -z "$restore_type" ]]; then
      msg_error "restore_server: restore_type is empty."
      return $(handle_error 2 "$action")  # Missing argument
  fi

  # Extract just the first word from backup_file
  local base_name=$(basename "$backup_file" | cut -d'_' -f1)
  if [[ $? -ne 0 ]]; then
      msg_error "Failed to extract base name from backup file path."
      return $(handle_error 1 "$action")  # General error
  fi
  # Extract the file type
  local file_extension="${backup_file##*.}"
  if [[ -z "$file_extension" ]]; then
      msg_error "Failed to extract file extension from backup file path."
      return $(handle_error 1 "$action")  # General error
  fi

  if [[ ! -f "$backup_file" ]]; then
    msg_error "Backup file '$backup_file' not found!"
    return $(handle_error 15 "$action")  # Failed to download or extract files
  fi

  # Check if server is running and stop if required
  local was_running=false
  if [[ "$change_status" == true ]]; then
    was_running=$(stop_server_if_running "$server_name")
     if [[ $? -ne 0 ]]; then
        msg_error "Failed to stop server $server_name before restore."
         return $(handle_error 10 "$action") # Failed to start/stop
    fi
  fi

  if [[ "$restore_type" == "world" ]]; then
    extract_world "$server_name" "$backup_file"
    if [[ $? -ne 0 ]]; then
        msg_error "Failed to extract world during restore."
        # Attempt to restart the server if it was stopped
        if [[ "$change_status" == true && "$was_running" == true ]]; then
          start_server "$server_name"
          if [[ $? -ne 0 ]]; then
              msg_error "Failed to restart server after restore."
              return $(handle_error 10 "$action")
           fi
        fi
        return $(handle_error 15 "$action")  # Failed to download or extract files
    fi
  else
    # Construct the target filename (e.g., 'allowlist.json')
    local target_file="$server_dir/$base_name.$file_extension"
    msg_info "Restoring configuration file: $(basename "$backup_file")"
    cp -f "$backup_file" "$target_file"
    if [[ $? -ne 0 ]]; then
        msg_error "Failed to restore configuration file: $(basename "$backup_file")"
        return $(handle_error 14 "$action") # Failed to write config file
    fi
  fi

  # Start server if was running
    if [[ "$change_status" == true ]]; then
    start_server_if_was_running "$server_name" "$was_running"
    if [[ $? -ne 0 ]]; then
        msg_error "Failed to restart server after restore."
        return $(handle_error 10 "$action") # Failed to start/stop the server
    fi
  fi

  msg_ok "$base_name file restored successfully!"
  return 0 # Success
}

# Restore all newest files
restore_all() {
  local server_name="$1"
  local change_status="${2:-true}"
  local backup_dir="$SCRIPTDIR/backups/$server_name"
  local action="restore all"

  if [[ -z "$server_name" ]]; then
    msg_error "restore_all: server_name is empty."
    return $(handle_error 25 "$action")  # Invalid server name
  fi

  if [[ ! -d "$backup_dir" ]]; then
    msg_error "No backups found for '$server_name'."
    return 0  # Not an error; nothing to restore.
  fi

  # Find the latest world backup (using null-terminated output)
  local latest_world
  latest_world=$(find "$backup_dir" -name "*.mcworld" -type f -print0 | xargs -0 ls -t | head -n 1)
  if [[ $? -ne 0 ]]; then
    msg_warn "Error finding latest world backup.  Continuing..."
    # Not a fatal error (yet), as there might be config backups.
  fi
  if [[ -z "$latest_world" ]]; then
    msg_warn "No world backups found in '$backup_dir'."
    # Don't return here; there might still be config files to restore.
  fi

    local was_running=false # Initialize was_running

  # Check if server is running and stop if required
  if [[ "$change_status" == true ]]; then
    was_running=$(stop_server_if_running "$server_name")
    if [[ $? -ne 0 ]]; then
      msg_error "Failed to stop server $server_name before restore."
      # Since this is a general restore, it's probably best *not* to continue
      # if we can't stop the server. A consistent state is very important.
      return $(handle_error 10 "$action") # Failed to stop server
    fi
  fi

  # Restore the latest world backup (if found)
  if [[ -n "$latest_world" ]]; then  # Only restore if a world backup was found
      msg_info "Restoring the latest world from: $(basename "$latest_world")"
      restore_server "$server_name" "$latest_world" "world" "" false
      if [[ $? -ne 0 ]]; then
        msg_error "Failed to restore world."
        # Don't return yet; try to restore config files.
      fi
  fi

  # Restore latest server.properties backup
  local latest_properties
  # Use mapfile to capture null-delimited filenames into an array
  mapfile -d '' -t properties_array < <(find "$backup_dir" -name "server_backup_*.properties" -type f -print0 | sort -z -r)
  if [[ $? -ne 0 ]]; then
    msg_warn "Error finding latest server.properties backup.  Continuing..."
    # Non fatal error, try next file
  fi
  latest_properties="${properties_array[0]}"
  msg_debug "Value of latest_properties: '$latest_properties'"
  if [[ -n "$latest_properties" ]]; then
    restore_server "$server_name" "$latest_properties" "config" false
     if [[ $? -ne 0 ]]; then
        msg_error "Failed to restore server.properties."
        # Don't return, continue to restore other configs
     fi
  else
    msg_warn "No server.properties backup found to restore."
  fi

  # Restore latest JSON backups (for files like allowlist, permissions, etc.)
  local json_files_array=()
  mapfile -d '' -t json_files_array < <(find "$backup_dir" -name "*_backup_*.json" -type f -print0 | sort -z -r)
  if [[ $? -ne 0 ]]; then
      msg_warn "Error finding latest JSON backups.  Continuing..."
      # Non fatal, try to restore as much as possible
  fi

  # Process only the latest of each JSON type
  local restored_json_types=()  # Array to track which types have been restored
  for config_file in "${json_files_array[@]}"; do
      # Skip empty entries (if any)
      if [[ -z "$config_file" ]]; then
          continue
      fi
      local filename config_type
      filename=$(basename "$config_file")
      config_type=$(echo "$filename" | sed 's/_backup_.*\.json//')
      if ! contains "${restored_json_types[@]}" "$config_type"; then
          restore_server "$server_name" "$config_file" "config" false
          if [[ $? -ne 0 ]]; then
            msg_error "Failed to restore $config_type."
            # Continue to next config file
          fi
          restored_json_types+=("$config_type")
      fi
  done

  # Start server if it was running before the restore
  if [[ "$change_status" == true ]]; then
      start_server_if_was_running "$server_name" "$was_running"
      if [[ $? -ne 0 ]]; then
        msg_error "Failed to restart server after restore."
        return $(handle_error 10 "$action") # Failed to start server
      fi
  fi
  msg_ok "All restore operations completed."
  return 0 # Success
}

# Check if array contains an element
contains() {
  local n=$#
  local value="${!n}"
  for (( i=1; i < n; i++ )); do
    if [[ "${!i}" == "$value" ]]; then
      return 0 # Found
    fi
  done
  return 1 # Not found
}

# Load Default Config Variables
default_config

# Make folders if they don't exist
mkdir -p $BASE_DIR
mkdir -p $SCRIPTDIR/content/worlds
mkdir -p $SCRIPTDIR/content/addons
mkdir -p $CONFIGDIR
mkdir -p $SCRIPTDIR/.logs

# Migrate to new config.json
scan_and_update_server_configs() {
    local base_dir="$BASE_DIR"
    local action="scan and update server configs"

    msg_debug "Starting scan of server directories in: $base_dir"

    if [[ ! -d "$base_dir" ]]; then
        msg_warn "Base directory '$base_dir' not found or is not a directory. Skipping scan."
        return 0  # Not an error if the base directory doesn't exist
    fi

    find "$base_dir" -maxdepth 1 -mindepth 1 -type d -print0 | while IFS= read -r -d $'\0' server_dir_path; do
        local server_name=$(basename "$server_dir_path")
        local config_file="$CONFIGDIR/$server_name/${server_name}_config.json"
        local version_file="$server_dir_path/version.txt"
        local server_output_file="$server_dir_path/server_output.txt"

        # Skip if config.json already exists
        if [[ -f "$config_file" ]]; then
            msg_debug "Skipping ${server_name}_config.json already exists."
            continue
        fi

        # Skip if version.txt does not exist
        if [[ ! -f "$version_file" ]]; then
            msg_debug "Skipping $server_name: version.txt not found."
            continue
        fi

        msg_debug "Processing server directory: $server_name ( ${server_name}_config.json missing, version.txt found)"

        # Validate the server directory
        if ! validate_server "$server_name"; then
            msg_warn "Server validation failed for: $server_name. Skipping config update."
            continue
        fi

        msg_debug "Server validated for: $server_name. Proceeding with config update."

        # Read target_version from version.txt
        local target_version=$(tr -d '\n' < "$version_file") # Remove newline
        if [[ $? -ne 0 ]]; then
            msg_warn "Failed to read version.txt for $server_name.  Skipping."
            continue
        fi

        if [[ -n "$target_version" ]]; then
            msg_debug "Found target_version: '$target_version' in $version_file"
        else
            msg_debug "Warning: version.txt in $server_name is empty."
        fi

        # Extract installed_version from server_output.txt
        local installed_version=""
        local server_status="UNKNOWN" # Default to UNKNOWN
        if [[ -f "$server_output_file" ]]; then
            installed_version=$(grep -oE '[0-9]+\.[0-9]+\.[0-9]+(\.[0-9]+)?(-[a-zA-Z0-9]+)?' "$server_output_file" | head -n 1)
            if [[ $? -ne 0 ]]; then
                msg_warn "Failed to extract installed_version from $server_output_file.  Continuing..."
                # Not a fatal error; continue.
            fi
            installed_version=$(echo "$installed_version" | sed 's/-beta/\./') # Replace '-beta' with '.'
            installed_version=${installed_version%.} # Remove trailing dots if any

            server_status=$(check_server_status "$server_name")
            if [[ $? -ne 0 ]]; then
                msg_warn "Failed to get server status for $server_name.  Continuing..."
                # Non-fatal, we can still create config.
            fi

            if [[ -n "$installed_version" ]]; then
                msg_debug "Found installed_version: '$installed_version' in $server_output_file"
            else
                msg_debug "Warning: Could not extract installed version from $server_output_file."
            fi

        else
            msg_debug "Warning: $server_output_file not found for $server_name. Cannot extract installed version."
        fi

        # Ensure config directory exists
        mkdir -p "$CONFIGDIR/$server_name"
        if [[ $? -ne 0 ]]; then
            msg_error "Failed to create config directory for $server_name. Skipping."
            continue
        fi

        # Use manage_server_config to create config.json
        msg_info "Creating ${server_name}_config.json for $server_name..."
        manage_server_config "$server_name" "server_name" "write" "$server_name"
        if [[ $? -ne 0 ]]; then
            msg_error "Failed to write server_name to config. Skipping $server_name."
            continue
        fi
        manage_server_config "$server_name" "target_version" "write" "$target_version"
        if [[ $? -ne 0 ]]; then
          msg_error "Failed to write target_version to config. Skipping $server_name"
          continue
        fi
        manage_server_config "$server_name" "status" "write" "$server_status"
        if [[ $? -ne 0 ]]; then
          msg_error "Failed to write status to config. Skipping $server_name."
          continue
        fi

        if [[ -n "$installed_version" ]]; then
            manage_server_config "$server_name" "installed_version" "write" "$installed_version"
            if [[ $? -ne 0 ]]; then
              msg_error "Failed to write installed_version to config. Skipping $server_name."
              continue
            fi
        fi

        msg_info "Created ${server_name}_config.json for $server_name."

    done

    msg_debug "Scan of server directories completed."
    return 0  # Success
}
scan_and_update_server_configs

# Start server if was running
start_server_if_was_running() {
    local server_name="$1"
    local was_running="$2"
    local action="start server if was running"

    if [[ -z "$server_name" ]]; then
        msg_error "start_server_if_was_running: server_name is empty."
        return $(handle_error 25 "$action")  # Invalid server name
    fi

    if [[ "$was_running" == true ]]; then
        start_server "$server_name"
        if [[ $? -ne 0 ]]; then
          msg_error "Failed to restart server: $server_name"
          return $(handle_error 10 "$action") #Failed to start server
        fi    
    else
        msg_info "Skip starting server '$server_name'."
    fi
    return 0 #Success
}

# Stop server if was running
stop_server_if_running() {
    local server_name="$1"
    local was_running=false # Default to false
    local action="stop server if running"

    if [[ -z "$server_name" ]]; then
       msg_error "stop_server_if_running: server_name is empty."
       echo "false" # Still return "false" on error
       return $(handle_error 25 "$action") #Invalid Server Name
    fi

    msg_info "Checking if server is running"
    if systemctl --user is-active --quiet "bedrock-${server_name}"; then
        stop_server "$server_name"
        if [[ $? -ne 0 ]]; then
            msg_error "Failed to stop server $server_name"
            echo "false" # Still return "false" on error
            return $(handle_error 10 "$action") # Failed to stop
        fi
        was_running=true
        
    else
        msg_info "Server '$server_name' is not currently running."
    fi
    echo "$was_running"
    return 0 # Success
}

# Start server
start_server() {
  local server_name="$1"
  local action="start server"

  if [[ -z "$server_name" ]]; then
    msg_error "start_server: server_name is empty."
    return $(handle_error 25 "$action")  # Invalid server name
  fi

  # Check if server us running
  if systemctl --user is-active --quiet "bedrock-${server_name}"; then
    msg_warn "Server '$server_name' is already running."
    return 0  # Already running, so not an error
  fi

  msg_info "Starting server '$server_name'..."
  if ! systemctl --user start "bedrock-${server_name}"; then
    msg_error "Failed to start server: '$server_name'."
    return $(handle_error 10 "$action")  # Failed to start/stop server
  fi

  msg_ok "Server '$server_name' started."
  return 0 # Success
}

# Stop server
stop_server() {
  local server_name="$1"
  local action="stop server"

  if [[ -z "$server_name" ]]; then
    msg_error "stop_server: server_name is empty."
    return $(handle_error 25 "$action")  # Invalid server name
  fi

  # Check if server is running
  if ! systemctl --user is-active --quiet "bedrock-${server_name}"; then
    msg_warn "Server '$server_name' is not running."
    return 0  # Not an error if it's already stopped
  fi

  msg_info "Stop server '$server_name'..."
  if ! systemctl --user stop "bedrock-${server_name}"; then
    msg_error "Failed to stop systemd service for server: '$server_name'."
    return $(handle_error 10 "$action")  # Failed to start/stop server
  fi

  msg_ok "Server '$server_name' stopped."
  return 0 # Success
}

# Restart server
restart_server() {
  local server_name="$1"
  local action="restart server"

  if [[ -z "$server_name" ]]; then
    msg_error "restart_server: server_name is empty."
    return $(handle_error 25 "$action")  # Invalid server name
  fi

  if ! systemctl --user is-active --quiet "bedrock-${server_name}"; then
    msg_warn "Server '$server_name' is not running. Starting it instead."
    start_server "$server_name"
    return $?  # Return the exit code of start_server
  fi

  msg_info "Restarting server '$server_name'..."

  # Send restart warning if the server is running
  send_command "$server_name" "say Restarting server in 10 seconds.."
  if [[ $? -ne 0 ]]; then
      msg_warn "Failed to send restart warning to server $server_name."
      # Not a fatal error, so continue
  fi

  if ! systemctl --user restart "bedrock-${server_name}"; then
    msg_error "Failed to restart server: '$server_name'."
    return $(handle_error 10 "$action")  # Failed to start/stop server
  fi

  msg_ok "Server '$server_name' restarted."
  return 0 # Success
}

# Main menu
main_menu() {
  trap 'return $(handle_error 255 "");' SIGINT
  clear
  while true; do
    echo
    echo -e "${MAGENTA}Bedrock Server Manager${RESET}"
    list_servers_status
    if [[ $? -ne 0 ]]; then
        msg_error "Failed to list server status."
    fi
    echo "1) Install New Server"
    echo "2) Manage Existing Server"
    echo "3) Install Content"
    echo "4) Send Command to Server"
    echo "5) Advanced"
    echo "6) Exit"
    read -p "Select an option [1-6]: " choice

    case $choice in
      1) # Install a new server
        install_new_server
        if [[ $? -ne 0 ]]; then
          msg_error "install_new_server failed."
           # Don't return, go back to the main menu
        fi
        ;;

      2) # Manage an existing server
        manage_server
        if [[ $? -ne 0 ]]; then
          msg_error "manage_server failed."
          # Don't return, go back to the main menu
        fi
        ;;

      3) # Install content to server
        install_content
        if [[ $? -ne 0 ]]; then
          msg_error "install_content failed."
          # Don't return, go back to the main menu
        fi
        ;;

      4) # Send a command
        if get_server_name; then
            read -p "Enter command: " command
            send_command "$server_name" "$command"
            if [[ $? -ne 0 ]]; then
                msg_error "Failed to send command."
                # Don't return, go back to the main menu
            fi
        else
            echo "Send command canceled."
        fi
        ;;

      5) # Advanced menu
        advanced_menu
        if [[ $? -ne 0 ]]; then
            msg_error "advanced_menu failed."
             # Don't return, go back to the main menu
        fi
        ;;

      6) # Exit
        clear
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
  clear
  while true; do
    echo
    echo -e "${MAGENTA}Bedrock Server Manager${RESET} - ${PINK}Manage Server${RESET}"
    list_servers_status
    if [[ $? -ne 0 ]]; then
        msg_error "Failed to list server status."
    fi
    echo "1) Update Server"
    echo "2) Start Server"
    echo "3) Stop Server"
    echo "4) Restart Server"
    echo "5) Backup/Restore"
    echo "6) Delete Server"
    echo "7) Back"
    read -p "Select an option [1-7]: " choice

    case $choice in

      1) # Update an existing server
        if get_server_name; then
            update_server "$server_name"
            if [[ $? -ne 0 ]]; then
                msg_error "Failed to update server."
                # Don't return, go back to the manage_server menu
            fi
        else
            echo "Update canceled."
        fi
        ;;

      2) # Start a server
        if get_server_name; then
            start_server "$server_name"
            if [[ $? -ne 0 ]]; then
              msg_error "Failed to start server."
              # Don't return, go back to the manage_server menu
            fi
        else
            echo "Start canceled."
        fi
        ;;

      3) # Stop a server
        if get_server_name; then
            stop_server "$server_name"
            if [[ $? -ne 0 ]]; then
              msg_error "Failed to stop server."
              # Don't return, go back to the manage_server menu
            fi
        else
            echo "Stop canceled."
        fi
        ;;

      4) # Restart a server
        if get_server_name; then
            restart_server "$server_name"
            if [[ $? -ne 0 ]]; then
                msg_error "Failed to restart server."
                # Don't return, go back to the manage_server menu
            fi
        else
            echo "Restart canceled."
        fi
        ;;

      5) # Backup a server
        backup_restore
        if [[ $? -ne 0 ]]; then
          msg_error "backup_restore failed."
          # Don't return, go back to the manage_server menu
        fi
        ;;

      6) # Delete a server
        if get_server_name; then
            delete_server "$server_name"
             if [[ $? -ne 0 ]]; then
              msg_error "Failed to delete server."
              # Don't return, go back to the manage_server menu
            fi
        else
            echo "Delete canceled."
        fi
        ;;

      7) # Back
        return 0
        ;;

      *)
        msg_warn "Invalid choice"
        ;;
    esac
  done
}

# Install content menu
install_content() {
  clear
  while true; do
    echo
    echo -e "${MAGENTA}Bedrock Server Manager${RESET} - ${PINK}Install Content${RESET}"
    list_servers_status
    if [[ $? -ne 0 ]]; then
        msg_error "Failed to list servers."
    fi
    echo "1) Import World"
    echo "2) Import Addon"
    echo "3) Back"
    read -p "Select an option [1-3]: " choice

    case $choice in

      1) # Install .mcworld to server
        if get_server_name; then
            install_worlds "$server_name"
            if [[ $? -ne 0 ]]; then
                msg_error "Failed to install world."
                 # Don't return, go back to the install_content menu
            fi
        else
            echo "Import canceled."
        fi
        ;;

      2) # Install .mcpack/.mcaddon to sever
        if get_server_name; then
            install_addons "$server_name"
            if [[ $? -ne 0 ]]; then
              msg_error "Failed to install addon."
              # Don't return, go back to the install_content menu
            fi
        else
            echo "Import canceled."
        fi
        ;;

      3) # Back
        return 0
        ;;

      *)
        msg_warn "Invalid choice"
        ;;
    esac
  done
}

# Advanced menu
advanced_menu() {
  clear
  while true; do
    echo
    echo -e "${MAGENTA}Bedrock Server Manager${RESET} - ${PINK}Advanced Menu${RESET}"
    list_servers_status
    if [[ $? -ne 0 ]]; then
      msg_error "Failed to list servers."
    fi
    echo "1) Configure Server Properties"
    echo "2) Configure Allowlist"
    echo "3) Configure Permissions"
    echo "4) Attach to Server Console"
    echo "5) Schedule Server Task"
    echo "6) View Server Resource Usage"
    echo "7) Reconfigure Systemd Service"
    echo "8) Back"
    read -p "Select an option [1-8]: " choice

    case $choice in

      1) # Edit server properties
        if get_server_name; then
            configure_server_properties "$server_name"
            if [[ $? -ne 0 ]]; then
              msg_error "Failed to configure server properties."
               # Don't return, go back to the advanced_menu
            fi
        else
            echo "Configuration canceled."
        fi
        ;;

      2) # Configure server allowlist
        if get_server_name; then
            configure_allowlist "$server_name"
            if [[ $? -ne 0 ]]; then
                msg_error "Failed to configure allowlist."
                # Don't return, go back to the advanced_menu
            fi
        else
            echo "Configuration canceled."
        fi
        ;;

      3) # Configure server permission
        if get_server_name; then
            select_player_for_permission "$server_name"
            if [[ $? -ne 0 ]]; then
              msg_error "Failed to configure permissions."
              # Don't return, go back to the advanced_menu
            fi
        else
            echo "Configuration canceled."
        fi
        ;;

      4) # Attach to server console
        if get_server_name; then
            attach_console "$server_name"
            if [[ $? -ne 0 ]]; then
              msg_error "Failed to attach to console."
               # Don't return, go back to the advanced_menu
            fi
        else
            echo "Attach canceled."
        fi
        ;;

      5) # Schedule task for server
        if get_server_name; then
            cron_scheduler "$server_name"
            if [[ $? -ne 0 ]]; then
                msg_error "Failed to schedule task."
                 # Don't return, go back to the advanced_menu
            fi
        else
            echo "Schedule canceled."
        fi
        ;;

      6) # View resource usage for server
        if get_server_name; then
            monitor_service_usage "$server_name"
            if [[ $? -ne 0 ]]; then
                msg_error "Failed to monitor server usage."
                # Don't return, go back to the advanced_menu
            fi
        else
            echo "Monitoring canceled."
        fi
        ;;

      7) # Reconfigure server systemd file
        if get_server_name; then
            create_systemd_service "$server_name"
            if [[ $? -ne 0 ]]; then
              msg_error "Failed to reconfigure systemd service."
               # Don't return, go back to the advanced_menu
            fi
        else
            echo "Configuration canceled."
        fi
        ;;

      8) # Back
        return 0
        ;;

      *)
        msg_warn "Invalid choice"
        ;;
    esac
  done
}

# Backup/restore menu
backup_restore() {
  clear
  while true; do
    echo
    echo -e "${MAGENTA}Bedrock Server Manager${RESET} - ${PINK}Backup/Restore${RESET}"
    list_servers_status
    if [[ $? -ne 0 ]]; then
        msg_error "Failed to list servers."
    fi
    echo "1) Backup Server"
    echo "2) Restore Server"
    echo "3) Back"
    read -p "Select an option [1-3]: " choice

    case $choice in

      1) # Backup a server
        if get_server_name; then
            backup_menu "$server_name"
            if [[ $? -ne 0 ]]; then
              msg_error "Backup menu failed."
              # Don't return, go back to the backup_restore menu
            fi
        else
            echo "Backup canceled."
        fi
        ;;

      2) # Delete a server
        if get_server_name; then
            restore_menu "$server_name"
            if [[ $? -ne 0 ]]; then
              msg_error "Restore menu failed."
              # Don't return, go back to the backup_restore menu
            fi
        else
            echo "Restore canceled."
        fi
        ;;

      3) # Back
        return 0
        ;;

      *)
        msg_warn "Invalid choice"
        ;;
    esac
  done
}

# Display the backup menu. This is the entry point for the backup process.
backup_menu() {
  local server_name="$1"

  if [[ -z "$server_name" ]]; then
        msg_error "backup_menu: server_name is empty."
        return 25  # Invalid server name
  fi
    local server_dir="$BASE_DIR/$server_name" #needed for the options

  echo -e "${PINK}What do you want to backup${RESET}:"
  PS3="Select the type of backup: "
  select option in "Backup World" "Backup Configuration File" "Backup All" "Cancel"; do
    case "$option" in
      "Backup World")
        backup_server "$server_name" "world"
        if [[ $? -ne 0 ]]; then
          msg_error "Failed to backup world."
           # Don't return, go back to the backup_menu
        fi
        break
        ;;
      "Backup Configuration File")
        echo -e "${PINK}Select configuration file to backup${RESET}:"
        PS3="Choose file: "
        select cfg in "allowlist.json" "permissions.json" "server.properties" "Cancel"; do
          case "$cfg" in
            "allowlist.json")
              backup_server "$server_name" "config" "allowlist.json"
                if [[ $? -ne 0 ]]; then
                  msg_error "Failed to backup allowlist.json."
                  # Don't return, go back to the backup_menu
                fi
              break 2
              ;;
            "permissions.json")
              backup_server "$server_name" "config" "permissions.json"
                if [[ $? -ne 0 ]]; then
                    msg_error "Failed to backup permissions.json."
                    # Don't return, go back to the backup_menu
                fi
              break 2
              ;;
            "server.properties")
              backup_server "$server_name" "config" "server.properties"
                if [[ $? -ne 0 ]]; then
                  msg_error "Failed to backup server.properties."
                  # Don't return, go back to the backup_menu
                fi
              break 2
              ;;
            "Cancel")
              msg_info "Backup operation canceled."
              return 0  # User canceled, not an error
              ;;
            *)
              msg_warn "Invalid selection, please try again."
              ;;
          esac
        done
        break
        ;;
      "Backup All")
        backup_all "$server_name"
        if [[ $? -ne 0 ]]; then
          msg_error "Failed to backup all."
          # Don't return, go back to the backup_menu
        fi
        break
        ;;
      "Cancel")
        msg_info "Backup operation canceled."
        return 0
        ;;
      *)
        msg_warn "Invalid selection, please try again."
        ;;
    esac
  done
    return 0
}

# Restore Menu
restore_menu() {
  local server_name="$1"
  local backup_dir="$SCRIPTDIR/backups/$server_name"

  if [[ -z "$server_name" ]]; then
    msg_error "restore_menu: server_name is empty."
    return 25  # Invalid server name
  fi

  if [[ ! -d "$backup_dir" ]]; then
    msg_error "No backups found for '$server_name'."
    return 0  # Not an error; nothing to restore.
  fi

  # Ask the user what they want to restore
  echo -e "${PINK}Select the type of backup to restore${RESET}:"
  PS3="What do you want to restore: "
  local restore_type="" #Initialize restore type.
  select option in "World" "Configuration File" "Restore All" "Cancel"; do
    case "$option" in
      "World")
        restore_type="world"
        break
        ;;
      "Configuration File")
        restore_type="config"
        break
        ;;
      "Restore All")
        restore_all "$server_name"
         if [[ $? -ne 0 ]]; then
            msg_error "Failed to restore all for $server_name"
             # Don't return, go back to the restore_menu
         fi
        return 0 # Return after restore_all, regardless of success
        ;;
      "Cancel")
        msg_info "Restore operation canceled."
        return 0  # User canceled, not an error
        ;;
      *)
        msg_warn "Invalid selection. Please choose again."
        ;;
    esac
  done

  # Gather list of available backups
  declare -A backup_map
  local index=1

  if [[ "$restore_type" == "world" ]]; then
    PS3="Choose a world: "
    for file in "$backup_dir"/*.mcworld; do
      [[ -f "$file" ]] || continue
      backup_map["$index"]="$file"
      echo "$index) $(basename "$file")"
      ((index++))
    done
  elif [[ "$restore_type" == "config" ]]; then
        PS3="Choose a file: "
    for file in "$backup_dir"/*_backup_*.json "$backup_dir"/*_backup_*.properties; do
      [[ -f "$file" ]] || continue
      backup_map["$index"]="$file"
      echo "$index) $(basename "$file")"
      ((index++))
    done
  else
      # This case is not possible due to the select menu
      # But is maintained as a good defensive measure
      msg_error "Invalid restore type selected."
      return 1 # General Error
  fi

  if [[ ${#backup_map[@]} -eq 0 ]]; then
    msg_error "No backups available for the selected type."
    return 0 # Not an error; nothing to restore.
  fi

  # Prompt user for selection
  local choice
  while true; do
    read -p "What do you want to restore (or '0' to cancel): " choice
    if [[ "$choice" == "0" ]]; then
      msg_info "Restore operation canceled."
      return 0 # User canceled, not an error
    elif [[ -n "${backup_map[$choice]}" ]]; then
      restore_server "$server_name" "${backup_map[$choice]}" "$restore_type"
       if [[ $? -ne 0 ]]; then
        msg_error "Failed to restore from backup."
         # Don't return, go back to the restore_menu
      fi
      break # Exit after successful restore.
    else
      msg_warn "Invalid selection. Please choose again."
    fi
  done
  return 0
}

# Parse and execute commands passed via the command line
msg_debug "Arguments received: $@"

# Script commands
case "$1" in

  main)
    # Open the main menu
    echo "Opening main menu..."
    main_menu
    exit $?  # Exit with the exit code of main_menu
    ;;

  list-servers)
    # Open the main menu
    if [[ "$2" == "--loop" && "$3" == "true" ]]; then
      while true; do
        clear
        list_servers_status
        sleep 5
      done
    else
      clear
      list_servers_status
    fi
    exit $?
    ;;

  scan-players)
    # Open the main menu
    scan_player_data
    exit $?  # Exit with the exit code of scan_player_data
    ;;

  add-players)
    shift  # Remove the first argument (add-player)
    players_input=() # Initialize as an array
    while [[ $# -gt 0 ]]; do
      case $1 in
        --players)
          players_input=("$2")
          shift 2
          ;;
        *)
          msg_error "Unknown option: $1"
          echo "Usage: $0 add-player --players <player1:xuid player2:xuid ...>"
          exit 1
          ;;
      esac
    done

    # Validate inputs
    if [[ ${#players_input[@]} -eq 0 ]]; then  # Check if the array is empty
      msg_error "Missing required argument: --players"
      echo "Usage: $0 add-player --players '<player1:xuid> <player2:xuid> ...'"
      exit 1
    fi
     # Process each player:xuid pair
    for player_data in "${players_input[@]}"; do
    # Split by colon
        IFS=':' read -r player_name xuid <<< "$player_data"

        if [[ -z "$player_name" || -z "$xuid" ]]; then
          msg_error "Invalid player:xuid format: $player_data"
          exit 5  # Invalid input
        fi

        # Call the save function to add the player to the JSON
        save_players_to_json "$player_name:$xuid"
        if [[ $? -ne 0 ]]; then
            msg_error "Failed to save player data for $player_name."
            exit 1 # Exit if save fails
        fi
    done

    echo "Players added successfully."
    exit 0
    ;;

  send-command)
    shift # Remove the first argument (send-command)
    server_name=""  # Initialize
    command=""      # Initialize

    while [[ $# -gt 0 ]]; do
      case "$1" in
        --server)
          server_name="$2"
          shift 2
          ;;
        --command)
          shift # Consume --command itself.
          command="" # Initialize the command part
          while [[ $# -gt 0 ]]; do
            if ! [[ "$1" =~ ^-- ]]; then # Regular expression test first
              command+="$1 "
              shift
            else
              break # Exit the inner loop if an option is found
            fi
          done
          command=${command% } # Remove the last space
          ;;
        *)
          msg_error "Unknown option: $1"
          echo "Usage: $0 send-command --server <server_name> --command <command>"
          exit 1
          ;;
      esac
    done

    # Validate inputs
    if [[ -z "$server_name" || -z "$command" ]]; then
      msg_error "Missing required arguments: --server or --command"
      echo "Usage: $0 send-command --server <server_name> --command '<command>'"
      exit 1
    fi

    send_command "$server_name" "$command"
    exit $?  # Exit with the exit code of send_command
    ;;

  update-server)
    shift # Remove the first argument (update-server)
    server_name="" #initialize
    while [[ $# -gt 0 ]]; do
      case $1 in
        --server)
          server_name="$2"
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
    if [[ -z "$server_name" ]]; then
      msg_error "Missing required argument: --server"
      echo "Usage: $0 update-server --server <server_name>"
      exit 1
    fi

    update_server "$server_name"
    exit $? # Exit with exit code from update_server
    ;;

  backup-server)
    shift # Remove the first argument (backup-server)
    server_name="" #initialize
    while [[ $# -gt 0 ]]; do
      case $1 in
        --server)
          server_name="$2"
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
    if [[ -z "$server_name" ]]; then
      msg_error "Missing required argument: --server"
      echo "Usage: $0 backup-server --server <server_name>"
      exit 1
    fi

    backup_all "$server_name"
    exit $?
    ;;

  start-server)
    shift # Remove the first argument (start-server)
   server_name=""
    while [[ $# -gt 0 ]]; do
      case $1 in
        --server)
          server_name="$2"
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
    if [[ -z "$server_name" ]]; then
      msg_error "Missing required argument: --server"
      echo "Usage: $0 start-server --server <server_name>"
      exit 1
    fi

    start_server "$server_name"
    exit $? # Return exit code from start_server
    ;;

  stop-server)
    shift # Remove the first argument (stop-server)
    server_name=""
    while [[ $# -gt 0 ]]; do
      case $1 in
        --server)
          server_name="$2"
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
    if [[ -z "$server_name" ]]; then
      msg_error "Missing required argument: --server"
      echo "Usage: $0 stop-server --server <server_name>"
      exit 1
    fi

    stop_server "$server_name"
    exit $?
    ;;

  restart-server)
    shift # Remove the first argument (restart-server)
    server_name=""
    while [[ $# -gt 0 ]]; do
      case $1 in
        --server)
          server_name="$2"
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
    if [[ -z "$server_name" ]]; then
      msg_error "Missing required argument: --server"
      echo "Usage: $0 stop-server --server <server_name>"
      exit 1
    fi

    restart_server "$server_name"
    exit $?
    ;;

  enable-server)
    shift # Remove the first argument (enable-server)
    server_name=""
    while [[ $# -gt 0 ]]; do
      case $1 in
        --server)
          server_name="$2"
          shift 2
          ;;
        *)
          msg_error "Unknown option: $1"
          echo "Usage: $0 enable-server --server <server_name>"
          exit 1
          ;;
      esac
    done

    # Validate input
    if [[ -z "$server_name" ]]; then
      msg_error "Missing required argument: --server"
      echo "Usage: $0 enable-server --server <server_name>"
      exit 1
    fi

    enable_service "$server_name"
    exit $?
    ;;

  disable-server)
    shift # Remove the first argument (disable-server)
    server_name=""
    while [[ $# -gt 0 ]]; do
      case $1 in
        --server)
          server_name="$2"
          shift 2
          ;;
        *)
          msg_error "Unknown option: $1"
          echo "Usage: $0 disable-server --server <server_name>"
          exit 1
          ;;
      esac
    done

    # Validate input
    if [[ -z "$server_name" ]]; then
      msg_error "Missing required argument: --server"
      echo "Usage: $0 disable-server --server <server_name>"
      exit 1
    fi

    disable_service "$server_name"
    exit $?
    ;;

  update-script)
    # Update the script
    update_script
    exit $?
    ;;

  systemd-start)
    shift # Remove the first argument (stop-server)
    server_name=""
    while [[ $# -gt 0 ]]; do
      case $1 in
        --server)
          server_name="$2"
          shift 2
          ;;
        *)
          msg_error "Unknown option: $1"
          echo "Usage: $0 systemd-start --server <server_name>"
          exit 1
          ;;
      esac
    done

    # Validate inputs
    if [[ -z "$server_name" ]]; then
      msg_error "Missing required argument: --server"
      echo "Usage: $0 systemd-start --server <server_name>"
      exit 1
    fi

    systemd_start_server "$server_name"
    exit $?
    ;;

  systemd-stop)
    shift # Remove the first argument (stop-server)
    server_name=""
    while [[ $# -gt 0 ]]; do
      case $1 in
        --server)
          server_name="$2"
          shift 2
          ;;
        *)
          msg_error "Unknown option: $1"
          echo "Usage: $0 systemd-stop --server <server_name>"
          exit 1
          ;;
      esac
    done

    # Validate inputs
    if [[ -z "$server_name" ]]; then
      msg_error "Missing required argument: --server"
      echo "Usage: $0 systemd-stop --server <server_name>"
      exit 1
    fi

    systemd_stop_server "$server_name"
    exit $?
    ;;

  help | *)
    # Print usage for all available commands automatically if no valid command or help argument is passed
    echo "Usage: $0 <command> [options]"
    echo
    echo "Available commands:"
    echo
    echo "  main           -- Open the main menu"
    echo
    echo "  scan-players   -- Scan server_output.txt for players+xuid and add them to ./config/players.json"
    echo
    echo "  list-servers   -- List all servers and their status"
    echo "    --loop true               Loops list-server till exit"
    echo
    echo "  add-players    -- Manually add player:xuid to ./config/players.json"
    echo "    --players '<player1:xuid> <player2:xuid>...'  The player names and xuids to be added (must be in 'quotations')"
    echo
    echo "  send-command   -- Send a command to a running server"
    echo "    --server <server_name>    Specify the server name"
    echo "    --command '<command>'     The command to send to the server (must be in 'quotations')"
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
    echo "  enable-server  -- Enable server autostart"
    echo "    --server <server_name>    Specify the server name"
    echo
    echo "  disable-server -- Disable server autostart"
    echo "    --server <server_name>    Specify the server name"
    echo
    echo "  update-script  -- Redownload script from github"
    echo
    echo "Version: $SCRIPTVERSION"
    echo "Credits: ZVortex11325"
    exit 1
    ;;
esac