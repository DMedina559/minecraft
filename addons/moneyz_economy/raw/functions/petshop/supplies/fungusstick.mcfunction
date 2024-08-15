execute as @initiator[scores={Moneyz=..39}] run tell @s §cYou can't buy a Warped Fungus on a Stick!

execute as @initiator[scores={Moneyz=40..}] run tell @s §aYou can buy a Warped Fungus on a Stick!

execute as @initiator[scores={Moneyz=40..}] run give @s warped_fungus_on_a_stick

execute as @initiator[scores={Moneyz=40..}] run tell @s §aPurchased a Warped Fungus on a Stick!

execute as @initiator[scores={Moneyz=40..}] run scoreboard players remove @s Moneyz 40