execute as @initiator[scores={Moneyz=..1999}] run tell @s §cYou can't buy a Wood AWT!

execute as @initiator[scores={Moneyz=..1999}] run tellraw @s {"rawtext": [{"text": "§cYou need 2000 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

execute as @initiator[scores={Moneyz=2000..}] run tell @s §aYou can buy a Wood AWT!

execute as @initiator[scores={Moneyz=2000..}] run structure load workshop:awt_wood ^ ^1 ^-1

execute as @initiator[scores={Moneyz=2000..}] run tell @s §aPurchased a Wood AWT!

execute as @initiator[scores={Moneyz=2000..}] run scoreboard players remove @s Moneyz 2000