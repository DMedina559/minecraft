#!/usr/bin/env python3
# Moneyz Economy Function Creator
import os
import re
import argparse
import json
from typing import Dict, List, Any, Optional, Tuple
import math

# --- Constants ---
DEFAULT_DAMAGE = 0
ANY_DAMAGE = -1
MAX_DYNAMIC_BUTTONS_FIRST_PAGE = 3 
MAX_DYNAMIC_BUTTONS_MIDDLE_PAGE = 2 
MAX_DYNAMIC_BUTTONS_LAST_PAGE = 3  
MAX_DYNAMIC_BUTTONS_SINGLE_PAGE_LIST = 4 

# --- Helper Functions ---
def title_case(item_name_str: str) -> str:
    item_name = re.sub(r'.*:', '', item_name_str)
    item_name = item_name.replace('_', ' ')
    return ' '.join(word.capitalize() for word in item_name.split() if word)

def clean_item_name_for_file(item_name_str: str) -> str:
    name = re.sub(r'.*:', '', item_name_str)
    name = re.sub(r'[\\/*?:"<>|]', '_', name)
    return name.lower()

def create_mcfunction_files(item_id: str, amount: int, buy_price: int, sell_price: int,
                            buy_damage: int, sell_damage: int, shop_name: str, category_name: str,
                            clean_item_fs_name: str, title_item_disp_name: str, functions_base_dir: str):
    """Creates the .mcfunction files for buying and selling an item."""
    category_fs_path = f"/{category_name}" if category_name and category_name != "general" else ""
    item_display_term = f"{amount} {title_item_disp_name}"
    if amount > 1 and not title_item_disp_name.endswith('s') and not title_item_disp_name.endswith('S'):
        item_display_term += "s"

    buy_dir = os.path.join(functions_base_dir, shop_name + category_fs_path)
    sell_dir = os.path.join(functions_base_dir, shop_name, "sell" + category_fs_path)
    os.makedirs(buy_dir, exist_ok=True)
    os.makedirs(sell_dir, exist_ok=True)

    buy_file_path = os.path.join(buy_dir, f"{clean_item_fs_name}.mcfunction")
    # Use encoding='utf-8-sig' to include BOM
    with open(buy_file_path, "w", encoding='utf-8-sig') as f:
        f.write(f"# Buy {amount} {item_id} (data: {buy_damage}) for {buy_price} Moneyz\n")

        fail_selector_buy = f"@initiator[scores={{Moneyz=..{buy_price - 1}}}]"
        success_selector_buy = f"@initiator[scores={{Moneyz={buy_price}..}}]"

        # Fail condition: Not enough money
        f.write(f"playsound note.bassattack {fail_selector_buy} ~ ~ ~\n")
        f.write(f"execute as {fail_selector_buy} run tell @s §cYou can't buy {item_display_term}!\n")
        f.write(f"execute as {fail_selector_buy} run tellraw @s {{\"rawtext\": [{{\"text\": \"§cYou need {buy_price:,} Moneyz for this purchase\\n\"}}, {{\"text\": \"§6You have \"}}, {{\"score\":{{\"name\":\"@s\",\"objective\":\"Moneyz\"}}}}, {{\"text\": \" Moneyz\"}}]}}\n") # Added comma formatting for price

        # Success condition: Enough money
        f.write(f"playsound random.levelup {success_selector_buy} ~ ~ ~\n")
        f.write(f"execute as {success_selector_buy} run tell @s §aYou can buy {item_display_term}!\n")
        f.write(f"execute as {success_selector_buy} run give @s {item_id} {amount} {buy_damage}\n")
        f.write(f"execute as {success_selector_buy} run tell @s §aPurchased {item_display_term}!\n")
        f.write(f"execute as {success_selector_buy} run scoreboard players remove @s Moneyz {buy_price}\n")

    sell_file_path = os.path.join(sell_dir, f"{clean_item_fs_name}.mcfunction")
    sell_damage_str = str(sell_damage)
    # Use encoding='utf-8-sig' to include BOM
    with open(sell_file_path, "w", encoding='utf-8-sig') as f:
        f.write(f"# Sell {amount} {item_id} (data: {sell_damage_str}) for {sell_price} Moneyz\n")

        hasitem_fail_condition_args = f"item={item_id},quantity=..{amount - 1},data={sell_damage_str}"
        fail_selector_sell = f"@initiator[hasitem={{{hasitem_fail_condition_args}}}]"

        hasitem_success_condition_args = f"item={item_id},quantity={amount}..,data={sell_damage_str}"
        success_selector_sell = f"@initiator[hasitem={{{hasitem_success_condition_args}}}]"

        # Fail condition: Not enough items
        f.write(f"playsound note.bassattack {fail_selector_sell} ~ ~ ~\n")
        f.write(f"tell {fail_selector_sell} §cYou can't sell {item_display_term}!\n")

        # Success condition: Enough items
        f.write(f"playsound random.levelup {success_selector_sell} ~ ~ ~\n")
        f.write(f"tell {success_selector_sell} §aYou can sell {item_display_term}!\n")
        f.write(f"scoreboard players add {success_selector_sell} Moneyz {sell_price}\n")
        f.write(f"tell {success_selector_sell} §aSold {item_display_term}!\n")
        f.write(f"clear {success_selector_sell} {item_id} {sell_damage_str} {amount}\n")

def calculate_pages(total_items: int) -> int:
    if total_items == 0: return 1 # Always at least one page, even if empty
    if total_items <= MAX_DYNAMIC_BUTTONS_SINGLE_PAGE_LIST: return 1
    if total_items <= MAX_DYNAMIC_BUTTONS_FIRST_PAGE + MAX_DYNAMIC_BUTTONS_LAST_PAGE : return 2
    
    remaining_items = total_items - MAX_DYNAMIC_BUTTONS_FIRST_PAGE - MAX_DYNAMIC_BUTTONS_LAST_PAGE
    middle_pages = math.ceil(remaining_items / MAX_DYNAMIC_BUTTONS_MIDDLE_PAGE) if MAX_DYNAMIC_BUTTONS_MIDDLE_PAGE > 0 else 0
    return 1 + middle_pages + 1


def get_items_for_page(all_items: List[Dict], page_num: int, total_pages: int) -> Tuple[List[Dict], int]:
    """Gets the subset of items for the current page based on dynamic button limits."""
    if not all_items: return [], 0

    items_on_this_page = []
    current_item_idx = 0

    if page_num == 1:
        count = MAX_DYNAMIC_BUTTONS_SINGLE_PAGE_LIST if total_pages == 1 else MAX_DYNAMIC_BUTTONS_FIRST_PAGE
        items_on_this_page = all_items[:count]
        current_item_idx = len(items_on_this_page)
    else: # page_num > 1
        # Items on first page
        current_item_idx = MAX_DYNAMIC_BUTTONS_FIRST_PAGE
        # Items on middle pages before this one
        for i in range(2, page_num): # Iterate through pages 2 up to current_page - 1
            current_item_idx += MAX_DYNAMIC_BUTTONS_MIDDLE_PAGE
        
        if page_num == total_pages: # Last page
            count = MAX_DYNAMIC_BUTTONS_LAST_PAGE
        else: # Middle page
            count = MAX_DYNAMIC_BUTTONS_MIDDLE_PAGE
        
        items_on_this_page = all_items[current_item_idx : current_item_idx + count]
        current_item_idx += len(items_on_this_page)
        
    return items_on_this_page, current_item_idx


def generate_shop_dialogue(shop_name: str, shop_data: Dict[str, Dict[str, List[Dict]]], dialogue_dir: str):
    dialogue_file_path = os.path.join(dialogue_dir, f"{shop_name}.dialogue.json")
    output_dialogue = {"format_version": "1.21.50", "minecraft:npc_dialogue": {"scenes": []}}
    scenes_list = output_dialogue["minecraft:npc_dialogue"]["scenes"]

    def get_or_create_scene(tag: str, npc_name_text: str, text_content: Optional[List[Dict]] = None) -> Dict:
        scene = next((s for s in scenes_list if s.get("scene_tag") == tag), None)
        if not scene:
            scene = {"scene_tag": tag, "npc_name": npc_name_text, "buttons": []} # Initialize buttons
            scene["text"] = {"rawtext": text_content if text_content else [{"text": f"Default for {tag}"}]}
            scenes_list.append(scene)
        elif text_content:
             scene["text"] = {"rawtext": text_content} # Update text if scene exists
        if "buttons" not in scene: scene["buttons"] = [] # Ensure buttons list exists
        return scene

    def add_button_to_scene_preserving_order(scene: Dict, button_data: Dict[str, Any]):
        # This will just append; finalise_scene_buttons will sort and order
        scene["buttons"].append(button_data)

    def finalise_scene_buttons(scene: Dict, current_page_num: int, total_pages: int, 
                               back_target_tag: str, main_menu_target_tag: str, 
                               next_page_base_tag: Optional[str] = None, 
                               prev_page_base_tag: Optional[str] = None):
        
        current_buttons = scene.get("buttons", [])
        content_buttons = []
        pg_next_btn_data = None
        pg_prev_btn_data = None

        for btn in current_buttons:
            if not (btn["name"] in ["Back", "Main Menu"] or btn["name"].startswith("Pg. ")):
                content_buttons.append(btn)
        
        content_buttons.sort(key=lambda x: x.get("name", ""))
        scene["buttons"] = content_buttons # Start with sorted content buttons

        # Add Pg. Next / Pg. Prev based on your new logic
        if current_page_num < total_pages: # Not the last page
            next_page_actual_tag = f"{next_page_base_tag}_{current_page_num + 1}" if next_page_base_tag else f"{scene['scene_tag'].rsplit('_',1)[0]}_{current_page_num + 1}"
            scene["buttons"].append({"name": f"Pg. {current_page_num + 1}", "commands": [f"/dialogue open @s @initiator {next_page_actual_tag}"]})
        
        if current_page_num > 1: # Not the first page
            # prev_page_actual_tag logic needs to handle base tag for page 1
            prev_page_base = prev_page_base_tag if prev_page_base_tag else scene['scene_tag'].rsplit('_',1)[0]
            prev_page_actual_tag = prev_page_base if current_page_num == 2 else f"{prev_page_base}_{current_page_num - 1}"
            scene["buttons"].append({"name": f"Pg. {current_page_num - 1}", "commands": [f"/dialogue open @s @initiator {prev_page_actual_tag}"]})

        scene["buttons"].append({"name": "Back", "commands": [f"/dialogue open @s @initiator {back_target_tag}"]})
        if current_page_num == total_pages and total_pages > 1 : # Last page of a multi-page list replaces "Pg. Next" with "Main Menu" effectively
            pass # Main Menu is added last anyway
        elif total_pages == 1 and current_page_num == 1: # Single page list
            pass # Main menu will be added

        scene["buttons"].append({"name": "Main Menu", "commands": [f"/dialogue open @s @initiator {main_menu_target_tag}"]})


    main_shop_npc_name = title_case(shop_name)
    main_shop_scene = get_or_create_scene(shop_name, main_shop_npc_name,
                                          text_content=[{"text": f"Welcome to the {main_shop_npc_name}. What can I help you with?"}])
    add_button_to_scene_preserving_order(main_shop_scene, {"name": "Buy", "commands": [f"/dialogue open @s @initiator {shop_name}_buy"]})
    add_button_to_scene_preserving_order(main_shop_scene, {"name": "Sell", "commands": [f"/dialogue open @s @initiator {shop_name}_sell"]})
    finalise_scene_buttons(main_shop_scene, 1, 1, shop_name, shop_name) # Main scene is effectively single page

    for action in ["buy", "sell"]:
        action_main_tag_base = f"{shop_name}_{action}"
        action_npc_name = "Buying" if action == "buy" else "Selling"
        categories_for_action = sorted(list(shop_data.get(action, {}).keys()))

        num_cat_pages = calculate_pages(len(categories_for_action))
        
        cat_items_processed = 0
        for cat_page_idx in range(num_cat_pages):
            current_cat_page_num = cat_page_idx + 1
            cat_list_page_tag = action_main_tag_base if current_cat_page_num == 1 else f"{action_main_tag_base}_{current_cat_page_num}"
            
            cat_page_scene = get_or_create_scene(cat_list_page_tag, action_npc_name,
                                                 text_content=[{"text": "What would you like to buy?" if action == "buy" else "What would you like to sell?"}])
            
            page_cats_data, next_cat_idx = get_items_for_page(categories_for_action, current_cat_page_num, num_cat_pages)
            # The get_items_for_page needs to be adapted slightly for category names vs item dicts
            # For now, we'll just slice based on known items per page for categories
            if current_cat_page_num == 1:
                count = MAX_DYNAMIC_BUTTONS_SINGLE_PAGE_LIST if num_cat_pages == 1 else MAX_DYNAMIC_BUTTONS_FIRST_PAGE
                page_categories_names = categories_for_action[cat_items_processed : cat_items_processed + count]
                cat_items_processed += len(page_categories_names)
            elif current_cat_page_num == num_cat_pages: # Last page
                page_categories_names = categories_for_action[cat_items_processed : cat_items_processed + MAX_DYNAMIC_BUTTONS_LAST_PAGE]
                cat_items_processed += len(page_categories_names)
            else: # Middle page
                page_categories_names = categories_for_action[cat_items_processed : cat_items_processed + MAX_DYNAMIC_BUTTONS_MIDDLE_PAGE]
                cat_items_processed += len(page_categories_names)


            for category_name in page_categories_names:
                category_title = title_case(category_name)
                item_list_target_tag = f"{action_main_tag_base}_{category_name}" # Points to base for items
                add_button_to_scene_preserving_order(cat_page_scene, {"name": category_title, "commands": [f"/dialogue open @s @initiator {item_list_target_tag}"]})
            
            finalise_scene_buttons(cat_page_scene, current_cat_page_num, num_cat_pages, 
                                   shop_name, shop_name, # Back for cat list goes to main shop, Main Menu also to main shop
                                   next_page_base_tag=action_main_tag_base, 
                                   prev_page_base_tag=action_main_tag_base)


        for category_name, items_in_category in shop_data.get(action, {}).items():
            if not items_in_category: continue
            items_in_category.sort(key=lambda x: title_case(x["id"]))
            
            category_title_display = title_case(category_name)
            action_display = "Buy" if action == "buy" else "Sell"
            
            rawtext_lines = [{"text": f"§l{action_display} items in {category_title_display}:\n"}]
            # Add specific headers for armory etc. (same as v7.2)
            if shop_name == "armory":
                if category_name in ["helmets", "chestplates", "leggings", "boots"]: rawtext_lines.append({"text": "§lAll Armor come Fully Enchanted.\n\n"})
                elif category_name in ["swords", "pickaxes", "axes", "shovels", "hoes"]: rawtext_lines.append({"text": "§lAll Tools come Fully Enchanted.\n\n"})
                elif category_name in ["weapons", "ranged_weapons", "special_weapons", "armory_misc"]: rawtext_lines.append({"text": "§lAll Weapons come Fully Enchanted.\n\n"})
            rawtext_lines.append({"text": f"§r§l{category_title_display}:\n"})
            for item_data in items_in_category:
                price = item_data["sell_price"] if action == "sell" else item_data["buy_price"]
                item_name_disp = title_case(item_data['id'])
                item_display_term_list = f"{item_data['amount']} {item_name_disp}"
                if item_data['amount'] > 1 and not item_name_disp.endswith('s'): item_display_term_list += "s"
                rawtext_lines.append({"text": f"§r{item_display_term_list} for {price:,} Moneyz\n"})
            rawtext_lines.append({"text": "\n\n"})

            num_item_pages = calculate_pages(len(items_in_category))
            item_list_base_tag_for_category = f"{action_main_tag_base}_{category_name}"
            
            items_processed_in_cat = 0
            for item_page_idx in range(num_item_pages):
                current_item_page_num = item_page_idx + 1
                item_page_tag = item_list_base_tag_for_category if current_item_page_num == 1 else f"{item_list_base_tag_for_category}_{current_item_page_num}"
                
                item_page_scene = get_or_create_scene(item_page_tag, category_title_display, text_content=rawtext_lines)
                
                # Determine items for this specific page using the new logic
                if current_item_page_num == 1:
                    count = MAX_DYNAMIC_BUTTONS_SINGLE_PAGE_LIST if num_item_pages == 1 else MAX_DYNAMIC_BUTTONS_FIRST_PAGE
                    page_items_data = items_in_category[items_processed_in_cat : items_processed_in_cat + count]
                    items_processed_in_cat += len(page_items_data)
                elif current_item_page_num == num_item_pages: # Last page
                    page_items_data = items_in_category[items_processed_in_cat : items_processed_in_cat + MAX_DYNAMIC_BUTTONS_LAST_PAGE]
                    items_processed_in_cat += len(page_items_data)
                else: # Middle page
                    page_items_data = items_in_category[items_processed_in_cat : items_processed_in_cat + MAX_DYNAMIC_BUTTONS_MIDDLE_PAGE]
                    items_processed_in_cat += len(page_items_data)

                for item_data in page_items_data:
                    # ... (same as v7.2 for adding item buttons)
                    item_id = item_data["id"]; clean_item_fs = clean_item_name_for_file(item_id); title_item_disp = title_case(item_id)
                    category_fs_path = f"/{category_name}" if category_name != "general" else ""
                    func_path_segment = f"sell{category_fs_path}" if action == "sell" else category_fs_path.lstrip('/')
                    function_cmd = f"/function {shop_name}/{func_path_segment}/{clean_item_fs}"
                    item_button_commands = [f"/dialogue open @s @initiator {item_page_tag}", function_cmd]
                    add_button_to_scene_preserving_order(item_page_scene, {"name": title_item_disp, "commands": item_button_commands})

                # Back button for item page goes to the *first page* of the category list for that action
                category_list_first_page_tag = action_main_tag_base if calculate_pages(len(categories_for_action)) == 1 else f"{action_main_tag_base}_1"
                finalise_scene_buttons(item_page_scene, current_item_page_num, num_item_pages, 
                                       category_list_first_page_tag, shop_name,
                                       next_page_base_tag=item_list_base_tag_for_category,
                                       prev_page_base_tag=item_list_base_tag_for_category)
    
    scenes_list.sort(key=lambda s: (
        s.get("scene_tag", "").split('_')[0], 
        s.get("scene_tag", "").count('_'), 
        s.get("scene_tag", "")
    ))

    with open(dialogue_file_path, "w") as f:
        json.dump(output_dialogue, f, indent=2)
    print(f"Generated dialogue file: {os.path.basename(dialogue_file_path)}")


# --- Main Processing Logic (process_items_file and main - same as v7.2) ---
def process_items_file(items_file_path: str, functions_base_dir: str, dialogue_base_dir: str):
    if not os.path.exists(items_file_path):
        print(f"Error: {items_file_path} not found.")
        return

    print(f"--- Processing Items from {os.path.abspath(items_file_path)} ---")
    all_shops_data: Dict[str, Dict[str, Dict[str, List[Dict]]]] = {}
    line_num = 0
    items_processed_count = 0

    with open(items_file_path, "r") as f:
        for line in f:
            line_num += 1
            comment_index = line.find('#')
            if comment_index != -1: line = line[:comment_index]
            line = line.strip()
            if not line: continue

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
                items_processed_count +=1

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
    bp_path = script_dir 
    
    functions_dir = os.path.join(bp_path, "functions")
    dialogue_dir = os.path.join(bp_path, "dialogue")

    os.makedirs(functions_dir, exist_ok=True)
    os.makedirs(dialogue_dir, exist_ok=True)

    print(f"Script directory: {script_dir}")
    print(f"Outputting functions to: {functions_dir}")
    print(f"Managing dialogue files in: {dialogue_dir}")

    parser = argparse.ArgumentParser(description="Moneyz Economy Function and Dialogue Creator.",
                                     formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    parser.add_argument("-f", "--file", default="items.txt",
                        help="Path to the items definition file (default: items.txt in script directory)")
    args = parser.parse_args()

    items_file_to_process = os.path.join(script_dir, args.file) 

    process_items_file(items_file_to_process, functions_dir, dialogue_dir)
    
    print("\nScript finished.")

if __name__ == "__main__":
    main()