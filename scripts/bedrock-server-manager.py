#!/usr/bin/env python3
# Bedrock Server Manager
# Bedrock Server Manager is a cross-platofrm python script used to easily install/manage bedorck dedcated servers from the command line
# You may download and use this content for personal, non-commercial use. Any other use, including reproduction, or redistribution is prohibited without prior written permission.
# Change default config at ./config/script_config.json
# COPYRIGHT ZVORTEX11325 2025
# Author: ZVortex11325
# Version 2.0.0
# REQUIREMENTS:
# colorama
# requests
# psutil

from datetime import timedelta, datetime 
from colorama import Fore, Style, init
import xml.etree.ElementTree as ET
import sys
import subprocess
import platform
import requests
import json
import re
import zipfile
import getpass
import glob
import shutil
import time
import os
import stat
import psutil
import socket
import tempfile
#import shlex
#import calendar

if sys.version_info < (3, 10):
    sys.exit("This script requires Python 3.10 or later.")

init(autoreset=True)

# Constants
script_dir = os.path.dirname(os.path.realpath(__file__))
script_direct = os.path.join(script_dir, "bedrock-server-manager.py")
config_dir = os.path.join(script_dir, ".config")  
content_dir = os.path.join(script_dir, "content")  
LOG_DIR = os.path.join(script_dir, ".logs")
LOG_TIMESTAMP = datetime.now().strftime("%Y%m%d")
SCRIPT_LOG = os.path.join(LOG_DIR, f"log_{LOG_TIMESTAMP}.log")

def get_timestamp():
    """Returns the current timestamp in YYYYMMDD_HHMMSS format."""
    return datetime.now().strftime("%Y%m%d_%H%M%S")

def log_to_file(message):
    """Logs a message to the script's log file."""
    os.makedirs(LOG_DIR, exist_ok=True)
    with open(SCRIPT_LOG, "a") as log_file:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_file.write(f"{timestamp} {message}\n")

def msg_info(message):
    """Prints an info message with a cyan [INFO] tag and logs it."""
    print(Fore.CYAN + "[INFO] " + Style.RESET_ALL + message, file=sys.stderr)
    log_to_file(f"[INFO] {message}")

def msg_ok(message):
    """Prints an OK message with a green [OK] tag and logs it."""
    print(Fore.GREEN + "[OK] " + Style.RESET_ALL + message, file=sys.stderr)
    log_to_file(f"[OK] {message}")

def msg_warn(message):
    """Prints a warning message with a yellow [WARN] tag and logs it."""
    print(Fore.YELLOW + "[WARN] " + Style.RESET_ALL + message, file=sys.stderr)
    log_to_file(f"[WARN] {message}")

def msg_error(message):
    """Prints an error message with a red [ERROR] tag and logs it."""
    print(Fore.RED + "[ERROR] " + Style.RESET_ALL + message, file=sys.stderr)
    log_to_file(f"[ERROR] {message}")

def msg_debug(message):
    """Logs a debug message (does not print to console)."""
    log_to_file(f"[DEBUG] {message}")

def manage_log_files(log_dir=LOG_DIR, max_files=10, max_size_mb=15):
    """Manages log files in the specified directory.

    Removes old log files based on count and total size.

    Args:
        log_dir (str): The directory containing the log files.
        max_files (int): The maximum number of log files to keep.
        max_size_mb (int): The maximum total size of log files in MB.
    """
    action = "manage log files"

    # Ensure log directory exists
    try:
        os.makedirs(log_dir, exist_ok=True)
    except OSError as e:
        handle_error(16, action)  # Failed to create directory
        return 16 #Return error code

    msg_debug(f"Managing log files in: {log_dir}")

    try:
        log_files = sorted(glob.glob(os.path.join(log_dir, "log_*.log")), key=os.path.getmtime, reverse=True)
    except OSError:
        msg_warn(f"Failed to list log files in {log_dir}. Log management may be incomplete.")
        log_files = [] # set to empty to prevent errors later.

    num_log_files = len(log_files)

    # --- Count-Based Cleanup ---
    if num_log_files > max_files:
        msg_debug(f"Performing log file count-based cleanup (keeping last {max_files})...")
        for log_file in log_files[max_files:]:  # Iterate over files to be deleted
            try:
                os.remove(log_file)
            except OSError:
                msg_warn(f"Failed to delete old log file: {log_file}")
        msg_debug(f"Old log files deleted, keeping last {max_files}.")
    else:
        msg_debug(f"Log file count is within limit ({num_log_files} files, max {max_files}). Skipping count-based cleanup.")

    # --- Size-Based Cleanup ---
    try:
        total_size_bytes = sum(os.path.getsize(f) for f in log_files[:max_files]) # get size of the remaining files
        total_size_mb_actual = total_size_bytes / 1048576
    except OSError:
        msg_warn("Failed to get the total size of the log directory.")
        total_size_mb_actual = 0 # set to prevent errors

    if total_size_mb_actual > max_size_mb:
        msg_warn(f"Log directory size exceeds limit ({total_size_mb_actual:.2f} MB > {max_size_mb} MB). Reducing size...")

        for log_file in log_files[max_files:]:  # Re-check files, including newly added
            try:
                os.remove(log_file)
                total_size_bytes = sum(os.path.getsize(f) for f in glob.glob(os.path.join(log_dir, "log_*.log"))) #Recalculate file size
                total_size_mb_actual = total_size_bytes / 1048576
                if total_size_mb_actual <= max_size_mb:
                  break
            except OSError:
                msg_warn(f"Failed to delete log file: {log_file}")
                break # stop trying to delete files

        msg_debug(f"Log directory size reduced to {total_size_mb_actual:.2f} MB (limit: {max_size_mb} MB).")
    else:
        msg_debug(f"Log directory size is within limit ({total_size_mb_actual:.2f} MB, max {max_size_mb} MB). Skipping size-based cleanup.")

    msg_debug("Log file management completed.")
    return 0

def handle_error(exit_code, action):
    """Handles errors based on the provided exit code and action.

    Args:
        exit_code (int): The error code.
        action (str): The action that was being performed when the error occurred.
    """

    msg_error(f"Error code: {exit_code}")

    error_messages = {
        0:   "",  # Success, no action needed
        1:   f"{action}: General error occurred.",
        2:   f"{action}: Missing required argument.",
        3:   f"{action}: Unsupported package manager.",
        4:   f"{action}: Missing required packages.",
        5:   f"{action}: Invalid input.",
        6:   f"{action}: Server not found.",
        7:   f"{action}: Server already running.",
        8:   f"{action}: Server not running.",
        9:   f"{action}: Failed to install/update server.",
        10:  f"{action}: Failed to start/stop server.",
        11:  f"{action}: Failed to configure server properties.",
        12:  f"{action}: Failed to create systemd service.",
        13:  f"{action}: Failed to enable/disable service.",
        14:  f"{action}: Failed to read/write configuration file.",
        15:  f"{action}: Failed to download or extract files.",
        16:  f"{action}: Failed to create or remove directories.",
        17:  f"{action}: Failed to send command to server.",
        18:  f"{action}: Failed to attach to server console.",
        19:  f"{action}: Failed to configure allowlist.",
        20:  f"{action}: Failed to backup server.",
        21:  f"{action}: Failed to delete server.",
        22:  f"{action}: Failed to schedule task.",
        23: f"{action}: Failed to monitor server resource usage.",
        24: f"{action}: Internet connectivity test failed.",
        25: f"{action}: Invalid server name.",
        26: f"{action}: Invalid cron job input.",
        27: f"{action}: Invalid pack type (for addons).",
        28: f"{action}: Failed to reload allowlist.",
        29: f"{action}: Failed to migrate server directories.",
        255: f"{action}: User exited.",
    }

    message = error_messages.get(exit_code, f"{action}: Unknown error ({exit_code}).")

    if exit_code == 255:
        msg_warn(message)
        print("0")
        return 0
    elif message:  # Check if the message is not empty
        msg_error(message)
        print(str(exit_code))
    else:
        print(str(exit_code)) # added to print the exit code even if theres no error message
        
    return exit_code

def setup_prerequisites():
    """Checks for required command-line tools and provides instructions if missing."""
    action = "setup prerequisites"
    packages = ["screen", "systemd"] 
    missing_packages = []

    for pkg in packages:
        if shutil.which(pkg) is None:
            missing_packages.append(pkg)

    if not missing_packages:
        msg_debug("All required packages are already installed.")
        return 0

    msg_error(f"The following required packages are missing: {', '.join(missing_packages)}")

    system = platform.system()
    if system == "Linux":
        distro = platform.freedesktop_os_release()['ID_LIKE']
        if 'debian' in distro or 'ubuntu' in distro:  # Combined Debian/Ubuntu
            msg_info("To install missing packages on Debian/Ubuntu, run:")
            msg_info("  sudo apt-get update")
            msg_info("  sudo apt-get install -y " + " ".join(missing_packages))
        elif 'rhel' in distro or 'fedora' in distro or 'centos' in distro:
            msg_info("To install missing packages on Fedora/RHEL/CentOS, run: sudo dnf install -y " + " ".join(missing_packages))
        elif 'arch' in distro:
            msg_info("To install missing packages on Arch Linux, run: sudo pacman -S --noconfirm " + " ".join(missing_packages))
        elif 'suse' in distro:
             msg_info("To install missing packages on openSUSE/SLES, run: sudo zypper install -y " + " ".join(missing_packages))
        else:
            msg_warn("Unsupported Linux distribution. Please install the missing packages manually.")

    elif system == "Windows":
        msg_info("Windows doesn't currently support all script features. You may want to look into Windows Subsystem Linux (wsl).")
    else:
        msg_warn("Unsupported operating system.  Please install the missing packages manually.")

    return handle_error(4, action)

def check_internet_connectivity(host="8.8.8.8", port=53, timeout=3):
    """Checks for internet connectivity by attempting a socket connection.

    Args:
        host (str): The hostname or IP address to connect to.  Defaults to
            Google's DNS server (8.8.8.8).
        port (int): The port number to connect to. Defaults to 53 (DNS).
        timeout (int): The timeout in seconds.

    Returns:
        int: 0 if connectivity is OK, an error code otherwise.
    """
    action = "check internet connectivity"
    msg_debug(f"Checking internet connectivity to {host}:{port} with timeout {timeout}s")
    try:
        # Attempt a socket connection.
        socket.setdefaulttimeout(timeout)
        socket.socket(socket.AF_INET, socket.SOCK_STREAM).connect((host, port))
        msg_debug("Internet connectivity OK.")
        return 0  # Success
    except socket.error as ex:
        msg_warn(f"Connectivity test failed: {ex}")
        return handle_error(24, action)
    except Exception as e:
        msg_error(f"An unexpected error occurred: {e}")
        return handle_error(24, action)

def update_script(script_path=__file__):
    """Downloads an updated version of the script from GitHub.

    Args:
        script_path (str): The path to the current script. Defaults to the
            currently running script.
    """
    action = "update script"
    msg_info("Redownloading script...")
    script_url = "https://raw.githubusercontent.com/DMedina559/minecraft/main/scripts/bedrock-server-manager.py"

    try:
        response = requests.get(script_url, timeout=10)
        response.raise_for_status()
        with open(script_path, "w") as f:
            f.write(response.text)

        if platform.system() != "Windows":
            try:
                current_permissions = os.stat(script_path).st_mode
                os.chmod(script_path, current_permissions | stat.S_IEXEC)
                msg_debug(f"Set execute permissions on {script_path}")
            except OSError as e:
                msg_error(f"Failed to set execute permissions: {e}")

        msg_ok("Done.")
        return 0
    except requests.exceptions.RequestException as e:
        msg_error(f"Failed to download updated script: {e}")
        return handle_error(1, action)

def write_config_if_not_exists(config_dir=None):
    """Writes a default configuration file if it doesn't exist or is invalid."""

    if config_dir is None:
      config_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), ".config") # Set default.
    config_file = os.path.join(config_dir, "script_config.json")
    required_keys = ("BASE_DIR", "BACKUP_KEEP", "DOWNLOAD_KEEP")
    config_valid = True
    action = "write config if not exists"

    msg_debug(f"Checking configuration file: '{config_file}'")

    if not os.path.exists(config_file):
        msg_debug("Configuration file not found. Proceeding to write default config.")
        config_valid = False
    else:
        msg_debug("Configuration file exists. Validating content.")
        try:
            with open(config_file, "r") as f:
                config_data = json.load(f)  # Load the JSON data

            for req_key in required_keys:
                if req_key not in config_data:
                    msg_warn(f"Warning: Required key '{req_key}' is missing from config. Recreating config with defaults.")
                    config_valid = False
                    break
        except json.JSONDecodeError:
            msg_warn("Warning: Configuration file is not valid JSON. Recreating config with defaults.")
            try: #Attempt to remove
                os.remove(config_file)
            except OSError as e:
                msg_warn(f"Failed to remove invalid config file. This may cause issues: {e}")
                return handle_error(16, action)  # Return error.
            config_valid = False
        except OSError as e:
            msg_error(f"Failed to read config file {e}")
            return handle_error(14, action) #Failed to read/write

        if config_valid:
            msg_debug("Configuration file is valid and contains all required keys.")


    if not config_valid:
        msg_debug("Writing default configuration...")
        try:
            os.makedirs(config_dir, exist_ok=True)  # Ensure directory exists
            with open(config_file, "w") as f:
                default_config_data = {
                    "BASE_DIR": os.path.join(os.path.dirname(os.path.realpath(__file__)), "servers"),
                    "BACKUP_KEEP": 3,
                    "DOWNLOAD_KEEP": 3,
                }
                json.dump(default_config_data, f, indent=4)  # Write pretty JSON
            msg_debug(f"Default configuration written to '{config_file}'.")
        except OSError as e:
            msg_error(f"Failed to write default config: {e}")
            return handle_error(14, action)

    return 0

def manage_script_config(key, operation, value=None, config_dir=None):
    """Manages the script's configuration file (script_config.json).

    Args:
        key (str): The configuration key to read or write.
        operation (str): "read" or "write".
        value (str, optional): The value to write (required for "write").
        config_dir(str, optional): The config directory.

    Returns:
        str or int:  If operation is "read", returns the value (or None if not found).
                      If operation is "write", returns 0 on success, or an error code.
    """
    if config_dir is None: #Allow config_dir to be passed in.
        config_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), ".config")

    config_file = os.path.join(config_dir, "script_config.json")
    action = "manage script config"

    if not key:
        msg_error("manage_script_config: key is empty.")
        return handle_error(2, action)
    if not operation:
        msg_error("manage_script_config: operation is empty")
        return handle_error(2, action)

    os.makedirs(config_dir, exist_ok=True)  # Ensure config directory exists

    if not os.path.exists(config_file):
        msg_debug(f"config.json not found in {config_dir}. Creating a new one.")
        try:
            with open(config_file, "w") as f:
                json.dump({}, f)  # Create an empty JSON file
        except OSError:
            msg_error(f"Failed to initialize config.json")
            return handle_error(14, action)

    try:
        with open(config_file, "r") as f:
            current_config = json.load(f)
    except (OSError, json.JSONDecodeError):
        msg_error("Failed to read or parse existing config.json.")
        return handle_error(14, action)


    if operation == "read":
        #msg_debug("Operating in READ mode.")
        read_value = current_config.get(key)
        if read_value is not None:  # Use None to check for missing keys
            return read_value
        else:
            msg_warn(f"Warning: Key '{key}' not found in config.json or value is empty.")
            return None  # Consistent return type for "read"

    elif operation == "write":
        if value is None:
            msg_error("Error: Value is required for 'write' operation.")
            return handle_error(2, action)

        current_config[key] = value
        try:
            with open(config_file, "w") as f:
                json.dump(current_config, f, indent=4)
            msg_debug(f"Successfully updated '{key}' in {config_file} to: '{value}'")
            return 0
        except OSError as e:
            msg_error(f"Failed to write to config.json {e}")
            return handle_error(14, action)

    else:
        msg_error(f"Error: Invalid operation type: '{operation}'. Must be 'read' or 'write'.")
        return handle_error(5, action)

def default_config():
    """Loads default configuration variables from script_config.json."""
    action = "load default configuration"
    msg_debug("Loading default configuration variables...")

    if write_config_if_not_exists() != 0:
        msg_error("Failed to write or validate config. Exiting")
        sys.exit(14) # Exit if this fails.

    config = {} # Store config

    base_dir = manage_script_config("BASE_DIR", "read")
    if base_dir is None:
        msg_error("Failed to read BASE_DIR from config. Exiting.")
        sys.exit(14)
    config['BASE_DIR'] = base_dir

    backup_keep = manage_script_config("BACKUP_KEEP", "read")
    if backup_keep is None:
        msg_warn("Failed to read BACKUP_KEEP, defaulting to 3")
        backup_keep = 3
    config['BACKUP_KEEP'] = backup_keep

    download_keep = manage_script_config("DOWNLOAD_KEEP", "read")
    if download_keep is None:
        msg_warn("Failed to read DOWNLOAD_KEEP, defaulting to 3")
        download_keep = 3
    config['DOWNLOAD_KEEP'] = download_keep

    msg_debug("Default configuration variables loaded.")
    return config

def manage_server_config(server_name, key, operation, value=None, config_dir=None):
    """Manages individual server configuration files (server_name_config.json).

    Args:
        server_name (str): The name of the server.
        key (str): The configuration key.
        operation (str): "read" or "write".
        value (str, optional): The value to write (required for "write").
        config_dir (str, optional): config directory, defaults to .config

    Returns:
        str or int: Value for "read", 0 for successful "write", error code otherwise.
    """
    if config_dir is None:  # Allow config_dir to be passed in.
        config_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), ".config")
    server_config_dir = os.path.join(config_dir, server_name)
    config_file = os.path.join(server_config_dir, f"{server_name}_config.json")
    action = "manage server config"

    msg_debug(f"Managing {server_name}_config.json, Key: '{key}', Operation: '{operation}'")

    if not server_name:
        msg_error("manage_server_config: server_name is empty.")
        return handle_error(25, action)
    if not key:
        msg_error("manage_server_config: key is empty.")
        return handle_error(2, action)
    if not operation:
        msg_error("manage_server_config: operation is empty")
        return handle_error(2, action)

    os.makedirs(server_config_dir, exist_ok=True)

    if not os.path.exists(config_file):
        msg_debug(f"{server_name}_config.json not found in {server_config_dir}. Creating a new one.")
        try:
            with open(config_file, "w") as f:
                json.dump({}, f)
        except OSError:
            msg_error(f"Failed to initialize {server_name}_config.json.")
            return handle_error(14, action)

    try:
        with open(config_file, "r") as f:
            current_config = json.load(f)
    except (OSError, json.JSONDecodeError):
        msg_error(f"Failed to read or parse existing {server_name}_config.json.")
        return handle_error(14, action)


    if operation == "read":
        read_value = current_config.get(key)
        if read_value is not None:
            return read_value
        else:
            msg_warn(f"Key '{key}' not found in {server_name}_config.json or value is empty.")
            return None

    elif operation == "write":
        if value is None:
            msg_error("Error: Value is required for 'write' operation.")
            return handle_error(5, action)

        current_config[key] = value
        try:
            with open(config_file, "w") as f:
                json.dump(current_config, f, indent=4)
            msg_debug(f"Successfully updated '{key}' in {config_file} to: '{value}'")
            return 0
        except OSError:
            msg_error(f"Failed to write to {server_name}_config.json")
            return handle_error(14, action)

    else:
        msg_error(f"Invalid operation type: '{operation}'. Must be 'read' or 'write'.")
        return handle_error(5, action)

def validate_server(server_name, base_dir):
    """Validates if a server exists by checking for the server executable.

    Args:
        server_name (str): The name of the server.
        base_dir (str): The base directory where servers are stored.

    Returns:
        bool: True if the server exists and is valid, False otherwise.
    """
    action = "validate server"
    server_dir = os.path.join(base_dir, server_name)

    if not server_name:
        msg_error("validate_server: server_name is empty.")
        handle_error(25, action)
        return False

    if platform.system() == "Windows":
        exe_name = "bedrock_server.exe"
    else: 
        exe_name = "bedrock_server"

    if not os.path.exists(os.path.join(server_dir, exe_name)):
        msg_warn(f"'{exe_name}' not found in {server_dir}.")
        handle_error(1, action)
        return False

    msg_debug(f"{server_name} valid")
    return True

def get_server_name(base_dir):
    """Prompts the user for a server name and validates its existence.

    Args:
        base_dir (str): The base directory for servers.

    Returns:
        str: The validated server name, or None if the user cancels.
    """
    action = "get server name"
    while True:
        server_name = input(Fore.MAGENTA + "Enter server name (or type 'exit' to cancel): " + Style.RESET_ALL)

        if server_name == "exit":
            msg_ok("Operation canceled.")
            return None  # User canceled
        if not server_name:
            msg_warn("Server name cannot be empty.")
            continue

        if validate_server(server_name, base_dir):
            msg_debug(f"Server '{server_name}' found.")
            return server_name
        else:
            msg_warn("Please enter a valid server name or type 'exit' to cancel.")

def get_installed_version(server_name, config_dir=None):
    """Gets the installed version of a server from its config.json.

    Args:
      server_name: The server name
      config_dir: The config directory, defaults to .config

    Returns:
        str: The installed version, or "UNKNOWN" if not found or an error occurs.
    """
    if config_dir is None:  # Allow config_dir to be passed in.
        config_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), ".config")
    action = "get installed version"

    msg_debug(f"Getting installed version for server: {server_name}")

    if not server_name:
        msg_error("No server name provided.")
        handle_error(2,action)
        return "UNKNOWN"

    installed_version = manage_server_config(server_name, "installed_version", "read", config_dir=config_dir)

    if installed_version is None:
        msg_warn("No installed_version found in config.json, defaulting to UNKNOWN.")
        installed_version = "UNKNOWN"
    else:
        msg_debug(f"Installed version for {server_name}: {installed_version}")

    return installed_version

def check_server_status(server_name, base_dir):
    """Checks the server status by reading server_output.txt.

    Args:
        server_name (str): The name of the server.
        base_dir (str): base directory.

    Returns:
        str: The server status ("RUNNING", "STARTING", "RESTARTING", "STOPPING", "STOPPED", or "UNKNOWN").
    """
    status = "UNKNOWN"
    log_file = os.path.join(base_dir, server_name, "server_output.txt")
    max_attempts = 20
    attempt = 0
    chunk_size = 500
    max_lines = 5000
    action = "check server status"

    if not server_name:
        msg_error("check_server_status: server_name is empty.")
        handle_error(25, action)
        return "UNKNOWN"

    while not os.path.exists(log_file) and attempt < max_attempts:
        time.sleep(0.5)
        attempt += 1

    if not os.path.exists(log_file):
        return "UNKNOWN"

    try:
      with open(log_file, "r") as f:
          lines = f.readlines()  # Read all lines into a list
    except OSError:
      msg_error(f"Failed to read server log {log_file}")
      return "UNKNOWN"

    total_lines = len(lines)
    read_lines = 0

    while read_lines < max_lines and read_lines < total_lines:
        lines_to_read = min(chunk_size, total_lines - read_lines)
        log_chunk = lines[-(read_lines + lines_to_read):]  # Read chunk from the end
        log_chunk.reverse() #Reverse

        for line in log_chunk:
            line = line.strip()  # Remove leading/trailing whitespace
            if "Server started." in line:
                status = "RUNNING"
                break
            elif "Starting Server" in line:
                status = "STARTING"
                break
            elif "Restarting server in 10 seconds" in line:
                status = "RESTARTING"
                break
            elif "Shutting down server in 10 seconds" in line:
                status = "STOPPING"
                break
            elif "Quit correctly" in line:
                status = "STOPPED"
                break

        if status != "UNKNOWN":
            break
        read_lines += chunk_size


    msg_debug(f"{server_name} status from output file: {status}")
    return status

def get_server_status_from_config(server_name, config_dir=None):
    """Gets the server status from the server's config.json file.

        Args:
            server_name (str): The name of the server.
            config_dir (str, optional): config directory, defaults to .config

        Returns:
            str: The server status ("RUNNING", "STARTING", etc., or "UNKNOWN").
    """
    if config_dir is None:  # Allow config_dir to be passed in.
        config_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), ".config")
    action = "get server status from config"

    if not server_name:
        msg_error("get_server_status_from_config: server_name is empty.")
        handle_error(25,action) #Call handle error, don't return
        return "UNKNOWN"

    status = manage_server_config(server_name, "status", "read", config_dir=config_dir)
    if status is None:
        status = "UNKNOWN"

    return status

def update_server_status_in_config(server_name, base_dir, config_dir=None):
    """Updates the server status in the server's config.json file.

    Args:
        server_name (str): The name of the server.
        base_dir (str): The base directory where servers are stored.
        config_dir (str, optional): config directory, defaults to .config
    """
    if config_dir is None:  # Allow config_dir to be passed in.
        config_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), ".config")
    action = "update server status in config"

    if not server_name:
        msg_error("update_server_status_in_config: server_name is empty.")
        return handle_error(25, action)

    current_status = get_server_status_from_config(server_name, config_dir=config_dir)
    if current_status is None:
        current_status = "UNKNOWN" #Set as unknown

    status = check_server_status(server_name, base_dir)
    if not status:
        status = "UNKNOWN" # Set as unknown

    if current_status == "installed" and status == "UNKNOWN":
        msg_debug("Status is 'installed' and retrieved status is 'UNKNOWN'. Not updating config.json.")
        return  # No error, just don't update

    if manage_server_config(server_name, "status", "write", status, config_dir=config_dir) != 0:
        msg_error("Failed to update server status in config.json")
        return handle_error(14, action)

    msg_debug(f"Successfully updated server status for {server_name} in config.json")
    return 0

def get_world_name(server_name, base_dir):
    """Gets the world name from the server.properties file.

    Args:
        server_name (str): The name of the server.
        base_dir (str): The base directory for servers.

    Returns:
        str: The world name, or None if not found or an error occurs.
    """
    action = "get world name"
    server_properties = os.path.join(base_dir, server_name, "server.properties")

    if not server_name:
        msg_error("get_world_name: server_name is empty")
        handle_error(25,action)
        return None

    msg_debug(f"Getting world name for: {server_name}")

    if not os.path.exists(server_properties):
        msg_error(f"server.properties not found for {server_name}")
        handle_error(11, action)
        return None

    try:
        with open(server_properties, "r") as f:
            for line in f:
                if line.startswith("level-name="):
                    world_name = line.split("=")[1].strip()
                    msg_debug(f"World name: {world_name}")
                    return world_name
    except OSError:
        msg_error("Failed to read server.properties")
        handle_error(11,action)
        return None #Error

    msg_error("Failed to extract world name from server.properties.")
    handle_error(1,action)
    return None

def list_servers_status(base_dir, config_dir=None):
    """Lists the status and version of all servers.

    Args:
        base_dir (str): The base directory where servers are stored.
        config_dir (str, optional): Config dir, defaults to .config
    """
    if config_dir is None:  # Allow config_dir to be passed in.
        config_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), ".config")
    action = "list servers status"
    print(Fore.MAGENTA + "Servers Status:" + Style.RESET_ALL)
    print("---------------------------------------------------")
    print(f"{'SERVER NAME':<20} {'STATUS':<20} {'VERSION':<10}")
    print("---------------------------------------------------")

    if not os.path.isdir(base_dir):
        msg_error(f"Error: {base_dir} does not exist or is not a directory.")
        handle_error(16,action)
        return

    found_servers = False

    for server_path in glob.glob(os.path.join(base_dir, "*")):
        if os.path.isdir(server_path):
            server_name = os.path.basename(server_path)
            status = Fore.RED + "UNKNOWN" + Style.RESET_ALL
            version = Fore.RED + "UNKNOWN" + Style.RESET_ALL

            status = Fore.YELLOW + "CHECKING..." + Style.RESET_ALL

            server_status = get_server_status_from_config(server_name, config_dir=config_dir)
            if server_status:
                status = server_status
            else:
                status = Fore.RED + "ERROR IN STATUS CHECK" + Style.RESET_ALL
                msg_error(f"Error in status check for {server_name}")

            if status == "RUNNING":
                status = Fore.GREEN + status + Style.RESET_ALL
            elif status in ("STARTING", "RESTARTING", "STOPPING"):
                status = Fore.YELLOW + status + Style.RESET_ALL
            elif status == "STOPPED":
                status = Fore.RED + status + Style.RESET_ALL


            retrieved_version = get_installed_version(server_name, config_dir=config_dir)
            if retrieved_version:
                version = Fore.YELLOW + retrieved_version + Style.RESET_ALL
            else:
                version = Fore.RED + "ERROR GETTING VERSION" + Style.RESET_ALL
                msg_error(f"Error retrieving version for {server_name}")

            print(f"{Fore.CYAN}{server_name:<20}{Style.RESET_ALL} {status:<20}  {version:<10}")
            found_servers = True

    if not found_servers:
        print("No servers found.")

    print("---------------------------------------------------")
    print()

def check_service_exists(server_name):
    """Checks if a systemd service file exists for the given server.

    Args:
        server_name (str): The name of the server.

    Returns:
        bool: True if the service file exists, False otherwise.
    """
    if platform.system() != "Linux":
        return False  # systemd is primarily Linux-specific

    service_name = f"bedrock-{server_name}"
    # Corrected path for user services:
    service_file = os.path.join(os.path.expanduser("~"), ".config", "systemd", "user", f"{service_name}.service")
    return os.path.exists(service_file)

def configure_allowlist(server_name, base_dir):
    """Configures the allowlist.json file for a given server.

    Args:
        server_name (str): The name of the server.
        base_dir (str): The base directory where servers are stored.
    """
    server_dir = os.path.join(base_dir, server_name)
    allowlist_file = os.path.join(server_dir, "allowlist.json")
    existing_players = []
    new_players = []
    action = "configure allowlist"

    msg_info("Configuring allowlist.json")

    if not server_name:
        msg_error("configure_allowlist: server_name is empty.")
        return handle_error(25, action)

    # Load existing players
    if os.path.exists(allowlist_file) and os.path.getsize(allowlist_file) > 0:
        try:
            with open(allowlist_file, "r") as f:
                existing_players = json.load(f)  # Load as a list of dicts
            msg_debug("Loaded existing players from allowlist.json.")
        except (OSError, json.JSONDecodeError) as e:
            msg_error(f"Failed to read existing players from allowlist.json: {e}")
            return handle_error(14, action)
    else:
        msg_info("No existing allowlist.json found. A new one will be created.")

    # Ask for new players
    while True:
        player_name = input(Fore.CYAN + "Enter a player's name to add to the allowlist (or type 'done' to finish): " + Style.RESET_ALL)
        if player_name == "done":
            break
        elif not player_name:
            msg_warn("Player name cannot be empty. Please try again.")
            continue

        # Check for duplicates
        if any(player["name"] == player_name for player in existing_players):
            msg_warn(f"Player '{player_name}' is already in the allowlist. Skipping.")
            continue

        while True: # Loop to ensure valid input
            ignore_limit_input = input(Fore.MAGENTA + "Should this player ignore the player limit? (y/n): " + Style.RESET_ALL).lower()
            if ignore_limit_input in ("yes", "y"):
                ignore_limit = True
                break
            elif ignore_limit_input in ("no", "n", ""):  # Treat empty as "no"
                ignore_limit = False
                break
            else:
                msg_warn("Invalid input. Please answer 'yes' or 'no'.")

        new_players.append({"ignoresPlayerLimit": ignore_limit, "name": player_name})

    # Combine and save
    if new_players:
        updated_allowlist = existing_players + new_players  # Combine lists
        try:
            with open(allowlist_file, "w") as f:
                json.dump(updated_allowlist, f, indent=4)  # Pretty-print
        except OSError as e:
            msg_error(f"Failed to save updated allowlist to {allowlist_file}: {e}")
            return handle_error(14, action)

        msg_ok(f"Updated allowlist.json with {len(new_players)} new players.")
    else:
        msg_info("No new players were added. Existing allowlist.json was not modified.")

    return 0

def configure_permissions(server_name, xuid, player, permission, base_dir):
    """Updates permissions.json with a player and their permission level.

    Args:
        server_name (str): The name of the server.
        xuid (str): The player's XUID.
        permission (str): The permission level ("operator", "member", "visitor").
        base_dir (str): The base directory where servers are stored.
    """
    server_dir = os.path.join(base_dir, server_name)
    permissions_file = os.path.join(server_dir, "permissions.json")
    action = "configure permissions"

    if not server_name:
        msg_error("configure_permissions: server_name is empty.")
        return handle_error(25, action)
    if not xuid:
        msg_error("configure_permissions: xuid is empty.")
        return handle_error(5, action)
    if not permission:
        msg_error("configure_permissions: permission is empty.")
        return handle_error(5, action)

    if not os.path.isdir(server_dir):
        msg_error(f"Server directory not found: {server_dir}")
        return handle_error(16, action)

    if not os.path.exists(permissions_file):
        try:
            with open(permissions_file, "w") as f:
                json.dump([], f)  # Create an empty JSON array
        except OSError:
            msg_error("Failed to initialize permissions.json")
            return handle_error(14, action)

    try:
        with open(permissions_file, "r") as f:
            permissions_data = json.load(f)
    except (OSError, json.JSONDecodeError):
        msg_error("Failed to read or parse permissions.json.")
        return handle_error(14, action)

    # Check if the player already exists
    player_exists = False
    for i, player in enumerate(permissions_data):
        if player["xuid"] == xuid:
            player_exists = True
            if player["permission"] == permission:
                msg_warn(f"Player: {player} with permission '{permission}' is already in permissions.json.")
                return 0  # Already exists with the same permission
            else:
                # Update existing player's permission
                permissions_data[i]["permission"] = permission
                msg_ok(f"Updated player: {player} to '{permission}' in permissions.json.")
                break # Exit loop

    if not player_exists:
        # Add the new player
        new_player = {"permission": permission, "xuid": xuid}
        permissions_data.append(new_player)
        msg_ok(f"Added player: {player} as '{permission}' in permissions.json.")

    # Write the updated data back to the file
    try:
        with open(permissions_file, "w") as f:
            json.dump(permissions_data, f, indent=4)
    except OSError:
        msg_error("Failed to update permissions.json")
        return handle_error(14, action)

    return 0

def select_player_for_permission(server_name, base_dir, config_dir = None):
    """Selects a player and permission level, then calls configure_permissions.

    Args:
        server_name (str): The name of the server.
        base_dir (str): The base directory for servers.
        config_dir (str, optional): config directory, defaults to .config
    """
    if config_dir is None:
        config_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), ".config")
    players_file = os.path.join(config_dir, "players.json")
    action = "select player for permission"

    if not server_name:
        msg_error("select_player_for_permission: server_name is empty.")
        return handle_error(25, action)

    if not os.path.exists(players_file):
        msg_error("No players.json file found!")
        return handle_error(14, action)

    try:
        with open(players_file, "r") as f:
            players_data = json.load(f)
    except (OSError, json.JSONDecodeError):
        msg_error("Failed to read or parse players.json.")
        return handle_error(14, action)

    if not players_data.get("players"):  # Check if "players" key exists and is not empty
        msg_warn("No players found in players.json!")
        return 0

    # Create lists for player names and XUIDs
    player_names = [player["name"] for player in players_data["players"]]
    xuids = [player["xuid"] for player in players_data["players"]]
     # Display player selection menu
    print(Fore.CYAN + "Select a player to add to permissions.json:" + Style.RESET_ALL)
    for i, name in enumerate(player_names):
        print(f"{i + 1}. {name}")
    print(f"{len(player_names) + 1}. Cancel")

    while True:
        try:
            choice = int(input(Fore.CYAN + "Select a player: " + Style.RESET_ALL))
            if 1 <= choice <= len(player_names):
                selected_name = player_names[choice - 1]
                selected_xuid = xuids[choice - 1]
                break
            elif choice == len(player_names) + 1:
                msg_ok("Operation canceled.")
                return 0
            else:
                print("Invalid choice. Please select a valid number.")
        except ValueError:
            print("Invalid input. Please enter a number.")

    # Prompt for permission level
    print(Fore.CYAN + "Select a permission level:" + Style.RESET_ALL)
    print("1. operator")
    print("2. member")
    print("3. visitor")
    print("4. cancel")

    while True:
        try:
            choice = int(input(Fore.CYAN + "Choose permission: " + Style.RESET_ALL))
            if choice == 1:
                permission = "operator"
                break
            elif choice == 2:
                permission = "member"
                break
            elif choice == 3:
                permission = "visitor"
                break
            elif choice == 4:
                msg_ok("Operation canceled.")
                return 0  # User canceled
            else:
                print("Invalid choice. Please select a valid number.")
        except ValueError:
            print("Invalid input. Please enter a number.")

    # Call the function to add/update the player in permissions.json
    return configure_permissions(server_name, selected_xuid, selected_name, permission, base_dir)

def select_option(prompt, default_value, *options):
    """Presents a selection menu to the user.

    Args:
        prompt (str): The prompt to display.
        default_value (str): The default value if the user presses Enter.
        options (tuple): The options to present.

    Returns:
        str: The selected option.
    """
    print(Fore.MAGENTA + prompt + Style.RESET_ALL)
    for i, option in enumerate(options):
        print(f"{i + 1}. {option}")

    while True:
        try:
            choice = input(Fore.MAGENTA + f"Select an option [Default: {default_value}]: " + Style.RESET_ALL)
            if not choice:
                print(f"Using default: {default_value}")
                return default_value
            choice_num = int(choice)
            if 1 <= choice_num <= len(options):
                return options[choice_num - 1]
            else:
                msg_error("Invalid selection. Please try again.")
        except ValueError:
            msg_error("Invalid input. Please enter a number.")

def modify_server_properties(server_properties, property_name, property_value):
    """Modifies or adds a property in the server.properties file.

    Args:
        server_properties (str): Path to the server.properties file.
        property_name (str): The name of the property.
        property_value (str): The value of the property.

    Returns:
       int: 0 on success, error code on failure.
    """
    action = "modify server properties"

    if not server_properties:
        msg_error("modify_server_properties: server_properties file path is empty.")
        return handle_error(14, action)
    if not os.path.exists(server_properties):
        msg_error(f"modify_server_properties: server_properties file does not exist: {server_properties}")
        return handle_error(14, action)
    if not property_name:
        msg_error("modify_server_properties: property_name is empty.")
        return handle_error(2, action)
    if any(ord(c) < 32 for c in property_value): #Check for control characters
        msg_error("modify_server_properties: property_value contains control characters.")
        return handle_error(5, action)

    try:
        with open(server_properties, "r") as f:
            lines = f.readlines()

        property_found = False
        for i, line in enumerate(lines):
            if line.startswith(property_name + "="):
                lines[i] = f"{property_name}={property_value}\n"
                property_found = True
                msg_debug(f"Updated {property_name} to {property_value}")
                break

        if not property_found:
            lines.append(f"{property_name}={property_value}\n")
            msg_ok(f"Added {property_name} with value {property_value}")

        with open(server_properties, "w") as f:
            f.writelines(lines)
        return 0

    except OSError as e:
        msg_error(f"Failed to modify property '{property_name}' in '{server_properties}': {e}")
        return handle_error(14, action)

def configure_server_properties(server_name, base_dir):
    """Configures common server properties interactively.

    Args:
        server_name (str): The name of the server.
        base_dir (str): The base directory where servers are stored.
    """
    server_dir = os.path.join(base_dir, server_name)
    action = "configure server properties"
    msg_info(f"Configuring server properties for '{server_name}'")

    if not server_name:
        msg_error("configure_server_properties: server_name is empty.")
        return handle_error(25, action)

    server_properties = os.path.join(server_dir, "server.properties")
    if not os.path.exists(server_properties):
        msg_error("server.properties not found!")
        return handle_error(11, action)
    #Default values
    DEFAULT_PORT = "19132"
    DEFAULT_IPV6_PORT = "19133"

    # Read existing properties
    current_properties = {}
    try:
        with open(server_properties, "r") as f:
            for line in f:
                line = line.strip()
                if line and "=" in line:  # Ensure line is not empty and has "="
                    key, value = line.split("=", 1)  # Split only on the first "="
                    current_properties[key] = value
    except OSError as e:
        msg_error(f"Failed to read server.properties {e}")
        return handle_error(14, action)  # Failed to configure server properties


    # Prompts with validation and defaults
    input_server_name = input(Fore.CYAN + f"Enter server name [Default: {current_properties.get('server-name', '')}]: " + Style.RESET_ALL)
    input_server_name = input_server_name or current_properties.get('server-name', '')
    while ";" in input_server_name:
        msg_error("Server name cannot contain semicolons.")
        input_server_name = input(Fore.CYAN + f"Enter server name [Default: {current_properties.get('server-name', '')}]: " + Style.RESET_ALL)
        input_server_name = input_server_name or current_properties.get('server-name', '')

    input_level_name = input(Fore.CYAN + f"Enter level name [Default: {current_properties.get('level-name', '')}]: " + Style.RESET_ALL)
    input_level_name = input_level_name or current_properties.get('level-name', '')
    input_level_name = input_level_name.replace(" ", "_")
    while not re.match(r"^[a-zA-Z0-9_-]+$", input_level_name):
        msg_error("Invalid level-name. Only alphanumeric characters, hyphens, and underscores are allowed (spaces converted to underscores).")
        input_level_name = input(Fore.CYAN + f"Enter level name [Default: {current_properties.get('level-name', '')}]: " + Style.RESET_ALL)
        input_level_name = input_level_name or current_properties.get('level-name', '')
        input_level_name = input_level_name.replace(" ", "_")

    input_gamemode = select_option("Select gamemode:", current_properties.get('gamemode', 'survival'), "survival", "creative", "adventure")
    input_difficulty = select_option("Select difficulty:", current_properties.get('difficulty', 'easy'), "peaceful", "easy", "normal", "hard")
    input_allow_cheats = select_option("Allow cheats:", current_properties.get('allow-cheats', 'false'), "true", "false")

    while True:
        input_port = input(Fore.CYAN + f"Enter IPV4 Port [Default: {current_properties.get('server-port', DEFAULT_PORT)}]: " + Style.RESET_ALL)
        input_port = input_port or current_properties.get('server-port', DEFAULT_PORT)
        if re.match(r"^[0-9]+$", input_port) and 1024 <= int(input_port) <= 65535:
            break
        msg_error("Invalid port number. Please enter a number between 1024 and 65535.")

    while True:
        input_port_v6 = input(Fore.CYAN + f"Enter IPV6 Port [Default: {current_properties.get('server-portv6', DEFAULT_IPV6_PORT)}]: " + Style.RESET_ALL)
        input_port_v6 = input_port_v6 or current_properties.get('server-portv6', DEFAULT_IPV6_PORT)
        if re.match(r"^[0-9]+$", input_port_v6) and 1024 <= int(input_port_v6) <= 65535:
            break
        msg_error("Invalid IPV6 port number. Please enter a number between 1024 and 65535.")

    input_lan_visibility = select_option("Enable LAN visibility:", current_properties.get('enable-lan-visibility', 'true'), "true", "false")
    input_allow_list = select_option("Enable allow list:", current_properties.get('allow-list', 'false'), "true", "false")

    while True:
        input_max_players = input(Fore.CYAN + f"Enter max players [Default: {current_properties.get('max-players', '10')}]: " + Style.RESET_ALL)
        input_max_players = input_max_players or current_properties.get('max-players', '10')
        if re.match(r"^[0-9]+$", input_max_players):
            break
        msg_error("Invalid number for max players.")

    input_permission_level = select_option("Select default permission level:", current_properties.get('default-player-permission-level', 'member'), "visitor", "member", "operator")

    while True:
        input_render_distance = input(Fore.CYAN + f"Default render distance [Default: {current_properties.get('view-distance', '10')}]: " + Style.RESET_ALL)
        input_render_distance = input_render_distance or current_properties.get('view-distance', '10')
        if re.match(r"^[0-9]+$", input_render_distance) and int(input_render_distance) >= 5:
            break
        msg_error("Invalid render distance. Please enter a number greater than or equal to 5.")

    while True:
        input_tick_distance = input(Fore.CYAN + f"Default tick distance [Default: {current_properties.get('tick-distance', '4')}]: " + Style.RESET_ALL)
        input_tick_distance = input_tick_distance or current_properties.get('tick-distance', '4')
        if re.match(r"^[0-9]+$", input_tick_distance) and 4 <= int(input_tick_distance) <= 12:
            break
        msg_error("Invalid tick distance. Please enter a number between 4 and 12.")
    input_level_seed = input(Fore.CYAN + f"Enter level seed: " + Style.RESET_ALL) # No default or validation
    input_online_mode = select_option("Enable online mode:", current_properties.get('online-mode', 'true'), "true", "false")
    input_texturepack_required = select_option("Require texture pack:", current_properties.get('texturepack-required', 'false'), "true", "false")


    # Update properties
    modify_server_properties(server_properties, "server-name", input_server_name)
    modify_server_properties(server_properties, "level-name", input_level_name)
    modify_server_properties(server_properties, "gamemode", input_gamemode)
    modify_server_properties(server_properties, "difficulty", input_difficulty)
    modify_server_properties(server_properties, "allow-cheats", input_allow_cheats)
    modify_server_properties(server_properties, "server-port", input_port)
    modify_server_properties(server_properties, "server-portv6", input_port_v6)
    modify_server_properties(server_properties, "enable-lan-visibility", input_lan_visibility)
    modify_server_properties(server_properties, "allow-list", input_allow_list)
    modify_server_properties(server_properties, "max-players", input_max_players)
    modify_server_properties(server_properties, "default-player-permission-level", input_permission_level)
    modify_server_properties(server_properties, "view-distance", input_render_distance)
    modify_server_properties(server_properties, "tick-distance", input_tick_distance)
    modify_server_properties(server_properties, "level-seed", input_level_seed)
    modify_server_properties(server_properties, "online-mode", input_online_mode)
    modify_server_properties(server_properties, "texturepack-required", input_texturepack_required)


    msg_ok("Server properties configured")
    return 0

def lookup_bedrock_download_url(target_version):
    """Finds the Bedrock server download URL.

    Args:
        target_version (str):  "LATEST", "PREVIEW", a specific version string
            (e.g., "1.20.1.2"), or a specific preview version string (e.g.,
            "1.20.1.2-preview").

    Returns:
        str: The download URL, or None if not found.
    """
    action = "lookup bedrock download url"
    download_page = "https://www.minecraft.net/en-us/download/server/bedrock"
    version_type = ""
    custom_version = ""
    if not target_version:
        msg_error("lookup_bedrock_download_url: target_version is empty.")
        handle_error(2, action)
        return None

    target_version_upper = target_version.upper()

    if target_version_upper == "PREVIEW":
        version_type = "PREVIEW"
        msg_info("Target version is 'preview'.")
    elif target_version_upper == "LATEST":
        version_type = "LATEST"
        msg_info("Target version is 'latest'.")
    elif target_version_upper.endswith("-PREVIEW"):
        version_type = "PREVIEW"
        custom_version = target_version[:-8]
        msg_info(f"Target version is a specific preview version: {custom_version}.")
    else:
        version_type = "LATEST"
        custom_version = target_version
        msg_info(f"Target version is a specific stable version: {custom_version}.")

    # OS-specific download URL regex
    if platform.system() == "Linux":
        if version_type == "PREVIEW":
            regex = r'<a[^>]+href="([^"]+)"[^>]+data-platform="serverBedrockPreviewLinux"'
        else:
            regex = r'<a[^>]+href="([^"]+)"[^>]+data-platform="serverBedrockLinux"'
    elif platform.system() == "Windows":
        if version_type == "PREVIEW":
            regex = r'<a[^>]+href="([^"]+)"[^>]+data-platform="serverBedrockPreviewWindows"'
        else:
            regex = r'<a[^>]+href="([^"]+)"[^>]+data-platform="serverBedrockWindows"'
    else:
        msg_error("Unsupported operating system for server download.")
        return None

    try:
        headers = {
            "User-Agent": "zvortex11325/bedrock-server-manager",
            "Accept-Language": "en-US,en;q=0.5",
            "Accept": "text/html",
        }
        response = requests.get(download_page, headers=headers, timeout=10)
        response.raise_for_status()
        download_page_content = response.text
    except requests.exceptions.RequestException as e:
        msg_error(f"Failed to fetch download page content: {e}")
        return None

    match = re.search(regex, download_page_content)

    if match:
        resolved_download_url = match.group(1)
        if custom_version:
            # Construct custom URL.
            resolved_download_url = re.sub(
                r"(bedrock-server-)[^/]+(\.zip)",
                rf"\1{custom_version}\2",
                resolved_download_url,
            )
        msg_ok("Resolved download URL lookup OK.")
        return resolved_download_url
    else:
        msg_error(f"Could not find a valid download URL for {version_type}.")
        return None

def get_version_from_url(download_url):
    """Extracts the version from the download URL.

    Args:
        download_url (str): The Bedrock server download URL.

    Returns:
        str: The version string (e.g., "1.20.1.2"), or None on error.
    """
    action = "get version from url"
    if not download_url:
        msg_error("download_url is empty.")
        handle_error(2,action)
        return None

    match = re.search(r"bedrock-server-([0-9.]+)", download_url)
    if match:
        version = match.group(1)
        return version.rstrip('.')  # Remove trailing dot if present
    else:
        msg_error("Failed to extract version from URL.")
        return None
        
def write_version_config(server_name, installed_version, config_dir=None):
    """Writes the installed version to the server's config.json.

    Args:
        server_name (str): The name of the server.
        installed_version (str): The installed version.
        config_dir (str, optional): config directory, defaults to .config.
    """
    if config_dir is None:
        config_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), ".config")
    action = "write version config"

    if not server_name:
        msg_error("write_version_config: server_name is empty")
        return handle_error(25, action)

    if not installed_version:
        msg_warn("write_version_config: installed_version is empty.  Writing empty string to config.")

    if manage_server_config(server_name, "installed_version", "write", installed_version, config_dir=config_dir) != 0:
        msg_error(f"Failed to update installed_version in config.json for server: {server_name}")
        return handle_error(14, action)
    else:
        msg_ok(f"Successfully updated installed_version in config.json for server: {server_name}")
        return 0

def prune_old_downloads(download_dir, download_keep):
    """Removes old downloaded server ZIP files, keeping the most recent ones.

    Args:
        download_dir (str): The directory where downloads are stored.
        download_keep (int): How many downloads to keep
    """
    action = "prune old downloads"

    if not download_dir:
        msg_error("prune_old_downloads: download_dir is empty.")
        return handle_error(2, action)

    if not os.path.isdir(download_dir):
        msg_warn(f"prune_old_downloads: '{download_dir}' is not a directory or does not exist. Skipping cleanup.")
        return 0

    msg_info("Cleaning up old Bedrock server downloads...")

    try:
        # Find all zip files and sort by modification time (oldest first)
        download_files = sorted(
            glob.glob(os.path.join(download_dir, "bedrock_server_*.zip")),
            key=os.path.getmtime,
        )

        msg_debug(f"Files found: {download_files} in Dir: {download_dir}")

        
        download_keep = int(download_keep)
        num_files = len(download_files)
        if num_files > download_keep:
            msg_debug(f"Found {num_files} old server downloads. Keeping the {download_keep} most recent.")
            files_to_delete = download_files[:-download_keep]  # All except the last 'download_keep' files
            if files_to_delete:
                msg_debug(f"Files to delete: {files_to_delete}")
                for file_path in files_to_delete:
                    try:
                        os.remove(file_path)
                    except OSError as e:
                        msg_error(f"Failed to delete old server download: {e}")
                        return handle_error(1, action)
                msg_ok("Old server downloads deleted.")
            else:
                msg_debug(f"No old server downloads to delete (keeping {download_keep} most recent).")
        else:
            msg_debug(f"Found {num_files} or fewer old server downloads. Keeping all.")
    except OSError as e:
        msg_error(f"An error occurred while listing files: {e}")
        return handle_error(1,action)

    return 0

def download_server_zip_file(download_url, zip_file):
    """Downloads the server ZIP file.

    Args:
        download_url (str): The URL to download from.
        zip_file (str): The path to save the downloaded file to.

    Returns:
        int: 0 on success, an error code on failure.
    """
    action = "download server zip file"

    if not download_url:
        msg_error("download_server_zip_file: download_url is empty.")
        return handle_error(2, action)
    if not zip_file:
        msg_error("download_server_zip_file: zip_file is empty.")
        return handle_error(2, action)

    msg_info(f"Resolved download URL: {download_url}")

    try:
        headers = {"User-Agent": "zvortex11325/bedrock-server-manager"}
        response = requests.get(download_url, headers=headers, stream=True, timeout=30)
        response.raise_for_status()

        with open(zip_file, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)

        msg_info(f"Downloaded Bedrock server ZIP to: {zip_file}")
        return 0
    except requests.exceptions.RequestException as e:
        msg_error(f"Failed to download Bedrock server from {download_url}: {e}")
        return handle_error(15, action)

def extract_server_files_from_zip(zip_file, server_dir, in_update):
    """Extracts server files from the ZIP, handling updates correctly.

    Args:
        zip_file (str): Path to the ZIP file.
        server_dir (str): Directory to extract to.
        in_update (bool): True if this is an update, False for a fresh install.

    Returns:
        int: 0 on success, error code on failure.
    """
    action = "extract server files from zip"

    if not zip_file:
        msg_error("extract_server_files_from_zip: zip_file is empty.")
        return handle_error(2, action)
    if not server_dir:
        msg_error("extract_server_files_from_zip: server_dir is empty.")
        return handle_error(2, action)

    try:
        with zipfile.ZipFile(zip_file, "r") as zip_ref:
            if in_update:
                msg_info("Extracting server files (update), excluding critical files...")
                files_to_exclude = {"worlds/", "allowlist.json", "permissions.json", "server.properties"}

                for zip_info in zip_ref.infolist():
                    normalized_filename = zip_info.filename.replace("\\", "/")
                    extract = True

                    for exclude_item in files_to_exclude:
                        if normalized_filename.startswith(exclude_item):
                            msg_debug(f"Skipping extraction (excluded): {normalized_filename}")
                            extract = False
                            break 

                    if extract:
                        target_path = os.path.join(server_dir, zip_info.filename)

                        if zip_info.is_dir():
                            os.makedirs(target_path, exist_ok=True)
                        else:
                            os.makedirs(os.path.dirname(target_path), exist_ok=True)
                            zip_ref.extract(zip_info, server_dir)

            else:
                msg_info("Extracting server files for fresh installation...")
                zip_ref.extractall(server_dir)

        msg_ok("Server files extracted successfully.")
        return 0
    except zipfile.BadZipFile:
        msg_error(f"Failed to extract server files: {zip_file} is not a valid ZIP file.")
        return handle_error(15, action)
    except OSError as e:
        msg_error(f"Failed to extract server files: {e}")
        return handle_error(15, action)

def set_server_folder_permissions(server_dir):
    """Sets appropriate owner:group and permissions on the server directory.

    Args:
        server_dir (str): The server directory.

    Returns:
        int: 0 on success, error code on failure.
    """
    action = "set server folder permissions"

    if not server_dir:
        msg_error("set_server_folder_permissions: server_dir is empty.")
        return handle_error(2, action)
    if not os.path.isdir(server_dir):
        msg_error(f"set_server_folder_permissions: server_dir '{server_dir}' does not exist or is not a directory.")
        return handle_error(16, action)

    if platform.system() == "Linux":
        try:
            real_user = os.getuid()
            real_group = os.getgid()
            msg_info(f"Setting folder permissions to {real_user}:{real_group}")

            # Use os.walk for recursive permission setting
            for root, dirs, files in os.walk(server_dir):
                for d in dirs:
                    os.chown(os.path.join(root, d), real_user, real_group)
                    os.chmod(os.path.join(root, d), 0o775)
                for f in files:
                    file_path = os.path.join(root, f)
                    os.chown(file_path, real_user, real_group)
                    # --- Check if the file is 'bedrock_server' ---
                    if os.path.basename(file_path) == "bedrock_server":
                        # Add execute permission for
                        os.chmod(file_path, 0o755)
                    else:
                        os.chmod(file_path, 0o664)
            msg_ok("Folder permissions set.")
            return 0
        except OSError as e:
            msg_error(f"Failed to set server folder permissions: {e}")
            return handle_error(1, action)

    elif platform.system() == "Windows":
        msg_info("Setting folder permissions for Windows...")
        try:
            for root, dirs, files in os.walk(server_dir):
                for d in dirs:
                    dir_path = os.path.join(root, d)
                    current_permissions = os.stat(dir_path).st_mode
                    if not (current_permissions & stat.S_IWRITE):
                        os.chmod(dir_path, current_permissions | stat.S_IWRITE)
                for f in files:
                    file_path = os.path.join(root, f)
                    current_permissions = os.stat(file_path).st_mode
                    if not (current_permissions & stat.S_IWRITE):
                         os.chmod(file_path, current_permissions | stat.S_IWRITE)
            msg_ok("Folder permissions set for Windows (ensured write access).")
            return 0
        except OSError as e:
            msg_error(f"Failed to set folder permissions on Windows: {e}")
            return handle_error(1, action)

    else:
        msg_warn("set_server_folder_permissions: Unsupported operating system.")
        return 1

def download_bedrock_server(server_name, base_dir, target_version="LATEST", in_update=False, installed_version="undefined", config_dir = None):
    """Downloads and installs the Bedrock server.

    Args:
        server_name (str): The name of the server.
        base_dir (str): The base directory for servers.
        target_version (str): "LATEST", "PREVIEW", or a specific version.
        in_update (bool): True if this is an update, False for new install.
        installed_version: The currently installed version
        config_dir (str, optional): Config dir, defaults to .config.

    Returns:
        int: 0 on success, an error code on failure.
    """

    if config_dir is None:
        config_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), ".config")
    server_dir = os.path.join(base_dir, server_name)
    was_running = False
    action = "download bedrock server"

    if not server_name:
        msg_error("download_bedrock_server: server_name is empty.")
        return handle_error(25, action)

    if check_internet_connectivity() != 0:
        msg_warn("Internet connectivity check failed. Cannot download server.")
        return handle_error(24, action)

    msg_info(f"You chose server version: {target_version}")

    try:
        os.makedirs(server_dir, exist_ok=True)
    except OSError:
        msg_error(f"Failed to create server directory: {server_dir}")
        return handle_error(16, action)
    try:
        os.makedirs(os.path.join(os.path.dirname(os.path.realpath(__file__)), ".downloads"), exist_ok=True)
    except OSError:
        msg_error("Failed to create downloads directory")
        return handle_error(16, action)


    download_url = lookup_bedrock_download_url(target_version)
    if not download_url:
        msg_error("Failed to lookup download URL. Cannot proceed.")
        return handle_error(15, action)

    current_version = get_version_from_url(download_url)
    if not current_version:
        msg_error("Failed to extract version from URL.")
        return handle_error(1, action)

    # Determine download directory
    download_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), ".downloads")
    if target_version.upper() == "LATEST":
        download_dir = os.path.join(download_dir, "stable")
    elif target_version.upper() == "PREVIEW":
        download_dir = os.path.join(download_dir, "preview")

    try:
        os.makedirs(download_dir, exist_ok=True)
    except OSError:
        msg_error(f"Failed to create download subdirectory: {download_dir}")
        return handle_error(16, action)

    zip_file = os.path.join(download_dir, f"bedrock_server_{current_version}.zip")

    if os.path.exists(zip_file):
        msg_ok(f"Bedrock server version {current_version} is already downloaded. Skipping download.")
    else:
        msg_info("Server ZIP not found. Proceeding with download.")
        if download_server_zip_file(download_url, zip_file) != 0:
            msg_error("Failed to download server ZIP file.")
            return handle_error(15, action)

    config = default_config() # Get config for download keep
    # Cleanup old downloads
    prune_old_downloads(download_dir, config['DOWNLOAD_KEEP'])

    # Stop server if running for update
    if in_update:
        was_running = stop_server_if_running(server_name, base_dir)

    # Backup server before update
    backup_success = False
    if in_update:
        if backup_all(server_name, base_dir, change_status=False, script_dir=script_dir, config_dir=config_dir) == 0:
           backup_success = True

    if extract_server_files_from_zip(zip_file, server_dir, in_update) != 0:
        msg_error("Failed to extract server files.")
        return handle_error(15, action)

    # Restore critical files after update
    if in_update and backup_success:
        restore_all(server_name, base_dir, False)

    if set_server_folder_permissions(server_dir) != 0:
        msg_error("Failed to set server folder permissions")

    if write_version_config(server_name, current_version, config_dir=config_dir) != 0:
        msg_error("Failed to write version to config.json")
        return handle_error(14, action)


    msg_ok(f"Installed Bedrock server version: {current_version}")

    # Start server if it was running
    if was_running:
        start_server_if_was_running(server_name, was_running, base_dir)

    msg_info("Bedrock server download process finished")
    return 0

def install_new_server(base_dir, config_dir = None):
    """Installs a new server.

    Args:
        base_dir (str): The base directory for servers.
        config_dir (str, optional): config directory, defaults to .config
    """
    if config_dir is None:
        config_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), ".config")
    action = "install new server"
    while True:
        server_name = input("Enter server folder name: ")
        if re.match(r"^[a-zA-Z0-9_-]+$", server_name):
            break
        else:
            msg_warn("Invalid server folder name. Only alphanumeric characters, hyphens, and underscores are allowed.")

    if os.path.exists(os.path.join(base_dir, server_name)):
        msg_warn(Fore.RED + f"Folder '{server_name}' already exists, continue?" + Style.RESET_ALL)
        while True:
            continue_response = input(Fore.RED + f"Folder '{server_name}' already exists, continue? (y/n): " + Style.RESET_ALL).lower()
            if continue_response in ("yes", "y"):
                if delete_server(server_name, base_dir, config_dir) != 0:
                  msg_error(f"Failed to delete existing server '{server_name}'.")
                  return handle_error(21, action)
                break
            elif continue_response in ("no", "n", ""):
                msg_warn("Exiting")
                return handle_error(25, action)  # Invalid server name (user cancelled)
            else:
                msg_warn("Invalid input. Please answer 'yes' or 'no'.")

    if manage_server_config(server_name, "server_name", "write", server_name, config_dir=config_dir) != 0:
        msg_error(f"Failed to update server name in config.json for server: {server_name}")
        return handle_error(14, action)
    else:
        msg_ok(f"Successfully updated server name in config.json for server: {server_name}")

    target_version = input(Fore.MAGENTA + "Enter server version (e.g., LATEST or PREVIEW): " + Style.RESET_ALL)

    if manage_server_config(server_name, "target_version", "write", target_version, config_dir=config_dir) != 0:
        msg_error(f"Failed to update target version in config.json for server: {server_name}")
        return handle_error(14, action)
    else:
        msg_ok(f"Successfully updated target version in config.json for server: {server_name}")

    try:
        os.makedirs(os.path.join(base_dir, server_name), exist_ok=True)
    except OSError as e:
        msg_error(f"Failed to create server directory: {os.path.join(base_dir, server_name)}: {e}")
        return handle_error(16, action)

    download_status = download_bedrock_server(server_name, base_dir, target_version=target_version, config_dir=config_dir)

    if download_status == 0:
        msg_ok(f"Server {server_name} installed")
    else:
        msg_error("Failed to install server.")
        return handle_error(9, action)

    if configure_server_properties(server_name, base_dir) != 0:
        msg_error("Failed to configure server properties")

    while True:
        allowlist_response = input("Configure allow-list? (y/n): ").lower()
        if allowlist_response in ("yes", "y"):
            if configure_allowlist(server_name, base_dir) != 0:
                msg_error("Failed to configure allowlist")
            break
        elif allowlist_response in ("no", "n", ""):
            msg_info("Skipping allow-list configuration.")
            break
        else:
            msg_warn("Invalid input. Please answer 'yes' or 'no'.")

    while True:
        permissions_response = input("Configure permissions? (y/n): ").lower()
        if permissions_response in ("yes", "y"):
            if select_player_for_permission(server_name, base_dir, config_dir=config_dir) != 0:
                msg_error("Failed to configure permissions")
            break
        elif permissions_response in ("no", "n", ""):
            msg_info("Skipping permissions configuration.")
            break
        else:
            msg_warn("Invalid input. Please answer 'yes' or 'no'.")

    # Create a service
    if create_service(server_name, base_dir, script_direct) != 0:
        msg_error("Failed to create service")


    while True:
        start_choice = input(f"Do you want to start the server '{server_name}' now? (y/n): ").lower()
        if start_choice in ("yes", "y"):
            # Start the server
            if start_server(server_name, base_dir) != 0:
                msg_error("Failed to start server")
            break
        elif start_choice in ("no", "n", ""):
            msg_info(f"Server '{server_name}' not started.")
            break
        else:
            msg_warn("Invalid input. Please answer 'yes' or 'no'.")
    return 0

def update_server(server_name, base_dir, config_dir = None):
    """Updates an existing server.

    Args:
        server_name (str): The name of the server to update.
        base_dir (str): The base directory for servers.
        config_dir (str, optional): Config dir, defaults to .config
    Returns:
        int: 0 on success, an error code on failure.
    """
    if config_dir is None:
        config_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), ".config")
    server_dir = os.path.join(base_dir, server_name)
    action = "update server"

    if not server_name:
        msg_error("update_server: server_name is empty.")
        return handle_error(25, action)

    if check_internet_connectivity():
        msg_warn("Internet connectivity check failed. Cannot check for updates.")
        return 0  # Return early

    msg_info(f"Starting update process for server: {server_name}")

    # Check if the server is running
    if is_server_running(server_name, base_dir):
         send_command(server_name, "say Checking for server updates..")

    installed_version = get_installed_version(server_name, config_dir=config_dir)
    if installed_version == "UNKNOWN":
        msg_error("Failed to get the installed version.")
        return handle_error(1, action)


    target_version = manage_server_config(server_name, "target_version", "read", config_dir=config_dir)
    if target_version is None:
        msg_error("Failed to read target_version from config. Using 'LATEST'.")
        target_version = "LATEST"

    download_url = lookup_bedrock_download_url(target_version)
    if not download_url:
        msg_error("Failed to lookup download URL. Cannot proceed.")
        return handle_error(15, action)

    current_version = get_version_from_url(download_url)
    if not current_version:
        msg_error("Failed to extract version from URL.")
        return handle_error(1, action)


    if no_update_needed(server_name, installed_version, current_version, config_dir=config_dir):
        msg_info(f"No update needed for server '{server_name}'.")
        return 0

    download_status = download_bedrock_server(server_name, base_dir, target_version=target_version, in_update=True, config_dir=config_dir)

    if download_status == 0:
        msg_ok(f"Server '{server_name}' updated to version: {current_version}")
        return 0
    else:
        msg_error("Failed to update server.")
        return handle_error(9, action)

def no_update_needed(server_name, installed_version, current_version, config_dir=None):
    """Checks if an update is needed.

    Args:
        server_name (str): The name of the server.
        installed_version (str): The currently installed version.
        current_version (str): The latest available version.
        config_dir (str, optional): config directory, defaults to .config.

    Returns:
        bool: True if no update is needed, False otherwise.
    """

    if config_dir is None:
        config_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), ".config")
    action = "check no update needed"

    if not server_name:
      msg_error("no_update_needed: server_name is empty.")
      return handle_error(25, action)
    if not installed_version:
      msg_warn("no_update_needed: installed_version is empty. Assuming update is needed.")
      return False # Update is needed
    if not current_version:
      msg_warn("no_update_needed: current_version is empty.  Assuming update is needed.")
      return False # Update is needed

    if installed_version == current_version:
        return True  # No update needed
    return False  # Update needed

def enable_user_lingering():
    """Enables user lingering on Linux (systemd systems).

    This is required for user services to start on boot and run after logout.
    On non-Linux systems, this function does nothing.
    """
    action = "enable user lingering"
    if platform.system() != "Linux":
        return

    username = getpass.getuser()

    # Check if lingering is already enabled
    try:
        result = subprocess.run(
            ["loginctl", "show-user", username],
            capture_output=True,
            text=True,
            check=False,
        )
        if "Linger=yes" in result.stdout:
            msg_info(f"Lingering is already enabled for {username}")
            return 0
    except FileNotFoundError:
        msg_warn("loginctl command not found.  Lingering cannot be checked/enabled.")
        return #If loginctl isn't found

    while True:
        response = input(f"Do you want to enable lingering for user {username}? This is required for servers to start after logout. (y/n): ").lower()
        if response in ("yes", "y"):
            msg_info(f"Attempting to enable lingering for user {username}")
            try:
                result = subprocess.run(["sudo", "loginctl", "enable-linger", username], check=True, capture_output=True, text=True)
                msg_ok(f"Lingering enabled for {username}")
                return 0
            except subprocess.CalledProcessError as e:
                msg_warn(f"Failed to enable lingering for {username}. User services might not start after logout.  Check sudo permissions if this is a problem.\nError: {e}")
                return handle_error(13, action)
            except FileNotFoundError:
                msg_warn("loginctl or sudo command not found. Lingering cannot be enabled")
                return #Sudo or loginctl isn't found
        elif response in ("no", "n", ""):
            msg_info("Lingering not enabled. User services will not start after logout.")
            return 0
        else:
            msg_warn("Invalid input. Please answer 'yes' or 'no'.")

def _create_systemd_service(server_name, base_dir, autoupdate, script_direct):
    """Creates a systemd service file (Linux-specific)."""
    action = "create systemd service"
    server_dir = os.path.join(base_dir, server_name)
    service_file = os.path.join(os.path.expanduser("~"), ".config", "systemd", "user", f"bedrock-{server_name}.service")

    if not server_name:
        msg_error("create_systemd_service: server_name is empty.")
        return handle_error(25, action)

    os.makedirs(os.path.join(os.path.expanduser("~"), ".config", "systemd", "user"), exist_ok=True)

    if os.path.exists(service_file):
        msg_warn(f"Reconfiguring service file for '{server_name}' at {service_file}")
    autoupdate_cmd = ""
    if autoupdate:
        autoupdate_cmd = f'ExecStartPre={sys.executable} {script_direct} update-server --server {server_name}'
        msg_info("Auto-update enabled on start.")
    else:
        msg_info("Auto-update disabled on start.")

    service_content = f"""
[Unit]
Description=Minecraft Bedrock Server: {server_name}
After=network.target

[Service]
Type=forking
WorkingDirectory={base_dir}/{server_name}
Environment="PATH=/usr/bin:/bin:/usr/sbin:/sbin"
{autoupdate_cmd}
ExecStart={sys.executable} {script_direct} systemd-start --server {server_name}
ExecStop={sys.executable} {script_direct} systemd-stop --server {server_name}
ExecReload={sys.executable} "{script_direct} systemd-stop --server {server_name} && {script_direct} systemd-start --server {server_name}"
Restart=always
RestartSec=10
StartLimitIntervalSec=500
StartLimitBurst=3

[Install]
WantedBy=default.target
"""
    try:
        with open(service_file, "w") as f:
            f.write(service_content)
        msg_ok(f"Systemd service created for '{server_name}'")
        try:
            subprocess.run(["systemctl", "--user", "daemon-reload"], check=True)
            msg_debug("systemd daemon reloaded.")
        except subprocess.CalledProcessError as e:
            msg_error(f"Failed to reload systemd daemon: {e}")
            return handle_error(1, action)  # General error
        except FileNotFoundError:
            msg_error("systemctl command not found.  Is systemd installed?")
            return handle_error(1, action)  # General error
        return 0
    except OSError as e:
        msg_error(f"Failed to write systemd service file: {service_file}: {e}")
        return handle_error(12, action)

def create_service(server_name, base_dir, script_direct):
    """Creates a systemd service (Linux)."""
    if platform.system() == "Linux":
        # Ask user if they want auto-update
        while True:
            response = input(Fore.MAGENTA + f"Do you want to enable auto-update on start for {server_name}? (y/n): " + Style.RESET_ALL).lower()
            if response in ("yes", "y"):
                autoupdate = True
                break
            elif response in ("no", "n", ""):
                autoupdate = False
                break
            else:
                msg_warn("Invalid input. Please answer 'yes' or 'no'.")

        while True:
            response = input(Fore.CYAN + f"Do you want to enable autostart on boot for {server_name}? (y/n): " + Style.RESET_ALL).lower()
            if response in ("yes", "y"):
                autostart = True
                break
            elif response in ("no", "n", ""):
                autostart = False
                break
            else:
                msg_warn("Invalid input. Please answer 'yes' or 'no'.")

        result = _create_systemd_service(server_name, base_dir, autoupdate, script_direct)
        if result != 0:
            return result  # Return error if service creation failed

        
        if autostart:
            enable_service(server_name)
        else:
            disable_service(server_name)

        enable_user_lingering()
        return 0 # Success


    elif platform.system() == "Windows":
        while True:
            response = input(Fore.MAGENTA + f"Do you want to enable auto-update on start for {server_name}? (y/n): " + Style.RESET_ALL).lower()
            if response in ("yes", "y"):
                if manage_server_config(server_name, "autoupdate", "write", 'true', config_dir=config_dir) != 0:
                    msg_error(f"Failed to update autoupdate in config.json for server: {server_name}")
                    return handle_error(14, action)
                else:
                    msg_ok(f"Successfully updated autoupdate in config.json for server: {server_name}")
                break
            elif response in ("no", "n", ""):
                if manage_server_config(server_name, "autoupdate", "write", 'false', config_dir=config_dir) != 0:
                    msg_error(f"Failed to update autoupdate in config.json for server: {server_name}")
                    return handle_error(14, action)
                else:
                    msg_ok(f"Successfully updated autoupdate in config.json for server: {server_name}")  
                break
            else:
                msg_warn("Invalid input. Please answer 'yes' or 'no'.")  

            return 0     
    else:
        msg_error("Unsupported operating system for service creation.")
        return 1  # Indicate failure

def _enable_systemd_service(server_name):
    """Enables a systemd service (Linux-specific)."""
    action = "enable service"
    if not server_name:
          msg_error("enable_service: server_name is empty.")
          return handle_error(25, action)  # Invalid server name

    if check_service_exists(server_name) != 0:
      msg_error(f"Service file for '{server_name}' does not exist. Cannot enable.")
      return handle_error(12, action)

    try:
      # Check if service is enabled
      result = subprocess.run(["systemctl", "--user", "is-enabled", f"bedrock-{server_name}"], capture_output=True, text=True, check=False)
      if result.returncode == 0: # Enabled
          msg_info(f"Service {server_name} is already enabled.")
          return 0
    except FileNotFoundError:
        msg_error("systemctl command not found, make sure you are on a systemd system")
        return handle_error(1, action)

    try:
        subprocess.run(["systemctl", "--user", "enable", f"bedrock-{server_name}"], check=True)
        msg_ok(f"Autostart for {server_name} enabled successfully.")
        return 0
    except subprocess.CalledProcessError as e:
        msg_error(f"Failed to enable {server_name}: {e}")
        return handle_error(13, action)

def enable_service(server_name):
    """Enables a systemd."""
    if platform.system() == "Linux":
        return _enable_systemd_service(server_name)
    elif platform.system() == "Windows":
        msg_info("Windows doesn't currently support all script features. You may want to look into Windows Subsystem Linux (wsl).")
        return 0
    else:
        msg_error("Unsupported operating system for service enabling.")
        return 1

def _disable_systemd_service(server_name):
    """Disables a systemd service (Linux-specific)."""
    action = "disable service"

    if not server_name:
        msg_error("disable_service: server_name is empty.")
        return handle_error(25, action)

    if check_service_exists(server_name) != 0:
        msg_info(f"Service file for '{server_name}' does not exist.  No need to disable.")
        return 0

    try:
        # Check if service is disabled
        result = subprocess.run(["systemctl", "--user", "is-enabled", f"bedrock-{server_name}"], capture_output=True, text=True, check=False)
        if result.returncode != 0: # Disabled or not found
            msg_info(f"Service {server_name} is already disabled.")
            return 0 # Already disabled.
    except FileNotFoundError:
        msg_error("systemctl command not found, make sure you are on a systemd system")
        return handle_error(1, action)

    try:
        subprocess.run(["systemctl", "--user", "disable", f"bedrock-{server_name}"], check=True)
        msg_ok(f"Server {server_name} disabled successfully.")
        return 0
    except subprocess.CalledProcessError as e:
        msg_error(f"Failed to disable {server_name}: {e}")
        return handle_error(13, action)

def disable_service(server_name):
    """Disables a systemd."""
    if platform.system() == "Linux":
        return _disable_systemd_service(server_name)
    elif platform.system() == "Windows":
        msg_info("Windows doesn't currently support all script features. You may want to look into Windows Subsystem Linux (wsl).")
        return 0
    else:
        msg_error("Unsupported operating system for service disabling.")
        return 1

def check_service_exists(server_name):
    """Checks if a systemd.

    Args:
        server_name (str): The name of the server.

    Returns:
        int: 0 if the service exists, 1 otherwise.
    """
    if platform.system() == "Linux":
        service_file = os.path.join(os.path.expanduser("~"), ".config", "systemd", "user", f"bedrock-{server_name}.service")
        if os.path.exists(service_file):
            return 0
        else:
            return 1
    elif platform.system() == "Windows":
        msg_info("Windows doesn't currently support all script features. You may want to look into Windows Subsystem Linux (wsl).")
        return 1
    else:
        msg_error("Unsupported operating system for service checking.")
        return 1

def is_server_running(server_name, base_dir):
    """Checks if the server is running.

    Args:
        server_name (str): The name of the server.
        base_dir (str): The base directory for servers.

    Returns:
        bool: True if the server is running, False otherwise.
    """
    if platform.system() == "Linux":
        try:
            result = subprocess.run(
                ["screen", "-ls"],
                capture_output=True,
                text=True,
                check=False,
            )
            return f".bedrock-{server_name}" in result.stdout  # Check if session name appears in output
        except FileNotFoundError:
            msg_error("screen command not found.")
            return False  # Assume not running

    elif platform.system() == "Windows":
        # Check for the Bedrock process by PID and working directory.
        try:
            for proc in psutil.process_iter(['pid', 'name', 'cmdline', 'cwd']):
                try:
                    if proc.info['name'] == 'bedrock_server.exe' and \
                            proc.info['cwd'] and base_dir.lower() in proc.info['cwd'].lower():
                        return True  # Found a matching process
                except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                    pass
            return False  # No matching process found
        except Exception as e:
            msg_error(f"Error checking process: {e}")
            return False

    else:
        msg_error("Unsupported operating system for running check.")
        return False

def _systemd_start_server(server_name, base_dir):
    """Starts the Bedrock server within a screen session."""
    action = "systemd start server"

    if not server_name:
        msg_error("systemd_start_server: server_name is empty.")
        return handle_error(25, action)

    # Set status to starting
    if manage_server_config(server_name, "status", "write", "STARTING") != 0:
        msg_error("Failed to set server status to STARTING")
        return handle_error(14, action)

    # Clear server_output.txt
    try:
        with open(os.path.join(base_dir, server_name, "server_output.txt"), "w") as f:
            f.write("Starting Server\n")
    except OSError:
        msg_warn("Failed to truncate server_output.txt.  Continuing...")

    screen_command = [
        "screen",
        "-dmS",
        f"bedrock-{server_name}",
        "-L",
        "-Logfile",
        os.path.join(base_dir, server_name, "server_output.txt"),
        "bash",
        "-c",
        f'cd "{base_dir}/{server_name}" && exec ./bedrock_server'
    ]

    try:
        subprocess.run(screen_command, check=True)
    except subprocess.CalledProcessError as e:
        msg_error(f"Failed to start server with screen: {e}")
        update_server_status_in_config(server_name, base_dir)
        return handle_error(10, action)
    except FileNotFoundError:
        msg_error("screen command not found.  Is screen installed?")
        update_server_status_in_config(server_name, base_dir)
        return handle_error(10, action)


    # Wait for the server to start
    status = "UNKNOWN"
    attempts = 0
    max_attempts = 30
    while attempts < max_attempts:
        status = check_server_status(server_name, base_dir)
        if status == "RUNNING":
            break
        msg_info(f"Waiting for server '{server_name}' to start... Current status: {status}")
        time.sleep(2)
        attempts += 1

    if status != "RUNNING":
        msg_warn(f"Server '{server_name}' did not start within the timeout.  Final status: {status}")

    update_server_status_in_config(server_name, base_dir)
    msg_ok(f"'{server_name}' started")
    return 0

def _windows_start_server(server_name, base_dir):
    """Starts the Bedrock server on Windows by running the executable with communication enabled."""
    action = "windows start server"
    
    if not server_name:
        msg_error("windows_start_server: server_name is empty.")
        return handle_error(25, action)

    # First, check if the server is already running.
    if is_server_running(server_name, base_dir):
        msg_warn(f"Server '{server_name}' is already running.")
        return 0  # No need to start it again

    autoupdate = manage_server_config(server_name, "autoupdate", "read", config_dir=config_dir)
    if autoupdate is not None and str(autoupdate).lower() == 'true':
        msg_info(f"Checking for updates...")
        if update_server(server_name, base_dir, config_dir) != 0:
            msg_warn("Auto-update failed.  Continuing with server start.")

    # Update server config
    if manage_server_config(server_name, "status", "write", "STARTING") != 0:
        msg_error("Failed to set server status to STARTING")
        return handle_error(14, action)

    # Write an initial message to the server output file
    output_file = os.path.join(base_dir, server_name, "server_output.txt")
    try:
        with open(output_file, "w") as f:
            f.write("Starting Server\n")
    except OSError:
        msg_warn("Failed to truncate server_output.txt. Continuing...")

    # Build the path to the executable.
    exe_path = os.path.join(base_dir, server_name, "bedrock_server.exe")
    if not os.path.exists(exe_path):
        msg_error(f"Executable not found at: {exe_path}")
        return handle_error(11, action)

    try:
        # Start the server executable with stdin piped
        # Redirect stdout and stderr to capture the console output.
        with open(output_file, "a") as f:
            process = subprocess.Popen(
                [exe_path],
                cwd=base_dir,
                stdin=subprocess.PIPE,
                stdout=f,  # Append to the server_output.txt file
                stderr=f,  # Also capture error output
                creationflags=subprocess.CREATE_NO_WINDOW  # Hide the console window
            )
        msg_ok(f"Server '{server_name}' started successfully. PID: {process.pid}")

    except Exception as e:
        msg_error(f"Failed to start server executable: {e}")
        update_server_status_in_config(server_name, base_dir)
        return handle_error(10, action)

    time.sleep(5)  # Wait for the server to initialize

    # Wait for the server to report a RUNNING status.
    status = "UNKNOWN"
    attempts = 0
    max_attempts = 30
    while attempts < max_attempts:
        status = check_server_status(server_name, base_dir)
        if status == "RUNNING":
            break
        msg_info(f"Waiting for server '{server_name}' to start... Current status: {status}")
        time.sleep(2)
        attempts += 1

    if status != "RUNNING":
        msg_warn(f"Server '{server_name}' did not start within the timeout. Final status: {status}")

    update_server_status_in_config(server_name, base_dir)
    return 0
    
def start_server(server_name, base_dir):
    """Starts the Bedrock server (systemd user service or Windows)."""
    
    if platform.system() == "Linux":
        service_name = f"bedrock-{server_name}"
        
        # Check if the server is already running before trying to start it.
        if is_server_running(server_name, base_dir):
            msg_warn(f"Server '{server_name}' is already running.")
            return 0  # No need to start it again
        
        try:
            result = subprocess.run(
                ["systemctl", "--user", "start", service_name],
                capture_output=True,
                text=True,
                check=False,
            )
            if result.returncode == 0:
                msg_info(f"Started {service_name} successfully.")
                return 0
            else:
                msg_error(f"Failed to start {service_name}: {result.stderr.strip()}")
                return 1
        except FileNotFoundError:
            msg_error("systemctl command not found.")
            return 1

    elif platform.system() == "Windows":
        return _windows_start_server(server_name, base_dir)

    else:
        msg_error("Unsupported operating system for starting server.")
        return 1

def _systemd_stop_server(server_name, base_dir):
    """Stops the Bedrock server running in a screen session (Linux-specific)."""
    action = "systemd stop server"

    if not server_name:
        msg_error("systemd_stop_server: server_name is empty.")
        return handle_error(25, action)

    msg_info(f"Stopping server '{server_name}'...")

    # Send shutdown warning
    if is_server_running(server_name, base_dir):
         send_command(server_name, "say Shutting down server in 10 seconds..")
    time.sleep(0.5) 
    if manage_server_config(server_name, "status", "write", "STOPPING") != 0:
        msg_error("Failed to update server status in config (STOPPING).")
        return handle_error(14, action)
    
    # Find and kill the screen session.
    try:
        # Use pgrep to find the screen session.
        result = subprocess.run(
            ["pgrep", "-f", f"bedrock-{server_name}"],
            capture_output=True,
            text=True,
            check=False,  # Don't raise exception if not found
        )

        if result.returncode == 0:  # pgrep found a matching process
            screen_pid = result.stdout.strip()
            msg_debug(f"Found screen PID: {screen_pid}")

            # Send the "stop" command to the Bedrock server
            subprocess.run(
                ["screen", "-S", f"bedrock-{server_name}", "-X", "stuff", "stop\n"],
                check=False # It might not be running
            )
            # Give the server some time to stop
            time.sleep(10)
        else:
            msg_warn(f"No screen session found for 'bedrock-{server_name}'.  It may already be stopped.")


    except FileNotFoundError:
        msg_error("pgrep or screen command not found.")
        return handle_error(1, action)
    except Exception as e:
        msg_error(f"An unexpected error occurred: {e}")
        return handle_error(1, action) # General error

    # Wait for server to stop and update status
    status = "UNKNOWN"
    attempts = 0
    max_attempts = 30
    while attempts < max_attempts:
        status = check_server_status(server_name, base_dir)
        if status == "STOPPED":
            break
        msg_info(f"Waiting for server '{server_name}' to stop... Current status: {status}")
        time.sleep(2)
        attempts += 1

    if status != "STOPPED":
        msg_warn(f"Server '{server_name}' did not stop gracefully within the timeout. Final status: {status}")

    if manage_server_config(server_name, "status", "write", "STOPPED") != 0:
        msg_error("Failed to update server status in config (STOPPED).")
        return handle_error(14, action)
    return 0

def _windows_stop_server(server_name, base_dir):
    """Stops the Bedrock server on Windows by terminating its process."""
    action = "windows stop server"

    if not server_name:
        msg_error("windows_stop_server: server_name is empty.")
        return handle_error(25, action)

    # First, check if the server is running.
    if not is_server_running(server_name, base_dir):
        msg_warn(f"Server '{server_name}' is not running.")
        return 0  # No need to stop if it's not running

    msg_info(f"Stopping server '{server_name}'...")

    # Update the server status to STOPPING.
    if manage_server_config(server_name, "status", "write", "STOPPING") != 0:
        msg_error("Failed to update server status in config (STOPPING).")
        return handle_error(14, action)

    try:
        # Iterate over all processes to find the one with the matching server name and cwd
        for proc in psutil.process_iter(['pid', 'name', 'cwd']):
            try:
                if proc.info['name'] == 'bedrock_server.exe' and \
                        proc.info['cwd'] and base_dir.lower() in proc.info['cwd'].lower():
                    # Found the matching process, so we can stop it
                    pid = proc.info['pid']
                    process = psutil.Process(pid)
                    process.kill()  # Forcibly kill the process
                    process.wait(timeout=5)
                    msg_ok(f"Server '{server_name}' was forcefully terminated.")
                    break  # Exit the loop after stopping the server
            except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                pass

    except Exception as e:
        msg_error(f"Failed to stop server process for '{server_name}': {e}")
        update_server_status_in_config(server_name, base_dir)
        return handle_error(10, action)

    if manage_server_config(server_name, "status", "write", "STOPPED") != 0:
        msg_error("Failed to update server status in config (STOPPED).")
        return handle_error(14, action)

    return 0

def stop_server(server_name, base_dir):
    """Stops the Bedrock server (systemd user service or Windows)."""
    
    if platform.system() == "Linux":
        service_name = f"bedrock-{server_name}"
        
        # Check if the server is running before trying to stop it.
        if not is_server_running(server_name, base_dir):
            msg_warn(f"Server '{server_name}' is not running.")
            return 0  # No need to stop it if it's not running
        
        try:
            result = subprocess.run(
                ["systemctl", "--user", "stop", service_name],
                capture_output=True,
                text=True,
                check=False,
            )
            if result.returncode == 0:
                msg_info(f"Stopped {service_name} successfully.")
                return 0
            else:
                msg_error(f"Failed to stop {service_name}: {result.stderr.strip()}")
                return 1
        except FileNotFoundError:
            msg_error("systemctl command not found.")
            return 1

    elif platform.system() == "Windows":
        return _windows_stop_server(server_name, base_dir)

    else:
        msg_error("Unsupported operating system for stopping server.")
        return 1

def _linux_monitor(server_name, base_dir):
    """Linux monitor for Bedrock server"""
    action = "monitor service usage"
    service_name = f"bedrock-{server_name}"

    if not server_name:
        msg_error("monitor_service_usage: server_name is empty.")
        return handle_error(25, action)

    service_status = get_server_status_from_config(server_name)
    if service_status is None:
        msg_warn(f"Failed to get status for '{service_name}', continuing.")

    if service_status != "RUNNING":
        msg_warn(f"{service_name} not running")
        return 0

    msg_info(f"Monitoring resource usage for service: {service_name}")

    last_cpu_times = {}

    while True:
        try:
            # Find the screen process running the Bedrock server
            screen_pid = None
            for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
                try:
                    if proc.info['name'] == 'screen' and f'bedrock-{server_name}' in " ".join(proc.info['cmdline']):
                        screen_pid = proc.info['pid']
                        break
                except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                    pass

            if not screen_pid:
                msg_warn(f"No running 'screen' process found for service '{service_name}'.")
                return 0

            # Find the Bedrock server process (child of screen)
            bedrock_pid = None
            try:
                screen_process = psutil.Process(screen_pid)
                for child in screen_process.children(recursive=True):
                    if 'bedrock_server' in child.name():
                        bedrock_pid = child.pid
                        break
            except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                pass

            if not bedrock_pid:
                msg_warn(f"No running Bedrock server process found for service '{service_name}'.")
                return 0

            # Get process details
            try:
                bedrock_process = psutil.Process(bedrock_pid)
                with bedrock_process.oneshot():
                    # CPU Usage: Real-time calculation
                    current_cpu_times = bedrock_process.cpu_times()
                    prev_cpu_times = last_cpu_times.get(bedrock_pid, current_cpu_times)

                    cpu_time_delta = (current_cpu_times.user + current_cpu_times.system) - \
                                     (prev_cpu_times.user + prev_cpu_times.system)
                    total_time_delta = time.time() - last_cpu_times.get('timestamp', time.time())

                    cpu_usage = (cpu_time_delta / total_time_delta) * 100 if total_time_delta > 0 else 0.0
                    last_cpu_times[bedrock_pid] = current_cpu_times
                    last_cpu_times['timestamp'] = time.time()

                    # Memory Usage
                    mem_usage = bedrock_process.memory_info().rss / (1024 * 1024)  # Convert to MB

                    # Uptime
                    uptime_seconds = time.time() - bedrock_process.create_time()
                    uptime_str = str(timedelta(seconds=int(uptime_seconds)))
            except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                return 0

            # Clear screen and display output
            os.system('cls' if platform.system() == 'Windows' else 'clear')
            print("---------------------------------")
            print(f" Monitoring:  {service_name} ")
            print("---------------------------------")
            print(f"PID:          {bedrock_pid}")
            print(f"CPU Usage:    {cpu_usage:.1f}%")
            print(f"Memory Usage: {mem_usage:.1f} MB")
            print(f"Uptime:       {uptime_str}")
            print("---------------------------------")
            print("Press CTRL + C to exit")

            time.sleep(1)

        except Exception as e:
            msg_error(f"Error during monitoring: {e}")
            return handle_error(23, action)

def _windows_monitor(server_name, base_dir):
    """Windows monitor for Bedrock server"""
    action = "monitor service usage"
    service_name = f"bedrock-{server_name}"

    if not server_name:
        msg_error("monitor_service_usage: server_name is empty.")
        return handle_error(25, action)

    service_status = get_server_status_from_config(server_name)
    if service_status is None:
        msg_warn(f"Failed to get status for '{service_name}', continuing.")

    if service_status != "RUNNING":
        msg_warn(f"{service_name} not running")
        return 0

    msg_info(f"Monitoring resource usage for service: {service_name}")

    # Track previous CPU times for real-time calculations
    last_cpu_times = {}

    while True:
        try:
            # Find the Bedrock server process
            bedrock_pid = None
            oldest_create_time = float('inf')

            for proc in psutil.process_iter(['pid', 'name', 'cmdline', 'cwd']):
                try:
                    if proc.info['name'] == 'bedrock_server.exe' and \
                            base_dir.lower() in proc.info['cwd'].lower():
                        bedrock_pid = proc.info['pid']
                        with proc.oneshot():
                            create_time = proc.create_time()
                            if create_time < oldest_create_time:
                                oldest_create_time = create_time
                        break 
                except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                    pass

            if not bedrock_pid:
                msg_warn(f"No running Bedrock server process found for service '{service_name}'.")
                return 0

            # Get process details
            try:
                bedrock_process = psutil.Process(bedrock_pid)
                with bedrock_process.oneshot():
                    # CPU Usage
                    current_cpu_times = bedrock_process.cpu_times()
                    prev_cpu_times = last_cpu_times.get(bedrock_pid, current_cpu_times)

                    cpu_time_delta = (current_cpu_times.user + current_cpu_times.system) - \
                                     (prev_cpu_times.user + prev_cpu_times.system)
                    total_time_delta = time.time() - last_cpu_times.get('timestamp', time.time())

                    cpu_usage = (cpu_time_delta / total_time_delta) * 100 if total_time_delta > 0 else 0.0
                    last_cpu_times[bedrock_pid] = current_cpu_times
                    last_cpu_times['timestamp'] = time.time()

                    # Memory Usage (in MB)
                    mem_usage = bedrock_process.memory_info().rss / (1024 * 1024)

                    # Uptime
                    uptime_seconds = time.time() - bedrock_process.create_time()
                    uptime_str = str(timedelta(seconds=int(uptime_seconds)))
            except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                return 0

            # Clear screen and display output
            os.system('cls' if platform.system() == 'Windows' else 'clear')
            print("---------------------------------")
            print(f" Monitoring:  {service_name} ")
            print("---------------------------------")
            print(f"PID:          {bedrock_pid}")
            print(f"CPU Usage:    {cpu_usage:.1f}%")
            print(f"Memory Usage: {mem_usage:.1f} MB")
            print(f"Uptime:       {uptime_str}")
            print("---------------------------------")
            print("Press CTRL + C to exit")

            time.sleep(1)

        except Exception as e:
            msg_error(f"Error during monitoring: {e}")
            return handle_error(23, action)
                                
def monitor_service_usage(server_name, base_dir):
    """Monitors the CPU and memory usage of the Bedrock server."""
    if platform.system() == "Linux":
        return _linux_monitor(server_name, base_dir)
    elif platform.system() == "Windows":
        return _windows_monitor(server_name, base_dir)
    else:
        msg_error("Unsupported operating system for monitoring.")
        return 1

def attach_console(server_name, base_dir):
    """Attaches to the server console."""
    action = "attach console"

    if not server_name:
        msg_error("attach_console: server_name is empty.")
        return handle_error(25, action)

    if platform.system() == "Linux":
        if is_server_running(server_name, base_dir):
            msg_info(f"Attaching to server '{server_name}' console...")
            try:
                subprocess.run(["screen", "-r", f"bedrock-{server_name}"], check=True)
                return 0 
            except subprocess.CalledProcessError:
                msg_error(f"Failed to attach to screen session for server: {server_name}")
                return handle_error(18, action)
            except FileNotFoundError:
                msg_error("screen command not found. Is screen installed?")
                return handle_error(18,action)
        else:
            msg_warn(f"Server '{server_name}' is not running in a screen session.")
            return handle_error(8, action) #Return server not running
    elif platform.system() == "Windows":
        msg_info("Windows doesn't currently support all script features. You may want to look into Windows Subsystem Linux (wsl).")
        return 0 # Not really an error
    else:
        msg_error("attach_console not supported on this platform")
        return 1 # Return error

def send_command(server_name, command, config_dir = None):
    """Sends a command to the Bedrock server.

    Args:
        server_name (str): The name of the server.
        command (str): The command to send.
        config_dir (str, optional): config directory, defaults to .config

    Returns:
        int: 0 on success, an error code on failure.
    """
    if config_dir is None:
        config_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), ".config")
    action = "send command"
    if not server_name:
        msg_error("send_command: server_name is empty.")
        return handle_error(25, action)
    if not command:
        msg_error("send_command: command is empty.")
        return handle_error(5, action)

    if platform.system() == "Linux":
        try:
            # Use screen -X stuff to send the command
            subprocess.run(
                ["screen", "-S", f"bedrock-{server_name}", "-X", "stuff", f"{command}\n"],
                check=True  # Raise exception on error
            )
            msg_debug(f"Sent command '{command}' to server '{server_name}'")
            return 0
        except subprocess.CalledProcessError as e:
            msg_error(f"Failed to send command to server: {e}")
            return handle_error(17, action)  # Failed to send command
        except FileNotFoundError:
            msg_error("screen command not found. Is screen installed?")
            return handle_error(1, action)  # General error - screen not found

    elif platform.system() == "Windows":
        msg_info("Windows doesn't currently support all script features. You may want to look into Windows Subsystem Linux (wsl).")
        return 0  # Not an error

    else:
        msg_error("Unsupported operating system for sending commands.")
        return 1

def delete_server(server_name, base_dir, config_dir = None):
    """Deletes a Bedrock server."""
    if config_dir is None:
        config_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), ".config")
    server_dir = os.path.join(base_dir, server_name)
    config_folder = os.path.join(config_dir, server_name)
    action = "delete server"

    if not server_name:
        msg_error("delete_server: server_name is empty.")
        return handle_error(25, action)

    if not os.path.exists(server_dir) and not os.path.exists(config_folder):
        msg_warn(f"Server '{server_name}' does not appear to exist (no server or config directory).")
        return 0  # Not an error if it doesn't exist

    # Confirm deletion
    confirm = input(Fore.RED + f"Are you sure you want to delete the server '{server_name}'? This action is irreversible! (y/n): " + Style.RESET_ALL).lower()
    if confirm not in ("y", "yes"):
        msg_info("Server deletion canceled.")
        return 0

    # Stop the server if it's running
    if is_server_running(server_name, base_dir):
        msg_warn(f"Stopping server '{server_name}' before deletion...")
        stop_server(server_name, base_dir)

    # Remove the systemd service file
    if platform.system() == "Linux":
        service_file = os.path.join(os.path.expanduser("~"), ".config", "systemd", "user", f"bedrock-{server_name}.service")
        if os.path.exists(service_file):
            msg_warn(f"Removing user systemd service for '{server_name}'")
            disable_service(server_name)
            try:
                os.remove(service_file)
            except OSError as e:
                msg_warn(f"Failed to remove service file: {service_file}: {e}") # Not a fatal error

            try:
                subprocess.run(["systemctl", "--user", "daemon-reload"], check=False) # Check false in case it fails
            except FileNotFoundError:
                msg_error("systemctl command not found. Could not reload daemon")
            except subprocess.CalledProcessError:
                msg_error("Failed to reload systemctl daemon")
    elif platform.system() == "Windows":
    # Remove the server directory
     msg_warn(f"Deleting server directory: {server_dir}")
    try:
        shutil.rmtree(server_dir)
    except OSError as e:
        msg_error(f"Failed to delete server directory: {server_dir}: {e}")
        return handle_error(21, action)

    # Remove the config directory
    msg_warn(f"Deleting config directory: {config_folder}")
    try:
        shutil.rmtree(config_folder)
    except OSError as e:
        msg_error(f"Failed to delete config directory: {config_folder}: {e}")
        return handle_error(16, action)

    msg_ok(f"Server '{server_name}' deleted successfully.")
    return 0

def start_server_if_was_running(server_name, base_dir, was_running):
    """Starts the server if it was previously running.

    Args:
        server_name (str): The name of the server.
        base_dir (str): Server base directory.
        was_running (bool): True if the server was running, False otherwise.
    Returns:
        int: 0, or error code
    """
    action = "start server if was running"

    if not server_name:
        msg_error("start_server_if_was_running: server_name is empty.")
        return handle_error(25, action)

    if was_running:
        return start_server(server_name, base_dir)
    else:
        msg_info(f"Skip starting server '{server_name}'.")
        return 0

def stop_server_if_running(server_name, base_dir):
    """Stops the server if it's running, and returns whether it was running.

    Args:
        server_name (str): The name of the server.
        base_dir (str): Server base directory

    Returns:
        bool: True if the server was running (and was stopped), False otherwise.
    """
    action = "stop server if running"
    if not server_name:
       msg_error("stop_server_if_running: server_name is empty.")
       return False

    msg_info("Checking if server is running")
    if is_server_running(server_name, base_dir):
        if stop_server(server_name, base_dir) == 0:
            return True
        else:
            return False # Stop failed
    else:
        msg_info(f"Server '{server_name}' is not currently running.")
        return False

def restart_server(server_name, base_dir):
    """Restarts the Bedrock server."""
    action = "restart server"

    if not server_name:
        msg_error("restart_server: server_name is empty.")
        return handle_error(25, action)

    if not is_server_running(server_name, base_dir):
        msg_warn(f"Server '{server_name}' is not running. Starting it instead.")
        return start_server(server_name, base_dir)

    msg_info(f"Restarting server '{server_name}'...")

    # Send restart warning
    if platform.system() == "Linux":
        send_command(server_name, "say Restarting server in 10 seconds..")
        time.sleep(10)

    # Stop and then start the server.
    if stop_server(server_name, base_dir) != 0:
        return handle_error(10, action)

    # Small delay before restarting
    time.sleep(2)

    if start_server(server_name, base_dir) != 0:
         return handle_error(10, action)

    return 0

def extract_world(server_name, selected_file, base_dir, from_addon=False):
    """Extracts a world from a .mcworld file to the server directory.

    Args:
        server_name (str): The name of the server.
        selected_file (str): Path to the .mcworld file.
        base_dir (str): The base directory for servers.
        from_addon (bool): True if called from addon installation, False otherwise.
    Returns:
        int: 0 on success, or an error code on failure.
    """
    action = "extract world"

    if not server_name:
        msg_error("extract_world: server_name is empty.")
        return handle_error(25, action)
    if not selected_file:
        msg_error("extract_world: selected_file is empty.")
        return handle_error(2, action)
    if not os.path.exists(selected_file):
        msg_error(f"extract_world: selected_file does not exist: {selected_file}")
        return handle_error(15, action)

    server_dir = os.path.join(base_dir, server_name)
    world_name = get_world_name(server_name, base_dir)
    if world_name is None:
        msg_error("Failed to get world name from server.properties.")
        return handle_error(11, action)
    if not world_name:
        msg_error("extract_world: world_name is empty. Check server.properties")
        return handle_error(11, action)

    extract_dir = os.path.join(server_dir, "worlds", world_name)

    was_running = False
    if not from_addon:
        was_running = stop_server_if_running(server_name, base_dir)

    msg_info(f"Installing world {os.path.basename(selected_file)}...")

    # Remove existing world folder content
    msg_warn("Removing existing world folder...")
    try:
        if os.path.exists(extract_dir): # Prevent errors if it doesnt exist.
            shutil.rmtree(extract_dir)
            os.makedirs(extract_dir, exist_ok = True) # Remake empty folder
    except OSError as e:
        msg_error(f"Failed to remove existing world folder content: {e}")
        return handle_error(16, action)

    # Extract the new world
    msg_info("Extracting new world...")
    try:
        with zipfile.ZipFile(selected_file, 'r') as zip_ref:
            zip_ref.extractall(extract_dir)
        msg_ok(f"World installed to {server_name}")
    except zipfile.BadZipFile:
        msg_error(f"Failed to extract world from {selected_file}: Invalid zip file.")
        return handle_error(15, action)  # Failed to download or extract
    except OSError as e:
        msg_error(f"Failed to extract world from {selected_file}: {e}")
        return handle_error(15, action) #Return error.

    # Start the server after world install if it was running and not from an addon
    if not from_addon:
      if start_server_if_was_running(server_name, base_dir, was_running) != 0:
          return handle_error(10, action) #Return error.
    return 0

def install_worlds(server_name, base_dir, script_dir):
    """Provides a menu to select and install .mcworld files.

    Args:
        server_name (str): The name of the server.
        base_dir (str): The base directory where servers are stored.
        script_dir (str): The directory where the script is located.
    Returns:
        int: 0 on success, error code on failure.

    """
    action = "install worlds"

    if not server_name:
        msg_error("install_worlds: server_name is empty.")
        return handle_error(25, action)

    content_dir = os.path.join(script_dir, "content", "worlds")
    server_dir = os.path.join(base_dir, server_name)

    if not os.path.isdir(content_dir):
        msg_warn(f"Content directory not found: {content_dir}.  No worlds to install.")
        return 0

    world_name = get_world_name(server_name, base_dir)
    if world_name is None:
        msg_error("Failed to get world name from server.properties.")
        return handle_error(11, action)
    if not world_name:
        msg_error("Could not find level-name in server.properties")
        return handle_error(11, action)
    msg_debug(f"World name from server.properties: {world_name}")

    # Use glob to find .mcworld files.
    mcworld_files = glob.glob(os.path.join(content_dir, "*.mcworld"))

    if not mcworld_files:
        msg_warn(f"No .mcworld files found in {content_dir}")
        return 0

    # Create a list of base file names.
    file_names = [os.path.basename(file) for file in mcworld_files]

    # Display the menu and get user selection
    print(Fore.CYAN + "Available worlds to install:" + Style.RESET_ALL)
    for i, file_name in enumerate(file_names):
        print(f"{i + 1}. {file_name}")

    while True:
        try:
            choice = int(input(f"Select a world to install (1-{len(file_names)}): "))
            if 1 <= choice <= len(file_names):
                selected_file = mcworld_files[choice - 1]
                break # Valid choice
            else:
                msg_warn("Invalid selection. Please choose a valid option.")
        except ValueError:
            msg_warn("Invalid input. Please enter a number.")

    # Confirm deletion of existing world.
    msg_warn("Installing a new world will DELETE the existing world!")
    while True:
        confirm_choice = input("Are you sure you want to proceed? (y/n): ").lower()
        if confirm_choice in ("yes", "y"):
            break
        elif confirm_choice in ("no", "n"):
            msg_warn("World installation canceled.")
            return 0
        else:
            msg_warn("Invalid input. Please answer 'yes' or 'no'.")

    return extract_world(server_name, selected_file, base_dir)

def export_world(server_name, base_dir, script_dir):
    """Exports the world as a .mcworld file (ZIP archive).

    Args:
        server_name (str): The name of the server.
        base_dir (str): Server base directory.
        script_dir (str): Script directory.
    Returns:
        int: 0 on success, error code on failure.
    """
    action = "export world"
    server_dir = os.path.join(base_dir, server_name)
    backup_dir = os.path.join(script_dir, "backups", server_name)
    if not server_name:
        msg_error("export_world: server_name is empty.")
        return handle_error(25, action)

    world_folder = get_world_name(server_name, base_dir)
    if world_folder is None:
        msg_error("Failed to get world name from server.properties.")
        return handle_error(11, action)
    if not world_folder:
        msg_error("Failed to determine world folder from server.properties!")
        return handle_error(11, action)

    timestamp = get_timestamp()
    backup_file = os.path.join(backup_dir, f"{world_folder}_backup_{timestamp}.mcworld")
    world_path = os.path.join(server_dir, "worlds", world_folder)

    if not os.path.isdir(world_path):
        msg_warn(f"World directory '{world_folder}' does not exist. Skipping world backup.")
        return 0

    msg_info(f"Backing up world folder '{world_folder}'...")
    try:
        # Use shutil.make_archive: much easier than calling zip
        # Change root_dir to world_path
        shutil.make_archive(
            os.path.splitext(backup_file)[0],  # Base name (without extension)
            'zip',  # Format
            root_dir=world_path
        )
        #make_archive creates a .zip, so we rename it to .mcworld
        os.rename(os.path.splitext(backup_file)[0] + ".zip", backup_file)
        msg_ok(f"World backup created: {backup_file}")
        return 0
    except OSError as e:
        msg_error(f"Backup of world failed: {e}")
        return handle_error(20, action)

def prune_old_backups(server_name, file_name=None, script_dir=None, backup_keep=None):
    """Prunes old backups, keeping only the most recent ones.

    Args:
        server_name (str): The name of the server.
        file_name (str, optional): Specific file name to prune (for config files).
        script_dir (str, optional):  Script directory, defaults to script dir.
        backup_keep (int, optional): How many backups to keep, defaults to config value

    Returns:
        int: 0 on success, error code on failure
    """
    if script_dir is None: # Allow passing script dir
        script_dir = os.path.dirname(os.path.realpath(__file__))
    backup_dir = os.path.join(script_dir, "backups", server_name)
    action = "prune old backups"

    if not server_name:
        msg_error("prune_old_backups: server_name is empty.")
        return handle_error(25, action)

    if not os.path.isdir(backup_dir):
        msg_warn(f"Backup directory does not exist: {backup_dir}.  Nothing to prune.")
        return 0
    if backup_keep is None: # Allow passing of value
        config = default_config()
        backup_keep = config['BACKUP_KEEP'] # Get from config

    backups_to_keep = int(backup_keep) + 1  # Keep one extra
    level_name = get_world_name(server_name, base_dir=os.path.join(script_dir, "servers"))
    if not level_name:
        msg_warn("Failed to get world name. Pruning world backups may be inaccurate.")

    msg_info("Pruning old backups...")

    # Prune world backups (*.mcworld)
    world_backups = sorted(glob.glob(os.path.join(backup_dir, f"{level_name}_backup_*.mcworld")), key=os.path.getmtime, reverse=True)
    for old_backup in world_backups[backups_to_keep:]:
        try:
            msg_info(f"Removing old backup: {old_backup}")
            os.remove(old_backup)
        except OSError as e:
            msg_error(f"Failed to remove {old_backup}: {e}")

    # Prune config file backups (if file_name is provided)
    if file_name:
        config_backups = sorted(glob.glob(os.path.join(backup_dir, f"{os.path.splitext(file_name)[0]}_backup_*.{file_name.split('.')[-1]}")), key=os.path.getmtime, reverse=True)
        for old_backup in config_backups[backups_to_keep:]:
            try:
                msg_info(f"Removing old backup: {old_backup}")
                os.remove(old_backup)
            except OSError as e:
                msg_error(f"Failed to remove {old_backup}: {e}")
    return 0

def backup_server(server_name, backup_type, file_to_backup=None, change_status=True, base_dir=None, script_dir=None, config_dir=None):
    """Backs up a server's world or a specific configuration file.

    Args:
        server_name (str): The name of the server.
        backup_type (str): "world" or "config".
        file_to_backup (str, optional): The name of the config file to back up (if backup_type is "config").
        change_status(bool, optional): Whether to change the status of the server, defaults to True.
        base_dir (str, optional): base directory, defaults to script dir
        script_dir (str, optional): script directory, defaults to script dir.
        config_dir (str, optional): config directory, defaults to .config

    Returns:
        int: 0 on success, error code on failure.
    """
    if script_dir is None: # Allow passing script dir
        script_dir = os.path.dirname(os.path.realpath(__file__))
    if base_dir is None:
        base_dir = os.path.join(script_dir, "servers")
    if config_dir is None:
        config_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), ".config")
    server_dir = os.path.join(base_dir, server_name)
    backup_dir = os.path.join(script_dir, "backups", server_name)
    action = "backup server"

    if not server_name:
        msg_error("backup_server: server_name is empty.")
        return handle_error(25, action)
    if not backup_type:
        msg_error("backup_server: backup_type is empty.")
        return handle_error(2, action)

    file_name = file_to_backup
    if file_to_backup:
        file_to_backup = os.path.join(server_dir, file_to_backup)

    # Ensure the backup directory exists.
    os.makedirs(backup_dir, exist_ok=True)

    if backup_type == "world":
        was_running = False
        if change_status:
            was_running = stop_server_if_running(server_name, base_dir)

        if export_world(server_name, base_dir, script_dir) != 0:
            msg_error("Failed to export world for backup.")
            if change_status and was_running:
                start_server(server_name, base_dir)
            return handle_error(20, action)

        if change_status:
            start_server_if_was_running(server_name, base_dir, was_running)

        prune_old_backups(server_name, script_dir=script_dir)

    elif backup_type == "config":
        if not file_to_backup:
            msg_error("backup_server: file_to_backup is empty when backup_type is config.")
            return handle_error(2, action)

        if not os.path.exists(file_to_backup):
            msg_error(f"Configuration file '{file_to_backup}' not found!")
            return handle_error(14, action)

        timestamp = get_timestamp()
        try:
            destination = os.path.join(backup_dir, f"{os.path.splitext(file_name)[0]}_backup_{timestamp}.{file_name.split('.')[-1]}")
            shutil.copy2(file_to_backup, destination) # Use copy2 to preserve metadata
            msg_ok(f"{file_name} backed up to {backup_dir}")
            prune_old_backups(server_name, file_name, script_dir=script_dir)
        except OSError as e:
            msg_error(f"Failed to copy '{file_to_backup}' to '{backup_dir}': {e}")
            return handle_error(1, action)

    else:
        msg_error(f"Invalid backup type: {backup_type}")
        return handle_error(5, action)

    msg_ok("Backup process completed.")
    return 0

def backup_all(server_name, base_dir, change_status=True, script_dir=None, config_dir=None):
    """Backs up all files (world and configuration files).

    Args:
        server_name (str): The name of the server.
        base_dir (str): Server base_dir
        change_status (bool): whether to change the status of the server during the backup
        script_dir (str, optional): script directory, defaults to script dir.
        config_dir (str, optional): config directory, defaults to .config
    Returns:
        int: 0 on success, error code on failure.
    """
    if script_dir is None: # Allow passing script dir
        script_dir = os.path.dirname(os.path.realpath(__file__))
    if config_dir is None:
        config_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), ".config")
    action = "backup all"

    if not server_name:
        msg_error("backup_all: server_name is empty.")
        return handle_error(25, action)

    was_running = False
    if change_status:
        was_running = stop_server_if_running(server_name, base_dir)

    # Backup the world
    if backup_server(server_name, "world", base_dir=base_dir, script_dir=script_dir, change_status=False, config_dir=config_dir) != 0: # Pass base/script/config_dir
        msg_error(f"Failed to backup world for {server_name}.")

    # Backup config files
    for config_file in ["allowlist.json", "permissions.json", "server.properties"]:
        if backup_server(server_name, "config", config_file, base_dir=base_dir, script_dir=script_dir, change_status=False, config_dir=config_dir) != 0: # Pass base/script/config_dir
            msg_error(f"Failed to backup {config_file} for {server_name}.")


    if change_status:
        start_server_if_was_running(server_name, base_dir, was_running)

    prune_old_backups(server_name, script_dir=script_dir)

    msg_ok("All files have been backed up.")
    return 0

def backup_menu(server_name, base_dir, script_dir, config_dir):
    """Displays the backup menu and handles user input."""

    if not server_name:
        msg_error("backup_menu: server_name is empty.")
        return 25

    while True:
        print(Fore.MAGENTA + "What do you want to backup:" + Style.RESET_ALL)
        print("1. Backup World")
        print("2. Backup Configuration File")
        print("3. Backup All")
        print("4. Cancel")

        choice = input("Select the type of backup: ")

        if choice == "1":
            if backup_server(server_name, "world", base_dir=base_dir, script_dir=script_dir, config_dir=config_dir) != 0:
                msg_error("Failed to backup world.")
            break  # Exit after backup
        elif choice == "2":
            print(Fore.MAGENTA + "Select configuration file to backup:" + Style.RESET_ALL)
            print("1. allowlist.json")
            print("2. permissions.json")
            print("3. server.properties")
            print("4. Cancel")

            config_choice = input("Choose file: ")
            if config_choice == "1":
                file_to_backup = "allowlist.json"
            elif config_choice == "2":
                file_to_backup = "permissions.json"
            elif config_choice == "3":
                file_to_backup = "server.properties"
            elif config_choice == "4":
                msg_info("Backup operation canceled.")
                return 0
            else:
                msg_warn("Invalid selection, please try again.")
                continue

            if backup_server(server_name, "config", file_to_backup, base_dir=base_dir, script_dir=script_dir, config_dir=config_dir) != 0:
                msg_error(f"Failed to backup {file_to_backup}.")
            break #Exit menu
        elif choice == "3":
            if backup_all(server_name, base_dir, script_dir=script_dir, config_dir=config_dir) != 0:
                msg_error("Failed to backup all.")
            break # Exit menu
        elif choice == "4":
            msg_info("Backup operation canceled.")
            return 0
        else:
            msg_warn("Invalid selection, please try again.")

def install_addons(server_name, base_dir, script_dir):
    """Installs addons (.mcaddon or .mcpack files) to the server.

    Args:
        server_name (str): The name of the server.
        base_dir (str): Base directory
        script_dir (str): Script directory.
    Returns:
        int: 0 on success, error code on failure.
    """
    action = "install addons"

    if not server_name:
        msg_error("install_addons: server_name is empty.")
        return handle_error(25, action)

    addon_dir = os.path.join(script_dir, "content", "addons")
    server_dir = os.path.join(base_dir, server_name)

    if not os.path.isdir(addon_dir):
        msg_warn(f"Addon directory not found: {addon_dir}.  No addons to install.")
        return 0

    world_name = get_world_name(server_name, base_dir)
    if world_name is None:
        msg_error("Failed to retrieve world name.")
        return handle_error(11, action)
    if not world_name:
        msg_error("Could not find level-name in server.properties")
        return handle_error(11, action)

    msg_info(f"World name from server.properties: {world_name}")

    behavior_dir = os.path.join(server_dir, "worlds", world_name, "behavior_packs")
    resource_dir = os.path.join(server_dir, "worlds", world_name, "resource_packs")
    behavior_json = os.path.join(server_dir, "worlds", world_name, "world_behavior_packs.json")
    resource_json = os.path.join(server_dir, "worlds", world_name, "world_resource_packs.json")

    # Create directories if they don't exist
    os.makedirs(behavior_dir, exist_ok=True)
    os.makedirs(resource_dir, exist_ok=True)

    # Collect .mcaddon and .mcpack files
    addon_files = glob.glob(os.path.join(addon_dir, "*.mcaddon")) + glob.glob(os.path.join(addon_dir, "*.mcpack"))

    if not addon_files:
        msg_warn(f"No .mcaddon or .mcpack files found in {addon_dir}")
        return 0

    return show_addon_selection_menu(server_name, addon_files, base_dir, script_dir) # Pass base and script dir

def show_addon_selection_menu(server_name, addon_files, base_dir, script_dir):
    """Displays the addon selection menu and processes the selected addon.

    Args:
        server_name (str): The name of the server.
        addon_files (list): A list of paths to addon files.
        base_dir (str): Base directory.
        script_dir (str): Script directory

    Returns:
        int: 0 on success, error code on failure.
    """
    action = "addon selection menu"

    if not server_name:
        msg_error("show_addon_selection_menu: server_name is empty.")
        return handle_error(25, action)

    if not addon_files:
        msg_error("show_addon_selection_menu: addon_files array is empty.")
        return handle_error(1, action)

    addon_dir = os.path.join(script_dir, "content", "addons")
    addon_names = [os.path.basename(file) for file in addon_files]

    print(Fore.CYAN + "Available addons to install:" + Style.RESET_ALL)
    for i, addon_name in enumerate(addon_names):
        print(f"{i + 1}. {addon_name}")

    while True:
        try:
            choice = int(input(f"Select an addon to install (1-{len(addon_names)}): "))
            if 1 <= choice <= len(addon_names):
                addon_file = os.path.join(addon_dir, addon_names[choice - 1])  # Construct full path
                break # Valid
            else:
                msg_warn("Invalid selection. Please choose a valid option.")
        except ValueError:
            msg_warn("Invalid input. Please enter a number.")

    msg_info(f"Processing addon: {addon_names[choice-1]}")

    was_running = stop_server_if_running(server_name, base_dir)
    result = process_addon(addon_file, server_name, base_dir, script_dir)
    if result != 0:
        msg_error(f"Failed to process addon {addon_names[choice-1]}")
        return result # Return error

    start_server_if_was_running(server_name, base_dir, was_running)
    return 0

def process_addon(addon_file, server_name, base_dir, script_dir):
    """Processes the selected addon file (.mcaddon or .mcpack).

    Args:
        addon_file (str): Path to the addon file.
        server_name (str): The name of the server.
        base_dir (str): Base directory.
        script_dir (str): Script directory
    Returns:
        int: 0 on success, error code on failure.
    """
    action = "process addon"

    if not addon_file:
        msg_error("process_addon: addon_file is empty.")
        return handle_error(2, action)
    if not server_name:
        msg_error("process_addon: server_name is empty.")
        return handle_error(25, action)
    if not os.path.exists(addon_file):
        msg_error(f"process_addon: addon_file does not exist: {addon_file}")
        return handle_error(15, action)

    addon_name = os.path.splitext(os.path.basename(addon_file))[0]

    if addon_file.lower().endswith(".mcaddon"):
        return process_mcaddon(addon_file, server_name, base_dir, script_dir)
    elif addon_file.lower().endswith(".mcpack"):
        return process_mcpack(addon_file, server_name, base_dir, script_dir)
    else:
        msg_error(f"Unsupported addon file type: {addon_file}")
        return handle_error(27, action)

def process_mcaddon(addon_file, server_name, base_dir, script_dir):
    """Processes an .mcaddon file (extracts and handles contained files).

    Args:
        addon_file (str): Path to the .mcaddon file.
        server_name (str): The name of the server.
        base_dir (str): base directory.
        script_dir (str): script directory.
    Returns:
        int: 0 on success, error code on failure.
    """
    action = "process mcaddon"

    if not addon_file:
        msg_error("process_mcaddon: addon_file is empty.")
        return handle_error(2, action)
    if not server_name:
        msg_error("process_mcaddon: server_name is empty.")
        return handle_error(25, action)
    if not os.path.exists(addon_file):
        msg_error(f"process_mcaddon: addon_file does not exist: {addon_file}")
        return handle_error(15, action)

    temp_dir = tempfile.mkdtemp()  # Create a temporary directory
    msg_info(f"Extracting {os.path.basename(addon_file)}...")

    try:
        with zipfile.ZipFile(addon_file, 'r') as zip_ref:
            zip_ref.extractall(temp_dir)
    except zipfile.BadZipFile:
        msg_error(f"Failed to unzip .mcaddon file: {addon_file} (Not a valid zip file)")
        shutil.rmtree(temp_dir)  # Clean up temp dir
        return handle_error(15, action)
    except OSError as e:
        msg_error(f"Failed to unzip .mcaddon file: {addon_file}: {e}")
        shutil.rmtree(temp_dir)
        return handle_error(15, action)

    try:
        result = process_mcaddon_files(temp_dir, server_name, base_dir, script_dir)
        return result
    finally:
        shutil.rmtree(temp_dir)

def process_mcaddon_files(temp_dir, server_name, base_dir, script_dir):
    """Processes the files extracted from an .mcaddon file.

    Args:
        temp_dir (str): Path to the temporary directory.
        server_name (str): The name of the server.
        base_dir (str): Base directory.
        script_dir (str): Script directory.

    Returns:
        int: 0 on success, error code on failure.
    """
    action = "process mcaddon files"

    if not temp_dir:
        msg_error("process_mcaddon_files: temp_dir is empty.")
        return handle_error(2, action)
    if not server_name:
        msg_error("process_mcaddon_files: server_name is empty.")
        return handle_error(25, action)
    if not os.path.isdir(temp_dir):
        msg_error(f"process_mcaddon_files: temp_dir does not exist or is not a directory: {temp_dir}")
        return handle_error(1, action)

    # Process .mcworld files
    for world_file in glob.glob(os.path.join(temp_dir, "*.mcworld")):
        msg_info(f"Processing .mcworld file: {os.path.basename(world_file)}")
        if extract_world(server_name, world_file, base_dir, from_addon=True) != 0:
            msg_error(f"Failed to extract world from .mcaddon: {os.path.basename(world_file)}")
            return 1

    # Process .mcpack files
    for pack_file in glob.glob(os.path.join(temp_dir, "*.mcpack")):
        msg_info(f"Processing .mcpack file: {os.path.basename(pack_file)}")
        if process_mcpack(pack_file, server_name, base_dir, script_dir) != 0:
            msg_error(f"Failed to process .mcpack from .mcaddon: {os.path.basename(pack_file)}")
            return 1

    return 0

def process_mcpack(pack_file, server_name, base_dir, script_dir):
    """Processes an .mcpack file (extracts and processes manifest).

    Args:
        pack_file (str): Path to the .mcpack file.
        server_name (str): The name of the server.
        base_dir (str): base directory.
        script_dir (str): script directory.
    Returns:
        int: 0 on success, error code on failure.
    """
    action = "process mcpack"

    if not pack_file:
        msg_error("process_mcpack: pack_file is empty.")
        return handle_error(2, action)
    if not server_name:
        msg_error("process_mcpack: server_name is empty.")
        return handle_error(25, action)
    if not os.path.exists(pack_file):
        msg_error(f"process_mcpack: pack_file does not exist: {pack_file}")
        return handle_error(15, action)

    temp_dir = tempfile.mkdtemp()
    msg_info(f"Extracting {os.path.basename(pack_file)}...")

    try:
        with zipfile.ZipFile(pack_file, 'r') as zip_ref:
            zip_ref.extractall(temp_dir)
    except zipfile.BadZipFile:
        msg_error(f"Failed to unzip .mcpack file: {pack_file} (Not a valid zip file)")
        shutil.rmtree(temp_dir) # Cleanup
        return handle_error(15, action)
    except OSError as e:
        msg_error(f"Failed to unzip .mcpack file: {pack_file}: {e}")
        shutil.rmtree(temp_dir)  # Clean up temp dir
        return handle_error(15, action)

    try:
        return process_manifest(temp_dir, server_name, pack_file, base_dir, script_dir)
    finally:
        shutil.rmtree(temp_dir)

def process_manifest(temp_dir, server_name, pack_file, base_dir, script_dir):
    """Processes the manifest.json file within an extracted .mcpack.

    Args:
        temp_dir (str): Path to the temporary directory.
        server_name (str): The name of the server.
        pack_file (str): Original path to the .mcpack file (for logging).
        base_dir (str): Base directory.
        script_dir (str): Script directory.
    Returns:
        int: 0 on success, error code on failure.
    """
    action = "process manifest"
    if not temp_dir:
        msg_error("process_manifest: temp_dir is empty.")
        return handle_error(2, action)
    if not server_name:
        msg_error("process_manifest: server_name is empty.")
        return handle_error(25, action)
    if not pack_file:
        msg_error("process_manifest: pack_file is empty.")
        return handle_error(2, action)
    manifest_info = extract_manifest_info(temp_dir)
    if manifest_info is None:
        msg_error(f"Failed to process {os.path.basename(pack_file)} due to missing or invalid manifest.json")
        return 1

    pack_type, uuid, version, addon_name_from_manifest, formatted_addon_name = manifest_info

    return install_pack(pack_type, temp_dir, server_name, pack_file, base_dir, script_dir, uuid, version, addon_name_from_manifest, formatted_addon_name)

def extract_manifest_info(temp_dir):
    """Extracts information from manifest.json.

    Args:
        temp_dir (str): Path to the temporary directory.

    Returns:
        tuple: (pack_type, uuid, version, addon_name_from_manifest, formatted_addon_name)
               or None if an error occurs.
    """
    action = "extract manifest info"
    manifest_file = os.path.join(temp_dir, "manifest.json")

    if not temp_dir:
        msg_error("extract_manifest_info: temp_dir is empty.")
        handle_error(2, action)
        return None

    if not os.path.exists(manifest_file):
        msg_error(f"manifest.json not found in {temp_dir}")
        return None

    try:
        with open(manifest_file, "r") as f:
            manifest_data = json.load(f)

        pack_type = manifest_data['modules'][0]['type']
        uuid = manifest_data['header']['uuid']
        version = manifest_data['header']['version']
        addon_name_from_manifest = manifest_data['header']['name']
        formatted_addon_name = addon_name_from_manifest.lower().replace(' ', '_')

        return pack_type, uuid, version, addon_name_from_manifest, formatted_addon_name
    except (OSError, json.JSONDecodeError, KeyError, IndexError) as e:
        msg_error(f"Failed to extract info from manifest.json: {e}")
        return None

def install_pack(pack_type, temp_dir, server_name, pack_file, base_dir, script_dir, uuid, version, addon_name_from_manifest, formatted_addon_name):
    """Installs a pack based on its type (data/resources).

    Args:
        type (str): "data" or "resources".
        temp_dir (str): Path to the temporary directory.
        server_name (str): The name of the server.
        pack_file (str): Original path to the .mcpack file (for logging).
        base_dir (str): The base directory for servers.
        script_dir (str): The script directory
        uuid (str): The UUID from the manifest.
        version (list): The version array from the manifest.
        addon_name_from_manifest (str): The addon name from the manifest.
        formatted_addon_name (str): The formatted addon name.
    Returns:
        int: 0 on success, error code on failure.
    """
    action = "install pack"
    if not pack_type:
        msg_error("install_pack: type is empty.")
        return handle_error(2, action)
    if not temp_dir:
        msg_error("install_pack: temp_dir is empty.")
        return handle_error(2, action)
    if not server_name:
        msg_error("install_pack: server_name is empty.")
        return handle_error(25, action)
    if not pack_file:
        msg_error("install_pack: pack_file is empty.")
        return handle_error(2, action)

    world_name = get_world_name(server_name, base_dir)
    if not world_name:
        msg_error("Could not find level-name in server.properties")
        return handle_error(11, action)

    behavior_dir = os.path.join(base_dir, server_name, "worlds", world_name, "behavior_packs")
    resource_dir = os.path.join(base_dir, server_name, "worlds", world_name, "resource_packs")
    behavior_json = os.path.join(base_dir, server_name, "worlds", world_name, "world_behavior_packs.json")
    resource_json = os.path.join(base_dir, server_name, "worlds", world_name, "world_resource_packs.json")

    # Create directories if they don't exist
    os.makedirs(behavior_dir, exist_ok=True)
    os.makedirs(resource_dir, exist_ok=True)

    if pack_type == "data":
        msg_info(f"Installing behavior pack to {server_name}")
        addon_behavior_dir = os.path.join(behavior_dir, f"{formatted_addon_name}_{'.'.join(map(str, version))}")
        os.makedirs(addon_behavior_dir, exist_ok=True)
        try:
            # Copy all files from temp_dir to addon_behavior_dir
            for item in os.listdir(temp_dir):
                s = os.path.join(temp_dir, item)
                d = os.path.join(addon_behavior_dir, item)
                if os.path.isdir(s):
                    shutil.copytree(s, d, dirs_exist_ok=True)
                else:
                    shutil.copy2(s, d) # Copy files

            update_pack_json(behavior_json, uuid, version)
            msg_ok(f"Installed {os.path.basename(pack_file)} to {server_name}.")
            return 0
        except OSError as e:
            msg_error(f"Failed to copy behavior pack files: {e}")
            return handle_error(1, action)

    elif pack_type == "resources":
        msg_info(f"Installing resource pack to {server_name}")
        addon_resource_dir = os.path.join(resource_dir, f"{formatted_addon_name}_{'.'.join(map(str, version))}")
        os.makedirs(addon_resource_dir, exist_ok=True)
        try:
            # Copy all files from temp_dir to addon_resource_dir
            for item in os.listdir(temp_dir):
                s = os.path.join(temp_dir, item)
                d = os.path.join(addon_resource_dir, item)
                if os.path.isdir(s):
                    shutil.copytree(s, d, dirs_exist_ok=True)
                else:
                    shutil.copy2(s, d) # Copy Files
            update_pack_json(resource_json, uuid, version)
            msg_ok(f"Installed {os.path.basename(pack_file)} to {server_name}.")
            return 0
        except OSError as e:
            msg_error(f"Failed to copy resource pack files: {e}")
            return handle_error(1, action)
    else:
        msg_error(f"Unknown pack type: {pack_type}")
        return handle_error(27, action)

def update_pack_json(json_file, pack_id, version):
    """Updates the world_behavior_packs.json or world_resource_packs.json file.

    Args:
        json_file (str): Path to the JSON file.
        pack_id (str): The pack UUID.
        version (list): The pack version as a list (e.g., [1, 2, 3]).
    Returns:
        int: 0 on success, error code on failure.
    """
    action = "update pack json"
    msg_info(f"Updating {os.path.basename(json_file)}.")

    if not json_file:
        msg_error("update_pack_json: json_file is empty.")
        return handle_error(2, action)
    if not pack_id:
        msg_error("update_pack_json: pack_id is empty.")
        return handle_error(2, action)
    if not version:
        msg_error("update_pack_json: version is empty.")
        return handle_error(2, action)

    if not os.path.exists(json_file):
        try:
            with open(json_file, "w") as f:
                json.dump([], f)
        except OSError:
            msg_error(f"Failed to initialize JSON file: {json_file}")
            return handle_error(14, action)

    try:
        with open(json_file, "r") as f:
            try:
                packs = json.load(f)
            except json.JSONDecodeError:
                msg_error(f"Failed to parse JSON in {json_file}.  Creating a new file")
                packs = []

        # Check if pack_id already exists
        pack_exists = False
        for i, pack in enumerate(packs):
            if pack["pack_id"] == pack_id:
                pack_exists = True
                #convert versions to tuples for easy comparison
                pack_version = tuple(pack['version'])
                input_version = tuple(version)
                if input_version > pack_version:
                    packs[i] = {"pack_id": pack_id, "version": version}
                    msg_debug(f"Updated existing pack entry in {json_file}")
                break # Exit Loop

        if not pack_exists:
            packs.append({"pack_id": pack_id, "version": version})
            msg_debug(f"Added new pack entry to {json_file}")

        with open(json_file, "w") as f:
            json.dump(packs, f, indent=4)
        return 0

    except (OSError, TypeError) as e:
        msg_error(f"Failed to update {json_file}: {e}")
        return handle_error(14, action)

def restore_server(server_name, backup_file, restore_type, change_status=True, base_dir=None, script_dir=None):
    """Restores a server from a backup file.

    Args:
        server_name (str): The name of the server.
        backup_file (str): Path to the backup file.
        restore_type (str): "world" or "config".
        change_status (bool): Whether to stop/start the server.
        base_dir(str, optional): base directory, defaults to script dir.
        script_dir(str, optional): Script directory, defaults to script dir.

    Returns:
        int: 0 on success, error code on failure.
    """
    if script_dir is None:
        script_dir = os.path.dirname(os.path.realpath(__file__))
    if base_dir is None:
        base_dir = os.path.join(script_dir, "servers")

    server_dir = os.path.join(base_dir, server_name)
    action = "restore server"

    if not server_name:
        msg_error("restore_server: server_name is empty.")
        return handle_error(25, action)
    if not backup_file:
        msg_error("restore_server: backup_file is empty.")
        return handle_error(2, action)
    if not restore_type:
        msg_error("restore_server: restore_type is empty.")
        return handle_error(2, action)

    if not os.path.exists(backup_file):
        msg_error(f"Backup file '{backup_file}' not found!")
        return handle_error(15, action)


    base_name = os.path.basename(backup_file).split('_backup_')[0]
    file_extension = os.path.splitext(backup_file)[1]
    if file_extension == ".mcworld":
        file_extension = "mcworld"
    else:
        file_extension = file_extension[1:] # Remove leading .

    was_running = False
    if change_status:
        was_running = stop_server_if_running(server_name, base_dir)

    if restore_type == "world":
        # extract_world handles stopping and restarting the server if needed
        if extract_world(server_name, backup_file, base_dir, from_addon=False) != 0:
            msg_error("Failed to extract world during restore.")
            if change_status and was_running:
                start_server(server_name, base_dir) # Attempt a restart.
            return handle_error(15, action)

    elif restore_type == "config":
        target_file = os.path.join(server_dir, f"{base_name}.{file_extension}")
        msg_info(f"Restoring configuration file: {os.path.basename(backup_file)}")
        try:
            shutil.copy2(backup_file, target_file)
            msg_ok(f"{base_name} file restored successfully!")
        except OSError as e:
            msg_error(f"Failed to restore configuration file: {os.path.basename(backup_file)}: {e}")
            return handle_error(14, action)

    else:  # defensive programming
        msg_error("Invalid restore type in restore_server")
        return handle_error(5, action)  # Invalid Input


    if change_status:
        start_server_if_was_running(server_name, base_dir, was_running) # Start server if it was running

    return 0

def restore_all(server_name, base_dir, change_status=True, script_dir=None, config_dir=None):
    """Restores all newest files (world and configuration files).

    Args:
        server_name (str): The name of the server.
        change_status (bool): Whether to stop/start the server.
        base_dir (str): base directory.
        script_dir (str, optional): script dir, defaults to script dir.
        config_dir (str, optional): config directory, defaults to .config.
    Returns:
        int: 0 on success, error code on failure.
    """
    if script_dir is None:
        script_dir = os.path.dirname(os.path.realpath(__file__))
    if config_dir is None:
        config_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), ".config")
    backup_dir = os.path.join(script_dir, "backups", server_name)
    action = "restore all"

    if not server_name:
        msg_error("restore_all: server_name is empty.")
        return handle_error(25, action)

    if not os.path.isdir(backup_dir):
        msg_error(f"No backups found for '{server_name}'.")
        return 0  # Not an error

    # Find the latest world backup
    world_backups = glob.glob(os.path.join(backup_dir, "*.mcworld"))
    if world_backups:
        latest_world = max(world_backups, key=os.path.getmtime)
    else:
        latest_world = None
        msg_warn("No world backups found.")


    was_running = False
    if change_status:
        was_running = stop_server_if_running(server_name, base_dir)

    # Restore the latest world backup
    if latest_world:
        msg_info(f"Restoring the latest world from: {os.path.basename(latest_world)}")
        if restore_server(server_name, latest_world, "world", change_status=False, base_dir=base_dir, script_dir=script_dir) != 0: # Pass base and script dir
            msg_error("Failed to restore world.")

    # Restore latest server.properties backup
    properties_backups = glob.glob(os.path.join(backup_dir, "server_backup_*.properties"))
    if properties_backups:
        latest_properties = max(properties_backups, key=os.path.getmtime)
        if restore_server(server_name, latest_properties, "config", change_status=False, base_dir=base_dir, script_dir=script_dir) != 0: #Pass base and script dir
            msg_error("Failed to restore server.properties.")
    else:
        msg_warn("No server.properties backup found to restore.")

    # Restore latest JSON backups
    json_backups = glob.glob(os.path.join(backup_dir, "*_backup_*.json"))
    restored_json_types = set()  # Use a set for efficient checking

    for config_file in sorted(json_backups, key=os.path.getmtime, reverse=True): # sort by time
        filename = os.path.basename(config_file)
        config_type = filename.split("_backup_")[0]  # Extract base name

        if config_type not in restored_json_types:
            if restore_server(server_name, config_file, "config", change_status=False, base_dir=base_dir, script_dir=script_dir) != 0: # Pass base/script/config dir
                msg_error(f"Failed to restore {config_type}.")
            restored_json_types.add(config_type)  # Add to the set

    if change_status:
        start_server_if_was_running(server_name, base_dir, was_running) # Start server if it was running

    msg_ok("All restore operations completed.")
    return 0

def restore_menu(server_name, base_dir, script_dir, config_dir):
    """Displays the restore menu and handles user interaction."""

    if not server_name:
        msg_error("restore_menu: server_name is empty.")
        return 25

    backup_dir = os.path.join(script_dir, "backups", server_name)
    if not os.path.isdir(backup_dir):
        msg_error(f"No backups found for '{server_name}'.")
        return 0

    while True:
        print(Fore.MAGENTA + "Select the type of backup to restore:" + Style.RESET_ALL)
        print("1. World")
        print("2. Configuration File")
        print("3. Restore All")
        print("4. Cancel")

        choice = input("What do you want to restore: ")

        if choice == "1":
            restore_type = "world"
            # Gather world backups
            backup_files = glob.glob(os.path.join(backup_dir, "*.mcworld"))
            if not backup_files:
                msg_error("No world backups found.")
                return 0 # Return to main menu
            break # Exit loop

        elif choice == "2":
            restore_type = "config"
            # Gather config backups
            backup_files = glob.glob(os.path.join(backup_dir, "*_backup_*.json"))
            backup_files += glob.glob(os.path.join(backup_dir, "*_backup_*.properties"))
            if not backup_files:
                msg_error("No configuration backups found.")
                return 0
            break # Exit loop

        elif choice == "3":
            return restore_all(server_name, base_dir, script_dir=script_dir, config_dir=config_dir) # Pass base/script/config_dir

        elif choice == "4":
            msg_info("Restore operation canceled.")
            return 0
        else:
            msg_warn("Invalid selection. Please choose again.")

    # Create a numbered list of backup files
    backup_map = {}
    print(Fore.CYAN + "Available backups:" + Style.RESET_ALL)
    for i, file in enumerate(backup_files):
        backup_map[i + 1] = file
        print(f"{i + 1}. {os.path.basename(file)}")

    while True:
        try:
            choice = int(input(f"What do you want to restore (or '0' to cancel): "))
            if choice == 0:
                msg_info("Restore operation canceled.")
                return 0
            elif choice in backup_map:
                selected_file = backup_map[choice]
                return restore_server(server_name, selected_file, restore_type, base_dir=base_dir, script_dir=script_dir) # Pass base and script_dir
            else:
                msg_warn("Invalid selection. Please choose again.")
        except ValueError:
            msg_warn("Invalid input. Please enter a number.")

def scan_player_data(base_dir, config_dir):
    """Scans server_output.txt files for player data."""
    action = "scan player data"
    players_data = []

    msg_info("Scanning for Players")

    if not os.path.isdir(base_dir):
        msg_error("Error: BASE_DIR does not exist or is not a directory.")
        return handle_error(16, action)

    for server_folder in glob.glob(os.path.join(base_dir, "*/")):
        server_name = os.path.basename(os.path.normpath(server_folder))
        msg_debug(f"Processing {server_name}")
        log_file = os.path.join(server_folder, "server_output.txt")

        if not os.path.exists(log_file):
            msg_warn(f"Log file not found for {server_name}, skipping.")
            continue

        players_found = False
        try:
            with open(log_file, "r", encoding="utf-8") as f:
                for line in f:
                    match = re.search(r"Player connected:\s*([^,]+),\s*xuid:\s*(\d+)", line)
                    if match:
                        player_name = match.group(1)
                        xuid = match.group(2)
                        msg_info(f"Found player: {player_name} with XUID: {xuid}")
                        players_data.append(f"{player_name}:{xuid}")
                        players_found = True
        except OSError as e:
            msg_error(f"Error reading log file {log_file}: {e}")
            continue

        if not players_found:
            msg_info(f"No players found in {server_name}, skipping.")

    if players_data:
        if save_players_to_json(players_data, config_dir) != 0:
            return handle_error(14, action)
    else:
        msg_info("No player data found across all servers.")

    return 0

def save_players_to_json(players_data, config_dir):
    """Saves or updates player data in players.json.

    Args:
        players_data (list): A list of "player_name:xuid" strings.
        config_dir (str): config directory
    Returns:
        int: 0 on success, error code on failure.
    """
    action = "save players to json"
    players_file = os.path.join(config_dir, "players.json")

    msg_info(f"Processing {players_data}")

    os.makedirs(os.path.dirname(players_file), exist_ok=True)

    if not os.path.exists(players_file) or os.path.getsize(players_file) == 0:
        try:
            with open(players_file, "w") as f:
                json.dump({"players": []}, f)  # Initialize with empty list
        except OSError as e:
            msg_error(f"Failed to initialize players.json: {e}")
            return handle_error(14, action)

    try:
        with open(players_file, "r") as f:
            existing_data = json.load(f)
            existing_players = {player['xuid']: player['name'] for player in existing_data['players']}
    except (OSError, json.JSONDecodeError) as e:
        msg_error(f"Failed to read existing players from players.json: {e}")
        return handle_error(14, action)

    new_players = {}
    for player in players_data:
        player_name, xuid = player.split(":")
        if xuid not in existing_players:
            new_players[xuid] = player_name

    if not new_players:
        msg_info("No new players found.")
        return 0

    new_player_list = [{"name": name, "xuid": xuid} for xuid, name in new_players.items()]

    # Combine and deduplicate
    combined_players = existing_data['players'] + new_player_list
    seen = set()
    unique_players = []
    for player in combined_players:
        if player['xuid'] not in seen:
            unique_players.append(player)
            seen.add(player['xuid'])

    try:
        with open(players_file, "w") as f:
            json.dump({"players": unique_players}, f, indent=4)
        msg_ok("Players processed.")
        return 0
    except OSError as e:
        msg_error(f"Failed to write to players.json: {e}")
        return handle_error(14, action)

def task_scheduler(server_name, base_dir, script_direct, config_dir):
    """Displays the cron scheduler menu and handles user interaction.

    Args:
        server_name (str): The name of the server.
        base_dir (str): base directory.
        script_dir (str): script directory.

    Returns:
        int: 0 on success, error code on failure.
    """
    action = "cron scheduler"

    if not server_name:
        msg_error("cron_scheduler: server_name is empty.")
        return handle_error(25, action)

    if platform.system() == "Linux":

        return cron_scheduler(server_name, base_dir, script_direct)

    elif platform.system() == "Windows":
        
        return windows_scheduler(server_name, base_dir, script_direct, config_dir)

    else:
        msg_error("Unsupported operating system for sending commands.")
        return 1

def cron_scheduler(server_name, base_dir, script_direct):
    """Displays the cron scheduler menu and handles user interaction.

    Args:
        server_name (str): The name of the server.
        base_dir (str): base directory.
        script_dir (str): script directory.

    Returns:
        int: 0 on success, error code on failure.
    """
    action = "cron scheduler"

    if not server_name:
        msg_error("cron_scheduler: server_name is empty.")
        return handle_error(25, action)
    os.system('cls' if platform.system() == 'Windows' else 'clear')
    while True:
        print(Fore.MAGENTA + "Bedrock Server Manager" + Style.RESET_ALL + " - " + Fore.MAGENTA + "Task Scheduler" + Style.RESET_ALL)
        print("You can schedule various server tasks.")
        print(f"Current scheduled task for {Fore.CYAN}{server_name}{Style.RESET_ALL}:")

        cron_jobs = get_server_cron_jobs(server_name)
        if cron_jobs is None:  # Use 'is None' for checking the return value
            msg_error(f"Failed to retrieve cron jobs for {server_name}")
            time.sleep(2)
            continue

        if display_cron_job_table(cron_jobs) != 0:  # Pass the result directly
            msg_error("Failed to display cron job table")
            time.sleep(2)
            continue

        print("What would you like to do?")
        print("1) Add Job")
        print("2) Modify Job")
        print("3) Delete Job")
        print("4) Back")

        choice = input("Enter the number (1-4): ")

        if choice == "1":
            if add_cron_job(server_name, base_dir, script_direct) != 0:
                msg_error("add_cron_job failed.")
        elif choice == "2":
            if modify_cron_job(server_name) != 0:
                msg_error("modify_cron_job failed.")
        elif choice == "3":
            if delete_cron_job(server_name) != 0:
                msg_error("delete_cron_job failed.")
        elif choice == "4":
            return 0
        else:
            msg_warn("Invalid choice. Please try again.")

def get_server_cron_jobs(server_name):
    """Retrieves cron jobs for a specific server.

    Args:
        server_name (str): The name of the server.

    Returns:
        str: A string containing the cron jobs, or "undefined" if no jobs
             are found, or None on error.
    """
    action = "get server cron jobs"

    if not server_name:
        msg_error("get_server_cron_jobs: server_name is empty.")
        return handle_error(25, action)

    if platform.system() != "Linux":
        msg_warn("Cron jobs are only supported on Linux.")
        return "undefined"  # Consistent with original script

    try:
        result = subprocess.run(["crontab", "-l"], capture_output=True, text=True, check=False)

        if result.returncode == 1 and "no crontab for" in result.stderr.lower():
            print(Fore.YELLOW + "No crontab for current user." + Style.RESET_ALL)
            return "undefined"
        elif result.returncode != 0:
            # Other error
            msg_error(f"Error running crontab -l: {result.stderr}")
            return None # Indicate an error

        cron_jobs = result.stdout
        # Filter for lines related to the specific server.
        filtered_jobs = []
        for line in cron_jobs.splitlines():
            if f"--server {server_name}" in line or "scan-players" in line:
                filtered_jobs.append(line)

        if not filtered_jobs:
            print(Fore.YELLOW + f"No scheduled cron jobs found for {server_name}." + Style.RESET_ALL)
            return "undefined"  # No jobs found for this server
        else:
            return "\n".join(filtered_jobs)  # Return as a single string

    except FileNotFoundError:
        msg_error("crontab command not found.  Is cron installed?")
        return None
    except Exception as e:
        msg_error(f"An unexpected error occurred: {e}")
        return None

def display_cron_job_table(cron_jobs):
    """Displays a table of cron jobs.

    Args:
        cron_jobs (str): The output from get_server_cron_jobs.

    Returns:
        int: Always returns 0.
    """
    if cron_jobs == "undefined":
        return 0  # Already handled "No scheduled cron jobs found." in get_server_cron_jobs

    print("-------------------------------------------------------")
    print(f"{'CRON JOBS':<15} {'SCHEDULE':<20}  {'COMMAND':<10}")
    print("-------------------------------------------------------")

    if not cron_jobs: # Handle empty string case
        return 0

    for cron_job in cron_jobs.splitlines():
        parts = cron_job.split()
        if len(parts) < 6:
            msg_warn(f"Skipping invalid cron job line: {cron_job}")
            continue  # Skip lines that don't have enough fields

        minute = parts[0]
        hour = parts[1]
        day = parts[2]
        month = parts[3]
        weekday = parts[4]
        command = " ".join(parts[5:]) # Reassemble the command

        # Clean up command for display
        command = command.split("bedrock-server-manager", 1)[-1].strip()  # Remove leading path
        command = command.split(".py", 1)[-1].strip() # Remove .sh if present
        command = command.split("--", 1)[0].strip()  # Remove arguments

        schedule_time = convert_to_readable_schedule(month, day, hour, minute, weekday)
        if schedule_time is None:
            schedule_time = "ERROR CONVERTING"


        print(Fore.CYAN + f"{minute} {hour} {day} {month} {weekday}".ljust(10) + Style.RESET_ALL + \
              Fore.GREEN + f"{schedule_time:<25}" + Style.RESET_ALL + \
              Fore.YELLOW + f"{command}" + Style.RESET_ALL)
        print()

    print("-------------------------------------------------------")
    return 0

def add_cron_job(server_name, base_dir, script_direct):
    """Adds a new cron job for the specified server.

    Args:
        server_name (str): The name of the server.
        base_dir (str): Base directory.
        script_dir (str): Script directory.

    Returns:
        int: 0 on success, error code on failure.
    """
    action = "add cron job"
    if not server_name:
        msg_error("add_cron_job: server_name is empty.")
        return handle_error(25, action)

    if platform.system() != "Linux":
        msg_error("Cron jobs are only supported on Linux.")
        return 1

    os.system('cls' if platform.system() == 'Windows' else 'clear') # Clear
    print(Fore.MAGENTA + "Bedrock Server Manager" + Style.RESET_ALL + " - " + Fore.MAGENTA + "Task Scheduler" + Style.RESET_ALL)

    cron_jobs = get_server_cron_jobs(server_name)
    if cron_jobs is None:  # Use 'is None' to check for error from get_server_cron_jobs
        msg_error("Failed to get existing cron jobs")
        # Return to the cron_scheduler menu, do not exit

    if display_cron_job_table(cron_jobs) != 0:  # Pass the cron_jobs string
        msg_error("Failed to display existing cron jobs")

    print(f"Choose the command for '{server_name}':")
    print("1) Update Server")
    print("2) Backup Server")
    print("3) Start Server")
    print("4) Stop Server")
    print("5) Restart Server")
    print("6) Scan Players")

    while True:
        try:
            choice = int(input("Enter the number (1-6): "))
            if 1 <= choice <= 6:
                break
            else:
                msg_warn("Invalid choice, please try again.")
        except ValueError:
            msg_warn("Invalid input. Please enter a number.")

    if choice == 1:
        command = f"{script_direct} update-server --server {server_name}"
    elif choice == 2:
        command = f"{script_direct} backup-server --server {server_name}"
    elif choice == 3:
        command = f"{script_direct} start-server --server {server_name}"
    elif choice == 4:
        command = f"{script_direct} stop-server --server {server_name}"
    elif choice == 5:
        command = f"{script_direct} restart-server --server {server_name}"
    elif choice == 6:
        command = f"{script_direct} scan-players"

    # Get cron timing details with validation
    while True:
        month = input("Month (1-12 or *): ")
        if validate_cron_input(month, 1, 12) != 0:
            continue

        day = input("Day of Month (1-31 or *): ")
        if validate_cron_input(day, 1, 31) != 0:
            continue

        hour = input("Hour (0-23 or *): ")
        if validate_cron_input(hour, 0, 23) != 0:
            continue

        minute = input("Minute (0-59 or *): ")
        if validate_cron_input(minute, 0, 59) != 0:
            continue

        weekday = input("Day of Week (0-7, 0 or 7 for Sunday or *): ")
        if validate_cron_input(weekday, 0, 7) != 0:
            continue
        break  # All inputs valid

    schedule_time = convert_to_readable_schedule(month, day, hour, minute, weekday)
    if schedule_time is None:
        msg_error("Failed to convert schedule to readable format.")
        schedule_time = "ERROR CONVERTING"

    print("Your cron job will run with the following schedule:")
    print("-------------------------------------------------------")
    print(f"{'CRON JOB':<15} {'SCHEDULE':<20}  {'COMMAND':<10}")
    print("-------------------------------------------------------")

    #Format command
    display_command = command.split("bedrock-server-manager", 1)[-1].strip()
    display_command = display_command.split(".py", 1)[-1].strip()
    display_command = display_command.split("--", 1)[1].strip()
    print(Fore.CYAN + f"{minute} {hour} {day} {month} {weekday}".ljust(10) + Style.RESET_ALL + \
          Fore.GREEN + f"{schedule_time:<25}" + Style.RESET_ALL + \
          Fore.YELLOW + f"{display_command}" + Style.RESET_ALL)
    print()
    print("-------------------------------------------------------")

    while True:
        confirm = input("Do you want to add this job? (y/n): ").lower()
        if confirm in ("yes", "y"):
            # Add the cron job
            new_cron_job = f"{minute} {hour} {day} {month} {weekday} {command}"
            try:
                # Get existing cron jobs
                result = subprocess.run(["crontab", "-l"], capture_output=True, text=True, check=False)
                existing_crontab = result.stdout
                # If no crontab exists and there is an error, set existing crontab to empty
                if result.returncode != 0 and "no crontab for" in result.stderr.lower():
                    existing_crontab = ""
                elif result.returncode !=0: # If there is another error, raise it
                    raise subprocess.CalledProcessError(result.returncode, result.stderr)

                # Add the new job and write back to crontab
                new_crontab = existing_crontab + new_cron_job + "\n"
                process = subprocess.Popen(['crontab', '-'], stdin=subprocess.PIPE, text=True)
                process.communicate(input=new_crontab)
                if process.returncode != 0: # Check return code
                    raise subprocess.CalledProcessError(process.returncode, "crontab")
                msg_ok("Cron job added successfully!")
                return 0
            except subprocess.CalledProcessError as e:
                msg_error(f"Failed to add cron job: {e}")
                return handle_error(22, action)
            except FileNotFoundError:
                msg_error("crontab command not found")
                return handle_error(22, action)

        elif confirm in ("no", "n", ""):
            msg_info("Cron job not added.")
            return 0
        else:
            msg_warn("Invalid input. Please answer 'yes' or 'no'.")

def modify_cron_job(server_name):
    """Modifies an existing cron job for the specified server.

    Args:
        server_name (str): The name of the server.

    Returns:
        int: 0 on success, error code on failure.
    """
    action = "modify cron job"

    if not server_name:
        msg_error("modify_cron_job: server_name is empty.")
        return handle_error(25, action)

    print(f"Current scheduled cron jobs for '{server_name}':")

    cron_jobs = get_server_cron_jobs(server_name)
    if cron_jobs is None:
        msg_error(f"Failed to retrieve cron jobs for {server_name}")
        return handle_error(22, action)

    if cron_jobs == "undefined" or not cron_jobs:
        print("No scheduled cron jobs found to modify.")
        return 0

    cron_jobs_list = cron_jobs.splitlines()
    if not cron_jobs_list:
        print("No scheduled cron jobs found to modify.")
        return 0

    for i, line in enumerate(cron_jobs_list):
        print(f"{i + 1}) {line}")

    while True:
        try:
            job_number = int(input("Enter the number of the job you want to modify: "))
            if 1 <= job_number <= len(cron_jobs_list):
                job_to_modify = cron_jobs_list[job_number - 1]
                break
            else:
                msg_warn("Invalid selection. Please choose a valid number.")
        except ValueError:
            msg_warn("Invalid input. Please enter a number.")

    # Extract the command part
    job_command = " ".join(job_to_modify.split()[5:])

    print("Modify the timing details for this cron job:")
    while True:
        month = input("Month (1-12 or *): ")
        if validate_cron_input(month, 1, 12) != 0:
            continue

        day = input("Day of Month (1-31 or *): ")
        if validate_cron_input(day, 1, 31) != 0:
            continue

        hour = input("Hour (0-23 or *): ")
        if validate_cron_input(hour, 0, 23) != 0:
            continue

        minute = input("Minute (0-59 or *): ")
        if validate_cron_input(minute, 0, 59) != 0:
            continue

        weekday = input("Day of Week (0-7, 0 or 7 for Sunday or *): ")
        if validate_cron_input(weekday, 0, 7) != 0:
            continue
        break

    schedule_time = convert_to_readable_schedule(month, day, hour, minute, weekday)
    if schedule_time is None:
        msg_error("Failed to convert schedule to readable format.")
        schedule_time = "ERROR CONVERTING"

    #Format command
    display_command = job_command.split("bedrock-server-manager", 1)[-1].strip()
    display_command = display_command.split(".py", 1)[-1].strip()
    display_command = display_command.split("--", 1)[0].strip()

    print("Your modified cron job will run with the following schedule:")
    print("-------------------------------------------------------")
    print(f"{'CRON JOB':<15} {'SCHEDULE':<20}  {'COMMAND':<10}")
    print("-------------------------------------------------------")
    print(Fore.CYAN + f"{minute} {hour} {day} {month} {weekday}".ljust(10) + Style.RESET_ALL + \
          Fore.GREEN + f"{schedule_time:<25}" + Style.RESET_ALL + \
          Fore.YELLOW + f"{display_command}" + Style.RESET_ALL)
    print()
    print("-------------------------------------------------------")

    while True:
        confirm = input("Do you want to modify this job? (y/n): ").lower()
        if confirm in ("yes", "y"):
            try:
                # Remove the selected job and add the modified job
                result = subprocess.run(["crontab", "-l"], capture_output=True, text=True, check=False)
                existing_crontab = result.stdout
                if result.returncode != 0 and "no crontab" not in result.stderr.lower():
                    raise subprocess.CalledProcessError(result.returncode, result.stderr)

                # Filter out the old job
                new_crontab_lines = [line for line in existing_crontab.splitlines() if line != job_to_modify]
                # Add new job
                new_crontab_lines.append(f"{minute} {hour} {day} {month} {weekday} {job_command}")
                updated_crontab = "\n".join(new_crontab_lines) + "\n" # Join and add newline.

                process = subprocess.Popen(['crontab', '-'], stdin=subprocess.PIPE, text=True)
                process.communicate(input=updated_crontab)
                if process.returncode != 0:
                    raise subprocess.CalledProcessError(process.returncode, 'crontab')

                msg_ok("Cron job modified successfully!")
                return 0
            except subprocess.CalledProcessError as e:
                msg_error(f"Failed to update crontab with modified job: {e}")
                return handle_error(22, action)  # Failed to modify
            except FileNotFoundError:
                msg_error("crontab command not found")
                return handle_error(22, action)
        elif confirm in ("no", "n", ""):
            msg_info("Cron job not modified.")
            return 0
        else:
            msg_warn("Invalid input. Please answer 'yes' or 'no'.")

def delete_cron_job(server_name):
    """Deletes a cron job for the specified server.

    Args:
        server_name (str): The name of the server.

    Returns:
        int: 0 on success, error code on failure.
    """
    action = "delete cron job"

    if not server_name:
        msg_error("delete_cron_job: server_name is empty.")
        return handle_error(25, action)

    print(f"Current scheduled cron jobs for '{server_name}':")

    cron_jobs = get_server_cron_jobs(server_name)
    if cron_jobs is None:
        msg_error(f"Failed to retrieve cron jobs for {server_name}")
        return handle_error(22, action)

    if cron_jobs == "undefined" or not cron_jobs:
        print("No scheduled cron jobs found to delete.")
        return 0

    cron_jobs_list = cron_jobs.splitlines()
    if not cron_jobs_list:  # Check for empty list
        print("No scheduled cron jobs found to delete.")
        return 0

    for i, line in enumerate(cron_jobs_list):
        print(f"{i + 1}) {line}")

    while True:
        try:
            job_number = int(input("Enter the number of the job you want to delete: "))
            if 1 <= job_number <= len(cron_jobs_list):
                job_to_delete = cron_jobs_list[job_number - 1]
                break
            else:
                msg_warn("Invalid selection. No matching cron job found.")
        except ValueError:
            msg_warn("Invalid input. Please enter a number.")

    while True:
        confirm_delete = input("Are you sure you want to delete this cron job? (y/n): ").lower()
        if confirm_delete in ("y", "yes"):
            try:
                # Get existing cron jobs
                result = subprocess.run(["crontab", "-l"], capture_output=True, text=True, check=False)
                existing_crontab = result.stdout
                if result.returncode != 0 and "no crontab" not in result.stderr.lower():
                    raise subprocess.CalledProcessError(result.returncode, result.stderr)

                # Filter out the job to delete
                new_crontab_lines = [line for line in existing_crontab.splitlines() if line != job_to_delete]
                updated_crontab = "\n".join(new_crontab_lines) + "\n" # Join and add newline

                # Write back to crontab
                process = subprocess.Popen(['crontab', '-'], stdin=subprocess.PIPE, text=True)
                process.communicate(input=updated_crontab)
                if process.returncode != 0:
                    raise subprocess.CalledProcessError(process.returncode, 'crontab')

                msg_ok("Cron job deleted successfully!")
                return 0
            except subprocess.CalledProcessError as e:
                msg_error(f"Failed to update crontab: {e}")
                return handle_error(22, action)
            except FileNotFoundError:
                msg_error("crontab command not found")
                return handle_error(22, action)

        elif confirm_delete in ("n", "no", ""):
            msg_info("Cron job not deleted.")
            return 0
        else:
            msg_warn("Invalid input. Please answer 'yes' or 'no'.")

def validate_cron_input(value, min_val, max_val):
    """Validates cron input (minute, hour, day, month, weekday).

    Args:
        value (str): The value to validate.
        min_val (int): The minimum allowed value.
        max_val (int): The maximum allowed value.

    Returns:
        int: 0 if the input is valid, error code otherwise.
    """
    action = "validate cron input"
    if value == "*":
        return 0
    try:
        int_value = int(value)
        if min_val <= int_value <= max_val:
            return 0
        else:
            msg_warn(f"Invalid input. Please enter a value between {min_val} and {max_val}, or '*' for any.")
            return handle_error(26, action)
    except ValueError:
        msg_warn(f"Invalid input. Please enter a number between {min_val} and {max_val}, or '*' for any.")
        return handle_error(26, action) 

def convert_to_readable_schedule(month, day, hour, minute, weekday):
    """Converts cron format to a readable schedule string.

    Args:
        month (str): Month (1-12 or *).
        day (str): Day of month (1-31 or *).
        hour (str): Hour (0-23 or *).
        minute (str): Minute (0-59 or *).
        weekday (str): Day of week (0-7, 0 or 7 for Sunday, or *).

    Returns:
        str: A human-readable schedule string, or None on error.
    """
    action = "convert to readable schedule"

    # Handle empty or null inputs
    if not all([month, day, hour, minute, weekday]):
        return "Invalid Input"

    # Validate input ranges
    if (validate_cron_input(month, 1, 12) != 0 or
        validate_cron_input(day, 1, 31) != 0 or
        validate_cron_input(hour, 0, 23) != 0 or
        validate_cron_input(minute, 0, 59) != 0 or
        validate_cron_input(weekday, 0, 7) != 0):
        return None  # Let the caller handle the specific error messages.

    try:
        if day == "*" and weekday == "*":
            return f"Daily at {int(hour):02d}:{int(minute):02d}"
        elif day != "*" and weekday == "*" and month == "*":
            return f"Monthly on day {int(day)} at {int(hour):02d}:{int(minute):02d}"
        elif day == "*" and weekday != "*":
            days_of_week = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
            weekday_index = int(weekday) % 8  # Handle 0 and 7 for Sunday
            return f"Weekly on {days_of_week[weekday_index]} at {int(hour):02d}:{int(minute):02d}"
        else:
            # If there are wildcards, format as cron
            if any(val == "*" for val in [month, day, hour, minute]):
                return f"Cron schedule: {int(minute):02d} {int(hour):02d} {day} {month} {weekday}"
            # If there are no wildcards, format as a date and time
            now = datetime.now()
            try:
                # Create a datetime object for the next scheduled run.
                next_run = datetime(now.year, int(month), int(day), int(hour), int(minute))
                # If time already passed, add a year
                if next_run < now:
                    next_run = next_run.replace(year=now.year + 1)
                return f"Next run at {next_run.strftime('%m/%d/%Y %H:%M')}"
            except ValueError: # Invalid date/time
                return "?"
    except ValueError: # Failed to cast
        return "?"

def windows_scheduler(server_name, base_dir, script_direct, config_dir):
    """Displays the Windows Task Scheduler menu and handles user interaction."""
    action = "windows task scheduler"

    if not server_name:
        msg_error("windows_task_scheduler: server_name is empty.")
        return handle_error(25, action)

    if platform.system() != "Windows":
        msg_error("This function is for Windows only.")
        return 1
    os.system('cls')
    while True:
        print(Fore.MAGENTA + "Bedrock Server Manager" + Style.RESET_ALL + " - " + Fore.MAGENTA + "Task Scheduler (Windows)" + Style.RESET_ALL)
        print("You can schedule various server tasks.")
        print(f"Current scheduled tasks for {Fore.CYAN}{server_name}{Style.RESET_ALL}:")

        task_names = get_server_task_names(server_name, config_dir)
        if not task_names:
             print("No scheduled tasks found.")
        else:
            display_windows_task_table(task_names)

        print("What would you like to do?")
        print("1) Add Task")
        print("2) Modify Task")
        print("3) Delete Task")
        print("4) Back")

        choice = input("Enter the number (1-4): ")

        if choice == "1":
            if add_windows_task(server_name, base_dir, script_direct, config_dir) != 0:
                msg_error("add_windows_task failed.")
        elif choice == "2":
            if modify_windows_task(server_name, base_dir, script_direct, config_dir) != 0:
                msg_error("modify_windows_task failed.")
        elif choice == "3":
            if delete_windows_task(server_name, config_dir) != 0:
                msg_error("delete_windows_task failed.")
        elif choice == "4":
            return 0
        else:
            msg_warn("Invalid choice. Please try again.")

def display_windows_task_table(task_names):
    """Displays a table of Windows scheduled tasks, including schedule and command."""
    print("-------------------------------------------------------------------------------")
    print(f"{'TASK NAME':<30} {'COMMAND':<25} {'SCHEDULE':<20}")
    print("-------------------------------------------------------------------------------")

    for task_name, file_path in task_names:
        try:
            tree = ET.parse(file_path)
            root = tree.getroot()
            actions = root.find(".//{http://schemas.microsoft.com/windows/2004/02/mit/task}Actions")
            arguments_element = actions.find(".//{http://schemas.microsoft.com/windows/2004/02/mit/task}Arguments")
            if arguments_element is not None:
                arguments = arguments_element.text
                command = arguments.split()[1] if len(arguments.split()) > 1 else "Unknown"
            else:
                command = "Unknown"

            schedule = get_schedule_string(root)  # Get schedule string

            print(Fore.CYAN + f"{task_name.lstrip('/'):<30}" + Style.RESET_ALL +
                  Fore.YELLOW + f"{command:<25}" + Style.RESET_ALL +
                  Fore.GREEN + f"{schedule:<20}" + Style.RESET_ALL)

        except (ET.ParseError, FileNotFoundError):
            print(Fore.RED + f"Error parsing XML for {task_name}" + Style.RESET_ALL)
    print("-------------------------------------------------------------------------------")

def get_schedule_string(root):
    """Extracts a human-readable schedule string from the task XML."""
    triggers = root.find(".//{http://schemas.microsoft.com/windows/2004/02/mit/task}Triggers")
    if triggers is None:
        return "No Triggers"

    schedule_parts = []
    for trigger in triggers:
        if trigger.tag.endswith("TimeTrigger"):
            start_boundary = trigger.find(".//{http://schemas.microsoft.com/windows/2004/02/mit/task}StartBoundary").text
            schedule_parts.append(f"One Time: {start_boundary.split('T')[1][:-3]}")  # Extract time
        elif trigger.tag.endswith("CalendarTrigger"):
            if trigger.find(".//{http://schemas.microsoft.com/windows/2004/02/mit/task}ScheduleByDay") is not None:
                days_interval = trigger.find(".//{http://schemas.microsoft.com/windows/2004/02/mit/task}DaysInterval").text
                schedule_parts.append(f"Daily (every {days_interval} days)")
            elif trigger.find(".//{http://schemas.microsoft.com/windows/2004/02/mit/task}ScheduleByWeek") is not None:
                weeks_interval = trigger.find(".//{http://schemas.microsoft.com/windows/2004/02/mit/task}WeeksInterval").text
                days_of_week = []
                for day_element in trigger.findall(".//{http://schemas.microsoft.com/windows/2004/02/mit/task}DaysOfWeek/*"):
                    days_of_week.append(day_element.tag.split('}')[-1])  # Extract day name
                schedule_parts.append(f"Weekly (every {weeks_interval} weeks on {', '.join(days_of_week)})")
            elif trigger.find(".//{http://schemas.microsoft.com/windows/2004/02/mit/task}ScheduleByMonth") is not None:
                schedule_parts.append("Monthly") #Simplified
            else:
                schedule_parts.append("CalendarTrigger (Unknown Type)")
        else:
            schedule_parts.append("Unknown Trigger Type")

    return ", ".join(schedule_parts)

def get_server_task_names(server_name, config_dir):
    """Gets a list of task names associated with the server.  Also returns file paths.
    Args:
        server_name: Name of server.
        config_dir: Configuration directory.
    Returns:
        List of tuples:  (task_name, file_path) or empty list if none found, or None on error
    """
    task_dir = os.path.join(config_dir, server_name)
    if not os.path.exists(task_dir):
        return []

    task_files = []
    try:
        for filename in os.listdir(task_dir):
            if filename.endswith(".xml"):
                file_path = os.path.join(task_dir, filename)
                # Extract task name
                try:
                    tree = ET.parse(file_path)
                    root = tree.getroot()
                    reg_info = root.find(".//{http://schemas.microsoft.com/windows/2004/02/mit/task}RegistrationInfo")
                    if reg_info is not None:
                        uri = reg_info.find("{http://schemas.microsoft.com/windows/2004/02/mit/task}URI")
                        if uri is not None:
                            task_files.append((uri.text, file_path))

                except ET.ParseError:
                    msg_error(f"Error parsing XML file {filename}.  Skipping.")
                    continue

    except Exception as e:
         msg_error(f"Error reading tasks from {task_dir}: {e}")
         return None

    return task_files

def add_windows_task(server_name, base_dir, script_direct, config_dir):
    """Adds a new Windows scheduled task."""
    action = "add windows task"

    if not server_name:
        msg_error("add_windows_task: server_name is empty.")
        return handle_error(25, action)

    if platform.system() != "Windows":
        msg_error("This function is for Windows only.")
        return 1
    os.system('cls')
    print(Fore.MAGENTA + "Bedrock Server Manager" + Style.RESET_ALL + " - " + Fore.MAGENTA + "Task Scheduler (Windows) - Add Task" + Style.RESET_ALL)
    print(f"Adding task for '{server_name}':")

    print("Choose the command:")
    print("1) Update Server")
    print("2) Backup Server")
    print("3) Start Server")
    print("4) Stop Server")
    print("5) Restart Server")
    print("6) Scan Players")

    while True:
        try:
            choice = int(input("Enter the number (1-6): "))
            if 1 <= choice <= 6:
                break
            else:
                msg_warn("Invalid choice, please try again.")
        except ValueError:
            msg_warn("Invalid input. Please enter a number.")

    if choice == 1:
        command = "update-server"
        command_args = f"--server {server_name}"
    elif choice == 2:
        command = "backup-server"
        command_args = f"--server {server_name}"
    elif choice == 3:
        command = "start-server"
        command_args = f"--server {server_name}"
    elif choice == 4:
        command = "stop-server"
        command_args = f"--server {server_name}"
    elif choice == 5:
        command = "restart-server"
        command_args = f"--server {server_name}"
    elif choice == 6:
        command = "scan-players"
        command_args = ""

    task_name = f"bedrock_{server_name}_{command.replace('-', '_')}"  # Create a task name.  Replace hyphens.
    xml_file_path = create_windows_task_xml(server_name, script_direct, command, command_args, task_name, config_dir)

    if xml_file_path:
        if import_task_xml(xml_file_path, task_name) == 0:  # Pass task_name
            msg_ok(f"Task '{task_name}' added successfully!")
        else:
            msg_error(f"Failed to import task '{task_name}'.")
            return 1
    else:
        msg_error("Failed to create XML for task.")
        return 1
    return 0

def create_windows_task_xml(server_name, script_direct, command, command_args, task_name, config_dir, existing_triggers=None):
    """Creates the XML file for a Windows scheduled task."""
    action = "create_windows_task_xml"

    task = ET.Element("Task", version="1.2")
    task.set("xmlns", "http://schemas.microsoft.com/windows/2004/02/mit/task")

    reg_info = ET.SubElement(task, "RegistrationInfo")
    ET.SubElement(reg_info, "Date").text = datetime.now().isoformat()
    ET.SubElement(reg_info, "Author").text = f"{os.getenv('USERDOMAIN')}\\{os.getenv('USERNAME')}"
    ET.SubElement(reg_info, "URI").text = task_name

    triggers = ET.SubElement(task, "Triggers")
    if existing_triggers:
        for trigger in existing_triggers:
            triggers.append(trigger)
    else:
        get_trigger_info(triggers)

    principals = ET.SubElement(task, "Principals")
    principal = ET.SubElement(principals, "Principal", id="Author")
    try:
        sid = subprocess.check_output(["whoami", "/user", "/fo", "csv"], text=True).strip().splitlines()[-1].split(",")[-1].strip('"')
        ET.SubElement(principal, "UserId").text = sid
    except:
        ET.SubElement(principal, "UserId").text = os.getenv('USERNAME')
    ET.SubElement(principal, "LogonType").text = "InteractiveToken"
    ET.SubElement(principal, "RunLevel").text = "LeastPrivilege"

    settings = ET.SubElement(task, "Settings")
    ET.SubElement(settings, "MultipleInstancesPolicy").text = "IgnoreNew"
    ET.SubElement(settings, "DisallowStartIfOnBatteries").text = "true"
    ET.SubElement(settings, "StopIfGoingOnBatteries").text = "true"
    ET.SubElement(settings, "AllowHardTerminate").text = "true"
    ET.SubElement(settings, "StartWhenAvailable").text = "false"
    ET.SubElement(settings, "RunOnlyIfNetworkAvailable").text = "false"
    idle_settings = ET.SubElement(settings, "IdleSettings")
    ET.SubElement(idle_settings, "StopOnIdleEnd").text = "true"
    ET.SubElement(idle_settings, "RestartOnIdle").text = "false"
    ET.SubElement(settings, "AllowStartOnDemand").text = "true"
    ET.SubElement(settings, "Enabled").text = "true"
    ET.SubElement(settings, "Hidden").text = "false"
    ET.SubElement(settings, "RunOnlyIfIdle").text = "false"
    ET.SubElement(settings, "WakeToRun").text = "false"
    ET.SubElement(settings, "ExecutionTimeLimit").text = "PT72H"
    ET.SubElement(settings, "Priority").text = "7"

    actions = ET.SubElement(task, "Actions", Context="Author")
    exec_action = ET.SubElement(actions, "Exec")
    ET.SubElement(exec_action, "Command").text = f"{sys.executable}"
    ET.SubElement(exec_action, "Arguments").text = f"{script_direct} {command} {command_args}"

    task_dir = os.path.join(config_dir, server_name)
    if not os.path.exists(task_dir):
        os.makedirs(task_dir)

    xml_file_name = f"{command.replace('-', '_')}.xml"
    xml_file_path = os.path.join(task_dir, xml_file_name)
    try:
        ET.indent(task)
        tree = ET.ElementTree(task)
        tree.write(xml_file_path, encoding="utf-16", xml_declaration=True)
        return xml_file_path
    except Exception as e:
        msg_error(f"Error writing XML file: {e}")
        return None

def import_task_xml(xml_file_path, task_name):
    """Imports the XML file into the Windows Task Scheduler."""
    action = "import task xml"
    if not task_name:
        msg_error("Task name is empty.")
        return 1
    try:
        subprocess.run(["schtasks", "/Create", "/TN", task_name, "/XML", xml_file_path, "/F"], check=True, capture_output=True, text=True)
        return 0
    except subprocess.CalledProcessError as e:
        msg_error(f"Failed to import task: {e.stderr}")
        return 1
    except Exception as e:
        msg_error(f"An unexpected error occurred while importing: {e}")
        return 1

def get_day_element_name(day_input):
    """Converts user input for a day of the week to the correct XML element name.

    Args:
        day_input (str or int): User input for the day (e.g., "Mon", "monday", 1, "1").

    Returns:
        str: The correct XML element name (e.g., "Monday"), or None if invalid.
    """
    days_mapping = {
        "sun": "Sunday", "mon": "Monday", "tue": "Tuesday", "wed": "Wednesday",
        "thu": "Thursday", "fri": "Friday", "sat": "Saturday"
    }
    days_by_number = {
        1: "Sunday", 2: "Monday", 3: "Tuesday", 4: "Wednesday",
        5: "Thursday", 6: "Friday", 7: "Saturday"
    }

    day_input_lower = str(day_input).lower()

    if day_input_lower in days_mapping:
        return days_mapping[day_input_lower]
    elif day_input_lower.startswith("sun"):
        return "Sunday"  # Handle longer variations
    elif day_input_lower.startswith("mon"):
        return "Monday"
    elif day_input_lower.startswith("tue"):
        return "Tuesday"
    elif day_input_lower.startswith("wed"):
        return "Wednesday"
    elif day_input_lower.startswith("thu"):
        return "Thursday"
    elif day_input_lower.startswith("fri"):
        return "Friday"
    elif day_input_lower.startswith("sat"):
        return "Saturday"
    try:
        day_number = int(day_input)
        if 1 <= day_number <= 7:
            return days_by_number[day_number]
    except ValueError:
        pass  # Not a valid number

    return None  # Invalid input

def get_month_element_name(month_input):
    """Converts user input for a month to the correct XML element name.

    Args:
        month_input (str or int): User input for the month (e.g., "Jan", "january", 1, "1").

    Returns:
        str: The correct XML element name (e.g., "January"), or None if invalid.
    """
    months_mapping = {
        "jan": "January", "feb": "February", "mar": "March", "apr": "April",
        "may": "May", "jun": "June", "jul": "July", "aug": "August",
        "sep": "September", "oct": "October", "nov": "November", "dec": "December"
    }
    months_by_number = {
        1: "January", 2: "February", 3: "March", 4: "April", 5: "May", 6: "June",
        7: "July", 8: "August", 9: "September", 10: "October", 11: "November", 12: "December"
    }

    month_input_lower = str(month_input).lower()

    if month_input_lower in months_mapping:
        return months_mapping[month_input_lower]
    # Handle longer variations
    for short_name, long_name in months_mapping.items():
         if month_input_lower.startswith(short_name):
             return long_name
    try:
        month_number = int(month_input)
        if 1 <= month_number <= 12:
            return months_by_number[month_number]
    except ValueError:
        pass

    return None

def get_trigger_info(triggers_element):
    """Gets trigger information from the user and adds it to the XML."""

    while True:
        print("Choose a trigger type:")
        print("1) One Time")
        print("2) Daily")
        print("3) Weekly")
        print("4) Monthly")
        print("5) Add another trigger")
        print("6) Done adding triggers")

        trigger_choice = input("Enter the number (1-6): ")
        now = datetime.now()

        if trigger_choice == "1":
            time_trigger = ET.SubElement(triggers_element, "TimeTrigger")
            while True:
                start_boundary = input("Enter start date and time (YYYY-MM-DD HH:MM): ")
                try:
                    start_boundary_dt = datetime.strptime(start_boundary, "%Y-%m-%d %H:%M")
                    break
                except ValueError:
                    msg_error("Incorrect format, please use YYYY-MM-DD HH:MM")

            ET.SubElement(time_trigger, "StartBoundary").text = start_boundary_dt.isoformat()
            ET.SubElement(time_trigger, "Enabled").text = "true"

        elif trigger_choice == "2":
            calendar_trigger = ET.SubElement(triggers_element, "CalendarTrigger")
            while True:
                start_boundary = input("Enter start date and time (YYYY-MM-DD HH:MM): ")
                try:
                    start_boundary_dt = datetime.strptime(start_boundary, "%Y-%m-%d %H:%M")
                    break
                except ValueError:
                    msg_error("Incorrect format, please use YYYY-MM-DD HH:MM")

            ET.SubElement(calendar_trigger, "StartBoundary").text = start_boundary_dt.isoformat()
            ET.SubElement(calendar_trigger, "Enabled").text = "true"
            schedule_by_day = ET.SubElement(calendar_trigger, "ScheduleByDay")
            while True:
                try:
                    days_interval = int(input("Enter interval in days: "))
                    if days_interval >= 1:
                        break
                    else:
                        msg_warn("Enter a value greater or equal to 1")
                except ValueError:
                    msg_error("Must be a valid integer.")
            ET.SubElement(schedule_by_day, "DaysInterval").text = str(days_interval)

        elif trigger_choice == "3":
            calendar_trigger = ET.SubElement(triggers_element, "CalendarTrigger")
            while True:
                start_boundary = input("Enter start date and time (YYYY-MM-DD HH:MM): ")
                try:
                    start_boundary_dt = datetime.strptime(start_boundary, "%Y-%m-%d %H:%M")
                    break
                except ValueError:
                    msg_error("Incorrect format, please use YYYY-MM-DD HH:MM")
            ET.SubElement(calendar_trigger, "StartBoundary").text = start_boundary_dt.isoformat()
            ET.SubElement(calendar_trigger, "Enabled").text = "true"
            schedule_by_week = ET.SubElement(calendar_trigger, "ScheduleByWeek")

            while True:  # Loop for days of the week input
                days_of_week_str = input("Enter days of the week (comma-separated: Sun,Mon,Tue,Wed,Thu,Fri,Sat OR 1-7): ")
                days_of_week = [day.strip() for day in days_of_week_str.split(",")]
                valid_days = []
                days_of_week_element = ET.SubElement(schedule_by_week, "DaysOfWeek")

                for day_input in days_of_week:
                    day_element_name = get_day_element_name(day_input)
                    if day_element_name:
                        ET.SubElement(days_of_week_element, day_element_name)
                        valid_days.append(day_element_name)
                    else:
                        msg_warn(f"Invalid day of week: {day_input}. Skipping.")
                if valid_days:
                    break #Exit if at least one day is valid
                else:
                    msg_error("You must enter at least one valid day.")


            while True:
                try:
                    weeks_interval = int(input("Enter interval in weeks: "))
                    if weeks_interval >= 1:
                        break
                    else:
                        msg_warn("Enter a value greater or equal to 1")
                except ValueError:
                    msg_error("Must be a valid integer.")

            ET.SubElement(schedule_by_week, "WeeksInterval").text = str(weeks_interval)

        elif trigger_choice == "4":  # Monthly
            calendar_trigger = ET.SubElement(triggers_element, "CalendarTrigger")
            while True:
                start_boundary = input("Enter start date and time (YYYY-MM-DD HH:MM): ")
                try:
                    start_boundary_dt = datetime.strptime(start_boundary, "%Y-%m-%d %H:%M")
                    break
                except ValueError:
                    msg_error("Incorrect date format, please use YYYY-MM-DD HH:MM")

            ET.SubElement(calendar_trigger, "StartBoundary").text = start_boundary_dt.isoformat()
            ET.SubElement(calendar_trigger, "Enabled").text = "true"
            schedule_by_month = ET.SubElement(calendar_trigger, "ScheduleByMonth")

            while True: # Loop for days input
                days_of_month_str = input("Enter days of the month (comma-separated, 1-31): ")
                days_of_month = [day.strip() for day in days_of_month_str.split(",")]
                days_of_month_element = ET.SubElement(schedule_by_month, "DaysOfMonth")
                valid_days = []

                for day in days_of_month:
                    try:
                        day_int = int(day)
                        if 1 <= day_int <= 31:
                            ET.SubElement(days_of_month_element, "Day").text = str(day_int)
                            valid_days.append(day_int)
                        else:
                            msg_warn(f"Invalid day of month: {day}. Skipping.")
                    except ValueError:
                        msg_warn(f"Invalid day of month: {day}. Skipping.")
                if valid_days:
                    break #Exit loop
                else:
                    msg_error("You must enter at least one valid day")

            while True:  # Loop for months input
                months_str = input("Enter months (comma-separated: Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec OR 1-12): ")
                months = [month.strip() for month in months_str.split(",")]
                months_element = ET.SubElement(schedule_by_month, "Months")
                valid_months = []

                for month_input in months:
                    month_element_name = get_month_element_name(month_input)
                    if month_element_name:
                        ET.SubElement(months_element, month_element_name)
                        valid_months.append(month_element_name)
                    else:
                        msg_warn(f"Invalid month: {month_input}. Skipping.")
                if valid_months:
                    break
                else:
                    msg_error("You must enter at least one valid month.")

        elif trigger_choice == "5":
            continue
        elif trigger_choice == "6":
            break
        else:
            msg_warn("Invalid choice.")

def modify_windows_task(server_name, base_dir, script_direct, config_dir):
    """Modifies an existing Windows scheduled task."""
    action = "modify windows task"

    if not server_name:
        msg_error("modify_windows_task: server_name is empty.")
        return handle_error(25, action)

    if platform.system() != "Windows":
        msg_error("This function is for Windows only.")
        return 1

    task_names = get_server_task_names(server_name, config_dir)
    if not task_names:
        print("No scheduled tasks found to modify.")
        return 0
    os.system('cls')
    print(Fore.MAGENTA + "Bedrock Server Manager" + Style.RESET_ALL + " - " + Fore.MAGENTA + "Task Scheduler - Modify Task" + Style.RESET_ALL)

    print(f"Select the task to modify for '{server_name}':")
    for i, (task_name, file_path) in enumerate(task_names):
        print(f"{i + 1}) {task_name}")

    while True:
        try:
            task_index = int(input("Enter the number of the task to modify: ")) - 1
            if 0 <= task_index < len(task_names):
                selected_task_name, selected_file_path = task_names[task_index]
                break
            else:
                msg_warn("Invalid selection.")
        except ValueError:
            msg_warn("Invalid input. Please enter a number.")

    # Load existing XML
    try:
        tree = ET.parse(selected_file_path)
        root = tree.getroot()
        existing_triggers = root.findall(".//{http://schemas.microsoft.com/windows/2004/02/mit/task}Triggers/*")
        triggers_element = root.find(".//{http://schemas.microsoft.com/windows/2004/02/mit/task}Triggers")
        if triggers_element is not None:
            for trigger in existing_triggers:
                triggers_element.remove(trigger)
        else:
            msg_error("Could not find triggers element to modify. Aborting.")
            return 1
    except (ET.ParseError, FileNotFoundError) as e:
        msg_error(f"Error loading or parsing XML: {e}")
        return 1

    get_trigger_info(triggers_element)

    actions = root.find(".//{http://schemas.microsoft.com/windows/2004/02/mit/task}Actions")
    command_element = actions.find(".//{http://schemas.microsoft.com/windows/2004/02/mit/task}Command")
    arguments_element = actions.find(".//{http://schemas.microsoft.com/windows/2004/02/mit/task}Arguments")
    existing_command = command_element.text if command_element is not None else ""
    existing_arguments = arguments_element.text if arguments_element is not None else ""
    command_parts = existing_arguments.split()

    if existing_command != "python":
        msg_warn("Command does not use Python, modify failed")
        return 1

    if command_parts[0] != script_direct:
        msg_warn("script directory not matching, modify failed")
        return 1

    command = command_parts[1]
    new_task_name = f"{server_name}_{command.replace('-', '_')}" # Use new name

    if delete_task(selected_task_name) != 0:
        msg_error(f"Failed to remove original task '{selected_task_name}' before modification.")
        return 1

    new_xml_file_path = create_windows_task_xml(server_name, script_direct, command, " ".join(command_parts[2:]), new_task_name, config_dir, existing_triggers=[])

    if new_xml_file_path:
        if import_task_xml(new_xml_file_path, new_task_name) == 0:  # Pass new_task_name
            msg_ok(f"Task '{new_task_name}' modified successfully!")
        else:
            msg_error(f"Failed to import modified task '{new_task_name}'.")
            return 1
    else:
        msg_error("Failed to create modified XML.")
        return 1
    return 0
    
def delete_windows_task(server_name, config_dir):
    """Deletes a Windows scheduled task."""
    action = "delete windows task"

    if not server_name:
        msg_error("delete_windows_task: server_name is empty.")
        return handle_error(25, action)

    if platform.system() != "Windows":
        msg_error("This function is for Windows only.")
        return 1
    os.system('cls')
    print(Fore.MAGENTA + "Bedrock Server Manager" + Style.RESET_ALL + " - " + Fore.MAGENTA + "Task Scheduler (Windows) - Delete Task" + Style.RESET_ALL)
    task_names = get_server_task_names(server_name, config_dir)  # Get list of tasks
    if not task_names:
        print("No scheduled tasks found to delete.")
        return 0

    print(f"Select the task to delete for '{server_name}':")
    for i, (task_name, file_path) in enumerate(task_names):
        print(f"{i + 1}) {task_name}")


    while True:
        try:
            task_index = int(input("Enter the number of the task to delete: ")) - 1
            if 0 <= task_index < len(task_names):
                selected_task_name, selected_file_path = task_names[task_index]
                break
            else:
                msg_warn("Invalid selection.")
        except ValueError:
            msg_warn("Invalid input. Please enter a number.")

    #Confirm deletion
    while True:
        confirm_delete = input(f"Are you sure you want to delete the task '{selected_task_name}'? (y/n): ").lower()
        if confirm_delete in ("y", "yes"):
            if delete_task(selected_task_name) == 0:
                msg_ok(f"Task '{selected_task_name}' deleted successfully!")
                 # Also remove the XML file
                try:
                    os.remove(selected_file_path)
                    msg_ok(f"Task XML file '{selected_file_path}' removed.")
                except OSError as e:
                    msg_error(f"Failed to remove task XML file: {e}")
                return 0
            else:
                msg_error(f"Failed to delete task '{selected_task_name}'.")
                return 1
        elif confirm_delete in ("n", "no", ""):
            msg_info("Task deletion cancelled.")
            return 0
        else:
            msg_warn("Invalid input.  Please enter 'y' or 'n'.")
    return 0 #Success

def delete_task(task_name):
    """Deletes a task by its name using schtasks.

    This function is used by both delete_windows_task and modify_windows_task.
    """
    try:
        subprocess.run(["schtasks", "/Delete", "/TN", task_name, "/F"], check=True, capture_output=True, text=True)
        return 0  # Success
    except subprocess.CalledProcessError as e:
        if "does not exist" in e.stderr.lower():  # Task not found - not an error in this context
           # msg_warn(f"Task '{task_name}' not found.") # Don't even warn
            return 0 # Treat as success
        msg_error(f"Failed to delete task '{task_name}': {e.stderr}")
        return 1 # Other error
    except Exception as e:
        msg_error(f"An unexpected error occurred while deleting task: {e}")
        return 1

def main_menu(base_dir, script_dir, config_dir):
    """Displays the main menu and handles user interaction."""
    os.system('cls' if platform.system() == 'Windows' else 'clear')
    while True:
        print("\n" + Fore.MAGENTA + "Bedrock Server Manager" + Style.RESET_ALL)
        list_servers_status(base_dir, config_dir)
        print("1) Install New Server")
        print("2) Manage Existing Server")
        print("3) Install Content")
        print("4) Send Command to Server (Linux Only)")
        print("5) Advanced")
        print("6) Exit")

        choice = input("Select an option [1-6]: ")

        if choice == "1":
            if install_new_server(base_dir, config_dir) != 0:
                msg_error("install_new_server failed.")
        elif choice == "2":
            if manage_server(base_dir, script_dir, config_dir) != 0:
                msg_error("manage_server failed.")
        elif choice == "3":
            if install_content(base_dir, script_dir, config_dir) != 0:
                msg_error("install_content failed.")
        elif choice == "4":
            server_name = get_server_name(base_dir)
            if server_name:
                command = input("Enter command: ")
                if send_command(server_name, command) != 0:
                    msg_error("Failed to send command.")
            else:
                print("Send command canceled.")
        elif choice == "5":
            if advanced_menu(base_dir, script_dir, config_dir) != 0:
                msg_error("advanced_menu failed.")
        elif choice == "6":
            os.system('cls' if platform.system() == 'Windows' else 'clear')
            sys.exit(0)
        else:
            msg_warn("Invalid choice")

def manage_server(base_dir, script_dir, config_dir):
    """Displays the manage server menu and handles user interaction."""
    os.system('cls' if platform.system() == 'Windows' else 'clear')
    while True:
        print("\n" + Fore.MAGENTA + "Bedrock Server Manager" + Style.RESET_ALL + " - " + Fore.MAGENTA + "Manage Server" + Style.RESET_ALL)
        list_servers_status(base_dir, config_dir)
        print("1) Update Server")
        print("2) Start Server")
        print("3) Stop Server")
        print("4) Restart Server")
        print("5) Backup/Restore")
        print("6) Delete Server")
        print("7) Back")

        choice = input("Select an option [1-7]: ")

        if choice == "1":
            server_name = get_server_name(base_dir)
            if server_name:
                if update_server(server_name, base_dir, config_dir) != 0:
                    msg_error("Failed to update server.")
            else:
                print("Update canceled.")
        elif choice == "2":
            server_name = get_server_name(base_dir)
            if server_name:
                if start_server(server_name, base_dir) != 0:
                    msg_error("Failed to start server.")
            else:
                print("Start canceled.")
        elif choice == "3":
            server_name = get_server_name(base_dir)
            if server_name:
                if stop_server(server_name, base_dir) != 0:
                    msg_error("Failed to stop server.")
            else:
                print("Stop canceled.")
        elif choice == "4":
            server_name = get_server_name(base_dir)
            if server_name:
                if restart_server(server_name, base_dir) != 0:
                    msg_error("Failed to restart server.")
            else:
                print("Restart canceled.")
        elif choice == "5":
            if backup_restore(base_dir, script_dir, config_dir) != 0:
                msg_error("backup_restore failed.")
        elif choice == "6":
            server_name = get_server_name(base_dir)
            if server_name:
                if delete_server(server_name, base_dir, config_dir) != 0:
                    msg_error("Failed to delete server.")
            else:
                print("Delete canceled.")
        elif choice == "7":
            return 0  # Go back to the main menu
        else:
            msg_warn("Invalid choice")

def install_content(base_dir, script_dir, config_dir):
    """Displays the install content menu and handles user interaction."""
    os.system('cls' if platform.system() == 'Windows' else 'clear')
    while True:
        print("\n" + Fore.MAGENTA + "Bedrock Server Manager" + Style.RESET_ALL + " - " + Fore.MAGENTA + "Install Content" + Style.RESET_ALL)
        list_servers_status(base_dir, config_dir) # Display server list.
        print("1) Import World")
        print("2) Import Addon")
        print("3) Back")

        choice = input("Select an option [1-3]: ")

        if choice == "1":
            server_name = get_server_name(base_dir)
            if server_name:
                if install_worlds(server_name, base_dir, script_dir) != 0:
                    msg_error("Failed to install world.")
            else:
                print("Import canceled.")
        elif choice == "2":
            server_name = get_server_name(base_dir)
            if server_name:
                if install_addons(server_name, base_dir, script_dir) != 0:
                    msg_error("Failed to install addon.")
            else:
                print("Import canceled.")
        elif choice == "3":
            return 0  # Go back to the main menu
        else:
            msg_warn("Invalid choice")

def advanced_menu(base_dir, script_dir, config_dir):
    """Displays the advanced menu and handles user interaction."""
    os.system('cls' if platform.system() == 'Windows' else 'clear')
    while True:
        print("\n" + Fore.MAGENTA + "Bedrock Server Manager" + Style.RESET_ALL + " - " + Fore.MAGENTA + "Advanced Menu" + Style.RESET_ALL)
        list_servers_status(base_dir, config_dir)
        print("1) Configure Server Properties")
        print("2) Configure Allowlist")
        print("3) Configure Permissions")
        print("4) Attach to Server Console (Linux Only)")
        print("5) Schedule Server Task")
        print("6) View Server Resource Usage")
        print("7) Reconfigure Auto-Update")
        print("8) Back")
        choice = input("Select an option [1-8]: ")

        if choice == "1":
            server_name = get_server_name(base_dir)
            if server_name:
                if configure_server_properties(server_name, base_dir) != 0:
                    msg_error("Failed to configure server properties.")
            else:
                print("Configuration canceled.")
        elif choice == "2":
            server_name = get_server_name(base_dir)
            if server_name:
                if configure_allowlist(server_name, base_dir) != 0:
                    msg_error("Failed to configure allowlist.")
            else:
                print("Configuration canceled.")
        elif choice == "3":
            server_name = get_server_name(base_dir)
            if server_name:
                if select_player_for_permission(server_name, base_dir, config_dir) != 0:
                    msg_error("Failed to configure permissions.")
            else:
                print("Configuration canceled.")
        elif choice == "4":
            server_name = get_server_name(base_dir)
            if server_name:
                if attach_console(server_name, base_dir) != 0:
                    msg_error("Failed to attach to console.")
            else:
                print("Attach canceled.")
        elif choice == "5":
            server_name = get_server_name(base_dir)
            if server_name:
                if task_scheduler(server_name, base_dir, script_direct, config_dir) != 0:
                    msg_error("Failed to schedule task.")
            else:
                print("Schedule canceled.")
        elif choice == "6":
            server_name = get_server_name(base_dir)
            if server_name:
                if monitor_service_usage(server_name, base_dir) != 0:
                    msg_error("Failed to monitor server usage.")
            else:
                print("Monitoring canceled.")
        elif choice == "7":
            # Reconfigure systemd service
            server_name = get_server_name(base_dir)
            if server_name:
                if create_service(server_name, base_dir, script_direct) != 0:
                    msg_error("Failed to reconfigure systemd service.")
            else:
                print("Configuration canceled.")

        elif choice == "8":
            return 0  # Go back to the main menu
        else:
            msg_warn("Invalid choice")

def backup_restore(base_dir, script_dir, config_dir):
    """Displays the backup/restore menu and handles user interaction."""
    os.system('cls' if platform.system() == 'Windows' else 'clear')
    while True:
        print("\n" + Fore.MAGENTA + "Bedrock Server Manager" + Style.RESET_ALL + " - " + Fore.MAGENTA + "Backup/Restore" + Style.RESET_ALL)
        list_servers_status(base_dir, config_dir)
        print("1) Backup Server")
        print("2) Restore Server")
        print("3) Back")

        choice = input("Select an option [1-3]: ")

        if choice == "1":
            server_name = get_server_name(base_dir)
            if server_name:
                if backup_menu(server_name, base_dir, script_dir, config_dir) != 0:
                    msg_error("Backup menu failed.")
            else:
                print("Backup canceled.")
        elif choice == "2":
            server_name = get_server_name(base_dir)
            if server_name:
                if restore_menu(server_name, base_dir, script_dir, config_dir) != 0:
                    msg_error("Restore menu failed.")
            else:
                print("Restore canceled.")
        elif choice == "3":
            return 0  # Go back to the main menu
        else:
            msg_warn("Invalid choice")

def main():
    """Main function of the script."""
    # Initialize logging
    manage_log_files()

    setup_prerequisites()

    # Load default configuration
    config = default_config()

    base_dir = config['BASE_DIR'] 

    os.makedirs(base_dir, exist_ok=True)
    os.makedirs(content_dir, exist_ok=True)
    os.makedirs(f"{content_dir}/worlds", exist_ok=True)
    os.makedirs(f"{content_dir}/addons", exist_ok=True)

    def list_servers_loop(base_dir, config_dir):
        """Continuously lists servers and their statuses."""
        while True:
            os.system('cls' if platform.system() == 'Windows' else 'clear')
            list_servers_status(base_dir, config_dir)
            time.sleep(5)

    # --- Argument Parsing ---
    import argparse
    parser = argparse.ArgumentParser(description="Bedrock Server Manager")
    subparsers = parser.add_subparsers(title="commands", dest="subcommand")

    # --- Subparser Definitions ---

    # main-menu (interactive)
    main_parser = subparsers.add_parser("main", help="Open Bedrock Server Manager menu")

    # list-servers
    list_parser = subparsers.add_parser("list-servers", help="List all servers and their statuses")
    list_parser.add_argument("-l", "--loop", action="store_true", help="Continuously list servers")

    # get-status
    status_parser = subparsers.add_parser("get-status", help="Get the status of a specific server")
    status_parser.add_argument("-s", "--server", help="Server name", required=True)

    # update-script
    update_parser = subparsers.add_parser("update-script", help="Update the script")

    # configure-allowlist
    allowlist_parser = subparsers.add_parser("configure-allowlist", help="Configure the allowlist for a server")
    allowlist_parser.add_argument("-s", "--server", help="Server name", required=True)

    # configure-permissions
    permissions_parser = subparsers.add_parser("configure-permissions", help="Configure permissions for a server")
    permissions_parser.add_argument("-s", "--server", help="Server name", required=True)

    # configure-properties
    config_parser = subparsers.add_parser("configure-properties", help="Configure individual server.properties")
    config_parser.add_argument("-s", "--server", help="Server name", required=True)
    config_parser.add_argument("-p", "--property", help="Name of the property to modify", required=True)
    config_parser.add_argument("-v", "--value", help="New value for the property", required=True)

    # install-server
    install_parser = subparsers.add_parser("install-server", help="Install a new server")

    # update-server
    update_server_parser = subparsers.add_parser("update-server", help="Update an existing server")
    update_server_parser.add_argument("-s", "--server", help="Server name", required=True)
    update_server_parser.add_argument("-v", "--version", help="Server version to install (LATEST, PREVIEW, or specific version)", default="LATEST") # Added default

    # start-server
    start_server_parser = subparsers.add_parser("start-server", help="Start a server")
    start_server_parser.add_argument("-s", "--server", help="Server Name", required=True)

    # stop-server
    stop_server_parser = subparsers.add_parser("stop-server", help="Stop a server")
    stop_server_parser.add_argument("-s", "--server", help="Server Name", required=True)

    # systemd-start (for direct systemd calls - advanced)
    systemd_start_parser = subparsers.add_parser("systemd-start", help="systemd start command (Linux only)")
    systemd_start_parser.add_argument("-s", "--server", help="Server name", required=True)

    # systemd-stop (for direct systemd calls - advanced)
    systemd_stop_parser = subparsers.add_parser("systemd-stop", help="systemd stop command (Linux only)")
    systemd_stop_parser.add_argument("-s", "--server", help="Server name", required=True)
    
    # windows-stop
    windows_stop_parser = subparsers.add_parser("windows-stop", help="Stop a server (Windows only)")
    windows_stop_parser.add_argument("-s", "--server", help="Server name", required=True)

    # windows-start
    windows_start_parser = subparsers.add_parser("windows-start", help="Start a server (Windows only)")
    windows_start_parser.add_argument("-s", "--server", help="Server name", required=True)

    # install-world
    install_world_parser = subparsers.add_parser("install-world", help="Install a world from a .mcworld file")
    install_world_parser.add_argument("-s", "--server", help="Server name", required=True)
    install_world_parser.add_argument("-f", "--file", help="Path to the .mcworld file", required=False)

    # install-addon
    addon_parser = subparsers.add_parser("install-addon", help="Install an addon (.mcaddon or .mcpack)")
    addon_parser.add_argument("-s", "--server", help="Server name", required=True)
    addon_parser.add_argument("-f", "--file", help="Path to the .mcaddon or .mcpack file", required=False)

    # restart-server
    restart_parser = subparsers.add_parser("restart-server", help="Restart a server")
    restart_parser.add_argument("-s", "--server", help="Server name", required=True)

    # attach-console
    attach_parser = subparsers.add_parser("attach-console", help="Attach to the server console (Linux only)")
    attach_parser.add_argument("-s", "--server", help="Server Name", required=True)

    # delete-server
    delete_parser = subparsers.add_parser("delete-server", help="Delete a server")
    delete_parser.add_argument("-s", "--server", help="Server name", required=True)

    # backup-server
    backup_parser = subparsers.add_parser("backup-server", help="Backup server files")
    backup_parser.add_argument("-s", "--server", help="Server name", required=True)
    backup_parser.add_argument("-t", "--type", help="Backup type (world, config, all)", required=True)
    backup_parser.add_argument("-f", "--file", help="Specific file to backup (for config type)", required=False)
    backup_parser.add_argument("--no-stop", action="store_false", dest="change_status", help="Don't stop the server before backup", default=True)

    # backup-all
    restore_all_parser = subparsers.add_parser("backup-all", help="Restores all newest files (world and configuration files).")
    restore_all_parser.add_argument("-s", "--server", help="Server Name", required=True)
    restore_all_parser.add_argument("--no-stop", action="store_false", dest="change_status", help="Don't stop the server before restore", default=True)

    # restore-server
    restore_parser = subparsers.add_parser("restore-server", help="Restore server files from backup")
    restore_parser.add_argument("-s", "--server", help="Server name", required=True)
    restore_parser.add_argument("-f", "--file", help="Path to the backup file", required=True)
    restore_parser.add_argument("-t", "--type", help="Restore type (world, config)", required=True)
    restore_parser.add_argument("--no-stop", action="store_false", dest="change_status", help="Don't stop the server before restore", default=True)

    # restore-all
    restore_all_parser = subparsers.add_parser("restore-all", help="Restores all newest files (world and configuration files).")
    restore_all_parser.add_argument("-s", "--server", help="Server Name", required=True)
    restore_all_parser.add_argument("--no-stop", action="store_false", dest="change_status", help="Don't stop the server before restore", default=True)

    # scan-players
    scan_players_parser = subparsers.add_parser("scan-players", help="Scan server logs for player data")

    # monitor-usage
    monitor_parser = subparsers.add_parser("monitor-usage", help="Monitor server resource usage")
    monitor_parser.add_argument("-s", "--server", help="Server name", required=True)

    # add-players (manual player entry)
    add_players_parser = subparsers.add_parser("add-players", help="Manually add player:xuid to players.json")
    add_players_parser.add_argument("-p", "--players", help="<player1:xuid> <player2:xuid> ...", nargs='+')

    # manage-log-files
    manage_log_files_parser = subparsers.add_parser("manage-log-files", help="Manages log files")
    manage_log_files_parser.add_argument("--log-dir", help="The directory containing the log files.", default=LOG_DIR)
    manage_log_files_parser.add_argument("--max-files", type=int, help="The maximum number of log files to keep.", default=10)
    manage_log_files_parser.add_argument("--max-size-mb", type=int, help="The maximum total size of log files in MB.", default=15)

    # prune-old-backups
    prune_old_backups_parser = subparsers.add_parser("prune-old-backups", help="Prunes old backups")
    prune_old_backups_parser.add_argument("-s", "--server", help="Server Name", required=True)
    prune_old_backups_parser.add_argument("-f", "--file-name", help="Specific file name to prune (for config files).", required=False)
    prune_old_backups_parser.add_argument("-k", "--keep", help="How many backups to keep", required=False)

    # prune-old-downloads
    prune_old_downloads_parser = subparsers.add_parser("prune-old-downloads", help="Prunes old downloads")
    prune_old_downloads_parser.add_argument("-f", "--folder", help="Folder path downloads are kept", required=False)
    prune_old_downloads_parser.add_argument("-k", "--keep", help="How many downloads to keep", required=False)

    # manage-script-config
    manage_script_config_parser = subparsers.add_parser("manage-script-config", help="Manages the script's configuration file")
    manage_script_config_parser.add_argument("-k", "--key", help="The configuration key to read or write.", required=True)
    manage_script_config_parser.add_argument("-o", "--operation", help="read or write", choices=["read", "write"], required=True)
    manage_script_config_parser.add_argument("-v", "--value", help="The value to write (required for 'write')", required=False)

    # manage-server-config
    manage_server_config_parser = subparsers.add_parser("manage-server-config", help="Manages individual server configuration files")
    manage_server_config_parser.add_argument("-s", "--server", help="Server Name", required=True)
    manage_server_config_parser.add_argument("-k", "--key", help="The configuration key to read or write.", required=True)
    manage_server_config_parser.add_argument("-o", "--operation", help="read or write", choices=["read", "write"], required=True)
    manage_server_config_parser.add_argument("-v", "--value", help="The value to write (required for 'write')", required=False)

    # get-installed-version
    get_installed_version_parser = subparsers.add_parser("get-installed-version", help="Gets the installed version of a server")
    get_installed_version_parser.add_argument("-s", "--server", help="Server Name", required=True)

    # check-server-status
    check_server_status_parser = subparsers.add_parser("check-server-status", help="Checks the server status by reading server_output.txt")
    check_server_status_parser.add_argument("-s", "--server", help="Server Name", required=True)

    # get-server-status-from-config
    get_server_status_from_config_parser = subparsers.add_parser("get-server-status-from-config", help="Gets the server status from the server's config.json")
    get_server_status_from_config_parser.add_argument("-s", "--server", help="Server name", required=True)

    # update-server-status-in-config
    update_server_status_in_config_parser = subparsers.add_parser("update-server-status-in-config", help="Updates the server status in the server's config.json")
    update_server_status_in_config_parser.add_argument("-s", "--server", help="Server name", required=True)

    # get-world-name
    get_world_name_parser = subparsers.add_parser("get-world-name", help="Gets the world name from the server.properties")
    get_world_name_parser.add_argument("-s", "--server", help="Server name", required=True)

    # check-service-exists
    check_service_exists_parser = subparsers.add_parser("check-service-exists", help="Checks if a systemd service file exists (Linux only)")
    check_service_exists_parser.add_argument("-s", "--server", help="Server name", required=True)

    # create-service
    create_service_parser = subparsers.add_parser("create-service", help="Enable/Disable autoupdate")
    create_service_parser.add_argument("-s", "--server", help="Server name", required=True)

    # enable-service
    enable_service_parser = subparsers.add_parser("enable-service", help="Enables a systemd service(Linux only)")
    enable_service_parser.add_argument("-s", "--server", help="Server name", required=True)

    # disable-service
    disable_service_parser = subparsers.add_parser("disable-service", help="Disables a systemd service (Linux only)")
    disable_service_parser.add_argument("-s", "--server", help="Server name", required=True)

    # is-server-running
    is_server_running_parser = subparsers.add_parser("is-server-running", help="Checks if the server is running")
    is_server_running_parser.add_argument("-s", "--server", help="Server name", required=True)

    # send-command
    send_command_parser = subparsers.add_parser("send-command", help="Sends a command to the server (Linux only)")
    send_command_parser.add_argument("-s", "--server", help="Server name", required=True)
    send_command_parser.add_argument("-c", "--command", help="Command to send", required=True)

    # export-world
    export_world_parser = subparsers.add_parser("export-world", help="Exports a world to mcworld")
    export_world_parser.add_argument("-s", "--server", help="Server name", required=True)

    # validate-server
    validate_server_parser = subparsers.add_parser("validate-server", help="Validates if server exists")
    validate_server_parser.add_argument("-s", "--server", help="Server name", required=True)

    # check-internet-connectivity
    check_internet_parser = subparsers.add_parser("check-internet", help="Checks for internet connectivity")

    # --- Argument Parsing ---
    args = parser.parse_args()


    # --- Command Dispatch Table (using a dictionary) ---
    commands = {
        "main": lambda: main_menu(base_dir, script_dir, config_dir),
        "list-servers": lambda: list_servers_loop(base_dir, config_dir) if args.loop else list_servers_status(base_dir, config_dir),
        "get-status": lambda: print(get_server_status_from_config(args.server, config_dir=config_dir)),
        "update-script": lambda: update_script(),
        "configure-allowlist": lambda: configure_allowlist(args.server, base_dir),
        "configure-permissions": lambda: select_player_for_permission(args.server, base_dir, config_dir),
        "configure-properties": lambda: modify_server_properties(os.path.join(base_dir, args.server, "server.properties"), args.property, args.value),
        "install-server": lambda: install_new_server(base_dir, config_dir),
        "update-server": lambda: update_server(args.server, base_dir, config_dir),
        "start-server": lambda: start_server(args.server, base_dir),
        "stop-server": lambda: stop_server(args.server, base_dir),
        "systemd-start": lambda: _systemd_start_server(args.server, base_dir),
        "systemd-stop": lambda: _systemd_stop_server(args.server, base_dir),
        "windows-start": lambda: _windows_start_server(args.server, base_dir),
        "windows-stop": lambda: _windows_stop_server(args.server, base_dir),
        "install-world": (lambda: install_worlds(args.server, base_dir, script_dir) if not args.file
                          else extract_world(args.server, args.file, base_dir)),
        "install-addon": (lambda: install_addons(args.server, base_dir, script_dir) if not args.file
                           else process_addon(args.file, args.server, base_dir, script_dir)),
        "restart-server": lambda: restart_server(args.server, base_dir),
        "attach-console": lambda: attach_console(args.server, base_dir),
        "delete-server": lambda: delete_server(args.server, base_dir, config_dir),
        "backup-server": lambda: backup_server(args.server, args.type, args.file, args.change_status, base_dir, script_dir, config_dir),
        "backup-all": lambda: backup_all(args.server, base_dir, args.change_status, script_dir, config_dir),
        "restore-server": lambda: restore_server(args.server, args.file, args.type, args.change_status, base_dir, script_dir),
        "restore-all": lambda: restore_all(args.server, base_dir, args.change_status, script_dir, config_dir),
        "scan-players": lambda: scan_player_data(base_dir, config_dir),
        "monitor-usage": lambda: monitor_service_usage(args.server, base_dir),
        "add-players": lambda: [save_players_to_json([(f"{player_name}:{xuid}")], config_dir) for player_name, xuid in (player_data.split(":") for player_data in args.players)],
        "manage-log-files": lambda: manage_log_files(args.log_dir, args.max_files, args.max_size_mb),
        "prune-old-backups": lambda: prune_old_backups(args.server, args.file_name, script_dir, args.keep),
        "prune-old-downloads": lambda: prune_old_downloads(args.download_dir, args.keep),
        "manage-script-config": lambda: print(manage_script_config(args.key, args.operation, args.value, config_dir)) if args.operation == "read" else manage_script_config(args.key, args.operation, args.value, config_dir),
        "manage-server-config": lambda: print(manage_server_config(args.server, args.key, args.operation, args.value, config_dir)) if args.operation == "read" else manage_server_config(args.server, args.key, args.operation, args.value, config_dir),
        "get-installed-version": lambda: print(get_installed_version(args.server, config_dir=config_dir)),
        "check-server-status": lambda: print(check_server_status(args.server, base_dir)),
        "get-server-status-from-config": lambda: print(get_server_status_from_config(args.server, config_dir=config_dir)),
        "update-server-status-in-config": lambda: update_server_status_in_config(args.server, base_dir, config_dir),
        "get-world-name": lambda: print(get_world_name(args.server, base_dir)),
        "check-service-exists": lambda: print(check_service_exists(args.server)),
        "create-service": lambda: create_service(args.server, base_dir, script_direct),
        "enable-service": lambda: enable_service(args.server),
        "disable-service": lambda: disable_service(args.server),
        "is-server-running": lambda: print(is_server_running(args.server, base_dir)),
        "send-command": lambda: send_command(args.server, args.command, config_dir),
        "export-world": lambda: export_world(args.server, base_dir, script_dir),
        "validate-server": lambda: print(validate_server(args.server, base_dir)),
        "check-internet": lambda: check_internet_connectivity()
    }

    if args.subcommand in commands:
        try:
            result = commands[args.subcommand]()  # Execute the function
            if result is not None and isinstance(result, int) and result != 0:
                sys.exit(result)  # Exit with a non-zero error code
        except KeyboardInterrupt:
            print("\nOperation interrupted. Exiting...")  # Handle Ctrl + C
            return handle_error(255, "")
        except Exception as e:
            msg_error(f"An unexpected error occurred: {type(e).__name__}: {e}")  # General error
            sys.exit(1)  # Exit with error
    elif args.subcommand is None:
        parser.print_help()  # Display help if no command is provided
    else:
        msg_error("Unimplemented command")
        sys.exit(1)

if __name__ == "__main__":
    main()