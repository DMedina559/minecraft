playsound note.bassattack @initiator[scores={Moneyz=..3999}] ~ ~ ~

execute as @initiator[scores={Moneyz=..3999}] run tell @s §cYou can't buy Netherite Axe!

execute as @initiator[scores={Moneyz=..3999}] run tellraw @s {"rawtext": [{"text": "§cYou need 4000 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

playsound random.levelup @initiator[scores={Moneyz=4000..}] ~ ~ ~

execute as @initiator[scores={Moneyz=4000..}] run tell @s §aYou can buy Netherite Axe!

execute as @initiator[scores={Moneyz=4000..}] run structure load armory:netherite_axe ~ ~ ~

execute as @initiator[scores={Moneyz=4000..}] run tell @s §aPurchased Netherite Axe!

execute as @initiator[scores={Moneyz=4000..}] run scoreboard players remove @s Moneyz 4000