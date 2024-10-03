execute as @initiator[scores={Moneyz=..499}] run tell @s §cYou can't buy a Nether Star!

execute as @initiator[scores={Moneyz=..499}] run tellraw @s {"rawtext": [{"text": "§cYou need 500 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

execute as @initiator[scores={Moneyz=500..}] run tell @s §aYou can buy a Nether Star!

execute as @initiator[scores={Moneyz=500..}] run give @s nether_star

execute as @initiator[scores={Moneyz=500..}] run tell @s §aPurchased a Nether Star!

execute as @initiator[scores={Moneyz=500..}] run scoreboard players remove @s Moneyz 500