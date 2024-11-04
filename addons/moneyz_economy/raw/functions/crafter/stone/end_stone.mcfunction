execute as @initiator[scores={Moneyz=..19}] run playsound note.bassattack @s ~ ~ ~

execute as @initiator[scores={Moneyz=..19}] run tell @s §cYou can't buy 10 End Stone!

execute as @initiator[scores={Moneyz=..19}] run tellraw @s {"rawtext": [{"text": "§cYou need 5 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

execute as @initiator[scores={Moneyz=20..}] run tell @s §aYou can buy 10 End Stone!

execute as @initiator[scores={Moneyz=20..}] run give @s end_stone 10

execute as @initiator[scores={Moneyz=20..}] run tell @s §aPurchased 10 End Stone!

execute as @initiator[scores={Moneyz=20..}] run scoreboard players remove @s Moneyz 20