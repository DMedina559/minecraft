execute as @initiator[scores={Moneyz=..24}] run tell @s §cYou can't buy 5 Fish!

execute as @initiator[scores={Moneyz=25..}] run tell @s §aYou can buy a 5 Fish!

execute as @initiator[scores={Moneyz=25..}] run give @s cod 5

execute as @initiator[scores={Moneyz=25..}] run tell @s §aPurchased 5 Fish!

execute as @initiator[scores={Moneyz=25..}] run scoreboard players remove @s Moneyz 25