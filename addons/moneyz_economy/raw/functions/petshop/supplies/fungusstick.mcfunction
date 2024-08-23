execute as @initiator[scores={Moneyz=..39}] run tell @s §cYou can't buy a Warped Fungus on a Stick!

execute as @initiator[scores={Moneyz=..39}] run tellraw @s {"rawtext": [{"text": "§cYou need 40 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

execute as @initiator[scores={Moneyz=40..}] run tell @s §aYou can buy a Warped Fungus on a Stick!

execute as @initiator[scores={Moneyz=40..}] run give @s warped_fungus_on_a_stick

execute as @initiator[scores={Moneyz=40..}] run tell @s §aPurchased a Warped Fungus on a Stick!

execute as @initiator[scores={Moneyz=40..}] run scoreboard players remove @s Moneyz 40