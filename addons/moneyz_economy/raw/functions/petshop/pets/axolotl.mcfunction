execute as @initiator[scores={Moneyz=..99}] run tell @s §cYou can't buy an Axolotl!

execute as @initiator[scores={Moneyz=100..}] run tell @s §aYou can buy an Axolotl!

execute as @initiator[scores={Moneyz=100..}] run give @s axolotl_bucket

execute as @initiator[scores={Moneyz=100..}] run tell @s §aPurchased Axolotl!

execute as @initiator[scores={Moneyz=100..}] run scoreboard players remove @s Moneyz 100