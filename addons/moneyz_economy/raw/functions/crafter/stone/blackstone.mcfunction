execute as @initiator[scores={Moneyz=..14}] run playsound note.bassattack @s ~ ~ ~

execute as @initiator[scores={Moneyz=..14}] run tell @s §cYou can't buy 10 Blackstones!

execute as @initiator[scores={Moneyz=..14}] run tellraw @s {"rawtext": [{"text": "§cYou need 15 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

execute as @initiator[scores={Moneyz=15..}] run tell @s §aYou can buy 10 Blackstones!

execute as @initiator[scores={Moneyz=15..}] run give @s blackstone 10

execute as @initiator[scores={Moneyz=15..}] run tell @s §aPurchased 10 Blackstones!

execute as @initiator[scores={Moneyz=15..}] run scoreboard players remove @s Moneyz 15