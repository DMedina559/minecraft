execute as @initiator[scores={Moneyz=..4}] run tell @s §cYou can't buy 10 Carrots!

execute as @initiator[scores={Moneyz=5..}] run tell @s §aYou can buy 10 Carrots!

execute as @initiator[scores={Moneyz=5..}] run give @s carrot 10

execute as @initiator[scores={Moneyz=5..}] run tell @s §aPurchased 10 Carrots!

execute as @initiator[scores={Moneyz=5..}] run scoreboard players remove @s Moneyz 5