#!/bin/bash
# Moneyz Economy Function Creator
# Moneyz Economy Function Creator is a bash script used to quickly create basic Moneyz Economy buy/sell function files
# COPYRIGHT ZVORTEX11325 2025
# You may download and use this content for personal, non-commercial use. Any other use, including reproduction, or redistribution is prohibited without prior written permission.
# Author: ZVortex11325
# Version 1.0.0

# Default configuration
SCRIPTDIR=$(dirname "$(realpath "$0")") # Current full path the script is in
damage=${damage:-0}  # Default damage value to 0 if not set

# Create directory for script
mkdir -p $SCRIPTDIR/functions

echo "Using $SCRIPTDIR/ as working directory"
echo ""

# Make $item a Title for tell commands
# Remove underscores/colons from item name, keeping only what's after the colon
title_case() {
    local item_name=$(echo "$1" | sed -E 's/.*://')  # Remove everything before the colon if it exists
    echo "$item_name" | sed -E 's/[_:]/ /g' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2))}1'
}

# Make $item a suitable for file name
# Remove colons from item name, keeping only what's after the colon
clean_item_name() {
    echo "$1" | sed -E 's/.*://'
}

# Function to create buy and sell mcfunction files
create_files() {
    local item=$1
    local amount=$2
    local price=$3
    local damage=$4
    local shop=$5
    local category=$6
    local clean_item=$7
    local title_item=$8

    # Determine the correct function path
    local category_path=""
    if [ -n "$category" ]; then
        category_path="/$category"
    fi

    # Determine the correct term (a $item or $amount $items)
    if [ "$amount" -gt 1 ]; then
        item_term="$amount ${title_item}s"
    else
        item_term="a $title_item"
    fi

    # Create directory structure for shop and category
    mkdir -p "$SCRIPTDIR/functions/$shop$category_path"
    mkdir -p "$SCRIPTDIR/functions/$shop/sell$category_path/"

    # Create buy.mcfunction
    cat <<EOL > "$SCRIPTDIR/functions/$shop$category_path/$clean_item.mcfunction"
execute as @initiator[scores={Moneyz=..$((price-1))}] run playsound note.bassattack @s ~ ~ ~

execute as @initiator[scores={Moneyz=..$((price-1))}] run tell @s §cYou can't buy $item_term!

execute as @initiator[scores={Moneyz=..$((price-1))}] run tellraw @s {"rawtext": [{"text": "§cYou need $price Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

execute as @initiator[scores={Moneyz=$price..}] run playsound random.levelup @s ~ ~ ~

execute as @initiator[scores={Moneyz=$price..}] run tell @s §aYou can buy $item_term!

execute as @initiator[scores={Moneyz=$price..}] run give @s $item $amount $damage

execute as @initiator[scores={Moneyz=$price..}] run tell @s §aPurchased $item_term!

execute as @initiator[scores={Moneyz=$price..}] run scoreboard players remove @s Moneyz $price
EOL

    # Create sell.mcfunction
    cat <<EOL > "$SCRIPTDIR/functions/$shop/sell$category_path/$clean_item.mcfunction"
playsound note.bassattack @initiator[hasitem={item=$item,quantity=..$((amount-1))}] ~ ~ ~

tell @initiator[hasitem={item=$item,quantity=..$((amount-1))}] §cYou can't sell $item_term!

playsound random.levelup @initiator[hasitem={item=$item,quantity=$amount..}] ~ ~ ~

tell @initiator[hasitem={item=$item,quantity=$amount..}] §aYou can sell $item_term!

scoreboard players add @initiator[hasitem={item=$item,quantity=$amount..}] Moneyz $price

tell @initiator[hasitem={item=$item,quantity=$amount..}] §aSold $item_term!

clear @initiator[hasitem={item=$item,quantity=$amount..}] $item $damage $amount
EOL

    echo "$clean_item.mcfunction and $clean_item.mcfunction created successfully."

    # Append to dialog.txt (buy)
    echo "{\"text\": \"§r$amount $title_item for $price Moneyz\\n\"}," >> "$dialog_file"

    # Append to commands.json (buy command)
    echo "  {\"name\": \"$title_item\", \"commands\": [\"/function $shop$category_path/$clean_item\"]}," >> "$commands_file"

    # Append to commands.json (sell command)
    echo "  {\"name\": \"$title_item\", \"commands\": [\"/function $shop/sell$category_path/$clean_item\"]}," >> "$commands_file"
}

# Initialize dialog.txt and commands.json
dialog_file="$SCRIPTDIR/functions/dialog.txt"
commands_file="$SCRIPTDIR/functions/commands.json"
echo "[" > "$commands_file"

# Prompt user for inputs
echo "Enter item ID (e.g., book, zvortex:moneyz_menu):"
echo "Use auto to read from ./items.txt (format: item,amount,price,data,shop,category(optional))"
read item

if [ "$item" == "auto" ]; then
    items_file="items.txt"
    if [ ! -f "$items_file" ]; then
        echo "Error: $items_file not found."
        exit 1
    fi
    while IFS=, read -r item amount price damage shop category || [ -n "$item" ]; do
        # Skip empty lines or lines starting with a comment (#)
        if [[ -z "$item" || "$item" =~ ^# ]]; then
            continue
        fi

        # Remove leading/trailing spaces
        item=$(echo "$item" | xargs)
        amount=$(echo "$amount" | xargs)
        price=$(echo "$price" | xargs)
        damage=$(echo "$damage" | xargs)
        shop=$(echo "$shop" | xargs)
        category=$(echo "$category" | xargs)

        title_item=$(title_case "$item")
        clean_item=$(clean_item_name "$item")

        create_files "$item" "$amount" "$price" "$damage" "$shop" "$category" "$clean_item" "$title_item"

        sed -i '1d' "$items_file"  # Remove processed line from the file
    done < "$items_file"
else
    # Manual input code
    echo "Enter amount (e.g., 5):"
    read amount

    echo "Enter price (e.g., 10):"
    read price
    echo "Enter damage value (default 0):"
    read damage

    echo "Enter shop name (e.g., main_shop):"
    read shop

    echo "Enter category (optional):"
    read category

    title_item=$(title_case "$item")
    clean_item=$(clean_item_name "$item")

    create_files "$item" "$amount" "$price" "$damage" "$shop" "$category" "$clean_item" "$title_item"
fi

# Finalize JSON array in commands.json
echo "]" >> "$commands_file"

echo "Functions created successfully."