playsound note.bassattack @initiator[scores={Moneyz=..6999}] ~ ~ ~

execute as @initiator[scores={Moneyz=..6999}] run tell @s §cYou can't buy Netherite Armor Set!

execute as @initiator[scores={Moneyz=..6999}] run tellraw @s {"rawtext": [{"text": "§cYou need 7000 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

playsound random.levelup @initiator[scores={Moneyz=7000..}] ~ ~ ~

execute as @initiator[scores={Moneyz=7000..}] run tell @s §aYou can buy Netherite Armor Set!

execute as @initiator[scores={Moneyz=7000..}] run structure load armory:netherite_armor ~ ~ ~

execute as @initiator[scores={Moneyz=7000..}] run tell @s §aPurchased Netherite Armor Set!

execute as @initiator[scores={Moneyz=7000..}] run scoreboard players remove @s Moneyz 7000