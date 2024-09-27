execute as @initiator[scores={Moneyz=..74}] run tell @s §cYou can't buy 10 Chorus Fruits!

execute as @initiator[scores={Moneyz=..74}] run tellraw @s {"rawtext": [{"text": "§cYou need 75 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

execute as @initiator[scores={Moneyz=75..}] run tell @s §aYou can buy 10 Chorus Fruits!

execute as @initiator[scores={Moneyz=75..}] run give @s chorus_fruit 10

execute as @initiator[scores={Moneyz=75..}] run tell @s §aPurchased 10 Chorus Fruits!

execute as @initiator[scores={Moneyz=75..}] run scoreboard players remove @s Moneyz 75