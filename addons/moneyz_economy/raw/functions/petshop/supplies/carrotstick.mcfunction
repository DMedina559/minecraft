execute as @initiator[scores={Moneyz=..29}] run tell @s §cYou can't buy a Carrot on a Stick!

execute as @initiator[scores={Moneyz=30..}] run tell @s §aYou can buy a Carrot on a Stick!

execute as @initiator[scores={Moneyz=30..}] run give @s carrot_on_a_stick

execute as @initiator[scores={Moneyz=30..}] run tell @s §aPurchased a Carrot on a Stick!

execute as @initiator[scores={Moneyz=30..}] run scoreboard players remove @s Moneyz 30