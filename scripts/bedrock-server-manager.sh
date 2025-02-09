#!/bin/bash
# Bedrock Server Manager
# Bedrock Server Manager is a bash script used to easily install/manage bedorck dedcated servers from the command line
# COPYRIGHT ZVORTEX11325 2025
# You may download and use this content for personal, non-commercial use. Any other use, including reproduction, or redistribution is prohibited without prior written permission.
# Author: ZVortex11325
# Version 1.3.0

set -eo pipefail

# Default configuration
SCRIPTVERSION=$(grep -m 1 "^# Version" "$0" | sed -E 's/^# Version[[:space:]]+([0-9]+\.[0-9]+\.[0-9]+).*/\1/') # Get script version from top line
SCRIPTDIR=$(dirname "$(realpath "$0")") # Current full path the script is in
SCRIPTDIRECT=$SCRIPTDIR/bedrock-server-manager.sh

: "${BASE_DIR:="$SCRIPTDIR/servers"}" # Default folder for servers
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

# Define color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[0;37m'
GOLD='\033[0;33m'
DARK_GREEN='\033[0;32m'
LIGHT_BLUE='\033[0;36m'
PINK='\033[0;95m'
LIGHT_PINK='\033[0;35m'
GRAY='\033[0;90m'
RESET='\033[0m'

# Helper functions for colorful messages
msg_info() { echo -e "${CYAN}[INFO]${RESET} $1"; }
msg_ok() { echo -e "${GREEN}[OK]${RESET} $1"; }
msg_warn() { echo -e "${YELLOW}[WARN]${RESET} $1"; }
msg_error() { echo -e "${RED}[ERROR]${RESET} $1"; }

# Dependencies Check
setup_prerequisites() {
  # List of required packages
  local packages=("curl" "jq" "unzip" "systemd" "screen" "zip")

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
      msg_warn "Invalid input. Please answer 'yes' or 'no'."
    fi
  done
}

setup_prerequisites

# Make folders if they don't exist
mkdir -p $BASE_DIR
mkdir -p $SCRIPTDIR/content/worlds
mkdir -p $SCRIPTDIR/content/addons

# Function to download the updated script and restart it
update_script() {

  msg_info "Redownloading script..."

  local script_url="https://raw.githubusercontent.com/DMedina559/minecraft/main/scripts/bedrock-server-manager.sh"

  wget -q -O "$SCRIPTDIR/bedrock-server-manager.sh" "$script_url"

  msg_ok "Done."
}

# Validate server exist
get_server_name() {
    while true; do
        read -p "Enter server name (or type 'exit' to cancel): " server_name

        if [[ "$server_name" == "exit" ]]; then
            msg_ok "Operation canceled."
            return 1
        fi

        # Define the expected server directory path
        server_dir="$BASE_DIR/$server_name"

        # Check if the server directory exists and contains bedrock_server
        if [[ ! -f "$server_dir/bedrock_server" ]]; then
            msg_warn "'bedrock_server' not found in $server_dir."
            echo "Please enter a valid server name or type 'exit' to cancel."
        else
            msg_ok "Server '$server_name' found."
            return 0
        fi
    done
}

# Get the world name from server.properties
get_world_name() {
  local server_properties="$1"
  grep -E '^level-name=' "$server_properties" | cut -d'=' -f2
}

# Function to view current cron jobs and present options for next actions
cron_scheduler() {
    clear
    local server_name=$1
    echo -e "${MAGENTA}Bedrock Server Manager${RESET} - ${PINK}Cron Scheduler${RESET}"
    echo -e "You can schedule various server task."
    echo -e "Current scheduled cron jobs for ${YELLOW}${server_name}${RESET}:"

    # Try to get the cron jobs
    cron_jobs=$(echo "$(crontab -l 2>&1)")

    cron_jobs=$(echo "$cron_jobs" | sed -n "/--server $server_name/p")

    if [ -z "$cron_jobs" ] || [ "$cron_jobs" = "" ]; then
      cron_jobs="undefined"
    fi

    # Check if there was "no crontab for user" or empty output
    if [ -z "$cron_jobs" ] || [ "$cron_jobs" = "" ] || [[ "$cron_jobs" == *"no crontab for"* ]] || [[ "$cron_jobs" == undefined ]]; then
        echo -e "${YELLOW}No scheduled cron jobs found.${RESET}"
    else
      
        # Loop through cron jobs and display them in readable format
        echo "$cron_jobs" | while IFS= read -r cron_job; do

            # Use awk to split the line, but handle the command separately
            minute=$(echo "$cron_job" | awk '{print $1}')
            hour=$(echo "$cron_job" | awk '{print $2}')
            day=$(echo "$cron_job" | awk '{print $3}')
            month=$(echo "$cron_job" | awk '{print $4}')
            weekday=$(echo "$cron_job" | awk '{print $5}')
            command=$(echo "$cron_job" | cut -d' ' -f6-) # Get everything from the 6th field onwards

            # Convert to readable format
            convert_to_readable_schedule "$month" "$day" "$hour" "$minute" "$weekday"
            echo -e "${GREEN}Cron job${RESET}: ${YELLOW}${cron_job}${RESET}"
            echo -e "${GREEN}Readable schedule${RESET}: ${YELLOW}${schedule_time}${RESET}"
            echo -e "${GREEN}Command${RESET}: ${YELLOW}${command}${RESET}"
            echo ""
        done
        
    fi

    # Ask user what to do next
    while true; do
        echo "What would you like to do next?"
        echo "1) Add Job"
        echo "2) Modify Job"
        echo "3) Delete Job"
        echo "4) Back"
        read -p "Enter the number (1-4): " choice
        case $choice in
            1) add_cron_job "$server_name" ;;
            2) modify_cron_job "$server_name" ;;
            3) delete_cron_job "$server_name" ;;
            4) return 0 ;;
            *) msg_warn "Invalid choice. Please try again." ;;
        esac
    done
}

# Function to add a new cron job
add_cron_job() {
    local server_name=$1
    local command=""

    # Prompt user for cron job details
    echo "Choose the command for '$server_name':"
    echo "1) Update Server"
    echo "2) Backup Server"
    echo "3) Start Server"
    echo "4) Stop Server"
    echo "5) Restart Server"
    while true; do
        read -p "Enter the number (1-5): " choice

        case $choice in
            1) command="$SCRIPTDIRECT update-server --server $server_name" ; break ;;
            2) command="$SCRIPTDIRECT backup-server --server $server_name" ; break ;;
            3) command="$SCRIPTDIRECT start-server --server $server_name" ; break ;;
            4) command="$SCRIPTDIRECT stop-server --server $server_name" ; break ;;
            5) command="$SCRIPTDIRECT restart-server --server $server_name" ; break ;;
            *) msg_warn "Invalid choice, please try again." ;;
        esac
    done

    # Get cron timing details with validation
    while true; do
        read -p "Month (1-12 or *): " month
        validate_cron_input "$month" 1 12 || continue
        read -p "Day of Month (1-31 or *): " day
        read -p "Hour (0-23): " hour
        validate_cron_input "$hour" 0 23 || continue
        read -p "Minute (0-59): " minute
        validate_cron_input "$minute" 0 59 || continue
        read -p "Day of Week (0-7, 0 or 7 for Sunday or *): " weekday
        validate_cron_input "$weekday" 0 7 || continue
        break
    done

    # Convert to readable format
    convert_to_readable_schedule "$month" "$day" "$hour" "$minute" "$weekday"
    echo "Your cron job will run with the following schedule:"
    echo -e "${GREEN}Cron format${RESET}: ${YELLOW}${minute} ${hour} ${day} ${month} ${weekday}${RESET}"
    echo -e "${GREEN}Readable format${RESET}: ${YELLOW}${schedule_time}${RESET}"
    echo -e "${GREEN}Command${RESET}: ${YELLOW}${command}${RESET}"
    echo

    while true; do
        read -p "Do you want to add this job? (y/n): " confirm
        confirm="${confirm,,}"  # Convert to lowercase
        case "$confirm" in
            yes|y)
                # Improved cron command handling:
                if crontab -l 2>/dev/null | grep -q . ; then # Check if crontab exists
                  (crontab -l; echo "$minute $hour $day $month $weekday $command") | crontab -
                else
                  echo "$minute $hour $day $month $weekday $command" | crontab - # Add to empty crontab
                fi

                msg_ok "Cron job added successfully!"
                break
                ;;
            no|n|"")
                msg_info "Cron job not added."
                break
                ;;
            *)
                msg_warn "Invalid input. Please answer 'yes' or 'no'."
                ;;
        esac
    done
}

# Function to modify an existing cron job
modify_cron_job() {
    local server_name=$1

    echo "Current scheduled cron jobs for '$server_name':"

    cron_jobs_array=()
    index=1

    while IFS= read -r line; do
        if [[ "$line" == *"--server $server_name"* ]]; then
            cron_jobs_array+=("$line")
            echo "$index) $line"
            ((index++))
        fi
    done < <(crontab -l 2>/dev/null)

    if [[ ${#cron_jobs_array[@]} -eq 0 ]]; then
        echo "No scheduled cron jobs found to modify."
        return
    fi

    # Get user input to select the job to modify
    read -p "Enter the number of the job you want to modify: " job_number

    if ! [[ "$job_number" =~ ^[0-9]+$ ]] || (( job_number < 1 || job_number > ${#cron_jobs_array[@]} )); then
        msg_warn "Invalid selection. No matching cron job found."
        return
    fi

    job_to_modify="${cron_jobs_array[$((job_number - 1))]}"

    # Extract the command part of the cron job (everything after the time fields)
    job_command=$(echo "$job_to_modify" | awk '{for (i=6; i<=NF; i++) printf $i " "; print ""}')

    # Get new cron timing details with validation
    echo "Modify the timing details for this cron job:"
    while true; do
        read -p "Month (1-12 or *): " month
        validate_cron_input "$month" 1 12 || continue
        read -p "Day of Month (1-31 or *): " day
        validate_cron_input "$day" 1 31 || continue
        read -p "Hour (0-23): " hour
        validate_cron_input "$hour" 0 23 || continue
        read -p "Minute (0-59): " minute
        validate_cron_input "$minute" 0 59 || continue
        read -p "Day of Week (0-7, 0 or 7 for Sunday or *): " weekday
        validate_cron_input "$weekday" 0 7 || continue
        break
    done

    # Convert to readable format
    convert_to_readable_schedule "$month" "$day" "$hour" "$minute" "$weekday"
    echo "Your modified cron job will run with the following schedule:"
    echo "Cron format: $minute $hour $day $month $weekday"
    echo "Readable format: $schedule_time"
    echo "Command: $job_command"
    echo

    # Confirm before modifying cron job
    while true; do
        read -p "Do you want to modify this job? (y/n): " confirm
        confirm="${confirm,,}"  # Convert to lowercase
        case "$confirm" in
            yes|y)
                temp_cron=$(mktemp)
                crontab -l 2>/dev/null | awk -v job="$job_to_modify" '$0 != job' > "$temp_cron"
                echo "$minute $hour $day $month $weekday $job_command" >> "$temp_cron"
                crontab "$temp_cron"
                rm "$temp_cron"
                msg_ok "Cron job modified successfully!"
                break
                ;;
            no|n|"")
                msg_info "Cron job not modified."
                break
                ;;
            *)
                msg_warn "Invalid input. Please answer 'yes' or 'no'."
                ;;
        esac
    done
}

# Function to delete an existing cron job
delete_cron_job() {
    local server_name=$1

    echo "Current scheduled cron jobs for '$server_name':"

    cron_jobs_array=()
    index=1

    while IFS= read -r line; do
        if [[ "$line" == *"--server $server_name"* ]]; then
            cron_jobs_array+=("$line")
            echo "$index) $line"
            ((index++))
        fi
    done < <(crontab -l 2>/dev/null)

    if [[ ${#cron_jobs_array[@]} -eq 0 ]]; then
        echo "No scheduled cron jobs found to delete."
        return
    fi

    read -p "Enter the number of the job you want to delete: " job_number

    if ! [[ "$job_number" =~ ^[0-9]+$ ]] || (( job_number < 1 || job_number > ${#cron_jobs_array[@]} )); then
        msg_warn "Invalid selection. No matching cron job found."
        return
    fi

    job_to_delete="${cron_jobs_array[$((job_number - 1))]}"

    # Confirm before deleting cron job
    while true; do
        read -p "Are you sure you want to delete this cron job? (y/n): " confirm_delete
        confirm_delete="${confirm_delete,,}"  # Convert to lowercase
        case "$confirm_delete" in
            yes|y)
                temp_cron=$(mktemp)
                crontab -l 2>/dev/null | awk -v job="$job_to_delete" '$0 != job' > "$temp_cron"
                crontab "$temp_cron"
                rm "$temp_cron"
                msg_ok "Cron job deleted successfully!"
                break
                ;;
            no|n|"")
                msg_info "Cron job not deleted."
                break
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

    if [[ "$value" == "*" ]] || ([[ "$value" =~ ^[0-9]+$ ]] && [ "$value" -ge "$min" ] && [ "$value" -le "$max" ]); then
        return 0
    else
        msg_warn "Invalid input. Please enter a value between $min and $max, or '*' for any."
        return 1
    fi
}

# Function to convert cron format to readable schedule
convert_to_readable_schedule() {
    local month=$1
    local day=$2
    local hour=$3
    local minute=$4
    local weekday=$5

    if [ "$day" == "*" ] && [ "$weekday" == "*" ]; then
        schedule_time="Daily at $hour:$minute"
    elif [ "$day" != "*" ] && [ "$weekday" == "*" ] && [ "$month" == "*" ]; then
        schedule_time="Monthly on day $day at $hour:$minute"
    elif [ "$day" == "*" ] && [ "$weekday" != "*" ]; then
        week_days=("Sunday" "Monday" "Tuesday" "Wednesday" "Thursday" "Friday" "Saturday" "Sunday")
        schedule_time="Weekly on ${week_days[$weekday]} at $hour:$minute"
    else
        schedule_time="Next run at $(date -d "$month/$day $hour:$minute" +"%m/%d/%Y %H:%M")"
    fi
}

# Function to install a new server
install_new_server() {
    while true; do
        read -p "Enter server folder name: " server_name

        # Check if server_name contains only alphanumeric characters, hyphens, and underscores
        if [[ "$server_name" =~ ^[[:alnum:]_-]+$ ]]; then
            break  # Exit the loop if the name is valid
        else
            msg_warn "Invalid server folder name. Only alphanumeric characters, hyphens, and underscores are allowed."
        fi
    done

    read -p "Enter server version (e.g., LATEST or PREVIEW): " version

    # Use default directory
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
        read -p "Configure allow-list? (y/n): " allowlist_response
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
        read -p "Do you want to start the server '$server_name' now? (y/n): " start_choice
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
}

# Updates a server
update_server() {
  local server_name="$1"
  local server_dir="$BASE_DIR/$server_name"

  msg_info "Starting update process for server: $server_name"

  if systemctl --user is-active --quiet "bedrock-${server_name}"; then
    send_command $server_name "say Checking for server updates.."
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
  actual_version=$(download_bedrock_server "$server_dir" "$target_version" "$server_name" true "$installed_version")

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

    msg_info "Checking internet connectivity"
    # Internet connection test
    if ! ping -c 1 -W 2 example.com >/dev/null 2>&1; then
      msg_warn "Connectivity test failed. Can't download server."
      return 0
    fi

    msg_info "Downloading Bedrock server version: $version"

    # Ensure the server directory exists
    mkdir -p "$server_dir"
    mkdir -p "$SCRIPTDIR/.downloads"

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

    if [[ "$in_update" == true ]]; then
        if [[ "${installed_version}" == "${actual_version%.}" ]]; then  
          msg_ok "Server '$server_name' is already running the latest version ($installed_version). No update needed."
          return 0
        fi
    fi

    # Remove old downloads before downloading a new one
    msg_info "Cleaning up old Bedrock server downloads..."

    download_files=("$SCRIPTDIR/.downloads/bedrock_server_"*.zip)

    # Check if any files exist before attempting deletion
    if [[ -e "${download_files[0]}" ]]; then
        ls -t "${download_files[@]}" 2>/dev/null | tail -n +3 | xargs -r rm -f
        msg_ok "Old server downloads deleted."
    else
        msg_info "No old server downloads found."
    fi

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
    local zip_file="$SCRIPTDIR/.downloads/bedrock_server_${actual_version%.}.zip"
    if ! curl -fsSL -o "$zip_file" -A "zvortex11325/bedrock-server-manager" "$download_url"; then
        msg_error "Failed to download Bedrock server from $download_url"
        return 1
    fi
    msg_info "Downloaded Bedrock server ZIP to: $zip_file"

    # Check if server is running
    if [[ "$in_update" == true ]]; then
        msg_info "Checking if server is running"
        if systemctl --user is-active --quiet "bedrock-${server_name}"; then
          send_command $server_name "say Updating server..."
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
        backup_server "$server_name" true

        msg_info "Extracting the server files, excluding critical files..."
        if ! unzip -o "$zip_file" -d "$server_dir" -x "worlds/*" "allowlist.json" "permissions.json" "server.properties" > /dev/null 2>&1; then
            msg_error "Failed to extract server files during update."
            return 1
        fi

        msg_info "Restoring critical files from backup..."
        local backup_dir="$SCRIPTDIR/backups/$server_name/"
        cp "$backup_dir/allowlist.json" "$server_dir/allowlist.json" 2>/dev/null
        cp "$backup_dir/permissions.json" "$server_dir/permissions.json" 2>/dev/null
        cp "$backup_dir/server.properties" "$server_dir/server.properties" 2>/dev/null

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
    chmod -R u+w "$server_dir"

    msg_ok "Installed Bedrock server version: ${actual_version%.}"

  # Start the server after the update (if it was running)
  if [[ "$was_running" == true ]]; then
    start_server $server_name
  else
    msg_info "Skip starting server '$server_name'."
  fi
    return 0
}

# Gets the installed version of a server
get_installed_version() {
  local server_dir="$1"
  local log_file="$server_dir/server_output.txt"

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

enable_user_lingering() {
  # Check if lingering is already enabled
  if loginctl show-user $(whoami) -p Linger | grep -q "Linger=yes"; then
    msg_info "Lingering is already enabled for $(whoami)"
    return 0
  fi

  while true; do
    read -r -p "Do you want to enable lingering for user $(whoami)? This is required for servers to start after logout. (y/n): " response
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
  local service_file="$HOME/.config/systemd/user/bedrock-${server_name}.service"

  # Ensure the user's systemd directory exists
  mkdir -p "$HOME/.config/systemd/user"

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
        autoupdate="ExecStartPre=/bin/bash -c \"./bedrock-server-manager.sh update-server --server $server_name\""
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
ExecStart=/bin/bash -c "truncate -s 0 ./servers/$server_name/server_output.txt && /usr/bin/screen -dmS bedrock-${server_name} -L -Logfile ./servers/$server_name/server_output.txt bash -c 'cd ./servers/$server_name && ./bedrock_server'"
ExecStop=/usr/bin/screen -S bedrock-${server_name} -X quit
ExecReload=/bin/bash -c "truncate -s 0 ./servers/$server_name/server_output.txt && /usr/bin/screen -S bedrock-${server_name} -X quit && /usr/bin/screen -dmS bedrock-${server_name} -L -Logfile ./servers/$server_name/server_output.txt bash -c 'cd ./servers/$server_name && ./bedrock_server'"
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
  
  # Ask user if they want to enable the service to start on boot
  while true; do
    read -r -p "Do you want to autostart the server $server_name? (y/n): " response
    response="${response,,}" # Convert to lowercase
    case "$response" in
      yes|y)
        msg_info "Enabling systemd service for $server_name"
        enable_service $server_name
        break
        ;;
      no|n|"")
        msg_info "Disabling systemd service for $server_name"
        disable_service $server_name
        break
        ;;
      *)
        msg_warn "Invalid input. Please answer 'yes' or 'no'."
        ;;
    esac
  done

  # Run linger command
  enable_user_lingering

  msg_ok "Systemd service created for '$server_name'"
}

# Function to check if a service exists
check_service_exists() {
  local service_name="$1"
  local service_file="$HOME/.config/systemd/user/bedrock-${service_name}.service"

  if [[ ! -f "$service_file" ]]; then
    msg_error "Service file for '$service_name' does not exist."
    return 1
  fi
}

# Function to enable the service
enable_service() {
  local server_name=$1
  check_service_exists "$server_name"
  
  # Check if the service is already enabled
  if systemctl is-enabled --user "bedrock-${server_name}" &> /dev/null; then
    echo "Service $server_name is already enabled."
    return 0
  fi

  # Enable the server with systemctl
  systemctl --user enable "bedrock-${server_name}"
  if [[ $? -eq 0 ]]; then
    echo "Autostart for $server_name enabled successfully."
  else
    msg_error "Failed to enable $server_name."
    return 0
  fi
}

# Function to disable the service
disable_service() {
  local server_name=$1
  check_service_exists "$server_name"

  # Check if the service is already disabled
  if ! systemctl is-enabled --user "bedrock-${server_name}" &> /dev/null; then
    echo "Service $server_name is already disabled."
    return 0
  fi

  # Disable the server with systemctl
  systemctl --user disable "bedrock-${server_name}"
  if [[ $? -eq 0 ]]; then
    echo "Server $server_name disabled successfully."
  else
    msg_error "Failed to disable $server_name."
    return 0
  fi
}

# Function to monitor system resource usage of a systemd service
monitor_service_usage() {
    local service_name="$1"

    if [[ -z "$service_name" ]]; then
        echo "Usage: monitor_service_usage <service_name>"
        return 1
    fi

    # Check if the service exists before proceeding (user-level services)
    check_service_exists "$service_name" || return 1

    echo "Monitoring resource usage for service: $service_name"

    while true; do
        
        trap 'clear; return 0' SIGINT

        # Get the PID of the 'screen' process that is running the Bedrock server
        local screen_pid
        screen_pid=$(pgrep -f "bedrock-${service_name}" | grep -v "screen" | head -n 1)  # Get the server's process
        screen_pid=$((screen_pid + 1)) # +1 to get the server's child process

        if [[ -z "$screen_pid" ]]; then
            echo "No running instance found for service '$service_name'."
            return 0
        fi

        # Get CPU and Memory usage for the child Bedrock server process
        local cpu mem cmd uptime
        read cpu mem cmd uptime <<< $(top -b -n 1 -p "$screen_pid" | awk 'NR>7 {print $9, $10, $12, $11}' | head -n 1) 
        # Clear screen and display output
        clear
        echo "---------------------------------"
        echo " Monitoring:  $service_name "
        echo "---------------------------------"
        echo "PID:          $screen_pid"
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
    # Stop the server if it's running
    if systemctl --user is-active --quiet "bedrock-${server_name}"; then
    send_command $server_name "allowlist reload"
    fi
    msg_ok "Updated allowlist.json with ${#new_players[@]} new players."
  else
    msg_info "No new players were added. Existing allowlist.json was not modified."
  fi
}

# Select .mcworld menu
extract_worlds() {
  local server_name="$1"

  # Path to the content/worlds folder and the server directory
  local content_dir="$SCRIPTDIR/content/worlds"
  local server_dir="$BASE_DIR/$server_name"
  local server_properties="$server_dir/server.properties"

  # Check if server.properties exists
  if [[ ! -f "$server_properties" ]]; then
    msg_error "server.properties not found in $server_dir"
    return 1
  fi

  # Get the world name from the server.properties file
  local world_name
  world_name=$(get_world_name "$server_properties")

  # If we couldn't find the world name, return an error
  if [[ -z "$world_name" ]]; then
    msg_error "Could not find level-name in server.properties"
    return 1
  fi

  msg_info "World name from server.properties: $world_name"

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
    echo "Available worlds to install:"
    select mcworld_file in "${file_names[@]}"; do
      if [[ -z "$mcworld_file" ]]; then
        msg_warn "Invalid selection. Please choose a valid option."
        break
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
      local selected_file="${mcworld_files[${REPLY}-1]}"

      # Call the install_world function to handle the extraction and server management
      install_world "$server_name" "$selected_file"
      return 0 # Exit extract_worlds after successful install_world
    done
  done
}

# Install world to server
install_world() {
  local server_name="$1"
  local selected_file="$2"
  local from_addon="${3:-false}"
  local server_dir="$BASE_DIR/$server_name"
  local server_properties="$server_dir/server.properties"

  # Get the world name from server.properties
  local world_name
  world_name=$(get_world_name "$server_properties")
  local extract_dir="$server_dir/worlds/$world_name"

    # Check if server is running when not frmo addon
    if [[ "$from_addon" == false ]]; then
        msg_info "Checking if server is running"
        if systemctl --user is-active --quiet "bedrock-${server_name}"; then
          send_command $server_name "say Updating server..."
          stop_server $server_name
          local was_running
          was_running=true
        else
          msg_info "Server '$server_name' is not currently running."
        fi
    fi

  msg_info "Installing world $(basename "$selected_file")..."

  # Remove existing world folder content
  msg_warn "Removing existing world folder..."
  rm -rf "$extract_dir"/*

  # Extract the new world
  msg_info "Extracting new world..."
  unzip -o "$selected_file" -d "$extract_dir" &>/dev/null
  chmod -R u+w "$extract_dir"
  msg_ok "World installed to $server_name"

  # Start the server after the world is installed if not from addon
  if [[ "$from_addon" == false ]]; then
      if [[ "$was_running" == true ]]; then
        start_server $server_name
      else
        msg_info "Skip starting server '$server_name'."
      fi
  fi
  return 0
}

# Select .mcaddon/.mcpack menu
install_addons() {
  local server_name="$1"

  # Directories
  local addon_dir="$SCRIPTDIR/content/addons"
  local server_dir="$BASE_DIR/$server_name"
  local server_properties="$server_dir/server.properties"

  # Check if server.properties exists
  if [[ ! -f "$server_properties" ]]; then
    msg_warn "server.properties not found in $server_dir"
    return 1
  fi

  # Get the world name from the server.properties file
  local world_name
  world_name=$(get_world_name "$server_properties")

  # If we couldn't find the world name, return an error
  if [[ -z "$world_name" ]]; then
    msg_error "Could not find level-name in server.properties"
    return 1
  fi

  msg_info "World name from server.properties: $world_name"

  # Set up addon and world directories
  local behavior_dir="$server_dir/worlds/$world_name/behavior_packs"
  local resource_dir="$server_dir/worlds/$world_name/resource_packs"
  local behavior_json="$server_dir/worlds/$world_name/world_behavior_packs.json"
  local resource_json="$server_dir/worlds/$world_name/world_resource_packs.json"

  # Create directories if they don't exist
  mkdir -p "$behavior_dir" "$resource_dir"

  # Collect .mcaddon and .mcpack files using globbing
  local addon_files=()
  # Check for .mcaddon files
  if compgen -G "$addon_dir/*.mcaddon" > /dev/null; then
    addon_files+=("$addon_dir"/*.mcaddon)
  fi
  # Check for .mcpack files
  if compgen -G "$addon_dir/*.mcpack" > /dev/null; then
    addon_files+=("$addon_dir"/*.mcpack)
  fi

  # If no addons found, return an error
  if [[ ${#addon_files[@]} -eq 0 ]]; then
    msg_warn "No .mcaddon or .mcpack files found in $addon_dir"
    return 0
  fi

  # Show selection menu
  show_addon_selection_menu $server_name "${addon_files[@]}"
}

# Show the addon selection menu
show_addon_selection_menu() {
  local server_name="$1"
  shift
  local addon_files=("$@")
  PS3="Select an addon to install (1-${#addon_files[@]}): "
    addon_names=()
    for addon_file in "${addon_files[@]}"; do
      addon_names+=("$(basename "$addon_file")")  # Extract file name from path
    done
    while true; do
      echo "Available addons to install:"
      select addon_name in "${addon_names[@]}"; do
        if [[ -z "$addon_name" ]]; then
          msg_error "Invalid selection. Please choose a valid option."
          break
        fi

        # Find the full path of the selected file
        addon_file=$(realpath "$addon_dir/$addon_name")

        msg_info "Processing addon: $addon_name"

        # Check if server is running
        if systemctl --user is-active --quiet "bedrock-${server_name}"; then
          send_command $server_name "say Updating server..."
          stop_server $server_name
          local was_running
          was_running=true
        else
          msg_info "Server '$server_name' is not currently running."
        fi

        process_addon "$addon_file" "$server_name"

        if [[ "$was_running" == true ]]; then
          start_server $server_name
        else
          msg_info "Skip starting server '$server_name'."
        fi
        break
    done
    break
  done
}

# Process the selected addon
process_addon() {
  local addon_file="$1"
  local server_name="$2"
  
  # Extract addon name (strip file extension)
  local addon_name
  addon_name=$(basename "$addon_file" | sed -E 's/\.(mcaddon|mcpack)$//')

  # If it's a .mcaddon, extract it
  if [[ "$addon_file" == *.mcaddon ]]; then
    process_mcaddon "$addon_file" "$server_name"
  
  # If it's a .mcpack, process it
  elif [[ "$addon_file" == *.mcpack ]]; then
    process_mcpack "$addon_file" "$server_name"
  fi
}

# Process .mcaddon file
process_mcaddon() {
  local addon_file="$1"
  local server_name="$2"

  local temp_dir
  temp_dir=$(mktemp -d)

  msg_info "Extracting $(basename "$addon_file")..."

  # Unzip the .mcaddon file to a temporary directory
  unzip -o "$addon_file" -d "$temp_dir" &>/dev/null
  chmod -R u+w "$temp_dir"

  # Handle contents of the .mcaddon file
  process_mcaddon_files "$temp_dir" "$server_name"
  
  rm -rf "$temp_dir"
  msg_ok "$(basename "$addon_file") extracted and installed."
}

# Process files inside the .mcaddon
process_mcaddon_files() {
  local temp_dir="$1"
  local server_name="$2"

  # Process .mcworld files
  for world_file in "$temp_dir"/*.mcworld; do
    if [[ -f "$world_file" ]]; then
      msg_info "Processing .mcworld file: "$(basename "$world_file")""
      install_world "$server_name" "$world_file" true
    fi
  done

  # Process .mcpack files
  for pack_file in "$temp_dir"/*.mcpack; do
    if [[ -f "$pack_file" ]]; then
      msg_info "Processing .mcpack file: "$(basename "$world_file")""
      process_mcpack "$pack_file" "$server_name"
    fi
  done
}

# Process .mcpack file
process_mcpack() {
  local pack_file="$1"
  local server_name="$2"
  local temp_dir
  temp_dir=$(mktemp -d)

  msg_info "Extracting $(basename "$pack_file")..."

  # Unzip the .mcpack file to a temporary directory
  unzip -o "$pack_file" -d "$temp_dir" &>/dev/null
  chmod -R u+w "$temp_dir"

  # Parse the manifest.json and process the pack
  process_manifest "$temp_dir" "$server_name" "$pack_file"
  
  rm -rf "$temp_dir"
}

# Process manifest.json and handle the pack
process_manifest() {
  local temp_dir="$1"
  local server_name="$2"
  local pack_file="$3"

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

    # Handle copying files based on pack type
    if [[ "$pack_type" == "data" ]]; then
      msg_info "Installing behavior pack to $server_name"
      mkdir -p "$addon_behavior_dir"
      cp -r "$temp_dir"/* "$addon_behavior_dir"
      chmod -R u+w "$addon_behavior_dir"
      update_pack_json "$behavior_json" "$uuid" "$version" "$addon_name_from_manifest"
      msg_ok "Installed "$(basename "$pack_file")" to $server_name."
    elif [[ "$pack_type" == "resources" ]]; then
      msg_info "Installing resource pack to $server_name"
      mkdir -p "$addon_resource_dir"
      cp -r "$temp_dir"/* "$addon_resource_dir"
      chmod -R u+w "$addon_resource_dir"
      update_pack_json "$resource_json" "$uuid" "$version" "$addon_name_from_manifest"
      msg_ok "Installed "$(basename "$pack_file")" to $server_name."
    else
      msg_error "Unknown pack type: $pack_type"
    fi
  else
    msg_error "manifest.json not found in $(basename "$pack_file")"
  fi
}

# Helper function to update pack JSON files
update_pack_json() {
  local json_file="$1"
  local pack_id="$2"
  local version="$3"

  msg_info "Updating "$(basename "$json_file")"."

  # Ensure JSON file exists
  [[ ! -f "$json_file" ]] && echo "[]" > "$json_file"

  # Convert version string to an array
  local version_array
  version_array=$(echo "$version" | awk -F '.' '{print "["$1", "$2", "$3"]"}')

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

  # Write updated JSON back to the file
  echo "$updated_json" > "$json_file"
  msg_ok "Updated "$(basename "$json_file")"."
  return 0
}

# Attach to screen
attach_console() {
  local server_name="$1"

  # Check if the server is running in a screen session
  if screen -list | grep -q "bedrock-${server_name}"; then
    msg_info "Attaching to server '$server_name' console..."
    screen -r "bedrock-${server_name}"
  else
    msg_warn "Server '$server_name' is not running in a screen session."
  fi
}

# Send commands to server
send_command() {
  local server_name="$1"
  local command="$2"

  # Check if the server is running in a screen session
  if screen -list | grep -q "bedrock-${server_name}"; then
    # Send the command to the screen session
    msg_info "Sending command to server '$server_name'..."
    screen -S "bedrock-${server_name}" -X stuff "$command"^M"" # ^M simulates Enter key
    msg_ok "Command '$command' sent to server '$server_name'."
  else
    msg_warn "Server '$server_name' is not running in a screen session."
  fi
}

# Restart server
restart_server() {
  local server_name="$1"

  if ! systemctl --user is-active --quiet "bedrock-${server_name}"; then
    msg_warn "Server '$server_name' is not running. Starting it instead."
    start_server "$server_name"
    return $?
  fi

  msg_info "Restarting server '$server_name'..."
  
  # Send restart warning if the server is running
  send_command $server_name "say Restarting server in 10 seconds.."

  sleep 10

  if ! systemctl --user restart "bedrock-${server_name}"; then
    msg_error "Failed to restart server: '$server_name'."
    return 1
  fi

  msg_ok "Server '$server_name' restarted."
}

# Start server
start_server() {
  local server_name="$1"
  
  if systemctl --user is-active --quiet "bedrock-${server_name}"; then
    msg_warn "Server '$server_name' is already running."
    return 0
  fi

  msg_info "Starting server '$server_name'..."
  if ! systemctl --user start "bedrock-${server_name}"; then
    msg_error "Failed to start server: '$server_name'."
    return 1
  fi

  msg_ok "Server '$server_name' started."
}

# Stop server
stop_server() {
  local server_name="$1"

  if ! systemctl --user is-active --quiet "bedrock-${server_name}"; then
    msg_warn "Server '$server_name' is not running."
    return 0
  fi

  msg_info "Stopping server '$server_name'..."
  
  # Send shutdown warning if the server is running
  send_command $server_name "say Shutting down server in 10 seconds.."
  
  sleep 10

  if ! systemctl --user stop "bedrock-${server_name}"; then
    msg_error "Failed to stop server: '$server_name'."
    return 1
  fi

  msg_ok "Server '$server_name' stopped."
}

# Back up a server's worlds and critical configuration files
backup_server() {
  local server_name="$1"
  local server_dir="$BASE_DIR/$server_name"
  local in_update="${2:-false}"
  local backup_dir="$SCRIPTDIR/backups/$server_name"
  local timestamp
  local backup_file
  local backups_to_keep
  local server_properties="$server_dir/server.properties"

  # Extract world folder name from server.properties
  local world_folder
  world_folder=$(get_world_name "$server_properties")
  
  if [[ -z "$world_folder" ]]; then
    msg_error "Failed to determine world folder from server.properties!"
    return 1
  fi

  # Generate timestamp and define backup file for worlds
  timestamp=$(date +"%Y%m%d_%H%M%S")
  backup_name="${world_folder}_backup_$timestamp.mcworld"
  backup_file="$backup_dir/$backup_name"

  if [[ "$in_update" == false ]]; then
    if systemctl --user is-active --quiet "bedrock-${server_name}"; then
      send_command $server_name "say Running server backup.."
      stop_server $server_name
      local was_running=true
    else
      msg_info "Server '$server_name' is not currently running."
    fi
  fi

  msg_info "Running backup"

  # Ensure backup directory exists
  mkdir -p "$backup_dir"

  # Check if the world directory exists
  if [[ -d "$server_dir/worlds/$world_folder" ]]; then
    # Backup the world contents into a .mcworld file
    if ! (cd "$server_dir/worlds/$world_folder" && zip -r "$backup_file" . > /dev/null 2>&1); then
      msg_error "Backup of world failed!"
      return 1
    fi
    msg_ok "World backup created: $backup_name"
  else
    msg_info "World directory does not exist. Skipping world backup."
  fi

  # Backup critical files (allowlist.json, permissions.json, server.properties)
  cp "$server_dir/allowlist.json" "$backup_dir/allowlist.json" 2>/dev/null
  cp "$server_dir/permissions.json" "$backup_dir/permissions.json" 2>/dev/null
  cp "$server_dir/server.properties" "$backup_dir/server.properties" 2>/dev/null
  msg_ok "Critical files backed up to $backup_dir"

  if [[ "$in_update" == false ]]; then
    # Start the server after the world is installed if not updating
    if [[ "$was_running" == true ]]; then
      start_server $server_name
    else
      msg_info "Skipping server start."
    fi
  fi

  # Prune old backups (keeping a defined number of backups)
  msg_info "Pruning old backups..."
  backups_to_keep=$((PACKAGE_BACKUP_KEEP + 1))
  find "$backup_dir" -maxdepth 1 -name "${world_folder}_backup_*.mcworld" -type f | sort -r | tail -n "+$backups_to_keep" | while read -r old_backup; do
    msg_info "Removing old backup: $old_backup"
    rm -f "$old_backup" || msg_error "Failed to remove $old_backup"
  done

  msg_ok "Backup complete and old backups pruned"
}

# Delete a Bedrock server
delete_server() {
  local server_name="$1"
  local server_dir="$BASE_DIR/$server_name"
  local service_file="$HOME/.config/systemd/user/bedrock-${server_name}.service"

  # Confirm deletion
  read -p "Are you sure you want to delete the server '$server_name'? This action is irreversible! (y/n): " confirm
  if [[ ! "${confirm,,}" =~ ^(y|yes)$ ]]; then
    msg_info "Server deletion canceled."
    return 0
  fi

  # Stop the server if it's running
  if systemctl --user is-active --quiet "bedrock-${server_name}"; then
    msg_warn "Stopping server '$server_name' before deletion..."
    stop_server $server_name
  fi

  # Remove the systemd service file
  if [[ -f "$service_file" ]]; then
    msg_warn "Removing user systemd service for '$server_name'"
    disable_service $server_name
    rm -f "$service_file" > /dev/null 2>&1
    systemctl --user daemon-reload
  fi

  # Remove the server directory
  msg_warn "Deleting server directory: $server_dir"
  rm -rf "$server_dir" || { msg_error "Failed to delete server directory."; return 1; }

  msg_ok "Server '$server_name' deleted successfully."
}

migrate_servers() {
  # Check if the bedrock-server-manager folder exists
  if [ -d "$SCRIPTDIR/bedrock_server_manager" ]; then
    # Ask for migration confirmation using a consistent loop
    while true; do
      read -r -p "The folder 'bedrock_server_manager' exists. Do you want to migrate it to 'servers'? (y/n): " response
      response="${response,,}" # Convert to lowercase

      case "$response" in
        yes|y)
          msg_info "Attempting to migrate the folder to 'servers'..."
          # Rename the directory
          mv "$SCRIPTDIR/bedrock_server_manager"/* "$SCRIPTDIR/servers/"
          
          # Loop through each server folder in the new location
          for server_dir in "$SCRIPTDIR/servers"/*/; do
            # Extract the server folder name (not the full path)
            server_name=$(basename "$server_dir")
            
            # Delete existing user systemd service for the server
            msg_info "Attempting to delete existing user systemd service for $server_name..."
            user_systemd_service="$HOME/.config/systemd/user/$server_name.service"
            if [ -f "$user_systemd_service" ]; then
              systemctl --user stop "$server_name.service"
              systemctl --user disable "$server_name.service"
              rm -f "$user_systemd_service"
              msg_ok "Deleted existing user systemd service for $server_name."
            else
              msg_info "No existing user systemd service found for $server_name."
            fi

            # Run the create_systemd_service function with just the server name
            create_systemd_service "$server_name"
          done
          
          rmdir "$SCRIPTDIR/bedrock_server_manager"
          msg_ok "Migration complete."
          return 0
          ;;
        no|n|"") # Empty input is treated as "no"
          msg_info "Migration canceled."
          exit 0
          ;;
        *)
          msg_warn "Invalid input. Please answer 'yes' or 'no'."
          ;; # Loop again
      esac
    done
  else
    msg_warn "'No migration needed"
  fi
}

migrate_servers

# Main menu
main_menu() {
    clear
  while true; do
    echo
    echo -e "${MAGENTA}Bedrock Server Manager${RESET}"
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
        ;;

      2) # Manage an existing server
        manage_server
        ;;

      3) # Install content to server
        install_content
        ;;

      4) # Send a command       
        if get_server_name; then
            read -p "Enter command: " command
            send_command "$server_name" "$command"
        else
            echo "Send command canceled."
        fi
        ;;

      5) # Advanced menu
        advanced_menu
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
    echo -e "${MAGENTA}Bedrock Server Manager${RESET} - ${LIGHTPINK}Manage Server${RESET}"
    echo "1) Update Server"
    echo "2) Backup Server"
    echo "3) Start Server"
    echo "4) Stop Server"
    echo "5) Restart Server"
    echo "6) Delete Server"
    echo "7) Back"
    read -p "Select an option [1-7]: " choice

    case $choice in

      1) # Update an existing server
        if get_server_name; then
            update_server "$server_name"
        else
            echo "Update canceled."
        fi
        ;;

      2) # Backup a server
        if get_server_name; then
            backup_server "$server_name"
        else
            echo "Backup canceled."
        fi
        ;;

      3) # Start a server
        if get_server_name; then
            start_server "$server_name"
        else
            echo "Start canceled."
        fi
        ;;

      4) # Stop a server
        if get_server_name; then
            stop_server "$server_name"
        else
            echo "Stop canceled."
        fi
        ;;

      5) # Restart a server
        if get_server_name; then
            restart_server "$server_name"
        else
            echo "Restart canceled."
        fi
        ;;

      6) # Delete a server
        if get_server_name; then
            delete_server "$server_name"
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
    echo "1) Import World"
    echo "2) Import Addon"
    echo "3) Back"
    read -p "Select an option [1-3]: " choice

    case $choice in

      1) # Install .mcworld to server
        if get_server_name; then
            extract_worlds "$server_name"
        else
            echo "Import canceled."
        fi
        ;;

      2) # Install .mcpack/.mcaddon to sever
        if get_server_name; then
            install_addons "$server_name"
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
    echo "1) Configure Server Properties"
    echo "2) Configure Allowlist"
    echo "3) Attach to Server Console"
    echo "4) Schedule Server Task"
    echo "5) View Server Resource Usage"
    echo "6) Reconfigure Systemd Service"
    echo "7) Back"
    read -p "Select an option [1-6]: " choice

    case $choice in

      1) # Edit server properties
        if get_server_name; then
            # Use default directory
            local server_dir="$BASE_DIR/$server_name"
            configure_server_properties "$server_dir" "$server_name"
        else
            echo "Configuration canceled."
        fi
        ;;

      2) # Configure server allowlist
        if get_server_name; then
            # Use default directory
            local server_dir="$BASE_DIR/$server_name"
            configure_allowlist "$server_dir"
        else
            echo "Configuration canceled."
        fi
        ;;  

      3) # Attach to server console
        if get_server_name; then
            attach_console "$server_name"
        else
            echo "Attach canceled."
        fi
        ;;

      4) # Schedule task for server
        if get_server_name; then
            cron_scheduler "$server_name"
        else
            echo "Schedule canceled."
        fi
        ;;

      5) # View resource usage for server
        if get_server_name; then
            monitor_service_usage "$server_name"
        else
            echo "Monitoring canceled."
        fi
        ;;

      6) # Reconfigure server systemd file
        if get_server_name; then
            create_systemd_service "$server_name"
        else
            echo "Configuration canceled."
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

# Parse and execute commands passed via the command line
#echo "Arguments received: $@"

# Parse commands
case "$1" in

  main)
    # Open the main menu
    echo "Opening main menu..."
    main_menu
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

  enable-server)
    shift # Remove the first argument (enable-server)
    while [[ $# -gt 0 ]]; do
      case $1 in
        --server)
          server_name=$2
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
    if [[ -z $server_name ]]; then
      msg_error "Missing required argument: --server"
      echo "Usage: $0 enable-server --server <server_name>"
      exit 1
    fi

    enable_service "$server_name"
    ;;
    
  disable-server)
    shift # Remove the first argument (disable-server)
    while [[ $# -gt 0 ]]; do
      case $1 in
        --server)
          server_name=$2
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
    if [[ -z $server_name ]]; then
      msg_error "Missing required argument: --server"
      echo "Usage: $0 disable-server --server <server_name>"
      exit 1
    fi

    disable_service "$server_name"
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
    echo
    echo "  main           -- Open the main menu"
    echo
    echo "  send-command   -- Send a command to a running server"
    echo "    --server <server_name>    Specify the server name"
    echo "    --command <command>       The command to send to the server (must be in 'quotations')"
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