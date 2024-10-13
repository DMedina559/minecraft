execute as @initiator[scores={Moneyz=..999}] run playsound note.bassattack @s ~ ~ ~

execute as @initiator[scores={Moneyz=..999}] run tell @s §cYou can't buy 30 XP Levels!

execute as @initiator[scores={Moneyz=..999}] run tellraw @s {"rawtext": [{"text": "§cYou need 1000 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

execute as @initiator[scores={Moneyz=1000..}] run tell @s §aYou can buy 30 XP Levels!

execute as @initiator[scores={Moneyz=1000..}] run xp 30L @s

execute as @initiator[scores={Moneyz=1000..}] run tell @s §aPurchased 30 XP Levels!

execute as @initiator[scores={Moneyz=1000..}] run scoreboard players remove @s Moneyz 1000