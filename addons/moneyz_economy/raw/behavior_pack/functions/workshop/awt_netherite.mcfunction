execute as @initiator[scores={Moneyz=..39999}] run tell @s §cYou can't buy a Netherite AWT!

execute as @initiator[scores={Moneyz=..39999}] run tellraw @s {"rawtext": [{"text": "§cYou need 40000 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

execute as @initiator[scores={Moneyz=40000..}] run tell @s §aYou can buy a Netherite AWT!

execute as @initiator[scores={Moneyz=40000..}] run structure load workshop:awt_netherite ^ ^1 ^-1

execute as @initiator[scores={Moneyz=40000..}] run tell @s §aPurchased a Netherite AWT!

execute as @initiator[scores={Moneyz=40000..}] run scoreboard players remove @s Moneyz 40000