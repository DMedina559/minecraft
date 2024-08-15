execute as @initiator[scores={Moneyz=..29}] run tell @s §cYou can't buy 5 Lapis Lazuli!

execute as @initiator[scores={Moneyz=30..}] run tell @s §aYou can buy 5 Lapis Lazuli!

execute as @initiator[scores={Moneyz=30..}] run give @s lapis_lazuli 5

execute as @initiator[scores={Moneyz=30..}] run tell @s §aPurchased an Lapis Lazuli!

execute as @initiator[scores={Moneyz=30..}] run scoreboard players remove @s Moneyz 30