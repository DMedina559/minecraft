#!/usr/bin/env python3
"""
Moneyz Economy Function and Dialogue Creator
Generates Minecraft Bedrock NPC dialogue JSON files and function (.mcfunction) scripts.
"""

import os
import re
import argparse
import json
import math
from typing import Dict, List, Any, Optional, Tuple

# --- Constants ---
DEFAULT_DAMAGE = 0
ANY_DAMAGE = -1
MAX_BUTTONS_PER_PAGE = 6


# --- Helper Functions ---
def title_case(item_name_str: str) -> str:
    """Converts item identifiers to Title Case display names."""
    item_name = re.sub(r'.*:', '', item_name_str)
    item_name = item_name.replace('_', ' ')
    return ' '.join(word.capitalize() for word in item_name.split() if word)


def clean_item_name_for_file(item_name_str: str) -> str:
    """Cleans item identifier for filesystem paths."""
    name = re.sub(r'.*:', '', item_name_str)
    name = re.sub(r'[\\/*?:"<>|]', '_', name)
    return name.lower()


def create_mcfunction_files(item_id: str, amount: int, buy_price: int, sell_price: int,
                            buy_damage: int, sell_damage: int, shop_name: str, category_name: str,
                            clean_item_fs_name: str, title_item_disp_name: str, functions_base_dir: str):
    """Creates the .mcfunction files for buying and selling an item."""
    category_subpath = category_name if category_name and category_name != "general" else ""
    item_display_term = f"{amount} {title_item_disp_name}"
    if amount > 1 and not title_item_disp_name.endswith('s') and not title_item_disp_name.endswith('S'):
        item_display_term += "s"

    # Buy function file
    if buy_price >= 0:
        buy_dir = os.path.join(functions_base_dir, shop_name, category_subpath) if category_subpath else os.path.join(functions_base_dir, shop_name)
        os.makedirs(buy_dir, exist_ok=True)
        buy_file_path = os.path.join(buy_dir, f"{clean_item_fs_name}.mcfunction")

        fail_selector_buy = f"@initiator[scores={{Moneyz=..{buy_price - 1}}}]"
        success_selector_buy = f"@initiator[scores={{Moneyz={buy_price}..}}]"

        with open(buy_file_path, "w", encoding='utf-8-sig') as f:
            f.write(f"playsound note.bassattack {fail_selector_buy} ~ ~ ~\n\n")
            f.write(f"execute as {fail_selector_buy} run tell @s §cYou can't buy {item_display_term}!\n\n")
            f.write(f'execute as {fail_selector_buy} run tellraw @s {{"rawtext": [{{"text": "§cYou need {buy_price:,} Moneyz for this purchase\\n"}}, {{"text": "§6You have "}}, {{"score":{{"name": "@s","objective": "Moneyz"}}}}, {{"text": " Moneyz"}}]}}\n\n')
            f.write(f"playsound random.levelup {success_selector_buy} ~ ~ ~\n\n")
            f.write(f"execute as {success_selector_buy} run tell @s §aYou can buy {item_display_term}!\n\n")
            f.write(f"execute as {success_selector_buy} run give @s {item_id} {amount} {buy_damage}\n\n")
            f.write(f"execute as {success_selector_buy} run tell @s §aPurchased {item_display_term}!\n\n")
            f.write(f"execute as {success_selector_buy} run scoreboard players remove @s Moneyz {buy_price}\n")

    # Sell function file
    if sell_price >= 0:
        sell_dir = os.path.join(functions_base_dir, shop_name, "sell", category_subpath) if category_subpath else os.path.join(functions_base_dir, shop_name, "sell")
        os.makedirs(sell_dir, exist_ok=True)
        sell_file_path = os.path.join(sell_dir, f"{clean_item_fs_name}.mcfunction")

        if sell_damage >= 0:
            fail_cond = f"item={item_id},quantity=..{amount - 1},data={sell_damage}"
            succ_cond = f"item={item_id},quantity={amount}..,data={sell_damage}"
            clear_dmg_str = str(sell_damage)
        else:
            fail_cond = f"item={item_id},quantity=..{amount - 1}"
            succ_cond = f"item={item_id},quantity={amount}.."
            clear_dmg_str = "-1"

        fail_selector_sell = f"@initiator[hasitem={{{fail_cond}}}]"
        success_selector_sell = f"@initiator[hasitem={{{succ_cond}}}]"

        with open(sell_file_path, "w", encoding='utf-8-sig') as f:
            f.write(f"playsound note.bassattack {fail_selector_sell} ~ ~ ~\n\n")
            f.write(f"tell {fail_selector_sell} §cYou can't sell {item_display_term}!\n\n")
            f.write(f"playsound random.levelup {success_selector_sell} ~ ~ ~\n\n")
            f.write(f"tell {success_selector_sell} §aYou can sell {item_display_term}!\n\n")
            f.write(f"scoreboard players add {success_selector_sell} Moneyz {sell_price}\n\n")
            f.write(f"tell {success_selector_sell} §aSold {item_display_term}!\n\n")
            f.write(f"clear {success_selector_sell} {item_id} {clear_dmg_str} {amount}\n")


def get_function_command_path(shop_name: str, action: str, category_name: str, clean_item_fs_name: str) -> str:
    category_path = f"{category_name}/" if category_name and category_name != "general" else ""
    if action == "buy":
        return f"{shop_name}/{category_path}{clean_item_fs_name}"
    else:
        return f"{shop_name}/sell/{category_path}{clean_item_fs_name}"


def paginate_category_list(categories: List[str], shop_name: str, action: str,
                           action_base_tag: str, action_display: str) -> List[Dict]:
    """Generates dialogue scenes for the category selection menu with 6 buttons max per page."""
    scenes = []
    main_menu_tag = shop_name
    N = len(categories)

    if N <= 5:
        P = 1
    else:
        P = 1 + math.ceil((N - 5) / 4)

    for p in range(1, P + 1):
        scene_tag = action_base_tag if p == 1 else f"{action_base_tag}_{p}"
        start_idx = 0 if p == 1 else 5 + (p - 2) * 4
        count = 5 if p == 1 else 4
        page_cats = categories[start_idx : start_idx + count]

        buttons = []
        for cat in page_cats:
            target_tag = f"{action_base_tag}_{cat}"
            buttons.append({
                "name": title_case(cat),
                "commands": [f"/dialogue open @s @initiator {target_tag}"]
            })

        if P == 1:
            buttons.append({
                "name": "Main Menu",
                "commands": [f"/dialogue open @s @initiator {main_menu_tag}"]
            })
        else:
            if p == 1:
                buttons.append({
                    "name": "Pg. 2",
                    "commands": [f"/dialogue open @s @initiator {action_base_tag}_2"]
                })
            elif 1 < p < P:
                prev_tag = action_base_tag if p == 2 else f"{action_base_tag}_{p - 1}"
                next_tag = f"{action_base_tag}_{p + 1}"
                buttons.append({
                    "name": f"Pg. {p - 1}",
                    "commands": [f"/dialogue open @s @initiator {prev_tag}"]
                })
                buttons.append({
                    "name": f"Pg. {p + 1}",
                    "commands": [f"/dialogue open @s @initiator {next_tag}"]
                })
            elif p == P:
                prev_tag = action_base_tag if P == 2 else f"{action_base_tag}_{P - 1}"
                buttons.append({
                    "name": f"Pg. {P - 1}",
                    "commands": [f"/dialogue open @s @initiator {prev_tag}"]
                })
                buttons.append({
                    "name": "Main Menu",
                    "commands": [f"/dialogue open @s @initiator {main_menu_tag}"]
                })

        prompt_text = "What would you like to buy?" if action == "buy" else "What would you like to sell?"
        scene = {
            "scene_tag": scene_tag,
            "npc_name": action_display,
            "text": prompt_text,
            "buttons": buttons
        }
        scenes.append(scene)

    return scenes


def paginate_item_list(items: List[Dict], shop_name: str, action: str,
                       category_name: str, shop_title: str) -> List[Dict]:
    """Generates dialogue scenes for item lists within a category with 6 buttons max per page."""
    scenes = []
    category_title = title_case(category_name)
    action_base_tag = f"{shop_name}_{action}"
    base_item_tag = f"{shop_name}_{action}_{category_name}"
    main_menu_tag = shop_name

    # Rawtext construction
    if action == "buy":
        header_text = f"§lThese are the available {category_title} at the {shop_title}\n"
    else:
        header_text = f"§lThese are the {category_title} I'll buy from you.\n"

    rawtext_list = [{"text": header_text}]
    for item in items:
        amount_str = f"{item['amount']} " if item['amount'] > 1 else ""
        title_disp = item['title_name']
        if item['amount'] > 1 and not title_disp.endswith('s') and not title_disp.endswith('S'):
            title_disp += "s"
        price = item['buy_price'] if action == "buy" else item['sell_price']
        rawtext_list.append({"text": f"§r{amount_str}{title_disp} for {price:,} Moneyz\n"})

    text_obj = {"rawtext": rawtext_list}

    N = len(items)
    if N <= 5:
        P = 1
    else:
        P = 1 + math.ceil((N - 5) / 4)

    for p in range(1, P + 1):
        scene_tag = base_item_tag if p == 1 else f"{base_item_tag}_{p}"
        start_idx = 0 if p == 1 else 5 + (p - 2) * 4
        count = 5 if p == 1 else 4
        page_items = items[start_idx : start_idx + count]

        buttons = []
        for item in page_items:
            func_cmd = get_function_command_path(shop_name, action, category_name, item['clean_name'])
            buttons.append({
                "name": item['title_name'],
                "commands": [f"/function {func_cmd}"]
            })

        if P == 1:
            buttons.append({
                "name": "Main Menu",
                "commands": [f"/dialogue open @s @initiator {main_menu_tag}"]
            })
        else:
            if p == 1:
                buttons.append({
                    "name": "Pg. 2",
                    "commands": [f"/dialogue open @s @initiator {base_item_tag}_2"]
                })
            elif 1 < p < P:
                prev_tag = base_item_tag if p == 2 else f"{base_item_tag}_{p - 1}"
                next_tag = f"{base_item_tag}_{p + 1}"
                buttons.append({
                    "name": f"Pg. {p - 1}",
                    "commands": [f"/dialogue open @s @initiator {prev_tag}"]
                })
                buttons.append({
                    "name": f"Pg. {p + 1}",
                    "commands": [f"/dialogue open @s @initiator {next_tag}"]
                })
            elif p == P:
                prev_tag = base_item_tag if P == 2 else f"{base_item_tag}_{P - 1}"
                buttons.append({
                    "name": f"Pg. {P - 1}",
                    "commands": [f"/dialogue open @s @initiator {prev_tag}"]
                })
                buttons.append({
                    "name": "Main Menu",
                    "commands": [f"/dialogue open @s @initiator {main_menu_tag}"]
                })

        scene = {
            "scene_tag": scene_tag,
            "npc_name": category_title,
            "text": text_obj,
            "buttons": buttons
        }
        scenes.append(scene)

    return scenes


def generate_shop_dialogue(shop_name: str, shop_data: Dict[str, Dict[str, List[Dict]]], dialogue_dir: str):
    """Generates the full dialogue JSON for a shop."""
    dialogue_file_path = os.path.join(dialogue_dir, f"{shop_name}.dialogue.json")
    output_dialogue = {"format_version": "1.21.50", "minecraft:npc_dialogue": {"scenes": []}}
    scenes_list = output_dialogue["minecraft:npc_dialogue"]["scenes"]
    shop_title = title_case(shop_name)

    # Root Main Scene
    root_scene = {
        "scene_tag": shop_name,
        "npc_name": shop_title,
        "text": f"Welcome to the {shop_title}. What can I help you with?",
        "buttons": []
    }
    if shop_data.get("buy"):
        root_scene["buttons"].append({
            "name": "Buy",
            "commands": [f"/dialogue open @s @initiator {shop_name}_buy"]
        })
    if shop_data.get("sell"):
        root_scene["buttons"].append({
            "name": "Sell",
            "commands": [f"/dialogue open @s @initiator {shop_name}_sell"]
        })
    scenes_list.append(root_scene)

    for action in ["buy", "sell"]:
        if action not in shop_data or not shop_data[action]:
            continue

        action_base_tag = f"{shop_name}_{action}"
        action_display = "Buying" if action == "buy" else "Selling"
        categories = sorted(list(shop_data[action].keys()))

        cat_scenes = paginate_category_list(
            categories=categories,
            shop_name=shop_name,
            action=action,
            action_base_tag=action_base_tag,
            action_display=action_display
        )
        scenes_list.extend(cat_scenes)

        for cat_name, items_in_cat in shop_data[action].items():
            if not items_in_cat:
                continue

            items_in_cat.sort(key=lambda x: (x["title_name"], x["amount"]))
            item_scenes = paginate_item_list(
                items=items_in_cat,
                shop_name=shop_name,
                action=action,
                category_name=cat_name,
                shop_title=shop_title
            )
            scenes_list.extend(item_scenes)

    os.makedirs(dialogue_dir, exist_ok=True)
    with open(dialogue_file_path, "w", encoding="utf-8") as f:
        json.dump(output_dialogue, f, indent="\t", ensure_ascii=False)
        f.write("\n")
    print(f"Generated dialogue file: {os.path.basename(dialogue_file_path)}")


def process_items_file(items_file_path: str, functions_base_dir: str, dialogue_base_dir: str):
    """Processes items definition file and generates functions and dialogue files."""
    if not os.path.exists(items_file_path):
        print(f"Error: {items_file_path} not found.")
        return

    print(f"--- Processing Items from {os.path.abspath(items_file_path)} ---")
    all_shops_data: Dict[str, Dict[str, Dict[str, List[Dict]]]] = {}
    line_num = 0
    items_processed_count = 0

    with open(items_file_path, "r", encoding="utf-8") as f:
        for line in f:
            line_num += 1
            comment_index = line.find('#')
            if comment_index != -1:
                line = line[:comment_index]
            line = line.strip()
            if not line:
                continue

            parts = [part.strip() for part in line.split(",")]
            if len(parts) < 5:
                print(f"[Line {line_num} SKIP] Invalid format. Line: {line}")
                continue

            try:
                item_id_raw, amount_str, buy_price_str, buy_damage_str, shop_name_raw = parts[0:5]
                amount = int(amount_str)
                buy_price = int(buy_price_str)
                buy_damage = int(buy_damage_str) if buy_damage_str and buy_damage_str.lower() != 'default' else DEFAULT_DAMAGE

                category_name_raw = parts[5] if len(parts) > 5 and parts[5] else "general"
                sell_price = int(parts[6]) if len(parts) > 6 and parts[6] else buy_price
                sell_damage = int(parts[7]) if len(parts) > 7 and parts[7] else buy_damage

                if not item_id_raw or amount <= 0 or not shop_name_raw or sell_price < 0:
                    raise ValueError("Invalid critical field (item_id, amount, shop, sell_price)")

                shop_name = shop_name_raw.lower().replace(" ", "_")
                category_name = category_name_raw.lower().replace(" ", "_")
                title_item_disp_name = title_case(item_id_raw)
                clean_item_fs_name = clean_item_name_for_file(item_id_raw)

                create_mcfunction_files(item_id_raw, amount, buy_price, sell_price, buy_damage, sell_damage,
                                        shop_name, category_name, clean_item_fs_name, title_item_disp_name, functions_base_dir)

                item_data = {
                    "id": item_id_raw, "amount": amount, "buy_price": buy_price, "sell_price": sell_price,
                    "buy_damage": buy_damage, "sell_damage": sell_damage,
                    "clean_name": clean_item_fs_name, "title_name": title_item_disp_name
                }

                if shop_name not in all_shops_data:
                    all_shops_data[shop_name] = {"buy": {}, "sell": {}}

                if buy_price >= 0:
                    if category_name not in all_shops_data[shop_name]["buy"]:
                        all_shops_data[shop_name]["buy"][category_name] = []
                    all_shops_data[shop_name]["buy"][category_name].append(item_data)

                if sell_price >= 0:
                    if category_name not in all_shops_data[shop_name]["sell"]:
                        all_shops_data[shop_name]["sell"][category_name] = []
                    all_shops_data[shop_name]["sell"][category_name].append(item_data)

                items_processed_count += 1

            except Exception as e:
                print(f"[Line {line_num} SKIP] Error processing: {e}. Line: {line}")
                continue

    print(f"--- Function Generation Finished: Processed {items_processed_count} items. ---")

    print(f"--- Generating Dialogue Files ---")
    for shop_name, shop_item_data in all_shops_data.items():
        generate_shop_dialogue(shop_name, shop_item_data, dialogue_base_dir)

    print(f"--- Dialogue Generation Finished. ---")


def main():
    script_dir = os.path.dirname(os.path.realpath(__file__))
    workspace_root = os.path.abspath(os.path.join(script_dir, ".."))

    # Determine default paths
    default_items_path = os.path.join(workspace_root, "addons", "moneyz_economy", "items.txt")
    if not os.path.exists(default_items_path):
        default_items_path = os.path.join(script_dir, "items.txt")

    default_functions_dir = os.path.join(workspace_root, "addons", "moneyz_economy", "raw", "functions")
    default_dialogue_dir = os.path.join(workspace_root, "addons", "moneyz_economy", "raw", "dialogue")

    parser = argparse.ArgumentParser(description="Moneyz Economy Function and Dialogue Creator.",
                                     formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    parser.add_argument("-f", "--file", default=default_items_path,
                        help="Path to the items definition file")
    parser.add_argument("--functions-dir", default=default_functions_dir,
                        help="Path to output functions directory")
    parser.add_argument("--dialogue-dir", default=default_dialogue_dir,
                        help="Path to output dialogue directory")

    args = parser.parse_args()

    items_file_to_process = os.path.abspath(args.file)
    functions_dir = os.path.abspath(args.functions_dir)
    dialogue_dir = os.path.abspath(args.dialogue_dir)

    print(f"Items file: {items_file_to_process}")
    print(f"Outputting functions to: {functions_dir}")
    print(f"Managing dialogue files in: {dialogue_dir}")

    process_items_file(items_file_to_process, functions_dir, dialogue_dir)

    print("\nScript finished.")


if __name__ == "__main__":
    main()
