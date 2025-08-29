import json
import argparse
import os
from collections import defaultdict

def parse_items(file_path):
    """Parses the items.txt file and returns a structured dictionary."""
    shops_data = defaultdict(lambda: defaultdict(list))
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except FileNotFoundError:
        print(f"Error: Input file not found at {file_path}")
        return None

    for line in lines:
        line = line.split('#')[0].strip()
        if not line:
            continue
        
        parts = [p.strip() for p in line.split(',')]
        if len(parts) == 8:
            item_id, amount, buy_price, buy_damage, shop, category, sell_price, sell_damage = parts
            
            # Use a more descriptive name for the item's display name
            item_name_parts = item_id.split(':')
            display_name = item_name_parts[-1].replace('_', ' ').title()

            item_dict = {
                'id': item_id,
                'name': display_name,
                'amount': int(amount),
                'buyPrice': int(buy_price),
                'buyDamage': int(buy_damage),
                'sellPrice': int(sell_price),
                'sellDamage': int(sell_damage)
            }
            
            # Only add items that can be bought or sold
            if item_dict['buyPrice'] >= 0 or item_dict['sellPrice'] >= 0:
                shops_data[shop][category].append(item_dict)
                
    return json.loads(json.dumps(shops_data)) # Convert defaultdict to dict for JSON serialization

def write_js_file(data, output_path):
    """Writes the data to a JavaScript file."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("export const itemData = ")
        json.dump(data, f, indent=4)
        f.write(";")

def main():
    # Set default paths relative to the script's location
    script_dir = os.path.dirname(os.path.realpath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, '..'))
    
    default_input = os.path.join(project_root, 'addons/moneyz_economy/items.txt')
    default_output = os.path.join(project_root, 'addons/moneyz_economy/raw/scripts/item_data.js')

    parser = argparse.ArgumentParser(description='Parse items.txt and generate a JS data file for Minecraft scripts.')
    parser.add_argument('--input', default=default_input, help='Path to the items.txt file.')
    parser.add_argument('--output', default=default_output, help='Path for the output JS file.')
    
    args = parser.parse_args()

    print(f"Parsing items from: {args.input}")
    structured_data = parse_items(args.input)
    
    if structured_data is not None:
        print(f"Writing JS data to: {args.output}")
        write_js_file(structured_data, args.output)
        print("Successfully generated item data file.")

if __name__ == '__main__':
    main()
