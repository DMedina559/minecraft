execute as @initiator[scores={Moneyz=..1291}] run tell @s §cYou can't buy a Moneyz Menu!

execute as @initiator[scores={Moneyz=..1291}] run tellraw @s {"rawtext": [{"text": "§cYou need 1,292 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

execute as @initiator[scores={Moneyz=1292..}] run tell @s §aYou can buy a Moneyz Menu!

execute as @initiator[scores={Moneyz=1292..}] run give @s zvortex:moneyz_menu

execute as @initiator[scores={Moneyz=1292..}] run tell @s §aPurchased a Moneyz Menu!

execute as @initiator[scores={Moneyz=1292..}] run scoreboard players remove @s Moneyz 