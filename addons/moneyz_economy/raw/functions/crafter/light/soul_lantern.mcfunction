execute as @initiator[scores={Moneyz=..44}] run playsound note.bassattack @s ~ ~ ~

execute as @initiator[scores={Moneyz=..44}] run tell @s §cYou can't buy 10 Soul Lanterns!

execute as @initiator[scores={Moneyz=..44}] run tellraw @s {"rawtext": [{"text": "§cYou need 45 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

execute as @initiator[scores={Moneyz=45..}] run playsound random.levelup @s ~ ~ ~

execute as @initiator[scores={Moneyz=45..}] run tell @s §aYou can buy 10 Soul Lanterns!

execute as @initiator[scores={Moneyz=45..}] run give @s soul_lantern 10 

execute as @initiator[scores={Moneyz=45..}] run tell @s §aPurchased 10 Soul Lanterns!

execute as @initiator[scores={Moneyz=45..}] run scoreboard players remove @s Moneyz 45
