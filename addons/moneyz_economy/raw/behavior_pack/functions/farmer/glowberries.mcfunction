execute as @initiator[scores={Moneyz=..4}] run tell @s §cYou can't buy 10 Glow Berries!

execute as @initiator[scores={Moneyz=..4}] run tellraw @s {"rawtext": [{"text": "§cYou need 5 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

execute as @initiator[scores={Moneyz=5..}] run tell @s §aYou can buy 10 Glow Berries!

execute as @initiator[scores={Moneyz=5..}] run give @s glow_berries 10

execute as @initiator[scores={Moneyz=5..}] run tell @s §aPurchased 10 Glow Berries!

execute as @initiator[scores={Moneyz=5..}] run scoreboard players remove @s Moneyz 5